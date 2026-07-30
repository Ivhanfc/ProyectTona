import React, { useMemo, useRef, useState, useEffect } from "react";
import { View, Text, StyleSheet, Pressable, ScrollView, ActivityIndicator, Alert, Animated } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, Polyline, Region, UrlTile } from 'react-native-maps';
import * as Location from 'expo-location';
<<<<<<< HEAD
import { MapPinned, UserCircle2, History, Package } from "lucide-react-native";
import axios from "axios";
=======
import { MapPinned, UserCircle2, History, Package, LayoutIcon } from "lucide-react-native";
>>>>>>> beta3

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

export default function HomeScreen() {
<<<<<<< HEAD
    const [selectedTab, setSelectedTab] = useState<TabKey>('map');
    const courierMode = 'motorbike';
    const UrlApi = process.env.API_URL;
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
=======
  const [selectedTab, setSelectedTab] = useState<TabKey>('map');
  const courierMode = 'motorbike';

  // Estados de ubicación
  const [currentRegion, SetCurrentRegion] = useState<Region | null>(null);
  const [loadingLocation, setLoadingLocation] = useState<boolean>(true);

  // Animaciones y estado del repartidor
  const progress = useRef(new Animated.Value(0)).current;
  const [courierLoc, setCourierLoc] = useState({ 
    latitude: fallbackRegion.latitude, 
    longitude: fallbackRegion.longitude 
  });
  const [eta, setEta] = useState(8);

  useEffect(() => {
    let subscription: Location.LocationSubscription | null = null;
>>>>>>> beta3

    async function requestAndGetLocation() {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert("Permission denied, using default location");
          SetCurrentRegion(fallbackRegion);
          setCourierLoc({ 
            latitude: fallbackRegion.latitude + 0.004, 
            longitude: fallbackRegion.longitude - 0.004 
          });
          setLoadingLocation(false);
          return;
        }

        subscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.Balanced,
            timeInterval: 10000,
            distanceInterval: 2,
          },
          (location) => {
            const userRegion: Region = {
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
              latitudeDelta: 0.025,
              longitudeDelta: 0.025,
            };

<<<<<<< HEAD
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
        console.log("latitude: ",userRegion.latitude, " longitude: ", userRegion.longitude)
 
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
       {/* 
        return (
          <View style={styles.center}>
          <ActivityIndicator size="large" color="#00a2ff" />
          <Text style={styles.loadingText}>getting ubication GPS...</Text>
          </View>
        );
        */}
      }
             {/* 

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
                      */}

=======
            SetCurrentRegion(userRegion);
            setCourierLoc({
              latitude: userRegion.latitude + 0.004,
              longitude: userRegion.longitude - 0.004,
            });
            console.log("latitude: ", userRegion.latitude, " longitude: ", userRegion.longitude)
            
          }
        );
      } catch (error) {
        Alert.alert('Error, could not get device location');
        SetCurrentRegion(fallbackRegion);
      } finally {
        setLoadingLocation(false);
      }
>>>>>>> beta3
    }

    requestAndGetLocation();

    return () => {
      if (subscription) {
        subscription.remove();
      }
    };
  }, []);

  return null;
}