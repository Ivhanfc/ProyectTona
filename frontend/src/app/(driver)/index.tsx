import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ActivityIndicator, Dimensions, ScrollView, TouchableOpacity, Alert, SafeAreaView } from 'react-native';
import { MapPin, Wifi, WifiOff, CheckCircle } from 'lucide-react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import api from '../../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';

const { width } = Dimensions.get('window');

interface OrderPin {
    id: number;
    name: string;
    latitude: number;
    longitude: number;
    status: string;
    distance: string;
}

const getWebSocketUrl = (driverId: string) => {
    const apiBase = api.defaults.baseURL || '';
    let wsBase = apiBase
        .replace(/^http:/, 'ws:')
        .replace(/^https:/, 'wss:')
        .replace(/\/api\/v1$/, '');

    if (wsBase.endsWith('/')) {
        wsBase = wsBase.slice(0, -1);
    }
    return `${wsBase}/ws/driver/${driverId}`;
};

export default function DriverHomeScreen() {
    const [mapData, setMapData] = useState<OrderPin[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [acceptingOrderId, setAcceptingOrderId] = useState<number | null>(null);

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

    // EFECTO POLLING CADA 5 SEGUNDOS
    useEffect(() => {
        const intervalId = setInterval(() => {
            fetchMapPins();
        }, 5000);

        return () => clearInterval(intervalId);
    }, []);

    useEffect(() => {
        let ws: WebSocket | null = null;
        let sub: Location.LocationSubscription | null = null;
        let isMounted = true;

        const startTrackingAndWebsocket = async () => {
            if (!isActive || !driverId) return;

            const { status } = await Location.getForegroundPermissionsAsync();
            if (status !== 'granted') {
                setIsActive(false);
                await AsyncStorage.setItem('driver_active_status', 'off');
                return;
            }

            try {
                const wsUrl = getWebSocketUrl(driverId);
                ws = new WebSocket(wsUrl);

                ws.onopen = () => console.log('WebSocket de conductor conectado.');
                ws.onerror = (e) => console.error('Error en WebSocket de conductor:', e);
                ws.onclose = () => console.log('WebSocket de conductor desconectado.');

                if (isMounted) setWsConnection(ws);
            } catch (err) {
                console.error('WebSocket setup error:', err);
            }

            try {
                sub = await Location.watchPositionAsync(
                    {
                        accuracy: Location.Accuracy.High,
                        timeInterval: 4000,
                        distanceInterval: 3,
                    },
                    (location) => {
                        const { latitude, longitude } = location.coords;

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
                console.error('Error al iniciar transmisión de ubicación:', err);
            }
        };

        startTrackingAndWebsocket();

        return () => {
            isMounted = false;
            if (ws) ws.close();
            if (sub) sub.remove();
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
                        'Por favor, concede acceso a la ubicación para activar tu estado.'
                    );
                    return;
                }
            }

            setIsActive(nextState);
            await AsyncStorage.setItem('driver_active_status', nextState ? 'on' : 'off');
        } catch (error) {
            console.error('Error cambiando estado activo:', error);
        }
    };

    const fetchMapPins = async () => {
        try {
            const response = await api.get('/drivers/nearby_orders/');
            if (response.data && Array.isArray(response.data)) {
                setMapData(response.data);
            }
        } catch (error: any) {
            console.warn('Error al obtener órdenes cercanas:', error.message);
        }
    };

    const handleAcceptOrder = async (orderId: number) => {
        if (!driverId) {
            Alert.alert("Error", "No se encontró el ID del conductor.");
            return;
        }

        setMapData((prevData) => prevData.filter((order) => order.id !== orderId));
        setAcceptingOrderId(orderId);

        try {
            await api.put(`/orders/${orderId}/accept?driver_id=${driverId}`);
            Alert.alert("¡Pedido Aceptado!", `Has aceptado la orden #${orderId}.`);
            fetchMapPins(); // Sincronizar datos reales
        } catch (error: any) {
            console.error("Error al aceptar pedido:", error.response?.data || error.message);
            Alert.alert("Error", "No se pudo aceptar la orden. Puede que ya haya sido tomada.");
            fetchMapPins(); // Revertir/recargar si hubo error de red
        } finally {
            setAcceptingOrderId(null);
        }
    };

    return (
        <View style={styles.container}>
            {/* MAPA FULL SCREEN */}
            <MapView
                provider={PROVIDER_GOOGLE}
                style={styles.map}
                initialRegion={initialRegion}
                showsUserLocation={true}
                showsMyLocationButton={false}
            >
                {/* Órdenes Pendientes */}
                {mapData.map((pin) => (
                    <Marker
                        key={pin.id}
                        coordinate={{ latitude: pin.latitude, longitude: pin.longitude }}
                        title={pin.name}
                        description={`${pin.status} • ${pin.distance}`}
                    >
                        <View style={styles.customMarker}>
                            <MapPin color="#EF4444" size={36} fill="#FCD34D" />
                        </View>
                    </Marker>
                ))}

                {/* Ubicación Real del Conductor (Pulso) */}
                {isActive && currentCoords && (
                    <Marker
                        coordinate={currentCoords}
                        title="Tu Ubicación (Activo)"
                        anchor={{ x: 0.5, y: 0.5 }}
                    >
                        <View style={styles.driverMarker}>
                            <View style={styles.driverPulseRing} />
                            <View style={styles.driverDot} />
                        </View>
                    </Marker>
                )}
            </MapView>

            <SafeAreaView style={styles.floatingTop}>
                <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={toggleActiveStatus}
                    style={[
                        styles.activeButton,
                        isActive ? styles.activeButtonOn : styles.activeButtonOff
                    ]}
                >
                    <View style={styles.activeIconWrapper}>
                        {isActive ? <Wifi color="#ffffff" size={20} /> : <WifiOff color="#ffffff" size={20} />}
                    </View>
                    <View style={styles.activeTextWrapper}>
                        <Text style={styles.activeLabel}>Modo Conductor</Text>
                        <Text style={styles.activeStatusText}>
                            {isActive ? 'EN LÍNEA' : 'DESCONECTADO'}
                        </Text>
                    </View>
                    <View style={[
                        styles.indicatorDot,
                        isActive ? styles.indicatorDotOn : styles.indicatorDotOff
                    ]} />
                </TouchableOpacity>
            </SafeAreaView>

            {/* CARRUSEL INFERIOR FLOTANTE - ÓRDENES DISPONIBLES */}
            <View style={styles.floatingBottom}>
                <View style={styles.infoSectionHeader}>
                    <Text style={styles.infoTitle}>Solicitudes Cercanas ({mapData.length})</Text>
                </View>

                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.carouselList}>
                    {mapData.length === 0 ? (
                        <View style={styles.emptyCard}>
                            <Text style={styles.emptyText}>No hay pedidos cerca. Sigue manejando para encontrar nuevas solicitudes.</Text>
                        </View>
                    ) : (
                        mapData.map((pin) => (
                            <View key={pin.id} style={styles.infoCard}>
                                <View style={styles.cardHeader}>
                                    <MapPin color="#EF4444" size={18} />
                                    <Text style={styles.infoCardName} numberOfLines={1}>{pin.name}</Text>
                                </View>
                                <Text style={styles.infoCardSub}>{pin.status} • {pin.distance}</Text>

                                <TouchableOpacity
                                    style={styles.acceptButton}
                                    onPress={() => handleAcceptOrder(pin.id)}
                                    disabled={acceptingOrderId === pin.id}
                                >
                                    {acceptingOrderId === pin.id ? (
                                        <ActivityIndicator color="#FFFFFF" size="small" />
                                    ) : (
                                        <>
                                            <CheckCircle color="#FFFFFF" size={16} style={{ marginRight: 6 }} />
                                            <Text style={styles.acceptButtonText}>Aceptar Viaje</Text>
                                        </>
                                    )}
                                </TouchableOpacity>
                            </View>
                        ))
                    )}
                </ScrollView>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    map: {
        width: '100%',
        height: '100%',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    customMarker: {
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
    driverMarker: {
        alignItems: 'center',
        justifyContent: 'center',
        width: 40,
        height: 40,
    },
    driverPulseRing: {
        position: 'absolute',
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(16, 185, 129, 0.4)',
        borderWidth: 1,
        borderColor: '#10b981',
    },
    driverDot: {
        width: 14,
        height: 14,
        borderRadius: 7,
        backgroundColor: '#10B981',
        borderWidth: 2,
        borderColor: '#FFFFFF',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.4,
        shadowRadius: 3,
    },
    floatingTop: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10,
    },
    activeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderRadius: 20,
        margin: 16,
        marginTop: 40,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
        elevation: 8,
    },
    activeButtonOn: { backgroundColor: '#0F172A', borderWidth: 1, borderColor: '#1E293B' },
    activeButtonOff: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E2E8F0' },
    activeIconWrapper: {
        marginRight: 12,
        backgroundColor: 'rgba(148, 163, 184, 0.2)',
        borderRadius: 12,
        padding: 10,
    },
    activeTextWrapper: { flex: 1 },
    activeLabel: {
        fontSize: 11,
        fontWeight: '700',
        color: '#64748B',
        textTransform: 'uppercase',
    },
    activeStatusText: {
        fontSize: 16,
        fontWeight: '800',
        color: '#10B981',
    },
    indicatorDot: {
        width: 14,
        height: 14,
        borderRadius: 7,
        borderWidth: 2,
        borderColor: '#FFFFFF',
    },
    indicatorDotOn: { backgroundColor: '#10B981' },
    indicatorDotOff: { backgroundColor: '#94A3B8' },

    floatingBottom: {
        position: 'absolute',
        bottom: 20,
        left: 0,
        right: 0,
        zIndex: 10,
    },
    infoSectionHeader: {
        paddingHorizontal: 20,
        marginBottom: 10,
    },
    infoTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#0F172A',
        textShadowColor: 'rgba(255,255,255,0.9)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
    },
    carouselList: {
        paddingHorizontal: 16,
        gap: 12,
    },
    emptyCard: {
        backgroundColor: 'rgba(255,255,255,0.9)',
        borderRadius: 16,
        padding: 20,
        width: width - 32,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    emptyText: {
        color: '#64748B',
        fontSize: 14,
        fontWeight: '600',
        textAlign: 'center',
    },
    infoCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 16,
        width: 240,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
        elevation: 6,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 4,
    },
    infoCardName: {
        fontSize: 16,
        fontWeight: '800',
        color: '#0F172A',
        flex: 1,
    },
    infoCardSub: {
        fontSize: 13,
        color: '#64748B',
        fontWeight: '500',
        marginBottom: 12,
    },
    acceptButton: {
        backgroundColor: '#0F172A',
        borderRadius: 14,
        paddingVertical: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    acceptButtonText: {
        color: '#FFFFFF',
        fontWeight: '800',
        fontSize: 14,
    },
});