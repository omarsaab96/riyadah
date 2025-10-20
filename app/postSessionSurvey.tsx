import Slider from '@react-native-community/slider';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Dimensions, Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
const { width } = Dimensions.get('window');

const postSessionSurvey = () => {
    const router = useRouter();

    const [intensity, setIntensity] = useState(5);
    const [physicalFeeling, setPhysicalFeeling] = useState<String | null>(null);
    const [focusLevel, setFocusLevel] = useState<String | null>(null);
    const [discomfort, setDiscomfort] = useState<String | null>(null);
    const [discomfortDetails, setDiscomfortDetails] = useState<String | null>(null);
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [timer, setTimer] = useState(5);
    const [error, setError] = useState('');


    const handleSubmit = async () => {
        const feedbackData = {
            intensity,
            physicalFeeling,
            focusLevel,
            discomfort,
            discomfortDetails,
            notes,
        };

        setSaving(true);
        console.log('Feedback submitted:', feedbackData);
        try {
            const token = await SecureStore.getItemAsync('userToken');
            if (!token) {
                setError('User not authenticated');
                setSaving(false);
                return;
            }

            const response = await fetch('https://riyadah.onrender.com/api/PostSessionSurvey', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(feedbackData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                setError(errorData.message || 'Failed to submit survey');
                setSaving(false);
                return;
            }

            setSubmitted(true)

            setInterval(() => {
                setTimer(prev => {
                    if (prev <= 1) {
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);

        } catch (err) {
            Alert.alert('Error', 'Failed to submit post session survey.');
        } finally {
            setSaving(false);
        }
    };

    useEffect(() => {
        if (timer == 0) {
            router.replace("/landing");
        }

    }, [timer]);

    return (
        <View style={styles.container}>
            <View style={styles.pageHeader}>
                <Image
                    source={require('../assets/logo_white.png')}
                    style={styles.logo}
                    resizeMode="contain"
                />

                <View style={styles.headerTextBlock}>
                    <Text style={styles.pageTitle}>Post-Session Feedback</Text>
                    {/* {!loading && <Text style={styles.pageDesc}>Event name</Text>} */}

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

                <Text style={styles.ghostText}>Survey</Text>
            </View>

            {!loading && !submitted && <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView>
                    <View style={styles.contentContainer}>
                        <Text style={styles.label}>How intense was today's session?</Text>
                        <Text style={styles.hint}>0 = Very Easy, 10 = Extremely Hard</Text>
                        <View style={styles.rangeSliderContainer}>
                            <Slider
                                style={styles.rangeSlider}
                                minimumValue={0}
                                maximumValue={10}
                                step={1}
                                value={intensity}
                                onValueChange={setIntensity}
                                minimumTrackTintColor="#FF4000"
                                maximumTrackTintColor="#111111"
                                thumbTintColor="#FF4000"
                            />
                            <Text style={{ textAlign: 'center', fontSize: 16, marginTop: 10 }}>
                                {intensity || 0}
                            </Text>
                        </View>

                        <Text style={styles.label}>How do you feel physically right now?</Text>
                        <View style={styles.radioGroup}>
                            {['Great', 'Tired', 'Exhausted'].map((option) => (
                                <TouchableOpacity
                                    key={option}
                                    style={styles.radioButtonContainer}
                                    onPress={() => setPhysicalFeeling(option)}
                                >
                                    <View style={styles.outerCircle}>
                                        {physicalFeeling === option && <View style={styles.innerCircle} />}
                                    </View>
                                    <Text style={styles.optionText}>{option}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <Text style={styles.label}>How was your focus and motivation today?</Text>
                        <View style={styles.radioGroup}>
                            {['Low', 'Moderate', 'High'].map((option) => (
                                <TouchableOpacity
                                    key={option}
                                    style={styles.radioButtonContainer}
                                    onPress={() => setFocusLevel(option)}
                                >
                                    <View style={styles.outerCircle}>
                                        {focusLevel === option && <View style={styles.innerCircle} />}
                                    </View>
                                    <Text style={styles.optionText}>{option}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <Text style={styles.label}>Any pain, soreness, or discomfort?</Text>
                        <View style={[styles.radioGroup, discomfort == 'Yes' && { marginBottom: 0 }]}>
                            {['Yes', 'No'].map((option) => (
                                <TouchableOpacity
                                    key={option}
                                    style={styles.radioButtonContainer}
                                    onPress={() => setDiscomfort(option)}
                                >
                                    <View style={styles.outerCircle}>
                                        {discomfort === option && <View style={styles.innerCircle} />}
                                    </View>
                                    <Text style={styles.optionText}>{option}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                        {discomfort == 'Yes' && <TextInput style={styles.input}
                            placeholder="Please provide details"
                            placeholderTextColor="#A8A8A8"
                            value={discomfortDetails || ""}
                            onChangeText={setDiscomfortDetails}
                        />}

                        <Text style={[styles.label, { marginBottom: 10 }]}>Any comments or feedback for the coach?</Text>
                        <TextInput style={styles.textarea}
                            placeholder="Any comments, injuries, etc."
                            placeholderTextColor="#A8A8A8"
                            value={notes || ""}
                            onChangeText={setNotes}
                            multiline={true}
                            blurOnSubmit={false}
                            returnKeyType="default"
                        />
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>}

            {!submitted && !loading && <View style={styles.fixedBottomSection}>
                <TouchableOpacity style={styles.fullButtonRow} onPress={handleSubmit}>
                    <Image source={require('../assets/buttonBefore_black.png')} style={styles.sideRect} />
                    <View style={styles.loginButton}>
                        <Text style={styles.loginText}>
                            {saving ? 'Submitting' : 'Submit Feedback'}
                        </Text>
                        {saving && (
                            <ActivityIndicator
                                size="small"
                                color="#FFFFFF"
                                style={styles.loginLoader}
                            />
                        )}
                    </View>
                    <Image source={require('../assets/buttonAfter_black.png')} style={styles.sideRectAfter} />
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
                        Feedback submitted successfully!
                    </Text>

                    <Text style={[styles.hint, { marginTop: 10, marginBottom: 50 }]}>
                        You will be redirected in {timer}
                    </Text>
                </View>
            </View>}
        </View >


    );
};

export default postSessionSurvey;

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
    ghostText: {
        color: '#ffffff',
        fontSize: 128,
        fontFamily: 'Bebas',
        position: 'absolute',
        bottom: 20,
        right: -5,
        opacity: 0.2
    },
    label: {
        fontFamily: "Bebas",
        fontSize: 20,
        // marginBottom: 10
    },
    rangeContainer: {

    },
    subtitle: {
        fontFamily: "Manrope",
        fontSize: 16,
        fontWeight: 'bold'
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
        flexDirection: 'row'
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
    loginLoader: {
        marginLeft: 10
    },
    childConfirmation: {
        paddingHorizontal: 20,
        paddingTop: 40,
        alignItems: 'center',
    },
    confirmationTitle: {
        fontFamily: 'Bebas',
        fontSize: 20,
    },
    hint: {
        marginBottom: 5,
        fontFamily: 'Manrope',
        fontSize: 14,
        color: '#888'
    },
    radioGroup: {
        flexDirection: 'row',
        marginVertical: 8,
        marginBottom: 30,
        gap: 30
    },
    input: {
        fontSize: 14,
        padding: 15,
        backgroundColor: '#F4F4F4',
        marginBottom: 16,
        color: 'black',
        borderRadius: 10,
        marginTop: 10
    },
    radioButtonContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    outerCircle: {
        height: 22,
        width: 22,
        borderRadius: 11,
        borderWidth: 2,
        borderColor: '#FF4400',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 6,
    },
    innerCircle: {
        height: 12,
        width: 12,
        borderRadius: 6,
        backgroundColor: '#FF4400',
    },
    optionText: {
        fontSize: 15,
    },
});
