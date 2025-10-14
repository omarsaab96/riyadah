import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useEffect, useState } from 'react';
import { Dimensions, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRegistration } from '../../context/registration';

const { width } = Dimensions.get('window');
const accountTypes = [
    { label: 'Parent', icon: require('../../assets/parent.png') },
    { label: 'Athlete', icon: require('../../assets/athlete.png') },
    { label: 'Club', icon: require('../../assets/club.png') },
    { label: 'Association', icon: require('../../assets/association.png') },
    { label: 'Scout', icon: require('../../assets/scout.png') },
    { label: 'Sponsor', icon: require('../../assets/sponsor.png') },
];

export default function WizardStep1() {
    const { formData, updateFormData } = useRegistration();
    const router = useRouter();
    const [selected, setSelected] = useState<string | null>(formData.type || null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const checkAuth = async () => {
            const token = await SecureStore.getItemAsync('userToken');
            if (token) {
                router.replace('/profile'); // Redirect if token exists
            }
        };

        checkAuth();

        console.log(formData)
    }, []);

    const handleNext = () => {
        if (selected) {
            updateFormData({ type: selected });
            router.push('/wizard/step2');

        } else {
            setError('Kindly select an account type')
        }
    }

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
                        Account type
                    </Text>
                    <Text style={styles.pageDesc}>
                        What are you?
                    </Text>
                </View>

                <Text style={styles.ghostText}>
                    account
                </Text>

            </View>

            <ScrollView >
                {error != null && <View style={styles.error}>
                    <View style={styles.errorIcon}></View>
                    <Text style={styles.errorText}>{error}</Text>
                </View>}

                <View style={styles.wizardContainer}>
                    {accountTypes.map(({ label, icon }, idx) => (
                        <TouchableOpacity
                            key={label}
                            style={[
                                styles.accountOption,
                                selected === label && styles.accountOptionSelected,
                            ]}
                            onPress={() => setSelected(label)}
                        >
                            <Image source={icon} style={styles.icon} resizeMode="contain" />
                            <Text style={[styles.accountText, selected === label && styles.accountTextSelected]}>
                                {label=="Association" ? 'Association/Federation' : label=="Club" ? 'Club/Academy' : label}
                                {/* {label} */}
                            </Text>
                        </TouchableOpacity>
                    ))}

                </View>
            </ScrollView>

            <View style={styles.fixedBottomSection}>
                <TouchableOpacity style={styles.fullButtonRow} onPress={handleNext}>
                    <Image source={require('../../assets/buttonBefore_black.png')} style={styles.sideRect} />
                    <View style={styles.loginButton}>
                        <Text style={styles.loginText}>next</Text>
                    </View>
                    <Image source={require('../../assets/buttonAfter_black.png')} style={styles.sideRectAfter} />
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
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingBottom: 100,
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
        height: 160,
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
        bottom: 45,
        left: 0,
        width: width,
        paddingLeft: 20,
        paddingRight: 20
    },
    error: {
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