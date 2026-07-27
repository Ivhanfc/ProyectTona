import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ActivityIndicator, Dimensions, TouchableOpacity, ScrollView } from 'react-native';
import { LogOut, MapPin, Compass, ShieldAlert } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import api from '../../services/api';

const { width } = Dimensions.get('window');

// Mock pins inside the radius for the User Home Screen
const MOCK_RESTAURANTS_PINS = [
    { id: 1, name: 'Burger Master', lat: '32.5149', lon: '-117.0382', type: 'Burger', distance: '0.4 km' },
    { id: 2, name: 'Pizza Palace', lat: '32.5165', lon: '-117.0398', type: 'Pizza', distance: '0.9 km' },
    { id: 3, name: 'Sushi Zen', lat: '32.5122', lon: '-117.0351', type: 'Sushi', distance: '1.2 km' },
];

export default function UserHomeScreen() {
    const [mapData, setMapData] = useState(MOCK_RESTAURANTS_PINS);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        fetchMapPins();
    }, []);

    const fetchMapPins = async () => {
        try {
            // CENTRALIZED AXIOS SERVICE INTEGRATION
            const response = await api.get('/users/nearby/');
            if (response.data && response.data.length > 0) {
                setMapData(response.data);
            }
        } catch (error: any) {
            console.warn('Endpoint is not connected yet, using mock pin data instead:', error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogout = async () => {
        await AsyncStorage.clear();
        router.replace('/Login');
    };

    if (isLoading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#00a2ff" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Top Header */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <Compass color="#00a2ff" size={24} />
                    <Text style={styles.headerText}>TheEater Map</Text>
                </View>
            </View>

            {/* Map Placeholder Area */}
            <View style={styles.mapArea}>
                {/* Simulated circular radius overlay */}
                <View style={styles.radiusCircle}>
                    <View style={styles.centerPin}>
                        <MapPin color="#00a2ff" size={32} fill="#00a2ff" />
                        <Text style={styles.userBadge}>You</Text>
                    </View>

                    {/* Surrounding mock pins */}
                    {mapData.map((pin) => (
                        <View
                            key={pin.id}
                            style={[
                                styles.pinWrapper,
                                pin.id === 1 && { top: '20%', left: '25%' },
                                pin.id === 2 && { bottom: '25%', left: '15%' },
                                pin.id === 3 && { top: '35%', right: '20%' },
                            ]}
                        >
                            <MapPin color="#e11d48" size={24} fill="#f43f5e" />
                            <Text style={styles.pinLabel}>{pin.name}</Text>
                        </View>
                    ))}
                </View>
            </View>

            {/* Bottom info section */}
            <View style={styles.infoSection}>
                <Text style={styles.infoTitle}>Restaurants in your 1.5km radius</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.carousel}>
                    {mapData.map((pin) => (
                        <View key={pin.id} style={styles.infoCard}>
                            <MapPin color="#00a2ff" size={18} />
                            <Text style={styles.infoCardName}>{pin.name}</Text>
                            <Text style={styles.infoCardSub}>{pin.type} • {pin.distance || '0.5 km'}</Text>
                        </View>
                    ))}
                </ScrollView>
            </View>
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
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 16,
        backgroundColor: '#ffffff',
        borderBottomWidth: 1,
        borderColor: '#f1f5f9',
        elevation: 1,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    headerText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#0f172a',
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fef2f2',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#fee2e2',
        gap: 6,
    },
    logoutText: {
        color: '#ef4444',
        fontWeight: '600',
        fontSize: 12,
    },
    mapArea: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#cbd5e1', // Fake map background
    },
    radiusCircle: {
        width: width * 0.85,
        height: width * 0.85,
        borderRadius: (width * 0.85) / 2,
        backgroundColor: 'rgba(0, 162, 255, 0.15)', // Light blue radius circle
        borderWidth: 2,
        borderColor: '#00a2ff',
        borderStyle: 'dashed',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    centerPin: {
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    },
    userBadge: {
        backgroundColor: '#00a2ff',
        color: '#ffffff',
        fontSize: 10,
        fontWeight: 'bold',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 6,
        marginTop: 2,
    },
    pinWrapper: {
        position: 'absolute',
        alignItems: 'center',
    },
    pinLabel: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#0f172a',
        backgroundColor: '#ffffff',
        paddingHorizontal: 4,
        paddingVertical: 1,
        borderRadius: 4,
        marginTop: 2,
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    infoSection: {
        padding: 20,
        backgroundColor: '#ffffff',
        borderTopWidth: 1,
        borderColor: '#e2e8f0',
    },
    infoTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: '#0f172a',
        marginBottom: 12,
    },
    carousel: {
        flexDirection: 'row',
    },
    infoCard: {
        backgroundColor: '#f8fafc',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 12,
        padding: 12,
        marginRight: 12,
        width: 140,
        alignItems: 'flex-start',
        gap: 4,
    },
    infoCardName: {
        fontSize: 13,
        fontWeight: 'bold',
        color: '#0f172a',
    },
    infoCardSub: {
        fontSize: 11,
        color: '#64748b',
    },
});
