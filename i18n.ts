/**
 * @file i18n.ts
 * @description Internationalization configuration for the application.
 */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

/**
 * @const {object} resources
 * @description The translation resources for the application.
 */
const resources = {
  en: {
    translation: {
      "app_name": "VoiceText Game",
      "voice_task": "Voice Task",
      "my_history": "My History",
      "leaderboard": "Leaderboard",
      "admin_panel": "Admin Panel",
      "logout": "Logout",
      "profile": "Profile",
      "edit_profile": "Edit Profile",
      "dark_mode": "Dark Mode",
      "light_mode": "Light Mode",
      "welcome_back": "Welcome back, {{name}}!",
      "no_tasks": "No tasks available.",
      "start": "Start",
      "task_id": "Task #{{id}}",
      "listen_carefully": "Listen Carefully",
      "replay": "Replay",
      "shortcuts": "Keyboard Shortcuts",
      "next": "Next",
      "prev": "Prev",
      "delete": "Delete",
      "play_pause": "Play / Pause",
      "text_editor": "Text Editor",
      "clear": "Clear",
      "submit": "Submit",
      "confirm_correct": "Confirm Correct",
      "correct_submit": "Submit Edit",
      "saved": "Saved!",
      "report_issue": "Report Issue",
      "skip": "Skip",
      "loading": "Loading...",
      "limit_reached": "Limit Reached",
      "limit_msg": "You have completed your batch of tasks.",
      "request_more": "Request More Tasks",
      "check_again": "Check Again",
      "upload_task": "Upload Task",
      "login_title": "Sign In",
      "register_title": "Create Account",
      "client_id": "Client ID",
      "password": "Password",
      "first_name": "First Name",
      "last_name": "Last Name",
      "signin": "Sign In",
      "register": "Register",
      "dont_have_account": "Don't have an account?",
      "have_account": "Already have an account?",
      "server_config": "Server Configuration",
      "connection_error": "Connection Error",
      "admin_login": "Admin Login",
      "user_login": "User Login",
      "distorted": "Distorted",
      "music": "Music",
      "multispeaker": "Multi-Speaker",
      "review_mode": "Review Mode",
      "review_instruction": "Please verify the previous transcription.",
      "admin_analytics": "Analytics",
      "users_mgmt": "User Management",
      "block": "Block",
      "unblock": "Unblock"
    }
  },
  fa: {
    translation: {
      "app_name": "بازی متن و صدا",
      "voice_task": "تسک صوتی",
      "my_history": "تاریخچه من",
      "leaderboard": "جدول امتیازات",
      "admin_panel": "پنل ادمین",
      "logout": "خروج",
      "profile": "پروفایل",
      "edit_profile": "ویرایش پروفایل",
      "dark_mode": "حالت شب",
      "light_mode": "حالت روز",
      "welcome_back": "خوش آمدید، {{name}}!",
      "no_tasks": "تسکی موجود نیست.",
      "start": "شروع",
      "task_id": "تسک شماره {{id}}",
      "listen_carefully": "با دقت گوش دهید",
      "replay": "پخش مجدد",
      "shortcuts": "کلیدهای میانبر",
      "next": "بعدی",
      "prev": "قبلی",
      "delete": "حذف",
      "play_pause": "پخش / توقف",
      "text_editor": "ویرایشگر متن",
      "clear": "پاک کردن",
      "submit": "ثبت نهایی",
      "confirm_correct": "تایید صحت",
      "correct_submit": "ثبت ویرایش",
      "saved": "ذخیره شد!",
      "report_issue": "گزارش خرابی",
      "skip": "رد کردن",
      "loading": "در حال بارگذاری...",
      "limit_reached": "محدودیت تعداد",
      "limit_msg": "شما تعداد مجاز تسک‌های این مرحله را انجام دادید.",
      "request_more": "درخواست تسک بیشتر",
      "check_again": "بررسی مجدد",
      "upload_task": "آپلود تسک",
      "login_title": "ورود به سیستم",
      "register_title": "ساخت حساب کاربری",
      "client_id": "شناسه کاربری",
      "password": "رمز عبور",
      "first_name": "نام",
      "last_name": "نام خانوادگی",
      "signin": "ورود",
      "register": "ثبت نام",
      "dont_have_account": "حساب کاربری ندارید؟",
      "have_account": "قبلا ثبت نام کرده‌اید؟",
      "server_config": "تنظیمات سرور",
      "connection_error": "خطای اتصال",
      "admin_login": "ورود ادمین",
      "user_login": "ورود کاربر",
      "distorted": "نویز / خرابی",
      "music": "موزیک پس‌زمینه",
      "multispeaker": "چند گوینده",
      "review_mode": "حالت بازبینی",
      "review_instruction": "لطفا متن قبلی را بررسی و تایید یا اصلاح کنید.",
      "admin_analytics": "آمار و ارقام",
      "users_mgmt": "مدیریت کاربران",
      "block": "مسدود کردن",
      "unblock": "رفع مسدودی"
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    lng: 'fa', // Force default to Persian
    fallbackLng: 'fa',
    interpolation: {
      escapeValue: false, 
    },
  });

// Handle RTL direction change
i18n.on('languageChanged', (lng) => {
  document.documentElement.lang = lng;
  document.dir = lng === 'fa' ? 'rtl' : 'ltr';
  if (lng === 'fa') {
      document.body.classList.add('font-arabic');
  } else {
      document.body.classList.remove('font-arabic');
  }
});

// Initial Setup
document.documentElement.lang = 'fa';
document.dir = 'rtl';
document.body.classList.add('font-arabic');

export default i18n;