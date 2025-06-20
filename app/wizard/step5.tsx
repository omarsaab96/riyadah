import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useRegistration } from '../../context/registration';

const { width } = Dimensions.get('window');
const genders = [
    { label: 'Male', icon: require('../../assets/male.png') },
    { label: 'Female', icon: require('../../assets/female.png') }
];

export default function WizardStep5() {
    const router = useRouter();
    const { formData, updateFormData } = useRegistration();
    const [bio, setBio] = useState<string | null>(formData.bio || null);
    const [selectedGender, setSelectedGender] = useState<string | null>(formData.gender || null);
    const [loading, setLoading] = useState(false);
    const [registrationError, setRegisterError] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const checkAuth = async () => {
            const token = await SecureStore.getItemAsync('userToken');
            if (token) {
                router.replace('/profile'); // Redirect if token exists
            }
        };

        checkAuth();
    }, []);

    const handleNext = async () => {
        if (!selectedGender) {
            setError('Kindly select a gender')
            return;
        }
        setLoading(true);
        setRegisterError(null);

        try {
            updateFormData({
                bio: bio,
                gender: selectedGender,
            });

            // Combine all data from registration context
            const newUserData = {
                ...formData,
                bio: bio,
                gender: selectedGender,
            };

            console.log('Submitting user data:', newUserData);

            const response = await fetch('https://riyadah.onrender.com/api/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newUserData),
            });

            // if (!response.ok) {
                console.log(response)
                // throw new Error(`HTTP error! status: ${response.status}`);
            // }

            const { user, token } = await response.json();

            console.log("response token: ", token)

            await SecureStore.setItemAsync('userToken', String(token));

            router.replace('/profile');
        } catch (err) {
            console.error('User creation failed:', err);
            setRegisterError('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleRetry = async () => {
        router.replace('/register');
    };

    return (
        <View style={styles.container}>
            <View style={styles.pageHeader}>
                <Image
                    source={require('../../assets/logo_white.png')}
                    style={styles.logo}
                    resizeMode="contain"
                />

                <View style={styles.headerTextBlock}>
                    <Text style={styles.pageTitle}>
                        {!loading
                            ? (registrationError ? 'Error' : 'About You')
                            : 'Creating account'}
                    </Text>


                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        {!loading && registrationError == null && <Text style={styles.pageDesc}>Tell us more about you</Text>}

                        {loading && !registrationError && (
                            <ActivityIndicator
                                size="small"
                                color="#ffffff"
                                style={{ transform: [{ scale: 1.25 }] }}
                            />
                        )}

                        {!loading && registrationError && (
                            <Text style={styles.pageDesc}>Sorry for the inconvenience</Text>
                        )}
                    </View>

                </View>

                <Text style={styles.ghostText}>
                    {!loading
                        ? (error ? 'Error' : 'About')
                        : null}
                </Text>

            </View>

            {registrationError != null && <View style={styles.registrationError}>
                <View style={styles.errorIcon}></View>
                <Text style={styles.errorText}>{registrationError}</Text>

            </View>}

            {!loading && registrationError == null && <ScrollView style={styles.form}>
                {error != null && <View style={styles.error}>
                    <View style={styles.errorIcon}></View>
                    <Text style={styles.errorText}>{error}</Text>
                </View>}

                <View style={styles.inputEntity}>
                    <Text style={styles.label}>Gender</Text>
                    <View style={styles.wizardContainer}>
                        {genders.map(({ label, icon }, idx) => (
                            <TouchableOpacity
                                key={label}
                                style={[
                                    styles.accountOption,
                                    selectedGender === label && styles.accountOptionSelected,
                                ]}
                                onPress={() => setSelectedGender(label)}
                            >
                                <Image source={icon} style={styles.icon} resizeMode="contain" />
                                <Text style={[styles.accountText, selectedGender === label && styles.accountTextSelected]}>
                                    {label}
                                </Text>
                            </TouchableOpacity>
                        ))}

                    </View>
                </View>

                <View style={styles.inputEntity}>
                    <Text style={styles.label}>BIO</Text>
                    <TextInput
                        style={styles.textarea}
                        placeholder="What are your biggest achievements?"
                        placeholderTextColor="#A8A8A8"
                        value={bio}
                        onChangeText={setBio}
                        multiline={true}
                        blurOnSubmit={false}
                        returnKeyType="default"
                    />
                </View>
            </ScrollView>}

            {!loading && registrationError == null && <View style={styles.fixedBottomSection}>
                <TouchableOpacity style={styles.fullButtonRow} onPress={handleNext}>
                    <Image source={require('../../assets/buttonBefore_black.png')} style={styles.sideRect} />
                    <View style={styles.loginButton}>
                        <Text style={styles.loginText}>next</Text>
                    </View>
                    <Image source={require('../../assets/buttonAfter_black.png')} style={styles.sideRectAfter} />
                </TouchableOpacity>
            </View>}

            {!loading && registrationError != null && <View style={styles.fixedBottomSection}>
                <TouchableOpacity style={styles.fullButtonRow} onPress={handleRetry}>
                    <Image source={require('../../assets/buttonBefore_black.png')} style={styles.sideRect} />
                    <View style={styles.loginButton}>
                        <Text style={styles.loginText}>Try again</Text>
                    </View>
                    <Image source={require('../../assets/buttonAfter_black.png')} style={styles.sideRectAfter} />
                </TouchableOpacity>
            </View>}
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
        width: 150,
        position: 'absolute',
        top: 40,
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
    wizardContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between'
    },
    accountOption: {
        borderWidth: 1,
        borderColor: '#ccc',
        paddingVertical: 10,
        paddingHorizontal: 10,
        borderRadius: 10,
        marginBottom: 16,
        backgroundColor: '#f9f9f9',
        width: (width - 60) / 2,
        position: 'relative',
        height: 120,
        fontFamily: 'Manrope'
    },
    accountOptionSelected: {
        borderColor: '#FF4000',
        backgroundColor: '#FFE6D8',
        fontFamily: 'Manrope'
    },
    accountText: {
        fontSize: 18,
        color: '#333',
        fontFamily: 'Manrope',
    },
    icon: {
        width: 100,
        height: 100,
        position: 'absolute',
        bottom: 0,
        right: 0
    },
    accountTextSelected: {
        color: '#FF4000',
        fontWeight: 'bold',
    },
    fixedBottomSection: {
        position: 'absolute',
        bottom: 50,
        left: 0,
        width: width,
        paddingLeft: 20,
        paddingRight: 20
    },
    form: {
        paddingLeft: 20,
        paddingRight: 20,
        paddingBottom: 80
    },
    textarea: {
        fontSize: 14,
        padding: 15,
        backgroundColor: '#F4F4F4',
        marginBottom: 16,
        color: 'black',
        borderRadius: 10,
        height: 170,
        textAlignVertical: 'top',
    },
    label: {
        fontFamily: 'Bebas',
        fontSize: 16,
        marginBottom: 10
    },
    inputEntity: {
        marginBottom: 30
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
    registrationError: {
        marginBottom: 15,
        backgroundColor: '#fce3e3',
        paddingHorizontal: 5,
        paddingVertical: 5,
        borderRadius: 5,
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginHorizontal: 20
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