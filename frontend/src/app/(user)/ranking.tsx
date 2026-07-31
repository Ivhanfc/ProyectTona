import React, { useEffect, useState, useRef } from 'react';
import {
    StyleSheet,
    Text,
    View,
    ActivityIndicator,
    FlatList,
    Animated,
    Image,
    TouchableOpacity
} from 'react-native';
import { Star } from 'lucide-react-native';
import api from '../../services/api';
import axios from 'axios';
import { useRouter } from 'expo-router';

const MOCK_RANKINGS = [
    {
        id: '1',
        name: 'La Trattoria',
        description: 'Authentic Italian pasta and wood-fired pizza.',
        rating: 4.8,
        imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=400&q=80',
    },
    {
        id: '2',
        name: 'Sakura Sushi',
        description: 'Fresh sashimi and traditional Japanese rolls.',
        rating: 4.6,
        imageUrl: '',
    },
];

type RankingItem = typeof MOCK_RANKINGS[0];

const rawApiUrl = process.env.EXPO_PUBLIC_URLSERVER || '';
const apiUrl = rawApiUrl.endsWith('/') ? rawApiUrl.slice(0, -1) : rawApiUrl;

// Componente separado para manejar la animación individual de cada tarjeta
const AnimatedRankingCard = ({ item, index, onPress }: { item: RankingItem; index: number; onPress: (id: string) => void; }) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(50)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 500,
                delay: index * 150,
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
    }, [fadeAnim, translateY, index]);

    return (
        <Animated.View
            style={[
                { opacity: fadeAnim, transform: [{ translateY }] }
            ]}
        >
            {/* El estilo 'card' va aquí adentro, en el TouchableOpacity */}
            <TouchableOpacity 
                style={styles.card} 
                activeOpacity={0.8}
                onPress={() => onPress(item.id)}
            >
                <View style={styles.imagePlaceholder}>
                    {item.imageUrl ? (
                        <Image source={{ uri: item.imageUrl }} style={styles.image} />
                    ) : (
                        <Text style={styles.placeholderIcon}>📸</Text>
                    )}
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
            </TouchableOpacity>
        </Animated.View>
    );
};

export default function UserRankingScreen() {
    const [rankings, setRankings] = useState<RankingItem[]>(MOCK_RANKINGS);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        fetchRankings();
    }, []);

    const fetchRankings = async () => {
        try {
            const endpoint = apiUrl ? `${apiUrl}/api/v1/restaurants/get_best` : '/restaurants/ranking/';
            const response = await axios.get(endpoint);

            if (response.data && response.data.length > 0) {
                setRankings(response.data);
            }
        } catch (error: any) {
            console.warn('Endpoint is not connected yet, using mock ranking data instead:', error.message);
        } finally {
            setTimeout(() => setIsLoading(false), 300);
        }
    };

    const handleSelectRestaurant = (restaurantId: string) => {
        router.push(`/action?restaurant_id=${restaurantId}`);
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
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item, index }) => (
                    <AnimatedRankingCard 
                        item={item} 
                        index={index} 
                        onPress={handleSelectRestaurant}
                    />
                )}
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
        shadowColor: '#64748B',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
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
        backgroundColor: '#FEF3C7',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    ratingText: {
        fontSize: 13,
        fontWeight: '700',
        color: '#B45309',
        marginLeft: 4,
    },
});