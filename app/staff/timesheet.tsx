import FontAwesome from '@expo/vector-icons/FontAwesome';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useLocalSearchParams, useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import { useLanguage } from "../../context/language";

const { width } = Dimensions.get('window');

export default function TimeSheetScreen() {
  const params = useLocalSearchParams();
  const id = params.id;
  const lon2 = params.long;
  const lat2 = params.lat;
  const router = useRouter();
  const { isRTL, t, language } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [staff, setStaff] = useState<any>(null);
  const [timesheet, setTimeSheet] = useState<any>(null);

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const token = await SecureStore.getItemAsync("userToken");
        const response = await fetch(
          `https://server.riyadah.app/api/staff/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to load staff details");
        }

        setStaff(data.data);

        const timesheetResponse = await fetch(`https://server.riyadah.app/api/timesheet/club/${id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        // console.warn(timesheetResponse)

        if (!timesheetResponse.ok) {
          throw new Error(data.message || "Failed to load staff details");
        }



        const timesheetdata = await timesheetResponse.json();
        // console.log(timesheetdata)
        setTimeSheet(timesheetdata)


      } catch (err: any) {
        console.error("Error fetching staff:", err);
        Alert.alert("Error", err.message);
        router.back();
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchStaff();
    }
  }, [id]);

  const formatDateOnly = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);

    const day = date.getDate().toString().padStart(2, '0'); // 01–31
    const month = date.toLocaleString(language === 'ar' ? 'ar' : 'en-US', { month: 'short' });
    const year = date.getFullYear();

    return `${day} ${month} ${year}`;
  };

  const formatTimeOnly = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);

    const day = date.getDate().toString().padStart(2, '0'); // 01–31
    const month = date.toLocaleString(language === 'ar' ? 'ar' : 'en-US', { month: 'short' });
    const year = date.getFullYear();

    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12; // convert 0–23 to 12-hour format
    const hourStr = hours.toString().padStart(2, '0');

    return `${hourStr}:${minutes} ${ampm}`;
  };

  function getDistanceFromLatLonInMeters(lat1, lon1) {
    const R = 6371e3; // Earth radius in meters

    if (lat2 == null || lon2 == null) {
      return 0;
    }

    const toRad = (value) => (value * Math.PI) / 180;

    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // distance in meters
  }

  function checkIfLocationIsRight(lat, lon) {
    const distance = getDistanceFromLatLonInMeters(
      lat,
      lon
    );

    return distance <= 50;
  }

  return (
    <View style={styles.container}>
      <View style={styles.pageHeader}>
        <TouchableOpacity
          onPress={() => {
            router.replace({
              pathname: '/profile',
              params: { tab: 'Staff' }
            })
          }}
          style={styles.backBtn}
        >
          <Ionicons name="chevron-back" size={20} color="#ffffff" />
          <Text style={styles.backBtnText}>{t('timesheet.backToStaff')}</Text>
        </TouchableOpacity>

        <View style={[styles.headerTextBlock, isRTL && styles.headerTextBlockRtl]}>
          <Text style={styles.pageTitle}>{t('timesheet.title')}</Text>

          {!loading && staff &&
            <Text style={styles.pageDesc}>{staff.userRef.name || t('timesheet.defaultStaffName')}</Text>
          }

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

        <Text style={[styles.ghostText, isRTL && styles.ghostTextRtl]}>{t('timesheet.ghost')}</Text>

        {!loading && staff &&
          <View style={styles.profileImage}>
            {(staff.userRef.image == null || staff.userRef.image == "") && staff.userRef.gender == "Male" && <Image
              source={require('../../assets/avatar.png')}
              style={styles.profileImageAvatar}
              resizeMode="contain"
            />}

            {(staff.userRef.image == null || staff.userRef.image == "") && staff.userRef.gender == "Female" && <Image
              source={require('../../assets/avatarF.png')}
              style={styles.profileImageAvatar}
              resizeMode="contain"
            />}

            {staff.userRef.image != null && <Image
              source={{ uri: staff.userRef.image }}
              style={styles.profileImageAvatar}
              resizeMode="contain"
            />}
          </View>
        }
      </View>

      {!staff && !loading && <View style={styles.centered}>
        <Text>{t('timesheet.noStaff')}</Text>
      </View>}

      {staff && !loading && <ScrollView style={{ paddingHorizontal: 20 }}>

        <View>

          {!loading && timesheet && <View style={{ marginTop: 30 }}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.balanceTitle, { marginBottom: 0 }]}>
                {t('timesheet.history')}
              </Text>
            </View>

            {timesheet.length === 0 && (
              <Text style={{ color: '#888', textAlign: 'center' }}>
                {t('timesheet.noRecords')}
              </Text>
            )}

            {timesheet.map((item) => {
              const checkInDate = formatDateOnly(item.checkIn);

              return (
                <View key={item._id} style={{
                  padding: 12,
                  borderWidth: 1,
                  borderColor: '#ddd',
                  borderRadius: 10,
                  backgroundColor: '#fff',
                  marginBottom: 10
                }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Text style={{ fontFamily: 'Qatar', fontSize: 14, flex: 1 }}>
                      {checkInDate}
                    </Text>

                    {item.location && (<Text style={{ fontFamily: 'Acumin', fontSize: 14, color: '#111', flex: 1 }}>
                      {checkIfLocationIsRight(item.location.latitude, item.location.longitude) ? (
                        <View style={{ flexDirection: 'row', gap: 5, alignItems: 'center' }}>
                          <FontAwesome name="check" size={14} color="#009933" />
                          <Text>{t('timesheet.locationMatch')}</Text>
                        </View>
                      ) : (
                        <View style={{ flexDirection: 'row', gap: 5, alignItems: 'center' }}>
                          <FontAwesome name="close" size={14} color="#FF4400" />
                          <Text>{t('timesheet.locationMismatch')}</Text>
                        </View>
                      )}
                    </Text>)}
                  </View>

                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Text style={{ fontFamily: 'Acumin', fontSize: 14, color: '#111', flex: 1 }}>
                      {t('timesheet.in')}: {formatTimeOnly(item.checkIn)}
                    </Text>

                    <Text style={{ fontFamily: 'Acumin', fontSize: 14, color: '#111', flex: 1 }}>
                      {t('timesheet.out')}: {item.checkOut ? formatTimeOnly(item.checkOut) : t('timesheet.notCheckedOut')}
                    </Text>
                  </View>

                </View>
              );
            })}

          </View>}
        </View>

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
    fontSize: 20,
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
    marginLeft: 8,
    color: 'black',
    fontFamily: 'Acumin',
    fontSize: 16
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
    fontSize: 16,
    color: 'black'
  },
  noData: {
    color: "#888", fontSize: 16
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
    color: '#ffffff',
    fontSize: 100, textTransform: 'uppercase',
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
  rtlText: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },

  balanceSection: {
    marginBottom: 30,
  },
  balanceText: {
    fontFamily: 'Acumin',
    fontSize: 16,
    color: 'black',
    marginBottom: 5,
  },
  balanceAmount: {
    fontFamily: 'Qatar',
    fontSize: 28,
    color: '#FF4000',
    marginBottom: 25,
  },
  balanceTitle: {
    fontFamily: 'Qatar',
    fontSize: 20,
    color: '#111111',
  },
  balanceActions: {
    flexDirection: 'row',
    gap: 10,
  },
  balanceButton: {
    flex: 1,
    backgroundColor: '#FF4000',
    paddingVertical: 10,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 5
  },
  balanceButtonText: {
    color: 'white',
    fontFamily: 'Qatar',
    fontSize: 16,
  },
  paragraph: {
    fontFamily: "Acumin",
    fontSize: 16,
    color: 'black'
  },
});
