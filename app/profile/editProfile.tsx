import Entypo from '@expo/vector-icons/Entypo';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { jwtDecode } from "jwt-decode";
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    Image,
    KeyboardAvoidingView, Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import CountryPicker from 'react-native-country-picker-modal';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { useLanguage } from '../../context/language';


const { width } = Dimensions.get('window');

export default function EditProfile() {
    const router = useRouter();
    const { isRTL, t } = useLanguage();

    const [userId, setUserId] = useState(null);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [children, setChildren] = useState([]);
    const [location, setLocation] = useState(null);
    const [error, setError] = useState<string | null>(null);
    const scrollRef = useRef(null);


    useEffect(() => {
        const fetchUser = async () => {
            setLoading(true)
            const token = await SecureStore.getItemAsync('userToken');
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
                    setChildren(user.children)
                    if (user.contactInfo?.location) {
                        setLocation({
                            latitude: parseFloat(user.contactInfo.location.latitude),
                            longitude: parseFloat(user.contactInfo.location.longitude),
                        });
                    }
                    setLoading(false)
                } else {
                    console.error('API error')
                }
            }
        };

        fetchUser();
    }, []);

    useEffect(() => {
        // getChildren();
    }, [user])

    const updateField = (field, value) => {
        const path = field.split('.');
        setUser(prev => {
            const updated = { ...prev };
            let current = updated;

            for (let i = 0; i < path.length - 1; i++) {
                const key = path[i];
                if (!current[key]) current[key] = {};
                current = current[key];
            }

            current[path[path.length - 1]] = value == "" ? null : value;
            return updated;
        });
    };

    const handleCancel = () => {
        router.replace('/profile');
    }

    const handleSave = async () => {

        const dob = `${user?.dob.year?.padStart(4, '0')}-${user?.dob.month?.padStart(2, '0')}-${user?.dob.day?.padStart(2, '0')}`;
        const dobDate = new Date(dob);
        const today = new Date();

        // Basic validity checks
        if (isNaN(dobDate.getTime())) {
            setError(t('profileEditor.invalidDate'));
            scrollRef.current?.scrollTo({ y: 0, animated: true });
            return;
        }

        if (dobDate > today) {
            setError(t('profileEditor.futureDate'));
            scrollRef.current?.scrollTo({ y: 0, animated: true });
            return;
        }

        setSaving(true)
        const token = await SecureStore.getItemAsync('userToken');
        if (!token || !userId) return;

        const response = await fetch(`https://server.riyadah.app/api/users/${userId}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(user)
        });

        if (response.ok) {
            console.log("Profile updated successfully");
            router.replace('/profile');
        } else {
            console.error("Failed to update profile");
        }
    }

    const handleAddChildren = () => {
        router.push('/profile/addChildren');
    }

    return (
        <>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <View style={styles.container}>
                    <View style={styles.pageHeader}>
                        <Image
                            source={isRTL ? require('../../assets/logo_white_ar.png') : require('../../assets/logo_white.png')}
                            style={[styles.logo, isRTL && { left: 'auto', right: 0 }]}
                            resizeMode="contain"
                        />

                        <View style={[styles.headerTextBlock, isRTL && styles.headerTextBlockRtl]}>
                            <Text style={[styles.pageTitle, isRTL&&{textAlign:'right'}]}>{t('profileEditor.editProfile')}</Text>
                            {!loading && <Text style={[styles.pageDesc, isRTL && styles.rtlText]}>{t('profileEditor.changeYourData')}</Text>}

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

                        <Text style={[styles.ghostText, isRTL && styles.ghostTextRtl]}>{t('profileEditor.editGhost')}</Text>

                        {user && !loading && <View style={[styles.profileImage, isRTL && styles.rtlprofileImage]}>
                            <TouchableOpacity onPress={() => router.push('/profile/uploadAvatar')}>
                                {(user.image == null || user.image == "") && (user.type == "Club" || user.type == "Association") && <Image
                                    source={require('../../assets/clublogo.png')}
                                    style={styles.profileImageAvatar}
                                    resizeMode="contain"
                                />}
                                {(user.image == null || user.image == "") && user.gender == "Male" && <Image
                                    source={require('../../assets/avatar.png')}
                                    style={styles.profileImageAvatar}
                                    resizeMode="contain"
                                />}
                                {(user.image == null || user.image == "") && user.gender == "Female" && <Image
                                    source={require('../../assets/avatarF.png')}
                                    style={styles.profileImageAvatar}
                                    resizeMode="contain"
                                />}
                                {user.image != null && <Image
                                    source={{ uri: user.image }}
                                    style={styles.profileImageAvatar}
                                    resizeMode="contain"
                                />}
                            </TouchableOpacity>

                            <View style={{
                                position: 'absolute',
                                bottom: 5,
                                left: 0,
                                right: 0,
                                flexDirection: 'row',
                                justifyContent: 'center',
                                alignItems: 'center'

                            }}>

                                {(user.image == null || user.image == "") &&
                                    <TouchableOpacity style={styles.uploadImage} onPress={() => router.push('/profile/uploadAvatar')}>
                                        <Entypo name="plus" size={20} color="#FF4000" />
                                        <Text style={styles.uploadImageText}>{t('profileEditor.uploadAvatar')}</Text>
                                    </TouchableOpacity>
                                }

                                {user.image != null && user.image != "" &&
                                    <TouchableOpacity style={[styles.uploadImage, { padding: 5, }]} onPress={() => router.push('/profile/uploadAvatar')}>
                                        <FontAwesome name="refresh" size={16} color="#FF4000" />
                                        <Text style={[styles.uploadImageText, { marginLeft: 5 }]}>{t('profileEditor.changeAvatar')}</Text>
                                    </TouchableOpacity>
                                }
                            </View>
                        </View>}


                    </View>

                    {user && !loading && <ScrollView ref={scrollRef}>

                        <View style={styles.contentContainer}>
                            {error != null && <View style={[styles.error,isRTL&&{flexDirection:'row-reverse'}]}>
                                <View style={[styles.errorIcon,isRTL&&{marginRight:0,marginLeft:15}]}></View>
                                <Text style={styles.errorText}>{error}</Text>
                            </View>}
                            {user.type == "Parent" && <View style={styles.entity}>
                                <View style={styles.noChildrenView}>
                                    <Text style={[styles.title, { marginBottom: 0 }]}>
                                        {t('profileEditor.childrenCount', { count: children?.length || 0 })}
                                    </Text>
                                    <TouchableOpacity style={styles.addChildrenButton} onPress={handleAddChildren}>
                                        <Entypo name="plus" size={20} color="#FF4000" />
                                        <Text style={styles.addChildrenButtonText}>{t('profileEditor.addChild')}</Text>
                                    </TouchableOpacity>
                                </View>
                                {children?.length > 0 ? (<View style={styles.childrenList}>
                                    {children.map((child, index) => (
                                        <View key={index} style={styles.childItem}>
                                            <Text>{child.name}</Text>
                                        </View>
                                    ))}
                                </View>) : (
                                    <View>
                                        <Text style={[styles.noChildrenText, isRTL && styles.rtlText]}>{t('profileEditor.noChildrenYet')}</Text>
                                    </View>
                                )}
                            </View>}

                            {user.type == "Club" &&
                                <View style={styles.adminDiv}>
                                    <Text style={[styles.title,isRTL&&{textAlign:'right'}]}>
                                        {t('profileEditor.admin')}
                                    </Text>

                                    <TextInput
                                        style={[styles.input,isRTL&&{textAlign:'right'}]}
                                        placeholder={t('profileEditor.admin')}
                                        placeholderTextColor="#A8A8A8"
                                        value={user.admin?.name}
                                        onChangeText={(text) => updateField('admin.name', text)}
                                        
                                    />
                                </View>
                            }

                            {user.type != "Parent" &&
                                <View style={styles.entity}>
                                    <Text style={[styles.title, { marginBottom: 0 },isRTL&&{textAlign:'right'}]}>
                                        {t('profileEditor.contactInfo')}
                                    </Text>
                                    <Text style={[{ marginBottom: 10, fontSize: 12, color: '#aaa' },isRTL&&{textAlign:'right'}]}>
                                        {t('profileEditor.hiddenEmptyFields')}
                                    </Text>

                                    {user.type == "Club" && <Text style={[styles.subtitle, styles.contactSubTitle,isRTL&&{textAlign:'right'}]}>
                                        {t('profileEditor.description')}
                                    </Text>}

                                    {user.type == "Club" && <TextInput style={[styles.textarea,isRTL&&{textAlign:'right'}]}
                                        placeholder={t('profileEditor.openingHours')}
                                        placeholderTextColor="#A8A8A8"
                                        value={user.contactInfo.description || ""}
                                        onChangeText={(text) => updateField('contactInfo.description', text)}
                                        multiline={true}
                                        blurOnSubmit={false}
                                        returnKeyType="default"
                                    />}



                                    <View style={[styles.contactItem,isRTL&&{flexDirection:'row-reverse'}]}>
                                        <FontAwesome6 name="phone" size={24} color="#000" />
                                        <TextInput
                                            style={[[styles.input,isRTL&&{textAlign:'right'}], styles.contactInput, { color: "#aaa" }]}
                                            placeholder={t('profileEditor.phoneNumber')}
                                            placeholderTextColor="#A8A8A8"
                                            value={user.contactInfo.phone}
                                            onChangeText={(text) => updateField('contactInfo.phone', text)}
                                        // editable={false}
                                        />
                                    </View>

                                    <View style={[styles.contactItem,isRTL&&{flexDirection:'row-reverse'}]}>
                                        <MaterialCommunityIcons name="email-outline" size={24} color="#000" />
                                        <TextInput
                                            style={[[styles.input,isRTL&&{textAlign:'right'}], styles.contactInput]}
                                            placeholder={t('profileEditor.email')}
                                            placeholderTextColor="#A8A8A8"
                                            value={user.contactInfo.email}
                                            onChangeText={(text) => updateField('contactInfo.email', text)}
                                        />
                                    </View>

                                    <View style={[styles.contactItem,isRTL&&{flexDirection:'row-reverse'}]}>
                                        <FontAwesome name="facebook" size={24} color="#000" />
                                        <TextInput
                                            style={[[styles.input,isRTL&&{textAlign:'right'}], styles.contactInput, { paddingLeft: 28 }]}
                                            placeholder={t('profileEditor.facebookUsername')}
                                            placeholderTextColor="#A8A8A8"
                                            value={user.contactInfo.facebook}
                                            onChangeText={(text) => updateField('contactInfo.facebook', text)}
                                        />
                                    </View>

                                    <View style={[styles.contactItem,isRTL&&{flexDirection:'row-reverse'}]}>
                                        <FontAwesome name="instagram" size={24} color="#000" />
                                        <Text style={[{ marginLeft: 20, color: '#000', fontSize: 16 },isRTL&&{marginLeft: 0,marginRight: 20}]}>@</Text>
                                        <TextInput
                                            style={[[styles.input,isRTL&&{textAlign:'right'}], styles.contactInput, { paddingLeft: 0 }]}
                                            placeholder={t('profileEditor.instagramUsername')}
                                            placeholderTextColor="#A8A8A8"
                                            value={user.contactInfo.instagram}
                                            onChangeText={(text) => updateField('contactInfo.instagram', text)}
                                            autoCapitalize='none'
                                        />
                                    </View>

                                    <View style={[styles.contactItem,isRTL&&{flexDirection:'row-reverse'}]}>
                                        <FontAwesome name="whatsapp" size={24} color="#000" />
                                        <TextInput
                                            style={[[styles.input,isRTL&&{textAlign:'right'}], styles.contactInput]}
                                            placeholder={t('profileEditor.whatsappNumber')}
                                            placeholderTextColor="#A8A8A8"
                                            value={user.contactInfo.whatsapp}
                                            onChangeText={(text) => updateField('contactInfo.whatsapp', text)}
                                        />
                                    </View>

                                    <View style={[styles.contactItem,isRTL&&{flexDirection:'row-reverse'}]}>
                                        <FontAwesome5 name="telegram-plane" size={24} color="#000" />
                                        <Text style={[{ marginLeft: 20, color: '#000', fontSize: 16 },isRTL&&{marginLeft: 0,marginRight: 20}]}>@</Text>
                                        <TextInput
                                            style={[[styles.input,isRTL&&{textAlign:'right'}], styles.contactInput, { paddingLeft: 0 }]}
                                            placeholder={t('profileEditor.telegramUsername')}
                                            placeholderTextColor="#A8A8A8"
                                            value={user.contactInfo.telegram}
                                            onChangeText={(text) => updateField('contactInfo.telegram', text)}
                                        />
                                    </View>

                                    <View style={[styles.contactItem,isRTL&&{flexDirection:'row-reverse'}]}>
                                        <FontAwesome6 name="tiktok" size={24} color="#000" />
                                        <Text style={[{ marginLeft: 20, color: '#000', fontSize: 16 },isRTL&&{marginLeft: 0,marginRight: 20}]}>@</Text>
                                        <TextInput
                                            style={[[styles.input,isRTL&&{textAlign:'right'}], styles.contactInput, { paddingLeft: 0 }]}
                                            placeholder={t('profileEditor.tiktokUsername')}
                                            placeholderTextColor="#A8A8A8"
                                            value={user.contactInfo.tiktok}
                                            onChangeText={(text) => updateField('contactInfo.tiktok', text)}
                                        />
                                    </View>

                                    <View style={[styles.contactItem,isRTL&&{flexDirection:'row-reverse'}]}>
                                        <FontAwesome name="snapchat-ghost" size={24} color="#000" />
                                        <TextInput
                                            style={[[styles.input,isRTL&&{textAlign:'right'}], styles.contactInput]}
                                            placeholder={t('profileEditor.snapchatUsername')}
                                            placeholderTextColor="#A8A8A8"
                                            value={user.contactInfo.snapchat}
                                            onChangeText={(text) => updateField('contactInfo.snapchat', text)}
                                        />
                                    </View>

                                    {(user.type == "Club" || user.type == "Association") && <View>
                                        <View style={[{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10, marginBottom: 5 },isRTL&&{flexDirection:'row-reverse'}]}>
                                            <Text style={[styles.subtitle, styles.contactSubTitle, { width: 'auto' }]}>
                                                {t('profileEditor.location')}
                                            </Text>
                                            <TouchableOpacity
                                                style={styles.locationBtn}
                                                onPress={async () => {
                                                    console.log('Checking permissions...')
                                                    let { status } = await Location.requestForegroundPermissionsAsync();

                                                    if (status !== 'granted') {
                                                        console.log("Permission to access location was denied")
                                                        alert('Permission to access location was denied. Go to your phone\'s settings and enable Riyadah to use your location');
                                                        return;
                                                    }
                                                    console.log("Permission to access location granted")

                                                    console.log("Getting current location...")
                                                    let currentLocation = await Location.getCurrentPositionAsync({});
                                                    console.log("Location= ", currentLocation)

                                                    const coords = {
                                                        latitude: currentLocation.coords.latitude,
                                                        longitude: currentLocation.coords.longitude,
                                                    };
                                                    setLocation(coords);

                                                    // Also update the user state
                                                    updateField('contactInfo.location.latitude', String(coords.latitude));
                                                    updateField('contactInfo.location.longitude', String(coords.longitude));
                                                }}
                                            >
                                                <Text style={styles.locationBtnText}>{t('profileEditor.useCurrentLocation')}</Text>
                                            </TouchableOpacity>
                                        </View>

                                        <Text style={[styles.hint, isRTL && styles.rtlText]}>{t('profileEditor.mapHint')}</Text>

                                        <View style={styles.map}>
                                            <MapView
                                                provider={PROVIDER_GOOGLE}
                                                style={styles.mapPreview}
                                                region={{
                                                    latitude: location?.latitude || 0,
                                                    longitude: location?.longitude || 0,
                                                    latitudeDelta: location?.latitude ? 0.01 : 50,
                                                    longitudeDelta: location?.longitude ? 0.01 : 50
                                                }}
                                                onPress={(e) => {
                                                    const coords = e.nativeEvent.coordinate;
                                                    setLocation(coords);
                                                    updateField('contactInfo.location.latitude', String(coords.latitude));
                                                    updateField('contactInfo.location.longitude', String(coords.longitude));
                                                }}
                                            >
                                                {location && (
                                                    <Marker
                                                        coordinate={location}
                                                        draggable
                                                        onDragEnd={(e) => {
                                                            const coords = e.nativeEvent.coordinate;
                                                            setLocation(coords);
                                                            updateField('contactInfo.location.latitude', String(coords.latitude));
                                                            updateField('contactInfo.location.longitude', String(coords.longitude));
                                                        }}
                                                    />
                                                )}
                                            </MapView>
                                        </View>
                                    </View>}
                                </View>
                            }

                            {/* BIO */}
                            {user.type != "Parent" && <View style={styles.entity}>
                                <Text style={[styles.title,isRTL&&{textAlign:'right'}]}>
                                    {(user.type == "Club" || user.type == "Association") ? t('profileEditor.summary') : t('profileEditor.bio')}
                                </Text>
                                <TextInput
                                    style={[styles.textarea,isRTL&&{textAlign:'right'}]}
                                    placeholder={(user.type == "Club" || user.type == "Association") ? (user.type === 'Club' ? t('profileEditor.aboutClub') : t('profileEditor.aboutAssociation')) : t('profileEditor.aboutYou')}
                                    placeholderTextColor="#A8A8A8"
                                    value={user.bio || ""}
                                    onChangeText={(text) => updateField('bio', text)}
                                    multiline={true}
                                    blurOnSubmit={false}
                                    returnKeyType="default"
                                />
                            </View>}

                            {/* COUNTRY */}
                            <View style={styles.entity}>
                                <Text style={[styles.title,isRTL&&{textAlign:'right'}]}>
                                    {t('profileEditor.country')}
                                </Text>
                                <View style={[[styles.input,isRTL&&{textAlign:'right'}], styles.select]}>
                                    <CountryPicker
                                        countryCode={user.country}
                                        withFilter
                                        withFlag
                                        withAlphaFilter
                                        withCountryNameButton
                                        withEmoji={false}
                                        theme={{
                                            itemHeight: 44,
                                        }}
                                        onSelect={(country) => updateField('country', country.cca2)}
                                    />
                                </View>
                            </View>

                            {/* TEAM/CLUB
                            {user.type == "Athlete" && <View style={styles.entity}>
                                <Text style={styles.title}>
                                    Team/club
                                </Text>
                                <TextInput
                                    style={[styles.input,isRTL&&{textAlign:'right'}]}
                                    placeholder="Club name"
                                    placeholderTextColor="#A8A8A8"
                                    value={user.club}
                                    onChangeText={(text) => updateField('club', text)}
                                />
                            </View>} */}

                            {/* DOB */}
                            <View style={styles.entity}>
                                <Text style={[styles.title,isRTL&&{textAlign:'right'}]}>
                                    {(user.type == "Club" || user.type == "Association") ? t('profileEditor.establishmentDate') : t('profileEditor.dateOfBirth')}
                                </Text>
                                <View style={[styles.dobRow,isRTL&&{flexDirection:'row-reverse'}]}>
                                    {user.type != "Club" && user.type != "Association" && <TextInput
                                        style={[styles.dobInput, Platform.OS === 'ios' && { padding: 15 }]}
                                        placeholder="DD"
                                        placeholderTextColor="#aaa"
                                        keyboardType="number-pad"
                                        maxLength={2}
                                        value={user.dob.day}
                                        onChangeText={(text) => updateField('dob.day', text)}
                                    />}
                                    {user.type != "Club" && user.type != "Association" && <Text style={styles.dobSeperator}>/</Text>}
                                    <TextInput
                                        style={[styles.dobInput, Platform.OS === 'ios' && { padding: 15 }]}
                                        placeholder="MM"
                                        placeholderTextColor="#aaa"
                                        keyboardType="number-pad"
                                        maxLength={2}
                                        value={user.dob.month}
                                        onChangeText={(text) => updateField('dob.month', text)}
                                    />
                                    <Text style={styles.dobSeperator}>/</Text>
                                    <TextInput
                                        style={[styles.dobInput, Platform.OS === 'ios' && { padding: 15 }]}
                                        placeholder="YYYY"
                                        placeholderTextColor="#aaa"
                                        keyboardType="number-pad"
                                        maxLength={4}
                                        value={user.dob.year}
                                        onChangeText={(text) => updateField('dob.year', text)}
                                    />
                                </View>
                            </View>

                            {/* POSITION */}
                            {user.type == "Athlete" && user.sport.some(s => ['Football', 'Basketball', 'Volleyball'].includes(s)) == "Athlete" && <View style={styles.entity}>
                                <Text style={styles.title}>
                                    {t('profileEditor.position')}
                                </Text>
                                <TextInput
                                    style={[styles.input,isRTL&&{textAlign:'right'}]}
                                    placeholder={t('profileEditor.positionPlaceholder')}
                                    placeholderTextColor="#A8A8A8"
                                    value={user.position?.toString()}
                                    onChangeText={(text) => updateField('position', text)}
                                />
                            </View>}

                            {/* HEIGHT */}
                            {user.type == "Athlete" && <View style={styles.entity}>
                                <Text style={styles.title}>
                                    {t('profileEditor.height')}
                                </Text>
                                <TextInput
                                    style={[styles.input,isRTL&&{textAlign:'right'}]}
                                    placeholder={t('profileEditor.heightPlaceholder')}
                                    placeholderTextColor="#A8A8A8"
                                    value={user.height?.toString()}
                                    onChangeText={(text) => updateField('height', text)}
                                />
                            </View>}

                            {/* WEIGHT */}
                            {user.type == "Athlete" && <View style={styles.entity}>
                                <Text style={styles.title}>
                                    {t('profileEditor.weight')}
                                </Text>
                                <TextInput
                                    style={[styles.input,isRTL&&{textAlign:'right'}]}
                                    placeholder={t('profileEditor.weightPlaceholder')}
                                    placeholderTextColor="#A8A8A8"
                                    value={user.weight?.toString()}
                                    onChangeText={(text) => updateField('weight', text)}
                                />
                            </View>}

                            {/* HIGHLIGHTS */}
                            {/* {user.type != "Parent" && user.type != "Scout" && user.type != "Association" && <View style={styles.entity}>
                                <Text style={styles.title}>
                                    Highlights
                                </Text>
                                <TextInput
                                    style={[styles.textarea,isRTL&&{textAlign:'right'}]}
                                    placeholder="Wanna highlight any accomplishment?"
                                    placeholderTextColor="#A8A8A8"
                                    value={user.highlights || ""}
                                    onChangeText={(text) => updateField('highlights', text)}
                                    multiline={true}
                                    blurOnSubmit={false}
                                    returnKeyType="default"
                                />
                            </View>} */}

                            {/* STATS */}
                            {/* {user.type != "Parent" && user.type != "Scout" && user.type != "Association" && <View style={styles.entity}>

                                <Text style={styles.title}>
                                    Stats
                                </Text>
                                <TextInput
                                    style={[styles.textarea,isRTL&&{textAlign:'right'}]}
                                    placeholder="Let people know how you perform"
                                    placeholderTextColor="#A8A8A8"
                                    value={user.stats || ""}
                                    onChangeText={(text) => updateField('stats', text)}
                                    multiline={true}
                                    blurOnSubmit={false}
                                    returnKeyType="default"
                                />
                            </View>} */}

                            {/* ACHIEVEMENTS */}
                            {user.type == "Athlete" && <View style={styles.entity}>
                                <Text style={styles.title}>
                                    {t('profileEditor.achievements')}
                                </Text>
                                <TextInput
                                    style={[styles.textarea,isRTL&&{textAlign:'right'}]}
                                    placeholder={t('profileEditor.achievementsPlaceholder')}
                                    placeholderTextColor="#A8A8A8"
                                    value={user.achievements || ""}
                                    onChangeText={(text) => updateField('achievements', text)}
                                    multiline={true}
                                    blurOnSubmit={false}
                                    returnKeyType="default"
                                />
                            </View>}

                            {/* EVENTS */}
                            {/* {user.type != "Parent" && user.type != "Scout" && user.type != "Association" && <View style={styles.entity}>

                                <Text style={styles.title}>
                                    Upcoming Events
                                </Text>
                                <TextInput
                                    style={[styles.textarea,isRTL&&{textAlign:'right'}]}
                                    placeholder="Are you attending any events?"
                                    placeholderTextColor="#A8A8A8"
                                    value={user.events || ""}
                                    onChangeText={(text) => updateField('events', text)}
                                    multiline={true}
                                    blurOnSubmit={false}
                                    returnKeyType="default"
                                />
                            </View>} */}

                            {/* SKILLS */}
                            {/* {user.type == "Athlete" && <View style={styles.entity}>
                                <Text style={styles.title}>
                                    Skills
                                </Text>
                                <View style={styles.rangeContainer}>
                                    <Text style={styles.subtitle}>
                                        attack
                                    </Text>
                                    <View style={styles.rangeSliderContainer}>
                                        <Slider
                                            style={styles.rangeSlider}
                                            minimumValue={0}
                                            maximumValue={100}
                                            step={1}
                                            value={user?.skills?.attack || 0}
                                            onValueChange={(value) => updateField('skills.attack', value)}
                                            minimumTrackTintColor="#FF4000"
                                            maximumTrackTintColor="#F4F4F4"
                                            thumbTintColor="#FF4000"
                                        />
                                        <Text style={{ color: 'black', textAlign: 'center', fontSize: 16, marginTop: 10 }}>
                                            {user?.skills?.attack || 0}%
                                        </Text>
                                    </View>
                                </View>
                                <View style={styles.rangeContainer}>
                                    <Text style={styles.subtitle}>
                                        defense
                                    </Text>
                                    <View style={styles.rangeSliderContainer}>
                                        <Slider
                                            style={styles.rangeSlider}
                                            minimumValue={0}
                                            maximumValue={100}
                                            step={1}
                                            value={user?.skills?.defense || 0}
                                            onValueChange={(value) => updateField('skills.defense', value)}
                                            minimumTrackTintColor="#FF4000"
                                            maximumTrackTintColor="#F4F4F4"
                                            thumbTintColor="#FF4000"
                                        />
                                        <Text style={{ color: 'black', textAlign: 'center', fontSize: 16, marginTop: 10 }}>
                                            {user?.skills?.defense || 0}%
                                        </Text>
                                    </View>
                                </View>
                                <View style={styles.rangeContainer}>
                                    <Text style={styles.subtitle}>
                                        skill
                                    </Text>
                                    <View style={styles.rangeSliderContainer}>
                                        <Slider
                                            style={styles.rangeSlider}
                                            minimumValue={0}
                                            maximumValue={100}
                                            step={1}
                                            value={user?.skills?.skill || 0}
                                            onValueChange={(value) => updateField('skills.skill', value)}
                                            minimumTrackTintColor="#FF4000"
                                            maximumTrackTintColor="#F4F4F4"
                                            thumbTintColor="#FF4000"
                                        />
                                        <Text style={{ color: 'black', textAlign: 'center', fontSize: 16, marginTop: 10 }}>
                                            {user?.skills?.skill || 0}%
                                        </Text>
                                    </View>
                                </View>
                                <View style={styles.rangeContainer}>
                                    <Text style={styles.subtitle}>
                                        speed
                                    </Text>
                                    <View style={styles.rangeSliderContainer}>
                                        <Slider
                                            style={styles.rangeSlider}
                                            minimumValue={0}
                                            maximumValue={100}
                                            step={1}
                                            value={user?.skills?.speed || 0}
                                            onValueChange={(value) => updateField('skills.speed', value)}
                                            minimumTrackTintColor="#FF4000"
                                            maximumTrackTintColor="#F4F4F4"
                                            thumbTintColor="#FF4000"
                                        />
                                        <Text style={{ color: 'black', textAlign: 'center', fontSize: 16, marginTop: 10 }}>
                                            {user?.skills?.speed || 0}%
                                        </Text>
                                    </View>
                                </View>
                                <View style={styles.rangeContainer}>
                                    <Text style={styles.subtitle}>
                                        stamina
                                    </Text>
                                    <View style={styles.rangeSliderContainer}>
                                        <Slider
                                            style={styles.rangeSlider}
                                            minimumValue={0}
                                            maximumValue={100}
                                            step={1}
                                            value={user?.skills?.stamina || 0}
                                            onValueChange={(value) => updateField('skills.stamina', value)}
                                            minimumTrackTintColor="#FF4000"
                                            maximumTrackTintColor="#F4F4F4"
                                            thumbTintColor="#FF4000"
                                        />
                                        <Text style={{ color: 'black', textAlign: 'center', fontSize: 16, marginTop: 10 }}>
                                            {user?.skills?.stamina || 0}%
                                        </Text>
                                    </View>
                                </View>


                            </View>} */}

                            <View style={[styles.profileActions, styles.inlineActions, isRTL && styles.inlineActionsRtl]}>
                                <TouchableOpacity onPress={handleCancel} style={styles.profileButton}>
                                    <Text style={styles.profileButtonText}>{t('profileEditor.cancel')}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={handleSave} style={[styles.profileButton, styles.savebtn]}>
                                    <Text style={styles.profileButtonText}>
                                        {saving ? t('profileEditor.saving') : t('profileEditor.save')}
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
                        </View>
                    </ScrollView>
                    }
                </View >
            </KeyboardAvoidingView>

            <View style={[styles.navBar, isRTL && styles.navBarRtl]}>
                <TouchableOpacity onPress={() => router.replace('/settings')}>
                    <Image source={require('../../assets/settings.png')} style={styles.icon} />
                </TouchableOpacity>

                <TouchableOpacity onPress={() => router.replace('/search')}>
                    <Image source={require('../../assets/search.png')} style={styles.icon} />
                </TouchableOpacity>

                <TouchableOpacity onPress={() => router.replace('/landing')}>
                    <Image source={require('../../assets/home.png')} style={[styles.icon, styles.icon]} />
                </TouchableOpacity>

                <TouchableOpacity onPress={() => router.replace('/notifications')}>
                    <Image source={require('../../assets/notifications.png')} style={styles.icon} />
                </TouchableOpacity>

                <TouchableOpacity onPress={() => router.replace('/profile')}>
                    <Image source={require('../../assets/profile.png')} style={styles.icon} />
                </TouchableOpacity>
            </View>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
        height: '100%',
    },
    contentContainer: {
        padding: 20,
        paddingBottom: 130
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
    pageHeader: {
        backgroundColor: '#FF4000',
        height: 270,
        // marginBottom: 30
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
    ghostTextRtl: {
        right: 'auto',
        left: -5,
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
    entity: {
        marginBottom: 20
    },
    profileProgress: {
        backgroundColor: '#222222',
        padding: 5,
        paddingRight: 10,
        borderTopLeftRadius: 40,
        borderBottomLeftRadius: 40,
        borderRadius: 15,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start'
    },
    profileProgressPercentage: {
        width: 60,
        height: 60,
        borderRadius: 60,
        borderWidth: 5,
        borderColor: '#FF4000',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 20,
    },
    profileProgressPercentageText: {
        color: '#FF4000',
        textAlign: 'center',
        fontSize: 24,
        fontFamily: 'Qatar'
    },
    profileProgressTextSection: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    profileProgressText: {
        color: 'white',
        fontFamily: 'Qatar',
        fontSize: 24,
    },
    profileProgressImg: {
        width: 15,
        height: 15,
        objectFit: 'contain',
    },
    title: {
        fontFamily: "Qatar",
        fontSize: 20,
        marginBottom: 10,
        color: 'black',
    },
    subtitle: {
        fontFamily: "Acumin",
        fontSize: 16,
        // fontWeight: 'bold',
        width: '100%',
        textTransform: 'capitalize',
        color: 'black'
    },
    contactSubTitle: {
        marginBottom: 5,
        // fontSize: 14,
    },
    paragraph: {
        fontFamily: "Acumin",
        fontSize: 16,
        color: 'black'
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
    profileImage: {
        position: 'absolute',
        bottom: 0,
        right: -5,
        height: '70%',
        maxWidth: 200,
        overflow: 'hidden',
    },

    rtlprofileImage: {
        right: 'auto',
        left: -5
    },
    profileImageAvatar: {
        height: '100%',
        width: undefined,
        aspectRatio: 1,
        resizeMode: 'contain',
    },
    fullButtonRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 4,
    },
    button: {
        flex: 1,
        backgroundColor: '#000000',
        height: 48,
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonText: {
        fontSize: 20,
        color: 'white',
        fontFamily: 'Qatar',
    },
    navBar: {
        position: 'absolute',
        bottom: 50,
        left: 10,
        width: width - 20,
        height: 60,
        borderRadius: 20,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        justifyContent: 'space-between',
        backgroundColor: '#ffffff',
        borderWidth: 1,
        borderColor: '#e0e0e0',

        // iOS shadow
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 6,

        // Android shadow
        elevation: 5,
    },
    navBarRtl: {
        flexDirection: 'row-reverse',
    },
    icon: {
        width: 24,
        height: 24,
        tintColor: '#111111',
    },
    activeIcon: {
        width: 24,
        height: 24,
        tintColor: '#FF4000',
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
    profileButton: {
        borderRadius: 5,
        padding: 10,
        backgroundColor: 'rgba(0,0,0,0.05)',
        marginBottom: 10
    },
    savebtn: {
        flexDirection: 'row'
    },
    profileButtonText: {
        textTransform: 'uppercase',
        fontSize: 16,
        color: '#150000',
        fontFamily: 'Qatar',
    },
    rtlText: {
        textAlign: 'right',
        writingDirection: 'rtl',
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
    contactItem: {
        backgroundColor: '#F4F4F4',
        borderRadius: 10,
        marginBottom: 10,
        padding: 5,
        flexDirection: 'row',
        alignItems: 'center',
    },
    input: {
        fontSize: 14,
        padding: 15,
        backgroundColor: '#F4F4F4',
        marginBottom: 16,
        color: 'black',
        borderRadius: 10,
    },
    contactInput: {
        marginBottom: 0,
        padding: 10,
        flex: 1,
        paddingLeft: 20
    },
    select: {
        padding: 10
    },
    dobRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
    },
    dobInput: {
        flex: 1,
        fontSize: 14,
        color: 'black',
        textAlign: 'center',
        backgroundColor: '#F4F4F4',
        borderRadius: 10
    },
    dobSeperator: {
        fontSize: 30,
        fontFamily: 'Qatar',
        fontWeight: 'bold',
        color: '#FF4000',
        marginHorizontal: 10
    },
    saveLoaderContainer: {
        marginLeft: 10
    },
    rangeContainer: {

    },
    rangeSliderContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20,
        flexWrap: 'wrap',
    },
    rangeSlider: {
        flex: 1,
        height: 40
    },
    uploadImage: {
        backgroundColor: '#111111',
        padding: 2,
        paddingRight: 5,
        borderRadius: 10,
        textAlign: 'center',
        // position: 'absolute',
        // bottom: 5,
        // left: 50,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    uploadImageText: {
        color: '#FF4000',
        fontFamily: 'Qatar',
        fontSize: 16,
    },
    childrenList: {

    },
    childItem: {

    },
    noChildrenView: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10
    },
    addChildrenButton: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    addChildrenButtonText: {
        color: 'black',
        fontFamily: 'Qatar',
        fontSize: 18
    },
    noChildrenText: {
        marginBottom: 10,
        fontSize: 16,
        fontFamily: 'Acumin'
    },
    map: {
        borderRadius: 8,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: "#cccccc"
    },
    mapPreview: {
        width: '100%',
        height: 150,
    },
    locationBtn: {
    },
    locationBtnText: {
        color: '#FF4000',
        fontFamily: 'Acumin',
        fontSize: 14
    },
    hint: {
        marginBottom: 10,
        fontFamily: 'Acumin',
        fontSize: 12,
        color: '#000000'
    },
    adminDiv: {
        marginBottom: 20
    }
});
