import React, { useEffect, useState, useRef } from 'react';
import {
    StyleSheet,
    Text,
    View,
    ActivityIndicator,
    FlatList,
    Animated,
    Dimensions
} from 'react-native';
import { Star } from 'lucide-react-native';
import api from '../../services/api';

const MOCK_RANKINGS = [
    { id: '1', name: 'Burger Master', rating: 4.5, description: 'Best burgers in town.' },
    { id: '2', name: 'Pizza Palace', rating: 4.2, description: 'Authentic Italian pizza.' },
    { id: '3', name: 'Sushi Zen', rating: 4.0, description: 'Fresh sushi everyday.' },
];

// Componente separado para manejar la animación individual de cada tarjeta
const AnimatedRankingCard = ({ item, index }: { item: typeof MOCK_RANKINGS[0], index: number }) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(50)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 500,
                delay: index * 150, // Efecto cascada
                useNativeDriver: true,
            }),
            Animated.spring(translateY, {
                toValue: 0,
                friction: 8,
                tension: 40,
                delay: index * 150,
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
                <Text style={styles.placeholderIcon}>📸</Text>
                {/* Cuando tengas tus imágenes, reemplaza el Text de arriba por:
                <Image source={{ uri: item.imageUrl }} style={styles.image} /> */}
            </View>

            <View style={styles.cardContent}>
                <View>
                    <Text style={styles.title} numberOfLines={1}>{item.name}</Text>
                    <Text style={styles.description} numberOfLines={2}>{item.description}</Text>
                </View>
                <View style={styles.ratingContainer}>
                    <View style={styles.ratingBadge}>
                        <Star color="#F59E0B" size={14} fill="#F59E0B" />
                        <Text style={styles.ratingText}>{item.rating.toFixed(1)}</Text>
                    </View>
                </View>
            </View>
        </Animated.View>
    );
};

export default function UserRankingScreen() {
    const [rankings, setRankings] = useState(MOCK_RANKINGS);
    const [isLoading, setIsLoading] = useState(true); // Cambiado a true por defecto para simular carga inicial

    useEffect(() => {
        fetchRankings();
    }, []);

    const fetchRankings = async () => {
        try {
            const response = await api.get('/restaurants/ranking/');
            if (response.data && response.data.length > 0) {
                setRankings(response.data);
            }
        } catch (error: any) {
            console.warn('Endpoint is not connected yet, using mock ranking data instead:', error.message);
        } finally {
            // Simulamos un pequeño delay para que se aprecie la animación si los datos llegan muy rápido
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
                <Text style={styles.headerTitle}>Top Categories</Text>
                <Text style={styles.headerSubtitle}>Discover the best places</Text>
            </View>

            <FlatList
                data={rankings}
                keyExtractor={(item) => item.id}
                renderItem={({ item, index }) => <AnimatedRankingCard item={item} index={index} />}
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
        paddingTop: 60, // Adjust according to your SafeArea
        paddingBottom: 24,
        backgroundColor: '#F8FAFC',
    },
    headerTitle: {
        fontSize: 28,
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
        borderRadius: 20,
        padding: 12,
        marginBottom: 16,
        // Elegant shadows for iOS
        shadowColor: '#64748B',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        // Shadow for Android
        elevation: 4,
    },
    imagePlaceholder: {
        width: 100,
        height: 100,
        backgroundColor: '#F1F5F9',
        borderRadius: 16,
        marginRight: 16,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },

    image: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    placeholderIcon: {
        fontSize: 32,
        opacity: 0.5,
    },
    cardContent: {
        flex: 1,
        justifyContent: 'space-between',
        paddingVertical: 4,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: '#0F172A',
        marginBottom: 4,
    },
    description: {
        fontSize: 14,
        color: '#64748B',
        lineHeight: 20,
    },
    ratingContainer: {
        alignItems: 'flex-start',
        marginTop: 8,
    },
    ratingBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FEF3C7', // Fondo sutil amarillo
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    ratingText: {
        fontSize: 13,
        fontWeight: '700',
        color: '#B45309', // Texto ámbar oscuro para contraste
        marginLeft: 4,
    },
});