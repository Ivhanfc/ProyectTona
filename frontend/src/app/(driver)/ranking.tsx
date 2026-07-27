// template uber raking top 10 with 5 stars

import React, { useEffect, useState } from 'react';
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    FlatList,
    ActivityIndicator,
    RefreshControl
} from 'react-native';
import axios from 'axios';
import { Star } from 'lucide-react-native';

export default function RankingScreen() {
    const [rankingData, setRankingData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const apiUrl = 'http://192.168.1.73:8000';

    const MOCK_RANKING = [
        { id: 1, rank: 1, name: 'John Doe', rating: 4.9 },
        { id: 2, rank: 2, name: 'Jane Smith', rating: 4.8 },
        { id: 3, rank: 3, name: 'Mike Ross', rating: 4.5 },
    ];

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
            setIsLoading(false);
            setIsRefreshing(false);
        }
    };

    useEffect(() => {
        fetchRankingData();
    }, []);

    const handleRefresh = () => {
        setIsRefreshing(true);
        fetchRankingData();
    };

    // Helper function to render 5 stars dynamically based on driver rating
    const renderStars = (rating = 5) => {
        const stars = [];
        const fullStars = Math.floor(rating);

        for (let i = 1; i <= 5; i++) {
            stars.push(
                <Star
                    key={i}
                    size={16}
                    color={i <= fullStars ? '#f59e0b' : '#cbd5e1'}
                    fill={i <= fullStars ? '#f59e0b' : 'transparent'}
                    style={styles.starIcon}
                />
            );
        }
        return stars;
    };

    const renderRankingItem = ({ item, index }) => (
        <View style={styles.card}>
            {/* Position / Rank badge */}
            <View style={styles.rankBadge}>
                <Text style={styles.rankText}>#{item.rank || index + 1}</Text>
            </View>

            {/* Driver details */}
            <View style={styles.driverInfo}>
                <Text style={styles.nameText}>{item.name || 'Driver Name'}</Text>
                <View style={styles.starsRow}>
                    {renderStars(item.rating || 5)}
                    <Text style={styles.ratingValueText}>
                        ({item.rating ? Number(item.rating).toFixed(1) : '5.0'})
                    </Text>
                </View>
            </View>
        </View>
    );

    if (isLoading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#00a2ff" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.headerText}>ORDER BY RANKING</Text>
            <FlatList
                data={rankingData}
                renderItem={renderRankingItem}
                keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
                contentContainerStyle={styles.listContainer}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={isRefreshing}
                        onRefresh={handleRefresh}
                        colors={['#00a2ff']}
                    />
                }
            />
        </View>
    );
}

// Fixed: Added missing StyleSheet definition
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerText: {
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
        marginVertical: 18,
        color: '#0f172a',
    },
    listContainer: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8fafc',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 14,
        padding: 16,
        marginBottom: 12,
    },
    rankBadge: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#eff6ff',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
    },
    rankText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#00a2ff',
    },
    driverInfo: {
        flex: 1,
    },
    nameText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#0f172a',
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
        fontSize: 13,
        color: '#64748b',
        fontWeight: '500',
        marginLeft: 6,
    },
});