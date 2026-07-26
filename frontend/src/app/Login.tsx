import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  Animated,
  ScrollView,
  Alert,
  ActivityIndicator
} from 'react-native';
import { Pizza, Mail, Eye, EyeOff, ArrowRight, User, Truck, Lock } from 'lucide-react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  useFonts,
  Poppins_400Regular,
  Poppins_600SemiBold,
  Poppins_700Bold,
  Poppins_800ExtraBold
} from '@expo-google-fonts/poppins';

const { width } = Dimensions.get('window');
const isLargeScreen = width > 480;
const apiUrl = 'http://192.168.1.73:8000'

export default function LoginScreen() {
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [userRole, setUserRole] = useState('user');
  
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [isUsernameFocused, setIsUsernameFocused] = useState(false);
  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  let [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_600SemiBold,
    Poppins_700Bold,
    Poppins_800ExtraBold,
  });

  const usernameFocusAnim = useRef(new Animated.Value(0)).current;
  const emailFocusAnim = useRef(new Animated.Value(0)).current;
  const passwordFocusAnim = useRef(new Animated.Value(0)).current;
  const roleToggleAnim = useRef(new Animated.Value(0)).current;

  const handleFocus = (anim, setFocused, focused) => {
    setFocused(focused);
    Animated.timing(anim, {
      toValue: focused ? 1 : 0,
      duration: 250,
      useNativeDriver: false,
    }).start();
  };

  const handleRoleChange = (role) => {
    setUserRole(role);
    Animated.timing(roleToggleAnim, {
      toValue: role === 'driver' ? 1 : 0,
      duration: 250,
      useNativeDriver: false,
    }).start();
  };

  const getAnimatedBorder = (anim) => anim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#e2e8f0', '#00a2ff']
  });

  const getAnimatedBg = (anim) => anim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#f8fafc', '#ffffff']
  });

  const roleIndicatorPosition = roleToggleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['2%', '50%']
  });

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim() || (isRegisterMode && !username.trim())) {
      Alert.alert('Incomplete Fields', 'Please fill in all required fields.');
      return;
    }

    setIsLoading(true);

    const entityPath = userRole === 'driver' ? 'drivers' : 'users';
    const actionPath = isRegisterMode ? 'create_user' : 'login-user';
    const endpoint = `${apiUrl}/api/v1/${entityPath}/${actionPath}/`;

    const payload = isRegisterMode
      ? {
          username: username.trim(),
          email: email.trim(),
          password: password,
          icon: null
        }
      : {
          email: email.trim(),
          password: password
        };

    try {
      const response = await axios.post(endpoint, payload);
      const user_data = response.data;
      const userId = user_data.id || user_data.user_id;
      if (userId) {
        await AsyncStorage.setItem('user_id', String(userId));
      }
      const actionText = isRegisterMode ? 'registered' : 'logged in';
      const roleText = userRole === 'driver' ? 'Driver' : 'Customer';
      
      Alert.alert('Success', `Successfully ${actionText} as ${roleText}.`);
    } catch (error) {
      console.error('Authentication error:', error);
      if (error.response) {
        const detail = error.response.data?.detail || 'An error occurred while processing your request.';
        Alert.alert('Error', typeof detail === 'string' ? detail : JSON.stringify(detail));
      } else {
        Alert.alert('Network Error', 'Could not connect to the backend server.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!fontsLoaded) {
    return null;
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <View pointerEvents="none" style={[styles.bgCircle, { backgroundColor: '#c7edff', top: '-5%', left: '-20%', width: 300, height: 300 }]} />
      <View pointerEvents="none" style={[styles.bgCircle, { backgroundColor: '#00a2ff', bottom: '5%', right: '-30%', width: 350, height: 350 }]} />

      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.innerContainer}>

          <View style={styles.headerContainer}>
            <View style={styles.brandRow}>
              <Text style={styles.brandTitle}>TheEater</Text>
              <Pizza
                color="#00a2ff"
                size={36}
                strokeWidth={2.5}
                style={{ transform: [{ rotate: '1deg' }], marginLeft: 8, marginTop: 4 }}
              />
            </View>
            <Text style={styles.brandSubtitle}>Orders and deliveries in one place</Text>
          </View>

          <View style={styles.formWrapper}>
            <View style={styles.solidCard}>

              <View style={styles.roleToggleContainer}>
                <Animated.View style={[styles.roleIndicator, { left: roleIndicatorPosition }]} />
                <TouchableOpacity
                  style={styles.roleOption}
                  activeOpacity={0.8}
                  onPress={() => handleRoleChange('user')}
                >
                  <User size={18} color={userRole === 'user' ? '#00a2ff' : '#64748b'} />
                  <Text style={[styles.roleText, userRole === 'user' && styles.roleTextActive]}>Customer</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.roleOption}
                  activeOpacity={0.8}
                  onPress={() => handleRoleChange('driver')}
                >
                  <Truck size={18} color={userRole === 'driver' ? '#00a2ff' : '#64748b'} />
                  <Text style={[styles.roleText, userRole === 'driver' && styles.roleTextActive]}>Driver</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.blueGlassHeader}>
                <Text style={styles.loginHeader}>
                  {isRegisterMode ? 'Create Account' : 'Sign In'}
                </Text>
                <Text style={styles.loginSubtext}>
                  {isRegisterMode
                    ? `Register as a ${userRole === 'driver' ? 'driver' : 'customer'} to get started`
                    : `Log in to your ${userRole === 'driver' ? 'driver' : 'customer'} account`}
                </Text>
              </View>

              {isRegisterMode && (
                <>
                  <Text style={styles.inputLabel}>Username</Text>
                  <Animated.View style={[styles.inputContainer, { borderColor: getAnimatedBorder(usernameFocusAnim), backgroundColor: getAnimatedBg(usernameFocusAnim) }]}>
                    <User color={isUsernameFocused ? '#00a2ff' : '#94a3b8'} size={22} />
                    <TextInput
                      style={styles.textInput}
                      placeholder="e.g. john_doe"
                      placeholderTextColor="#94a3b8"
                      autoCapitalize="none"
                      value={username}
                      onChangeText={setUsername}
                      onFocus={() => handleFocus(usernameFocusAnim, setIsUsernameFocused, true)}
                      onBlur={() => handleFocus(usernameFocusAnim, setIsUsernameFocused, false)}
                      underlineColorAndroid="transparent"
                      selectionColor="#00a2ff"
                    />
                  </Animated.View>
                </>
              )}

              <Text style={styles.inputLabel}>Email address</Text>
              <Animated.View style={[styles.inputContainer, { borderColor: getAnimatedBorder(emailFocusAnim), backgroundColor: getAnimatedBg(emailFocusAnim) }]}>
                <Mail color={isEmailFocused ? '#00a2ff' : '#94a3b8'} size={22} />
                <TextInput
                  style={styles.textInput}
                  placeholder="example@mail.com"
                  placeholderTextColor="#94a3b8"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                  onFocus={() => handleFocus(emailFocusAnim, setIsEmailFocused, true)}
                  onBlur={() => handleFocus(emailFocusAnim, setIsEmailFocused, false)}
                  underlineColorAndroid="transparent"
                  selectionColor="#00a2ff"
                />
              </Animated.View>

              <Text style={styles.inputLabel}>Password</Text>
              <Animated.View style={[styles.inputContainer, { borderColor: getAnimatedBorder(passwordFocusAnim), backgroundColor: getAnimatedBg(passwordFocusAnim) }]}>
                <Lock color={isPasswordFocused ? '#00a2ff' : '#94a3b8'} size={22} />
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter your password"
                  placeholderTextColor="#94a3b8"
                  secureTextEntry={!isPasswordVisible}
                  autoCapitalize="none"
                  value={password}
                  onChangeText={setPassword}
                  onFocus={() => handleFocus(passwordFocusAnim, setIsPasswordFocused, true)}
                  onBlur={() => handleFocus(passwordFocusAnim, setIsPasswordFocused, false)}
                  underlineColorAndroid="transparent"
                  selectionColor="#00a2ff"
                />
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                  style={styles.eyeButton}
                >
                  {isPasswordVisible ? (
                    <Eye color="#00a2ff" size={20} />
                  ) : (
                    <EyeOff color="#94a3b8" size={20} />
                  )}
                </TouchableOpacity>
              </Animated.View>

              {!isRegisterMode && (
                <TouchableOpacity style={styles.forgotPasswordContainer} activeOpacity={0.6}>
                  <Text style={styles.forgotPasswordText}>Forgot your password?</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={[styles.loginButton, isLoading && styles.buttonDisabled]}
                onPress={handleSubmit}
                activeOpacity={0.8}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <>
                    <Text style={styles.loginButtonText}>
                      {isRegisterMode ? 'Register' : 'Continue'}
                    </Text>
                    <ArrowRight color="#FFFFFF" size={20} style={{ marginLeft: 8 }} />
                  </>
                )}
              </TouchableOpacity>

            </View>
          </View>

          <View style={styles.footerContainer}>
            <Text style={styles.footerText}>
              {isRegisterMode ? 'Already have an account? ' : "Don't have an account? "}
            </Text>
            <TouchableOpacity
              activeOpacity={0.6}
              onPress={() => setIsRegisterMode(!isRegisterMode)}
            >
              <Text style={styles.registerLinkText}>
                {isRegisterMode ? 'Sign In' : 'Sign Up'}
              </Text>
            </TouchableOpacity>
          </View>

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f1f5f9',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  innerContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 70 : 60,
    paddingBottom: Platform.OS === 'ios' ? 40 : 30,
    alignSelf: 'center',
    width: isLargeScreen ? 450 : '100%',
    zIndex: 5,
  },
  bgCircle: {
    position: 'absolute',
    borderRadius: 200,
    opacity: 0.35,
    zIndex: 0.1,
  },
  headerContainer: {
    alignSelf: 'flex-start',
    width: '100%',
    marginBottom: 24,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandTitle: {
    fontSize: width * 0.09,
    fontFamily: 'Poppins_800ExtraBold',
    letterSpacing: -1,
    color: '#0f172a',
  },
  brandSubtitle: {
    fontSize: 16,
    fontFamily: 'Poppins_400Regular',
    color: '#64748b',
    marginTop: 6,
  },
  formWrapper: {
    width: '100%',
    marginBottom: 24,
  },
  solidCard: {
    width: '100%',
    padding: 24,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 4,
  },
  roleToggleContainer: {
    flexDirection: 'row',
    height: 48,
    backgroundColor: '#f1f5f9',
    borderRadius: 14,
    padding: 4,
    marginBottom: 20,
    position: 'relative',
  },
  roleIndicator: {
    position: 'absolute',
    top: '10%',
    width: '48%',
    height: '80%',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  roleOption: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  roleText: {
    fontSize: 14,
    fontFamily: 'Poppins_600SemiBold',
    color: '#64748b',
    marginLeft: 6,
  },
  roleTextActive: {
    color: '#00a2ff',
  },
  blueGlassHeader: {
    backgroundColor: '#eff6ff',
    borderColor: '#bfdbfe',
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 12,
    marginBottom: 20,
    alignItems: 'center',
  },
  loginHeader: {
    fontSize: 20,
    fontFamily: 'Poppins_800ExtraBold',
    color: '#0f172a',
    marginBottom: 2,
    textAlign: 'center',
  },
  loginSubtext: {
    fontSize: 13,
    fontFamily: 'Poppins_400Regular',
    color: '#475569',
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontFamily: 'Poppins_600SemiBold',
    color: '#0f172a',
    marginBottom: 8,
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    height: 56,
    borderRadius: 14,
    borderWidth: 1.5,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    fontFamily: 'Poppins_400Regular',
    color: '#0f172a',
    paddingVertical: 12,
    marginLeft: 12,
    ...Platform.select({
      web: { outlineStyle: 'none' },
    }),
  },
  eyeButton: {
    padding: 8,
  },
  forgotPasswordContainer: {
    alignSelf: 'center',
    marginTop: 2,
    marginBottom: 20,
    paddingVertical: 6,
  },
  forgotPasswordText: {
    color: '#0f172a',
    fontSize: 14,
    fontFamily: 'Poppins_600SemiBold',
  },
  loginButton: {
    width: '100%',
    height: 56,
    backgroundColor: '#0f172a',
    borderRadius: 14,
    flexDirection: 'row',
    justifyContent: 'center', // Fixed: replaced '.' with ':'
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Poppins_700Bold',
    letterSpacing: 0.5,
  },
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    paddingBottom: 10,
  },
  footerText: {
    color: '#64748b',
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
  },
  registerLinkText: {
    color: '#00a2ff',
    fontSize: 14,
    fontFamily: 'Poppins_700Bold',
  },
});