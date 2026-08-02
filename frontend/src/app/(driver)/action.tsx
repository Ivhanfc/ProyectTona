import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ActivityIndicator, FlatList, TouchableOpacity, Alert } from 'react-native';
import api from '../../services/api';

interface Order {
    id: string;
    restaurant: string;
    food: string;
    price: string;
}

const MOCK_ORDERS: Order[] = [
    { id: '1', restaurant: 'Burger Master', food: 'Cheeseburger Combo', price: '$250' },
    { id: '2', restaurant: 'Pizza Palace', food: 'Family Pizza Combo', price: '$350' },
    { id: '3', restaurant: 'Sushi Zen', food: 'Sushi Platter', price: '$100' },
];

export default function DriverActionScreen() {
    const [orders, setOrders] = useState<Order[]>(MOCK_ORDERS);
    // 1. Iniciamos en true para mostrar la pantalla de carga al montar
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        setIsLoading(true);
        try {
            // 2. Si tu 'api' ya tiene la baseURL configurada, usa solo el endpoint relativo:
            // const response = await api.get('/drivers/pending/');
            const urlApi = process.env.EXPO_PUBLIC_URLSERVER;
            const response = await api.get(`${urlApi}/api/v1/orders/pending/`);

            if (response.data && response.data.length > 0) {
                setOrders(response.data);
            }
        } catch (error: any) {
            console.warn('Endpoint is not connected yet, using mock available orders instead:', error.message);
            // Mantenemos las mock orders si falla la conexión
            setOrders(MOCK_ORDERS);
        } finally {
            // 3. Apagamos la carga pase lo que pase
            setIsLoading(false);
        }
    };

    const handleSelectOrder = (orderId: string) => {
        Alert.alert('Order Selected', `You have selected order #${orderId}`);
    };

    if (isLoading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#00a2ff" />
                <Text style={styles.loadingText}>Loading available orders...</Text>
            </View>
        );
    }

    const renderItem = ({ item }: { item: Order }) => (
        <View style={styles.card}>
            <View style={styles.imagePlaceholder} />
            <View style={styles.cardContent}>
                <Text style={styles.title}>{item.food}</Text>
                <Text style={styles.description}>From: {item.restaurant}</Text>
                <Text style={styles.price}>{item.price}</Text>
            </View>
            <TouchableOpacity
                style={styles.selectButton}
                onPress={() => handleSelectOrder(item.id)}
            >
                <Text style={styles.selectButtonText}>SELECT</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.headerTitle}>FOOD TO RESTAURANT</Text>
            <FlatList
                data={orders}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderItem}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    <View style={styles.center}>
                        <Text style={styles.emptyText}>No available orders right now.</Text>
                    </View>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    loadingText: {
        marginTop: 10,
        color: '#64748b',
        fontSize: 14,
    },
    emptyText: {
        color: '#64748b',
        fontSize: 16,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
        marginVertical: 16,
        color: '#0f172a',
        textTransform: 'uppercase',
    },
    listContent: {
        paddingHorizontal: 16,
        paddingBottom: 20,
    },
    card: {
        flexDirection: 'row',
        backgroundColor: '#ffffff',
        borderRadius: 12,
        padding: 12,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        elevation: 1,
        alignItems: 'center',
    },
    imagePlaceholder: {
        width: 60,
        height: 60,
        backgroundColor: '#cbd5e1',
        borderRadius: 8,
        marginRight: 12,
    },
    cardContent: {
        flex: 1,
        justifyContent: 'center',
    },
    title: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#0f172a',
    },
    description: {
        fontSize: 12,
        color: '#64748b',
        marginVertical: 4,
    },
    price: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#0f172a',
    },
    selectButton: {
        backgroundColor: '#22c55e',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 8,
    },
    selectButtonText: {
        color: '#ffffff',
        fontWeight: 'bold',
        fontSize: 12,
    },
});