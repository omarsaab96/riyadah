import * as SecureStore from 'expo-secure-store';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { Language, TranslationKey, translations } from '../constants/translations';

const LANGUAGE_STORAGE_KEY = 'appLanguage';

type LanguageContextType = {
  isReady: boolean;
  isRTL: boolean;
  language: Language;
  setLanguage: (nextLanguage: Language) => Promise<void>;
  t: (key: TranslationKey) => string;
  direction: 'ltr' | 'rtl';
  textAlign: 'left' | 'right';
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const normalizeLanguage = (value: string | null): Language => {
  return value === 'ar' ? 'ar' : 'en';
};

const getTranslation = (language: Language, key: TranslationKey) => {
  const [namespace, token] = key.split('.') as [keyof typeof translations.en, string];
  const currentGroup = translations[language][namespace] as Record<string, string>;
  const fallbackGroup = translations.en[namespace] as Record<string, string>;

  return currentGroup[token] ?? fallbackGroup[token] ?? key;
};

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<Language>('en');
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const initializeLanguage = async () => {
      try {
        const storedLanguage = await SecureStore.getItemAsync(LANGUAGE_STORAGE_KEY);
        const nextLanguage = normalizeLanguage(storedLanguage);

        setLanguageState(nextLanguage);
      } finally {
        setIsReady(true);
      }
    };

    initializeLanguage();
  }, []);

  const setLanguage = async (nextLanguage: Language) => {
    const normalizedLanguage = normalizeLanguage(nextLanguage);

    await SecureStore.setItemAsync(LANGUAGE_STORAGE_KEY, normalizedLanguage);
    setLanguageState(normalizedLanguage);
  };

  const value: LanguageContextType = {
    isReady,
    isRTL: language === 'ar',
    language,
    setLanguage,
    direction: language === 'ar' ? 'rtl' : 'ltr',
    textAlign: language === 'ar' ? 'right' : 'left',
    t: (key) => getTranslation(language, key),
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }

  return context;
};
