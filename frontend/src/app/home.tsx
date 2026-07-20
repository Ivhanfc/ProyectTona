import React, { useMemo, useRef, useState, useEffect} from "react";
import { View, Text, StyleSheet, Pressable, ScrollView, ActivityIndicator, Alert, Animated } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE,Polyline, Region, UrlTile} from 'react-native-maps';
import * as Location from 'expo-location';
import { MapPinned, UserCircle2, History, Package } from "lucide-react-native";
const fallbackRegion: Region = {
  latitude: 19.4326,
longitude: -99.1332,
latitudeDelta: 0.03,
longitudeDelta: 0.03,
};


const navItems = [
{ key: 'map', label: 'Map', icon: MapPinned },
{ key: 'history', label: 'History', icon: History },
{ key: 'profile', label: 'Profile', icon: UserCircle2 },
{ key: 'order', label: 'Order', icon: Package },
] as const;
type TabKey = (typeof navItems)[number]['key'];

function NodeMarker({
    title,
    description,
    latitude,
    longitude,
    tint,
    Icon,
}: {
    title: string;
    description: string;
    latitude: number;
    longitude: number;
    tint: string;
    Icon: any;
}) {
  return (
<Marker coordinate={{ latitude, longitude }} title={title} description={description}>
    <View style={[styles.markerBubble, { borderColor: tint }]}>
    <View style={[styles.markerInner, { backgroundColor: tint }]}>
    <Icon size={16} color="#ffffff" strokeWidth={2.4} />
    </View>
    </View>
</Marker>
);
}
export default function HomeScreen() {
    const [selectedTab, setSelectedTab] = useState<TabKey>('map');
    const courierMode = 'motorbike';

    //states of ubication
    const [currentRegion, SetCurrentRegion] = useState<Region | null>(null);
    const [loadingLocation, setLoadingLocation] = useState<boolean>(true);

    //animations and state driver
    const progress = useRef(new Animated.Value(0)).current;
    const [courierLoc, setCourierLoc] = useState({ latitude: fallbackRegion.latitude, longitude: fallbackRegion.longitude });
    const [eta, setEta] = useState(8);

    useEffect(() => {
        async function requestAndGetLocation(){
            try {
                const {status} = await Location.requestForegroundPermissionsAsync()
                if (status !== 'granted') {
                    Alert.alert(
                        "the permissed is denied, using default ubication"
                    );
                SetCurrentRegion(fallbackRegion);
                setCourierLoc({latitude: fallbackRegion.latitude + 0.004, longitude: fallbackRegion.longitude - 0.004});
                setLoadingLocation(false);
                return;
            }

        const location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
        });

        const userRegion: Region = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: 0.025,
            longitudeDelta: 0.025,
        };

        SetCurrentRegion(userRegion);
        setCourierLoc({
            latitude: userRegion.latitude + 0.004,
            longitude: userRegion.longitude - 0.004,
        });
 
        } catch(error) {
            Alert.alert('Error, not can get location of device');
            SetCurrentRegion(fallbackRegion);
        } finally {
            setLoadingLocation(false);
        }
        }
        requestAndGetLocation();
    }, []);

    if (loadingLocation || !currentRegion) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#00a2ff" />
        <Text style={styles.loadingText}>getting ubication GPS...</Text>
      </View>
    );
  }

        return (
            <View style={styles.container}>
            <MapView 
  style={styles.map} 
  provider={PROVIDER_GOOGLE} 
  initialRegion={currentRegion}
>
 
  <Marker 
    coordinate={{
      latitude: currentRegion.latitude,
      longitude: currentRegion.longitude,
    }}
    title="you ubication"
  />
</MapView>
              </View>  
        )
    }

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: '#64748b',
  },
  markerBubble: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  markerInner: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
});