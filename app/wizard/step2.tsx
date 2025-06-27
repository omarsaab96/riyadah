import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useEffect, useRef, useState } from 'react';
import { Dimensions, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useRegistration } from '../../context/registration';

const { width } = Dimensions.get('window');

export default function WizardStep2() {
    const router = useRouter();
    const { formData, updateFormData } = useRegistration();

    const [day, setDay] = useState<string | null>(formData.dob?.day || null);
    const [month, setMonth] = useState<string | null>(formData.dob?.month || null);
    const [year, setYear] = useState<string | null>(formData.dob?.year || null);
    const [showParentEmail, setShowParentEmail] = useState(false);
    const [parentEmail, setParentEmail] = useState<string | null>(formData.parentEmail || null);
    const [error, setError] = useState<string | null>(null);


    const dayRef = useRef(null);
    const monthRef = useRef(null);
    const yearRef = useRef(null);

    useEffect(() => {
        const checkAuth = async () => {
            const token = await SecureStore.getItemAsync('userToken');
            if (token) {
                router.replace('/profile'); // Redirect if token exists
            }
        };

        checkAuth();
    }, []);

    useEffect(() => {
        setTimeout(() => {
            dayRef.current?.focus();
        }, 500); // Slight delay to ensure keyboard opens smoothly
    }, []);

    useEffect(() => {
        const isComplete = day?.length === 2 && month?.length === 2 && year?.length === 4;
        if (!isComplete) return;

        const dob = `${year?.padStart(4, '0')}-${month?.padStart(2, '0')}-${day?.padStart(2, '0')}`;
        const age = calculateAge(dob);

        if (age < 18 && formData.type == "Parent") {
            setShowParentEmail(false);
            setError('Parents cannot be under 18');
            return;
        }

        if (age > 18 && formData.type == "Parent") {
            setShowParentEmail(false);
            setError(null);
            return;
        }

        if (age < 18 && formData.type == "Athlete") {
            setShowParentEmail(true);
        } else {
            setShowParentEmail(false);
        }
    }, [day, month, year]);

    const calculateAge = (dob: string) => {
        const birthDate = new Date(dob);
        const today = new Date();

        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();

        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }

        return age;
    };

    const handleNext = () => {
        const dob = `${year?.padStart(4, '0')}-${month?.padStart(2, '0')}-${day?.padStart(2, '0')}`;

        if (formData.type == "Club") {
            if (day != null && month != null && year != null) {
                updateFormData({
                    dob: {
                        day: day,
                        month: month,
                        year: year
                    },
                    parentEmail: null
                });

                router.push('/wizard/step3');

            } else {
                setError('Kindly fill all fields')
            }

        } else {
            const age = calculateAge(dob);

            if (formData.type == "Parent" && age < 18) {
                setError('Parents cannot be under 18')
                return;
            }

            if (age < 18 && parentEmail != "" && parentEmail != null) {
                updateFormData({
                    dob: {
                        day: day,
                        month: month,
                        year: year
                    },
                    parentEmail: parentEmail
                });
                if (formData.type == "Parent") {
                    router.push('/wizard/step5');
                } else {
                    router.push('/wizard/step3');
                }
            } else if (age >= 18 && day != null && month != null && year != null) {
                updateFormData({
                    dob: {
                        day: day,
                        month: month,
                        year: year
                    },
                    parentEmail: null
                });

                // console.log(formData)
                if (formData.type == "Parent") {
                    router.push('/wizard/step5');
                } else {
                    router.push('/wizard/step3');
                }

            } else {
                setError('Kindly fill all fields')
            }
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.pageHeader}>
                <Image
                    source={require('../../assets/logo_white.png')}
                    style={styles.logo}
                    resizeMode="contain"
                />

                {formData.type != "Club" && <View style={styles.headerTextBlock}>
                    <Text style={styles.pageTitle}>Date of birth</Text>
                    <Text style={styles.pageDesc}>When were you born?</Text>
                </View>
                }

                {formData.type == "Club" && <View style={styles.headerTextBlock}>
                    <Text style={styles.pageTitle}>Established On</Text>
                    <Text style={styles.pageDesc}>When was your club established?</Text>
                </View>
                }

                <Text style={styles.ghostText}>
                    {formData.type == "Club" ? 'SINCE' : 'DOB'}
                </Text>
            </View>

            <View style={styles.form}>
                {error != null && <View style={styles.error}>
                    <View style={styles.errorIcon}></View>
                    <Text style={styles.errorText}>{error}</Text>
                </View>}
                <View style={styles.dobRow}>
                    <TextInput
                        ref={dayRef}
                        style={styles.dobInput}
                        placeholder="DD"
                        placeholderTextColor="#aaa"
                        keyboardType="number-pad"
                        maxLength={2}
                        value={day}
                        onChangeText={(text) => {
                            setDay(text);
                            if (text.length === 2) {
                                monthRef.current?.focus();
                            }
                        }}
                        returnKeyType="next"
                    />
                    <Text style={styles.dobSeperator}>/</Text>
                    <TextInput
                        style={styles.dobInput}
                        placeholder="MM"
                        placeholderTextColor="#aaa"
                        keyboardType="number-pad"
                        maxLength={2}
                        value={month}
                        onChangeText={(text) => {
                            setMonth(text);
                            if (text.length === 2) {
                                yearRef.current?.focus();
                            }
                        }}
                        ref={monthRef}
                        returnKeyType="next"
                    />
                    <Text style={styles.dobSeperator}>/</Text>
                    <TextInput
                        style={styles.dobInput}
                        placeholder="YYYY"
                        placeholderTextColor="#aaa"
                        keyboardType="number-pad"
                        maxLength={4}
                        value={year}
                        onChangeText={setYear}
                        ref={yearRef}
                        returnKeyType="done"
                    />
                </View>

                {showParentEmail && (
                    <View>
                        <Text style={styles.hint}>Since you are less than 18, kindly enter your parent's email address.</Text>

                        <TextInput
                            style={styles.input}
                            placeholder="Parent email"
                            placeholderTextColor="#A8A8A8"
                            value={parentEmail}
                            onChangeText={setParentEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                    </View>
                )}
            </View>

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
        height: '100%',
    },
    pageHeader: {
        backgroundColor: '#FF4000',
        height: 270,
        marginBottom: 30,
    },
    logo: {
        width: 150,
        position: 'absolute',
        top: 40,
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
        marginBottom: 10,
    },
    pageDesc: {
        color: '#ffffff',
        fontSize: 16,
        fontFamily: 'Manrope',
    },
    ghostText: {
        color: '#ffffff',
        fontSize: 128,
        fontFamily: 'Bebas',
        position: 'absolute',
        bottom: 20,
        right: -5,
        opacity: 0.2,
    },
    form: {
        paddingLeft: 20,
        paddingRight: 20,
    },
    dobRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
    },
    dobInput: {
        flex: 1,
        fontSize: 18,
        color: 'black',
        textAlign: 'center',
        backgroundColor: '#F4F4F4',
        borderRadius: 10
    },
    dobSeperator: {
        fontSize: 30,
        fontFamily: 'Bebas',
        fontWeight: 'bold',
        color: '#FF4000',
        marginHorizontal: 10
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
        marginLeft: -1,
    },
    fixedBottomSection: {
        position: 'absolute',
        bottom: 50,
        left: 0,
        width: width,
        paddingLeft: 20,
        paddingRight: 20,
    },
    input: {
        fontSize: 14,
        padding: 15,
        backgroundColor: '#F4F4F4',
        marginBottom: 16,
        color: 'black',
        borderRadius: 10,
    },
    hint: {
        color: '#525252',
        fontSize: 12,
        fontFamily: 'Manrope',
        marginTop: 20,
        marginBottom: 10
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
    }
});
