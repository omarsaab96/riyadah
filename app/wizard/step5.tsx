import { useRouter } from 'expo-router';
import { useState } from 'react';
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
    const [error, setError] = useState<string | null>(null);

    const handleNext = async () => {
        if (!selectedGender) {
            return;
        }
        setLoading(true);
        setError(null);

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

            console.log('Submitting user data:', newUserData); // for debugging

            const response = await fetch('https://riyadah.onrender.com/api/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newUserData),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();

            console.log('User created:', result);

            router.replace('/profile');
        } catch (err) {
            console.error('User creation failed:', err);
            setError('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
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
                        {!loading ? 'About You' : 'Creating account'}
                    </Text>

                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        {!loading && <Text style={styles.pageDesc}>Tell us more about you</Text>}
                        {loading && (
                            <ActivityIndicator size="small" color="#ffffff" style={{ transform: [{ scale: 1.25 }] }} />
                        )}
                    </View>

                </View>

                <Text style={styles.ghostText}>
                    {!loading && 'About'}
                </Text>

            </View>

            {!loading && <ScrollView style={styles.form}>
                {/* <View style={styles.inputEntity}>
                    <Text style={styles.label}>Profile picture</Text>

                </View> */}

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
            </ScrollView>
            }

            {!loading && <View style={styles.fixedBottomSection}>
                <TouchableOpacity style={styles.fullButtonRow} onPress={handleNext}>
                    <Image source={require('../../assets/buttonBefore_black.png')} style={styles.sideRect} />
                    <View style={styles.loginButton}>
                        <Text style={styles.loginText}>next</Text>
                    </View>
                    <Image source={require('../../assets/buttonAfter_black.png')} style={styles.sideRectAfter} />
                </TouchableOpacity>
            </View>
            }

            {loading && (
                <Text style={{ paddingHorizontal: 20, fontFamily: 'Manrope', marginBottom: 10 }}></Text>
            )}

            {error && (
                <Text style={{ position: 'absolute', bottom: 80, left: 20, color: 'red', marginBottom: 10, textAlign: 'center' }}>{error}</Text>
            )}
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
        bottom: 30,
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
    }
});