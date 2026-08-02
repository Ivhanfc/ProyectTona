import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet, View, Text, ActivityIndicator } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_DEFAULT } from 'react-native-maps';
import decodePolyline from '@mapbox/polyline';

// URL de tu backend FastAPI (Asegúrate de ajustar IP si usas dispositivo físico o emulador)
// Si estás en emulador Android usa 10.0.2.2 en lugar de localhost
const API_BASE_URL = process.env.EXPO_PUBLIC_URLSERVER;
const WS_BASE_URL = `${API_BASE_URL}/ws/user`; 

export default function MapScreen() {
  // Estado para la ubicación del conductor
  const [driverLocation, setDriverLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  
  // Estado para las coordenadas de la ruta OSRM
  const [routeCoordinates, setRouteCoordinates] = useState<Array<{ latitude: number; longitude: number }>>([]);
  
  // Estado para métricas de viaje (distancia y tiempo)
  const [tripInfo, setTripInfo] = useState<{ distance: string; duration: string } | null>(null);

  const mapRef = useRef<MapView | null>(null);

  // ID del usuario registrado (puede obtenerse dinámicamente de AsyncStorage)
  const userId = "1"; 

  useEffect(() => {
    // Conectar al WebSocket de FastAPI en la ruta /ws/user/{target_id}
    const ws = new WebSocket(`${WS_BASE_URL}/${userId}`);

    ws.onopen = () => {
      console.log(' Conectado al WebSocket del Servidor');
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        const { lat, lon, route_info } = data;

        if (lat && lon) {
          const newDriverPos = { latitude: lat, longitude: lon };
          setDriverLocation(newDriverPos);

          // Si el mapa ya cargó, centrar suavemente hacia la nueva posición del conductor
          mapRef.current?.animateCamera({ center: newDriverPos, zoom: 16 }, { duration: 1000 });
        }

        // Si FastAPI nos envía los datos del cálculo de OSRM
        if (route_info && route_info.geometry) {
          // Si el servidor envía GeoJSON (LineString)
          if (route_info.geometry.coordinates) {
            const formattedCoords = route_info.geometry.coordinates.map((coord: [number, number]) => ({
              latitude: coord[1],
              longitude: coord[0],
            }));
            setRouteCoordinates(formattedCoords);
          } 
          // Si envía Polyline codificada en string
          else if (typeof route_info.geometry === 'string') {
            const decoded = decodePolyline.decode(route_info.geometry);
            const formattedCoords = decoded.map(([lat, lng]) => ({ latitude: lat, longitude: lng }));
            setRouteCoordinates(formattedCoords);
          }

          // Convertir distancia (m -> km) y tiempo (s -> min)
          if (route_info.distance && route_info.duration) {
            setTripInfo({
              distance: (route_info.distance / 1000).toFixed(2) + ' km',
              duration: Math.round(route_info.duration / 60) + ' min'
            });
          }
        }
      } catch (error) {
        console.error('Error procesando el mensaje WebSocket:', error);
      }
    };

    ws.onerror = (error) => {
      console.error('Error en WebSocket:', error);
    };

    ws.onclose = () => {
      console.log(' WebSocket Desconectado');
    };

    return () => {
      ws.close();
    };
  }, []);

  // Coordenadas iniciales por defecto (Tijuana)
  const initialRegion = {
    latitude: 32.5149,
    longitude: -117.0382,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_DEFAULT}
        initialRegion={initialRegion}
      >
        {/* Marcador del Conductor */}
        {driverLocation && (
          <Marker
            coordinate={driverLocation}
            title="Conductor"
            description="Tu pedido viene en camino"
            pinColor="blue"
          />
        )}

        {/* Línea trazada por OSRM */}
        {routeCoordinates.length > 0 && (
          <Polyline
            coordinates={routeCoordinates}
            strokeColor="#00a2ff"
            strokeWidth={5}
          />
        )}
      </MapView>

      {/* Tarjeta flotante con la distancia y tiempo estimado */}
      {tripInfo && (
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Pedido en camino</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoDetail}> Tiempo: <Text style={styles.bold}>{tripInfo.duration}</Text></Text>
            <Text style={styles.infoDetail}> Distancia: <Text style={styles.bold}>{tripInfo.distance}</Text></Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  infoCard: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
    backgroundColor: '#ffffff',
    borderRadius: 15,
    padding: 15,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  infoDetail: {
    fontSize: 14,
    color: '#666',
  },
  bold: {
    fontWeight: 'bold',
    color: '#00a2ff',
  },
});