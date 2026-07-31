import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ActivityIndicator, Dimensions, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { MapPin, Wifi, WifiOff } from 'lucide-react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import api from '../../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';

const { width } = Dimensions.get('window');

const MOCK_DRIVER_PINS = [
    { id: 1, name: 'Order #101', latitude: 32.5149, longitude: -117.0382, status: 'Ready', distance: '0.4 km' },
    { id: 2, name: 'Order #102', latitude: 32.5165, longitude: -117.0398, status: 'Preparing', distance: '0.9 km' },
];

export default function DriverHomeScreen() {
    const [mapData, setMapData] = useState(MOCK_DRIVER_PINS);
    const [isLoading, setIsLoading] = useState(false);

    // Active conductor mode status states
    const [isActive, setIsActive] = useState<boolean>(false);
    const [driverId, setDriverId] = useState<string | null>(null);
    const [wsConnection, setWsConnection] = useState<WebSocket | null>(null);
    const [locationSubscription, setLocationSubscription] = useState<Location.LocationSubscription | null>(null);
    const [currentCoords, setCurrentCoords] = useState<{ latitude: number; longitude: number } | null>(null);

    const initialRegion = {
        latitude: 32.5149,
        longitude: -117.0382,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
    };

    useEffect(() => {
        const loadInitialState = async () => {
            try {
                const storedId = await AsyncStorage.getItem('user_id');
                setDriverId(storedId);

                const storedActive = await AsyncStorage.getItem('driver_active_status');
                if (storedActive === 'on') {
                    setIsActive(true);
                }
            } catch (err) {
                console.error('Error loading initial active state:', err);
            }
        };
        loadInitialState();
        fetchMapPins();
    }, []);

    // WebSocket and location streaming hook
    useEffect(() => {
        let ws: WebSocket | null = null;
        let sub: Location.LocationSubscription | null = null;
        let isMounted = true;

        const startTrackingAndWebsocket = async () => {
            if (!isActive || !driverId) return;

            // WebSocket Connection
            try {
                const apiBase = api.defaults.baseURL || '';
                const wsBase = apiBase
                    .replace(/^http:/, 'ws:')
                    .replace(/^https:/, 'wss:')
                    .replace(/\/api\/v1$/, '');

                const wsUrl = `${wsBase}/ws/driver/${driverId}`;
                console.log('Connecting WebSocket to:', wsUrl);
                ws = new WebSocket(wsUrl);

                ws.onopen = () => {
                    console.log('WebSocket connection opened successfully.');
                };

                ws.onerror = (e) => {
                    console.error('WebSocket connection error:', e);
                };

                ws.onclose = () => {
                    console.log('WebSocket connection closed.');
                };

                if (isMounted) setWsConnection(ws);
            } catch (err) {
                console.error('WebSocket setup error:', err);
            }

            // Start GPS Tracking
            try {
                sub = await Location.watchPositionAsync(
                    {
                        accuracy: Location.Accuracy.High,
                        timeInterval: 5000,
                        distanceInterval: 5,
                    },
                    (location) => {
                        const { latitude, longitude } = location.coords;
                        console.log(`Tracking location: Lat: ${latitude}, Lon: ${longitude}`);

                        if (isMounted) {
                            setCurrentCoords({ latitude, longitude });
                        }

                        if (ws && ws.readyState === WebSocket.OPEN) {
                            ws.send(JSON.stringify({
                                lat: latitude,
                                lon: longitude,
                                user_id: null
                            }));
                        }
                    }
                );

                if (isMounted) setLocationSubscription(sub);
            } catch (err) {
                console.error('Error starting location subscription:', err);
            }
        };

        startTrackingAndWebsocket();

        return () => {
            isMounted = false;
            if (ws) {
                ws.close();
            }
            if (sub) {
                sub.remove();
            }
        };
    }, [isActive, driverId]);

    const toggleActiveStatus = async () => {
        try {
            const nextState = !isActive;
            if (nextState) {
                const { status } = await Location.requestForegroundPermissionsAsync();
                if (status !== 'granted') {
                    Alert.alert(
                        'Acceso de Ubicación Requerido',
                        'Por favor, concede acceso a la ubicación para poder cambiar a modo activo.'
                    );
                    return;
                }
            }

            setIsActive(nextState);
            await AsyncStorage.setItem('driver_active_status', nextState ? 'on' : 'off');

            Alert.alert(
                nextState ? 'Modo Activo Iniciado' : 'Modo Activo Desactivado',
                nextState
                    ? 'Estás en línea. Tu ubicación ahora se comparte en tiempo real para recibir pedidos.'
                    : 'Estás fuera de línea. Has dejado de compartir tu ubicación.'
            );
        } catch (error) {
            console.error('Error toggling active state:', error);
        }
    };

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

                    {/* Driver's own location representation with pulse ring */}
                    {isActive && currentCoords && (
                        <Marker
                            coordinate={currentCoords}
                            title="Tu Ubicación (Activo)"
                            description="Transmitiendo en tiempo real"
                        >
                            <View style={styles.driverMarker}>
                                <View style={styles.driverPulseRing} />
                                <View style={styles.driverDot} />
                            </View>
                        </Marker>
                    )}
                </MapView>

                {/* Floating Active Status Toggle Button */}
                <View style={styles.floatingContainer}>
                    <TouchableOpacity
                        activeOpacity={0.85}
                        onPress={toggleActiveStatus}
                        style={[
                            styles.activeButton,
                            isActive ? styles.activeButtonOn : styles.activeButtonOff
                        ]}
                    >
                        <View style={styles.activeIconWrapper}>
                            {isActive ? (
                                <Wifi color="#ffffff" size={20} />
                            ) : (
                                <WifiOff color="#ffffff" size={20} />
                            )}
                        </View>
                        <View style={styles.activeTextWrapper}>
                            <Text style={styles.activeLabel}>Modo Conductor</Text>
                            <Text style={styles.activeStatusText}>
                                {isActive ? 'ACTIVE: ON' : 'ACTIVE: OFF'}
                            </Text>
                        </View>
                        <View style={[
                            styles.indicatorDot,
                            isActive ? styles.indicatorDotOn : styles.indicatorDotOff
                        ]} />
                    </TouchableOpacity>
                </View>
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

    // Premium Active Mode Button Styles
    floatingContainer: {
        position: 'absolute',
        top: 20,
        left: 20,
        right: 20,
        zIndex: 10,
    },
    activeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
        elevation: 6,
        borderWidth: 1,
    },
    activeButtonOn: {
        backgroundColor: '#10b981',
        borderColor: '#059669',
    },
    activeButtonOff: {
        backgroundColor: '#475569',
        borderColor: '#334155',
    },
    activeIconWrapper: {
        marginRight: 12,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 12,
        padding: 8,
    },
    activeTextWrapper: {
        flex: 1,
    },
    activeLabel: {
        fontSize: 10,
        fontWeight: '600',
        color: 'rgba(255, 255, 255, 0.8)',
        textTransform: 'uppercase',
        letterSpacing: 0.8,
    },
    activeStatusText: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#ffffff',
        letterSpacing: 0.5,
    },
    indicatorDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        borderWidth: 2,
        borderColor: '#ffffff',
    },
    indicatorDotOn: {
        backgroundColor: '#34d399',
    },
    indicatorDotOff: {
        backgroundColor: '#94a3b8',
    },

    // Live Pulse Marker Styles
    driverMarker: {
        alignItems: 'center',
        justifyContent: 'center',
        width: 30,
        height: 30,
    },
    driverPulseRing: {
        position: 'absolute',
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: 'rgba(16, 185, 129, 0.3)',
        borderWidth: 1,
        borderColor: '#10b981',
    },
    driverDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#10b981',
        borderWidth: 2,
        borderColor: '#ffffff',
    },
});
