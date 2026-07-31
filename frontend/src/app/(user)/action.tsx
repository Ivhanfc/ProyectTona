import React, { useEffect, useState, useRef } from 'react';
import {
    StyleSheet,
    Text,
    View,
    ActivityIndicator,
    FlatList,
    TouchableOpacity,
    Animated
} from 'react-native';
import { Plus } from 'lucide-react-native';
import api from '../../services/api';
import { useLocalSearchParams } from 'expo-router'; 

// Definición de Interfaz TypeScript para evitar conflictos de tipos
interface MenuItem {
    id: number | string;
    name: string;
    description: string;
    price: number | string;
}

const MOCK_FOOD_ITEMS: MenuItem[] = [
    { id: '1', name: 'Cheeseburger Combo', price: 250, description: 'Includes fries and drink' },
    { id: '2', name: 'Family Pizza Combo', price: 350, description: '2 Large Pizzas + Soda' },
    { id: '3', name: 'Sushi Platter', price: 100, description: '12 pieces assorted' },
];

// Función helper para formatear precios adecuadamente
const formatPrice = (price: number | string) => {
    if (typeof price === 'number') {
        return `$${price.toFixed(2)}`;
    }
    return price.startsWith('$') ? price : `$${price}`;
};

const AnimatedFoodCard = ({ item, index }: { item: MenuItem, index: number }) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(50)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 500,
                delay: index * 120,
                useNativeDriver: true,
            }),
            Animated.spring(translateY, {
                toValue: 0,
                friction: 8,
                tension: 40,
                delay: index * 120,
                useNativeDriver: true,
            })
        ]).start();
    }, []);

    return (
        <Animated.View
            style={[
                styles.card,
                { opacity: fadeAnim, transform: [{ translateY }] }
            ]}
        >
            <View style={styles.imagePlaceholder}>
                <Text style={styles.placeholderIcon}>🍔</Text>
            </View>

            <View style={styles.cardContent}>
                <View>
                    <Text style={styles.title} numberOfLines={1}>{item.name}</Text>
                    <Text style={styles.description} numberOfLines={2}>{item.description}</Text>
                </View>

                <View style={styles.priceRow}>
                    {/* ✅ Mapeo seguro del precio */}
                    <Text style={styles.price}>{formatPrice(item.price)}</Text>
                    <TouchableOpacity style={styles.addButton} activeOpacity={0.7}>
                        <Plus color="#FFFFFF" size={16} strokeWidth={3} />
                    </TouchableOpacity>
                </View>
            </View>
        </Animated.View>
    );
};

export default function UserActionScreen() {
    const [foodItems, setFoodItems] = useState<MenuItem[]>(MOCK_FOOD_ITEMS);
    const [isLoading, setIsLoading] = useState(true);
    const { restaurant_id } = useLocalSearchParams();

    useEffect(() => {
        if (restaurant_id) {
            fetchFoodItems();
        }
    }, [restaurant_id]);

    const fetchFoodItems = async () => {
        try {
            const response = await api.get(`/restaurants/${restaurant_id}/menu`);
            console.log('Respuesta real de la API:', response.data);

            // Verificamos que sea un array y no esté vacío
            if (Array.isArray(response.data) && response.data.length > 0) {
                setFoodItems(response.data);
            }
        } catch (error: any) {
            console.warn('Error cargando menú:', error.message);
        } finally {
            setTimeout(() => setIsLoading(false), 300);
        }
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
                <Text style={styles.headerTitle}>Menu</Text>
                <Text style={styles.headerSubtitle}>Choose your favorite dishes</Text>
            </View>

            <FlatList
                data={foodItems}
                // ✅ Convertimos id a String obligatoriamente
                keyExtractor={(item) => String(item.id)}
                renderItem={({ item, index }) => <AnimatedFoodCard item={item} index={index} />}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
            />
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
    listContent: {
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    card: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        padding: 12,
        marginBottom: 16,
        shadowColor: '#64748B',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.08,
        shadowRadius: 16,
        elevation: 5,
    },
    imagePlaceholder: {
        width: 110,
        height: 110,
        backgroundColor: '#F1F5F9',
        borderRadius: 18,
        marginRight: 16,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    placeholderIcon: {
        fontSize: 36,
        opacity: 0.5,
    },
    cardContent: {
        flex: 1,
        justifyContent: 'space-between',
        paddingVertical: 6,
    },
    title: {
        fontSize: 17,
        fontWeight: '700',
        color: '#0F172A',
        marginBottom: 4,
    },
    description: {
        fontSize: 14,
        color: '#64748B',
        lineHeight: 20,
    },
    priceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 8,
    },
    price: {
        fontSize: 18,
        fontWeight: '800',
        color: '#10B981',
    },
    addButton: {
        backgroundColor: '#0F172A',
        width: 32,
        height: 32,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    }
});