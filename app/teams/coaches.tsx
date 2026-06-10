import AntDesign from '@expo/vector-icons/AntDesign';
import Entypo from '@expo/vector-icons/Entypo';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { jwtDecode } from 'jwt-decode';
import { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Animated,
    Dimensions,
    Easing,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { useLanguage } from '../../context/language';

const { width } = Dimensions.get('window');

export default function Coaches() {
    const router = useRouter();
    const { isRTL, t } = useLanguage();
    const [userId, setUserId] = useState(null);
    const [user, setUser] = useState(null);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [team, setTeam] = useState(null);
    const [loading, setLoading] = useState(true);
    const [addingCoach, setaddingCoach] = useState<string[]>([]);
    const [keyword, setKeyword] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searching, setSearching] = useState(false);
    const [openSearch, setOpenSearch] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [debounceTimeout, setDebounceTimeout] = useState(null);
    const [removingCoach, setremovingCoach] = useState<string[]>([]);
    const [loadingRemove, setLoadingRemove] = useState<string[]>([]);
    const animatedValues = useRef<{ [key: string]: Animated.Value }>({});
    const flexDivRef = useRef(null);
    const [cellWidth, setCellWidth] = useState(0);
    const [cellHeight, setCellHeight] = useState(0);

    const handleLayout = (event) => {
        const { width } = event.nativeEvent.layout;
        const { height } = event.nativeEvent.layout;
        setCellWidth(width);
        setCellHeight(height);
    };

    const { id } = useLocalSearchParams();

    useEffect(() => {
        const fetchUser = async () => {
            const token = await SecureStore.getItemAsync('userToken');

            console.log(token)
            if (token) {
                const decodedToken = jwtDecode(token);
                console.log("DECODED: ", decodedToken)
                setUserId(decodedToken.userId);

                const response = await fetch(`https://server.riyadah.app/api/users/${decodedToken.userId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (response.ok) {
                    const user = await response.json();
                    setUser(user)

                    if (user.role == "Coach") {
                        const coachteams = await fetch(`https://server.riyadah.app/api/teams/byCoach/${user._id}`);

                        if (coachteams.ok) {
                            const coachdata = await coachteams.json();
                            setUserCoachOf(coachdata.data);
                        } else {
                            console.log('Could not get teams of coach');
                        }
                    }
                } else {
                    console.error('API error')
                }
                // setLoading(false)
            } else {
                console.log("no token",)
            }
        };

        fetchUser();
    }, [id]);

    useEffect(() => {
        const fetchTeam = async () => {
            try {
                const response = await fetch(`https://server.riyadah.app/api/teams/${id}`);

                if (response.ok) {
                    const userData = await response.json();
                    setTeam(userData.data);
                } else {
                    console.error('API error');
                }
            } catch (error) {
                console.error('Failed to fetch user:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchTeam();
    }, [user]);

    const handleSearchInput = (text: string) => {
        setKeyword(text);
        if (text.trim().length < 3) {
            setSearchResults([]);
            return;
        }

        // Clear previous timeout
        if (debounceTimeout) clearTimeout(debounceTimeout);

        // Set new debounce timeout
        const timeout = setTimeout(() => {
            if (text.trim().length >= 3) {
                searchCoaches(text);
            } else {
                setSearchResults([]);
            }
        }, 500); // delay: 500ms

        setDebounceTimeout(timeout);
    };

    const searchCoaches = async (name: string) => {
        try {
            setSearching(true);
            const res = await fetch(`https://server.riyadah.app/api/users/search?keyword=${name}&role=Coach`);

            if (res.ok) {
                const data = await res.json();
                // console.log(data)
                setSearchResults(data); // expected array
            } else {
                console.error("Search failed");
                setSearchResults([]);
            }
        } catch (err) {
            console.error("Error during search:", err);
            setSearchResults([]);
        } finally {
            setSearching(false);
        }
    };

    const handleAddCoach = async (coach: any) => {
        setaddingCoach(prev => [...prev, coach._id]); // Add to array
        try {
            const alreadyCoach = team.coaches.some((m: any) => m._id === coach._id);
            if (alreadyCoach) {
                console.log('duplicate')
                setaddingCoach(prev => prev.filter(id => id !== coach._id));
                return;
            };

            const token = await SecureStore.getItemAsync('userToken');
            if (!token) {
                setError(t('teamManage.authMissing'));
                setaddingCoach(prev => prev.filter(id => id !== coach._id));
                return;
            }

            const res = await fetch(`https://server.riyadah.app/api/teams/${team._id}/coaches`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    coachIds: [coach._id], // sending as an array
                }),
            });

            const data = await res.json();

            if (res.ok) {
                setTeam(data.data);
                setaddingCoach(prev => prev.filter(id => id !== coach._id));
                animateRemoveBtn(coach._id, 0);
            } else {
                setaddingCoach(prev => prev.filter(id => id !== coach._id));
                console.error(data.message);
                setError(data.message || t('teamManage.failedAddCoach'));
            }
        } catch (err) {
            console.error('Error adding coach:', err);
            setError(t('teamManage.addCoachError'));
        }
    };

    const handleRemoveCoach = async (coachid: string) => {
        setLoadingRemove([...loadingRemove, coachid])

        try {
            const token = await SecureStore.getItemAsync('userToken');
            if (!token) {
                throw new Error(t('teamManage.authMissing'));
            }

            const res = await fetch(`https://server.riyadah.app/api/teams/${team._id}/remove-coaches`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    coachIds: [coachid],
                }),
            });

            const data = await res.json();

            if (res.ok) {
                setTeam(prev => ({
                    ...prev,
                    coaches: prev.coaches.filter(coach => coach._id !== coachid),
                }));
            } else {
                console.error(data.message || 'Failed to remove coach');
            }
        } catch (err) {
            setError(t('teamManage.removeCoachError'))
            console.log('Error removing coach:', err);
        } finally {
            setLoadingRemove(prev => prev.filter(_id => _id !== coachid));
            setremovingCoach(prev => prev.filter(_id => _id !== coachid));
        }
    }

    // Get or create animated value
    const getAnimatedValue = (coachId: string) => {
        if (!animatedValues.current[coachId]) {
            animatedValues.current[coachId] = new Animated.Value(0);
        }
        return animatedValues.current[coachId];
    };

    // Animate to 0 or 1
    const animateRemoveBtn = (coachId: string, toValue: number) => {
        const animVal = getAnimatedValue(coachId);
        Animated.timing(animVal, {
            toValue,
            duration: 300,
            easing: Easing.out(Easing.ease),
            useNativeDriver: false,
        }).start();
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
                        style={[styles.backBtn, isRTL && styles.backBtnRtl]}
                    >
                        <Ionicons name={isRTL ? "chevron-forward" : "chevron-back"} size={20} color="#ffffff" />
                        <Text style={styles.backBtnText}>{t('teamManage.back')}</Text>
                    </TouchableOpacity>

                    <View style={[styles.headerTextBlock, isRTL && styles.headerTextBlockRtl]}>
                        <Text style={[styles.pageTitle, isRTL ? styles.rtlText : styles.ltrText]}>{t('teamManage.coachesTitle')}</Text>
                        {!loading && <Text style={[styles.pageDesc, isRTL ? styles.rtlText : styles.ltrText]}>{t('teamManage.coachesDesc').replace('{name}', team?.name || '')}</Text>}

                        {loading &&
                            <View style={[styles.loaderRow, isRTL && styles.loaderRowRtl]}>
                                <ActivityIndicator
                                    size="small"
                                    color="#fff"
                                    style={{ transform: [{ scale: 1.25 }] }}
                                />
                            </View>
                        }
                    </View>

                    <Text style={[styles.ghostText, isRTL && styles.ghostTextRtl]}>{t('teamManage.coachesGhost')}</Text>

                    {!loading &&
                        <View style={[styles.profileImage, isRTL && styles.profileImageRtl]}>
                            {team?.image != null && <Image
                                source={{ uri: team?.image }}
                                style={styles.profileImageAvatar}
                                resizeMode="contain"
                            />}
                        </View>
                    }
                </View>

                <ScrollView >
                    <View style={styles.contentContainer}>
                        {error != '' && <View style={[styles.error,isRTL&&{flexDirection:'row-reverse'}]}>
                            <View style={[styles.errorIcon,isRTL&&{marginRight:0,marginLeft:15}]}></View>
                            <Text style={styles.errorText}>{error}</Text>
                        </View>}

                        {team && <View style={styles.profileSection}>
                            <View style={{ marginBottom: 20 }}>
                                <View style={[styles.sectionHeader, isRTL && styles.sectionHeaderRtl]}>
                                    <Text style={[styles.title, isRTL ? styles.rtlText : styles.ltrText]}>{t('teamDetails.coachCount').replace('{count}', String(team.coaches.length)).replace('{suffix}', team.coaches.length == 1 ? '' : 'es')}</Text>

                                    {user._id == userId && !editMode &&
                                        <TouchableOpacity style={styles.editToggle} onPress={() => { setKeyword(''); setEditMode(true) }}>
                                            <Entypo name="edit" size={16} color="#FF4000" />
                                            <Text style={styles.editToggleText}>{t('teamManage.edit')}</Text>
                                        </TouchableOpacity>}

                                    {user._id == userId && editMode &&
                                        <TouchableOpacity style={styles.editToggle} onPress={() => { setEditMode(false) }}>
                                            <AntDesign name="check" size={16} color="#FF4000" />
                                            <Text style={styles.editToggleText}>{t('teamManage.done')}</Text>
                                        </TouchableOpacity>}
                                </View>

                                {editMode && <View>
                                    <View style={{ marginBottom: 16 }}>
                                        <TextInput
                                            style={styles.input}
                                            placeholder={t('teamManage.addCoachPlaceholder')}
                                            placeholderTextColor="#A8A8A8"
                                            value={keyword}
                                            onChangeText={handleSearchInput}
                                            style={[styles.input, isRTL ? styles.rtlText : styles.ltrText]}
                                        />
                                        {searching &&
                                            <ActivityIndicator
                                                size="small"
                                                color="#FF4000"
                                            style={[styles.searchLoader, isRTL && { left: 10, right: 'auto' }]}
                                            />
                                        }
                                    </View>
                                    {keyword.trim().length >= 3 && !searching && (
                                        <View style={{ marginBottom: 15 }}>
                                            {searchResults.length > 0 && !searching &&
                                                searchResults.map((coach) => {
                                                    const alreadyCoach = team.coaches.some((m) => m._id === coach._id);

                                                    return (
                                                        <View key={coach._id}>
                                                            <TouchableOpacity
                                                                style={[styles.searchResultItem,isRTL&&{flexDirection:'row-reverse'}]}
                                                                onPress={() => !alreadyCoach && handleAddCoach(coach)}
                                                                disabled={alreadyCoach}
                                                            >
                                                                <View style={styles.searchResultItemImageContainer}>
                                                                    {coach.image ? (
                                                                        <Image
                                                                            style={styles.searchResultItemImage}
                                                                            source={{ uri: coach.image }}
                                                                        />
                                                                    ) : (

                                                                        coach.gender == "Male" ? (
                                                                            <Image
                                                                                style={styles.searchResultItemImage}
                                                                                source={require('../../assets/avatar.png')}
                                                                                resizeMode="contain"
                                                                            />
                                                                        ) : (
                                                                            <Image
                                                                                style={styles.searchResultItemImage}
                                                                                source={require('../../assets/avatarF.png')}
                                                                                resizeMode="contain"
                                                                            />
                                                                        )


                                                                    )}
                                                                </View>
                                                                <View style={[styles.searchResultItemInfo, isRTL && styles.searchResultItemInfoRtl]}>
                                                                    <View>
                                                                        <Text style={[styles.searchResultItemName, isRTL ? styles.rtlText : styles.ltrText]}>{coach.name}</Text>
                                                                        <Text style={[styles.searchResultItemDescription, coach.sport == null && { opacity: 0.5, fontStyle: 'italic' }, isRTL ? styles.rtlText : styles.ltrText]}>{coach.sport || t('teamManage.noSport')}</Text>
                                                                    </View>
                                                                    {addingCoach.includes(coach._id) ? (
                                                                        <ActivityIndicator
                                                                            size="small"
                                                                            color="#FF4000"
                                                                        />
                                                                    ) : (
                                                                        <Text
                                                                            style={
                                                                                [
                                                                                    styles.searchResultItemLink,
                                                                                    alreadyCoach && { color: 'gray', fontStyle: 'italic' }
                                                                                ]
                                                                            }
                                                                        >
                                                                            {alreadyCoach ? t('teamManage.alreadyCoach') : t('teamManage.addAsCoach')}
                                                                        </Text>
                                                                    )}

                                                                </View>
                                                            </TouchableOpacity>
                                                        </View>
                                                    );
                                                })
                                            }

                                            {searchResults.length == 0 && !searching &&
                                                        <View>
                                                    <Text style={[styles.searchNoResultText, { marginBottom: 15 }, isRTL ? styles.rtlText : styles.ltrText]}>
                                                        {t('teamManage.noResults')}
                                                    </Text>
                                                </View>
                                            }
                                        </View>
                                    )}
                                </View>}

                                {team.coaches && team.coaches.length > 0 ? (
                                    <View style={{ marginBottom: 20 }}>
                                        <View style={[styles.peopleGrid, isRTL && styles.peopleGridRtl]}>
                                            {team.coaches.map((coach) => {
                                                const animVal = getAnimatedValue(coach._id);
                                                const animatedWidth = animVal.interpolate({
                                                    inputRange: [0, 1],
                                                    outputRange: [25, cellWidth],
                                                });
                                                const animatedHeight = animVal.interpolate({
                                                    inputRange: [0, 1],
                                                    outputRange: [25, cellHeight],
                                                });
                                                const animatedColor = animVal.interpolate({
                                                    inputRange: [0, 0],
                                                    outputRange: ['#FF4000', '#000000'],
                                                });
                                                const animatedPositionTopLeft = animVal.interpolate({
                                                    inputRange: [0, 1],
                                                    outputRange: [-5, 0],
                                                });
                                                const animatedRadius = animVal.interpolate({
                                                    inputRange: [0, 1],
                                                    outputRange: [15, 8],
                                                });
                                                const animatedOpacity = animVal.interpolate({
                                                    inputRange: [0, 1],
                                                    outputRange: [0, 1],
                                                });

                                                return (
                                                    <View
                                                        ref={flexDivRef}
                                                        onLayout={handleLayout}
                                                        key={coach._id}
                                                        style={{
                                                            alignItems: 'center',
                                                            width: '30.64%',
                                                            position: 'relative',
                                                        }}
                                                    >
                                                        {user._id == userId && editMode && (
                                                            <Animated.View
                                                                style={{
                                                                    width: animatedWidth,
                                                                    height: animatedHeight,
                                                                    backgroundColor: animatedColor,
                                                                    borderRadius: animatedRadius,
                                                                    position: 'absolute',
                                                                    top: animatedPositionTopLeft,
                                                                    left: animatedPositionTopLeft,
                                                                    zIndex: 2,
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center',
                                                                }}
                                                            >
                                                                {removingCoach.includes(coach._id) ? (
                                                                    <View style={{ justifyContent: 'space-between', alignItems: 'center' }}>
                                                                        {loadingRemove.includes(coach._id) ? (
                                                                            <ActivityIndicator size="small" color={'#FF4000'} style={{ transform: [{ scale: 1.5 }] }} />
                                                                        ) : (
                                                                            <Animated.View style={{
                                                                                opacity: animatedOpacity,
                                                                                alignItems: 'center',
                                                                                justifyContent: 'center'
                                                                            }}>
                                                                                <Text style={{ color: '#FF4000', fontFamily: 'Qatar', fontSize: 22, marginBottom: 30 }}>
                                                                                    {t('teamManage.sure')}
                                                                                </Text>
                                                                                <View style={[styles.confirmRow, isRTL && styles.confirmRowRtl]}>
                                                                                    <TouchableOpacity onPress={() => handleRemoveCoach(coach._id)}>
                                                                                        <Text
                                                                                            style={{
                                                                                                fontFamily: 'Qatar',
                                                                                                fontSize: 22,
                                                                                                color: '#000',
                                                                                                paddingHorizontal: 5,
                                                                                                backgroundColor: '#6ef99dff',
                                                                                                borderRadius: 5,
                                                                                            }}
                                                                                        >
                                                                                            {t('teamManage.yes')}
                                                                                        </Text>
                                                                                    </TouchableOpacity>
                                                                                    <TouchableOpacity
                                                                                        onPress={() => {
                                                                                            animateRemoveBtn(coach._id, 0);
                                                                                            setremovingCoach((prev) => prev.filter((id) => id !== coach._id));
                                                                                        }}
                                                                                    >
                                                                                        <Text
                                                                                            style={{
                                                                                                fontFamily: 'Qatar',
                                                                                                fontSize: 22,
                                                                                                color: '#000',
                                                                                                paddingHorizontal: 8,
                                                                                                backgroundColor: '#f97d7dff',
                                                                                                borderRadius: 5,
                                                                                            }}
                                                                                        >
                                                                                            {t('teamManage.no')}
                                                                                        </Text>
                                                                                    </TouchableOpacity>
                                                                                </View>
                                                                            </Animated.View>
                                                                        )}
                                                                    </View>
                                                                ) : (
                                                                    <TouchableOpacity
                                                                        onPress={() => {
                                                                            setremovingCoach((prev) => [...prev, coach._id]);
                                                                            animateRemoveBtn(coach._id, 1);
                                                                        }}
                                                                    >
                                                                        <AntDesign name="closecircle" size={25} color="#000" />
                                                                    </TouchableOpacity>
                                                                )}
                                                            </Animated.View>
                                                        )}

                                                        <TouchableOpacity
                                                            style={{
                                                                alignItems: 'center',
                                                                padding: 10,
                                                                borderRadius: 8,
                                                                backgroundColor: '#eeeeee',
                                                            }}
                                                            onPress={() =>
                                                                router.push({
                                                                    pathname: '/profile/public',
                                                                    params: { id: coach._id },
                                                                })
                                                            }
                                                        >
                                                            <View style={{ marginBottom: 10 }}>
                                                                {coach.image ? (
                                                                    <View
                                                                        style={[
                                                                            styles.searchResultItemImageContainer,
                                                                            {
                                                                                width: '100%',
                                                                                backgroundColor: '#dddddd',
                                                                                borderRadius: 100,
                                                                                overflow: 'hidden',
                                                                            },
                                                                        ]}
                                                                    >
                                                                        <Image
                                                                            source={{ uri: coach.image }}
                                                                            style={{ width: '100%', aspectRatio: 1 }}
                                                                        />
                                                                    </View>
                                                                ) : (
                                                                    <View
                                                                        style={[
                                                                            styles.searchResultItemImageContainer,
                                                                            {
                                                                                width: '100%',
                                                                                backgroundColor: '#dddddd',
                                                                                borderRadius: 100,
                                                                                overflow: 'hidden',
                                                                            },
                                                                        ]}
                                                                    >
                                                                        <Image
                                                                            style={styles.searchResultItemImage}
                                                                            source={
                                                                                coach.gender == 'Male'
                                                                                    ? require('../../assets/avatar.png')
                                                                                    : require('../../assets/avatarF.png')
                                                                            }
                                                                            resizeMode="contain"
                                                                        />
                                                                    </View>
                                                                )}
                                                            </View>
                                                            <Text style={[styles.personName, isRTL ? styles.rtlText : styles.ltrText]}>{coach?.name?.trim()}</Text>
                                                        </TouchableOpacity>
                                                    </View>
                                                );
                                            })}
                                        </View>
                                    </View>

                                ) : (
                                    <Text style={[styles.paragraph, isRTL ? styles.rtlText : styles.ltrText]}>{t('teamDetails.noCoaches')}</Text>
                                )}
                            </View>
                        </View>}
                    </View>
                </ScrollView >


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
    saveLoaderContainer: {
        marginLeft: 10
    },
    profileButton: {
        borderRadius: 5,
        padding: 10,
        backgroundColor: 'rgba(0,0,0,0.05)',
        marginBottom: 10
    },
    profileButtonText: {textTransform:'uppercase',
        fontSize: 16,
        color: '#150000',
        fontFamily: 'Qatar',
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
        width: 120 ,
        height:40,
        position: 'absolute',
top: Platform.OS == 'ios' ? 60 : 40,
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
        left: 'auto',
        right: 20,
        maxWidth:200
    },
    pageTitle: {
        color: '#ffffff',
        fontFamily: 'Qatar',
        fontSize: 30,
    },
    pageDesc: {
        color: '#ffffff',
        fontSize: 16,
        fontFamily: 'Acumin'
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
        fontFamily: 'Qatar',
        fontSize: 24,
        color: '#111',
    },
    formContainer: {
        padding: 20,
    },
    imageUploadContainer: {
        // alignItems: 'center',
        marginBottom: 25,
    },
    imageUploadButton: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#f5f5f5',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        borderWidth: 2,
        borderColor: '#FF4000',
    },
    imagePlaceholder: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    imageUploadText: {
        marginTop: 10,
        fontFamily: 'Acumin',
        fontSize: 14,
        color: '#FF4000',
    },
    teamImage: {
        width: '100%',
        height: '100%',
    },
    inputContainer: {
        marginBottom: 20,
    },
    label: {
        fontFamily: "Qatar",
        fontSize: 20,
        marginBottom: 10
    },
    input: {
        fontSize: 14,
        padding: 15,
        backgroundColor: '#F4F4F4',
        // marginBottom: 16,
        color: 'black',
        borderRadius: 10
    },
    inputError: {
        borderColor: '#FF4000',
    },
    pickerContainer: {
        borderRadius: 8,
        overflow: 'hidden',
    },
    picker: {
        width: '100%',
        fontFamily: 'Acumin',
        borderWidth: 0,
        backgroundColor: '#F4F4F4',
    },
    submitButton: {
        backgroundColor: '#FF4000',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 20,
    },
    submitButtonText: {
        color: '#fff',
        fontFamily: 'Qatar',
        fontSize: 20,
    },
    ghostText: {
        fontSize:100,textTransform:'uppercase',
        fontFamily: 'Qatar',
        position: 'absolute',
        bottom: 20,
        right: -5,
        color:'#ff6633',
    maxHeight:200,
    lineHeight:200
    },
    ghostTextRtl: {
        right: undefined,
        left: -5,
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
    uploadBox: {
        // marginBottom: 30,
        // flexDirection:'row'
    },
    avatarPreview: {
        height: 100,
        width: 100,
        borderRadius: 20,
        marginBottom: 5
    },
    uploadHint: {
        fontFamily: 'Acumin',
        marginBottom: 10,
        color: '#111111'
    },
    emptyImage: {
        height: 100,
        width: 100,
        borderRadius: 20,
        marginRight: 20,
        borderWidth: 1,
        borderStyle: 'dashed',
        borderColor: '#333333',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f4f4f4',
        marginBottom: 5
    },
    profileImage: {
        position: 'absolute',
        bottom: 0,
        right: -5,
        height: '70%',
        maxWidth: 200,
        overflow: 'hidden',
    },
    profileImageRtl: {
        right: undefined,
        left: -5,
    },
    profileImageAvatar: {
        height: '100%',
        width: undefined,
        aspectRatio: 1,
        resizeMode: 'contain',
    },
    profileSection: {
        marginBottom: 30
    },
    title: {
        fontFamily: "Qatar",
        fontSize: 20,
        color: 'black'
    },
    subtitle: {
        fontFamily: "Acumin",
        fontSize: 16,
        fontWeight: 'bold'
    },
    paragraph: {
        fontFamily: "Acumin",
        fontSize: 16
    },
    profileLink: {
        color: '#FF4000',
        fontSize: 14,
        fontFamily: 'Acumin'
    },
    locationLink: {
        backgroundColor: '#cccccc',
        borderRadius: 8,
        paddingVertical: 5
    },
    locationLinkText: {
        color: '#000',
        fontFamily: 'Qatar',
        fontSize: 20,
        textAlign: 'center'
    },
    editToggle: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
    },
    editToggleText: {
        color: 'black',
        fontFamily: 'Qatar',
        fontSize: 18
    },
    searchLoader: {
        position: 'absolute',
        top: 15,
        right: 10,
    },
    searchLoadingText: {
        fontFamily: 'Acumin',
        color: '#888',
        marginVertical: 5
    },
    searchNoResultText: {
        fontFamily: 'Acumin',
        color: '#555',
        marginVertical: 5
    },
    searchResultItem: {
        marginBottom: 10,
        flexDirection: 'row',
        alignItems: 'center',
        columnGap: 10,
    },
    searchResultItemImageContainer: {
        width: 40,
        aspectRatio: 1,
        borderRadius: 20,
        backgroundColor: '#f4f4f4'
    },
    searchResultItemImage: {
        objectFit: 'contain',
        height: '100%',
        width: '100%'
    },
    searchResultItemInfo: {
        fontFamily: 'Acumin',
        fontSize: 16,
        justifyContent: 'space-between',
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    searchResultItemInfoRtl: {
        flexDirection: 'row-reverse',
    },
    searchResultItemLink: {
        color: '#FF4000'
    },
    searchResultItemDescription: {
        // fontSize:16,
        marginBottom: 5,
        color: '#888888'
    },
    searchResultItemName: {
        fontWeight: 'bold',
        fontSize: 16,
        // marginBottom:5,
        color: 'black'
    },
    removeBtn: {
        width: 25,
        height: 25,
        borderRadius: 15,
        backgroundColor: '#FF4000',
        position: 'absolute',
        top: -5,
        left: -5,
        zIndex: 2,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center'
    },
    removeBtnConfirmation: {
        width: '100%',
        height: '100%',
        borderRadius: 15,
        backgroundColor: '#000',
        position: 'absolute',
        top: 0,
        left: 0,
        zIndex: 2,
    },
    backBtn: {
        position: 'absolute',
        top: 60,
        left: 10,
        width:200,
        zIndex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    backBtnRtl: {
        left: undefined,
        right: 10,
        flexDirection: 'row-reverse',
    },
    backBtnText: {
        color: '#FFF',
        fontSize:18,
        fontFamily:'Qatar'
    },
    loaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: 5,
    },
    loaderRowRtl: {
        flexDirection: 'row-reverse',
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    sectionHeaderRtl: {
        flexDirection: 'row-reverse',
    },
    peopleGrid: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 15,
    },
    peopleGridRtl: {
        flexDirection: 'row-reverse',
    },
    confirmRow: {
        flexDirection: 'row',
        gap: 10,
    },
    confirmRowRtl: {
        flexDirection: 'row-reverse',
    },
    personName: {
        color: 'black',
        fontSize: 14,
        fontFamily: 'Acumin',
    },
    ltrText: {
        textAlign: 'left',
        writingDirection: 'ltr',
    },
    rtlText: {
        textAlign: 'right',
        writingDirection: 'rtl',
    },
});
