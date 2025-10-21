import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
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
    const [featuredClubs, setFeaturedClubs] = useState<{ label: string; icon: any }[]>([]);
    const [loadingClubs, setLoadingClubs] = useState(true);
    const [keyword, setKeyword] = useState('');
    const { formData, updateFormData } = useRegistration();
    const [independent, setIndependent] = useState<boolean>(formData.clubs === [] ? true : false);
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
                        ? `http://193.187.132.170:5000/api/users/clubs?sport=${encodeURIComponent(formData.sport[0])}`
                        : `http://193.187.132.170:5000/api/users/clubs`;

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
            setError('Kindly select a club')
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

    const toggleClubSelection = (clubLabel: string) => {
        if (formData.type == 'Association') {
            // Toggle club in multi-select
            setSelected(prev =>
                prev.includes(clubLabel) ? prev.filter(c => c !== clubLabel) : [...prev, clubLabel]
            );
        } else {
            // Single select
            setSelected([clubLabel]);
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

                <View style={styles.headerTextBlock}>
                    <Text style={styles.pageTitle}>
                        {formData.type == 'Association' ? 'Add clubs' : 'Select your club'}
                    </Text>
                    <Text style={styles.pageDesc}>
                        {formData.type == 'Association' ? 'What clubs fit under your association?' : 'What club do you play with?'}
                    </Text>
                </View>

                <Text style={styles.ghostText}>
                    Club{formData.type == 'Association' ? 's' : ''}
                </Text>
            </View>

            {loadingClubs ? (
                <View>
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="small" color="#FF4000" />
                    </View>
                </View>
            ) : (
                <View>
                    <View style={styles.form}>
                        {error != null && <View style={styles.error}>
                            <View style={styles.errorIcon}></View>
                            <Text style={styles.errorText}>{error}</Text>
                        </View>}

                        {formData.type != 'Association' && <TouchableOpacity onPress={toggleCheckbox} style={styles.checkboxContainer} activeOpacity={1}>
                            <View style={styles.checkbox}>
                                {independent && <View style={styles.checked} >
                                    <Image source={require('../../assets/check.png')} style={styles.checkImage} />
                                </View>}
                            </View>

                            <Text style={styles.label}>
                                I don't have a club. I am independent
                            </Text>
                        </TouchableOpacity>}

                        {!independent &&
                            <View style={styles.searchContainer}>
                                <TextInput
                                    style={styles.input}
                                    value={keyword}
                                    onChangeText={handleSearchInput}
                                    placeholderTextColor="#888888"
                                    placeholder="Search clubs (Min. 3 characters)"
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

                    {!independent && <ScrollView >
                        <View style={styles.wizardContainer}>
                            {(() => {
                                const visibleClubs = featuredClubs.filter(club => club.visible);

                                if (visibleClubs.length === 0 && keyword.trim().length >= 3) {
                                    return (
                                        <Text style={styles.paragraph}>
                                            No clubs found for '<Text style={{ fontWeight: 'bold' }}>{keyword}</Text>'
                                        </Text>
                                    );
                                }

                                return visibleClubs.map(({ label, icon }) => {
                                    const isSelected = selected.includes(label);
                                    return (
                                        <TouchableOpacity
                                            key={label}
                                            style={[
                                                styles.accountOption,
                                                isSelected && styles.accountOptionSelected
                                            ]}
                                            onPress={() => toggleClubSelection(label)}
                                        >
                                            <Image source={icon} style={styles.icon} resizeMode="contain" />
                                            <Text
                                                style={[
                                                    styles.accountText,
                                                    isSelected && styles.accountTextSelected
                                                ]}
                                            >
                                                {label}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                });
                            })()}
                        </View>
                    </ScrollView>
                    }
                </View>
            )}

            {!loadingClubs && <View style={styles.fixedBottomSection}>
                <TouchableOpacity style={styles.fullButtonRow} onPress={handleNext}>
                    <Image source={require('../../assets/buttonBefore_black.png')} style={styles.sideRect} />
                    <View style={styles.loginButton}>
                        <Text style={styles.loginText}>next</Text>
                    </View>
                    <Image source={require('../../assets/buttonAfter_black.png')} style={styles.sideRectAfter} />
                </TouchableOpacity>
            </View>}
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
        marginBottom: 10
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
    fullButtonRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 4,
    },
    paragraph: {
        fontSize: 14,
        fontFamily: 'Manrope',
        color:'black'
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
    wizardContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingBottom: 80
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
        fontFamily: 'Manrope'
    },
    accountOptionSelected: {
        borderColor: '#FF4000',
        backgroundColor: '#FFE6D8',
        fontFamily: 'Manrope'
    },
    accountText: {
        fontSize: 16,
        color: '#333',
        fontFamily: 'Manrope',
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
        fontFamily: 'Manrope'
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