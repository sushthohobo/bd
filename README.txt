সুস্থ হবো — ফ্রন্টএন্ড + ধাপ ২ (Supabase)

আপলোড: সব ফাইল GitHub রিপোতে দিন (পুরোনো ফাইল রিপ্লেস), .nojekyll সহ।
সেটআপ: SETUP-supabase.md পড়ে ধাপে ধাপে করুন; supabase/schema.sql সেখানকার SQL Editor-এ চালাতে হবে।
config.js-এ SUPABASE_URL ও SUPABASE_ANON_KEY না বসালে লগইন/রক্তদান "শীঘ্রই চালু হবে" দেখাবে (সাইট ভাঙবে না)।

নতুন ফাইল: login.js, reset.html, blood.html, blood.js, supabase/schema.sql, SETUP-supabase.md
বদলেছে: app.js, config.js, login.html, index.html, home.js, style.css
অপরিবর্তিত: data.js, make-pages.js
আনুষঙ্গিক পেজ বানাতে: node make-pages.js (যেগুলো আছে সেগুলো বাদ যায়)।
