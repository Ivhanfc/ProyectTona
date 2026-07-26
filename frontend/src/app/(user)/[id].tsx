// just code to don't let this file empty

import { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import axios from 'axios';

export default function UserMapScreen() {
    const [mapData, setMapData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchMapPins();
    }
        , []);

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
        backgroundColor: '#00a2ff',
        alignItems: 'center',
    },
    headerText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
    },
    mapArea: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    radiusCircle: {
        width: 200,
        height: 200,
        borderRadius: 100,
        backgroundColor: 'rgba(0, 162, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    pinText: {
        color: '#00a2ff',
        fontWeight: 'bold',
    },
});