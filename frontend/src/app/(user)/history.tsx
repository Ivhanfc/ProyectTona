import React, { useEffect, useState, useRef } from 'react';
import {
    StyleSheet,
    Text,
    View,
    FlatList,
    ActivityIndicator,
    RefreshControl,
    Animated
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const apiUrl = process.env.EXPO_PUBLIC_URLSERVER;

const MOCK_HISTORY = [
    { id: 1, restaurant_name: 'Burger Master', created_at: '2026-07-25', status: 'Completed', total_amount: 100.00 },
    { id: 2, restaurant_name: 'Pizza Palace', created_at: '2026-07-24', status: 'Completed', total_amount: 200.00 },
    { id: 3, restaurant_name: 'Sushi Zen', created_at: '2026-07-20', status: 'Completed', total_amount: 155.00 },
];

const AnimatedHistoryCard = ({ item, index }) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(50)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 500,
                delay: index * 100,
                useNativeDriver: true,
            }),
            Animated.spring(translateY, {
                toValue: 0,
                friction: 8,
                tension: 40,
                delay: index * 100,
                useNativeDriver: true,
            })
        ]).start();
    }, []);

    const isCompleted = item.status === 'Completed';

    return (
        <Animated.View style={[styles.card, { opacity: fadeAnim, transform: [{ translateY }] }]}>
            <View style={styles.iconContainer}>
                <Text style={styles.placeholderIcon}>🧾</Text>
            </View>

            <View style={styles.cardDetails}>
                <Text style={styles.restaurantName} numberOfLines={1}>
                    {item.restaurant_name || 'Restaurant Order'}
                </Text>
                <Text style={styles.dateText}>
                    {item.created_at ? new Date(item.created_at).toLocaleDateString() : 'Recent order'}
                </Text>
                <View style={[styles.statusBadge, isCompleted ? styles.statusCompleted : styles.statusPending]}>
                    <Text style={[styles.statusText, isCompleted ? styles.textCompleted : styles.textPending]}>
                        {item.status || 'Completed'}
                    </Text>
                </View>
            </View>

            <View style={styles.priceContainer}>
                <Text style={styles.priceText}>
                    ${item.total_amount ? item.total_amount.toFixed(2) : '0.00'}
                </Text>
            </View>
        </Animated.View>
    );
};

export default function HistoryScreen() {
    const [historyOrders, setHistoryOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    useEffect(() => {
        fetchOrderHistory();
    }, []);

    const fetchOrderHistory = async () => {
        try {
            const userId = await AsyncStorage.getItem('user_id');
            const response = await axios.get(`${apiUrl}/api/v1/users/${userId}/history/`);
            if (response.data && response.data.length > 0) {
                setHistoryOrders(response.data);
            } else {
                setHistoryOrders(MOCK_HISTORY);
            }
        } catch (error) {
            console.warn('Error fetching order history, using mock:', error);
            setHistoryOrders(MOCK_HISTORY);
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    };

    const handleRefresh = () => {
        setIsRefreshing(true);
        fetchOrderHistory();
    };

    if (isLoading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#0F172A" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.headerContainer}>
                <Text style={styles.headerTitle}>History</Text>
                <Text style={styles.headerSubtitle}>Your recent orders</Text>
            </View>

            {historyOrders.length === 0 ? (
                <View style={styles.center}>
                    <Text style={styles.emptyText}>No order history.</Text>
                </View>
            ) : (
                <FlatList
                    data={historyOrders}
                    keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
                    renderItem={({ item, index }) => <AnimatedHistoryCard item={item} index={index} />}
                    contentContainerStyle={styles.listContainer}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={isRefreshing}
                            onRefresh={handleRefresh}
                            colors={['#0F172A']}
                            tintColor="#0F172A"
                        />
                    }
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F8FAFC',
    },
    headerContainer: {
        paddingHorizontal: 24,
        paddingTop: 60,
        paddingBottom: 24,
        backgroundColor: '#F8FAFC',
    },
    headerTitle: {
        fontSize: 32,
        fontWeight: '800',
        color: '#0F172A',
        letterSpacing: -0.5,
    },
    headerSubtitle: {
        fontSize: 16,
        color: '#64748B',
        marginTop: 4,
        fontWeight: '500',
    },
    listContainer: {
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    card: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#64748B',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 4,
    },
    iconContainer: {
        width: 50,
        height: 50,
        backgroundColor: '#F1F5F9',
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    placeholderIcon: {
        fontSize: 24,
    },
    cardDetails: {
        flex: 1,
        justifyContent: 'center',
    },
    restaurantName: {
        fontSize: 16,
        fontWeight: '700',
        color: '#0F172A',
        marginBottom: 4,
    },
    dateText: {
        fontSize: 13,
        color: '#64748B',
        marginBottom: 8,
    },
    statusBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    statusCompleted: {
        backgroundColor: '#D1FAE5',
    },
    statusPending: {
        backgroundColor: '#FEF3C7',
    },
    statusText: {
        fontSize: 12,
        fontWeight: '700',
    },
    textCompleted: {
        color: '#059669',
    },
    textPending: {
        color: '#D97706',
    },
    priceContainer: {
        justifyContent: 'center',
        alignItems: 'flex-end',
        paddingLeft: 12,
    },
    priceText: {
        fontSize: 18,
        fontWeight: '800',
        color: '#0F172A',
    },
    emptyText: {
        fontSize: 16,
        color: '#64748B',
        fontWeight: '500',
    },
});