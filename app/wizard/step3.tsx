import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { useLanguage } from '../../context/language';
import { useRegistration } from '../../context/registration';

const { width } = Dimensions.get('window');

export default function WizardStep3() {
    const router = useRouter();
    const { isRTL, t } = useLanguage();
    const { formData, updateFormData } = useRegistration();
    const [selected, setSelected] = useState<string[]>(formData.type === "Club" && Array.isArray(formData.sport) ? formData.sport : (formData.type === "Athlete" && formData.role === "Coach") && Array.isArray(formData.sport) ? formData.sport : []);
    const [error, setError] = useState<string | null>(null);
    const [independent, setIndependent] = useState<boolean>(formData.organization.independent ? true : false);
    const [orgName, setOrgName] = useState<string | null>(formData.organization.name || null);
    const [orgLocation, setOrgLocation] = useState<string | null>(formData.organization.location || null);
    const [orgRole, setOrgRole] = useState<string | null>(formData.organization.role || null);
    const [orgSince, setOrgSince] = useState<string | null>(formData.organization.since || null);
    const [sportsLoading, setSportsLoading] = useState(false);
    const [sportTypes, setSportTypes] = useState<any[]>([]);

    useEffect(() => {
        const checkAuth = async () => {
            const token = await SecureStore.getItemAsync('userToken');
            if (token) {
                router.replace('/profile');
            }
        };
        checkAuth();

        if (formData.sport) {
            setSelected(formData.sport)
        }

        const fetchSports = async () => {
            try {
                setSportsLoading(true);
                const response = await fetch('https://server.riyadah.app/api/sports');
                if (response.ok) {
                    const data = await response.json();
                    const options = Array.isArray(data.data) ? data.data : data;
                    setSportTypes(Array.isArray(options) ? options : []);
                } else {
                    setSportTypes([]);
                }
            } catch (err) {
                console.error('Failed to fetch sports', err);
                setSportTypes([]);
            } finally {
                setSportsLoading(false);
            }
        };

        fetchSports();
    }, []);

    const handleNext = () => {
        if (selected.length > 0) {
            updateFormData({ sport: selected });

            if (formData.type === "Scout" || formData.type === "Sponsor") {
                if (independent) {
                    updateFormData({
                        organization: {
                            name: null,
                            role: null,
                            location: null,
                            since: null,
                            independent: true
                        }
                    });
                } else {
                    updateFormData({
                        organization: {
                            name: orgName,
                            role: orgRole,
                            location: orgLocation,
                            since: orgSince,
                            independent: false
                        }
                    });
                }
                router.push('/wizard/step5');
            } else if (formData.type === "Club") {
                router.push('/wizard/step5');
            } else {
                router.push('/wizard/step4');
            }
        } else {
            setError(t('wizard.selectSportType'));
        }
    };

    const toggleSportSelection = (label: string) => {
        if (formData.type === "Club" || formData.type === "Scout" || formData.type === "Sponsor") {
            setSelected(prev =>
                prev.includes(label)
                    ? prev.filter(item => item !== label)
                    : [...prev, label]
            );
        } else {
            setSelected([label]);
        }
    };

    const toggleCheckbox = () => {
        setIndependent(prev => !prev);
    };

    const handleNestedChange = (parentField: string, fieldName: string, value: string) => {
        updateFormData(prev => ({
            ...prev,
            [parentField]: {
                ...prev[parentField],
                [fieldName]: value
            }
        }));
    };

    return (
        <View style={styles.container}>
            <View style={styles.pageHeader}>
                <Image
                    source={require('../../assets/logo_white.png')}
                    style={styles.logo}
                    resizeMode="contain"
                />
                <View style={[styles.headerTextBlock, isRTL && styles.headerTextBlockRtl]}>
                    <Text style={styles.pageTitle}>
                        {(formData.type !== "Scout" && formData.type !== "Sponsor") ? t('wizard.sportType') : t('wizard.organization')}
                    </Text>
                    <Text style={[styles.pageDesc, isRTL && styles.rtlText]}>
                        {(formData.type !== "Scout" && formData.type !== "Sponsor") ? t('wizard.whatDoYouDo') : t('wizard.organizationQuestion')}
                    </Text>
                </View>
                <Text style={[styles.ghostText, isRTL && styles.ghostTextRtl]}>
                    {(formData.type !== "Scout" && formData.type !== "Sponsor") ? t('wizard.sportGhost') : t('wizard.organizationGhost')}
                </Text>
            </View>

            {(formData.type === "Scout" || formData.type === "Sponsor") && (
                <View>
                    <View style={styles.form}>
                        {error && (
                            <View style={[styles.error,isRTL&&{flexDirection:'row-reverse'}]}>
                                <View style={[styles.errorIcon,isRTL&&{marginRight:0,marginLeft:15}]}></View>
                                <Text style={styles.errorText}>{error}</Text>
                            </View>
                        )}
                        <TouchableOpacity onPress={toggleCheckbox} style={styles.checkboxContainer} activeOpacity={1}>
                            <View style={styles.checkbox}>
                                {independent && (
                                    <View style={styles.checked}>
                                        <Image source={require('../../assets/check.png')} style={styles.checkImage} />
                                    </View>
                                )}
                            </View>
                            <Text style={[styles.label, isRTL && styles.rtlText]}>
                                {t('wizard.noOrganization')}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {!independent && (
                        <View style={styles.form}>
                            <View style={styles.entity}>
                                <Text style={[styles.title, isRTL && styles.rtlText]}>{t('wizard.organizationName')}</Text>
                                <TextInput
                                    style={[styles.input, isRTL && styles.rtlText]}
                                    placeholder={t('wizard.organizationName')}
                                    placeholderTextColor="#A8A8A8"
                                    value={formData.organization?.name}
                                    onChangeText={setOrgName}
                                />
                            </View>
                            <View style={styles.entity}>
                                <Text style={[styles.title, isRTL && styles.rtlText]}>{t('wizard.organizationLocation')}</Text>
                                <TextInput
                                    style={[styles.input, isRTL && styles.rtlText]}
                                    placeholder={t('wizard.organizationLocation')}
                                    placeholderTextColor="#A8A8A8"
                                    value={formData.organization?.location}
                                    onChangeText={setOrgLocation}
                                />
                            </View>
                            <View style={styles.entity}>
                                <Text style={[styles.title, isRTL && styles.rtlText]}>{t('wizard.organizationRole')}</Text>
                                <TextInput
                                    style={[styles.input, isRTL && styles.rtlText]}
                                    placeholder={t('wizard.organizationRole')}
                                    placeholderTextColor="#A8A8A8"
                                    value={formData.organization?.role}
                                    onChangeText={setOrgRole}
                                />
                            </View>
                            <View style={styles.entity}>
                                <Text style={[styles.title, isRTL && styles.rtlText]}>{t('wizard.organizationSince')}</Text>
                                <TextInput
                                    style={[styles.input, isRTL && styles.rtlText]}
                                    placeholder="YYYY"
                                    placeholderTextColor="#A8A8A8"
                                    value={formData.organization.since}
                                    onChangeText={setOrgSince}
                                />
                            </View>
                        </View>
                    )}

                    <View style={styles.form}>
                        <Text style={[styles.title, isRTL && styles.rtlText]}>{t('wizard.sportsInterested')}</Text>
                    </View>
                </View>
            )}

            <View style={styles.form}>
                {error && (
                    <View style={[styles.error,isRTL&&{flexDirection:'row-reverse'}]}>
                        <View style={[styles.errorIcon,isRTL&&{marginRight:0,marginLeft:15}]}></View>
                        <Text style={styles.errorText}>{error}</Text>
                    </View>
                )}
            </View>

            <ScrollView>
                <View style={styles.wizardContainer}>
                    {sportsLoading && (
                        <Text style={styles.paragraph}>
                            <ActivityIndicator size="small" color="#FF4000" />
                        </Text>
                    )}
                    {!sportsLoading && sportTypes.length === 0 && (
                        <Text style={[styles.paragraph, isRTL && styles.rtlText]}>{t('wizard.noSportsAvailable')}</Text>
                    )}
                    {!sportsLoading && sportTypes.map((sport) => {
                        const isSelected = selected.includes(sport.name);
                        return (
                            <TouchableOpacity
                                key={sport._id || sport.name}
                                style={[
                                    styles.accountOption,
                                    isSelected && styles.accountOptionSelected
                                ]}
                                onPress={() => toggleSportSelection(sport.name)}
                            >
                                <Image
                                    source={sport.icon ? { uri: sport.icon } : require('../../assets/athlete.png')}
                                    style={styles.icon}
                                    resizeMode="contain"
                                />
                                <Text
                                    style={[
                                        styles.accountText,
                                        isSelected && styles.accountTextSelected,
                                        isRTL && styles.rtlText
                                    ]}
                                >
                                    {sport.name}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </ScrollView>

            <View style={styles.fixedBottomSection}>
                <TouchableOpacity style={styles.fullButtonRow} onPress={handleNext}>
                    {/* <Image source={require('../../assets/buttonBefore_black.png')} style={styles.sideRect} /> */}
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
        height: '100%'
    },
    pageHeader: {
        backgroundColor: '#FF4000',
        height: 270,
        marginBottom: 30
    },
    logo: {
        width: 120,
        height: 40,
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
        fontSize: 100, textTransform: 'uppercase',
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
        marginLeft: -1
    },
    wizardContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingBottom: 100
    },
    accountOption: {
        borderWidth: 1,
        borderColor: '#ccc',
        paddingVertical: 10,
        paddingHorizontal: 10,
        borderRadius: 10,
        marginBottom: 16,
        backgroundColor: '#f9f9f9',
        width: (width - 60) / 2,
        position: 'relative',
        height: 120,
        fontFamily: 'Acumin'
    },
    accountOptionSelected: {
        borderColor: '#FF4000',
        backgroundColor: '#FFE6D8',
        fontFamily: 'Acumin'
    },
    accountText: {
        fontSize: 18,
        color: '#333',
        fontFamily: 'Acumin',
    },
    icon: {
        width: 80,
        height: 80,
        position: 'absolute',
        bottom: 0,
        right: 0
    },
    accountTextSelected: {
        color: '#FF4000',
        fontWeight: 'bold',
    },
    fixedBottomSection: {
        position: 'absolute',
        bottom: 45,
        left: 0,
        width: width,
        paddingLeft: 20,
        paddingRight: 20
    },
    form: {
        paddingLeft: 20,
        paddingRight: 20
    },
    input: {
        fontSize: 14,
        padding: 15,
        backgroundColor: '#F4F4F4',
        marginBottom: 16,
        color: 'black',
        borderRadius: 10
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
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20
    },
    checkbox: {
        width: 16,
        height: 16,
        borderWidth: 1,
        borderColor: '#000000',
        marginRight: 10,
        justifyContent: 'center',
        alignItems: 'center'
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
    label: {
        color: '#000000',
        fontFamily: 'Acumin'
    },
    entity: {
        marginBottom: 20
    },
    title: {
        fontFamily: "Qatar",
        fontSize: 20,
        marginBottom: 10
    },
    paragraph: {
        fontSize: 14,
        fontFamily: 'Acumin',
        color: 'black'
    },
});
