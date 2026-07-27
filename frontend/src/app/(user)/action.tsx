import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ActivityIndicator, FlatList, TouchableOpacity } from 'react-native';
import api from '../../services/api';

const MOCK_FOOD_ITEMS = [
    { id: '1', name: 'Cheeseburger Combo', price: '$250', description: 'Includes fries and drink' },
    { id: '2', name: 'Family Pizza Combo', price: '$350', description: '2 Large Pizzas + Soda' },
    { id: '3', name: 'Sushi Platter', price: '$100', description: '12 pieces assorted' },
];

export default function UserActionScreen() {
    const [foodItems, setFoodItems] = useState(MOCK_FOOD_ITEMS);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        fetchFoodItems();
    }, []);

    const fetchFoodItems = async () => {
        try {
            const response = await api.get('/restaurants/menu/');
            if (response.data && response.data.length > 0) {
                setFoodItems(response.data);
            }
        } catch (error: any) {
            console.warn('Endpoint is not connected yet, using mock menu data instead:', error.message);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#00a2ff" />
            </View>
        );
    }

    const renderItem = ({ item }: { item: typeof MOCK_FOOD_ITEMS[0] }) => (
        <View style={styles.card}>
            <View style={styles.imagePlaceholder} />
            <View style={styles.cardContent}>
                <Text style={styles.title}>{item.name}</Text>
                <Text style={styles.description}>{item.description}</Text>
                <Text style={styles.price}>{item.price}</Text>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.headerTitle}>FOOD TO RESTAURANT</Text>
            <FlatList
                data={foodItems}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                contentContainerStyle={styles.listContent}
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
    },
    imagePlaceholder: {
        width: 80,
        height: 80,
        backgroundColor: '#cbd5e1',
        borderRadius: 8,
        marginRight: 12,
    },
    cardContent: {
        flex: 1,
        justifyContent: 'space-between',
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#0f172a',
    },
    description: {
        fontSize: 12,
        color: '#64748b',
        marginVertical: 4,
    },
    price: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#059669', // A nice green color for price
    },
});
