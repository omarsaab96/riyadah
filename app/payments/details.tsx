import Ionicons from '@expo/vector-icons/Ionicons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { jwtDecode } from 'jwt-decode';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

const { width } = Dimensions.get('window');

export default function PaymentDetails() {
    const router = useRouter();
    const [userId, setUserId] = useState(null);
    const [user, setUser] = useState(null);
    const [payment, setPayment] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const { id } = useLocalSearchParams();

    useEffect(() => {
        const fetchUser = async () => {
            const token = await SecureStore.getItemAsync('userToken');

            console.log(token)
            if (token) {
                const decodedToken = jwtDecode(token);
                console.log("DECODED: ", decodedToken)
                setUserId(decodedToken.userId);

                const response = await fetch(`https://riyadah.onrender.com/api/users/${decodedToken.userId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (response.ok) {
                    const user = await response.json();
                    setUser(user)
                } else {
                    console.error('API error')
                }
                // setLoading(false)
            } else {
                console.log("no token",)
            }
        };

        const fetchPayment = async () => {
            try {
                const token = await SecureStore.getItemAsync('userToken');
                if (!token) {
                    setError('Authentication token missing');
                    return;
                }

                const res = await fetch(`https://riyadah.onrender.com/api/financials/${id}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                const data = await res.json();

                if (res.ok) {
                    setPayment(data.data);
                } else {
                    setError(data.message || 'Failed to fetch payment details');
                }
            } catch (err) {
                console.error('Error fetching payment:', err);
                setError('Something went wrong while fetching payment');
            } finally {
                setLoading(false);
            }
        };

        fetchPayment();
        fetchUser();
    }, [id]);

    const settlePayment = async () => {
        try {
            const token = await SecureStore.getItemAsync('userToken');
            const res = await fetch(`https://riyadah.onrender.com/api/financials/${payment._id}/pay`, {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const data = await res.json();

            if (res.ok) {
                router.replace({
                    pathname: '/profile',
                    params: { tab: 'Financials' }
                })
            } else {
                alert(data.message || 'Failed to settle payment');
            }
        } catch (err) {
            console.error('Error settling payment:', err);
            alert('Error settling payment');
        }
    }

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1 }}
        >
            <View style={styles.container}>
                <View style={styles.pageHeader}>
                    {/* <Image
                        source={require('../../assets/logo_white.png')}
                        style={styles.logo}
                        resizeMode="contain"
                    /> */}

                    <TouchableOpacity
                        onPress={() => {
                            router.replace({
                                pathname: '/profile',
                                params: { tab: 'Financials' }
                            })
                        }}
                        style={styles.backBtn}
                    >
                        <Ionicons name="chevron-back" size={20} color="#ffffff" />
                        <Text style={styles.backBtnText}>Back to financials</Text>
                    </TouchableOpacity>

                    <View style={styles.headerTextBlock}>
                        <Text style={styles.pageTitle}>Payment details</Text>

                        {!loading && <Text style={styles.pageDesc}>Payment# {payment._id}</Text>}

                        {loading &&
                            <View style={{ flexDirection: 'row', alignItems: 'center', paddingTop: 5 }}>
                                <ActivityIndicator
                                    size="small"
                                    color="#fff"
                                    style={{ transform: [{ scale: 1.25 }] }}
                                />
                            </View>
                        }
                    </View>

                    <Text style={styles.ghostText}>Payment</Text>
                </View>

                <ScrollView >

                    <View style={styles.contentContainer}>
                        {error != '' && <View style={styles.error}>
                            <View style={styles.errorIcon}></View>
                            <Text style={styles.errorText}>{error}</Text>
                        </View>}

                        {payment && (
                            <View>
                                <View style={{ marginBottom: 30 }}>
                                    <View style={[styles.row, { alignItems: 'center' }]}>
                                        <Text style={styles.title}>Status</Text>
                                        <Text style={[styles.value, { padding: 5, color: 'white', borderRadius: 5, backgroundColor: payment.paid ? '#009933' : '#FF4000' }]}>
                                            {payment.paid ? `Paid on ${new Date(payment.paidDate).toLocaleDateString()}` : 'Pending'}
                                        </Text>
                                    </View>

                                    {!payment.paid && <View style={styles.row}>
                                        <Text style={styles.title}>Due Date</Text>
                                        <Text style={styles.value}>
                                            {payment.dueDate ? new Date(payment.dueDate).toLocaleDateString() : 'N/A'}
                                        </Text>
                                    </View>}

                                    <View style={styles.row}>
                                        <Text style={styles.title}>Amount</Text>
                                        <Text style={styles.value}>${payment.amount}</Text>
                                    </View>
                                </View>

                                <View>
                                    {payment.note && (
                                        <View style={{ marginBottom: 30 }}>
                                            <Text style={styles.title}>Note</Text>
                                            <Text style={styles.value}>{payment.note}</Text>
                                        </View>
                                    )}

                                    {payment.user && (
                                        <View style={{ marginVertical: 20 }}>
                                            <Text style={[styles.title, { marginBottom: 10 }]}>payable</Text>
                                            <View>
                                                <TouchableOpacity
                                                    style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#eeeeee', paddingVertical: 10, borderRadius: 8 }}
                                                    onPress={() => router.push({
                                                        pathname: '/profile/public',
                                                        params: { id: payment.user._id },
                                                    })}>
                                                    <View style={{ backgroundColor: '#FF4000', borderRadius: 30, width: 60, height: 60, overflow: 'hidden', marginRight: 20 }}>

                                                        {payment.user.image ? (
                                                            <Image
                                                                source={{ uri: payment.user.image }}
                                                                style={{ width: '100%', aspectRatio: 1 }}
                                                            />
                                                        ) : (
                                                            payment.user.gender == "Male" ? (
                                                                <Image
                                                                    style={{
                                                                        height: '100%',
                                                                        width: undefined,
                                                                        aspectRatio: 1,
                                                                        resizeMode: 'contain',
                                                                    }}
                                                                    source={require('../../assets/avatar.png')}
                                                                    resizeMode="contain"
                                                                />
                                                            ) : (
                                                                <Image
                                                                    style={{
                                                                        height: '100%',
                                                                        width: undefined,
                                                                        aspectRatio: 1,
                                                                        resizeMode: 'contain',
                                                                    }}
                                                                    source={require('../../assets/avatarF.png')}
                                                                    resizeMode="contain"
                                                                />
                                                            )
                                                        )}
                                                    </View>


                                                    <View style={{ flex: 1, flexShrink: 1, width: '100%' }}>

                                                        <Text
                                                            style={[styles.paragraph, { fontWeight: 'bold' }]}
                                                            numberOfLines={1}
                                                            ellipsizeMode="tail"
                                                        >
                                                            {payment.user.name}
                                                        </Text>

                                                        <Text
                                                            style={[styles.paragraph, { fontSize: 14, opacity: 0.5, marginBottom: 10 }]}
                                                            numberOfLines={1}
                                                            ellipsizeMode="tail"
                                                        >
                                                            {payment.user.email}
                                                        </Text>


                                                    </View>
                                                </TouchableOpacity>
                                            </View>

                                        </View>
                                    )}

                                    {/* <View style={{ marginBottom: 30 }}>
                                        <Text style={styles.title}>Club</Text>
                                        <Text style={styles.value}>{payment.club?.name}</Text>
                                    </View> */}

                                    {payment.club && (
                                        <View style={{ marginVertical: 20 }}>
                                            <Text style={[styles.title, { marginBottom: 10 }]}>Recipient</Text>
                                            <View>
                                                <TouchableOpacity
                                                    style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#eeeeee', paddingVertical: 10, borderRadius: 8 }}
                                                    onPress={() => router.push({
                                                        pathname: '/profile/public',
                                                        params: { id: payment.club._id },
                                                    })}>
                                                    <View style={{ backgroundColor: '#FF4000', borderRadius: 30, width: 60, height: 60, overflow: 'hidden', marginRight: 20 }}>
                                                        {payment.club.image ? (
                                                            <Image
                                                                source={{ uri: payment.club.image }}
                                                                style={{ width: '100%', aspectRatio: 1 }}
                                                                resizeMode="cover"
                                                            />
                                                        ) : (
                                                            <Image
                                                                source={require('../../assets/clublogo.png')}
                                                                style={{
                                                                    height: '100%',
                                                                    width: undefined,
                                                                    aspectRatio: 1,
                                                                    resizeMode: 'contain',
                                                                }}
                                                                resizeMode="cover"
                                                            />
                                                        )}
                                                    </View>

                                                    <View style={{ flex: 1, flexShrink: 1, width: '100%' }}>

                                                        <Text
                                                            style={[styles.paragraph, { fontWeight: 'bold' }]}
                                                            numberOfLines={1}
                                                            ellipsizeMode="tail"
                                                        >
                                                            {payment.club.name}
                                                        </Text>

                                                        <Text
                                                            style={[styles.paragraph, { fontSize: 14, opacity: 0.5, marginBottom: 10 }]}
                                                            numberOfLines={1}
                                                            ellipsizeMode="tail"
                                                        >
                                                            {payment.club.sport.toString().replaceAll(',', ', ')}
                                                        </Text>


                                                    </View>
                                                </TouchableOpacity>
                                            </View>

                                        </View>
                                    )}
                                </View>
                            </View>
                        )}
                    </View>
                </ScrollView >

                {payment && !payment.paid && (
                    <View style={styles.fixedBottomSection}>
                        <TouchableOpacity style={styles.fullButtonRow} onPress={settlePayment}>
                            <Image source={require('../../assets/buttonBefore_black.png')} style={styles.sideRect} />
                            <View style={styles.loginButton}>
                                <Text style={styles.loginText}>Settle Payment</Text>
                            </View>
                            <Image source={require('../../assets/buttonAfter_black.png')} style={styles.sideRectAfter} />
                        </TouchableOpacity>
                    </View>
                )}

            </View >
        </KeyboardAvoidingView >
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
        height: '100%'
    },
    contentContainer: {
        padding: 20,
        paddingBottom: 130
    },
    backBtn: {
        position: 'absolute',
        top: 60,
        left: 10,
        width: 200,
        zIndex: 1,
        flexDirection: 'row',
        alignContent: 'center',
    },
    backBtnText: {
        color: '#FFF',
        fontSize: 18,
        fontFamily: 'Bebas'
    },
    saveLoaderContainer: {
        marginLeft: 10
    },

    savebtn: {
        flexDirection: 'row'
    },
    pageHeader: {
        backgroundColor: '#FF4000',
        height: 270,
        // marginBottom: 30
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
    },
    inputFocused: {
        color: '#fff',
        paddingRight: 30,
        marginBottom: 5,
        lineHeight: 25,
        borderBottomWidth: 1,
        borderColor: '#fff',
    },
    pageDesc: {
        color: '#ffffff',
        fontSize: 16,
        fontFamily: 'Manrope'
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    headerTitle: {
        fontFamily: 'Bebas',
        fontSize: 24,
        color: '#111',
    },
    inputContainer: {
        marginBottom: 20,
    },
    input: {
        fontSize: 14,
        padding: 15,
        backgroundColor: '#F4F4F4',
        marginBottom: 16,
        color: 'black',
        borderRadius: 10
    },
    inputError: {
        borderColor: '#FF4000',
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
    title: {
        fontFamily: "Bebas",
        fontSize: 20,
        color: 'black'
    },
    subtitle: {
        fontFamily: "Manrope",
        fontSize: 16,
        fontWeight: 'bold'
    },
    paragraph: {
        fontFamily: "Manrope",
        fontSize: 16,
        color: 'black'
    },
    profileLink: {
        color: '#FF4000',
        fontSize: 14,
        fontFamily: 'Manrope'
    },
    locationLink: {
        backgroundColor: '#cccccc',
        borderRadius: 8,
        paddingVertical: 5
    },
    locationLinkText: {
        color: '#000',
        fontFamily: 'Bebas',
        fontSize: 20,
        textAlign: 'center'
    },
    editToggle: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5
    },
    editToggleText: {
        color: 'black',
        fontFamily: 'Bebas',
        fontSize: 18
    },
    sectionTitle: {
        fontFamily: 'Bebas',
        fontSize: 24,
        color: '#111',
        marginBottom: 10
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10
    },
    label: {
        fontFamily: 'Manrope',
        fontSize: 16,
        color: '#777'
    },
    value: {
        fontFamily: 'Manrope',
        fontSize: 16,
        color: '#111'
    },
    payButton: {
        backgroundColor: '#cccccc',
        borderRadius: 8,
        paddingVertical: 5
    },
    payButtonText: {
        color: '#000',
        fontFamily: 'Bebas',
        fontSize: 20,
        textAlign: 'center'
    },
    fixedBottomSection: {
        position: 'absolute',
        bottom: 60,
        left: 0,
        width: width,
        paddingLeft: 20,
        paddingRight: 20
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
});
