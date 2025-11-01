import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useLocalSearchParams, useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import React, { useEffect, useState } from "react";
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

const { width } = Dimensions.get('window');

export default function StaffDetailsScreen() {
  const params = useLocalSearchParams();
  const id = params.id;
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [item, setItem] = useState<any>(null);

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const token = await SecureStore.getItemAsync("userToken");
        const response = await fetch(
          `http://193.187.132.170:5000/api/inventory/${id}`,
          {
            headers: {
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        const data = await response.json();


        if (!response.ok) {
          throw new Error(data.message || "Failed to load item details");
        }

        setItem(data.data[0]);
      } catch (err: any) {
        console.error("Error fetching item:", err);
        Alert.alert("Error", err.message);
        router.back();
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchItem();
    }
  }, [id]);

  return (
    <View style={styles.container}>
      <View style={styles.pageHeader}>
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
          <Text style={styles.backBtnText}>Back to Inventory</Text>
        </TouchableOpacity>

        <View style={styles.headerTextBlock}>
          {loading && <Text style={styles.pageTitle}>Inventory item details</Text>}

          {!loading && item &&
            <>
              <Text style={styles.pageTitle}>{item.itemName}</Text>
              <Text style={styles.pageDesc}>{item.category}</Text>
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

        <Text style={styles.ghostText}>Item</Text>
      </View>

      {!item && !loading && <View style={styles.centered}>
        <Text>No item found.</Text>
      </View>}

      {item && !loading && <ScrollView style={{ paddingHorizontal: 20 }}>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>image</Text>
          {item.image ? (
            <Image
              source={{ uri: item.image }}
              style={{ width: 100, height: 100 }}
            />
          ) : (
            <View style={[styles.inventoryIcon, styles.defaultInventoryIcon]}>
              <FontAwesome5 name="box-open" size={36} color="#fff" />
            </View>
          )

          }
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Available quantity</Text>
          <Text style={styles.contactText}>{item.quantity}</Text>
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>unitPrice</Text>
          <Text style={styles.contactText}>{item.unitPrice}</Text>
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>description</Text>
          <Text style={styles.contactText}>{item.description || '-'}</Text>
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
    // color: "#FF4000",
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
    alignContent: 'center',
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
    fontSize:100,textTransform:'uppercase',
    fontFamily: 'Qatar',
    position: 'absolute',
    bottom: 20,
    right: -5,
    opacity: 0.2
  },
  inventoryIcon: {
        width: 100,
        height: 100,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    defaultInventoryIcon: {
        backgroundColor: '#FF4000',
    },
});
