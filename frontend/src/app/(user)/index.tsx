import React, { useEffect, useState, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  Dimensions
} from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import decodePolyline from '@mapbox/polyline';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { Star, Utensils, MapPin, Car } from 'lucide-react-native';
import * as Location from 'expo-location';
import api from '../../services/api';

const { width } = Dimensions.get('window');

interface Restaurant {
  id: number;
  name: string;
  address?: string;
  phone?: string;
  rating: number;
  latitude?: number;
  longitude?: number;
}

interface ActiveDriver {
  id: string;
  latitude: number;
  longitude: number;
}

// Coordenadas predefinidas para restaurantes (Tijuana)
const DEFAULT_COORDINATES: Record<number, { latitude: number; longitude: number }> = {
  1: { latitude: 32.5149, longitude: -117.0382 },
  2: { latitude: 32.5220, longitude: -117.0320 },
  3: { latitude: 32.5080, longitude: -117.0250 },
};

const getWebSocketUrl = () => {
  const apiBase = api.defaults.baseURL || '';
  let wsBase = apiBase
    .replace(/^http:/, 'ws:')
    .replace(/^https:/, 'wss:')
    .replace(/\/api\/v1$/, '');

  if (wsBase.endsWith('/')) {
    wsBase = wsBase.slice(0, -1);
  }
  return wsBase;
};

