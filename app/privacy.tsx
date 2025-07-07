import { useRouter } from 'expo-router';
import React from 'react';
import { Dimensions, Image, Linking, ScrollView, StyleSheet, Text, View } from 'react-native';

const { width } = Dimensions.get('window');
const router = useRouter();


export default function PrivacyPolicy() {
    return (
        <View style={styles.container}>

            <View style={styles.pageHeader}>
                <Image
                    source={require('../assets/logo_white.png')}
                    style={styles.logo}
                    resizeMode="contain"
                />

                <View style={styles.headerTextBlock}>
                    <Text style={styles.pageTitle}>
                        Privacy policy
                    </Text>
                </View>

                <Text style={styles.ghostText}>
                    Privacy
                </Text>
            </View>

            <ScrollView contentContainerStyle={styles.contentContainer}>
                <Text style={styles.heading}>Effective Date: 06 June 2025</Text>
                <Text style={styles.heading}>Last Updated: 06 June 2025</Text>

                <Text style={styles.sectionTitle}>1. Introduction</Text>

                <Text style={styles.paragraph}>
                    RIYADAH / رياضة ("we", "our", or "us") values your privacy and is committed to protecting your personal data. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our mobile application ("the App").
                </Text>

                <Text style={styles.sectionTitle}>2. Information We Collect</Text>
                <Text style={styles.paragraph}>
                    We collect information that you provide directly to us, including but not limited to:
                </Text>
                <View style={styles.listContainer}>
                    <Text style={styles.listItem}>• Personal identifying information (e.g., name, email address, date of birth)</Text>
                    <Text style={styles.listItem}>• Health and athletic performance data</Text>
                    <Text style={styles.listItem}>• Location data</Text>
                    <Text style={styles.listItem}>• Uploaded content such as images, videos, and messages</Text>
                    <Text style={styles.listItem}>• Usage data and analytics about your interactions with the App</Text>
                </View>

                <Text style={styles.sectionTitle}>3. How We Use Your Information</Text>
                <Text style={styles.paragraph}>
                    We use your information to operate, maintain, and improve the App, including to:
                </Text>
                <View style={styles.listContainer}>
                    <Text style={styles.listItem}>• Provide and personalize the services</Text>
                    <Text style={styles.listItem}>• Communicate with you, including for support and marketing</Text>
                    <Text style={styles.listItem}>• Analyze usage and trends to improve the App</Text>
                    <Text style={styles.listItem}>• Enforce our terms and policies</Text>
                </View>
                <Text style={styles.paragraph}>
                    Additionally, we reserve the right to use, share, or sell your personal data to third parties, partners, or affiliates as permitted under applicable law. Your continued use of the App signifies your acceptance of such uses.
                </Text>

                <Text style={styles.sectionTitle}>4. Data Sharing and Disclosure</Text>
                <Text style={styles.paragraph}>
                    We may disclose your information to:
                </Text>
                <View style={styles.listContainer}>
                    <Text style={styles.listItem}>• Service providers and partners to facilitate our services</Text>
                    <Text style={styles.listItem}>• Legal authorities as required by law or to protect our rights</Text>
                    <Text style={styles.listItem}>• Third parties in connection with any merger, acquisition, or sale of assets</Text>
                </View>

                <Text style={styles.sectionTitle}>5. Data Security</Text>
                <Text style={styles.paragraph}>
                    We implement industry-standard security measures to protect your data from unauthorized access, alteration, or disclosure. However, no method of transmission or storage is completely secure, and we cannot guarantee absolute security.
                </Text>

                <Text style={styles.sectionTitle}>6. Your Rights</Text>
                <Text style={styles.paragraph}>
                    Depending on your jurisdiction, you may have rights regarding your personal data, including:
                </Text>
                <View style={styles.listContainer}>
                    <Text style={styles.listItem}>• Accessing and correcting your data</Text>
                    <Text style={styles.listItem}>• Requesting deletion or restriction of processing</Text>
                    <Text style={styles.listItem}>• Objecting to certain processing activities</Text>
                </View>
                <Text style={styles.paragraph}>
                    To exercise these rights, please contact us at: {'\n'}
                    <Text onPress={() => Linking.openURL('mailto:privacy@riyadah.com')}>
                        privacy@riyadah.com
                    </Text>
                </Text>

                <Text style={styles.sectionTitle}>7. Children's Privacy</Text>
                <Text style={styles.paragraph}>
                    RIYADAH is not intended for children under the age of 13 (or the legal age in your jurisdiction). We do not knowingly collect personal data from children under this age. If you believe we have inadvertently collected such data, please contact us immediately.
                </Text>

                <Text style={styles.sectionTitle}>8. Changes to this Privacy Policy</Text>
                <Text style={styles.paragraph}>
                    We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy within the App. Your continued use of the App after changes indicates your acceptance of the updated policy.
                </Text>

                <Text style={styles.sectionTitle}>9. Contact Us</Text>
          <Text style={[styles.paragraph, styles.lastparagraph]}>
                    For any questions or concerns regarding this Privacy Policy, please contact us at: {'\n'}
                    <Text onPress={() => Linking.openURL('mailto:privacy@riyadah.com')}>
                        privacy@riyadah.com
                    </Text>{'\n'}
                    Address: Lebanon, Beirut
                </Text>
            </ScrollView>
        </View>
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
        marginBottom: 30
    },
    logo: {
        width: 120,
        position: 'absolute',
        top: 20,
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
        marginBottom: 10
    },
    pageDesc: {
        color: '#ffffff',
        fontSize: 16,
        fontFamily: 'Manrope'
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
    contentContainer: {
        paddingLeft: 20,
        paddingRight: 20
    },
    heading: {
        fontSize: 16,
        marginBottom: 5,
        fontFamily: 'Bebas'
    },
    sectionTitle: {
        fontFamily: 'Bebas',
        fontSize: 18,
        marginTop: 20,
        marginBottom: 10,
    },
    paragraph: {
        fontSize: 14,
        lineHeight: 22,
        marginBottom: 10,
        fontFamily: 'Manrope'
    },
    lastparagraph: {
        marginTop: 20,
        marginBottom: 50
    },
    listContainer: {
        marginLeft: 20,
        marginBottom: 10,
    },
    listItem: {
        fontSize: 14,
        lineHeight: 22,
    }
});
