import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { jwtDecode } from "jwt-decode";
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { useLanguage } from '../../context/language';

const { width } = Dimensions.get('window');

export default function AddPayment() {
    const { isRTL, t } = useLanguage();
    const [userId, setUserId] = useState(null);
    const [user, setUser] = useState(null);
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [athletes, setAthletes] = useState([]);
    const [keyword, setKeyword] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searching, setSearching] = useState(false);
    const [debounceTimeout, setDebounceTimeout] = useState(null);
    const [searchindex, setSearchindex] = useState(0);
    const [selectedUser, setSelectedUser] = useState(null);
    const [paymentAmount, setPaymentAmount] = useState<Number|null>(null);
    const [paymentCurrency, setPaymentCurrency] = useState('EGP');
    const [paymentNote, setPaymentNote] = useState('');
    const [paymentDueDate, setPaymentDueDate] = useState(new Date());
    const [pickerShow, setPickerShow] = useState(false);
    const [isPaid, setIsPaid] = useState(false);
    const [paymentType, setPaymentType] = useState('Club registration fees');
    const [paymentTypeOther, setPaymentTypeOther] = useState('');
    const paymentTypeOptions = [
        { label: t('payments.registrationFees'), value: 'Club registration fees' },
        { label: t('payments.monthlyFees'), value: 'Monthly subscription fees' },
        { label: t('payments.equipmentPurchase'), value: 'Equipment purchase' },
        { label: t('payments.salary'), value: 'Salary' },
        { label: t('payments.other'), value: 'Other' },
    ];

    useEffect(() => {
        const fetchUser = async () => {
            const token = await SecureStore.getItemAsync('userToken');

            console.log(token)
            if (token) {
                const decodedToken = jwtDecode(token);
                console.log("DECODED: ", decodedToken)
                setUserId(decodedToken.userId);

                const response = await fetch(`https://server.riyadah.app/api/users/${decodedToken.userId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (response.ok) {
                    const user = await response.json();
                    setUser(user)
                } else {
                    console.error('API error')
                }
                setLoading(false)
            } else {
                console.log("no token",)
            }
        };

        fetchUser();
    }, []);

    useEffect(() => {
        // const fetchAthletes = async () => {
        //     try {
        //         const token = await SecureStore.getItemAsync('userToken');
        //         const response = await fetch(`https://server.riyadah.app/api/users/byclub/${userId}`, {
        //             method: 'GET',
        //             headers: {
        //                 'Content-Type': 'application/json'
        //             }
        //         });
        //         const data = await response.json();
        //         if (data.success) {
        //             setAthletes(data.data);
        //             setLoading(false)
        //         }
        //     } catch (error) {
        //         console.error('Error fetching teams:', error);
        //     }
        // };

        // fetchAthletes();
    }, [user]);

    const handleSearchInput = (text: string) => {
        setKeyword(text);
        if (text.trim().length < 3) {
            setSearchResults([]);
            return;
        }

        // Clear previous timeout
        if (debounceTimeout) clearTimeout(debounceTimeout);

        // Set new debounce timeout
        const timeout = setTimeout(() => {
            if (text.trim().length >= 3) {
                searchUsers(text);
            } else {
                setSearchResults([]);
            }
        }, 500); // delay: 500ms

        setDebounceTimeout(timeout);
    };

    const searchUsers = async (text: string) => {
        setSearchindex(1)

        try {
            setSearching(true);
            const token = await SecureStore.getItemAsync('userToken');
            const url = `https://server.riyadah.app/api/users/search?keyword=${encodeURIComponent(text)}`;
            console.log('Search URL:', url);

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();

                console.log('API Response:', data);
                setSearchResults(data);
            } else {
                Alert.alert(t('messages.errorTitle'), t('payments.failedSearchUsers'));
                setSearchResults([]);
            }
        } catch (error) {
            console.error('Error searching users:', error);
            Alert.alert(t('messages.errorTitle'), t('payments.failedSearchUsers'));
            setSearchResults([]);
        } finally {
            setSearching(false);
        }
    };

    const showPicker = () => {
        setPickerShow(true)
    };

    const onChange = (event, selectedDate) => {
        if (event.type === 'dismissed') {
            setPickerShow(false);
            return;
        }

        setPaymentDueDate(selectedDate);
        setPickerShow(false);
    };

    const handleSave = async () => {
        // if (paymentType == "Other" && paymentTypeOther.trim() == '') {
        //     setError('Kindly specify payment type')
        //     return;
        // }
        setSaving(true);
        setError('');

        const paymentObject = {
            beneficiary: selectedUser._id,
            payer: userId,
            amount: parseInt(paymentAmount),
            currency:paymentCurrency,
            type: paymentType == "Other" ? paymentTypeOther : paymentType,
            note: paymentNote,
            status: 'pending'
        };

        try {
            const token = await SecureStore.getItemAsync('userToken');
            if (!token) {
                setError(t('payments.userNotAuthenticated'));
                setSaving(false);
                return;
            }

            const response = await fetch('https://server.riyadah.app/api/financials', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(paymentObject)
            });

            if (!response.ok) {
                const errorData = await response.json();
                setError(errorData.message || t('payments.failedSave'));
                setSaving(false);
                return;
            }

            router.replace({
                pathname: '/profile',
                params: { tab: 'Financials' }
            })

        } catch (error) {
            console.error('Error saving payment:', error);
            setError(t('payments.unexpectedSave'));
            setSaving(false);
        }
    };

    const handleCancel = async () => {
        router.back()
    };

    const handleUserSelect = (user: any) => {
        setSelectedUser(user)
    };

    const handleClearSelection = () => {
        setSelectedUser(null);
        setKeyword('');
        setSearchResults([])
        setSearchindex(0)
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1 }}
        >
            <View style={styles.container}>
                <View style={styles.pageHeader}>
                    {/* <Image
                        source={require('../../assets/logo_white.png')}
                        style={styles.logo}
                        resizeMode="contain"
                    /> */}

                    <TouchableOpacity
                        onPress={() => {
                            router.replace({
                                pathname: '/profile',
                                params: { tab: 'Financials' }
                            })
                        }}
                        style={[styles.backBtn, isRTL && styles.backBtnRtl]}
                    >
                        <Ionicons name="chevron-back" size={20} color="#ffffff" />
                        <Text style={styles.backBtnText}>{t('payments.backToFinancials')}</Text>
                    </TouchableOpacity>

                    <View style={[styles.headerTextBlock, isRTL && styles.headerTextBlockRtl]}>
                        <Text style={styles.pageTitle}>{t('payments.newPayment')}</Text>
                        {!loading && <Text style={[styles.pageDesc, isRTL && styles.rtlText]}>{t('payments.createPaymentDesc')}</Text>}

                        {loading &&
                            <View style={[styles.loaderRow, isRTL && styles.loaderRowRtl]}>
                                <ActivityIndicator
                                    size="small"
                                    color="#fff"
                                    style={{ transform: [{ scale: 1.25 }] }}
                                />
                            </View>
                        }
                    </View>

                    <Text style={[styles.ghostText, isRTL && styles.ghostTextRtl]}>Payme</Text>
                </View>

                <ScrollView>
                    <View style={styles.contentContainer}>
                        {error != '' && <View style={styles.error}>
                            <View style={styles.errorIcon}></View>
                            <Text style={styles.errorText}>{error}</Text>
                        </View>}

                        {!selectedUser && <View style={styles.inputContainer}>
                            <Text style={[styles.label, isRTL && styles.rtlText]}>{t('payments.selectBeneficiary')}</Text>
                            <View style={styles.formGroup}>
                                <View style={styles.searchContainer}>
                                    <View style={{
                                        marginBottom: 16,
                                        flexDirection: 'row'
                                    }}>
                                        <TextInput
                                            style={[styles.input, { flex: 1, marginBottom: 0 }, isRTL && styles.rtlText]}
                                            placeholder={t('payments.searchBeneficiary')}
                                            placeholderTextColor="#A8A8A8"
                                            value={keyword}
                                            onChangeText={handleSearchInput}
                                        />
                                        {searching &&
                                            <ActivityIndicator
                                                size="small"
                                                color="#FF4000"
                                                style={styles.searchLoader}
                                            />
                                        }
                                    </View>
                                </View>

                                {!searching && !selectedUser && searchResults.length > 0 && (
                                    <View>
                                        <View style={styles.resultsContainer}>
                                            {searchResults.map((item) => (
                                                <TouchableOpacity
                                                    key={item._id}
                                                    style={styles.userItem}
                                                    onPress={() => handleUserSelect(item)}
                                                >
                                                    <Image
                                                        source={
                                                            item.image
                                                                ? { uri: item.image }
                                                                : require('../../assets/avatar.png')
                                                        }
                                                        style={[styles.userAvatar]}
                                                        resizeMode="contain"
                                                    />
                                                    <View style={[styles.userMetaRow, isRTL && styles.userMetaRowRtl]}>
                                                        <View>
                                                            <Text style={[styles.userName, isRTL && styles.rtlText]}>{item.name}</Text>
                                                            <Text style={[styles.userEmail, isRTL && styles.rtlText]}>{item.email}</Text>
                                                        </View>
                                                        <View>
                                                            <Text style={{ color: '#FF4000' }}>{t('payments.select')}</Text>
                                                        </View>
                                                    </View>
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                    </View>
                                )}

                                {!searching && !selectedUser && searchResults.length == 0 && searchindex > 0 && keyword.trim().length >= 3 && (
                                    <View style={[styles.resultsContainer, { borderWidth: 0 }]}>
                                        <Text style={[styles.noResultsTitle, isRTL && styles.rtlText]}>
                                            {t('payments.noResults')}
                                        </Text>

                                        <Text style={[styles.noResultsHint, isRTL && styles.rtlText]}>
                                            {t('payments.noResultsHint')}
                                        </Text>
                                    </View>
                                )}
                            </View>
                        </View>}

                        {selectedUser && <View>

                            <Text style={[styles.label, isRTL && styles.rtlText]}>{t('payments.selectedUser')}</Text>

                            <View style={[styles.selectedUserContainer, isRTL && styles.selectedUserContainerRtl]}>
                                <Image
                                    source={
                                        selectedUser.image != null
                                            ? { uri: selectedUser.image }
                                            : require('../../assets/avatar.png')
                                    }
                                    style={styles.userAvatar}
                                    resizeMode="contain"
                                />
                                <View style={styles.selectedUserInfo}>
                                    <Text style={[styles.selectedUserName, isRTL && styles.rtlText]}>{selectedUser.name}</Text>
                                    <Text style={[styles.selectedUserEmail, isRTL && styles.rtlText]}>{selectedUser.email}</Text>
                                </View>
                                <TouchableOpacity
                                    style={[styles.clearSelectionButton, isRTL && styles.clearSelectionButtonRtl]}
                                    onPress={handleClearSelection}
                                >
                                    <MaterialIcons name="close" size={20} color="#FF4000" />
                                </TouchableOpacity>
                            </View>

                            <View style={styles.inputContainer}>
                                <Text style={[styles.label, isRTL && styles.rtlText]}>{t('payments.amount')}</Text>

                                <View style={[styles.amountRow, isRTL && styles.amountRowRtl]}>
                                    <TextInput
                                        style={[styles.input, { flex: 1 }, isRTL && styles.rtlText]}
                                        placeholder={t('payments.amountPlaceholder')}
                                        placeholderTextColor={"#888"}
                                        keyboardType="numeric"
                                        value={paymentAmount?.toString() ?? ''}
                                        onChangeText={(text)=>{setPaymentAmount(parseInt(text))}}
                                    />
                                    <View style={[styles.pickerContainer, { flex: 1 }]}>
                                        <Picker
                                            style={styles.picker}
                                            selectedValue={paymentCurrency}
                                            onValueChange={setPaymentCurrency}
                                            enabled={false}
                                        >

                                            <Picker.Item label="EGP" value="EGP" />
                                            {/* <Picker.Item label="USD" value="USD" />
                                            <Picker.Item label="EUR" value="EUR" /> */}
                                        </Picker>
                                    </View>
                                </View>
                            </View>

                            <View style={styles.inputContainer}>
                                <Text style={[styles.label, isRTL && styles.rtlText]}>{t('payments.paymentType')}</Text>
                                <View style={[styles.pickerContainer, { flex: 1 }]}>
                                    <Picker
                                        style={styles.picker}
                                        onValueChange={setPaymentType}
                                        selectedValue={paymentType}
                                    >
                                        {paymentTypeOptions.map((option) => (
                                            <Picker.Item key={option.value} label={option.label} value={option.value} />
                                        ))}
                                    </Picker>
                                </View>
                                {paymentType == "Other" && <View style={styles.inputContainer}>
                                    <TextInput
                                        style={[styles.input,{marginBottom:0}, isRTL && styles.rtlText]}
                                        placeholderTextColor={"#888"}
                                        value={paymentTypeOther}
                                        onChangeText={setPaymentTypeOther}
                                        placeholder={t('payments.specifyPaymentType')}
                                    />
                                </View>}
                            </View>



                            <View style={styles.inputContainer}>
                                <Text style={[styles.label, isRTL && styles.rtlText]}>{t('payments.note')}</Text>
                                <TextInput
                                    style={[styles.input, isRTL && styles.rtlText]}
                                    placeholderTextColor={"#888"}
                                    value={paymentNote}
                                    onChangeText={(val) => setPaymentNote(val)}
                                    placeholder={t('payments.notePlaceholder')}
                                />
                            </View>

                            {/* <View style={styles.inputContainer}>
                                <Text style={styles.label}>Paid?</Text>

                                <View style={styles.statusContainer}>
                                    <TouchableOpacity
                                        style={[
                                            styles.statusButton,
                                            isPaid && styles.activeStatusButton
                                        ]}
                                        onPress={() => setIsPaid(true)}
                                    >
                                        <Text style={[
                                            styles.statusButtonText,
                                            isPaid && styles.activeStatusButtonText
                                        ]}>
                                            Yes
                                        </Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[
                                            styles.statusButton,
                                            !isPaid && styles.inactiveStatusButton
                                        ]}
                                        onPress={() => setIsPaid(false)}
                                    >
                                        <Text style={[
                                            styles.statusButtonText,
                                            !isPaid && styles.inactiveStatusButtonText
                                        ]}>
                                            No
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </View> */}

                            {/* {!isPaid && <View style={styles.inputContainer}>
                                <Text style={styles.label}>Due Date</Text>

                                <TouchableOpacity
                                    style={styles.dateInput}
                                    onPress={() => showPicker()}
                                >
                                    <Text style={styles.inputText}>
                                        {paymentDueDate.toLocaleDateString('en-US', {
                                            day: 'numeric',
                                            month: 'long',
                                            year: 'numeric'
                                        })}
                                    </Text>
                                    <FontAwesome5 name="calendar-alt" size={18} color="#666" />
                                </TouchableOpacity>
                            </View>} */}

                            {pickerShow && (
                                <DateTimePicker
                                    testID="dateTimePicker"
                                    value={paymentDueDate}
                                    mode='date'
                                    display="default"
                                    onChange={onChange}
                                />
                            )}

                            <View style={[styles.profileActions, styles.inlineActions, isRTL && styles.inlineActionsRtl]}>
                                <TouchableOpacity onPress={handleCancel} style={styles.profileButton}>
                                    <Text style={styles.profileButtonText}>{t('payments.cancel')}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={handleSave} style={[styles.profileButton, styles.savebtn]}>
                                    <Text style={styles.profileButtonText}>
                                        {saving ? t('payments.paying') : t('payments.pay')}
                                    </Text>
                                    {saving && (
                                        <ActivityIndicator
                                            size="small"
                                            color="#111111"
                                            style={styles.saveLoaderContainer}
                                        />
                                    )}
                                </TouchableOpacity>
                            </View>
                        </View>}
                    </View>
                </ScrollView>
            </View >
        </KeyboardAvoidingView >
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
        height: '100%'
    },
    inputContainer: {
        marginBottom: 15
    },
    label: {
        fontWeight: 'bold',
        marginBottom: 5,
        color: '#444'
    },
    input: {
        fontSize: 14,
        padding: 15,
        backgroundColor: '#F4F4F4',
        marginBottom: 20,
        color: 'black',
        borderRadius: 10
    },
    pickerContainer: {
        borderRadius: 8,
        overflow: 'hidden',
        marginBottom: 20,
    },
    picker: {
        width: '100%',
        fontFamily: 'Acumin',
        borderWidth: 0,
        backgroundColor: '#F4F4F4',
        color: 'black'
    },
    saveButton: {
        backgroundColor: '#FF4000',
        padding: 15,
        borderRadius: 6,
        alignItems: 'center',
        marginTop: 20
    },
    saveButtonText: {
        color: '#fff',
        fontWeight: 'bold'
    },
    pageHeader: {
        backgroundColor: '#FF4000',
        height: 270,
        // marginBottom: 30
    },
    logo: {
        width: 120 ,
        height:30,
        position: 'absolute',
        top: 30,
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
        left: undefined,
        right: 20,
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
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    headerTitle: {
        fontFamily: 'Qatar',
        fontSize: 24,
        color: '#111',
    },
    ghostText: {
        color: '#ffffff',
        fontSize:100,
        textTransform:'uppercase',
        fontFamily: 'Qatar',
        position: 'absolute',
        bottom: 20,
        right: -5,
        opacity: 0.2
    },
    ghostTextRtl: {
        right: undefined,
        left: -5,
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
    contentContainer: {
        padding: 20,
        paddingBottom: 130
    },
    formGroup: {
        marginBottom: 10,
    },
    searchLoader: {
        position: 'absolute',
        top: 15,
        right: 10,
    },
    resultsContainer: {

    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    userItem: {
        borderWidth: 1,
        borderColor: '#eee',
        borderRadius: 8,
        padding: 5,
        marginBottom: 10,
        flexDirection: 'row',
        alignItems: 'center'
    },
    userName: {
        fontFamily: 'Acumin',
        fontSize: 14,
        fontWeight: 'bold',
        color: 'black'
    },
    userEmail: {
        fontFamily: 'Acumin',
        color: '#666',
        fontSize: 14,
    },
    userMetaRow: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    userMetaRowRtl: {
        flexDirection: 'row-reverse',
    },
    userAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 10,
        backgroundColor: "#FF4000"
    },
    addStaffAccountBtn: {
        borderRadius: 5,
        padding: 10,
        backgroundColor: 'rgba(0,0,0,0.05)',
        marginBottom: 10,
        alignSelf: 'flex-start'
    },
    addStaffAccountBtnText: {
        fontSize: 16,
        color: '#150000',
        fontFamily: 'Qatar',
    },
    selectedUserContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        padding: 15,
        borderRadius: 8,
        marginBottom: 20,
    },
    selectedUserContainerRtl: {
        flexDirection: 'row-reverse',
    },
    selectedUserInfo: {
        flex: 1,
    },
    selectedUserName: {
        fontFamily: 'Acumin',
        fontWeight: 'bold',
        fontSize: 16,
        color: 'black'
    },
    selectedUserEmail: {
        fontFamily: 'Acumin',
        color: '#666',
        fontSize: 14,
    },
    clearSelectionButton: {
        marginLeft: 10,
    },
    clearSelectionButtonRtl: {
        marginLeft: 0,
        marginRight: 10,
    },
    dateInput: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: 14,
        padding: 15,
        backgroundColor: '#F4F4F4',
        marginBottom: 0,
        color: 'black',
        borderRadius: 10
    },
    inputText: {
        fontSize: 16,
        color: '#333',
    },
    statusContainer: {
        flexDirection: 'row',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        overflow: 'hidden',
        marginBottom: 10
    },
    statusButton: {
        flex: 1,
        padding: 12,
        alignItems: 'center',
    },
    activeStatusButton: {
        backgroundColor: '#FF4000',
    },
    inactiveStatusButton: {
        backgroundColor: '#111',
    },
    statusButtonText: {
        fontFamily: 'Acumin',
        fontWeight: 'bold',
        color: 'black'
    },
    activeStatusButtonText: {
        color: '#fff',
    },
    inactiveStatusButtonText: {
        color: '#fff',
    },
    profileActions: {
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.2)',
        paddingTop: 10
    },
    inlineActions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        columnGap: 15
    },
    inlineActionsRtl: {
        flexDirection: 'row-reverse',
    },
    saveLoaderContainer: {
        marginLeft: 10
    },
    profileButton: {
        borderRadius: 5,
        padding: 10,
        backgroundColor: 'rgba(0,0,0,0.05)',
        marginBottom: 10
    },
    profileButtonText: {textTransform:'uppercase',
        fontSize: 16,
        color: '#150000',
        fontFamily: 'Qatar',
    },
    savebtn: {
        flexDirection: 'row'
    },
    backBtn: {
        position: 'absolute',
        top: 60,
        left: 10,
        width: 200,
        zIndex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    backBtnRtl: {
        left: undefined,
        right: 10,
        flexDirection: 'row-reverse',
    },
    backBtnText: {
        color: '#FFF',
        fontSize: 18,
        fontFamily: 'Qatar'
    },
    loaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: 5,
    },
    loaderRowRtl: {
        flexDirection: 'row-reverse',
    },
    amountRow: {
        flexDirection: 'row',
        columnGap: 10,
    },
    amountRowRtl: {
        flexDirection: 'row-reverse',
    },
    noResultsTitle: {
        fontFamily: 'Acumin',
        fontWeight: 'bold',
    },
    noResultsHint: {
        fontFamily: 'Acumin',
        marginBottom: 10,
    },
    rtlText: {
        textAlign: 'right',
        writingDirection: 'rtl',
    },
});
