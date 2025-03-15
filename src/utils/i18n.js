import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: {
          welcome: "Welcome",
          login: "Login",
          signup: "Sign Up",
          signIn: "Sign In",
          email: "Email",
          password: "Password",
          forgotPassword: "Forgot password?",
          logIn: "Log in",
          dontHaveAccount: "Don't have an account?",
          oneAppForAll: "One app for all",
          singleAccount: "Single account for all your payments.",
          officialPartner: "Official Partner of",
          privacyPolicy: "Privacy Policy",
          cookiesPolicy: "Cookies Policy",
          termsConditions: "Terms & Conditions",
          support: "Support",
        },
      },
      ar: {
        translation: {
          welcome: "أهلاً بك",
          login: "تسجيل الدخول",
          signup: "إنشاء حساب",
          signIn: "تسجيل الدخول",
          email: "البريد الإلكتروني",
          password: "كلمة المرور",
          forgotPassword: "نسيت كلمة المرور؟",
          logIn: "دخول",
          dontHaveAccount: "ليس لديك حساب؟",
          oneAppForAll: "تطبيق واحد للجميع",
          singleAccount: "حساب واحد لجميع مدفوعاتك.",
          officialPartner: "الشريك الرسمي لـ",
          privacyPolicy: "سياسة الخصوصية",
          cookiesPolicy: "سياسة ملفات تعريف الارتباط",
          termsConditions: "الشروط والأحكام",
          support: "الدعم",
        },
      },
    },
    lng: "en", // Default language
    fallbackLng: "en", // Fallback if language not found
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
