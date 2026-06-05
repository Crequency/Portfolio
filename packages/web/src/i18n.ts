import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from './locales/en.json';
import zh from './locales/zh.json';
import ja from './locales/ja.json';

const SUPPORTED = ['en', 'zh', 'ja'];

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      zh: { translation: zh },
      ja: { translation: ja },
    },
    supportedLngs: SUPPORTED,
    fallbackLng: 'en',
    nonExplicitSupportedLngs: true,
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'portfolio-lang',
      convertDetectedLanguage: (lng: string) => {
        const l = lng.toLowerCase().split('-')[0];
        if (l === 'zh') return 'zh';
        if (l === 'ja') return 'ja';
        return 'en';
      },
    },
  });

i18n.on('languageChanged', (lng) => {
  localStorage.setItem('portfolio-lang', lng);
});

export default i18n;
