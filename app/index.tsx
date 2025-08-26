import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import React, { useEffect } from 'react';
import {
    Dimensions,
    Image,
    Platform,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';


const { width } = Dimensions.get('window');
const router = useRouter();


export default function Home() {
    useEffect(() => {
        const checkAuth = async () => {
            const token = await SecureStore.getItemAsync('userToken');
            if (token) {
                router.replace('/landing');
            }
        };

        checkAuth();
    }, []);

    return (
        <SafeAreaView style={styles.container}>

            {/* Logo */}
            <Image
                source={require('../assets/logo_orangeBlack.png')}
                style={styles.logo}
                resizeMode="contain"
            />

            {/* Hero Section */}
            <View style={styles.heroContainer}>
                <Image
                    source={require('../assets/vector.png')}
                    style={styles.heroImage}
                    resizeMode="cover"
                />
            </View>

            <View style={styles.fixedBottomSection}>
                <View style={styles.textBlock}>
                    <Text style={styles.headline}>UNLEASH YOUR GAME</Text>
                    <Text style={styles.subtext}>
                        Connect, compete, and thrive with athletes & fans in your city and beyond.
                    </Text>
                </View>

                {/* Buttons */}
                <View style={styles.buttonsContainer}>
                    <TouchableOpacity style={styles.fullButtonRow} onPress={() => router.push('/login')}>
                        <Image source={require('../assets/buttonBefore.png')} style={styles.sideRect} />
                        <View style={styles.loginButton}>
                            <Text style={styles.loginText}>LOGIN</Text>
                        </View>
                        <Image source={require('../assets/buttonAfter.png')} style={styles.sideRectAfter} />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.fullButtonRow} onPress={() => router.push('/register')}>
                        <Image source={require('../assets/buttonBeforeLight.png')} style={styles.sideRect} />
                        <View style={styles.createAccountButton}>
                            <Text style={styles.createAccountText}>CREATE ACCOUNT</Text>
                        </View>
                        <Image source={require('../assets/buttonAfterLight.png')} style={styles.sideRectAfter} />
                    </TouchableOpacity>
                </View>
            </View>

        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        width,
        height: '100%',
        backgroundColor: '#FAFAFA'
    },
    logo: {
        width: 195,
        height: 45,
        position: 'absolute',
        top: Platform.OS == "ios" ? 60 : 40,
        left: 20,
        zIndex: 1,
    },
    heroContainer: {
        position: 'relative',
        width: width,
        top: 0,
        left: 0,
    },
    heroImage: {
        position: 'relative',
        // top: 12,
        // left: 0,
        width: width,
        aspectRatio: 390 / 470,
    },
    fixedBottomSection: {
        position: 'absolute',
        bottom: 50,
        left: 0,
        width: width,
        paddingLeft: 20,
        paddingRight: 20
    },
    textBlock: {
        position: 'relative',
        marginBottom: 20
    },
    headline: {
        fontSize: 64,
        fontFamily: 'Bebas',
        lineHeight: 64,
        color: '#150000',
    },
    subtext: {
        fontSize: 16,
        color: '#150000',
        fontFamily: 'Manrope',
        marginTop: 8,
    },
    buttonsContainer: {
        position: 'relative',
        // bottom: 30,
        // left: 20,
        // width: width - 40,
    },
    buttonRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 4,
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
    fullButtonRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 4,
    },
    loginButton: {
        flex: 1,
        backgroundColor: '#FF4000',
        height: 48,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loginText: {
        fontSize: 20,
        color: 'white',
        fontFamily: 'Bebas',
    },
    createAccountButton: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.05)',
        height: 48,
        justifyContent: 'center',
        alignItems: 'center',
    },
    createAccountText: {
        fontSize: 20,
        color: '#150000',
        fontFamily: 'Bebas',
    },
});

