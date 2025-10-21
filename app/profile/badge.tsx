import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { jwtDecode } from "jwt-decode";
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    Image,
    KeyboardAvoidingView, Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';


const { width } = Dimensions.get('window');


export default function Badge() {
    const router = useRouter();
    const [userId, setUserId] = useState(null);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);
    const [buying, setBuying] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [expanded, setExpanded] = useState<string | null>(null);
    const productId = "riyadah_badge";

    useEffect(() => {
        const fetchUser = async () => {
            setLoading(true)
            const token = await SecureStore.getItemAsync('userToken');
            if (token) {
                const decodedToken = jwtDecode(token);
                console.log("DECODED: ", decodedToken)
                setUserId(decodedToken.userId);

                const response = await fetch(`http://193.187.132.170:5000/api/users/${decodedToken.userId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (response.ok) {
                    const user = await response.json();
                    setUser(user)
                    setLoading(false)
                } else {
                    console.error('API error')
                }
            }
        };

        fetchUser();

    }, []);

    const toggleFAQ = (key: string) => {
        setExpanded(expanded === key ? null : key);
    };

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
                            router.back()
                        }}
                        style={styles.backBtn}
                    >
                        <Ionicons name="chevron-back" size={20} color="#ffffff" />
                        <Text style={styles.backBtnText}>Back</Text>
                    </TouchableOpacity>

                    <View style={styles.headerTextBlock}>
                        <Text style={styles.pageTitle}>Get a Riyadah badge</Text>
                        {!loading && user && <Text style={styles.pageDesc}>{user?.name}</Text>}

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

                    <Text style={styles.ghostText}>badge</Text>

                    {user && !loading && <View style={styles.profileImage}>
                        {(user.image == null || user.image == "") && (user.type == "Club" || user.type == "Association") && <Image
                            source={require('../../assets/clublogo.png')}
                            style={styles.profileImageAvatar}
                            resizeMode="contain"
                        />}
                        {(user.image == null || user.image == "") && user.gender == "Male" && <Image
                            source={require('../../assets/avatar.png')}
                            style={styles.profileImageAvatar}
                            resizeMode="contain"
                        />}
                        {(user.image == null || user.image == "") && user.gender == "Female" && <Image
                            source={require('../../assets/avatarF.png')}
                            style={styles.profileImageAvatar}
                            resizeMode="contain"
                        />}
                        {user.image != null && <Image
                            source={{ uri: user.image }}
                            style={styles.profileImageAvatar}
                            resizeMode="contain"
                        />}
                    </View>}
                </View>

                {user && !loading && <ScrollView>
                    <View style={styles.contentContainer}>
                        {error != null && <View style={styles.error}>
                            <View style={styles.errorIcon}></View>
                            <Text style={styles.errorText}>{error}</Text>
                        </View>}

                        {/* Already has badge */}
                        {user.accountBadge && (
                            <View style={{ alignItems: 'center', marginTop: 30 }}>
                                <Ionicons name="checkmark-circle" size={80} color="#009933" />
                                <Text style={[styles.pageTitle, { color: "#009933", marginTop: 10 }]}>
                                    Congratulations!
                                </Text>
                                <Text style={[styles.paragraph, { textAlign: 'center' }]}>
                                    Your account is officially verified with Riyadah badge. This helps you stand out,
                                    gain trust, and show authenticity in our community.
                                </Text>

                                <View style={{ marginTop: 20, backgroundColor: "#f4f4f4", padding: 15, borderRadius: 10 }}>
                                    <Text style={[styles.subtitle, { marginBottom: 10 }]}>Your benefits:</Text>
                                    <Text style={styles.paragraph}>• Increased visibility in search results</Text>
                                    <Text style={styles.paragraph}>• More trust from other users</Text>
                                    <Text style={styles.paragraph}>• Priority support</Text>
                                </View>
                            </View>
                        )}

                        {/* Doesn’t have badge */}
                        {!user.accountBadge && (
                            <View>
                                <Text style={styles.title}>Why get a Riyadah badge?</Text>
                                <Text style={styles.paragraph}>
                                    The Riyadah badge is a mark of authenticity. It shows that your account is verified and
                                    is the real deal, helping you stand out and be trusted.
                                </Text>

                                <View style={{ marginTop: 30 }}>
                                    <Text style={styles.title}>Benefits of verification</Text>
                                    <Text style={styles.paragraph}>• Build credibility and trust</Text>
                                    <Text style={styles.paragraph}>• Higher visibility and engagement</Text>
                                    <Text style={styles.paragraph}>• Distinguish yourself from other/fake accounts</Text>
                                    <Text style={styles.paragraph}>• Access to exclusive features (coming soon)</Text>
                                </View>

                                <View style={{ marginTop: 30 }}>
                                    <Text style={styles.title}>Accounts with the Riyadah badge have:</Text>

                                    <View style={{ marginTop: 10 }}>
                                        <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 10, marginBottom: 20 }}>
                                            <Text style={styles.statNumber}>+85%</Text>
                                            <Text style={[styles.paragraph, { flex: 3 }]}>
                                                Higher chance of attracting sponsors and partnerships
                                            </Text>
                                        </View>
                                        <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 10, marginBottom: 20 }}>
                                            <Text style={styles.statNumber}>+72%</Text>
                                            <Text style={[styles.paragraph, { flex: 3 }]}>
                                                More visibility and priority with scouts and recruiters
                                            </Text>
                                        </View>
                                        <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 10 }}>
                                            <Text style={styles.statNumber}>3x</Text>
                                            <Text style={[styles.paragraph, { flex: 3 }]}>
                                                More likely to be discovered in search results
                                            </Text>
                                        </View>
                                    </View>
                                </View>

                                <View style={{ marginTop: 30 }}>
                                    <Text style={styles.title}>FAQ</Text>

                                    {/* Question 1 */}
                                    <View style={{ borderBottomWidth: 1, paddingVertical: 8, borderBottomColor: '#ddd' }}>
                                        <TouchableOpacity onPress={() => toggleFAQ("q1")} style={styles.faqQuestion}>
                                            <Text style={[styles.subtitle, { flex: 1, fontFamily: 'Bebas', fontSize: 18 }]}>Why should I buy the Riyadah badge?</Text>
                                            <Ionicons
                                                name={expanded === "q1" ? "chevron-up" : "chevron-down"}
                                                size={20}
                                                color="black"
                                            />
                                        </TouchableOpacity>
                                        {expanded === "q1" && (
                                            <Text style={styles.paragraph}>
                                                A Riyadah badge gives you instant credibility, helps you stand out,
                                                and proves your account is authentic — trusted by sponsors, scouts,
                                                and the community.
                                            </Text>
                                        )}
                                    </View>

                                    {/* Question 2 */}
                                    <View style={{ borderBottomWidth: 1, paddingVertical: 8, borderBottomColor: '#ddd' }}>
                                        <TouchableOpacity onPress={() => toggleFAQ("q2")} style={styles.faqQuestion}>
                                            <Text style={[styles.subtitle, { flex: 1, fontFamily: 'Bebas', fontSize: 18 }]}>How long does it last?</Text>
                                            <Ionicons
                                                name={expanded === "q2" ? "chevron-up" : "chevron-down"}
                                                size={20}
                                                color="black"
                                            />
                                        </TouchableOpacity>
                                        {expanded === "q2" && (
                                            <Text style={styles.paragraph}>
                                                The badge is permanent and stays with your account — as long as you
                                                follow our community guidelines.
                                            </Text>
                                        )}
                                    </View>

                                    {/* Question 3 */}
                                    <View style={{ borderBottomWidth: 1, paddingVertical: 8, borderBottomColor: '#ddd' }}>
                                        <TouchableOpacity onPress={() => toggleFAQ("q3")} style={styles.faqQuestion}>
                                            <Text style={[styles.subtitle, { flex: 1, fontFamily: 'Bebas', fontSize: 18 }]}>Can I lose my badge?</Text>
                                            <Ionicons
                                                name={expanded === "q3" ? "chevron-up" : "chevron-down"}
                                                size={20}
                                                color="black"
                                            />
                                        </TouchableOpacity>
                                        {expanded === "q3" && (
                                            <Text style={styles.paragraph}>
                                                Yes — if your account engages in suspicious, misleading, or
                                                fraudulent activity, the badge may be revoked.
                                            </Text>
                                        )}
                                    </View>
                                </View>

                                <View style={{ marginTop: 40, alignItems: 'center' }}>
                                    <Text style={[styles.title, { marginBottom: 10 }]}>
                                        Get verified today
                                    </Text>
                                    <Text style={styles.paragraph}>One-time purchase - only $9.99</Text>
                                    <TouchableOpacity
                                        style={{
                                            width: width - 40,
                                            marginTop: 20,
                                            backgroundColor: '#FF4000',
                                            paddingVertical: 15,
                                            paddingHorizontal: 30,
                                            borderRadius: 10,
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: 5
                                        }}
                                        onPress={() => console.log()}
                                        disabled={true}
                                    >
                                        <Text style={{ color: '#fff', fontFamily: 'Bebas', fontSize: 20, textAlign: 'center' }}>
                                            Coming soon
                                        </Text>
                                    </TouchableOpacity>

                                </View>
                            </View>
                        )}

                    </View>
                </ScrollView>
                }
            </View >
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
        height: '100%',
    },
    contentContainer: {
        padding: 20,
        paddingBottom: 130
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
    pageDesc: {
        color: '#ffffff',
        fontSize: 16,
        fontFamily: 'Manrope'
    },
    entity: {
        marginBottom: 20
    },
    title: {
        fontFamily: "Bebas",
        fontSize: 22,
        color: 'black'
    },
    subtitle: {
        fontFamily: "Manrope",
        fontSize: 16,
        // fontWeight: 600,
        width: '100%',
        textTransform: 'capitalize',
        color: 'black'
    },
    paragraph: {
        fontFamily: "Manrope",
        fontSize: 16,
        color: 'black'
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
    profileImage: {
        position: 'absolute',
        bottom: 0,
        right: -5,
        height: '70%',
        maxWidth: 200,
        overflow: 'hidden',
    },
    profileImageAvatar: {
        height: '100%',
        width: undefined,
        aspectRatio: 1,
        resizeMode: 'contain',
    },
    profileActions: {
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.2)',
        paddingTop: 10
    },
    inlineActions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        columnGap: 15
    },
    profileButton: {
        borderRadius: 5,
        padding: 5,
        paddingHorizontal: 10,
        backgroundColor: 'rgba(0,0,0,0.05)',
        marginBottom: 10
    },
    savebtn: {
        flexDirection: 'row'
    },
    profileButtonText: {
        fontSize: 16,
        color: '#150000',
        fontFamily: 'Bebas',
    },
    input: {
        fontSize: 14,
        padding: 15,
        backgroundColor: '#F4F4F4',
        marginBottom: 16,
        color: 'black',
        borderRadius: 10
    },
    saveLoaderContainer: {
        marginLeft: 10
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
    verifiedbadge: {
        color: '#009933',
    },
    otpInput: {
        borderWidth: 1,
        aspectRatio: 0.76,
        flex: 1,
        textAlign: "center",
        fontSize: 40,
        borderRadius: 10,
        marginHorizontal: 5,
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
    statNumber: {
        fontSize: 44,
        fontFamily: 'Bebas',
        color: '#FF4000',
        textAlign: 'center',
        flex: 1
    },
    faqQuestion: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
});
