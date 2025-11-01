import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { isValidPhoneNumber } from 'libphonenumber-js';
import React, { useEffect, useState } from 'react';
import CountryPicker from 'react-native-country-picker-modal';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useRegistration } from '../context/registration';


import {
  ActivityIndicator,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';

const { width } = Dimensions.get('window');

export default function Register() {
  const { formData, updateFormData } = useRegistration();
  const router = useRouter();
  const [countryCode, setCountryCode] = useState("EG");
  const [callingCode, setCallingCode] = useState(20);

  const [name, setName] = useState<string | null>(formData.name || null);
  const [email, setEmail] = useState<string | null>(formData.email || null);
  const [phoneNumber, setPhoneNumber] = useState<string | null>(formData.phone?.replace(`+${callingCode}`, "") || null);
  const [password, setPassword] = useState<string | null>(formData.password || null);
  const [agreed, setAgreed] = useState<boolean | null>(formData.agreed || null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const token = await SecureStore.getItemAsync('userToken');
      if (token) {
        router.replace('/landing');
      }
    };

    checkAuth();
  }, []);

  const checkAvailability = async (email: string, phone: string) => {
    try {
      const response = await fetch('http://193.187.132.170:5000/api/users/check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, phone })
      });

      const data = await response.json();
      return data;
    } catch (err) {
      console.error('Availability check error:', err);
      return { success: false, msg: 'Server error' };
    }
  };

  const capitalizeWords = (str: string) => {
    return str
      .trim()
      .split(" ")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  }

  const isValidEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email.toLowerCase());
  };

  const isValidPassword = (password: string) => {
    let result = false;
    if (password.length >= 6) {
      result = true
    }
    return result;
  };

  const handleRegister = async () => {
    setLoading(true)

    if (name != null && email != null && phoneNumber != null && password != null && agreed) {

      if (!isValidEmail(email)) {
        setError("Invalid email address")
        setLoading(false);
        return;
      }
      if (!isValidPhoneNumber(phoneNumber, countryCode)) {
        setError("Invalid phone number");
        setLoading(false);
        return;
      }
      if (!isValidPassword(password)) {
        setError("Password should be at least 6 characters");
        setLoading(false);
        return;
      }

      setError('')

      const checkResult = await checkAvailability(email, phoneNumber);

      if (!checkResult.success) {
        setError(checkResult.msg);
        setLoading(false);
        return;
      }

      updateFormData({
        name: capitalizeWords(name),
        email: email,
        phone: "+" + callingCode + phoneNumber,
        password: password,
        country: countryCode,
        agreed: agreed
      });
      setLoading(false)
      router.push('/wizard');

    } else {
      setLoading(false)
      setError('Please fill all fields and agree to our terms');
    }
  };

  const toggleCheckbox = () => {
    setAgreed(prev => !prev);
  };

  return (
    <GestureHandlerRootView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0} // Adjust as needed
      >
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
              Create your Account
            </Text>
            <Text style={styles.pageDesc}>
              Join the energy, unite with athletes like you!
            </Text>
          </View>

          <Text style={styles.ghostText}>
            join
          </Text>

        </View>
        <ScrollView>
          <View style={styles.form}>
            {error != '' && <View style={styles.error}>
              <View style={styles.errorIcon}></View>
              <Text style={styles.errorText}>{error}</Text>
            </View>}

            <TextInput
              style={styles.input}
              placeholder="Name"
              placeholderTextColor="#A8A8A8"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />

            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#A8A8A8"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <View style={styles.phoneContainer}>
              <View style={styles.phonePicker}>
                <CountryPicker
                  countryCode={countryCode}
                  withFilter
                  withFlag
                  withCallingCode
                  withAlphaFilter
                  withCallingCodeButton
                  withEmoji={false}
                  onSelect={(country) => {
                    setCountryCode(country.cca2);
                    console.log(country.callingCode[0])
                    setCallingCode(country.callingCode[0]);
                  }}
                  containerButtonStyle={Platform.OS == "ios" ? { marginTop: -5 } : { marginTop: -2 }}
                />
              </View>
              <TextInput
                style={[styles.input, styles.phoneInput]}
                placeholder="Phone number"
                keyboardType="phone-pad"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
              />
            </View>
            <View>
              <TextInput
                style={[styles.input, styles.passwordInput]}
                placeholder="Password"
                placeholderTextColor="#A8A8A8"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeIcon}
              >
                <MaterialIcons
                  name={showPassword ? "visibility-off" : "visibility"}
                  size={24}
                  color="#707070"
                />
              </TouchableOpacity>
            </View>
            <View style={styles.hintContainer}>
              <Text style={styles.hint}>Password must be at least 6 character long and include 1 capital letter and 1 symbol</Text>
            </View>

            <TouchableOpacity onPress={toggleCheckbox} style={styles.checkboxContainer} activeOpacity={1}>
              <View style={styles.checkbox}>
                {agreed && <View style={styles.checked} >
                  <Image source={require('../assets/check.png')} style={styles.checkImage} />
                </View>}
              </View>

              <Text style={styles.label}>
                I agree to our{' '}
                <Text style={styles.link} onPress={() => router.push('/termsConditions')}>
                  Terms & Conditions
                </Text>
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.fullButtonRow} onPress={handleRegister}>
              {/* <Image source={require('../assets/buttonBefore_black.png')} style={styles.sideRect} /> */}
              <View style={styles.loginButton}>
                <Text style={styles.loginText}>
                  {loading ? 'CREATING' : 'CREATE'} ACCOUNT
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
            </TouchableOpacity>
          </View>

          <View style={styles.switchLinkContainer}>
            <Text style={{ color: 'black' }}>Already have an account?</Text>
            <TouchableOpacity onPress={() => router.replace('/login')}>
              <Text style={styles.switchLink}>LOGIN HERE</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.disclaimer}>
            <Text style={styles.hint}>
              By creating and using an account on Riyadah, you are agreeing to the Riyadah's terms and conditions and privacy policy terms and clauses.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </GestureHandlerRootView>
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
    width: 180,
    height: 40,
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
    fontFamily: 'Qatar',
    fontSize: 30,
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
    textTransform: 'uppercase'
  },
  form: {
    paddingLeft: 20,
    paddingRight: 20
  },
  input: {
    fontSize: Platform.OS == 'ios' ? 16 : 14,
    lineHeight: Platform.OS == 'ios' ? 18 : 14,
    padding: 15,
    backgroundColor: '#F4F4F4',
    marginBottom: 16,
    color: 'black',
    borderRadius: 10
  },
  phoneContainer: {
    flexDirection: 'row',
    alignItems: 'stretch',
    width: '100%',
    marginBottom: 16,
    backgroundColor: '#F4F4F4',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    gap: 5
  },
  phonePicker: {
    justifyContent: 'center',
    fontSize: 16
  },
  phoneInput: {
    marginBottom: 0,
    backgroundColor: 'transparent',
    flex: 1,
    padding: 0,
    fontSize: 16,
    lineHeight: Platform.OS == 'ios' ? 17 : 16,
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
  loginLoader: {
    marginLeft: 10
  },
  loginText: {
    fontSize: 18,
    color: 'white',
    fontFamily: 'Qatar',
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
    marginTop: 10
  },
  switchLink: {
    marginLeft: 5,
    fontFamily: 'Qatar',
    fontSize: 14,
    paddingTop: 3,
    lineHeight: 16
  },
  hintContainer: {
    marginTop: 5,
    marginBottom: 20
  },
  disclaimer: {
    paddingLeft: 20,
    paddingRight: 20,
    marginTop: 40,
    marginBottom: 20
  },
  hint: {
    color: '#525252',
    fontSize: 14,
    fontFamily: 'Acumin'
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 40
  },
  checkbox: {
    width: 18,
    height: 18,
    borderWidth: 1,
    borderColor: '#000000',
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5
  },
  checked: {
    width: 18,
    height: 18,
    backgroundColor: '#FF4400',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 5
  },
  checkImage: {
    width: 16,
    height: 16,
    resizeMode: 'contain',
    tintColor: '#fff'
  },
  label: {
    color: '#000000',
    fontFamily: 'Acumin'
  },
  link: {
    color: '#000',
    fontFamily: 'Qatar',
    fontSize: 13
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
    fontSize: 16,
    fontFamily: 'Qatar'
  },
  eyeIcon: {
    position: 'absolute',
    right: 15,
    top: 12,
    zIndex: 1,
  },
});
