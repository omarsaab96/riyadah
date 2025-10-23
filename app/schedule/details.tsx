import Entypo from '@expo/vector-icons/Entypo';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Ionicons from '@expo/vector-icons/Ionicons';
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


const { width } = Dimensions.get('window');

export default function StaffDetailsScreen() {
  const params = useLocalSearchParams();
  const id = params.id;
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [event, setEvent] = useState<any>(null);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const token = await SecureStore.getItemAsync("userToken");
        const response = await fetch(
          `http://193.187.132.170:5000/api/schedules/${id}`,
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
    const dateStr = d.toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    return `${dateStr}`;
  };

  const formatTime = (date) => {
    if (!date) return '';
    const d = new Date(date);

    const timeStr = d.toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true, // set true if you want AM/PM
    });
    return ` ${timeStr}`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.pageHeader}>
        <TouchableOpacity
          onPress={() => {
            router.back()
          }}
          style={styles.backBtn}
        >
          <Ionicons name="chevron-back" size={20} color="#ffffff" />
          <Text style={styles.backBtnText}>Back</Text>
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
        {userId == event.createdBy &&
          <View style={[styles.section, { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}>

            {event.status == 'scheduled' && <View style={{ flex: 1 }}>
              <Text style={[styles.contactText, { textTransform: 'capitalize', color: '#009933' }]}>
                <FontAwesome name="check" size={14} color="#009933" />&nbsp;{event.status}
              </Text>
            </View>}

            <TouchableOpacity style={styles.editToggle}
              onPress={() => router.push({
                pathname: '/schedule/edit',
                params: { id: event._id }
              })}
            >
              <Entypo name="edit" size={16} color="#FF4000" />
              <Text style={styles.editToggleText}>Edit</Text>
            </TouchableOpacity>
          </View>
        }

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Title</Text>
          <Text style={styles.contactText}>{event.title}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>description</Text>
          <Text style={styles.contactText}>{event.description || "No description"}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Date</Text>
          <Text style={styles.contactText}>{formatDate(event.date)}</Text>
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>from</Text>
          <Text style={styles.contactText}>{formatTime(event.startTime)}</Text>
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>till</Text>
          <Text style={styles.contactText}>{formatTime(event.endTime)}</Text>
        </View>

        {event.location?.latitude != null && event.location?.longitude != null && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Location</Text>

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
              <Text style={styles.locationLinkText}>Get Directions</Text>
            </TouchableOpacity>
          </View>
        )}

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
    color: 'black'
  },
  contactButton: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  contactText: {
    fontFamily: 'Manrope',
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
    fontFamily: 'Bebas',
    fontSize: 20,
    textAlign: 'center'
  },
  editToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5
  },
  editToggleText: {
    color: 'black',
    fontFamily: 'Bebas',
    fontSize: 18
  },
});
