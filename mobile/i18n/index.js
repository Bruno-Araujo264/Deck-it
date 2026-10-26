import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { getLocales } from 'expo-localization';

import en from './idiomas/en.json';
import pt from './idiomas/pt.json';

export const supportedLanguages = ['pt', 'en'];

const deviceLanguage = getLocales()?.[0]?.languageCode || 'en';

const initialLanguage = supportedLanguages.includes(deviceLanguage)
   ? deviceLanguage
   : 'en';

i18n.use(initReactI18next).init({
   compatibilityJSON: 'v3',
   lng: initialLanguage,
   fallbackLng: 'en',
   supportedLngs: supportedLanguages,
   resources: {
      pt: { translation: pt },
      en: { translation: en }
   },
   interpolation: {
      escapeValue: false,
   },

});

export default i18n;