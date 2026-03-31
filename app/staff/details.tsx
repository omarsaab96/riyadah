import { FontAwesome5, MaterialCommunityIcons } from "@expo/vector-icons";
import Ionicons from '@expo/vector-icons/Ionicons';
import { useLocalSearchParams, useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    Image,
    Linking,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import { useLanguage } from "../../context/language";

const { width } = Dimensions.get('window');

export default function StaffDetailsScreen() {
  const params = useLocalSearchParams();
  const id = params.id;
  const router = useRouter();
  const { isRTL, t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [staff, setStaff] = useState<any>(null);

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
          throw new Error(data.message || t('staffDetails.failedLoad'));
        }

        setStaff(data.data);
      } catch (err: any) {
        console.error("Error fetching staff:", err);
        Alert.alert(t('messages.errorTitle'), err.message);
        router.back();
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchStaff();
    }
  }, [id]);



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
          style={[styles.backBtn, isRTL && styles.backBtnRtl]}
        >
          <Ionicons name={isRTL ? "chevron-forward" : "chevron-back"} size={20} color="#ffffff" />
          <Text style={styles.backBtnText}>{t('staffDetails.backToStaff')}</Text>
        </TouchableOpacity>

        <View style={[styles.headerTextBlock, isRTL && styles.headerTextBlockRtl]}>
          {loading && <Text style={[styles.pageTitle, isRTL ? styles.rtlText : styles.ltrText]}>{t('staffDetails.title')}</Text>}

          {!loading && staff &&
            <>
              <Text style={[styles.pageTitle, isRTL ? styles.rtlText : styles.ltrText]}>{staff.userRef.name}</Text>
              <Text style={[styles.pageDesc, isRTL ? styles.rtlText : styles.ltrText]}>{staff.role || t('staffDetails.defaultRole')}</Text>
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

        <Text style={[styles.ghostText, isRTL && styles.ghostTextRtl]}>{t('staffDetails.ghost')}</Text>

        {!loading && staff &&
          <View style={[styles.profileImage, isRTL && styles.profileImageRtl]}>
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
        <Text style={isRTL ? styles.rtlText : styles.ltrText}>{t('staffDetails.noStaff')}</Text>
      </View>}

      {staff && !loading && <ScrollView style={{ paddingHorizontal: 20 }}>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isRTL ? styles.rtlText : styles.ltrText]}>{t('staffDetails.contactInfo')}</Text>
          {staff.userRef.phone ? (
            <TouchableOpacity
              style={[styles.contactButton, isRTL && styles.contactButtonRtl]}
              onPress={() => Linking.openURL(`tel:${staff.userRef.phone}`)}
            >
              <FontAwesome5 name="phone" size={14} color="#FF4000" style={isRTL ? styles.iconSpacingRtl : styles.iconSpacing} />
              <Text style={[styles.contactText, isRTL ? styles.rtlText : styles.ltrText]}>{staff.userRef.phone}</Text>
            </TouchableOpacity>
          ) : null}

          {staff.userRef.email ? (
            <TouchableOpacity
              style={[styles.contactButton, isRTL && styles.contactButtonRtl]}
              onPress={() => Linking.openURL(`mailto:${staff.userRef.email}`)}
            >
              <MaterialCommunityIcons name="email-outline" size={18} color="#FF4000" style={isRTL ? styles.iconSpacingRtl : styles.iconSpacing} />
              <Text style={[styles.contactText, isRTL ? styles.rtlText : styles.ltrText]}>{staff.userRef.email}</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        {staff.userRef.country && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, isRTL ? styles.rtlText : styles.ltrText]}>{t('profile.country')}</Text>
            <Text style={[styles.listItem, isRTL ? styles.rtlText : styles.ltrText]}>
              {staff.userRef.country}
            </Text>
          </View>
        )}

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isRTL ? styles.rtlText : styles.ltrText]}>{t('profile.teams')}</Text>
          {staff.teams && staff.teams.length > 0 ? (
            staff.teams.map((team: any) => (
              <TouchableOpacity key={team._id} onPress={() => router.push({
                pathname: '/teams/details',
                params: { id: team._id },
              })}>
                <View  style={[styles.teamItem, isRTL && styles.teamItemRtl]}>
                  <View>
                    {team.image ? (
                      <Image
                        source={{ uri: team.image }}
                        style={[styles.teamImage, isRTL && styles.teamImageRtl]}
                      />
                    ) : (
                      <Image
                        source={require('../../assets/teamlogo.png')}
                        style={[styles.teamImage, isRTL && styles.teamImageRtl, { tintColor:'#000' }]}
                      />
                    )}
                  </View>
                  <View>
                    <Text style={[styles.teamName, isRTL ? styles.rtlText : styles.ltrText]}>{team.name}</Text>
                    <Text style={[styles.teamSport, isRTL ? styles.rtlText : styles.ltrText]}>{team.sport}</Text>
                  </View>
                </View>
              </TouchableOpacity>

            ))
          ) : (
            <Text style={[styles.noData, isRTL ? styles.rtlText : styles.ltrText]}>{t('staffDetails.noTeamsAssigned')}</Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isRTL ? styles.rtlText : styles.ltrText]}>{t('staffDetails.qualifications')}</Text>
          {staff.qualifications && staff.qualifications.length > 0 ? (
            staff.qualifications.map((q: string, i: number) => (
              <Text key={i} style={[styles.listItem, isRTL ? styles.rtlText : styles.ltrText]}>{'\u2022'} {q}</Text>
            ))
          ) : (
            <Text style={[styles.noData, isRTL ? styles.rtlText : styles.ltrText]}>{t('staffDetails.none')}</Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isRTL ? styles.rtlText : styles.ltrText]}>{t('staffDetails.certifications')}</Text>
          {staff.certifications && staff.certifications.length > 0 ? (
            staff.certifications.map((c: string, i: number) => (
              <Text key={i} style={[styles.listItem, isRTL ? styles.rtlText : styles.ltrText]}>{'\u2022'} {c}</Text>
            ))
          ) : (
            <Text style={[styles.noData, isRTL ? styles.rtlText : styles.ltrText]}>{t('staffDetails.none')}</Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isRTL ? styles.rtlText : styles.ltrText]}>{t('staffDetails.employment')}</Text>
          <Text style={[styles.listItem, isRTL ? styles.rtlText : styles.ltrText]}>{t('staffDetails.type')}: {staff.employmentType || t('staffDetails.notAvailable')}</Text>
          <Text style={[styles.listItem, isRTL ? styles.rtlText : styles.ltrText]}>{t('staffDetails.salary')}: {staff.salary || t('staffDetails.notAvailable')}</Text>
          <Text style={[styles.listItem, isRTL ? styles.rtlText : styles.ltrText]}>{t('staffDetails.status')}: {staff.isActive ? t('staffDetails.active') : t('staffDetails.inactive')}</Text>
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
    color:'black'
  },
  contactButton: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  contactButtonRtl: {
    flexDirection: 'row-reverse',
  },
  contactText: {
    marginLeft: 8,
    color:'black',
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
  teamItemRtl: {
    flexDirection: 'row-reverse',
  },
  teamImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  teamImageRtl: {
    marginRight: 0,
    marginLeft: 10,
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
    color:'black'
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
  profileImageRtl: {
    right: undefined,
    left: -5,
  },
  profileImageAvatar: {
    height: '100%',
    width: undefined,
    aspectRatio: 1,
    resizeMode: 'contain',
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
  loaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 5,
  },
  loaderRowRtl: {
    flexDirection: 'row-reverse',
  },
  iconSpacing: {
    marginRight: 2,
  },
  iconSpacingRtl: {
    marginLeft: 2,
  },
  ltrText: {
    textAlign: 'left',
    writingDirection: 'ltr',
  },
  rtlText: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
});
