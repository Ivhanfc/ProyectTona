import React, { useState, useEffect, useRef } from 'react';
import {
    StyleSheet,
    Text,
    View,
    ActivityIndicator,
    Animated,
    TouchableOpacity,
    ScrollView,
    TextInput
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, Mail, Phone, Camera, ChevronRight, LogOut, Shield, Bell } from 'lucide-react-native';
import { router } from 'expo-router';

export default function UserProfileScreen() {
    const [isLoading, setIsLoading] = useState(true);
    const [username, setUsername] = useState('');
    const [userRole, setUserRole] = useState('');
    const [phone, setPhone] = useState(''); // Optional phone state

    // Animation for a smooth entrance
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;

    useEffect(() => {
        loadUserData();

        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
            }),
            Animated.spring(slideAnim, {
                toValue: 0,
                friction: 8,
                tension: 40,
                useNativeDriver: true,
            })
        ]).start();
    }, []);

    const loadUserData = async () => {
        try {
            const storedName = await AsyncStorage.getItem('username');
            const storedRole = await AsyncStorage.getItem('user_role');

            if (storedName) setUsername(storedName);
            if (storedRole) setUserRole(storedRole);
        } catch (error) {
            console.error('Error loading user data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogout = async () => {
        // Clear all stored data and return to Login
        await AsyncStorage.multiRemove(['user_id', 'user_role', 'username']);
        router.replace('/Login');
    };

    if (isLoading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#0EA5E9" />
            </View>
        );
    }

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
        >
            <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>

                {/* Header Section */}
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Profile</Text>
                </View>

                {/* Profile Card */}
                <View style={styles.profileCard}>
                    <View style={styles.avatarContainer}>
                        <View style={styles.avatar}>
                            <User color="#94A3B8" size={40} />
                        </View>
                        <TouchableOpacity style={styles.cameraBadge} activeOpacity={0.8}>
                            <Camera color="#FFFFFF" size={14} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.profileInfo}>
                        <Text style={styles.nameText}>{username || 'Guest User'}</Text>
                        <Text style={styles.roleText}>
                            {userRole === 'driver' ? 'Verified Driver' : 'Customer Account'}
                        </Text>
                    </View>
                </View>

                {/* Personal Information Section */}
                <Text style={styles.sectionTitle}>Personal Information</Text>
                <View style={styles.card}>

                    {/* Email Row (Read Only Mock) */}
                    <View style={[styles.inputRow, styles.borderBottom]}>
                        <View style={styles.iconWrapper}>
                            <Mail color="#64748B" size={20} />
                        </View>
                        <View style={styles.inputContainer}>
                            <Text style={styles.inputLabel}>Email Address</Text>
                            <Text style={styles.inputValue}>contact@example.com</Text>
                        </View>
                    </View>

                    {/* Phone Row (Editable Mock) */}
                    <View style={styles.inputRow}>
                        <View style={styles.iconWrapper}>
                            <Phone color="#64748B" size={20} />
                        </View>
                        <View style={styles.inputContainer}>
                            <Text style={styles.inputLabel}>Phone Number</Text>
                            <TextInput
                                style={styles.textInput}
                                placeholder="Add your phone number"
                                placeholderTextColor="#94A3B8"
                                keyboardType="phone-pad"
                                value={phone}
                                onChangeText={setPhone}
                            />
                        </View>
                    </View>
                </View>

                {/* Preferences Section */}
                <Text style={styles.sectionTitle}>Preferences</Text>
                <View style={styles.card}>
                    <TouchableOpacity style={[styles.actionRow, styles.borderBottom]} activeOpacity={0.7}>
                        <View style={styles.actionLeft}>
                            <View style={[styles.iconWrapper, { backgroundColor: '#F0FDF4' }]}>
                                <Shield color="#10B981" size={20} />
                            </View>
                            <Text style={styles.actionText}>Security & Password</Text>
                        </View>
                        <ChevronRight color="#CBD5E1" size={20} />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.actionRow} activeOpacity={0.7}>
                        <View style={styles.actionLeft}>
                            <View style={[styles.iconWrapper, { backgroundColor: '#FFF7ED' }]}>
                                <Bell color="#F97316" size={20} />
                            </View>
                            <Text style={styles.actionText}>Notifications</Text>
                        </View>
                        <ChevronRight color="#CBD5E1" size={20} />
                    </TouchableOpacity>
                </View>

                {/* Logout Button */}
                <TouchableOpacity
                    style={styles.logoutButton}
                    activeOpacity={0.8}
                    onPress={handleLogout}
                >
                    <LogOut color="#EF4444" size={20} style={{ marginRight: 8 }} />
                    <Text style={styles.logoutText}>Log Out</Text>
                </TouchableOpacity>

            </Animated.View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    scrollContent: {
        paddingHorizontal: 24,
        paddingTop: 60,
        paddingBottom: 40,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F8FAFC',
    },
    header: {
        marginBottom: 24,
    },
    headerTitle: {
        fontSize: 32,
        fontWeight: '800',
        color: '#0F172A',
        letterSpacing: -0.5,
    },
    profileCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        padding: 20,
        marginBottom: 32,
        shadowColor: '#64748B',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.06,
        shadowRadius: 16,
        elevation: 4,
    },
    avatarContainer: {
        position: 'relative',
        marginRight: 16,
    },
    avatar: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: '#F1F5F9',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#E2E8F0',
    },
    cameraBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#0EA5E9',
        width: 28,
        height: 28,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#FFFFFF',
    },
    profileInfo: {
        flex: 1,
        justifyContent: 'center',
    },
    nameText: {
        fontSize: 20,
        fontWeight: '800',
        color: '#0F172A',
        marginBottom: 4,
    },
    roleText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#0EA5E9',
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#64748B',
        textTransform: 'uppercase',
        letterSpacing: 0.8,
        marginBottom: 12,
        marginLeft: 4,
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        marginBottom: 28,
        shadowColor: '#64748B',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.04,
        shadowRadius: 12,
        elevation: 3,
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
    },
    borderBottom: {
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    iconWrapper: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: '#F8FAFC',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    inputContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    inputLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: '#94A3B8',
        marginBottom: 4,
    },
    inputValue: {
        fontSize: 15,
        fontWeight: '500',
        color: '#0F172A',
    },
    textInput: {
        fontSize: 15,
        fontWeight: '500',
        color: '#0F172A',
        padding: 0,
        margin: 0,
    },
    actionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
    },
    actionLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    actionText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#0F172A',
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FEF2F2',
        borderRadius: 16,
        padding: 18,
        marginTop: 10,
    },
    logoutText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#EF4444',
    }
});