import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { jwtDecode } from "jwt-decode";
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
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

interface CreateInventoryProps {
    clubId: string;
}

export default function CreateInventory({ clubId }: CreateInventoryProps) {
    const router = useRouter();
    const { isRTL, t } = useLanguage();
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [userId, setUserId] = useState(null);
    const [user, setUser] = useState(null);

    const [formData, setFormData] = useState({
        itemName: '',
        category: 'Equipment',
        quantity: '',
        unitPrice: '0 EGP',
        description: '',
    });
    const categoryOptions = [
        { label: t('inventory.equipment'), value: 'Equipment' },
        { label: t('inventory.uniform'), value: 'Uniform' },
        { label: t('inventory.accessories'), value: 'Accessories' },
        { label: t('inventory.medicalSupplies'), value: 'Medical supplies' },
    ];
    const currencyOptions = ['EGP', 'USD', 'EUR'];

    useEffect(() => {
        const fetchUser = async () => {
            const token = await SecureStore.getItemAsync('userToken');
            if (token) {
                const decodedToken = jwtDecode(token);
                setUserId(decodedToken.userId);

                const response = await fetch(`https://server.riyadah.app/api/users/${decodedToken.userId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (response.ok) {
                    const user = await response.json();
                    setUser(user);
                } else {
                    console.error('API error');
                }
                setLoading(false);
            } else {
                console.log("no token");
            }
        };

        fetchUser();
    }, []);

    const handleChange = (name: string, value: string) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCreate = async () => {
        if (!userId) {
            Alert.alert(t('inventory.errorTitle'), t('inventory.userRequired'));
            return;
        }
        if (!formData.itemName.trim() || !formData.category.trim()) {
            Alert.alert(t('inventory.validationTitle'), t('inventory.requiredFields'));
            return;
        }

        setSaving(true);

        const payload = {
            itemName: formData.itemName.trim(),
            category: formData.category.trim(),
            quantity: Number(formData.quantity) || 0,
            unitPrice: formData.unitPrice,
            description: formData.description.trim(),
            club: userId,
        };

        try {
            const token = await SecureStore.getItemAsync('userToken');

            const response = await fetch('https://server.riyadah.app/api/inventory/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (response.ok) {
                router.replace({
                    pathname: '/profile',
                    params: { tab: 'Inventory' }
                })
            } else {
                throw new Error(data.message || t('inventory.failedCreate'));
            }
        } catch (error) {
            console.error('Create Inventory Error:', error);
            Alert.alert(t('inventory.errorTitle'), error.message || t('inventory.genericCreateError'));
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        router.back();
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
                                params: { tab: 'Inventory' }
                            })
                        }}
                        style={[styles.backBtn, isRTL && styles.backBtnRtl]}
                    >
                        <Ionicons name={isRTL ? "chevron-forward" : "chevron-back"} size={20} color="#ffffff" />
                        <Text style={styles.backBtnText}>{t('inventory.backToInventory')}</Text>
                    </TouchableOpacity>

                    <View style={[styles.headerTextBlock, isRTL && styles.headerTextBlockRtl]}>
                        <Text style={styles.pageTitle}>{t('inventory.newItem')}</Text>
                        {!loading && <Text style={[styles.pageDesc, isRTL && styles.rtlText]}>{t('inventory.newItemDesc')}</Text>}

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

                    <Text style={[styles.ghostText, isRTL && styles.ghostTextRtl]}>{t('inventory.ghost')}</Text>
                </View>

                <ScrollView>
                    {error != '' && <View style={[styles.error, isRTL && { flexDirection: 'row-reverse' }]}>
                        <View style={[styles.errorIcon, isRTL && { marginRight: 0, marginLeft: 15 }]}></View>
                        <Text style={styles.errorText}>{error}</Text>
                    </View>}
                    <View style={styles.contentContainer}>
                        <View style={styles.formGroup}>
                            <Text style={[styles.label, isRTL && styles.rtlText]}>{t('inventory.itemName')} *</Text>
                            <TextInput
                                style={[styles.input, isRTL && { textAlign: 'right' }]}
                                placeholderTextColor={"#888"}
                                placeholder={t('inventory.enterItemName')}
                                value={formData.itemName}
                                onChangeText={(text) => handleChange('itemName', text)}
                            />
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={[styles.label, isRTL && styles.rtlText]}>{t('inventory.category')} *</Text>
                            {/* <TextInput
                                style={[styles.input,isRTL&&{textAlign:'right'}]}
                                placeholder="Enter category"
                                value={formData.category}
                                onChangeText={(text) => handleChange('category', text)}
                            /> */}
                            <View style={[styles.choiceGroup, isRTL && styles.choiceGroupRtl]}>
                                {categoryOptions.map((option) => (
                                    <TouchableOpacity
                                        key={option.value}
                                        style={[styles.multipleChoice, formData.category == option.value && styles.selectedChoice]}
                                        onPress={() => handleChange('category', option.value)}
                                    >
                                        <Text style={[styles.multipleChoiceText, formData.category == option.value && styles.selectedChoiceText]}>
                                            {option.label}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={[styles.label, isRTL && styles.rtlText]}>{t('inventory.quantity')}</Text>
                            <TextInput
                                style={[styles.input, isRTL && { textAlign: 'right' }]}
                                placeholder={t('inventory.enterQuantity')}
                                placeholderTextColor={"#888"}
                                keyboardType="numeric"
                                value={formData.quantity}
                                onChangeText={(text) => handleChange('quantity', text)}
                            />
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={[styles.label, isRTL && styles.rtlText]}>{t('inventory.unitPrice')}</Text>
                            <View style={[styles.priceRow, isRTL && { flexDirection: 'row-reverse' }]}>
                                <TextInput
                                    style={[styles.input, styles.amountInput, isRTL && { textAlign: 'right' }]}
                                    placeholder={t('inventory.amount')}
                                    keyboardType="numeric"
                                    placeholderTextColor={"#888"}
                                    value={formData.unitPrice?.split(' ')[0] || ''}
                                    onChangeText={(text) => {
                                        const amount = text.trim();
                                        const currency = formData.unitPrice?.split(' ')[1] || 'USD';
                                        handleChange('unitPrice', `${amount} ${currency}`);
                                    }}
                                />
                                <View style={[styles.currencyChoices, isRTL && styles.choiceGroupRtl]}>
                                    {currencyOptions.map((currency) => (
                                        <TouchableOpacity
                                            key={currency}
                                            style={[styles.multipleChoice, styles.currencyChoice, (formData.unitPrice?.split(' ')[1] || 'USD') == currency && styles.selectedChoice]}
                                            onPress={() => {
                                                const amount = formData.unitPrice?.split(' ')[0] || '0';
                                                handleChange('unitPrice', `${amount} ${currency}`);
                                            }}
                                        >
                                            <Text style={[styles.multipleChoiceText, (formData.unitPrice?.split(' ')[1] || 'USD') == currency && styles.selectedChoiceText]}>
                                                {currency}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={[styles.label, isRTL && styles.rtlText]}>{t('inventory.description')}</Text>
                            <TextInput style={[styles.textarea, isRTL && { textAlign: 'right' }]}
                                placeholder={t('inventory.enterDescription')}
                                placeholderTextColor="#A8A8A8"
                                value={formData.description || ""}
                                onChangeText={(text) => handleChange('description', text)}
                                multiline={true}
                                blurOnSubmit={false}
                                returnKeyType="default"
                            />
                        </View>

                        <View style={[styles.profileActions, styles.inlineActions, isRTL && styles.inlineActionsRtl]}>
                            <TouchableOpacity onPress={handleCancel} style={styles.profileButton}>
                                <Text style={styles.profileButtonText}>{t('inventory.cancel')}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={handleCreate}
                                style={[styles.profileButton, styles.savebtn]}
                                disabled={saving}
                            >
                                <Text style={styles.profileButtonText}>{saving ? t('inventory.saving') : t('inventory.save')}</Text>
                                {saving && (
                                    <ActivityIndicator
                                        size="small"
                                        color="#111111"
                                        style={styles.saveLoaderContainer}
                                    />
                                )}
                            </TouchableOpacity>
                        </View>
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
    contentContainer: {
        padding: 20,
        paddingBottom: 130
    },
    formGroup: {
        marginBottom: 20,
    },
    pageHeader: {
        backgroundColor: '#FF4000',
        height: 270,
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
        color: '#ff6633',
        maxHeight: 200,
        lineHeight: 200
    },
    ghostTextRtl: {
        right: undefined,
        left: -5,
    },
    profileActions: {
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.2)',
        paddingTop: 10
    },
    textarea: {
        fontSize: 14,
        padding: 15,
        backgroundColor: '#F4F4F4',
        marginBottom: 16,
        color: 'black',
        borderRadius: 10,
        height: 170,
        textAlignVertical: 'top',
    },
    inlineActions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        columnGap: 15
    },
    inlineActionsRtl: {
        flexDirection: 'row-reverse',
        justifyContent: 'flex-start'
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
    profileButtonText: {
        textTransform: 'uppercase',
        fontSize: 16,
        color: '#150000',
        fontFamily: 'Qatar',
    },
    savebtn: {
        flexDirection: 'row'
    },
    rtlText: {
        textAlign: 'right',
        writingDirection: 'rtl'
    },
    label: {
        fontFamily: "Qatar",
        fontSize: 20,
        marginBottom: 10,
        color: 'black'
    },
    input: {
        fontSize: 14,
        padding: 15,
        backgroundColor: '#F4F4F4',
        marginBottom: 16,
        color: 'black',
        borderRadius: 10,
    },
    error: {
        backgroundColor: '#FF4000',
        padding: 15,
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    errorIcon: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#fff',
        marginRight: 10,
    },
    errorText: {
        color: '#fff',
        fontFamily: 'Acumin',
        fontSize: 16,
    },
    choiceGroup: {
        flexDirection: 'row',
        gap: 10,
        flexWrap: 'wrap',
    },
    choiceGroupRtl: {
        flexDirection: 'row-reverse',
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        flexWrap: 'wrap',
    },
    amountInput: {
        flexGrow: 1,
        flexBasis: 120,
        marginBottom: 0,
    },
    currencyChoices: {
        flexDirection: 'row',
        gap: 10,
        flexWrap: 'wrap',
    },
    multipleChoice: {
        backgroundColor: '#F4F4F4',
        borderRadius: 20,
        paddingHorizontal: 10,
        paddingVertical: 5,
    },
    currencyChoice: {
        minWidth: 58,
        alignItems: 'center',
    },
    multipleChoiceText: {
        fontFamily: 'Acumin',
        color: '#000',
        fontSize: 16,
    },
    selectedChoice: {
        backgroundColor: '#1a491e',
    },
    selectedChoiceText: {
        color: '#fff',
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
        flexDirection: 'row-reverse',
        width: '100%',
        left: 0,
        right: 10
    },
    backBtnText: {
        color: '#FFF',
        fontSize: 18,
        fontFamily: 'Qatar'
    },
});
