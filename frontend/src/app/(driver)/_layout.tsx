import { Tabs, router } from 'expo-router';
import { Home, History, List, LogOut } from 'lucide-react-native';
import { TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function UserLayout() {
    const handleLogout = async () => {
        Alert.alert('Logout', 'Are you sure you want to log out?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Logout',
                style: 'destructive',
                onPress: async () => {
                    await AsyncStorage.removeItem('user_id');
                    await AsyncStorage.removeItem('user_role');
                    router.replace('/Login');
                }
            }
        ]);
    };

    return (
        <Tabs screenOptions={{
            tabBarActiveTintColor: '#00a2ff',
            headerRight: () => (
                <TouchableOpacity onPress={handleLogout} style={{ marginRight: 15 }}>
                    <LogOut color="#ff4444" size={22} />
                </TouchableOpacity>
            )
        }}>
            {/* Home Map Screen */}
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Home',
                    tabBarIcon: ({ color }) => <Home color={color} size={24} />,
                    headerShown: true, // Show header so the logout button is visible!
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
