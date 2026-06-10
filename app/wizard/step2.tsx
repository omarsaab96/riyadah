import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useEffect, useRef, useState } from 'react';
import { Dimensions, Image, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useLanguage } from '../../context/language';
import { useRegistration } from '../../context/registration';

const { width } = Dimensions.get('window');

export default function WizardStep2() {
    const router = useRouter();
    const { isRTL, t } = useLanguage();
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
                setError(t('wizard.monthRequired'));
                return;
            }
            if (!day?.length) {
                setShowParentEmail(false);
                setError(t('wizard.dayRequired'));
                return;
            }
            if (!year?.length) {
                setShowParentEmail(false);
                setError(t('wizard.yearRequired'));
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
            setError(t('wizard.invalidDate'));
            return;
        }

        const dayNum = parseInt(day, 10);
        const monthNum = parseInt(month, 10);
        const yearNum = parseInt(year, 10);

        // Guard against NaN
        if (Number.isNaN(dayNum) || Number.isNaN(monthNum) || Number.isNaN(yearNum)) {
            setShowParentEmail(false);
            setError(t('wizard.numbersOnlyDate'));
            return;
        }

        // Validate month
        if (monthNum < 1 || monthNum > 12) {
            setShowParentEmail(false);
            setError(t('wizard.monthRange'));
            return;
        }

        // Max days in month (handles leap years)
        const getDaysInMonth = (m, y) => new Date(y, m, 0).getDate(); // m is 1–12
        const maxDay = getDaysInMonth(monthNum, yearNum);

        // Validate day
        if (dayNum < 1 || dayNum > maxDay) {
            setShowParentEmail(false);
            setError(t('wizard.dayRange', { maxDay }));
            return;
        }

        const dob = `${year.padStart(4, '0')}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        const dobDate = new Date(dob);
        const today = new Date();

        // Basic validity checks
        if (isNaN(dobDate.getTime())) {
            setShowParentEmail(false);
            setError(t('wizard.invalidDate'));
            return;
        }

        if (dobDate > today) {
            setShowParentEmail(false);
            setError(t('wizard.futureDate'));
            return;
        }

        const age = calculateAge(dob);

        if (age < 18 && formData.type === "Parent") {
            setShowParentEmail(false);
            setError(t('wizard.parentUnder18'));
            return;
        }

        if (age < 18 && formData.type === "Scout") {
            setShowParentEmail(false);
            setError(t('wizard.scoutUnder18'));
            return;
        }

        if (age < 18 && formData.type === "Sponsor") {
            setShowParentEmail(false);
            setError(t('wizard.sponsorUnder18'));
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
            setError(t('wizard.invalidDate'));
            return;
        }

        if (dobDate > today) {
            setError(t('wizard.futureDate'));
            return;
        }

        if (formData.type == "Scout" || formData.type == "Sponsor") {
            if (day != null && month != null && year != null && day.trim() != '' && month.trim() != '' && year.trim() != '') {
                const age = calculateAge(dob);
                if ((formData.type == "Scout" || formData.type == "Sponsor") && age < 18) {
                    setError(formData.type === 'Scout' ? t('wizard.scoutUnder18') : t('wizard.sponsorUnder18'))
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
                setError(t('wizard.fillAllFields'))
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
                setError(t('wizard.fillAllFields'))
            }

        } else {
            const age = calculateAge(dob);

            if (formData.type == "Parent" && age < 18) {
                setError(t('wizard.parentUnder18'))
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
                if(!formData.personalAccount || formData.type == "Parent"){
                    router.push('/wizard/step5');
                }else{
                    router.push('/wizard/step3')
                }

            } else {
                setError(t('wizard.fillAllFields'))
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

                {(formData.type != "Club" && formData.type != "Association") && <View style={[styles.headerTextBlock, isRTL && styles.headerTextBlockRtl]}>
                    <Text style={styles.pageTitle}>{t('wizard.dobTitle')}</Text>
                    <Text style={[styles.pageDesc, isRTL && styles.rtlText]}>{t('wizard.dobDesc')}</Text>
                </View>
                }

                {(formData.type == "Club" || formData.type == "Association") && <View style={[styles.headerTextBlock, isRTL && styles.headerTextBlockRtl]}>
                    <Text style={styles.pageTitle}>{t('wizard.establishedTitle')}</Text>
                    <Text style={[styles.pageDesc, isRTL && styles.rtlText]}>
                        {formData.type == "Club" ? t('wizard.establishedDescClub') : t('wizard.establishedDescAssociation')}
                    </Text>
                </View>
                }

                <Text style={[styles.ghostText, isRTL && styles.ghostTextRtl]}>
                    {(formData.type == "Club" || formData.type == "Association") ? t('wizard.sinceGhost') : t('wizard.dobGhost')}
                </Text>
            </View>

            <View style={styles.form}>
                {error != null && <View style={[styles.error,isRTL&&{flexDirection:'row-reverse'}]}>
                    <View style={[styles.errorIcon,isRTL&&{marginRight:0,marginLeft:15}]}></View>
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
                        <Text style={[styles.hint, isRTL && styles.rtlText]}>{t('wizard.parentEmailHint')}</Text>

                        <TextInput
                            style={[styles.input, isRTL && styles.rtlText]}
                            placeholder={t('wizard.parentEmail')}
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
                        <Text style={styles.loginText}>{t('wizard.next')}</Text>
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
        width: 120,
        height: 40,
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
        fontFamily: 'Acumin',
    },
    ghostText: {
        fontSize: 100,
        fontFamily: 'Qatar',
        position: 'absolute',
        bottom: 20,
        right: -5,
        color:'#ff6633',
        textTransform: 'uppercase',
    maxHeight:200,
    lineHeight:200
    },
    ghostTextRtl: {
        right: undefined,
        left: -5,
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
    rtlText: {
        textAlign: 'right',
        writingDirection: 'rtl',
    },
});
