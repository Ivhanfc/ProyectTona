// Random return text, just to make sure the file is not empty and to avoid errors

import { useState, useEffect } from 'react';

export default function Restaurants() {
    const [restaurants, setRestaurants] = useState([]);
    useEffect(() => {
        // Simulate an API call to fetch restaurants
        const fetchRestaurants = () => {
            // Replace this with your actual API call
            setTimeout(() => {
                setRestaurants([
                    { id: 1, name: 'Restaurant 1' },
                    { id: 2, name: 'Restaurant 2' },
                    { id: 3, name: 'Restaurant 3' },
                ]);
            }, 1000);
        };

        fetchRestaurants();
    }, []);

    return (
        <View>
            <Text>Restaurants</Text>
        </View>
    );
}