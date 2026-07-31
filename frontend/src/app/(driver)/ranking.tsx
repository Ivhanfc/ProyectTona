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
import { Star, Trophy } from 'lucide-react-native';

interface DriverRanking {
    id: number;
    rank: number;
    name: string;
    rating: number;
}

const MOCK_RANKING: DriverRanking[] = [
    { id: 1, rank: 1, name: 'John Doe', rating: 4.9 },
    { id: 2, rank: 2, name: 'Jane Smith', rating: 4.8 },
    { id: 3, rank: 3, name: 'Mike Ross', rating: 4.5 },
    { id: 4, rank: 4, name: 'Sarah Connor', rating: 4.2 },
];

// Animated component for each driver in the list
const AnimatedDriverCard = ({ item, index }: { item: DriverRanking; index: number }) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(50)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 500,
                delay: index * 100, // Cascade effect
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

    // Function to assign dynamic colors to the Top 3
    const getRankStyles = (rank: number) => {
        switch (rank) {
            case 1: return { bg: '#FEF08A', text: '#A16207', icon: true }; // Gold
            case 2: return { bg: '#E2E8F0', text: '#475569', icon: false }; // Silver
            case 3: return { bg: '#FED7AA', text: '#9A3412', icon: false }; // Bronze
            default: return { bg: '#F1F5F9', text: '#64748B', icon: false }; // Normal
        }
    };

    const rankStyle = getRankStyles(item.rank || index + 1);

    const renderStars = (rating = 5) => {
        const stars = [];
        const fullStars = Math.floor(rating);

        for (let i = 1; i <= 5; i++) {
            stars.push(
                <Star
                    key={i}
                    size={14}
                    color={i <= fullStars ? '#F59E0B' : '#E2E8F0'}
                    fill={i <= fullStars ? '#F59E0B' : 'transparent'}
                    style={styles.starIcon}
                />
            );
        }
        return stars;
    };

    return (
        <Animated.View style={[styles.card, { opacity: fadeAnim, transform: [{ translateY }] }]}>
            <View style={[styles.rankBadge, { backgroundColor: rankStyle.bg }]}>
                {rankStyle.icon && item.rank === 1 ? (
                    <Trophy size={20} color={rankStyle.text} />
                ) : (
                    <Text style={[styles.rankText, { color: rankStyle.text }]}>
                        #{item.rank || index + 1}
                    </Text>
                )}
            </View>

            <View style={styles.driverInfo}>
                <Text style={styles.nameText}>{item.name || 'Driver Name'}</Text>
                <View style={styles.starsRow}>
                    {renderStars(item.rating || 5)}
                    <Text style={styles.ratingValueText}>
                        {item.rating ? Number(item.rating).toFixed(1) : '5.0'}
                    </Text>
                </View>
            </View>
        </Animated.View>
    );
};

export default function RankingScreen() {
    const [rankingData, setRankingData] = useState<DriverRanking[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const apiUrl = 'http://192.168.1.103:8000';

    const fetchRankingData = async () => {
        try {
            const response = await axios.get(`${apiUrl}/api/v1/ranking/`);
            if (response.data && response.data.length > 0) {
                setRankingData(response.data);
            } else {
                setRankingData(MOCK_RANKING);
            }
        } catch (error) {
            console.warn('Error fetching ranking data, using mock:', error);
            setRankingData(MOCK_RANKING);
        } finally {
            // Small delay to appreciate the animation
            setTimeout(() => {
                setIsLoading(false);
                setIsRefreshing(false);
            }, 300);
        }
    };

    useEffect(() => {
        fetchRankingData();
    }, []);

    const handleRefresh = () => {
        setIsRefreshing(true);
        fetchRankingData();
    };

    if (isLoading && !isRefreshing) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#0F172A" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.headerContainer}>
                <Text style={styles.headerTitle}>Leaderboard</Text>
                <Text style={styles.headerSubtitle}>Top drivers of the month</Text>
            </View>

            <FlatList
                data={rankingData}
                renderItem={({ item, index }) => <AnimatedDriverCard item={item} index={index} />}
                keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
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
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 16,
        marginBottom: 16,
        // Elegant shadow for iOS
        shadowColor: '#64748B',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        // Elevation for Android
        elevation: 4,
    },
    rankBadge: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    rankText: {
        fontSize: 18,
        fontWeight: '800',
    },
    driverInfo: {
        flex: 1,
        justifyContent: 'center',
    },
    nameText: {
        fontSize: 17,
        fontWeight: '700',
        color: '#0F172A',
        marginBottom: 4,
    },
    starsRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    starIcon: {
        marginRight: 2,
    },
    ratingValueText: {
        fontSize: 14,
        color: '#64748B',
        fontWeight: '700',
        marginLeft: 8,
    },
});