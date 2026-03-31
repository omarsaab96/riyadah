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
import { useLanguage } from '../context/language';

const { width } = Dimensions.get('window');

const termsContent = {
  en: {
    title: 'Terms and conditions',
    ghost: 'Terms',
    effectiveDate: 'Effective Date: 04 June 2025',
    lastUpdated: 'Last Updated: 04 June 2025',
    sections: [
      {
        title: '1. Introduction',
        paragraphs: [
          'Welcome to RIYADAH / رياضة ("the App"), a digital platform operated by Riyadah ("we", "us", or "our") that serves as a global network for sports enthusiasts, athletes, clubs, associations, and sponsors. By accessing or using RIYADAH, you ("User") agree to comply with and be bound by these Terms and Conditions. If you do not accept these terms, do not use the App.',
        ],
      },
      {
        title: '2. User Eligibility',
        paragraphs: [
          'By using RIYADAH, you confirm that you are at least 13 years old (or the legal age in your jurisdiction) and legally capable of entering into binding agreements.',
        ],
      },
      {
        title: '3. User Data and Privacy',
        paragraphs: [
          'By registering or using the App, you expressly consent to our collection, storage, use, processing, sharing, and transfer of your personal and usage data, including but not limited to:',
        ],
        bullets: [
          'Personal identifying information',
          'Health and athletic performance data',
          'Behavioral and location information',
          'Uploaded content such as images, videos, and messages',
        ],
        footer: 'You acknowledge and agree that RIYADAH may use, analyze, and monetize your data, including selling or licensing it to third parties, as permitted under applicable laws. Your continued use constitutes acceptance of this data usage policy.',
      },
      {
        title: '4. Intellectual Property',
        paragraphs: [
          'All content, features, and software on RIYADAH are owned or licensed by us and protected under intellectual property laws. Unauthorized copying, reproduction, or distribution is prohibited.',
        ],
      },
      {
        title: '5. Acceptable Use',
        paragraphs: [
          'You agree not to:',
        ],
        bullets: [
          'Falsify identity or affiliations',
          'Post unlawful or harmful content',
          "Exploit, scrape, or misuse the platform's data or resources",
          'Attempt unauthorized system access',
        ],
        footer: 'Violation of these terms may result in suspension or termination of your access without prior notice.',
      },
      {
        title: '6. Limitation of Liability',
        paragraphs: [
          'To the maximum extent allowed by law, RIYADAH and its affiliates disclaim all warranties and are not liable for damages resulting from your use or inability to use the App.',
        ],
      },
      {
        title: '7. Indemnification',
        paragraphs: [
          'You agree to indemnify and hold harmless RIYADAH and its affiliates from claims or damages arising out of your breach of these Terms or misuse of the App.',
        ],
      },
      {
        title: '8. Governing Law and Jurisdiction',
        paragraphs: [
          'These Terms are governed by the laws of [Insert Jurisdiction]. Disputes shall be resolved exclusively in the courts of this jurisdiction.',
        ],
      },
      {
        title: '9. Changes to Terms',
        paragraphs: [
          'We reserve the right to modify these Terms at any time. Continued use of RIYADAH after changes implies acceptance.',
        ],
      },
      {
        title: '10. Contact',
        paragraphs: [
          'For legal inquiries, contact:',
        ],
      },
    ],
    email: 'legal@riyadah.com',
    address: 'Address: Lebanon, Beirut',
    closing: 'By using RIYADAH / رياضة, you agree that your data may be used and monetized as described, and that the company retains full discretion over the App and its data.',
  },
  ar: {
    title: 'الشروط والأحكام',
    ghost: 'شروط',
    effectiveDate: 'تاريخ النفاذ: 04 يونيو 2025',
    lastUpdated: 'آخر تحديث: 04 يونيو 2025',
    sections: [
      {
        title: '1. المقدمة',
        paragraphs: [
          'مرحبًا بك في RIYADAH / رياضة ("التطبيق")، وهي منصة رقمية تديرها Riyadah ("نحن" أو "لنا") وتعمل كشبكة عالمية لعشاق الرياضة والرياضيين والأندية والاتحادات والرعاة. من خلال الوصول إلى RIYADAH أو استخدامها، فإنك ("المستخدم") توافق على الالتزام بهذه الشروط والأحكام. وإذا لم تقبل هذه الشروط، فيجب عليك عدم استخدام التطبيق.',
        ],
      },
      {
        title: '2. أهلية المستخدم',
        paragraphs: [
          'باستخدامك RIYADAH، فإنك تؤكد أنك تبلغ من العمر 13 عامًا على الأقل (أو السن القانونية في ولايتك القضائية) وأن لديك الأهلية القانونية لإبرام اتفاقيات ملزمة.',
        ],
      },
      {
        title: '3. بيانات المستخدم والخصوصية',
        paragraphs: [
          'من خلال التسجيل أو استخدام التطبيق، فإنك توافق صراحةً على جمع بياناتك الشخصية وبيانات الاستخدام وتخزينها واستخدامها ومعالجتها ومشاركتها ونقلها، بما في ذلك على سبيل المثال لا الحصر:',
        ],
        bullets: [
          'معلومات تعريف شخصية',
          'بيانات الصحة والأداء الرياضي',
          'المعلومات السلوكية وبيانات الموقع',
          'المحتوى المرفوع مثل الصور ومقاطع الفيديو والرسائل',
        ],
        footer: 'أنت تقر وتوافق على أنه يجوز لـ RIYADAH استخدام بياناتك وتحليلها وتحقيق الدخل منها، بما في ذلك بيعها أو ترخيصها لأطراف ثالثة وفقًا لما تسمح به القوانين المعمول بها. ويُعد استمرارك في الاستخدام قبولًا لسياسة استخدام البيانات هذه.',
      },
      {
        title: '4. الملكية الفكرية',
        paragraphs: [
          'جميع المحتويات والميزات والبرمجيات على RIYADAH مملوكة لنا أو مرخّصة لنا ومحمية بموجب قوانين الملكية الفكرية. ويُحظر النسخ أو إعادة الإنتاج أو التوزيع غير المصرح به.',
        ],
      },
      {
        title: '5. الاستخدام المقبول',
        paragraphs: [
          'توافق على عدم القيام بما يلي:',
        ],
        bullets: [
          'تزوير الهوية أو الانتماءات',
          'نشر محتوى غير قانوني أو ضار',
          'استغلال بيانات المنصة أو مواردها أو كشطها أو إساءة استخدامها',
          'محاولة الوصول غير المصرح به إلى الأنظمة',
        ],
        footer: 'قد يؤدي انتهاك هذه الشروط إلى تعليق أو إنهاء وصولك دون إشعار مسبق.',
      },
      {
        title: '6. تحديد المسؤولية',
        paragraphs: [
          'إلى أقصى حد يسمح به القانون، تخلي RIYADAH والشركات التابعة لها مسؤوليتها عن جميع الضمانات ولا تتحمل مسؤولية الأضرار الناتجة عن استخدامك للتطبيق أو عدم قدرتك على استخدامه.',
        ],
      },
      {
        title: '7. التعويض',
        paragraphs: [
          'توافق على تعويض RIYADAH والشركات التابعة لها وإبراء ذمتها من أي مطالبات أو أضرار تنشأ عن خرقك لهذه الشروط أو إساءة استخدامك للتطبيق.',
        ],
      },
      {
        title: '8. القانون الحاكم والاختصاص القضائي',
        paragraphs: [
          'تخضع هذه الشروط لقوانين [أدخل الولاية القضائية]. ويتم الفصل في النزاعات حصريًا أمام محاكم هذه الولاية القضائية.',
        ],
      },
      {
        title: '9. التغييرات على الشروط',
        paragraphs: [
          'نحتفظ بالحق في تعديل هذه الشروط في أي وقت. ويُعد استمرار استخدام RIYADAH بعد التغييرات قبولًا لها.',
        ],
      },
      {
        title: '10. التواصل',
        paragraphs: [
          'للاستفسارات القانونية، تواصل معنا على:',
        ],
      },
    ],
    email: 'legal@riyadah.com',
    address: 'العنوان: لبنان، بيروت',
    closing: 'باستخدامك RIYADAH / رياضة، فإنك توافق على أن بياناتك قد تُستخدم ويُحقق منها الدخل كما هو موضح، وأن الشركة تحتفظ بسلطة تقديرية كاملة على التطبيق وبياناته.',
  },
} as const;

