import { FontAwesome5, MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

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
          `https://riyadah.onrender.com/api/staff/${id}`,
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

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#FF4000" />
      </View>
    );
  }

  if (!staff) {
    return (
      <View style={styles.centered}>
        <Text>No staff member found.</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <FontAwesome5 name="arrow-left" size={18} color="#FF4000" />
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>

      {staff.userRef.image ? (
        <Image
          source={{ uri: staff.userRef.image }}
          style={styles.avatar}
          resizeMode="cover"
        />
      ) : (
        <View style={[styles.avatar, styles.defaultAvatar]}>
          <FontAwesome5 name="user" size={48} color="#fff" />
        </View>
      )}

      <Text style={styles.name}>{staff.userRef.name}</Text>
      <Text style={styles.role}>{staff.role || "Staff Member"}</Text>

      {staff.bio ? <Text style={styles.bio}>{staff.userRef.bio}</Text> : null}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Contact</Text>
        {staff.userRef.phone ? (
          <TouchableOpacity
            style={styles.contactButton}
            onPress={() => Linking.openURL(`tel:${staff.userRef.phone}`)}
          >
            <FontAwesome5 name="phone" size={16} color="#FF4000" />
            <Text style={styles.contactText}>{staff.userRef.phone}</Text>
          </TouchableOpacity>
        ) : null}

        {staff.userRef.email ? (
          <TouchableOpacity
            style={styles.contactButton}
            onPress={() => Linking.openURL(`mailto:${staff.userRef.email}`)}
          >
            <MaterialCommunityIcons name="email-outline" size={16} color="#FF4000" />
            <Text style={styles.contactText}>{staff.userRef.email}</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Teams</Text>
        {staff.teams && staff.teams.length > 0 ? (
          staff.teams.map((team: any) => (
            <View key={team._id} style={styles.teamItem}>
              <Text style={styles.teamName}>{team.name}</Text>
              <Text style={styles.teamSport}>{team.sport}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.noTeams}>No teams assigned</Text>
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

      {staff.userRef.country && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Country</Text>
          <Text style={styles.listItem}>
            {staff.userRef.country}
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
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
    fontWeight: "bold",
    marginBottom: 4,
  },
  contactButton: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  contactText: {
    marginLeft: 8,
    color: "#FF4000",
  },
  teamItem: {
    backgroundColor: "#f2f2f2",
    padding: 8,
    borderRadius: 6,
    marginBottom: 4,
  },
  teamName: {
    fontWeight: "bold",
  },
  teamSport: {
    color: "#666",
  },
  listItem: {
    marginBottom: 2,
  },
  noTeams: {
    color: "#666",
  },
  noData: {
    color: "#666",
  },
});
