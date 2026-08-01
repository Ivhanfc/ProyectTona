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

interface OrderItem {
    id: number;
    description?: string;
    created_at?: string;
    status: string;
}

const formatDate = (isoString?: string) => {
    if (!isoString) return 'Recent order';
    try {
        const date = new Date(isoString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch {
        return 'Recent order';
    }
};

const AnimatedHistoryCard = ({ item, index }: { item: OrderItem; index: number }) => {
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

    const isCompleted = item.status?.toLowerCase() === 'completed';
    const isAccepted = item.status?.toLowerCase() === 'accepted';

    return (
        <Animated.View style={[styles.card, { opacity: fadeAnim, transform: [{ translateY }] }]}>
            <View style={styles.iconContainer}>
                <Text style={styles.placeholderIcon}>🧾</Text>
            </View>

            <View style={styles.cardDetails}>
                <Text style={styles.restaurantName} numberOfLines={2}>
                    {item.description || `Order #${item.id}`}
                </Text>
                <Text style={styles.dateText}>
                    {formatDate(item.created_at)}
                </Text>
                <View style={[
                    styles.statusBadge,
                    isCompleted ? styles.statusCompleted : isAccepted ? styles.statusAccepted : styles.statusPending
                ]}>
                    <Text style={[
                        styles.statusText,
                        isCompleted ? styles.textCompleted : isAccepted ? styles.textAccepted : styles.textPending
                    ]}>
                        {item.status ? item.status.toUpperCase() : 'PENDING'}
                    </Text>
                </View>
            </View>
        </Animated.View>
    );
};

export default function HistoryScreen() {
    const [historyOrders, setHistoryOrders] = useState<OrderItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    useEffect(() => {
        fetchOrderHistory();
    }, []);

    const fetchOrderHistory = async () => {
        try {
            const userId = await AsyncStorage.getItem('user_id');
            if (!userId) {
                setIsLoading(false);
                return;
            }

            const response = await axios.get(`${apiUrl}/api/v1/orders/history/${userId}`);
            if (Array.isArray(response.data)) {
                setHistoryOrders(response.data);
            }
        } catch (error: any) {
            console.warn('Error fetching order history:', error.message);
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
                    <Text style={styles.emptyText}>No order history available.</Text>
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
        fontSize: 15,
        fontWeight: '700',
        color: '#0F172A',
        marginBottom: 4,
    },
    dateText: {
        fontSize: 12,
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
    statusAccepted: {
        backgroundColor: '#E0F2FE',
    },
    statusPending: {
        backgroundColor: '#FEF3C7',
    },
    statusText: {
        fontSize: 11,
        fontWeight: '700',
    },
    textCompleted: {
        color: '#059669',
    },
    textAccepted: {
        color: '#0284C7',
    },
    textPending: {
        color: '#D97706',
    },
    emptyText: {
        fontSize: 16,
        color: '#64748B',
        fontWeight: '500',
    },
});