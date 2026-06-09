import * as SecureStore from 'expo-secure-store';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { Language, TranslationKey, translations } from '../constants/translations';

const LANGUAGE_STORAGE_KEY = 'appLanguage';

type LanguageContextType = {
  isReady: boolean;
  isRTL: boolean;
  language: Language;
  setLanguage: (nextLanguage: Language) => Promise<void>;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
  direction: 'ltr' | 'rtl';
  textAlign: 'left' | 'right';
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const normalizeLanguage = (value: string | null): Language => {
  return value === 'ar' ? 'ar' : 'en';
};

const getTranslation = (language: Language, key: TranslationKey, params: Record<string, string | number> = {}) => {
  const [namespace, token] = key.split('.') as [keyof typeof translations.en, string];
  const dictionary = translations as Record<string, Record<string, Record<string, string>>>;
  const currentGroup = dictionary[language]?.[namespace];
  const fallbackGroup = dictionary.en?.[namespace];

  const template = currentGroup?.[token] ?? fallbackGroup?.[token] ?? key;

  return Object.entries(params).reduce(
    (result, [paramKey, value]) => result.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(value)),
    template
  );
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
    t: (key, params) => getTranslation(language, key, params),
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
