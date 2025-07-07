import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import React, { useEffect, useState } from 'react';
import CountryPicker from 'react-native-country-picker-modal';
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

const { width } = Dimensions.get('window');

export default function Register() {
  const { formData, updateFormData } = useRegistration();
  const router = useRouter();
  const [countryCode, setCountryCode] = useState('LB');
  const [callingCode, setCallingCode] = useState('961');

  const [name, setName] = useState<string | null>(formData.name || null);
  const [email, setEmail] = useState<string | null>(formData.email || null);
  const [phoneNumber, setPhoneNumber] = useState<string | null>(formData.phone || null);
  const [password, setPassword] = useState<string | null>(formData.password || null);
  const [agreed, setAgreed] = useState<boolean | null>(formData.agreed || null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const token = await SecureStore.getItemAsync('userToken');
      if (token) {
        router.replace('/profile');
      }
    };

    checkAuth();
  }, []);

  const checkAvailability = async (email: string, phone: string) => {
    try {
      const response = await fetch('https://riyadah.onrender.com/api/users/check', {
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

  const handleRegister = async () => {
    setLoading(true)

    if (name != null && email != null && phoneNumber != null && password != null && agreed) {

      const checkResult = await checkAvailability(email, phoneNumber);

      if (!checkResult.success) {
        setError(checkResult.msg);
        setLoading(false);
        return;
      }

      updateFormData({
        name: name,
        email: email,
        phone: phoneNumber,
        password: password,
        country: countryCode,
        agreed: agreed
      });
      router.replace('/wizard');

    } else {
      setLoading(false)
      setError('Please fill all fields and agree to our terms');
    }
  };

  const toggleCheckbox = () => {
    setAgreed(prev => !prev);
  };

  return (
    <View style={styles.container}>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20} // Adjust as needed
      >
        <View style={styles.pageHeader}>
          <Image
            source={require('../assets/logo_white.png')}
            style={styles.logo}
            resizeMode="contain"
          />

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
                theme={{
                  itemHeight: 44,
                  fontSize: 14
                }}
                onSelect={(country) => {
                  setCountryCode(country.cca2);
                  setCallingCode(country.callingCode[0]);
                }}
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
          <TextInput
            style={[styles.input, styles.passwordInput]}
            placeholder="Password"
            placeholderTextColor="#A8A8A8"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

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
              I agree to the{' '}
              <Text style={styles.link} onPress={() => router.push('/termsConditions')}>
                Terms & Conditions
              </Text>
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.fullButtonRow} onPress={handleRegister}>
            <Image source={require('../assets/buttonBefore_black.png')} style={styles.sideRect} />
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
            <Image source={require('../assets/buttonAfter_black.png')} style={styles.sideRectAfter} />
          </TouchableOpacity>
        </View>

        <View style={styles.switchLinkContainer}>
          <Text>Already have an account?</Text>
          <TouchableOpacity onPress={() => router.replace('/login')}>
            <Text style={styles.switchLink}>LOGIN HERE</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.disclaimer}>
          <Text style={styles.hint}>
            By agreeing to the above terms, you are consenting that your personal information will be collected, stored, and processed on behalf of RIYADAH
          </Text>
        </View>
      </KeyboardAvoidingView>
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
  phoneContainer: {
    flexDirection: 'row',
    alignItems: 'stretch',
    width: '100%',
    marginBottom: 16,
    backgroundColor: '#F4F4F4',
    borderRadius: 10,
    paddingLeft: 15,
  },
  phonePicker: {
    paddingTop: 10
  },
  phoneInput: {
    marginBottom: 0,
    flexGrow: 1,
    backgroundColor: 'transparent',
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
  loginLoader: {
    marginLeft: 10
  },
  loginText: {
    fontSize: 20,
    color: 'white',
    fontFamily: 'Bebas',
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
    fontFamily: 'Bebas',
    fontSize: 16,
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
    fontSize: 12,
    fontFamily: 'Manrope'
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 40
  },
  checkbox: {
    width: 16,
    height: 16,
    borderWidth: 1,
    borderColor: '#000000',
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center'
  },
  checked: {
    width: 16,
    height: 16,
    backgroundColor: 'black',
    alignItems: 'center',
    justifyContent: 'center'
  },
  checkImage: {
    width: 16,
    height: 16,
    resizeMode: 'contain',
  },
  label: {
    color: '#000000',
    fontFamily: 'Manrope'
  },
  link: {
    color: '#000000',
    fontWeight: 'bold',
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
  }
});
