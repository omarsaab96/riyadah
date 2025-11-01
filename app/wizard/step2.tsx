import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useEffect, useRef, useState } from 'react';
import { Dimensions, Image, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useRegistration } from '../../context/registration';

const { width } = Dimensions.get('window');

export default function WizardStep2() {
    const router = useRouter();
    const { formData, updateFormData } = useRegistration();

    const [day, setDay] = useState<string | null>((formData.type == "Club" || formData.type == "Association") ? '01' : formData.dob?.day || null);
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
        // Clear previous error each run
        setError(null);

        const hasAnyInput = !!(day?.length || month?.length || year?.length);

        // If user started typing DOB, require each piece
        if (hasAnyInput) {
            if (!month?.length) {
                setShowParentEmail(false);
                setError('Month is required');
                return;
            }
            if (!day?.length) {
                setShowParentEmail(false);
                setError('Day is required');
                return;
            }
            if (!year?.length) {
                setShowParentEmail(false);
                setError('Year is required');
                return;
            }
        } else {
            // Nothing entered at all—don’t validate yet
            return;
        }

        // Now we know we have all 3 parts; enforce exact lengths
        const isComplete = (day.length > 0 && day.length <= 2) && (month.length > 0 && month.length <= 2) && year.length === 4;
        if (!isComplete) {
            setShowParentEmail(false);
            setError('Please enter a valid date');
            return;
        }

        const dayNum = parseInt(day, 10);
        const monthNum = parseInt(month, 10);
        const yearNum = parseInt(year, 10);

        // Guard against NaN
        if (Number.isNaN(dayNum) || Number.isNaN(monthNum) || Number.isNaN(yearNum)) {
            setShowParentEmail(false);
            setError('Please enter only numbers for day, month, and year');
            return;
        }

        // Validate month
        if (monthNum < 1 || monthNum > 12) {
            setShowParentEmail(false);
            setError('Month must be between 01 and 12');
            return;
        }

        // Max days in month (handles leap years)
        const getDaysInMonth = (m, y) => new Date(y, m, 0).getDate(); // m is 1–12
        const maxDay = getDaysInMonth(monthNum, yearNum);

        // Validate day
        if (dayNum < 1 || dayNum > maxDay) {
            setShowParentEmail(false);
            setError(`Day must be between 01 and ${maxDay} for the selected month`);
            return;
        }

        const dob = `${year.padStart(4, '0')}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        const dobDate = new Date(dob);
        const today = new Date();

        // Basic validity checks
        if (isNaN(dobDate.getTime())) {
            setShowParentEmail(false);
            setError('Please enter a valid date');
            return;
        }

        if (dobDate > today) {
            setShowParentEmail(false);
            setError('Date cannot be in the future');
            return;
        }

        const age = calculateAge(dob);

        if (age < 18 && formData.type === "Parent") {
            setShowParentEmail(false);
            setError('Parents cannot be under 18');
            return;
        }

        if (age < 18 && formData.type === "Scout") {
            setShowParentEmail(false);
            setError('Scout cannot be under 18');
            return;
        }

        if (age < 18 && formData.type === "Sponsor") {
            setShowParentEmail(false);
            setError('Sponsor cannot be under 18');
            return;
        }

        if (age > 18 && formData.type === "Parent") {
            setShowParentEmail(false);
            setError(null);
            return;
        }

        if (age < 18 && formData.type === "Athlete") {
            setShowParentEmail(true);
        } else {
            setShowParentEmail(false);
        }
    }, [day, month, year, formData.type]); // include formData.type so logic updates when role changes


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
        const dobDate = new Date(dob);
        const today = new Date();

        // Basic validity checks
        if (isNaN(dobDate.getTime())) {
            setError('Please enter a valid date');
            return;
        }

        if (dobDate > today) {
            setError('Date cannot be in the future');
            return;
        }

        if (formData.type == "Scout" || formData.type == "Sponsor") {
            if (day != null && month != null && year != null && day.trim() != '' && month.trim() != '' && year.trim() != '') {
                const age = calculateAge(dob);
                if ((formData.type == "Scout" || formData.type == "Sponsor") && age < 18) {
                    setError(`${formData.type} cannot be under 18`)
                    return;
                }

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

        } else if (formData.type == "Club" || formData.type == "Association") {
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

                {(formData.type != "Club" && formData.type != "Association") && <View style={styles.headerTextBlock}>
                    <Text style={styles.pageTitle}>Date of birth</Text>
                    <Text style={styles.pageDesc}>When were you born?</Text>
                </View>
                }

                {(formData.type == "Club" || formData.type == "Association") && <View style={styles.headerTextBlock}>
                    <Text style={styles.pageTitle}>Established On</Text>
                    <Text style={styles.pageDesc}>When was the {formData.type == "Club" ? 'club' : 'association'} established?</Text>
                </View>
                }

                <Text style={styles.ghostText}>
                    {(formData.type == "Club" || formData.type == "Association") ? 'SINCE' : 'DOB'}
                </Text>
            </View>

            <View style={styles.form}>
                {error != null && <View style={styles.error}>
                    <View style={styles.errorIcon}></View>
                    <Text style={styles.errorText}>{error}</Text>
                </View>}
                <View style={styles.dobRow}>
                    {formData.type != "Club" && formData.type != "Association" && <TextInput
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
                    />}
                    {formData.type != "Club" && formData.type != "Association" &&
                        <Text style={styles.dobSeperator}>/</Text>
                    }
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
                <TouchableOpacity style={[
                    styles.fullButtonRow,
                    error != null && { opacity: 0.6 }
                ]} onPress={handleNext} disabled={error != null}>
                    {/* <Image source={require('../../assets/buttonBefore_black.png')} */}
                    {/* style={styles.sideRect} /> */}
                    <View style={styles.loginButton}>
                        <Text style={styles.loginText}>NEXT</Text>
                    </View>
                    {/* <Image source={require('../../assets/buttonAfter_black.png')} style={styles.sideRectAfter} /> */}
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
        width: 120 ,
        height:30,
        height: 40,
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
        fontFamily: 'Acumin',
    },
    ghostText: {
        color: '#ffffff',
        fontSize: 100,
        fontFamily: 'Qatar',
        position: 'absolute',
        bottom: 20,
        right: -5,
        opacity: 0.2,
        textTransform: 'uppercase'
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
        borderRadius: 10,
        padding: Platform.OS == 'ios' ? 15 : 10
    },
    dobSeperator: {
        fontSize: 30,
        fontFamily: 'Qatar',
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
        backgroundColor: '#1a491e',
        height: 48,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 15
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
        lineHeight: 14,
        padding: 15,
        backgroundColor: '#F4F4F4',
        marginBottom: 16,
        color: 'black',
        borderRadius: 10,
    },
    hint: {
        color: '#525252',
        fontSize: 12,
        fontFamily: 'Acumin',
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
        fontFamily: 'Acumin',
    }
});
