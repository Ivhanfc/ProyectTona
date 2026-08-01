import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    Alert,
    Modal,
    ScrollView,
    Platform
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import { ShoppingBag, ChevronRight, X, Plus, Minus, Trash2, CreditCard, Banknote } from 'lucide-react-native';

interface CartItem {
    id: number;
    name: string;
    price: number;
    quantity: number;
}

interface CartShopProps {
    items?: CartItem[];
    restaurantId?: number;
    onUpdateQuantity?: (id: number, delta: number) => void;
    onClearCart?: () => void;
}

export default function CartShopComponent({
    items = [],
    restaurantId = 2,
    onUpdateQuantity,
    onClearCart
}: CartShopProps) {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card'>('cash');

    const apiUrl = process.env.EXPO_PUBLIC_URLSERVER;

    const totalCount = items.reduce((acc, item) => acc + item.quantity, 0);
    const subtotal = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const deliveryFee = 2.50;
    const totalPrice = subtotal + deliveryFee;

    const handleCreateOrder = async () => {
        setIsSubmitting(true);
        try {
            const storedUserId = await AsyncStorage.getItem('user_id');
            if (!storedUserId || storedUserId === 'null' || storedUserId === 'undefined') {
                Alert.alert(
                    "Session Invalid",
                    "Your User ID was not found in local storage. Please log out and sign back in."
                );
                setIsSubmitting(false);
                return;
            }

            const parsedUserId = Number(storedUserId);

            let latitude = 32.5149;
            let longitude = -117.0382;

            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status === 'granted') {
                const currentLocation = await Location.getCurrentPositionAsync({
                    accuracy: Location.Accuracy.Balanced,
                });
                latitude = currentLocation.coords.latitude;
                longitude = currentLocation.coords.longitude;
            }

            const itemsDescription = items
                .map((item) => `${item.quantity}x ${item.name}`)
                .join(', ');

            const orderPayload = {
                description: `${itemsDescription} (${paymentMethod.toUpperCase()})`,
                user_id: parsedUserId,
                restaurant_id: restaurantId,
                latitude: latitude,
                longitude: longitude
            };

            const endpoint = `${apiUrl}/api/v1/orders/create_order`;
            const response = await axios.post(endpoint, orderPayload);

            console.log('Order created successfully:', response.data);
            Alert.alert('Success!', 'Your order has been sent. A nearby driver will see it on their map shortly.');

            setIsModalVisible(false);
            if (onClearCart) onClearCart();
        } catch (error: any) {
            console.error('Error creating order:', error.response?.data || error.message);
            Alert.alert('Error', 'Could not process the order. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (items.length === 0 && totalCount === 0) {
        return null;
    }

    return (
        <>
            {/* Floating Bottom Bar */}
            <View style={styles.floatingWrapper}>
                <TouchableOpacity
                    style={styles.cartBar}
                    onPress={() => setIsModalVisible(true)}
                    activeOpacity={0.85}
                >
                    <View style={styles.leftSection}>
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>{totalCount}</Text>
                        </View>
                        <Text style={styles.cartTitle}>View Cart / Checkout</Text>
                    </View>

                    <View style={styles.rightSection}>
                        <Text style={styles.totalText}>${subtotal.toFixed(2)}</Text>
                        <ChevronRight color="#FFFFFF" size={20} />
                    </View>
                </TouchableOpacity>
            </View>

            {/* Checkout & Review Modal Sheet */}
            <Modal
                visible={isModalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setIsModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        {/* Header */}
                        <View style={styles.modalHeader}>
                            <View>
                                <Text style={styles.modalTitle}>Your Order</Text>
                                <Text style={styles.modalSubtitle}>{totalCount} item(s) selected</Text>
                            </View>

                            <TouchableOpacity
                                style={styles.closeButton}
                                onPress={() => setIsModalVisible(false)}
                            >
                                <X color="#64748B" size={20} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.itemList} showsVerticalScrollIndicator={false}>
                            {/* Cart Items List */}
                            {items.map((item) => (
                                <View key={item.id} style={styles.cartItemRow}>
                                    <View style={styles.itemInfo}>
                                        <Text style={styles.itemName}>{item.name}</Text>
                                        <Text style={styles.itemPrice}>${(item.price * item.quantity).toFixed(2)}</Text>
                                    </View>

                                    <View style={styles.quantityControls}>
                                        <TouchableOpacity
                                            style={styles.qtyBtn}
                                            onPress={() => onUpdateQuantity && onUpdateQuantity(item.id, -1)}
                                        >
                                            <Minus color="#0F172A" size={14} />
                                        </TouchableOpacity>

                                        <Text style={styles.qtyText}>{item.quantity}</Text>

                                        <TouchableOpacity
                                            style={styles.qtyBtn}
                                            onPress={() => onUpdateQuantity && onUpdateQuantity(item.id, 1)}
                                        >
                                            <Plus color="#0F172A" size={14} />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            ))}

                            {/* Payment Method Selector */}
                            <Text style={styles.sectionLabel}>Payment Method</Text>
                            <View style={styles.paymentContainer}>
                                <TouchableOpacity
                                    style={[styles.paymentOption, paymentMethod === 'cash' && styles.paymentOptionActive]}
                                    onPress={() => setPaymentMethod('cash')}
                                >
                                    <Banknote color={paymentMethod === 'cash' ? '#10B981' : '#64748B'} size={20} />
                                    <Text style={[styles.paymentText, paymentMethod === 'cash' && styles.paymentTextActive]}>Cash</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.paymentOption, paymentMethod === 'card' && styles.paymentOptionActive]}
                                    onPress={() => setPaymentMethod('card')}
                                >
                                    <CreditCard color={paymentMethod === 'card' ? '#10B981' : '#64748B'} size={20} />
                                    <Text style={[styles.paymentText, paymentMethod === 'card' && styles.paymentTextActive]}>Card on Delivery</Text>
                                </TouchableOpacity>
                            </View>

                            {/* Summary Breakdown */}
                            <Text style={styles.sectionLabel}>Payment Summary</Text>
                            <View style={styles.summaryContainer}>
                                <View style={styles.summaryRow}>
                                    <Text style={styles.summaryLabel}>Subtotal</Text>
                                    <Text style={styles.summaryValue}>${subtotal.toFixed(2)}</Text>
                                </View>
                                <View style={styles.summaryRow}>
                                    <Text style={styles.summaryLabel}>Delivery Fee</Text>
                                    <Text style={styles.summaryValue}>${deliveryFee.toFixed(2)}</Text>
                                </View>
                                <View style={[styles.summaryRow, styles.totalRow]}>
                                    <Text style={styles.totalLabel}>Total</Text>
                                    <Text style={styles.totalValue}>${totalPrice.toFixed(2)}</Text>
                                </View>
                            </View>
                        </ScrollView>

                        {/* Modal Action Footer */}
                        <View style={styles.modalFooter}>
                            <TouchableOpacity
                                style={styles.cancelButton}
                                onPress={() => {
                                    if (onClearCart) onClearCart();
                                    setIsModalVisible(false);
                                }}
                            >
                                <Trash2 color="#EF4444" size={18} />
                                <Text style={styles.cancelText}>Clear Cart</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.confirmButton}
                                onPress={handleCreateOrder}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <ActivityIndicator color="#FFFFFF" size="small" />
                                ) : (
                                    <Text style={styles.confirmText}>Place Order • ${totalPrice.toFixed(2)}</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </>
    );
}

