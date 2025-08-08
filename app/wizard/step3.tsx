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
import { useRegistration } from '../../context/registration';

const { width } = Dimensions.get('window');

export default function WizardStep3() {
    const router = useRouter();
    const [keyword, setKeyword] = useState('');
    const { formData, updateFormData } = useRegistration();
    const [selected, setSelected] = useState<string[]>(formData.type === "Club" && Array.isArray(formData.sport) ? formData.sport : []);
    const [error, setError] = useState<string | null>(null);
    const [independent, setIndependent] = useState<boolean>(formData.organization.independent ? true : false);
    const [orgName, setOrgName] = useState<string | null>(formData.organization.name || null);
    const [orgLocation, setOrgLocation] = useState<string | null>(formData.organization.location || null);
    const [orgRole, setOrgRole] = useState<string | null>(formData.organization.role || null);
    const [orgSince, setOrgSince] = useState<string | null>(formData.organization.since || null);
    const [searching, setSearching] = useState(false);
    const [debounceTimeout, setDebounceTimeout] = useState<any>(null);
    const [sportTypes, setSportTypes] = useState([
        { label: 'Football', icon: require('../../assets/football.png'), visible: true },
        { label: 'Basketball', icon: require('../../assets/basketball.png'), visible: true },
        { label: 'Gymnastics', icon: require('../../assets/gymnastics.png'), visible: true },
        { label: 'Racing', icon: require('../../assets/racing.png'), visible: true },
        { label: 'Golf', icon: require('../../assets/golf.png'), visible: true }
    ]);

    useEffect(() => {
        const checkAuth = async () => {
            const token = await SecureStore.getItemAsync('userToken');
            if (token) {
                router.replace('/profile');
            }
        };
        checkAuth();
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
            setError('Kindly select a sport type');
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

    const handleSearchInput = (text: string) => {
        setKeyword(text);

        if (text.trim().length < 3) {
            setSportTypes(prev =>
                prev.map(sport => ({ ...sport, visible: true }))
            );
            return;
        }

        if (debounceTimeout) clearTimeout(debounceTimeout);

        const timeout = setTimeout(() => {
            const lowerKeyword = text.trim().toLowerCase();

            setSportTypes(prev =>
                prev.map(sport => ({
                    ...sport,
                    visible: sport.label.toLowerCase().includes(lowerKeyword)
                }))
            );
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
                        {(formData.type !== "Scout" && formData.type !== "Sponsor") ? 'Sport type' : 'Organization'}
                    </Text>
                    <Text style={styles.pageDesc}>
                        {(formData.type !== "Scout" && formData.type !== "Sponsor") ? 'What do you do?' : 'What organization do you work for?'}
                    </Text>
                </View>
                <Text style={styles.ghostText}>
                    {(formData.type !== "Scout" && formData.type !== "Sponsor") ? 'Sport' : 'Organi'}
                </Text>
            </View>

            {(formData.type === "Scout" || formData.type === "Sponsor") && (
                <View>
                    <View style={styles.form}>
                        {error && (
                            <View style={styles.error}>
                                <View style={styles.errorIcon}></View>
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
                            <Text style={styles.label}>
                                I don't have an organization. I am independent
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {!independent && (
                        <View style={styles.form}>
                            <View style={styles.entity}>
                                <Text style={styles.title}>Organization name</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Organization name"
                                    placeholderTextColor="#A8A8A8"
                                    value={formData.organization?.name}
                                    onChangeText={setOrgName}
                                />
                            </View>
                            <View style={styles.entity}>
                                <Text style={styles.title}>Organization Location</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Organization Location"
                                    placeholderTextColor="#A8A8A8"
                                    value={formData.organization?.location}
                                    onChangeText={setOrgLocation}
                                />
                            </View>
                            <View style={styles.entity}>
                                <Text style={styles.title}>Your role in the organization</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Your role"
                                    placeholderTextColor="#A8A8A8"
                                    value={formData.organization?.role}
                                    onChangeText={setOrgRole}
                                />
                            </View>
                            <View style={styles.entity}>
                                <Text style={styles.title}>In what year did you start working here?</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="YYYY"
                                    placeholderTextColor="#A8A8A8"
                                    value={formData.organization.since}
                                    onChangeText={setOrgSince}
                                />
                            </View>
                        </View>
                    )}

                    <View style={styles.form}>
                        <Text style={styles.title}>What sports are you interested in?</Text>
                    </View>
                </View>
            )}

            <View style={styles.form}>
                {error && (
                    <View style={styles.error}>
                        <View style={styles.errorIcon}></View>
                        <Text style={styles.errorText}>{error}</Text>
                    </View>
                )}
                <View style={styles.searchContainer}>
                    <TextInput
                        style={styles.input}
                        value={keyword}
                        onChangeText={handleSearchInput}
                        placeholderTextColor="#888888"
                        placeholder="Search (Min. 3 characters)"
                    />
                    {searching && (
                        <ActivityIndicator
                            size="small"
                            color="#FF4000"
                            style={styles.searchLoader}
                        />
                    )}
                </View>
            </View>

            <ScrollView>
                <View style={styles.wizardContainer}>
                    {(() => {
                        const visibleSports = sportTypes.filter(sport => sport.visible);

                        if (visibleSports.length === 0) {
                            return (
                                <Text style={styles.noResultsText}>
                                    No sports found for '<Text style={{ fontWeight: 'bold' }}>{keyword}</Text>'
                                </Text>
                            );
                        }

                        return visibleSports.map(({ label, icon }) => {
                            const isSelected = selected.includes(label);
                            return (
                                <TouchableOpacity
                                    key={label}
                                    style={[
                                        styles.accountOption,
                                        isSelected && styles.accountOptionSelected
                                    ]}
                                    onPress={() => toggleSportSelection(label)}
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
        fontFamily: 'Manrope'
    },
    accountOptionSelected: {
        borderColor: '#FF4000',
        backgroundColor: '#FFE6D8',
        fontFamily: 'Manrope'
    },
    accountText: {
        fontSize: 18,
        color: '#333',
        fontFamily: 'Manrope',
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
    entity: {
        marginBottom: 20
    },
    title: {
        fontFamily: "Bebas",
        fontSize: 20,
        marginBottom: 10
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
