import React, { useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';


const GooglePlacesInput = () => {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const [selectedPlace, setSelectedPlace] = useState(null);

    const GOOGLE_KEY = 'AIzaSyDHaMtAqPpITLBiPKevf5hPu5hNqpURvII'

    const searchPlaces = async (text) => {
        setQuery(text);
        if (text.length < 2) return;

        try {
            const response = await fetch(
                "https://places.googleapis.com/v1/places:autocomplete",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "X-Goog-Api-Key": GOOGLE_KEY,
                        "X-Goog-FieldMask":
                            "suggestions.placePrediction.place," +
                            "suggestions.placePrediction.placeId," +
                            "suggestions.placePrediction.text," +
                            "suggestions.placePrediction.structuredFormat"
                    },
                    body: JSON.stringify({ input: text })
                }
            );

            const json = await response.json();
            setResults(json.suggestions || []);
        } catch (err) {
            console.log("FETCH ERROR:", err);
        }
    };

    const fetchPlaceDetails = async (placeId) => {
        try {
            const url = `https://places.googleapis.com/v1/places/${placeId}?key=${GOOGLE_KEY}&fields=id,displayName,formattedAddress,location`;

            const res = await fetch(url);
            const json = await res.json();

            console.log("PLACE DETAILS:", json);

            // Update UI
            setSelectedPlace(json);
            setQuery(json.displayName?.text || "");
            setResults([]);

        } catch (err) {
            console.log("DETAILS ERROR:", err);
        }
    };

    const renderItem = ({ item }) => {
        const prediction = item.placePrediction;
        const placeId = prediction.placeId;

        return (
            <TouchableOpacity
                style={styles.item}
                onPress={() => fetchPlaceDetails(placeId)}
            >
                <Text style={styles.title}>
                    {prediction.structuredFormat?.mainText?.text}
                </Text>
                <Text style={styles.address}>
                    {prediction.structuredFormat?.secondaryText?.text}
                </Text>
            </TouchableOpacity>
        );
    };

    return (
        <View style={{ padding: 20 }}>
            <TextInput
                value={query}
                onChangeText={searchPlaces}
                placeholder="Search location..."
                placeholderTextColor="#888"
                style={styles.input}
            />

            <FlatList
                data={results}
                keyExtractor={(item, index) => item.placePrediction.placeId + index}
                style={styles.list}
                renderItem={renderItem}
            />

            {selectedPlace && (
                <View style={{ marginTop: 20 }}>
                    <Text style={{ color: "#000" }}>Selected:</Text>
                    <Text style={{ color: "#000" }}>
                        {selectedPlace.displayName?.text}
                    </Text>
                    <Text style={{ color: "#000" }}>
                        {selectedPlace.formattedAddress}
                    </Text>
                    <Text style={{ color: "#000" }}>
                        Lat: {selectedPlace.location?.latitude}
                    </Text>
                    <Text style={{ color: "#000" }}>
                        Lng: {selectedPlace.location?.longitude}
                    </Text>
                </View>
            )}
        </View>
    );
}


const styles = StyleSheet.create({
    input: {
        height: 45,
        backgroundColor: "#F4F4F4",
        borderRadius: 8,
        paddingHorizontal: 12,
        color: "#000",
        fontSize: 16,
        marginBottom: 10,
    },
    list: {
        backgroundColor: "#fff",
        borderRadius: 8,
        elevation: 4,
        maxHeight: 300,
    },
    item: {
        padding: 12,
        borderBottomColor: "#eee",
        borderBottomWidth: 1,
    },
    title: {
        color: "#000",
        fontSize: 16,
    },
    address: {
        color: "#555",
        fontSize: 12,
        marginTop: 2,
    }
});
export default GooglePlacesInput;