export default function TermsConditions() {
  const { language, isRTL } = useLanguage();
  const content = termsContent[language];
  const textStyle = isRTL ? styles.rtlText : styles.ltrText;

  return (
    <View style={styles.container}>
      <View style={styles.pageHeader}>
        <Image
          source={require('../assets/logo_white.png')}
          style={[styles.logo, isRTL && styles.logoRtl]}
          resizeMode="contain"
        />

        <View style={[styles.headerTextBlock, isRTL && styles.headerTextBlockRtl]}>
          <Text style={[styles.pageTitle, textStyle]}>
            {content.title}
          </Text>
        </View>

        <Text style={[styles.ghostText, isRTL && styles.ghostTextRtl]}>
          {content.ghost}
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.contentContainer}>
        <View>
          <Text style={[styles.heading, textStyle]}>{content.effectiveDate}</Text>
          <Text style={[styles.heading, textStyle]}>{content.lastUpdated}</Text>

          {content.sections.map((section) => (
            <View key={section.title}>
              <Text style={[styles.sectionTitle, textStyle]}>{section.title}</Text>

              {section.paragraphs.map((paragraph) => (
                <Text key={paragraph} style={[styles.paragraph, textStyle]}>
                  {paragraph}
                </Text>
              ))}

              {section.bullets && (
                <View style={[styles.listContainer, isRTL && styles.listContainerRtl]}>
                  {section.bullets.map((bullet) => (
                    <Text key={bullet} style={[styles.listItem, textStyle]}>
                      {'\u2022'} {bullet}
                    </Text>
                  ))}
                </View>
              )}

              {section.footer && (
                <Text style={[styles.paragraph, textStyle]}>
                  {section.footer}
                </Text>
              )}
            </View>
          ))}

          <Text style={[styles.paragraph, textStyle]}>
            <Text onPress={() => Linking.openURL(`mailto:${content.email}`)}>
              {content.email}
            </Text>
            {'\n'}
            {content.address}
          </Text>

          <Text style={[styles.paragraph, styles.lastparagraph, textStyle]}>
            {content.closing}
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
  logoRtl: {
    left: undefined,
    right: 20,
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
  ghostText: {
    color: '#ffffff',
    fontSize: 100,
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
    fontFamily: 'Acumin',
    color: '#111111',
  },
  lastparagraph: {
    marginTop: 20,
    marginBottom: 50
  },
  listContainer: {
    marginLeft: 20,
    marginBottom: 10,
  },
  listContainerRtl: {
    marginLeft: 0,
    marginRight: 20,
  },
  listItem: {
    fontSize: 14,
    lineHeight: 22,
    color: '#111111',
  },
  ltrText: {
    textAlign: 'left',
    writingDirection: 'ltr',
  },
  rtlText: {
    textAlign: 'right',
    writingDirection: 'rtl',
  }
});
