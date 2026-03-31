
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useLanguage } from '../context/language';



const { width } = Dimensions.get('window');


export default function Login() {
  const router = useRouter();
  const { isRTL, t } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [emailChecked, setEmailChecked] = useState(false);
  const textDirectionStyle = isRTL ? styles.rtlText : styles.ltrText;


  useEffect(() => {
    const checkAuth = async () => {
      const token = await SecureStore.getItemAsync('userToken');
      if (token) {
        if (SecureStore.getItemAsync('user').type === "Manager" || SecureStore.getItemAsync('user').type === "superadmin") {
          router.replace('/manager/dashboard');
        } else {
          router.replace('/landing');
        }
      }
    };

    checkAuth();
  }, []);

  const handleLogin = async () => {
    if (loading) return;

    setLoading(true)

    if (!email || !password) {
      setError(t('auth.pleaseFillEmailPassword'))
      setLoading(false)
    };

    try {
      const response = await fetch('https://server.riyadah.app/api/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const resp = await response.json()
      if (!response.ok) {
        setError(resp.error);
        setLoading(false);
        return;
      }

      const { user, token } = resp;

      // Save the token securely
      await SecureStore.setItemAsync('userToken', token);
      setLoading(false)


      if (user.type === "Manager" || user.type === "superadmin") {
        router.replace('/manager/dashboard');
      } else {
        router.replace('/landing');
      }

    } catch (error: any) {
      setError(t('auth.loginFailed'))
      setLoading(false)
      console.error('Login failed:', error.message);
    }
  };

  const handleNext = async () => {
    if (loading) return;

    setLoading(true)

    if (!email) {
      setError(t('auth.pleaseEnterEmail'))
      setLoading(false)
      return;
    };

    try {
      const response = await fetch('https://server.riyadah.app/api/users/checkAccount', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const resp = await response.json()

      if (!response.ok) {
        setError(resp.message);
        setEmailChecked(false);
        setLoading(false);
        return;
      }
      if (response.ok) {
        if (!resp.personalAccount) {
          router.replace({
            pathname: '/setPersonalAccount',
            params: { registeredEmail: email },
          })
        } else {
          setEmailChecked(true)
          setError("");
          setLoading(false);
        }

      }

    } catch (error: any) {
      setError(t('auth.emailCheckFailed'))
      setLoading(false)
      setEmailChecked(false)
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
          <Ionicons name={isRTL ? "chevron-forward" : "chevron-back"} size={20} color="#ffffff" />
          <Text style={[styles.backBtnText, textDirectionStyle]}>{t('auth.back')}</Text>
        </TouchableOpacity>

        <View style={[styles.headerTextBlock, isRTL && styles.headerTextBlockRtl]}>
          <Text style={[styles.pageTitle, textDirectionStyle]}>
            {t('auth.loginTitle')}
          </Text>
          <Text style={[styles.pageDesc, textDirectionStyle]}>
            {t('auth.loginSubtitle')}
          </Text>
        </View>

        <Text style={[styles.ghostText, isRTL && styles.ghostTextRtl]}>
          {t('auth.loginTitle')}
        </Text>

      </View>

      <View style={styles.form}>
        {error != '' && <View style={styles.error}>
          <View style={styles.errorIcon}></View>
          <Text style={[styles.errorText, textDirectionStyle]}>{error}</Text>
        </View>}
        {!emailChecked && <TextInput
          style={[styles.input, textDirectionStyle]}
          placeholder={t('auth.email')}
          placeholderTextColor="#A8A8A8"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />}

        {emailChecked && <View>
          <TouchableOpacity style={[styles.emailBackRow, isRTL && styles.emailBackRowRtl]}>
            <Ionicons name={isRTL ? "chevron-forward" : "chevron-back"} size={20} color="#FF4400" style={{ transform: [{ translateY: 1 }] }} />
            <Text style={[styles.emailBackText, textDirectionStyle]}>{email}</Text>
          </TouchableOpacity>
          <View>
            <TextInput
              style={[styles.input, styles.passwordInput, textDirectionStyle]}
              placeholder={t('auth.password')}
              placeholderTextColor="#A8A8A8"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={[styles.eyeIcon, isRTL && styles.eyeIconRtl]}
            >
              <MaterialIcons
                name={showPassword ? "visibility-off" : "visibility"}
                size={24}
                color="#707070"
              />
            </TouchableOpacity>
          </View>
        </View>}

        {emailChecked && <View>
          <TouchableOpacity style={styles.forgotPassword} onPress={() => { router.push('/profile/forgotPassword') }}>
            <Text style={[styles.forgotPasswordText, textDirectionStyle]}>{t('auth.forgotPassword')}</Text>
          </TouchableOpacity>
        </View>}

        {emailChecked && <TouchableOpacity style={styles.fullButtonRow} onPress={handleLogin}>
          {/* <Image source={require('../assets/buttonBefore_black.png')} style={styles.sideRect} /> */}
          <View style={styles.loginButton}>
            <Text style={styles.loginText}>
              {loading ? t('auth.loggingIn') : t('auth.login')}
            </Text>
            {loading && (
              <ActivityIndicator
                size="small"
                color="#FFFFFF"
                style={styles.loginLoader}
              />
            )}
          </View>
          {/* <Image source={require('../assets/buttonAfter_black.png')} style={styles.sideRectAfter} /> */}
        </TouchableOpacity>}

        {!emailChecked && <TouchableOpacity style={styles.fullButtonRow} onPress={handleNext}>
          {/* <Image source={require('../assets/buttonBefore_black.png')} style={styles.sideRect} /> */}
          <View style={styles.loginButton}>
            <Text style={styles.loginText}>
              {t('auth.next')}
            </Text>
            {loading && (
              <ActivityIndicator
                size="small"
                color="#FFFFFF"
                style={styles.loginLoader}
              />
            )}
          </View>
          {/* <Image source={require('../assets/buttonAfter_black.png')} style={styles.sideRectAfter} /> */}
        </TouchableOpacity>}
      </View>

      <View style={styles.switchLinkContainer}>
        <Text style={[styles.switchText, textDirectionStyle]}>{t('auth.needAccount')}</Text>
        <TouchableOpacity onPress={() => router.replace('/register')}>
          <Text style={[styles.switchLink, isRTL && styles.switchLinkRtl]}>{t('auth.registerHere')}</Text>
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
  headerTextBlockRtl: {
    left: undefined,
    right: 20,
  },
  pageTitle: {
    color: '#ffffff',
    fontFamily: 'Qatar',
    fontSize: 30,
    marginBottom: 0
  },
  pageDesc: {
    color: '#ffffff',
    fontSize: 18,
    fontFamily: 'Acumin'
  },
  ghostText: {
    color: '#ffffff',
    fontSize: 100,
    fontFamily: 'Qatar',
    position: 'absolute',
    bottom: 20,
    right: -5,
    opacity: 0.2,
    width: '100%',
    textAlign: 'right',
    textTransform: 'uppercase'
  },
  ghostTextRtl: {
    right: undefined,
    left: -5,
    textAlign: 'left',
  },
  ltrText: {
    textAlign: 'left',
    writingDirection: 'ltr'
  },
  rtlText: {
    textAlign: 'right',
    writingDirection: 'rtl'
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
    borderRadius: 10,
    fontFamily: 'Acumin',
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
    backgroundColor: '#1a491e',
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    borderRadius: 15
  },
  loginText: {
    fontSize: 18,
    color: 'white',
    fontFamily: 'Qatar',
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
  switchText: {
    color: 'black'
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
    fontFamily: 'Qatar',
    fontSize: 14,
    paddingTop: 3,
    lineHeight: 16,
    color: 'black'
  },
  switchLinkRtl: {
    marginLeft: 0,
    marginRight: 5,
  },
  error: {
    marginBottom: 15,
    backgroundColor: '#fce3e3',
    paddingHorizontal: 5,
    paddingVertical: 5,
    borderRadius: 5,
    flexDirection: 'row',
    alignItems: 'stretch'
  },
  errorIcon: {
    width: 3,
    height: 15,
    backgroundColor: 'red',
    borderRadius: 5,
    marginRight: 10,
  },
  errorText: {
    color: 'red',
    fontFamily: 'Acumin',
  },
  backBtn: {
    position: 'absolute',
    top: 60,
    left: 10,
    width: 200,
    zIndex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backBtnText: {
    color: '#FFF',
    fontSize: 18,
    fontFamily: 'Qatar'
  },
  emailBackRow: {
    marginBottom: 40,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5
  },
  emailBackRowRtl: {
    flexDirection: 'row-reverse',
  },
  emailBackText: {
    color: "#FF4400"
  },
  eyeIcon: {
    position: 'absolute',
    right: 15,
    top: Platform.OS == 'ios' ? 17 : 17,
    zIndex: 1,
  },
  eyeIconRtl: {
    right: undefined,
    left: 15,
  },
});
