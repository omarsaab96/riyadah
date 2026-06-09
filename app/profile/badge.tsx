import { useLanguage } from '@/context/language';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { jwtDecode } from 'jwt-decode';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const { width } = Dimensions.get('window');

type UserShape = {
  name?: string;
  image?: string | null;
  type?: string;
  gender?: string;
  accountBadge?: boolean;
};

type DecodedToken = {
  userId?: string;
};

export default function Badge() {
  const router = useRouter();
  const { isRTL, t } = useLanguage();
  const [userId, setUserId] = useState<string | null>(null);
  const [user, setUser] = useState<UserShape | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      try {
        const token = await SecureStore.getItemAsync('userToken');
        if (!token) {
          setLoading(false);
          return;
        }

        const decodedToken = jwtDecode<DecodedToken>(token);
        if (!decodedToken.userId) {
          setLoading(false);
          return;
        }

        setUserId(decodedToken.userId);

        const response = await fetch(`https://server.riyadah.app/api/users/${decodedToken.userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          setError('API error');
          setLoading(false);
          return;
        }

        const nextUser = await response.json();
        setUser(nextUser);
      } catch (nextError) {
        console.error('Failed to load badge user', nextError);
        setError('API error');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const toggleFAQ = (key: string) => {
    setExpanded(expanded === key ? null : key);
  };

  const renderProfileImage = () => {
    if (!user || loading) return null;

    const isClub = user.type === 'Club' || user.type === 'Association';
    const isMale = user.gender === 'Male';
    const isFemale = user.gender === 'Female';

    return (
      <View style={[styles.profileImage, isRTL && styles.profileImageRtl]}>
        {(!user.image || user.image === '') && isClub && (
          <Image
            source={require('../../assets/clublogo.png')}
            style={styles.profileImageAvatar}
            resizeMode="contain"
          />
        )}
        {(!user.image || user.image === '') && isMale && (
          <Image
            source={require('../../assets/avatar.png')}
            style={styles.profileImageAvatar}
            resizeMode="contain"
          />
        )}
        {(!user.image || user.image === '') && isFemale && (
          <Image
            source={require('../../assets/avatarF.png')}
            style={styles.profileImageAvatar}
            resizeMode="contain"
          />
        )}
        {!!user.image && (
          <Image
            source={{ uri: user.image }}
            style={styles.profileImageAvatar}
            resizeMode="contain"
          />
        )}
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.flex}
    >
      <View style={styles.container}>
        <View style={styles.pageHeader}>
          <TouchableOpacity
            onPress={() => {
              router.back();
            }}
            style={[styles.backBtn, isRTL && styles.backBtnRtl]}
          >
            <Ionicons
              name={isRTL ? 'chevron-forward' : 'chevron-back'}
              size={20}
              color="#ffffff"
            />
            <Text style={styles.backBtnText}>{t('badge.back')}</Text>
          </TouchableOpacity>

          <View style={[styles.headerTextBlock, isRTL && styles.headerTextBlockRtl]}>
            <Text style={[styles.pageTitle, isRTL && styles.rtlText]}>{t('badge.title')}</Text>
            {!loading && user && (
              <Text style={[styles.pageDesc, isRTL && styles.rtlText]}>{user.name}</Text>
            )}
            {loading && (
              <View style={[styles.loadingRow, isRTL && styles.loadingRowRtl]}>
                <ActivityIndicator
                  size="small"
                  color="#fff"
                  style={{ transform: [{ scale: 1.25 }] }}
                />
              </View>
            )}
          </View>

          <Text style={[styles.ghostText, isRTL && styles.ghostTextRtl]}>{t('badge.ghost')}</Text>
          {renderProfileImage()}
        </View>

        {!!userId && !loading && user && (
          <ScrollView>
            <View style={styles.contentContainer}>
              {error && (
                <View style={[styles.error,isRTL&&{flexDirection:'row-reverse'}]}>
                  <View style={[styles.errorIcon,isRTL&&{marginRight:0,marginLeft:15}]} />
                  <Text style={[styles.errorText, isRTL && styles.rtlText]}>{error}</Text>
                </View>
              )}

              {user.accountBadge ? (
                <View style={styles.successBlock}>
                  <Ionicons name="checkmark-circle" size={80} color="#009933" />
                  <Text style={[styles.successTitle, isRTL && styles.rtlText]}>
                    {t('badge.congratulations')}
                  </Text>
                  <Text style={[styles.paragraph, styles.centerText, isRTL && styles.rtlText]}>
                    {t('badge.verifiedMessage')}
                  </Text>

                  <View style={styles.benefitsCard}>
                    <Text style={[styles.subtitle, styles.sectionGap, isRTL && styles.rtlText]}>
                      {t('badge.benefitsTitle')}
                    </Text>
                    <Text style={[styles.paragraph, isRTL && styles.rtlText]}>- {t('badge.benefitVisibility')}</Text>
                    <Text style={[styles.paragraph, isRTL && styles.rtlText]}>- {t('badge.benefitTrust')}</Text>
                    <Text style={[styles.paragraph, isRTL && styles.rtlText]}>- {t('badge.benefitSupport')}</Text>
                  </View>
                </View>
              ) : (
                <View>
                  <Text style={[styles.title, isRTL && styles.rtlText]}>{t('badge.whyTitle')}</Text>
                  <Text style={[styles.paragraph, isRTL && styles.rtlText]}>{t('badge.whyMessage')}</Text>

                  <View style={styles.section}>
                    <Text style={[styles.title, isRTL && styles.rtlText]}>
                      {t('badge.verificationBenefits')}
                    </Text>
                    <Text style={[styles.paragraph, isRTL && styles.rtlText]}>- {t('badge.benefitCredibility')}</Text>
                    <Text style={[styles.paragraph, isRTL && styles.rtlText]}>- {t('badge.benefitEngagement')}</Text>
                    <Text style={[styles.paragraph, isRTL && styles.rtlText]}>- {t('badge.benefitDistinguish')}</Text>
                    <Text style={[styles.paragraph, isRTL && styles.rtlText]}>- {t('badge.benefitExclusive')}</Text>
                  </View>

                  <View style={styles.section}>
                    <Text style={[styles.title, isRTL && styles.rtlText]}>{t('badge.statsTitle')}</Text>

                    <View style={styles.statsList}>
                      <View style={[styles.statRow, isRTL && styles.statRowRtl]}>
                        <Text style={styles.statNumber}>+85%</Text>
                        <Text style={[styles.paragraph, styles.statText, isRTL && styles.rtlText]}>
                          {t('badge.statSponsors')}
                        </Text>
                      </View>
                      <View style={[styles.statRow, isRTL && styles.statRowRtl]}>
                        <Text style={styles.statNumber}>+72%</Text>
                        <Text style={[styles.paragraph, styles.statText, isRTL && styles.rtlText]}>
                          {t('badge.statScouts')}
                        </Text>
                      </View>
                      <View style={[styles.statRow, isRTL && styles.statRowRtl]}>
                        <Text style={styles.statNumber}>3x</Text>
                        <Text style={[styles.paragraph, styles.statText, isRTL && styles.rtlText]}>
                          {t('badge.statSearch')}
                        </Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.section}>
                    <Text style={[styles.title, isRTL && styles.rtlText]}>{t('badge.faq')}</Text>

                    <View style={styles.faqItem}>
                      <TouchableOpacity
                        onPress={() => toggleFAQ('q1')}
                        style={[styles.faqQuestion, isRTL && styles.faqQuestionRtl]}
                      >
                        <Text style={[styles.faqQuestionText, isRTL && styles.rtlText]}>
                          {t('badge.faqWhy')}
                        </Text>
                        <Ionicons
                          name={expanded === 'q1' ? 'chevron-up' : 'chevron-down'}
                          size={20}
                          color="black"
                        />
                      </TouchableOpacity>
                      {expanded === 'q1' && (
                        <Text style={[styles.paragraph, isRTL && styles.rtlText]}>
                          {t('badge.faqWhyAnswer')}
                        </Text>
                      )}
                    </View>

                    <View style={styles.faqItem}>
                      <TouchableOpacity
                        onPress={() => toggleFAQ('q2')}
                        style={[styles.faqQuestion, isRTL && styles.faqQuestionRtl]}
                      >
                        <Text style={[styles.faqQuestionText, isRTL && styles.rtlText]}>
                          {t('badge.faqDuration')}
                        </Text>
                        <Ionicons
                          name={expanded === 'q2' ? 'chevron-up' : 'chevron-down'}
                          size={20}
                          color="black"
                        />
                      </TouchableOpacity>
                      {expanded === 'q2' && (
                        <Text style={[styles.paragraph, isRTL && styles.rtlText]}>
                          {t('badge.faqDurationAnswer')}
                        </Text>
                      )}
                    </View>

                    <View style={styles.faqItem}>
                      <TouchableOpacity
                        onPress={() => toggleFAQ('q3')}
                        style={[styles.faqQuestion, isRTL && styles.faqQuestionRtl]}
                      >
                        <Text style={[styles.faqQuestionText, isRTL && styles.rtlText]}>
                          {t('badge.faqLose')}
                        </Text>
                        <Ionicons
                          name={expanded === 'q3' ? 'chevron-up' : 'chevron-down'}
                          size={20}
                          color="black"
                        />
                      </TouchableOpacity>
                      {expanded === 'q3' && (
                        <Text style={[styles.paragraph, isRTL && styles.rtlText]}>
                          {t('badge.faqLoseAnswer')}
                        </Text>
                      )}
                    </View>
                  </View>

                  <View style={styles.ctaSection}>
                    <Text style={[styles.title, styles.sectionGap, isRTL && styles.rtlText]}>
                      {t('badge.ctaTitle')}
                    </Text>
                    <Text style={[styles.paragraph, isRTL && styles.rtlText]}>
                      {t('badge.oneTimePurchase')}
                    </Text>
                    <TouchableOpacity
                      style={styles.ctaButton}
                      onPress={() => console.log()}
                      disabled
                    >
                      <Text style={styles.ctaButtonText}>{t('badge.comingSoon')}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          </ScrollView>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  container: {
    backgroundColor: '#fff',
    height: '100%',
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 130,
  },
  error: {
    marginBottom: 15,
    backgroundColor: '#fce3e3',
    paddingHorizontal: 5,
    paddingVertical: 5,
    borderRadius: 5,
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  errorIcon: {
    width: 3,
    height: 15,
    backgroundColor: 'red',
    borderRadius: 5,
    marginRight: 10,
  },
  errorText: {
    color: 'red',
    fontFamily: 'Acumin',
  },
  pageHeader: {
    backgroundColor: '#FF4000',
    height: 270,
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
  },
  pageDesc: {
    color: '#ffffff',
    fontSize: 16,
    fontFamily: 'Acumin',
  },
  title: {
    fontFamily: 'Qatar',
    fontSize: 22,
    color: 'black',
  },
  subtitle: {
    fontFamily: 'Acumin',
    fontSize: 16,
    width: '100%',
    textTransform: 'capitalize',
    color: 'black',
  },
  paragraph: {
    fontFamily: 'Acumin',
    fontSize: 16,
    color: 'black',
  },
  successTitle: {
    color: '#009933',
    marginTop: 10,
    fontFamily: 'Qatar',
    fontSize: 30,
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
  profileImage: {
    position: 'absolute',
    bottom: 0,
    right: -5,
    height: '70%',
    maxWidth: 200,
    overflow: 'hidden',
  },
  profileImageRtl: {
    right: undefined,
    left: -5,
  },
  profileImageAvatar: {
    height: '100%',
    width: undefined,
    aspectRatio: 1,
    resizeMode: 'contain',
  },
  backBtn: {
    position: 'absolute',
    top: 60,
    left: 10,
    width: 200,
    zIndex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backBtnRtl: {
    left: undefined,
    right: 10,
    flexDirection: 'row-reverse',
  },
  backBtnText: {
    color: '#FFF',
    fontSize: 18,
    fontFamily: 'Qatar',
  },
  statNumber: {
    fontSize: 30,
    fontFamily: 'Qatar',
    color: '#FF4000',
    textAlign: 'center',
    flex: 1,
  },
  section: {
    marginTop: 30,
  },
  statsList: {
    marginTop: 10,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 20,
  },
  statRowRtl: {
    flexDirection: 'row-reverse',
  },
  statText: {
    flex: 3,
  },
  faqItem: {
    borderBottomWidth: 1,
    paddingVertical: 8,
    borderBottomColor: '#ddd',
  },
  faqQuestion: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  faqQuestionRtl: {
    flexDirection: 'row-reverse',
  },
  faqQuestionText: {
    flex: 1,
    fontFamily: 'Qatar',
    fontSize: 18,
    color: 'black',
  },
  successBlock: {
    alignItems: 'center',
    marginTop: 30,
  },
  benefitsCard: {
    marginTop: 20,
    backgroundColor: '#f4f4f4',
    padding: 15,
    borderRadius: 10,
    alignSelf: 'stretch',
  },
  ctaSection: {
    marginTop: 40,
    alignItems: 'center',
  },
  ctaButton: {
    width: width - 40,
    marginTop: 20,
    backgroundColor: '#FF4000',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  ctaButtonText: {
    color: '#fff',
    fontFamily: 'Qatar',
    fontSize: 20,
    textAlign: 'center',
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 5,
  },
  loadingRowRtl: {
    flexDirection: 'row-reverse',
  },
  sectionGap: {
    marginBottom: 10,
  },
  centerText: {
    textAlign: 'center',
  },
  rtlText: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
});
