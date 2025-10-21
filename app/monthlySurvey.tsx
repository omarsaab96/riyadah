import Slider from '@react-native-community/slider';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Dimensions, Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
const { width } = Dimensions.get('window');

const monthlySurvey = () => {
    const router = useRouter();
    const [injuries, setInjuries] = useState<String | null>(null);
    const [injuryDetails, setInjuryDetails] = useState<String | null>(null);
    const [coachTrainingSatisfaction, setCoachTrainingSatisfaction] = useState(5);
    const [areaOfImprovement, setAreaOfImprovement] = useState<String | null>(null);
    const [satisfaction, setSatisfaction] = useState(5);
    const [performance, setPerformance] = useState<String | null>(null);
    const [recovery, setRecovery] = useState<String | null>(null);
    const [sleep, setSleep] = useState<String | null>(null);
    const [mentally, setMentally] = useState<String | null>(null);
    const [notes, setNotes] = useState('');

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [timer, setTimer] = useState(5);
    const [error, setError] = useState('');


    const handleSubmit = async() => {
        const feedbackData = {
            injuries,
            injuryDetails,
            coachTrainingSatisfaction,
            areaOfImprovement,
            satisfaction,
            performance,
            recovery,
            sleep,
            mentally,
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

            const response = await fetch('http://193.187.132.170:5000/api/monthlySurvey', {
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
            Alert.alert('Error', 'Failed to submit monthly survey.');
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
                    <Text style={styles.pageTitle}>Monthly Athlete Wellness & Progress Survey</Text>
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
                        <Text style={styles.label}>How satisfied are you with your overall training this month?</Text>
                        <Text style={styles.hint}>0 = Very dissatisfied, 10 = Very satisfied</Text>
                        <View style={styles.rangeSliderContainer}>
                            <Slider
                                style={styles.rangeSlider}
                                minimumValue={0}
                                maximumValue={10}
                                step={1}
                                value={satisfaction}
                                onValueChange={setSatisfaction}
                                minimumTrackTintColor="#FF4000"
                                maximumTrackTintColor="#111111"
                                thumbTintColor="#FF4000"
                            />
                            <Text style={{ textAlign: 'center', fontSize: 16, marginTop: 10 }}>
                                {satisfaction || 0}
                            </Text>
                        </View>

                        <Text style={styles.label}>Do you feel your performance is improving?</Text>
                        <View style={styles.radioGroup}>
                            {['Declining', 'No change', 'Slightly', 'Yes'].map((option) => (
                                <TouchableOpacity
                                    key={option}
                                    style={styles.radioButtonContainer}
                                    onPress={() => setPerformance(option)}
                                >
                                    <View style={styles.outerCircle}>
                                        {performance === option && <View style={styles.innerCircle} />}
                                    </View>
                                    <Text style={styles.optionText}>{option}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <Text style={styles.label}>How well are you recovering between sessions?</Text>
                        <View style={styles.radioGroup}>
                            {['Very poor', 'Poor', 'Good', 'Excellent'].map((option) => (
                                <TouchableOpacity
                                    key={option}
                                    style={styles.radioButtonContainer}
                                    onPress={() => setRecovery(option)}
                                >
                                    <View style={styles.outerCircle}>
                                        {recovery === option && <View style={styles.innerCircle} />}
                                    </View>
                                    <Text style={styles.optionText}>{option}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <Text style={styles.label}>How would you rate your sleep quality this month?</Text>
                        <View style={styles.radioGroup}>
                            {['Poor', 'Fair', 'Excellent'].map((option) => (
                                <TouchableOpacity
                                    key={option}
                                    style={styles.radioButtonContainer}
                                    onPress={() => setSleep(option)}
                                >
                                    <View style={styles.outerCircle}>
                                        {sleep === option && <View style={styles.innerCircle} />}
                                    </View>
                                    <Text style={styles.optionText}>{option}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <Text style={styles.label}>Do you feel mentally motivated to train?</Text>
                        <View style={styles.radioGroup}>
                            {['Rarely', 'Sometimes', 'Often', 'Always'].map((option) => (
                                <TouchableOpacity
                                    key={option}
                                    style={styles.radioButtonContainer}
                                    onPress={() => setMentally(option)}
                                >
                                    <View style={styles.outerCircle}>
                                        {mentally === option && <View style={styles.innerCircle} />}
                                    </View>
                                    <Text style={styles.optionText}>{option}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <Text style={styles.label}>Any injuries or pain affecting performance?</Text>
                        <View style={[styles.radioGroup, injuries == 'Yes' && { marginBottom: 0 }]}>
                            {['Yes', 'No'].map((option) => (
                                <TouchableOpacity
                                    key={option}
                                    style={styles.radioButtonContainer}
                                    onPress={() => setInjuries(option)}
                                >
                                    <View style={styles.outerCircle}>
                                        {injuries === option && <View style={styles.innerCircle} />}
                                    </View>
                                    <Text style={styles.optionText}>{option}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                        {injuries == 'Yes' && <TextInput style={styles.input}
                            placeholder="Please provide details"
                            placeholderTextColor="#A8A8A8"
                            value={injuryDetails || ""}
                            onChangeText={setInjuryDetails}
                        />}
                        <Text style={styles.label}>Overall satisfaction with your coach/training environment?</Text>
                        <Text style={styles.hint}>0 = Very dissatisfied, 10 = Very satisfied</Text>
                        <View style={styles.rangeSliderContainer}>
                            <Slider
                                style={styles.rangeSlider}
                                minimumValue={0}
                                maximumValue={10}
                                step={1}
                                value={coachTrainingSatisfaction}
                                onValueChange={setCoachTrainingSatisfaction}
                                minimumTrackTintColor="#FF4000"
                                maximumTrackTintColor="#111111"
                                thumbTintColor="#FF4000"
                            />
                            <Text style={{ textAlign: 'center', fontSize: 16, marginTop: 10 }}>
                                {coachTrainingSatisfaction || 0}
                            </Text>
                        </View>

                        <Text style={[styles.label, { marginBottom: 10 }]}>What is one area you want to improve next month?</Text>
                        <TextInput style={styles.textarea}
                            placeholder="Any comments, injuries, etc."
                            placeholderTextColor="#A8A8A8"
                            value={areaOfImprovement || ""}
                            onChangeText={setAreaOfImprovement}
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

export default monthlySurvey;

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
    input: {
        fontSize: 14,
        padding: 15,
        backgroundColor: '#F4F4F4',
        marginBottom: 16,
        color: 'black',
        borderRadius: 10,
        marginTop: 10
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
        // flexDirection: 'row',
        marginTop: 10,
        marginBottom: 30,
        gap: 8
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
