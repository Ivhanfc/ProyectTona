import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ActivityIndicator, FlatList, TouchableOpacity } from 'react-native';
import { Star } from 'lucide-react-native';
import api from '../../services/api';

const MOCK_RANKINGS = [
    { id: '1', name: 'Burger Master', rating: 4.5, description: 'Best burgers in town.' },
    { id: '2', name: 'Pizza Palace', rating: 4.2, description: 'Authentic Italian pizza.' },
    { id: '3', name: 'Sushi Zen', rating: 4.0, description: 'Fresh sushi everyday.' },
];

export default function UserRankingScreen() {
    const [rankings, setRankings] = useState(MOCK_RANKINGS);
    const [isLoading, setIsLoading] = useState(false);

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

    const renderItem = ({ item }: { item: typeof MOCK_RANKINGS[0] }) => (
        <View style={styles.card}>
            <View style={styles.imagePlaceholder} />
            <View style={styles.cardContent}>
                <Text style={styles.title}>{item.name}</Text>
                <Text style={styles.description}>{item.description}</Text>
                <View style={styles.ratingContainer}>
                    <Star color="#f59e0b" size={16} fill="#f59e0b" />
                    <Text style={styles.ratingText}>- {item.rating}</Text>
                </View>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.headerTitle}>ORDER BY RANKING</Text>
            <FlatList
                data={rankings}
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
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    ratingText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#0f172a',
        marginLeft: 4,
    },
});
