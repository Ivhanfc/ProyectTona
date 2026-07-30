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
// Asumiendo que usas lucide-react-native como en tu otro archivo
import { Plus } from 'lucide-react-native';
import api from '../../services/api';

const MOCK_FOOD_ITEMS = [
    { id: '1', name: 'Cheeseburger Combo', price: '$250', description: 'Includes fries and drink' },
    { id: '2', name: 'Family Pizza Combo', price: '$350', description: '2 Large Pizzas + Soda' },
    { id: '3', name: 'Sushi Platter', price: '$100', description: '12 pieces assorted' },
];

// Componente animado independiente para cada tarjeta del menú
const AnimatedFoodCard = ({ item, index }: { item: typeof MOCK_FOOD_ITEMS[0], index: number }) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(50)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 500,
                delay: index * 120, // Cascada un poco más rápida
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
            {/* Contenedor preparado para la imagen */}
            <View style={styles.imagePlaceholder}>
                <Text style={styles.placeholderIcon}>🍔</Text>
                {/* Cuando tengas las imágenes reales, reemplaza el Text de arriba por esto:
                <Image source={{ uri: item.imageUrl }} style={styles.image} /> */}
            </View>

            <View style={styles.cardContent}>
                <View>
                    <Text style={styles.title} numberOfLines={1}>{item.name}</Text>
                    <Text style={styles.description} numberOfLines={2}>{item.description}</Text>
                </View>

                <View style={styles.priceRow}>
                    <Text style={styles.price}>{item.price}</Text>
                    {/* Botón de agregar (le da un toque mucho más premium a la UI) */}
                    <TouchableOpacity style={styles.addButton} activeOpacity={0.7}>
                        <Plus color="#FFFFFF" size={16} strokeWidth={3} />
                    </TouchableOpacity>
                </View>
            </View>
        </Animated.View>
    );
};

export default function UserActionScreen() {
    const [foodItems, setFoodItems] = useState(MOCK_FOOD_ITEMS);
    const [isLoading, setIsLoading] = useState(true); // En true para apreciar la primera carga

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
            // Un pequeño delay simulado para que se luzca la animación
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
                keyExtractor={(item) => item.id}
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
        // Sombra iOS
        shadowColor: '#64748B',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.08,
        shadowRadius: 16,
        // Sombra Android
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
        overflow: 'hidden', // Clave para que la imagen respete los bordes curvos
    },
    image: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
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