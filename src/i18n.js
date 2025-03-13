import i18next from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';

const i18nPromise = i18next
  .use(Backend)
  .use(LanguageDetector)
  .init({
    fallbackLng: 'en-GB',
    debug: true,
    backend: {
      loadPath: '/locales/{{lng}}.json',
    },
  });

export { i18next, i18nPromise };
