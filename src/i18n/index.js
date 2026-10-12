import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { useAppStore } from '@/store/appStore';
import en from './en.json';
import fr from './fr.json';

export const SUPPORTED_LANGUAGES = [
  { code: 'en', label: 'English', short: 'EN', locale: 'en-GB' },
  { code: 'fr', label: 'Français', short: 'FR', locale: 'fr-FR' },
];

export const getLocale = (code) =>
  SUPPORTED_LANGUAGES.find((lang) => lang.code === code)?.locale ?? 'en-GB';

const initialLanguage = useAppStore.getState().language;

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    fr: { translation: fr },
  },
  lng: initialLanguage,
  fallbackLng: 'en',
  supportedLngs: SUPPORTED_LANGUAGES.map((lang) => lang.code),
  interpolation: { escapeValue: false },
  returnNull: false,
});

document.documentElement.lang = initialLanguage;

// Le store Zustand est la source de vérité : i18next suit ses changements.
useAppStore.subscribe((state, previous) => {
  if (state.language !== previous.language) {
    i18n.changeLanguage(state.language);
    document.documentElement.lang = state.language;
  }
});

export default i18n;
