import Entypo from '@expo/vector-icons/Entypo';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useLocalSearchParams, useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { jwtDecode } from 'jwt-decode';
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { useLanguage } from '../../context/language';

const { width } = Dimensions.get('window');

export default function StaffDetailsScreen() {
  const params = useLocalSearchParams();
  const id = params.id;
  const router = useRouter();
  const { isRTL, language, t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(true);
  const [event, setEvent] = useState<any>(null);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const token = await SecureStore.getItemAsync("userToken");
        const response = await fetch(
          `https://server.riyadah.app/api/schedules/${id}`,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || t('scheduleDetails.failedLoad'));
        }

        setEvent(data.data);
      } catch (err: any) {
        console.error("Error fetching event:", err);
        Alert.alert(t('messages.errorTitle'), err.message);
        router.back();
      } finally {
        setLoading(false);
      }
    };

    const fetchUser = async () => {
      const token = await SecureStore.getItemAsync('userToken');
      if (token) {
        const decodedToken = jwtDecode(token);
        console.log("DECODED: ", decodedToken)
        setUserId(decodedToken.userId);
      } else {
        console.log("no token",)
      }
    };

    fetchUser();

    if (id) {
      fetchEvent();
    }
  }, [id]);

  const formatDate = (date) => {
    if (!date) return '';
    const d = new Date(date);
    const locale = language === 'ar' ? 'ar' : 'en-GB';
    const dateStr = d.toLocaleDateString(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    return `${dateStr}`;
  };

  const formatTime = (date) => {
    if (!date) return '';
    const d = new Date(date);

    const locale = language === 'ar' ? 'ar' : undefined;
    const timeStr = d.toLocaleTimeString(locale, {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true, // set true if you want AM/PM
    });
    return ` ${timeStr}`;
  };

  const handleCancelEvent = () => {
    if (event.repeats !== 'No' && id) {
      return Alert.alert(
        t('scheduleDetails.recurringTitle'),
        t('scheduleDetails.recurringMessage'),
        [
          {
            text: t('scheduleDetails.thisEventOnly'),
            onPress: () => confirmCancel('single'),
          },
          {
            text: t('scheduleDetails.allOccurrences'),
            onPress: () => confirmCancel('all'),
          },
          { text: t('scheduleDetails.cancel'), style: 'cancel' },
        ]
      );
    }

    confirmCancel('single');
  };

  const confirmCancel = (scope) => {
    Alert.alert(
      t('scheduleDetails.confirmCancel'),
      scope === 'all'
        ? t('scheduleDetails.confirmCancelAll')
        : t('scheduleDetails.confirmCancelOne'),
      [
        { text: t('scheduleDetails.no'), style: 'cancel' },
        { text: t('scheduleDetails.yesCancel'), onPress: () => submitEventUpdate(scope) },
      ]
    );
  };

  const submitEventUpdate = async (scope = 'single') => {
    try {
      setSaving(true);
      const token = await SecureStore.getItemAsync('userToken');

      const requestBody = {
        status: 'cancelled',
        editScope: scope,
      };

      const response = await fetch(`https://server.riyadah.app/api/schedules/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (response.ok) {
        router.replace({ pathname: '/profile', params: { tab: 'Schedule' } });
      } else {
        throw new Error(data.message || t('scheduleDetails.failedCancel'));
      }
    } catch (error) {
      Alert.alert(t('messages.errorTitle'), error.message);
    } finally {
      setSaving(false);
    }
  };


  return (
    <View style={styles.container}>
      <View style={styles.pageHeader}>
        <TouchableOpacity
          onPress={() => {
            router.back()
          }}
          style={[styles.backBtn, isRTL && styles.backBtnRtl]}
        >
          <Ionicons name={isRTL ? "chevron-forward" : "chevron-back"} size={20} color="#ffffff" />
          <Text style={styles.backBtnText}>{t('scheduleDetails.back')}</Text>
        </TouchableOpacity>

        <View style={[styles.headerTextBlock, isRTL && styles.headerTextBlockRtl]}>
          {loading && <Text style={[styles.pageTitle, isRTL ? styles.rtlText : styles.ltrText]}>{t('scheduleDetails.title')}</Text>}

          {!loading && event &&
            <>
              <Text style={[styles.pageTitle, isRTL ? styles.rtlText : styles.ltrText]}>{event.title}</Text>
              <Text style={[styles.pageDesc, isRTL ? styles.rtlText : styles.ltrText]}>{event.eventType}</Text>
            </>
          }

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

        <Text style={[styles.ghostText, isRTL && styles.ghostTextRtl]}>{t('scheduleDetails.ghost')}</Text>
      </View>

      {!event && !loading && <View style={styles.centered}>
        <Text style={isRTL ? styles.rtlText : styles.ltrText}>{t('scheduleDetails.noEvent')}</Text>
      </View>}

      {event && !loading && <ScrollView style={{ paddingHorizontal: 20}}>
        <View style={[styles.section]}>
          {(userId == event.createdBy || userId == event.club) && <View style={[styles.actionsRow, isRTL && styles.actionsRowRtl]}>
            {event.status == 'scheduled' && <TouchableOpacity style={styles.editToggle}
              onPress={() => handleCancelEvent()}
            >
              <MaterialIcons name="cancel" size={16} color="#FF4000" />
              <Text style={styles.editToggleText}>{t('scheduleDetails.cancelEvent')}</Text>
            </TouchableOpacity>}

            <TouchableOpacity style={styles.editToggle}
              onPress={() => router.push({
                pathname: '/schedule/edit',
                params: { id: event._id }
              })}
            >
              <Entypo name="edit" size={16} color="#FF4000" />
              <Text style={styles.editToggleText}>{t('scheduleDetails.edit')}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.editToggle}
              onPress={() => router.push({
                pathname: '/attendanceSheet',
                params: { eventId: event._id }
              })}
            >
              <FontAwesome name="users" size={16} color="#FF4000" />
              <Text style={styles.editToggleText}>{t('scheduleDetails.attendance')}</Text>
            </TouchableOpacity>
          </View>}

          {event.status == 'scheduled' && <View style={[styles.statusRow, isRTL && styles.statusRowRtl]}>
            <FontAwesome name="check" size={14} color="#009933" />
            <Text style={[styles.contactText, { textTransform: 'capitalize', color: '#009933' }]}>
              {t('scheduleDetails.scheduled')}
            </Text>
          </View>}

          {event.status == 'cancelled' && <View style={[styles.statusRow, isRTL && styles.statusRowRtl]}>
            <MaterialIcons name="cancel" size={16} color="#FF4400" />
            <Text style={[styles.contactText, { textTransform: 'capitalize', color: '#FF4400' }]}>
              {t('scheduleDetails.cancelled')}
            </Text>
          </View>}
        </View>


        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isRTL ? styles.rtlText : styles.ltrText]}>{t('scheduleDetails.eventTitle')}</Text>
          <Text style={[styles.contactText, isRTL ? styles.rtlText : styles.ltrText]}>{event.title}</Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isRTL ? styles.rtlText : styles.ltrText]}>{t('scheduleDetails.description')}</Text>
          <Text style={[styles.contactText, isRTL ? styles.rtlText : styles.ltrText]}>{event.description || t('scheduleDetails.noDescription')}</Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isRTL ? styles.rtlText : styles.ltrText]}>{t('scheduleDetails.date')}</Text>
          <Text style={[styles.contactText, isRTL ? styles.rtlText : styles.ltrText]}>{formatDate(event.date)}</Text>
        </View>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isRTL ? styles.rtlText : styles.ltrText]}>{t('scheduleDetails.from')}</Text>
          <Text style={[styles.contactText, isRTL ? styles.rtlText : styles.ltrText]}>{formatTime(event.startTime)}</Text>
        </View>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isRTL ? styles.rtlText : styles.ltrText]}>{t('scheduleDetails.till')}</Text>
          <Text style={[styles.contactText, isRTL ? styles.rtlText : styles.ltrText]}>{formatTime(event.endTime)}</Text>
        </View>

        {event.location?.latitude != null && event.location?.longitude != null && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, isRTL ? styles.rtlText : styles.ltrText]}>{t('scheduleDetails.location')}</Text>

            <View style={styles.map}>
              <MapView
                provider={PROVIDER_GOOGLE}

                style={styles.mapPreview}
                initialRegion={{
                  latitude: parseFloat(event.location.latitude || 0),
                  longitude: parseFloat(event.location.longitude || 0),
                  latitudeDelta: event.location.latitude ? 0.01 : 50,
                  longitudeDelta: event.location.longitude ? 0.01 : 50
                }}
              >
                <Marker
                  coordinate={{
                    latitude: parseFloat(event.location.latitude || 0),
                    longitude: parseFloat(event.location.longitude || 0),
                  }}
                />
              </MapView>
            </View>
            <TouchableOpacity
              style={styles.locationLink}
              onPress={async () => {
                const { latitude, longitude } = event.location;
                const googleMapsURL = `comgooglemaps://?center=${latitude},${longitude}&q=${latitude},${longitude}`;
                const browserURL = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;

                try {
                  const supported = await Linking.canOpenURL(googleMapsURL);
                  if (supported) {
                    await Linking.openURL(googleMapsURL);
                  } else {
                    await Linking.openURL(browserURL);
                  }
                } catch (error) {
                  console.error(error);
                }
              }}>
              <Text style={styles.locationLinkText}>{t('profile.getDirections')}</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={{height:100}}></View>

      </ScrollView >
      }
    </View >
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
    // marginBottom: 30
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
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  backText: {
    color: "#FF4000",
    marginLeft: 6,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignSelf: "center",
    marginBottom: 12,
  },
  defaultAvatar: {
    backgroundColor: "#ccc",
    justifyContent: "center",
    alignItems: "center",
  },
  name: {
    textAlign: "center",
    fontSize: 20,
    fontWeight: "bold",
  },
  role: {
    textAlign: "center",
    color: "#666",
    marginBottom: 8,
  },
  bio: {
    textAlign: "center",
    marginBottom: 16,
  },
  section: {
    marginTop: 16,
  },
  sectionTitle: {
    marginBottom: 4,
    fontSize: 18,
    fontFamily: 'Qatar',
    color: 'black'
  },
  contactButton: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  contactText: {
    fontFamily: 'Acumin',
    fontSize: 16,
    color: 'black'
  },
  teamItem: {
    backgroundColor: "#f2f2f2",
    padding: 8,
    borderRadius: 6,
    marginBottom: 4,
    flexDirection: 'row',
    alignItems: 'center'
  },
  teamName: {
    fontWeight: "bold",
  },
  teamSport: {
    color: "#666",
  },
  listItem: {
    marginBottom: 2,
    fontSize: 16
  },
  noData: {
    color: "#666", fontSize: 16
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
  profileImage: {
    position: 'absolute',
    bottom: 0,
    right: -5,
    height: '70%',
    maxWidth: 200,
    overflow: 'hidden',
  },
  profileImageAvatar: {
    height: '100%',
    width: undefined,
    aspectRatio: 1,
    resizeMode: 'contain',
  },
  ghostText: {
    fontSize:100,textTransform:'uppercase',
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
  locationLink: {
    backgroundColor: '#cccccc',
    borderRadius: 8,
    paddingVertical: 5
  },
  locationLinkText: {
    color: '#000',
    fontFamily: 'Qatar',
    fontSize: 20,
    textAlign: 'center'
  },
  editToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 30,
  },
  actionsRowRtl: {
    flexDirection: 'row-reverse',
  },
  statusRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  statusRowRtl: {
    flexDirection: 'row-reverse',
  },
  loaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 5,
  },
  loaderRowRtl: {
    flexDirection: 'row-reverse',
  },
  ltrText: {
    textAlign: 'left',
    writingDirection: 'ltr',
  },
  rtlText: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  editToggleText: {
    color: 'black',
    fontFamily: 'Qatar',
    fontSize: 18
  },
});
