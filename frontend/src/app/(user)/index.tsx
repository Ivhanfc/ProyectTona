import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ActivityIndicator, Dimensions } from 'react-native';
import axios from 'axios';

// Get screen dimensions for the map radius UI
const { width } = Dimensions.get('window');
const apiUrl = 'http://192.168.1.73:8000'; // Update this to your actual backend IP

export default function UserHomeScreen() {
    const [mapData, setMapData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchMapPins();
    }, []);

    const fetchMapPins = async () => {
        try {
            // Fetch nearby restaurants or drivers endpoint
            const response = await axios.get(`${apiUrl}/api/v1/users/nearby/`);
            setMapData(response.data);
        } catch (error) {
            // Log error if the endpoint fails
            console.error('Error fetching map data:', error);
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

    return (
        <View style={styles.container}>
            {/* Top Header */}
            <View style={styles.header}>
                <Text style={styles.headerText}>User Location</Text>
            </View>

            {/* Map Placeholder Area (Replace with react-native-maps later) */}
            <View style={styles.mapArea}>
                {/* Visual representation of the blue radius circle from the wireframe */}
                <View style={styles.radiusCircle}>
                    <Text style={styles.pinText}>Pins go here</Text>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f1f5f9',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        padding: 16,
        backgroundColor: '#fff',
        alignItems: 'center',
        elevation: 2,
    },
    headerText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    mapArea: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#e2e8f0', // Fake map background
    },
    radiusCircle: {
        width: width * 0.8,
        height: width * 0.8,
        borderRadius: (width * 0.8) / 2,
        backgroundColor: 'rgba(0, 162, 255, 0.2)', // Light blue radius from 1000027334.jpg
        borderWidth: 2,
        borderColor: '#00a2ff',
        justifyContent: 'center',
        alignItems: 'center',
    },
    pinText: {
        color: '#0f172a',
        fontWeight: 'bold',
    }
});