import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ActivityIndicator, Dimensions, ScrollView } from 'react-native';
import { MapPin } from 'lucide-react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import api from '../../services/api';

const { width } = Dimensions.get('window');

const MOCK_DRIVER_PINS = [
    { id: 1, name: 'Order #101', latitude: 32.5149, longitude: -117.0382, status: 'Ready', distance: '0.4 km' },
    { id: 2, name: 'Order #102', latitude: 32.5165, longitude: -117.0398, status: 'Preparing', distance: '0.9 km' },
];

export default function DriverHomeScreen() {
    const [mapData, setMapData] = useState(MOCK_DRIVER_PINS);
    const [isLoading, setIsLoading] = useState(false);

    const initialRegion = {
        latitude: 32.5149,
        longitude: -117.0382,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
    };

    useEffect(() => {
        fetchMapPins();
    }, []);

    const fetchMapPins = async () => {
        try {
            const response = await api.get('/drivers/nearby_orders/');
            if (response.data && response.data.length > 0) {
                setMapData(response.data);
            }
        } catch (error: any) {
            console.warn('Endpoint not connected yet, using mock driver pin data instead.');
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
                    initialRegion={initialRegion}
                    showsUserLocation={true}
                    showsMyLocationButton={true}
                >
                    {mapData.map((pin) => ( // por ahora los datos son mock porque el endpoint no esta conectado, mock quiere decir datos falsos para probar
                        <Marker
                            key={pin.id}
                            coordinate={{ latitude: pin.latitude, longitude: pin.longitude }}
                            title={pin.name}
                            description={`${pin.status} • ${pin.distance}`}
                        >
                            <View style={styles.customMarker}>
                                <MapPin color="#e11d48" size={30} fill="#f59e0b" />
                            </View>
                        </Marker>
                    ))}
                </MapView>
            </View>

            {/* Bottom info section */}
            <View style={styles.infoSection}>
                <Text style={styles.infoTitle}>Orders nearby</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.carousel}>
                    {mapData.map((pin) => (
                        <View key={pin.id} style={styles.infoCard}>
                            <MapPin color="#00a2ff" size={18} />
                            <Text style={styles.infoCardName}>{pin.name}</Text>
                            <Text style={styles.infoCardSub}>{pin.status} • {pin.distance}</Text>
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