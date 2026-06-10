import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Dimensions, Image, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useLanguage } from '../context/language';
const { width } = Dimensions.get('window');

const AttendanceSheet = () => {
    const router = useRouter();
    const { isRTL, t } = useLanguage();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [team, setTeam] = useState('');
    const [athletes, setAthletes] = useState([]);
    const [presentAthletes, setPresentAthletes] = useState({});
    const [isExistingAttendance, setIsExistingAttendance] = useState(false);
    const [eventStartTime, setEventStartTime] = useState<Date | null>(null);
    const [lockTime, setLockTime] = useState<Date | null>(null);
    const [timeLeft, setTimeLeft] = useState(0);
    const [isLocked, setIsLocked] = useState(false);

    const { eventId } = useLocalSearchParams();

    useEffect(() => {
        if (!eventId) return;

        const fetchTeamMembers = async () => {
            try {
                const response = await fetch(`https://server.riyadah.app/api/attendance/byEvent/${eventId}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });


                const data = await response.json();
                console.warn('Response status:', data);

                if (data.success) {
                    setTeam(data.data.team);
                    setAthletes(data.data.members);
                    setIsExistingAttendance(data.data.isExisting);
                    if (data.data.event?.startTime || data.data.event?.date) {
                        const start = new Date(data.data.event.startTime || data.data.event.date);
                        setEventStartTime(start);
                        const lockAt = new Date(start.getTime() + 15 * 60 * 1000);
                        setLockTime(lockAt);
                    }

                    let initialAttendance = {};

                    // If it's existing attendance, mark only present athletes
                    if (data.data.isExisting && data.data.present) {
                        data.data.members.forEach(athlete => {
                            initialAttendance[athlete._id] = data.data.present.some(
                                presentAthlete => presentAthlete._id === athlete._id
                            );
                        });
                    } else {
                        // If new attendance, default all to present
                        data.data.members.forEach(athlete => {
                            initialAttendance[athlete._id] = true;
                        });
                    }

                    setPresentAthletes(initialAttendance);
                } else {
                    setAthletes([]);
                    Alert.alert(t('messages.errorTitle'), data.message || t('attendance.failedFetch'));
                }

            } catch (err) {
                console.error('Error fetching athletes:', err);
                Alert.alert(t('messages.errorTitle'), t('attendance.failedConnect'));
            } finally {
                setLoading(false);
            }
        };

        fetchTeamMembers();
    }, [eventId]);

    const handleSubmit = async () => {
        if (isLocked) {
            Alert.alert(t('attendance.lockedTitle'), t('attendance.lockedMessage'));
            return;
        }
        const attendedAthletes = Object.keys(presentAthletes).filter(id => presentAthletes[id]);

        const body = {
            present: attendedAthletes,
            teamId: team,
            eventId: eventId
        };

        console.log('Submitting attendance with body:', body);

        try {
            setSaving(true);

            const response = await fetch('https://server.riyadah.app/api/attendance', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body)
            });

            const data = await response.json();

            if (data.success) {
                setSubmitted(true);
                setTimeout(() => {
                    router.back();
                }, 1000);
            
            } else {
                Alert.alert(t('messages.errorTitle'), data.message || t('attendance.failedSubmit'));
            }
        } catch (err) {
            console.error('Error submitting attendance:', err);
            Alert.alert(t('messages.errorTitle'), t('attendance.failedSubmitConnection'));
        } finally {
            setSaving(false);
        }
    };

    useEffect(() => {
        if (!lockTime) return;

        const updateTimer = () => {
            const now = new Date();
            const diff = lockTime.getTime() - now.getTime();
            if (diff <= 0) {
                setTimeLeft(0);
                setIsLocked(true);
                return;
            }
            setTimeLeft(Math.ceil(diff / 1000));
            setIsLocked(false);
        };

        updateTimer();
        const interval = setInterval(updateTimer, 1000);
        return () => clearInterval(interval);
    }, [lockTime]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    };

    const directionStyle = isRTL ? styles.rtlText : styles.ltrText;

    return (
        <View style={styles.container}>
            <View style={styles.pageHeader}>
                <Image
                    source={require('../assets/logo_white.png')}
                    style={[styles.logo, isRTL && styles.logoRtl]}
                    resizeMode="contain"
                />

                <View style={[styles.headerTextBlock, isRTL && styles.headerTextBlockRtl]}>
                    <Text style={[styles.pageTitle, directionStyle]}>{t('attendance.title')}</Text>
                    {!loading && <Text style={[styles.pageDesc, directionStyle]}>{team.name || ""}</Text>}

                    {loading &&
                        <View style={[styles.headerLoaderRow, isRTL && styles.headerLoaderRowRtl]}>
                            <ActivityIndicator
                                size="small"
                                color="#fff"
                                style={{ transform: [{ scale: 1.25 }] }}
                            />
                        </View>
                    }
                </View>

                <Text style={[styles.ghostText, isRTL && styles.ghostTextRtl]}>{t('attendance.ghost')}</Text>
            </View>

            {!loading && !submitted && <ScrollView>
                <View style={styles.contentContainer}>
                    {/* {lockTime && (
                        <View style={styles.lockBanner}>
                            <Text style={styles.lockText}>
                                {isLocked ? t('attendance.lockedTitle') : t('attendance.editingClosesIn').replace('{time}', formatTime(timeLeft))}
                            </Text>
                        </View>
                    )} */}
                    <Text style={[styles.label, directionStyle]}>{t('attendance.whoAttended')}</Text>
                    <Text style={[styles.hint, directionStyle]}>{t('attendance.selectedHint')}</Text>

                    {athletes.map(athlete => (
                        <TouchableOpacity
                            key={athlete._id}
                            onPress={() => {
                                if (isLocked) return;
                                setPresentAthletes(prev => ({
                                    ...prev,
                                    [athlete._id]: !prev[athlete._id]
                                }))
                            }}
                            style={[styles.checkboxContainer, isRTL ? styles.checkboxContainerRtl : styles.checkboxContainerLtr]}
                            activeOpacity={1}
                        >
                            <View style={styles.checkbox}>
                                {presentAthletes[athlete._id] && (
                                    <View style={styles.checked}>
                                        <Image source={require('../assets/check.png')} style={styles.checkImage} />
                                    </View>
                                )}
                            </View>
                            <View style={[styles.athleteRow, isRTL && styles.athleteRowRtl]}>
                                <View style={[
                                    styles.profileImageContainer,
                                    isRTL && styles.profileImageContainerRtl,
                                    (athlete.image == null || athlete.image == "") && { backgroundColor: '#FF4000' }
                                ]}>
                                    {(athlete.image == null || athlete.image == "") && athlete.gender == "Male" && <Image
                                        source={require('../assets/avatar.png')}
                                        style={styles.profileImageAvatar}
                                        resizeMode="contain"
                                    />}
                                    {(athlete.image == null || athlete.image == "") && athlete.gender == "Female" && <Image
                                        source={require('../assets/avatarF.png')}
                                        style={styles.profileImageAvatar}
                                        resizeMode="contain"
                                    />}
                                    {athlete.image != null && <Image
                                        source={{ uri: athlete.image }}
                                        style={styles.profileImageAvatar}
                                        resizeMode="contain"
                                    />}
                                </View>
                                <Text style={[styles.name, directionStyle]}>{athlete.name}</Text>
                            </View>
                        </TouchableOpacity>
                    ))}

                </View>
            </ScrollView>
            }

            {!submitted && !loading && <View style={styles.fixedBottomSection}>
                <TouchableOpacity style={styles.fullButtonRow} onPress={handleSubmit} disabled={isLocked}>
                    {/* <Image source={require('../assets/buttonBefore_black.png')} style={styles.sideRect} /> */}
                    <View style={[styles.loginButton, isLocked && styles.loginButtonDisabled]}>
                        <Text style={styles.loginText}>
                            {isLocked ? t('attendance.submitLocked') : saving ? t('attendance.submitting') : t('attendance.submit')}
                        </Text>
                        {saving && (
                            <ActivityIndicator
                                size="small"
                                color="#FFFFFF"
                                style={styles.loginLoader}
                            />
                        )}
                    </View>
                    {/* <Image source={require('../assets/buttonAfter_black.png')} style={styles.sideRectAfter} /> */}
                </TouchableOpacity>
            </View>}

            {submitted && !loading && !saving && <View>
                <View style={styles.childConfirmation}>
                    <View style={{
                        backgroundColor: '#009933',
                        borderRadius: 50,
                        width: 50,
                        height: 50,
                        marginBottom: 20,
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}>
                        <Image
                            source={require('../assets/check.png')}
                            style={{ width: 30, height: 30 }}
                            resizeMode="contain"
                            tintColor={'#ffffff'}
                        />
                    </View>

                    <Text style={styles.confirmationTitle}>
                        {t('attendance.submitted')}
                    </Text>
                </View>
            </View>}
        </View >
    );
};

export default AttendanceSheet;

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
        height: '100%'
    },
    contentContainer: {
        padding: 20,
        paddingBottom: 130
    },
    lockBanner: {
        backgroundColor: '#111111',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
        marginBottom: 12
    },
    lockText: {
        color: '#ffffff',
        fontFamily: 'Acumin',
        fontSize: 14,
        textAlign: 'center'
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
    logoRtl: {
        left: undefined,
        right: 20,
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
    ghostText: {
        fontSize: 100,
        fontFamily: 'Qatar',
        position: 'absolute',
        bottom: 20,
        right: -5,
        color:'#ff6633',
        textTransform:'uppercase',
    maxHeight:200,
    lineHeight:200
    },
    ghostTextRtl: {
        right: undefined,
        left: -5,
    },
    label: {
        fontFamily: "Qatar",
        fontSize: 20,
        marginBottom: 0
    },
    hint: {
        marginBottom: 20,
        fontFamily: 'Acumin',
        fontSize: 14,
        color: '#000000'
    },
    checkboxContainer: {
        alignItems: 'center',
        // justifyContent: 'space-between',
        marginBottom: 5,
        backgroundColor: '#F4F4F4',
        padding: 5,
        borderRadius: 10
    },
    checkboxContainerLtr: {
        flexDirection: 'row',
    },
    checkboxContainerRtl: {
        flexDirection: 'row-reverse',
    },
    athleteRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    athleteRowRtl: {
        flexDirection: 'row-reverse',
    },
    checkbox: {
        width: 16,
        height: 16,
        borderWidth: 1,
        borderColor: '#000000',
        marginRight: 10,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 3,
        overflow: 'hidden',
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
    rangeSliderContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20,
        flexWrap: 'wrap',
    },
    rangeSlider: {
        flex: 1,
        height: 40
    },
    textarea: {
        fontSize: 14,
        padding: 15,
        backgroundColor: '#F4F4F4',
        marginBottom: 16,
        color: 'black',
        borderRadius: 10,
        height: 100,
        textAlignVertical: 'top',
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
        flexDirection: 'row',
        borderRadius:15
    },
    loginButtonDisabled: {
        backgroundColor: '#777777'
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
    profileImageContainer: {
        borderRadius: 20,
        overflow: 'hidden',
        width: 40,
        height: 40,
        marginRight: 10,
    },
    profileImageContainerRtl: {
        marginRight: 0,
        marginLeft: 10,
    },
    profileImageAvatar: {
        width: undefined,
        height: '100%',
        aspectRatio: 1,
        resizeMode: 'contain',
    },
    name: {
        fontSize: 16,
        fontFamily: 'Acumin',
        color: '#000000',
    },
    loginLoader: {
        marginLeft: 10
    },
    childConfirmation: {
        paddingHorizontal: 20,
        paddingTop: 40,
        alignItems: 'center',
    },
    confirmationTitle: {
        fontFamily: 'Qatar',
        fontSize: 20,
        textAlign:'center'
    },
    headerLoaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: 5,
    },
    headerLoaderRowRtl: {
        flexDirection: 'row-reverse',
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
