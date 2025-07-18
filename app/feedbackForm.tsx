import Slider from '@react-native-community/slider';
import React, { useState } from 'react';
import { ActivityIndicator, Dimensions, Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
const { width } = Dimensions.get('window');

const FeedbackForm = () => {
    const [soreness, setSoreness] = useState(5);
    const [mentalHealth, setMentalHealth] = useState(5);
    const [physicalHealth, setPhysicalHealth] = useState(5);
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);


    const handleSubmit = () => {
        const feedbackData = {
            soreness,
            mentalHealth,
            physicalHealth,
            notes,
        };

        // Replace this with your API call or local storage logic
        console.log('Feedback submitted:', feedbackData);
        setSubmitted(true)
        setNotes('');
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
                    <Text style={styles.pageTitle}>Post-Session Feedback</Text>
                    {/* {!loading && <Text style={styles.pageDesc}>Feedback</Text>} */}

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

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView>
                    <View style={styles.contentContainer}>
                        <Text style={styles.label}>How sore are you?</Text>
                        <View style={styles.rangeSliderContainer}>
                            <Slider
                                style={styles.rangeSlider}
                                minimumValue={0}
                                maximumValue={10}
                                step={1}
                                value={soreness}
                                onValueChange={setSoreness}
                                minimumTrackTintColor="#FF4000"
                                maximumTrackTintColor="#111111"
                                thumbTintColor="#FF4000"
                            />
                            <Text style={{ textAlign: 'center', fontSize: 16, marginTop: 10 }}>
                                {soreness || 0}%
                            </Text>
                        </View>

                        <Text style={styles.label}>How is your mental health?</Text>
                        <View style={styles.rangeSliderContainer}>
                            <Slider
                                style={styles.rangeSlider}
                                minimumValue={0}
                                maximumValue={10}
                                step={1}
                                value={mentalHealth}
                                onValueChange={setMentalHealth}
                                minimumTrackTintColor="#FF4000"
                                maximumTrackTintColor="#111111"
                                thumbTintColor="#FF4000"
                            />
                            <Text style={{ textAlign: 'center', fontSize: 16, marginTop: 10 }}>
                                {mentalHealth || 0}%
                            </Text>
                        </View>

                        <Text style={styles.label}>How is your physical health?</Text>
                        <View style={styles.rangeSliderContainer}>
                            <Slider
                                style={styles.rangeSlider}
                                minimumValue={0}
                                maximumValue={10}
                                step={1}
                                value={physicalHealth}
                                onValueChange={setPhysicalHealth}
                                minimumTrackTintColor="#FF4000"
                                maximumTrackTintColor="#111111"
                                thumbTintColor="#FF4000"
                            />
                            <Text style={{ textAlign: 'center', fontSize: 16, marginTop: 10 }}>
                                {physicalHealth || 0}%
                            </Text>
                        </View>

                        <Text style={styles.label}>Additional Notes</Text>
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
            </KeyboardAvoidingView>

            <View style={styles.fixedBottomSection}>
                <TouchableOpacity style={styles.fullButtonRow} onPress={handleSubmit}>
                    <Image source={require('../assets/buttonBefore_black.png')} style={styles.sideRect} />
                    <View style={styles.loginButton}>
                        <Text style={styles.loginText}>Submit Feedback</Text>
                    </View>
                    <Image source={require('../assets/buttonAfter_black.png')} style={styles.sideRectAfter} />
                </TouchableOpacity>
            </View>
        </View >


    );
};

export default FeedbackForm;

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
        marginBottom: 10
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
