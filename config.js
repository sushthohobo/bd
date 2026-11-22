const CONFIG = {
  // (পুরোনো) Google Apps Script URL — ধাপ ২ থেকে আর ব্যবহার হয় না; Supabase ব্যবহার হচ্ছে।
  API_URL: 'https://script.google.com/macros/s/AKfycbzO-RQ4bIqyIH07WB8vMzM0UkmAexrpJl3NCrdNcD-6hkDVrWXCQotBOt7LuCXb3OrV/exec',

  // ===== Supabase (ধাপ ২) — SETUP-supabase.md দেখে এই দুটি বসান =====
  // Project Settings → API থেকে: Project URL ও anon public key (anon key গোপন নয়, নিরাপদ)
  SUPABASE_URL: 'https://tegcozfkmsjrduzwuqey.supabase.co',
  SUPABASE_ANON_KEY: 'sb_publishable_4Dainpmu1GKPQgp8-dzHgQ_wv157tXz',

  // সোশ্যাল লিংক (পরে আসল লিংক বসাবেন)
  SOCIAL: { facebook: '#', youtube: '#', whatsapp: '#', email: 'info@example.com' },

  // ছবি: images/ ফোল্ডারের পাথ (যেমন 'images/hero1.jpg') অথবা Google Drive শেয়ার লিংক।
  // খালি থাকলে সুন্দর ইলাস্ট্রেশন দেখাবে।
  IMAGES: {
    hero1: '',   // হাসপাতালে ভর্তি রোগী + জরুরি রক্ত + পোস্ট করছেন একজন
    hero2: '',   // হঠাৎ অসুস্থ + সুস্থ হবো-তে প্রাথমিক চিকিৎসা দেখছেন
    hero3: '',   // ডাক্তার/হাসপাতাল খুঁজে সিদ্ধান্ত নিচ্ছেন (৩য় ছবি)
    support: ''  // অসহায় রোগীর পরিবার + সহযোগিতার হাত
  },

  // ইউজার গাইড ভিডিও — YouTube-এ আপলোড করে লিংক বসান (যেমন 'https://youtu.be/XXXXXXXXXXX')
  VIDEOS: [
    { t:'সাইট ব্যবহারের সহজ গাইড',         d:'একাউন্ট খোলা থেকে শুরু',   u:'videolink-1' },
    { t:'রক্তদাতা নিবন্ধন ও রক্তের অনুরোধ',  d:'রক্ত দিন বা রক্ত চান',      u:'videolink-2' },
    { t:'ডাক্তার ও হাসপাতাল খোঁজা',         d:'এলাকা ও সমস্যা অনুযায়ী',   u:'videolink-3' },
    { t:'সহযোগিতা অনুরোধ করার নিয়ম',        d:'যাচাই ও প্রকাশের ধাপ',      u:'videolink-4' }
  ]
};