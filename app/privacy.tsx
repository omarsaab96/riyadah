import React from 'react';
import { Dimensions, Image, Linking, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLanguage } from '../context/language';

const { width } = Dimensions.get('window');

const privacyContent = {
    en: {
        title: 'Privacy policy',
        ghost: 'Privacy',
        effectiveDate: 'Effective Date: 06 June 2025',
        lastUpdated: 'Last Updated: 06 June 2025',
        sections: [
            {
                title: '1. Introduction',
                paragraphs: [
                    'RIYADAH / رياضة ("we", "our", or "us") values your privacy and is committed to protecting your personal data. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our mobile application ("the App").',
                ],
            },
            {
                title: '2. Information We Collect',
                paragraphs: [
                    'We collect information that you provide directly to us, including but not limited to:',
                ],
                bullets: [
                    'Personal identifying information (e.g., name, email address, date of birth)',
                    'Health and athletic performance data',
                    'Location data',
                    'Uploaded content such as images, videos, and messages',
                    'Usage data and analytics about your interactions with the App',
                ],
            },
            {
                title: '3. How We Use Your Information',
                paragraphs: [
                    'We use your information to operate, maintain, and improve the App, including to:',
                ],
                bullets: [
                    'Provide and personalize the services',
                    'Communicate with you, including for support and marketing',
                    'Analyze usage and trends to improve the App',
                    'Enforce our terms and policies',
                ],
                footer: 'Additionally, we reserve the right to use, share, or sell your personal data to third parties, partners, or affiliates as permitted under applicable law. Your continued use of the App signifies your acceptance of such uses.',
            },
            {
                title: '4. Data Sharing and Disclosure',
                paragraphs: [
                    'We may disclose your information to:',
                ],
                bullets: [
                    'Service providers and partners to facilitate our services',
                    'Legal authorities as required by law or to protect our rights',
                    'Third parties in connection with any merger, acquisition, or sale of assets',
                ],
            },
            {
                title: '5. Data Security',
                paragraphs: [
                    'We implement industry-standard security measures to protect your data from unauthorized access, alteration, or disclosure. However, no method of transmission or storage is completely secure, and we cannot guarantee absolute security.',
                ],
            },
            {
                title: '6. Your Rights',
                paragraphs: [
                    'Depending on your jurisdiction, you may have rights regarding your personal data, including:',
                ],
                bullets: [
                    'Accessing and correcting your data',
                    'Requesting deletion or restriction of processing',
                    'Objecting to certain processing activities',
                ],
                footer: 'To exercise these rights, please contact us at:',
            },
            {
                title: "7. Children's Privacy",
                paragraphs: [
                    'RIYADAH is not intended for children under the age of 13 (or the legal age in your jurisdiction). We do not knowingly collect personal data from children under this age. If you believe we have inadvertently collected such data, please contact us immediately.',
                ],
            },
            {
                title: '8. Changes to this Privacy Policy',
                paragraphs: [
                    'We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy within the App. Your continued use of the App after changes indicates your acceptance of the updated policy.',
                ],
            },
            {
                title: '9. Contact Us',
                paragraphs: [
                    'For any questions or concerns regarding this Privacy Policy, please contact us at:',
                ],
            },
        ],
        email: 'privacy@riyadah.com',
        address: 'Address: Lebanon, Beirut',
    },
    ar: {
        title: 'سياسة الخصوصية',
        ghost: 'خصوصية',
        effectiveDate: 'تاريخ النفاذ: 06 يونيو 2025',
        lastUpdated: 'آخر تحديث: 06 يونيو 2025',
        sections: [
            {
                title: '1. المقدمة',
                paragraphs: [
                    'تُقدّر RIYADAH / رياضة ("نحن" أو "لنا") خصوصيتك وتلتزم بحماية بياناتك الشخصية. توضح سياسة الخصوصية هذه كيفية جمع معلوماتك واستخدامها والإفصاح عنها وحمايتها عند استخدامك لتطبيقنا المحمول ("التطبيق").',
                ],
            },
            {
                title: '2. المعلومات التي نجمعها',
                paragraphs: [
                    'نجمع المعلومات التي تقدمها لنا مباشرة، بما في ذلك على سبيل المثال لا الحصر:',
                ],
                bullets: [
                    'معلومات تعريف شخصية مثل الاسم والبريد الإلكتروني وتاريخ الميلاد',
                    'بيانات الصحة والأداء الرياضي',
                    'بيانات الموقع',
                    'المحتوى المرفوع مثل الصور ومقاطع الفيديو والرسائل',
                    'بيانات الاستخدام والتحليلات المتعلقة بتفاعلك مع التطبيق',
                ],
            },
            {
                title: '3. كيف نستخدم معلوماتك',
                paragraphs: [
                    'نستخدم معلوماتك لتشغيل التطبيق وصيانته وتحسينه، بما في ذلك من أجل:',
                ],
                bullets: [
                    'تقديم الخدمات وتخصيصها',
                    'التواصل معك، بما في ذلك الدعم والتسويق',
                    'تحليل الاستخدام والاتجاهات لتحسين التطبيق',
                    'تطبيق شروطنا وسياساتنا',
                ],
                footer: 'بالإضافة إلى ذلك، نحتفظ بالحق في استخدام بياناتك الشخصية أو مشاركتها أو بيعها إلى أطراف ثالثة أو شركاء أو جهات تابعة وفقًا لما يسمح به القانون المعمول به. ويُعد استمرارك في استخدام التطبيق قبولًا منك لهذه الاستخدامات.',
            },
            {
                title: '4. مشاركة البيانات والإفصاح عنها',
                paragraphs: [
                    'قد نفصح عن معلوماتك إلى:',
                ],
                bullets: [
                    'مزودي الخدمات والشركاء لتسهيل خدماتنا',
                    'الجهات القانونية عندما يقتضي القانون ذلك أو لحماية حقوقنا',
                    'أطراف ثالثة في حال الاندماج أو الاستحواذ أو بيع الأصول',
                ],
            },
            {
                title: '5. أمن البيانات',
                paragraphs: [
                    'نطبق تدابير أمنية متوافقة مع معايير الصناعة لحماية بياناتك من الوصول غير المصرح به أو التعديل أو الإفصاح. ومع ذلك، لا توجد وسيلة نقل أو تخزين آمنة بالكامل، ولا يمكننا ضمان الأمان المطلق.',
                ],
            },
            {
                title: '6. حقوقك',
                paragraphs: [
                    'اعتمادًا على ولايتك القضائية، قد تكون لديك حقوق تتعلق ببياناتك الشخصية، ومنها:',
                ],
                bullets: [
                    'الوصول إلى بياناتك وتصحيحها',
                    'طلب حذف البيانات أو تقييد معالجتها',
                    'الاعتراض على بعض أنشطة المعالجة',
                ],
                footer: 'لممارسة هذه الحقوق، يرجى التواصل معنا على:',
            },
            {
                title: '7. خصوصية الأطفال',
                paragraphs: [
                    'لا يستهدف RIYADAH الأطفال دون سن 13 عامًا (أو السن القانونية في ولايتك القضائية). ونحن لا نجمع عن قصد بيانات شخصية من الأطفال دون هذا العمر. إذا كنت تعتقد أننا جمعنا هذه البيانات عن غير قصد، يرجى التواصل معنا فورًا.',
                ],
            },
            {
                title: '8. التغييرات على سياسة الخصوصية هذه',
                paragraphs: [
                    'قد نقوم بتحديث سياسة الخصوصية هذه من وقت لآخر. وسنقوم بإخطارك بأي تغييرات من خلال نشر النسخة الجديدة داخل التطبيق. ويعني استمرارك في استخدام التطبيق بعد هذه التغييرات قبولك للسياسة المحدّثة.',
                ],
            },
            {
                title: '9. تواصل معنا',
                paragraphs: [
                    'لأي أسئلة أو مخاوف تتعلق بسياسة الخصوصية هذه، يرجى التواصل معنا على:',
                ],
            },
        ],
        email: 'privacy@riyadah.com',
        address: 'العنوان: لبنان، بيروت',
    },
} as const;

export default function PrivacyPolicy() {
    const { language, isRTL } = useLanguage();
    const content = privacyContent[language];
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

                <Text style={[styles.paragraph, styles.linkBlock, textStyle]}>
                    <Text onPress={() => Linking.openURL(`mailto:${content.email}`)}>
                        {content.email}
                    </Text>
                    {'\n'}
                    {content.address}
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
        height: 40,
        position: 'absolute',
        top: 30,
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
        left: 'auto',
        right: 20,
        maxWidth:200
    },
    pageTitle: {
        color: '#ffffff',
        fontFamily: 'Qatar',
        fontSize: 30,
        marginBottom: 10
    },
    ghostText: {
        fontSize: 100,
        textTransform: 'uppercase',
        fontFamily: 'Qatar',
        position: 'absolute',
        bottom: 20,
        right: -5,
        color:'#ff6633',
    maxHeight:200,
    lineHeight:200
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
    linkBlock: {
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
