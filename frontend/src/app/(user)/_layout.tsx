import { Tabs } from 'expo-router';
import { Home, History, List } from 'lucide-react-native'; // Ensure you have these icons installed

export default function UserLayout() {
    return (
        <Tabs screenOptions={{ tabBarActiveTintColor: '#00a2ff' }}>
            {/* Home Map Screen */}
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Home',
                    tabBarIcon: ({ color }) => <Home color={color} size={24} />,
                    headerShown: false,
                }}
            />
            {/* Restaurants List Screen */}
            <Tabs.Screen
                name="restaurants"
                options={{
                    title: 'Restaurants',
                    tabBarIcon: ({ color }) => <List color={color} size={24} />,
                }}
            />
            {/* History Screen */}
            <Tabs.Screen
                name="history"
                options={{
                    title: 'History',
                    tabBarIcon: ({ color }) => <History color={color} size={24} />,
                }}
            />
            {/* Hide dynamic routes from the tab bar */}
            <Tabs.Screen
                name="[id]"
                options={{
                    href: null,
                }}
            />
        </Tabs>
    );
}