import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import axios from 'axios';
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
            const orderPayload = {
                description: `Pedido (${totalCount} productos)`,
                status: "pending",
                user_id: 1,        
                restaurant_id: restaurantId, 
                driver_id: null
            };

            const response = await axios.post(`${apiUrl}/api/v1/orders/create_order`, orderPayload);
            console.log('Orden creada con éxito:', response.data);
            Alert.alert('¡Éxito!', 'Tu pedido ha sido enviado correctamente.');
            if (onClearCart) {
                onClearCart();
            }
        } catch (error: any) {
            console.error('Error al crear la orden:', error.message);
            Alert.alert('Error', 'No se pudo procesar la orden. Inténtalo de nuevo.');
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
                    <Text style={styles.cartTitle}>Ver / Confirmar Pedido</Text>
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