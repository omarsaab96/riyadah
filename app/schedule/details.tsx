import Ionicons from '@expo/vector-icons/Ionicons';
import { useLocalSearchParams, useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
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
  const [event, setEvent] = useState<any>(null);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const token = await SecureStore.getItemAsync("userToken");
        const response = await fetch(
          `https://riyadah.onrender.com/api/schedules/${id}`,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to load event details");
        }

        setEvent(data.data);
      } catch (err: any) {
        console.error("Error fetching event:", err);
        Alert.alert("Error", err.message);
        router.back();
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchEvent();
    }
  }, [id]);

  return (
    <View style={styles.container}>
      <View style={styles.pageHeader}>
        <TouchableOpacity
          onPress={() => {
            router.replace({
              pathname: '/profile',
              params: { tab: 'Schedule' }
            })
          }}
          style={styles.backBtn}
        >
          <Ionicons name="chevron-back" size={20} color="#ffffff" />
          <Text style={styles.backBtnText}>Back to Schedule</Text>
        </TouchableOpacity>

        <View style={styles.headerTextBlock}>
          {loading && <Text style={styles.pageTitle}>Event details</Text>}

          {!loading && event &&
            <>
              <Text style={styles.pageTitle}>{event.title}</Text>
              <Text style={styles.pageDesc}>{event.eventType}</Text>
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

        <Text style={styles.ghostText}>Event</Text>
      </View>

      {!event && !loading && <View style={styles.centered}>
        <Text>No event found.</Text>
      </View>}

      {event && !loading && <ScrollView style={{ paddingHorizontal: 20 }}>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Title</Text>
          <Text style={styles.contactText}>Text</Text>
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
    fontFamily: 'Bebas'
  },
  contactButton: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  contactText: {
    marginLeft: 8,
    // color: "#FF4000",
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
