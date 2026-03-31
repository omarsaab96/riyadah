import Ionicons from '@expo/vector-icons/Ionicons';
import { Picker } from '@react-native-picker/picker';
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
                        style={styles.backBtn}
                    >
                        <Ionicons name="chevron-back" size={20} color="#ffffff" />
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
                    {error != '' && <View style={styles.error}>
                        <View style={styles.errorIcon}></View>
                        <Text style={styles.errorText}>{error}</Text>
                    </View>}
                    <View style={styles.contentContainer}>
                        <View style={styles.formGroup}>
                            <Text style={[styles.label, isRTL && styles.rtlText]}>{t('inventory.itemName')} *</Text>
                            <TextInput
                                style={styles.input}
                                placeholderTextColor={"#888"}
                                placeholder={t('inventory.enterItemName')}
                                value={formData.itemName}
                                onChangeText={(text) => handleChange('itemName', text)}
                            />
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={[styles.label, isRTL && styles.rtlText]}>{t('inventory.category')} *</Text>
                            {/* <TextInput
                                style={styles.input}
                                placeholder="Enter category"
                                value={formData.category}
                                onChangeText={(text) => handleChange('category', text)}
                            /> */}
                            <View style={styles.pickerContainer}>
                                <Picker
                                    style={styles.picker}
                                    selectedValue={formData.category}
                                    onValueChange={(value) => handleChange('category', value)}
                                >
                                    {/* <Picker.Item label="Select a category..." value="" enabled={false} /> */}
                                    <Picker.Item label={t('inventory.equipment')} value="Equipment" />
                                    <Picker.Item label={t('inventory.uniform')} value="Uniform" />
                                    <Picker.Item label={t('inventory.accessories')} value="Accessories" />
                                    <Picker.Item label={t('inventory.medicalSupplies')} value="Medical supplies" />
                                </Picker>
                            </View>
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={[styles.label, isRTL && styles.rtlText]}>{t('inventory.quantity')}</Text>
                            <TextInput
                                style={styles.input}
                                placeholder={t('inventory.enterQuantity')}
                                placeholderTextColor={"#888"}
                                keyboardType="numeric"
                                value={formData.quantity}
                                onChangeText={(text) => handleChange('quantity', text)}
                            />
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={[styles.label, isRTL && styles.rtlText]}>{t('inventory.unitPrice')}</Text>
                            <View style={{ flexDirection: 'row', columnGap: 10 }}>
                                <TextInput
                                    style={[styles.input, { flex: 1, marginBottom: 0 }]}
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
                                <View style={[styles.pickerContainer, { flex: 1 }]}>
                                    <Picker
                                        style={styles.picker}
                                        selectedValue={formData.unitPrice?.split(' ')[1] || 'USD'}
                                        onValueChange={(currency) => {
                                            const amount = formData.unitPrice?.split(' ')[0] || '0';
                                            handleChange('unitPrice', `${amount} ${currency}`);
                                        }}
                                    >
                                        <Picker.Item label="EGP" value="EGP" />
                                        <Picker.Item label="USD" value="USD" />
                                        <Picker.Item label="EUR" value="EUR" />
                                    </Picker>
                                </View>
                            </View>
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={[styles.label, isRTL && styles.rtlText]}>{t('inventory.description')}</Text>
                            <TextInput style={styles.textarea}
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
    ghostText: {
        color: '#ffffff',
        fontSize:100,textTransform:'uppercase',
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
    profileButtonText: {textTransform:'uppercase',
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
    pickerContainer: {
        overflow: 'hidden',
        borderRadius: 8,
    },
    picker: {
        width: '100%',
        fontFamily: 'Acumin',
        fontSize: 14,
        backgroundColor: '#F4F4F4',
        borderRadius: 8,
        color: 'black'
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
    backBtnText: {
        color: '#FFF',
        fontSize: 18,
        fontFamily: 'Qatar'
    },
});
