import { Tabs } from 'expo-router';
import { Map, Trophy, ClipboardList } from 'lucide-react-native';

export default function DriverLayout() {
    return (
        <Tabs screenOptions={{ tabBarActiveTintColor: '#22c55e' }}>
            {/* Driver Map Screen */}
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Map',
                    tabBarIcon: ({ color }) => <Map color={color} size={24} />,
                    headerShown: false,
                }}
            />
            {/* Available Orders Screen */}
            <Tabs.Screen
                name="orders"
                options={{
                    title: 'Orders',
                    tabBarIcon: ({ color }) => <ClipboardList color={color} size={24} />,
                }}
            />
            {/* Driver Ranking Screen */}
            <Tabs.Screen
                name="ranking"
                options={{
                    title: 'Ranking',
                    tabBarIcon: ({ color }) => <Trophy color={color} size={24} />,
                }}
            />
        </Tabs>
    );
}