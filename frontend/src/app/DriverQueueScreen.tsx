import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert } from 'react-native';

interface Order {
    id: number;
    description: string;
    status: string;
    user_id: number;
    driver_id: number | null;
}

export default function DriverQueueScreen() {
    const [queue, setQueue] = useState<Order[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        fetchPendingOrders();
    }, []);

    const fetchPendingOrders = async () => {
        try {
            const response = await fetch('http://192.168.1.103:8000/api/v1/orders/pending');
            const data = await response.json();
            setQueue(data);
        } catch (error) {
            console.error('Error fetching pending orders:', error);
        } finally {
            setLoading(false);

        }
    };

    // simulate the driver accepting an order
    const handleAcceptOrder = async (orderId: number) => {
        Alert.alert("Order Accepted", `You have accepted order #${orderId}`);

        // right here you would typically make a request to your backend to update the order status and assign the driver (driver_id) to the order.

        // by now we will just remove the order from the queue to simulate that it has been accepted

        setQueue(prevQueue => prevQueue.filter(order => order.id !== orderId));
    };

    const renderOrderItem = ({ item }: { item: Order }) => (
        <View style={styles.card}>
            <View style={styles.cardheader}>
                <Text style={styles.orderId}> Orden #{item.id}</Text>
                <Text style={styles.status}>{item.status}</Text>
            </View>
            <Text style={styles.description}>{item.description}</Text>

            <TouchableOpacity
                style={styles.acceptButton}
                onPress={() => handleAcceptOrder(item.id)}
            >
                <Text style={styles.buttonText}>Aceptar Orden</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Cola de Pedidos</Text>

            {loading ? (
                <Text>Cargando pedidos...</Text>
            ) : (
                <FlatList
                    data={queue}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderOrderItem}
                    ListEmptyComponent={<Text style={styles.emptyText}>No hay pedidos pendientes.</Text>}
                    contentContainerStyle={styles.listContaienr}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        paddingTop: 50,

    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20,
        color: '#333',
    },
    listContaienr: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    card: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 10,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    cardheader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    orderId: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    status: {
        color: '#E67E22',
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    description: {
        fontSize: 15,
        color: '#555',
        marginBottom: 15,
    },
    acceptButton: {
        backgroundColor: '#27AE60',
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 50,
        fontSize: 16,
        color: '#7f8c8d',
    },
});