import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import { ShoppingBag, ChevronRight } from 'lucide-react-native';

interface CartItem {
    id: number;
    name: string;
    price: number;
    quantity: number;
}

interface CartShopProps {
    items?: CartItem[];
    restaurantId?: number;
    onClearCart?: () => void;
}

export default function CartShopComponent({ items = [], restaurantId = 2, onClearCart }: CartShopProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const apiUrl = process.env.EXPO_PUBLIC_URLSERVER;

    const totalCount = items.reduce((acc, item) => acc + item.quantity, 0);
    const totalPrice = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);

    const handleCreateOrder = async () => {
        setIsSubmitting(true);
        try {
            // 1. Fetch real logged-in User ID safely
            const storedUserId = await AsyncStorage.getItem('user_id');
            console.log("CartShop submitting order with user_id:", storedUserId);
            if (!storedUserId || storedUserId === undefined || storedUserId === "undefined" || storedUserId === null || storedUserId === "null") {
                Alert.alert(
                    "Session Invalid",
                    "Your User ID was not found in local storage. Please log out and sign back in."
                );
                setIsSubmitting(false);
                return;
            }

            const parsedUserId = Number(storedUserId);

            // 2. Fetch User GPS Coordinates
            let latitude = 32.5149;
            let longitude = -117.0382;

            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status === 'granted') {
                const currentLocation = await Location.getCurrentPositionAsync({
                    accuracy: Location.Accuracy.Balanced,
                });
                latitude = currentLocation.coords.latitude;
                longitude = currentLocation.coords.longitude;
            } else {
                console.warn('Location permission denied. Using default coordinates.');
            }

            // 3. Format dynamic description from cart items
            const itemsDescription = items
                .map((item) => `${item.quantity}x ${item.name}`)
                .join(', ');

            // 4. Build payload matching OrderCreate schema
            const orderPayload = {
                description: itemsDescription || `Order (${totalCount} items)`,
                user_id: parsedUserId,
                restaurant_id: restaurantId,
                latitude: latitude,
                longitude: longitude
            };

            // 5. Send POST request
            const endpoint = `${apiUrl}/api/v1/orders/create_order`;
            const response = await axios.post(endpoint, orderPayload);

            console.log('Order created successfully:', response.data);
            Alert.alert('Success!', 'Your order has been sent. A nearby driver will see it on their map shortly.');

            if (onClearCart) {
                onClearCart();
            }
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
        <View style={styles.floatingWrapper}>
            <TouchableOpacity
                style={styles.cartBar}
                onPress={handleCreateOrder}
                disabled={isSubmitting}
                activeOpacity={0.85}
            >
                <View style={styles.leftSection}>
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>{totalCount}</Text>
                    </View>
                    <Text style={styles.cartTitle}>View / Confirm Order</Text>
                </View>

                <View style={styles.rightSection}>
                    <Text style={styles.totalText}>${totalPrice.toFixed(2)}</Text>
                    {isSubmitting ? (
                        <ActivityIndicator color="#FFFFFF" size="small" />
                    ) : (
                        <ChevronRight color="#FFFFFF" size={20} />
                    )}
                </View>
            </TouchableOpacity>
        </View>
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
    leftSection: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    badge: {
        backgroundColor: '#10B981',
        borderRadius: 20,
        minWidth: 26,
        height: 26,
        paddingHorizontal: 6,
        justifyContent: 'center',
        alignItems: 'center',
    },
    badgeText: {
        color: '#FFFFFF',
        fontWeight: '800',
        fontSize: 13,
    },
    cartTitle: {
        color: '#FFFFFF',
        fontWeight: '700',
        fontSize: 15,
    },
    rightSection: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    totalText: {
        color: '#FFFFFF',
        fontWeight: '800',
        fontSize: 16,
    },
});