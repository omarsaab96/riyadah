
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';



const { width } = Dimensions.get('window');
const router = useRouter();


export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const token = await SecureStore.getItemAsync('userToken');
      if (token) {
        router.replace('/landing');
      }
    };

    checkAuth();
  }, []);

  const handleLogin = async () => {
    if (loading) return;

    setLoading(true)

    if (!email || !password) {
      setError("Please fill email and password")
      setLoading(false)
    };

    try {
      const response = await fetch('https://riyadah.onrender.com/api/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        setError('Invalid email or password');
      }

      const { user, token } = await response.json();

      // Save the token securely
      await SecureStore.setItemAsync('userToken', token);

      // Navigate to profile screen
      router.replace('/landing');
    } catch (error: any) {
      setError("Login failed. Please try again")
      setLoading(false)
      console.error('Login failed:', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.pageHeader}>
        {/* <Image
          source={require('../assets/logo_white.png')}
          style={styles.logo}
          resizeMode="contain"
        /> */}

        <TouchableOpacity
          onPress={() => {
            router.back()
          }}
          style={styles.backBtn}
        >
          <Ionicons name="chevron-back" size={20} color="#ffffff" />
          <Text style={styles.backBtnText}>Back</Text>
        </TouchableOpacity>

        <View style={styles.headerTextBlock}>
          <Text style={styles.pageTitle}>
            Login
          </Text>
          <Text style={styles.pageDesc}>
            Let's get started!
          </Text>
        </View>

        <Text style={styles.ghostText}>
          SIGN IN
        </Text>

      </View>

      <View style={styles.form}>
        {error != '' && <View style={styles.error}>
          <View style={styles.errorIcon}></View>
          <Text style={styles.errorText}>{error}</Text>
        </View>}
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#A8A8A8"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput
          style={[styles.input, styles.passwordInput]}
          placeholder="Password"
          placeholderTextColor="#A8A8A8"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <View>
          <TouchableOpacity style={styles.forgotPassword} onPress={() => console.log('Forgot password pressed')}>
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.fullButtonRow} onPress={handleLogin}>
          <Image source={require('../assets/buttonBefore_black.png')} style={styles.sideRect} />
          <View style={styles.loginButton}>
            <Text style={styles.loginText}>
              {loading ? 'LOGGING IN' : 'LOGIN'}
            </Text>
            {loading && (
              <ActivityIndicator
                size="small"
                color="#FFFFFF"
                style={styles.loginLoader}
              />
            )}
          </View>
          <Image source={require('../assets/buttonAfter_black.png')} style={styles.sideRectAfter} />
        </TouchableOpacity>
      </View>

      <View style={styles.switchLinkContainer}>
        <Text style={{ color: 'black' }}>Need a new account?</Text>
        <TouchableOpacity onPress={() => router.replace('/register')}>
          <Text style={styles.switchLink}>REGISTER HERE</Text>
        </TouchableOpacity>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    height: '100%'
  },
  pageHeader: {
    backgroundColor: '#FF4000',
    height: 270,
    marginBottom: 30
  },
  logo: {
    width: 120,
    position: 'absolute',
    top: 20,
    left: 20,
    zIndex: 1,
  },
  headerTextBlock: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    width: width - 40,
  },
  pageTitle: {
    color: '#ffffff',
    fontFamily: 'Bebas',
    fontSize: 30,
    marginBottom: 10
  },
  pageDesc: {
    color: '#ffffff',
    fontSize: 16,
    fontFamily: 'Manrope'
  },
  ghostText: {
    color: '#ffffff',
    fontSize: 128,
    fontFamily: 'Bebas',
    position: 'absolute',
    bottom: 20,
    right: -5,
    opacity: 0.2
  },
  form: {
    paddingLeft: 20,
    paddingRight: 20
  },
  input: {
    fontSize: 14,
    padding: 15,
    backgroundColor: '#F4F4F4',
    marginBottom: 16,
    color: 'black',
    borderRadius: 10
  },
  passwordInput: {
    letterSpacing: 1,
    marginBottom: 0
  },
  fullButtonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  loginButton: {
    flex: 1,
    backgroundColor: '#000000',
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row'
  },
  loginText: {
    fontSize: 20,
    color: 'white',
    fontFamily: 'Bebas',
  },
  loginLoader: {
    marginLeft: 10
  },
  sideRect: {
    height: 48,
    width: 13,
  },
  sideRectAfter: {
    height: 48,
    width: 13,
    marginLeft: -1
  },
  forgotPassword: {
    marginTop: 10,
    marginBottom: 40
  },
  forgotPasswordText: {
    alignSelf: 'flex-end',
    color: '#525252',
    textDecorationLine: 'underline'
  },
  switchLinkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    color: 'black'
  },
  switchLink: {
    marginLeft: 5,
    fontFamily: 'Bebas',
    fontSize: 16,
    paddingTop: 3,
    lineHeight: 16,
    color: 'black'
  },
  error: {
    marginBottom: 15,
    backgroundColor: '#fce3e3',
    paddingHorizontal: 5,
    paddingVertical: 5,
    borderRadius: 5,
    flexDirection: 'row',
    alignItems: 'flex-start'
  },
  errorIcon: {
    width: 3,
    height: 15,
    backgroundColor: 'red',
    borderRadius: 5,
    marginRight: 10,
    marginTop: 3
  },
  errorText: {
    color: 'red',
    fontFamily: 'Manrope',
  },
  backBtn: {
    width: 200,
    zIndex: 1,
    flexDirection: 'row',
    alignContent: 'center',
    // borderWidth: 1
  },
  backBtnText: {
    color: '#FFF',
    fontSize: 18,
    fontFamily: 'Bebas',
  },
});