export default function UserHomeScreen() {
  const router = useRouter();

  // Estados
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loadingRestaurants, setLoadingRestaurants] = useState(true);

  // Ubicaciones de los conductores
  const [activeDrivers, setActiveDrivers] = useState<ActiveDriver[]>([]);
  const [assignedDriver, setAssignedDriver] = useState<{ latitude: number; longitude: number } | null>(null);

  // Ruta y viaje
  const [routeCoordinates, setRouteCoordinates] = useState<Array<{ latitude: number; longitude: number }>>([]);
  const [tripInfo, setTripInfo] = useState<{ distance: string; duration: string } | null>(null);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  const mapRef = useRef<MapView | null>(null);

  // 1. Obtener ubicación del usuario y restaurantes
  useEffect(() => {
    const initializeData = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
          setUserLocation({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          });
        }
      } catch (error) {
        console.warn("No se pudo obtener la ubicación del usuario");
      }
      fetchBestRestaurants();
    };

    initializeData();
  }, []);

  const fetchBestRestaurants = async () => {
    try {
      setLoadingRestaurants(true);
      const response = await api.get('/restaurants/get_best');
      if (response.data && Array.isArray(response.data)) {
        setRestaurants(response.data);
      }
    } catch (error: any) {
      console.warn('Error al cargar restaurantes:', error.message);
    } finally {
      setLoadingRestaurants(false);
    }
  };

  // 2. Polling para mostrar TODOS los conductores activos cercanos (Íconos de auto extra)
  useEffect(() => {
    const fetchActiveDrivers = async () => {
      try {
        const response = await api.get('/drivers/active-locations');
        if (response.data) {
          // El backend devuelve { "driver_id": { lat, lon, updated_at } }
          const driversArray = Object.entries(response.data).map(([id, data]: any) => ({
            id,
            latitude: data.lat,
            longitude: data.lon,
          }));
          setActiveDrivers(driversArray);
        }
      } catch (error) {
        // Silencioso para no saturar consola
      }
    };

    fetchActiveDrivers();
    const interval = setInterval(fetchActiveDrivers, 5000); // Actualiza cada 5 segundos
    return () => clearInterval(interval);
  }, []);

  // 3. Conexión WebSocket para rastreo exacto de TU pedido (Ruta y ETA)
  useEffect(() => {
    let ws: WebSocket | null = null;

    const connectWebSocket = async () => {
      const storedUserId = await AsyncStorage.getItem('user_id');
      const activeUserId = storedUserId && storedUserId !== 'null' ? storedUserId : "1";

      const wsUrl = `${getWebSocketUrl()}/ws/user/${activeUserId}`;
      ws = new WebSocket(wsUrl);

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          const { lat, lon, route_info } = data;

          if (lat && lon) {
            const newDriverPos = { latitude: lat, longitude: lon };
            setAssignedDriver(newDriverPos);
            mapRef.current?.animateCamera({ center: newDriverPos, zoom: 16 }, { duration: 1000 });
          }

          if (route_info && route_info.geometry) {
            if (route_info.geometry.coordinates) {
              const formattedCoords = route_info.geometry.coordinates.map((coord: [number, number]) => ({
                latitude: coord[1],
                longitude: coord[0],
              }));
              setRouteCoordinates(formattedCoords);
            } else if (typeof route_info.geometry === 'string') {
              const decoded = decodePolyline.decode(route_info.geometry);
              const formattedCoords = decoded.map(([lat, lng]) => ({ latitude: lat, longitude: lng }));
              setRouteCoordinates(formattedCoords);
            }

            if (route_info.distance && route_info.duration) {
              setTripInfo({
                distance: (route_info.distance / 1000).toFixed(2) + ' km',
                duration: Math.round(route_info.duration / 60) + ' min'
              });
            }
          }
        } catch (error) {
          console.error('Error procesando WebSocket:', error);
        }
      };
    };

    connectWebSocket();
    return () => { if (ws) ws.close(); };
  }, []);

  const handleSelectRestaurant = (restaurantId: number) => {
    router.push({
      pathname: '/(user)/action',
      params: { restaurant_id: restaurantId }
    });
  };

  const initialRegion = {
    latitude: userLocation?.latitude || 32.5149,
    longitude: userLocation?.longitude || -117.0382,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  };

  return (
    <View style={styles.container}>
      {/* MAPA FULL SCREEN CON DIMENSIONES EXPLÍCITAS */}
      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          style={styles.map}
          provider={PROVIDER_GOOGLE} // Ayuda a prevenir crashes en Android nativo
          initialRegion={initialRegion}
          showsUserLocation={true}
          showsMyLocationButton={false}
        >
          {/* 1. Marcadores de Restaurantes Top */}
          {restaurants.map((rest) => {
            const coords = {
              latitude: rest.latitude || DEFAULT_COORDINATES[rest.id]?.latitude || 32.5149 + (rest.id * 0.004),
              longitude: rest.longitude || DEFAULT_COORDINATES[rest.id]?.longitude || -117.0382 + (rest.id * 0.004),
            };

            return (
              <Marker
                key={`restaurant-${rest.id}`}
                coordinate={coords}
                title={rest.name}
                description={`⭐ ${rest.rating} • Toca para ver menú`}
                pinColor="#EF4444"
                onCalloutPress={() => handleSelectRestaurant(rest.id)}
              />
            );
          })}

          {/* 2. Marcadores de Conductores Activos Cercanos (Coches grises/blancos) */}
          {activeDrivers.map((driver) => (
            // Evitar duplicar el carro si este es el asignado
            (assignedDriver?.latitude !== driver.latitude) && (
              <Marker
                key={`driver-${driver.id}`}
                coordinate={{ latitude: driver.latitude, longitude: driver.longitude }}
                anchor={{ x: 0.5, y: 0.5 }}
              >
                <View style={styles.idleCarMarker}>
                  <Car color="#475569" size={20} />
                </View>
              </Marker>
            )
          ))}

          {/* 3. Marcador del Conductor Asignado a tu pedido (Coche Negro Resaltado) */}
          {assignedDriver && (
            <Marker
              coordinate={assignedDriver}
              title="Tu Conductor"
              description="Va en camino"
              anchor={{ x: 0.5, y: 0.5 }}
              zIndex={999}
            >
              <View style={styles.activeCarMarker}>
                <Car color="#FFFFFF" size={24} />
              </View>
            </Marker>
          )}

          {/* Ruta del Viaje */}
          {routeCoordinates.length > 0 && (
            <Polyline
              coordinates={routeCoordinates}
              strokeColor="#10B981"
              strokeWidth={5}
            />
          )}
        </MapView>
      </View>



      {/* TARJETA DE VIAJE Y CARRUSEL FLOTANTE INFERIOR */}
      <View style={styles.floatingBottom}>

        {/* Info del viaje activo */}
        {tripInfo && assignedDriver && (
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>🚘 Pedido en camino</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoDetail}>Llegada en: <Text style={styles.bold}>{tripInfo.duration}</Text></Text>
              <Text style={styles.infoDetail}>Distancia: <Text style={styles.bold}>{tripInfo.distance}</Text></Text>
            </View>
          </View>
        )}

        {/* Carrusel de Restaurantes */}
        {loadingRestaurants ? (
          <ActivityIndicator size="large" color="#0F172A" style={{ marginVertical: 20 }} />
        ) : (
          <FlatList
            data={restaurants}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => String(item.id)}
            contentContainerStyle={styles.restaurantsList}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.restaurantCard}
                activeOpacity={0.9}
                onPress={() => handleSelectRestaurant(item.id)}
              >
                <View style={styles.cardHeader}>
                  <View style={styles.iconContainer}>
                    <Utensils color="#0F172A" size={18} />
                  </View>
                  <View style={styles.ratingBadge}>
                    <Star color="#F59E0B" size={12} fill="#F59E0B" />
                    <Text style={styles.ratingText}>{item.rating.toFixed(1)}</Text>
                  </View>
                </View>

                <Text style={styles.restaurantName} numberOfLines={1}>{item.name}</Text>

                {item.address && (
                  <View style={styles.addressRow}>
                    <MapPin color="#64748B" size={12} />
                    <Text style={styles.addressText} numberOfLines={1}>{item.address}</Text>
                  </View>
                )}
              </TouchableOpacity>
            )}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  mapContainer: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  idleCarMarker: {
    backgroundColor: '#F1F5F9',
    padding: 6,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#94A3B8',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  activeCarMarker: {
    backgroundColor: '#0F172A',
    padding: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 6,
    elevation: 8,
  },
  floatingHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  headerContent: {
    margin: 16,
    marginTop: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    padding: 16,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '500',
  },
  floatingBottom: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  restaurantsList: {
    paddingHorizontal: 16,
    gap: 12,
  },
  restaurantCard: {
    width: 220,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#D97706',
  },
  restaurantName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 6,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  addressText: {
    fontSize: 12,
    color: '#64748B',
    flex: 1,
    fontWeight: '500',
  },
  infoCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: '#10B981',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoDetail: {
    fontSize: 13,
    color: '#ECFDF5',
    fontWeight: '500',
  },
  bold: {
    fontWeight: '800',
    color: '#FFFFFF',
  },
});