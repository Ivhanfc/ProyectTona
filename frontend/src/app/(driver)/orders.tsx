import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import axios from 'axios';

const apiUrl = 'http://192.168.1.73:8000';

export default function SelectOrderScreen() {
    const [availableOrders, setAvailableOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchPendingOrders();
    }, []);

    const fetchPendingOrders = async () => {
        try {
            // Fetch orders that are ready to be picked up
            const response = await axios.get(`${apiUrl}/api/v1/drivers/pending_orders/`);
            setAvailableOrders(response.data);
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAcceptOrder = async (orderId) => {
        // Action to accept the specific order
        try {
            await axios.post(`${apiUrl}/api/v1/drivers/accept_order/${orderId}/`);
            // Refresh the list after accepting
            fetchPendingOrders();
        } catch (error) {
            console.error('Error accepting order:', error);
        }
    };

    const renderOrderItem = ({ item }) => (
        <View style={styles.card}>
            <View style={styles.cardInfo}>
                {/* Placeholder for restaurant image block */}
                <View style={styles.imageBlock} />

                <View style={styles.textBlock}>
                    <Text style={styles.restaurantName}>{item.restaurant_name || 'Restaurant'}</Text>
                    <View style={styles.divider} />
                    <Text style={styles.price}>${item.price || '0.00'}</Text>
                </View>
            </View>

            {/* Green button from the wireframe 1000027334.jpg */}
            <TouchableOpacity
                style={styles.acceptButton}
                onPress={() => handleAcceptOrder(item.id)}
            >
                <Text style={styles.acceptButtonText}>Accept</Text>
            </TouchableOpacity>
        </View>
    );

    if (isLoading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#00a2ff" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Food to Restaurant</Text>
            <FlatList
                data={availableOrders}
                keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
                renderItem={renderOrderItem}
                contentContainerStyle={styles.listContainer}
                showsVerticalScrollIndicator={false}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
        marginVertical: 16,
    },
    listContainer: {
        paddingHorizontal: 16,
    },
    card: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 12,
        padding: 12,
        marginBottom: 16,
    },
    cardInfo: {
        flexDirection: 'row',
        flex: 1,
    },
    imageBlock: {
        width: 60,
        height: 60,
        backgroundColor: '#f1f5f9',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#cbd5e1',
    },
    textBlock: {
        marginLeft: 12,
        justifyContent: 'center',
    },
    restaurantName: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    divider: {
        height: 2,
        backgroundColor: '#e2e8f0',
        width: 100,
        marginBottom: 4,
    },
    price: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    acceptButton: {
        backgroundColor: '#22c55e', // Green color from wireframe
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 8,
    },
    acceptButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    }
});