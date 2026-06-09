import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useLanguage } from '../../context/language';
import { useRegistration } from '../../context/registration';

const { width } = Dimensions.get('window');
// const featuredClubs = [
//     { label: 'FC Barcelona', icon: require('../../assets/fcb.png') },
//     { label: 'Manchester United', icon: require('../../assets/manun.png') },
//     { label: 'Juventus FC', icon: require('../../assets/juvi.png') },
//     { label: 'Bayern Munich', icon: require('../../assets/bayern.png') },
//     { label: 'Paris Saint-Germain (PSG)', icon: require('../../assets/psg.png') },
// ];

export default function WizardStep4() {
    const router = useRouter();
    const { isRTL, t } = useLanguage();
    const [featuredClubs, setFeaturedClubs] = useState<{ label: string; icon: any }[]>([]);
    const [loadingClubs, setLoadingClubs] = useState(true);
    const [keyword, setKeyword] = useState('');
    const { formData, updateFormData } = useRegistration();
    // const [independent, setIndependent] = useState<boolean>(formData.clubs === [] ? true : false);
    const [independent, setIndependent] = useState<boolean>(true);
    const [selected, setSelected] = useState<any[]>(formData.clubs === [] ? [] : (formData.clubs || []));
    const [error, setError] = useState<string | null>(null);
    const [searching, setSearching] = useState(false);
    const [debounceTimeout, setDebounceTimeout] = useState<any>(null);

    useEffect(() => {
        const checkAuth = async () => {
            const token = await SecureStore.getItemAsync('userToken');
            if (token) {
                router.replace('/profile'); // Redirect if token exists
            }
        };

        const fetchClubs = async () => {
            try {
                const url =
                    formData.type == 'Association'
                        ? `https://server.riyadah.app/api/users/clubs?sport=${encodeURIComponent(formData.sport[0])}`
                        : `https://server.riyadah.app/api/users/clubs`;

                const res = await fetch(url);
                const json = await res.json();

                if (json.success) {
                    const formatted = json.data.map(club => ({
                        id: club._id,
                        label: club.name,
                        icon: club.image ? { uri: club.image } : require('../../assets/clublogo.png'),
                        visible: true
                    }));
                    setFeaturedClubs(formatted);
                } else {
                    console.error('Failed to fetch clubs');
                }

            } catch (err) {
                console.error('Error fetching clubs:', err);
            } finally {
                setLoadingClubs(false);
            }
        };

        fetchClubs();
        checkAuth();
    }, []);

    const toggleCheckbox = () => {
        setIndependent(prev => !prev);
    };

    const handleNext = () => {
        if (!independent && selected.length === 0) {
            setError(t('wizard.selectClubRequired'))
            return;
        }

        if (independent) {
            updateFormData({ clubs: [] });
            setSelected([])
        } else {
            updateFormData({ clubs: [selected] });
        }

        router.push('/wizard/step5')
    }

    const toggleClubSelection = (clubid: string) => {
        if (formData.type == 'Association') {
            // Toggle club in multi-select
            setSelected(prev =>
                prev.includes(clubid) ? prev.filter(c => c !== clubid) : [...prev, clubid]
            );
        } else {
            // Single select
            setSelected([clubid]);
        }
    };

    const handleSearchInput = (text: string) => {
        setKeyword(text);
        setSearching(true);

        if (text.trim().length < 3) {
            setFeaturedClubs(prev =>
                prev.map(club => ({ ...club, visible: true }))
            );
            setSearching(false);
            return;
        }

        if (debounceTimeout) clearTimeout(debounceTimeout);

        const timeout = setTimeout(() => {
            const lowerKeyword = text.trim().toLowerCase();

            setFeaturedClubs(prev =>
                prev.map(club => ({
                    ...club,
                    visible: club.label.toLowerCase().includes(lowerKeyword)
                }))
            );

            setSearching(false);
        }, 500);

        setDebounceTimeout(timeout);
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
                        {formData.type == 'Association' ? t('wizard.addClubs') : t('wizard.selectClub')}
                    </Text>
                    <Text style={[styles.pageDesc, isRTL && styles.rtlText]}>
                        {formData.type == 'Association' ? t('wizard.associationClubsQuestion') : t('wizard.athleteClubQuestion')}
                    </Text>
                </View>

                <Text style={[styles.ghostText, isRTL && styles.ghostTextRtl]}>
                    {formData.type == 'Association' ? t('wizard.clubsGhost') : t('wizard.clubGhost')}
                </Text>
            </View>

            {loadingClubs ? (
                <View>
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="small" color="#FF4000" />
                    </View>
                </View>
            ) : (
                <>
                    <View style={styles.form}>
                        {error != null && <View style={[styles.error,isRTL&&{flexDirection:'row-reverse'}]}>
                            <View style={[styles.errorIcon,isRTL&&{marginRight:0,marginLeft:15}]}></View>
                            <Text style={styles.errorText}>{error}</Text>
                        </View>}

                        {formData.type != 'Association' && <TouchableOpacity onPress={toggleCheckbox} style={styles.checkboxContainer} activeOpacity={1} disabled={true}>
                            <View style={styles.checkbox}>
                                {independent && <View style={styles.checked} >
                                    <Image source={require('../../assets/check.png')} style={styles.checkImage} />
                                </View>}
                            </View>

                            <Text style={[styles.label, isRTL && styles.rtlText]}>
                                {t('wizard.noClubIndependent')}
                            </Text>
                        </TouchableOpacity>}
                        <Text style={[styles.hint, isRTL && styles.rtlText]}>
                            {t('wizard.athleteIndependentHint')}
                        </Text>
                        <Text style={[styles.hint, isRTL && styles.rtlText]}>
                            {t('wizard.athleteClubContactHint')}
                        </Text>

                        {!independent &&
                            <View style={styles.searchContainer}>
                                <TextInput
                                    style={styles.input}
                                    value={keyword}
                                    onChangeText={handleSearchInput}
                                    placeholderTextColor="#888888"
                                    placeholder={t('wizard.searchClubs')}
                                />
                                {searching && (
                                    <ActivityIndicator
                                        size="small"
                                        color="#FF4000"
                                        style={styles.searchLoader}
                                    />
                                )}
                            </View>
                        }
                    </View>

                    {!independent && <ScrollView
                        style={{ flex: 1 }}
                        contentContainerStyle={{ paddingBottom: 120 }}
                        showsVerticalScrollIndicator={false}
                    >
                        <View style={styles.wizardContainer}>
                            {(() => {
                                const visibleClubs = featuredClubs.filter(club => club.visible);

                                if (visibleClubs.length === 0 && keyword.trim().length >= 3) {
                                    return (
                                        <Text style={[styles.paragraph, isRTL && styles.rtlText]}>
                                            {t('wizard.noClubsFound', { keyword })}
                                        </Text>
                                    );
                                }

                                return visibleClubs.map((club) => {
                                    const isSelected = selected.includes(club.id);
                                    return (
                                        <TouchableOpacity
                                            key={club.id}
                                            style={[
                                                styles.accountOption,
                                                isSelected && styles.accountOptionSelected
                                            ]}
                                            onPress={() => toggleClubSelection(club.id)}
                                        >
                                            <Image source={club.icon} style={styles.icon} resizeMode="contain" />
                                            <Text
                                                style={[
                                                    styles.accountText,
                                                    isSelected && styles.accountTextSelected,
                                                    isRTL && styles.rtlText
                                                ]}
                                            >
                                                {club.label}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                });
                            })()}
                        </View>
                    </ScrollView>
                    }
                </>
            )}

            {!loadingClubs && <View style={styles.fixedBottomSection}>
                <TouchableOpacity style={styles.fullButtonRow} onPress={handleNext}>
                    {/* <Image source={require('../../assets/buttonBefore_black.png')} style={styles.sideRect} /> */}
                    <View style={styles.loginButton}>
                        <Text style={styles.loginText}>{t('wizard.next')}</Text>
                    </View>
                    {/* <Image source={require('../../assets/buttonAfter_black.png')} style={styles.sideRectAfter} /> */}
                </TouchableOpacity>
            </View>}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
        flex: 1,
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
        maxWidth: 200
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
        textTransform: 'uppercase',
        fontFamily: 'Qatar',
        position: 'absolute',
        bottom: 20,
        right: -5,
        color: '#ff6633',
        width: '100%',
        textAlign: 'right',
        maxHeight: 200,
        lineHeight: 200
    },
    ghostTextRtl: {
        right: undefined,
        left: -5,
        textAlign: 'left',
    },
    fullButtonRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 4,
    },
    paragraph: {
        fontSize: 14,
        fontFamily: 'Acumin',
        color: 'black'
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
        fontSize: 16,
        color: '#333',
        fontFamily: 'Acumin',
    },
    icon: {
        width: 60,
        height: 60,
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
        bottom: 50,
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
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    checkbox: {
        width: 16,
        height: 16,
        borderWidth: 1,
        borderColor: '#000',
        marginRight: 10,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 5
    },
    checked: {
        width: 16,
        height: 16,
        backgroundColor: '#FF4400',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 5
    },
    checkImage: {
        width: 16,
        height: 16,
        resizeMode: 'contain',
        tintColor: '#fff'
    },
    label: {
        color: '#000000',
        fontFamily: 'Acumin'
    },
    hint: {
        color: '#888',
        fontFamily: 'Acumin',
        fontSize: 14,
        lineHeight: 18
    },
    rtlText: {
        textAlign: 'right',
        writingDirection: 'rtl',
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
    loadingContainer: {
        paddingHorizontal: 20,
        alignItems: 'flex-start'
    },
    searchContainer: {
        position: 'relative'
    },
    searchLoader: {
        position: 'absolute',
        top: 15,
        right: 10,
    },
});
