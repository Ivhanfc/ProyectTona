// driver uberClone index

import { View, Text } from 'react-native';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Car } from 'lucide-react-native';

const apiUrl = 'http://192.168.1.73:8000';

export default function DriverIndex() {
    const [driverData, setDriverData] = useState(null);

    useEffect(() => {
        const fetchDriverData = async () => {
            try {
                const driverId = await AsyncStorage.getItem('driver_id');
                const response = await axios.get(`${apiUrl}/api/v1/drivers/${driverId}/`);
                setDriverData(response.data);
            } catch (error) {
                console.error('Error fetching driver data:', error);
            }
        };
        fetchDriverData();
    }, []);

    return (
        <View>
            <Car size={48} color="#00a2ff" />
            <Text>Hello how are you, {driverData?.name}?</Text>
        </View>
    );
}   
