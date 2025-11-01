import { useRouter } from 'expo-router';
import React from 'react';
import {
  Dimensions,
  Image,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';

const { width } = Dimensions.get('window');
const router = useRouter();

export default function TermsConditions() {
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
            Terms and conditions
          </Text>
        </View>

        <Text style={styles.ghostText}>
          Terms
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.contentContainer}>
        <View>
          <Text style={styles.heading}>Effective Date: 04 June 2025</Text>
          <Text style={styles.heading}>Last Updated: 04 June 2025</Text>

          <Text style={styles.sectionTitle}>1. Introduction</Text>
          <Text style={styles.paragraph}>
            Welcome to RIYADAH / رياضة (“the App”), a digital platform operated by Riyadah (“we”, “us”, or “our”) that serves as a global network for sports enthusiasts, athletes, clubs, associations, and sponsors. By accessing or using RIYADAH, you (“User”) agree to comply with and be bound by these Terms and Conditions. If you do not accept these terms, do not use the App.
          </Text>

          <Text style={styles.sectionTitle}>2. User Eligibility</Text>
          <Text style={styles.paragraph}>
            By using RIYADAH, you confirm that you are at least 13 years old (or the legal age in your jurisdiction) and legally capable of entering into binding agreements.
          </Text>

          <Text style={styles.sectionTitle}>3. User Data and Privacy</Text>
          <Text style={styles.paragraph}>
            By registering or using the App, you expressly consent to our collection, storage, use, processing, sharing, and transfer of your personal and usage data, including but not limited to:
          </Text>

          <View style={styles.listContainer}>
            <Text style={styles.listItem}>• Personal identifying information</Text>
            <Text style={styles.listItem}>• Health and athletic performance data</Text>
            <Text style={styles.listItem}>• Behavioral and location information</Text>
            <Text style={styles.listItem}>• Uploaded content such as images, videos, and messages</Text>
          </View>

          <Text style={styles.paragraph}>
            You acknowledge and agree that RIYADAH may use, analyze, and monetize your data, including selling or licensing it to third parties, as permitted under applicable laws. Your continued use constitutes acceptance of this data usage policy.
          </Text>

          <Text style={styles.sectionTitle}>4. Intellectual Property</Text>
          <Text style={styles.paragraph}>
            All content, features, and software on RIYADAH are owned or licensed by us and protected under intellectual property laws. Unauthorized copying, reproduction, or distribution is prohibited.
          </Text>

          <Text style={styles.sectionTitle}>5. Acceptable Use</Text>
          <Text style={styles.paragraph}>
            You agree not to:
          </Text>

          <View style={styles.listContainer}>
            <Text style={styles.listItem}>• Falsify identity or affiliations</Text>
            <Text style={styles.listItem}>• Post unlawful or harmful content</Text>
            <Text style={styles.listItem}>• Exploit, scrape, or misuse the platform's data or resources</Text>
            <Text style={styles.listItem}>• Attempt unauthorized system access</Text>
          </View>

          <Text style={styles.paragraph}>
            Violation of these terms may result in suspension or termination of your access without prior notice.
          </Text>

          <Text style={styles.sectionTitle}>6. Limitation of Liability</Text>
          <Text style={styles.paragraph}>
            To the maximum extent allowed by law, RIYADAH and its affiliates disclaim all warranties and are not liable for damages resulting from your use or inability to use the App.
          </Text>

          <Text style={styles.sectionTitle}>7. Indemnification</Text>
          <Text style={styles.paragraph}>
            You agree to indemnify and hold harmless RIYADAH and its affiliates from claims or damages arising out of your breach of these Terms or misuse of the App.
          </Text>

          <Text style={styles.sectionTitle}>8. Governing Law and Jurisdiction</Text>
          <Text style={styles.paragraph}>
            These Terms are governed by the laws of [Insert Jurisdiction]. Disputes shall be resolved exclusively in the courts of this jurisdiction.
          </Text>

          <Text style={styles.sectionTitle}>9. Changes to Terms</Text>
          <Text style={styles.paragraph}>
            We reserve the right to modify these Terms at any time. Continued use of RIYADAH after changes implies acceptance.
          </Text>

          <Text style={styles.sectionTitle}>10. Contact</Text>
          <Text style={styles.paragraph}>
            For legal inquiries, contact:{'\n'}
            Email: <Text onPress={() => Linking.openURL('mailto:legal@riyadah.com')}>legal@riyadah.com</Text>{'\n'}
            Address: Lebanon, Beirut
          </Text>

          <Text style={[styles.paragraph, styles.lastparagraph]}>
            By using RIYADAH / رياضة, you agree that your data may be used and monetized as described, and that the company retains full discretion over the App and its data.
          </Text>
        </View>
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
    height: 40,
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
    fontFamily: 'Qatar',
    fontSize: 30,
  },
  pageDesc: {
    color: '#ffffff',
    fontSize: 16,
    fontFamily: 'Acumin'
  },
  ghostText: {
    color: '#ffffff',
    fontSize: 100,
    fontFamily: 'Qatar',
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
    fontFamily: 'Qatar'
  },
  sectionTitle: {
    fontFamily: 'Qatar',
    fontSize: 18,
    marginTop: 20,
    marginBottom: 10,
  },
  paragraph: {
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 10,
    fontFamily: 'Acumin'
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
