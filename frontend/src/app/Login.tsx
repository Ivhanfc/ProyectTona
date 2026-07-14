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
  Animated
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Pizza, Mail, Eye, EyeOff, ArrowRight } from 'lucide-react-native';

// --- IMPORTACIÓN DE FUENTES ---
import {
  useFonts,
  Poppins_400Regular,
  Poppins_600SemiBold,
  Poppins_700Bold,
  Poppins_800ExtraBold
} from '@expo-google-fonts/poppins';

const { width } = Dimensions.get('window');
const isLargeScreen = width > 480;

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  // --- CARGA DE FUENTES ---
  let [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_600SemiBold,
    Poppins_700Bold,
    Poppins_800ExtraBold,
  });

  const emailFocusAnim = useRef(new Animated.Value(0)).current;
  const passwordFocusAnim = useRef(new Animated.Value(0)).current;

  const handleEmailFocus = (focused) => {
    setIsEmailFocused(focused);
    Animated.timing(emailFocusAnim, {
      toValue: focused ? 1 : 0,
      duration: 250,
      useNativeDriver: false,
    }).start();
  };

  const handlePasswordFocus = (focused) => {
    setIsPasswordFocused(focused);
    Animated.timing(passwordFocusAnim, {
      toValue: focused ? 1 : 0,
      duration: 250,
      useNativeDriver: false,
    }).start();
  };

  const emailBorderColor = emailFocusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#cbd5e1', '#00a2ff']
  });
  const emailBgColor = emailFocusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(255, 255, 255, 0.7)', '#FFFFFF']
  });

  const passBorderColor = passwordFocusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#cbd5e1', '#00a2ff']
  });
  const passBgColor = passwordFocusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(255, 255, 255, 0.7)', '#FFFFFF']
  });

  const handleLogin = () => {
    console.log('Intentando conectar al backend...', email, password);
  };

  // Evita que la pantalla se renderice hasta que la fuente esté lista
  if (!fontsLoaded) {
    return null; // En una app real, aquí puedes poner una pantalla de carga o el SplashScreen
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View pointerEvents="none" style={[styles.bgCircle, { backgroundColor: '#c7edff', top: '-5%', left: '-20%', width: 300, height: 300 }]} />
      <View pointerEvents="none" style={[styles.bgCircle, { backgroundColor: '#00a2ff', bottom: '5%', right: '-30%', width: 350, height: 350 }]} />

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
          <Text style={styles.brandSubtitle}>Pedidos seguros, pide cuando quieras</Text>
        </View>

        <View style={styles.formWrapper}>
          <BlurView intensity={50} tint="light" style={styles.glassCard}>

            <View style={styles.blueGlassHeader}>
              <Text style={styles.loginHeader}>Inicio de sesión</Text>
              <Text style={styles.loginSubtext}>Ingresa tu correo electrónico y contraseña para continuar</Text>
            </View>

            <Text style={styles.inputLabel}>Correo electrónico</Text>
            <Animated.View style={[styles.inputContainer, { borderColor: emailBorderColor, backgroundColor: emailBgColor }]}>
              <Mail color={isEmailFocused ? '#00a2ff' : '#64748b'} size={22} />
              <TextInput
                style={styles.textInput}
                placeholder="ejemplo@correo.com"
                placeholderTextColor="#94a3b8"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
                onFocus={() => handleEmailFocus(true)}
                onBlur={() => handleEmailFocus(false)}
                underlineColorAndroid="transparent"
                selectionColor="#00a2ff"
              />
            </Animated.View>

            <Text style={styles.inputLabel}>Contraseña</Text>
            <Animated.View style={[styles.inputContainer, { borderColor: passBorderColor, backgroundColor: passBgColor }]}>
              <TextInput
                style={styles.textInput}
                placeholder="Ingresa tu contraseña"
                placeholderTextColor="#94a3b8"
                secureTextEntry={!isPasswordVisible}
                autoCapitalize="none"
                value={password}
                onChangeText={setPassword}
                onFocus={() => handlePasswordFocus(true)}
                onBlur={() => handlePasswordFocus(false)}
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

            <TouchableOpacity style={styles.forgotPasswordContainer} activeOpacity={0.6}>
              <Text style={styles.forgotPasswordText}>¿Olvidaste tu contraseña?</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.loginButton} onPress={handleLogin} activeOpacity={0.8}>
              <Text style={styles.loginButtonText}>Siguiente</Text>
              <ArrowRight color="#FFFFFF" size={20} style={{ marginLeft: 8 }} />
            </TouchableOpacity>

          </BlurView>
        </View>

        <View style={styles.footerContainer}>
          <Text style={styles.footerText}>¿No tienes una cuenta? </Text>
          <TouchableOpacity activeOpacity={0.6}>
            <Text style={styles.registerLinkText}>Regístrate</Text>
          </TouchableOpacity>
        </View>

      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  innerContainer: {
    flex: 1,
    justifyContent: 'space-between',
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
    opacity: 0.25,
    zIndex: 1,
  },
  headerContainer: {
    alignSelf: 'flex-start',
    width: '100%',
    marginTop: 20,
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
    flex: 1,
    justifyContent: 'center',
    width: '100%',
  },
  glassCard: {
    width: '100%',
    padding: 24,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.6)',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  blueGlassHeader: {
    backgroundColor: 'rgba(0, 162, 255, 0.08)',
    borderColor: 'rgba(0, 162, 255, 0.2)',
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 12,
    marginBottom: 24,
    alignItems: 'center',
  },
  loginHeader: {
    fontSize: 22,
    fontFamily: 'Poppins_800ExtraBold',
    color: '#0f172a',
    marginBottom: 2,
    textAlign: 'center',
  },
  loginSubtext: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    color: '#475569',
    textAlign: 'center',
    lineHeight: 20,
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
    marginBottom: 20,
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
    marginTop: 4,
    marginBottom: 28,
    paddingVertical: 8,
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
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
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