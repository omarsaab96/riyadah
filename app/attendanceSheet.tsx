import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Dimensions, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
const { width } = Dimensions.get('window');

const AttendanceSheet = () => {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [team, setTeam] = useState('');
    const [athletes, setAthletes] = useState([]);
    const [presentAthletes, setPresentAthletes] = useState({});
    const [isExistingAttendance, setIsExistingAttendance] = useState(false);

    const { eventId } = useLocalSearchParams();

    useEffect(() => {
        if (!eventId) return;

        const fetchTeamMembers = async () => {
            try {
                const response = await fetch(`http://193.187.132.170:5000/api/attendance/byEvent/${eventId}`, {
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
                    Alert.alert('Error', data.message || 'Failed to fetch attendance data');
                }

            } catch (err) {
                console.error('Error fetching athletes:', err);
                Alert.alert('Error', 'Failed to connect to server');
            } finally {
                setLoading(false);
            }
        };

        fetchTeamMembers();
    }, [eventId]);

    const handleSubmit = async () => {
        const attendedAthletes = Object.keys(presentAthletes).filter(id => presentAthletes[id]);

        const body = {
            present: attendedAthletes,
            teamId: team,
            eventId: eventId
        };

        console.log('Submitting attendance with body:', body);

        try {
            setSaving(true);

            const response = await fetch('http://193.187.132.170:5000/api/attendance', {
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
                Alert.alert('Error', data.message || 'Failed to submit attendance');
            }
        } catch (err) {
            console.error('Error submitting attendance:', err);
            Alert.alert('Error', 'Failed to submit attendance. Please check your connection.');
        } finally {
            setSaving(false);
        }
    };

    return (

        <View style={styles.container}>
            <View style={styles.pageHeader}>
                <Image
                    source={require('../assets/logo_white.png')}
                    style={styles.logo}
                    resizeMode="contain"
                />

                <View style={styles.headerTextBlock}>
                    <Text style={styles.pageTitle}>Attendance sheet</Text>
                    {!loading && <Text style={styles.pageDesc}>{team.name || ""}</Text>}

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

                <Text style={styles.ghostText}>Attend</Text>
            </View>

            {!loading && !submitted && <ScrollView>
                <View style={styles.contentContainer}>
                    <Text style={styles.label}>Who attended?</Text>
                    <Text style={styles.hint}>Selected athletes are the ones that were present.</Text>

                    {athletes.map(athlete => (
                        <TouchableOpacity
                            key={athlete._id}
                            onPress={() => setPresentAthletes(prev => ({
                                ...prev,
                                [athlete._id]: !prev[athlete._id]
                            }))}
                            style={styles.checkboxContainer}
                            activeOpacity={1}
                        >
                            <View style={styles.checkbox}>
                                {presentAthletes[athlete._id] && (
                                    <View style={styles.checked}>
                                        <Image source={require('../assets/check.png')} style={styles.checkImage} />
                                    </View>
                                )}
                            </View>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <View style={[
                                    styles.profileImageContainer,
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
                                <Text style={styles.name}>{athlete.name}</Text>
                            </View>
                        </TouchableOpacity>
                    ))}

                </View>
            </ScrollView>
            }

            {!submitted && !loading && <View style={styles.fixedBottomSection}>
                <TouchableOpacity style={styles.fullButtonRow} onPress={handleSubmit}>
                    {/* <Image source={require('../assets/buttonBefore_black.png')} style={styles.sideRect} /> */}
                    <View style={styles.loginButton}>
                        <Text style={styles.loginText}>
                            {saving ? 'Submitting' : 'Submit Attendance sheet'}
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
                        Attendance sheet submitted successfully!
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
    pageHeader: {
        backgroundColor: '#FF4000',
        height: 270,
        // marginBottom: 30
    },
    logo: {
        width: 120 ,
        height:30,
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
        fontSize: 16,
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
        textTransform:'uppercase'
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
        flexDirection: 'row-reverse',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 5,
        backgroundColor: '#F4F4F4',
        padding: 5,
        borderRadius: 10
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
});