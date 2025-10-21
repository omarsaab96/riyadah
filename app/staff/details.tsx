import { FontAwesome5, MaterialCommunityIcons } from "@expo/vector-icons";
import Ionicons from '@expo/vector-icons/Ionicons';
import { useLocalSearchParams, useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import React, { useEffect, useState } from "react";
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

const { width } = Dimensions.get('window');

export default function StaffDetailsScreen() {
  const params = useLocalSearchParams();
  const id = params.id;
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [staff, setStaff] = useState<any>(null);

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const token = await SecureStore.getItemAsync("userToken");
        const response = await fetch(
          `http://193.187.132.170:5000/api/staff/${id}`,
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
          <Text style={styles.backBtnText}>Back to staff</Text>
        </TouchableOpacity>

        <View style={styles.headerTextBlock}>
          {loading && <Text style={styles.pageTitle}>Staff details</Text>}

          {!loading && staff &&
            <>
              <Text style={styles.pageTitle}>{staff.userRef.name}</Text>
              <Text style={styles.pageDesc}>{staff.role || "Staff Member"}</Text>
            </>
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

        <Text style={styles.ghostText}>Staff</Text>

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
        <Text>No staff member found.</Text>
      </View>}

      {staff && !loading && <ScrollView style={{ paddingHorizontal: 20 }}>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact info</Text>
          {staff.userRef.phone ? (
            <TouchableOpacity
              style={styles.contactButton}
              onPress={() => Linking.openURL(`tel:${staff.userRef.phone}`)}
            >
              <FontAwesome5 name="phone" size={14} color="#FF4000" style={{ marginRight: 2 }} />
              <Text style={styles.contactText}>{staff.userRef.phone}</Text>
            </TouchableOpacity>
          ) : null}

          {staff.userRef.email ? (
            <TouchableOpacity
              style={styles.contactButton}
              onPress={() => Linking.openURL(`mailto:${staff.userRef.email}`)}
            >
              <MaterialCommunityIcons name="email-outline" size={18} color="#FF4000" />
              <Text style={styles.contactText}>{staff.userRef.email}</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        {staff.userRef.country && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Country</Text>
            <Text style={styles.listItem}>
              {staff.userRef.country}
            </Text>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Teams</Text>
          {staff.teams && staff.teams.length > 0 ? (
            staff.teams.map((team: any) => (
              <TouchableOpacity key={team._id} onPress={() => router.push({
                pathname: '/teams/details',
                params: { id: team._id },
              })}>
                <View  style={styles.teamItem}>
                  <View>
                    {team.image ? (
                      <Image
                        source={{ uri: team.image }}
                        style={{ width: 50, height: 50, borderRadius: 25, marginRight: 10 }}
                      />
                    ) : (
                      <Image
                        source={require('../../assets/teamlogo.png')}
                        style={{ width: 50, height: 50, borderRadius: 25, marginRight: 10 }}
                      />
                    )}
                  </View>
                  <View>
                    <Text style={styles.teamName}>{team.name}</Text>
                    <Text style={styles.teamSport}>{team.sport}</Text>
                  </View>
                </View>
              </TouchableOpacity>

            ))
          ) : (
            <Text style={styles.noData}>No teams assigned</Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Qualifications</Text>
          {staff.qualifications && staff.qualifications.length > 0 ? (
            staff.qualifications.map((q: string, i: number) => (
              <Text key={i} style={styles.listItem}>- {q}</Text>
            ))
          ) : (
            <Text style={styles.noData}>None</Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Certifications</Text>
          {staff.certifications && staff.certifications.length > 0 ? (
            staff.certifications.map((c: string, i: number) => (
              <Text key={i} style={styles.listItem}>- {c}</Text>
            ))
          ) : (
            <Text style={styles.noData}>None</Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Employment</Text>
          <Text style={styles.listItem}>Type: {staff.employmentType || "N/A"}</Text>
          <Text style={styles.listItem}>Salary: {staff.salary || "N/A"}</Text>
          <Text style={styles.listItem}>Status: {staff.isActive ? "Active" : "Inactive"}</Text>
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
  pageTitle: {
    color: '#ffffff',
    fontFamily: 'Bebas',
    fontSize: 30,
  },
  pageDesc: {
    color: '#ffffff',
    fontSize: 16,
    fontFamily: 'Manrope'
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
    fontFamily: 'Bebas',
    color:'black'
  },
  contactButton: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  contactText: {
    marginLeft: 8,
    color:'black',
    fontFamily: 'Manrope',
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
    alignContent: 'center',
  },
  backBtnText: {
    color: '#FFF',
    fontSize: 18,
    fontFamily: 'Bebas'
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
    fontSize: 128,
    fontFamily: 'Bebas',
    position: 'absolute',
    bottom: 20,
    right: -5,
    opacity: 0.2
  },
});