const styles = StyleSheet.create({
    floatingWrapper: {
        position: 'absolute',
        bottom: 80,
        left: 16,
        right: 16,
        zIndex: 999,
    },
    cartBar: {
        backgroundColor: '#0F172A',
        borderRadius: 16,
        paddingVertical: 14,
        paddingHorizontal: 18,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
        elevation: 8,
    },
    leftSection: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    badge: {
        backgroundColor: '#10B981',
        borderRadius: 20,
        minWidth: 26,
        height: 26,
        paddingHorizontal: 6,
        justifyContent: 'center',
        alignItems: 'center',
    },
    badgeText: { color: '#FFFFFF', fontWeight: '800', fontSize: 13 },
    cartTitle: { color: '#FFFFFF', fontWeight: '700', fontSize: 15 },
    rightSection: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    totalText: { color: '#FFFFFF', fontWeight: '800', fontSize: 16 },

    /* Modal Styles */
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(15, 23, 42, 0.6)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        padding: 20,
        paddingBottom: Platform.OS === 'android' ? 60 : 20, // bottom modal overlay
        maxHeight: '85%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderColor: '#F1F5F9',
    },
    modalTitle: { fontSize: 20, fontWeight: '800', color: '#0F172A' },
    modalSubtitle: { fontSize: 13, color: '#64748B', marginTop: 2 },
    closeButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#F8FAFC',
        justifyContent: 'center',
        alignItems: 'center',
    },
    itemList: { marginBottom: 12 },
    cartItemRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderColor: '#F8FAFC',
    },
    itemInfo: { flex: 1, paddingRight: 10 },
    itemName: { fontSize: 15, fontWeight: '700', color: '#0F172A' },
    itemPrice: { fontSize: 13, color: '#10B981', fontWeight: '600', marginTop: 2 },
    quantityControls: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F1F5F9',
        borderRadius: 12,
        padding: 4,
    },
    qtyBtn: {
        width: 28,
        height: 28,
        borderRadius: 8,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    qtyText: { fontSize: 14, fontWeight: '700', color: '#0F172A', paddingHorizontal: 10 },

    sectionLabel: {
        fontSize: 13,
        fontWeight: '700',
        color: '#64748B',
        textTransform: 'uppercase',
        marginTop: 16,
        marginBottom: 8,
    },
    paymentContainer: { flexDirection: 'row', gap: 10 },
    paymentOption: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: '#E2E8F0',
        backgroundColor: '#F8FAFC',
    },
    paymentOptionActive: {
        borderColor: '#10B981',
        backgroundColor: '#ECFDF5',
    },
    paymentText: { fontSize: 13, fontWeight: '600', color: '#64748B' },
    paymentTextActive: { color: '#065F46', fontWeight: '700' },

    summaryContainer: {
        backgroundColor: '#F8FAFC',
        borderRadius: 16,
        padding: 14,
        gap: 8,
    },
    summaryRow: { flexDirection: 'row', justifyContent: 'space-between' },
    summaryLabel: { fontSize: 13, color: '#64748B' },
    summaryValue: { fontSize: 13, fontWeight: '600', color: '#0F172A' },
    totalRow: { borderTopWidth: 1, borderColor: '#E2E8F0', paddingTop: 8, marginTop: 4 },
    totalLabel: { fontSize: 15, fontWeight: '800', color: '#0F172A' },
    totalValue: { fontSize: 16, fontWeight: '800', color: '#10B981' },

    modalFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderColor: '#F1F5F9',
    },
    cancelButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderRadius: 14,
        backgroundColor: '#FEF2F2',
        justifyContent: 'center',
    },
    cancelText: { color: '#EF4444', fontWeight: '700', fontSize: 13 },
    confirmButton: {
        flex: 1,
        backgroundColor: '#0F172A',
        paddingVertical: 14,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    confirmText: { color: '#FFFFFF', fontWeight: '800', fontSize: 14 },
});