import { RadarChart } from '@salmonco/react-native-radar-chart';
import { useRouter } from 'expo-router';
import React, { useRef } from 'react';
import {
    Animated,
    Dimensions,
    Image,
    StyleSheet,
    Text,
    View
} from 'react-native';
import CountryFlag from "react-native-country-flag";


const { width } = Dimensions.get('window');
const router = useRouter();


export default function Profile() {
    const scrollY = useRef(new Animated.Value(0)).current;

    const headerHeight = scrollY.interpolate({
        inputRange: [0, 300],
        outputRange: [300, 175],
        extrapolate: 'clamp',
    });
    const logoOpacity = scrollY.interpolate({
        inputRange: [0, 300],
        outputRange: [1, 0],
        extrapolate: 'clamp',
    });

    //graph data
    const data = [
        { label: 'Attack', value: 90 },
        { label: 'Defense', value: 40 },
        { label: 'Speed', value: 70 },
        { label: 'Stamina', value: 35 },
        { label: 'Skill', value: 80 }
    ];

    return (
        <View style={styles.container}>
            <Animated.View style={[styles.pageHeader, { height: headerHeight }]}>
                <Animated.Image
                    source={require('../assets/logo_white.png')}
                    style={[styles.logo, { opacity: logoOpacity }]}
                    resizeMode="contain"
                />

                <View style={styles.headerTextBlock}>
                    <Text style={styles.pageTitle}>Cristiano Ronaldo</Text>
                    <Text style={styles.pageDesc}>Football player</Text>
                </View>

                <Text style={styles.ghostText}>Ronaldo</Text>

                <View style={styles.profileImage}>
                    <Image
                        source={require('../assets/avatar.png')}
                        style={styles.profileImageAvatar}
                        resizeMode="contain"
                    />
                </View>
            </Animated.View>

            <Animated.ScrollView
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                    { useNativeDriver: false }
                )}
                scrollEventThrottle={16}
            >
                <View style={styles.contentContainer}>
                    <View style={styles.profileSection}>
                        <Text style={styles.title}>
                            Bio
                        </Text>
                        <Text style={styles.paragraph}>
                            I train to be the best. Every match is a chance to prove myself again. Success doesn't come by chance — it comes from relentless hard work, sacrifice, and passion for the game.
                        </Text>
                    </View>

                    <View style={styles.profileSection}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Text style={styles.title}>
                                Country
                            </Text>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <View style={{ marginRight: 8 }}>
                                    <CountryFlag isoCode="PT" size={14} />
                                </View>
                                <Text style={styles.paragraph}>Portugal</Text>
                            </View>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Text style={styles.title}>
                                Team/club
                            </Text>
                            <View>
                                <Text style={styles.paragraph}>Al Nassr FC</Text>
                            </View>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Text style={styles.title}>
                                Date of Birth
                            </Text>
                            <View>
                                <Text style={styles.paragraph}>February 5, 1985</Text>
                            </View>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Text style={styles.title}>
                                Height
                            </Text>
                            <View>
                                <Text style={styles.paragraph}>1.87 m</Text>
                            </View>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Text style={styles.title}>
                                Weight
                            </Text>
                            <View>
                                <Text style={styles.paragraph}>83 kg</Text>
                            </View>
                        </View>
                    </View>

                    <View style={styles.profileSection}>
                        <Text style={styles.title}>
                            Highlights
                        </Text>
                        <Text style={styles.paragraph}>
                            5x Ballon d'Or Winner{'\n'}
                            UEFA Champions League Titles: 5{'\n'}
                            European Championship Winner (2016){'\n'}
                            Nations League Winner (2019){'\n'}
                            Most Goals in UEFA Champions League History{'\n'}
                            850+ Career Goals
                        </Text>
                    </View>

                    <View style={styles.profileSection}>
                        <Text style={styles.title}>
                            Stats
                        </Text>
                        <Text style={styles.paragraph}>
                            Matches Played: 41{'\n'}
                            Goals: 35{'\n'}
                            Assists: 12{'\n'}
                            Shots on Target: 72%{'\n'}
                            Pass Accuracy: 83%
                        </Text>
                    </View>

                    <View style={styles.profileSection}>
                        <Text style={styles.title}>
                            Achievements
                        </Text>
                        <Text style={styles.paragraph}>
                            FIFA Player of the Year{'\n'}
                            Top Scorer in 4 Major European Leagues{'\n'}
                            100+ International Goals for Portugal{'\n'}
                            Golden Boot Winner - Euro 2020
                        </Text>
                    </View>

                    <View style={styles.profileSection}>
                        <Text style={styles.title}>
                            Upcoming Events
                        </Text>
                        <Text style={styles.paragraph}>
                            June 10: Friendly Match vs Brazil{'\n'}
                            July 4: Champions League Qualifier{'\n'}
                            August 20: League Opener
                        </Text>
                    </View>


                    <View style={styles.profileSection}>
                        <Text style={styles.title}>
                            Skills
                        </Text>
                        <View style={{alignItems:'center'}}>
                        <RadarChart
                            data={data}
                            maxValue={100}
                            gradientColor={{
                                startColor: '#FF9432',
                                endColor: '#FFF8F1',
                                count: 5,
                            }}
                            stroke={['#FFE8D3', '#FFE8D3', '#FFE8D3', '#FFE8D3', '#ff9532']}
                            strokeWidth={[0.5, 0.5, 0.5, 0.5, 1]}
                            strokeOpacity={[1, 1, 1, 1, 0.13]}
                            labelColor="#111111"
                            dataFillColor="#FF9432"
                            dataFillOpacity={0.8}
                            dataStroke="#FF4000"
                            dataStrokeWidth={2}
                            isCircle
                        />
                            
                        </View>
                    </View>
                </View>
            </Animated.ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
        height: '100%'
    },
    contentContainer: {
        padding: 20
    },
    pageHeader: {
        backgroundColor: '#FF4000',
        height: 270,
        // marginBottom: 30
    },
    logo: {
        width: 150,
        position: 'absolute',
        top: 40,
        left: 20,
        zIndex: 1,
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
    profileSection: {
        marginBottom: 30
    },
    title: {
        fontFamily: "Bebas",
        fontSize: 20
    },
    subtitle: {
        fontFamily: "Manrope",
        fontSize: 16,
        fontWeight: 'bold'
    },
    paragraph: {
        fontFamily: "Manrope",
        fontSize: 16
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
        fontFamily: 'Bebas',
    },
});
