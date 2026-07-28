import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ActivityIndicator, Dimensions, ScrollView } from 'react-native';
import { MapPin } from 'lucide-react-native';
import MapView, { Marker, PROVIDER_GOOGLE, Circle } from 'react-native-maps';
import api from '../../services/api';

const { width } = Dimensions.get('window');

const MOCK_RESTAURANTS_PINS = [
    { id: 1, name: 'Burger Master', latitude: 32.5149, longitude: -117.0382, type: 'Burger', distance: '0.4 km' },
    { id: 2, name: 'Pizza Palace', latitude: 32.5165, longitude: -117.0398, type: 'Pizza', distance: '0.9 km' },
    { id: 3, name: 'Sushi Zen', latitude: 32.5122, longitude: -117.0351, type: 'Sushi', distance: '1.2 km' },
];

export default function UserHomeScreen() {
    const [mapData, setMapData] = useState(MOCK_RESTAURANTS_PINS);
    const [isLoading, setIsLoading] = useState(false);

    const userLocation = { latitude: 32.5140, longitude: -117.0380 };

    useEffect(() => {
        fetchMapPins();
    }, []);

    const fetchMapPins = async () => {
        try {
            const response = await api.get('/users/nearby/');
            if (response.data && response.data.length > 0) {
                setMapData(response.data);
            }
        } catch (error: any) {
            console.warn('Endpoint not connected yet, using mock pin data instead.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            {/* Interactive Google Map */}
            <View style={styles.mapArea}>
                <MapView
                    provider={PROVIDER_GOOGLE}
                    style={styles.map}
                    initialRegion={{
                        ...userLocation,
                        latitudeDelta: 0.03,
                        longitudeDelta: 0.03,
                    }}
                    showsUserLocation={true}
                >
                    <Circle
                        center={userLocation}
                        radius={1500}
                        fillColor="rgba(0, 162, 255, 0.15)"
                        strokeColor="#00a2ff"
                        strokeWidth={2}
                    />

                    {mapData.map((pin) => (
                        <Marker
                            key={pin.id}
                            coordinate={{ latitude: pin.latitude, longitude: pin.longitude }}
                            title={pin.name}
                            description={`${pin.type} • ${pin.distance}`}
                        >
                            <View style={styles.customMarker}>
                                <MapPin color="#e11d48" size={30} fill="#f43f5e" />
                            </View>
                        </Marker>
                    ))}
                </MapView>
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
    container: { flex: 1, backgroundColor: '#f8fafc' },
    mapArea: { flex: 1 },
    map: { width: '100%', height: '100%' },
    customMarker: { alignItems: 'center', justifyContent: 'center' },
    infoSection: { padding: 20, backgroundColor: '#ffffff', borderTopWidth: 1, borderColor: '#e2e8f0' },
    infoTitle: { fontSize: 15, fontWeight: '700', color: '#0f172a', marginBottom: 12 },
    carousel: { flexDirection: 'row' },
    infoCard: {
        backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0',
        borderRadius: 12, padding: 12, marginRight: 12, width: 140,
        alignItems: 'flex-start', gap: 4,
    },
    infoCardName: { fontSize: 13, fontWeight: 'bold', color: '#0f172a' },
    infoCardSub: { fontSize: 11, color: '#64748b' },
});