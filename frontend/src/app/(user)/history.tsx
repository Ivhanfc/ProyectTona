import React, { useEffect, useState } from 'react';
import {
    StyleSheet,
    Text,
    View,
    FlatList,
    ActivityIndicator,
    RefreshControl
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Base API URL pointing to your local FastAPI server
const apiUrl = 'http://192.168.1.73:8000';

export default function HistoryScreen() {
    const [historyOrders, setHistoryOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Fetch order history when component mounts
    useEffect(() => {
        fetchOrderHistory();
    }, []);

    const fetchOrderHistory = async () => {
        try {
            const userId = await AsyncStorage.getItem('user_id');


            const response = await axios.get(`${apiUrl}/api/v1/users/${userId}/history/`);

            // Update state with returned order array
            setHistoryOrders(response.data);
        } catch (error) {
            // Log error if network or server request fails
            console.error('Error fetching order history:', error);
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    };

    // Pull-to-refresh handler
    const handleRefresh = () => {
        setIsRefreshing(true);
        fetchOrderHistory();
    };

    // Render individual history item card (matches HistoryScreen wireframe layout)
    const renderHistoryItem = ({ item }) => (
        <View style={styles.card}>
            <View style={styles.cardDetails}>
                <Text style={styles.restaurantName}>
                    {item.restaurant_name || 'Restaurant Order'}
                </Text>
                <Text style={styles.dateText}>
                    {item.created_at ? new Date(item.created_at).toLocaleDateString() : 'Recent order'}
                </Text>
                <Text style={styles.statusText}>
                    Status: <Text style={styles.statusValue}>{item.status || 'Completed'}</Text>
                </Text>
            </View>

            <View style={styles.priceContainer}>
                <Text style={styles.priceText}>
                    ${item.total_amount ? item.total_amount.toFixed(2) : '0.00'}
                </Text>
            </View>
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
            <Text style={styles.headerTitle}>History Orders</Text>

            {historyOrders.length === 0 ? (
                <View style={styles.center}>
                    <Text style={styles.emptyText}>No order history found.</Text>
                </View>
            ) : (
                <FlatList
                    data={historyOrders}
                    keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
                    renderItem={renderHistoryItem}
                    contentContainerStyle={styles.listContainer}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} colors={['#00a2ff']} />
                    }
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 20,
        fontFamily: 'Poppins_700Bold',
        fontWeight: 'bold',
        textAlign: 'center',
        marginVertical: 18,
        color: '#0f172a',
    },
    listContainer: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    card: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 14,
        padding: 16,
        marginBottom: 14,
        backgroundColor: '#f8fafc',
    },
    cardDetails: {
        flex: 1,
    },
    restaurantName: {
        fontSize: 15,
        fontWeight: '600',
        color: '#0f172a',
        marginBottom: 4,
    },
    dateText: {
        fontSize: 12,
        color: '#64748b',
        marginBottom: 4,
    },
    statusText: {
        fontSize: 12,
        color: '#64748b',
    },
    statusValue: {
        color: '#22c55e',
        fontWeight: '600',
    },
    priceContainer: {
        justifyContent: 'center',
        alignItems: 'flex-end',
        paddingLeft: 12,
    },
    priceText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#0f172a',
    },
    emptyText: {
        fontSize: 15,
        color: '#64748b',
    },
});