import { Tabs, router } from 'expo-router';
import { Home, History, List, LogOut, Compass } from 'lucide-react-native';
import { TouchableOpacity, Alert, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import '../components/CartShop'
import CartShopComponent from '../components/CartShop';
import { StyleSheet } from 'react-native';

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
        <View style={styles.container}>

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
                        title: 'TheEater Map',
                        tabBarIcon: ({ color }) => <Home color={color} size={24} />,
                        headerShown: true,
                        // Inject custom Compass icon
                        headerLeft: () => (
                            <View style={{ marginLeft: 15 }}>
                                <Compass color="#00a2ff" size={24} />
                            </View>
                        )
                    }}
                />
                {/* Restaurants Ranking Screen */}
                <Tabs.Screen
                    name="ranking"
                    options={{
                        title: 'Ranking',
                        tabBarIcon: ({ color }) => <List color={color} size={24} />,
                    }}
                />
                {/* Action / Order Screen */}
                <Tabs.Screen
                    name="action"
                    options={{
                        title: 'Order',
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
            </Tabs>
            <CartShopComponent

            />
        </View>
    );

}
const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});