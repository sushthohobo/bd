/* ===== Helpers ===== */
const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const bn = n => String(n).replace(/\d/g, d => '০১২৩৪৫৬৭৮৯'[d]);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function imgUrl(u){
  if(!u) return '';
  const m = u.match(/drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?(?:.*&)?id=)([\w-]+)/);
  return m ? `https://drive.google.com/thumbnail?id=${m[1]}&sz=w1600` : u;
}
function toast(msg){
  let t = $('#toast'); if(!t){ t = document.createElement('div'); t.id = 'toast'; document.body.appendChild(t); }
  t.textContent = msg; t.classList.add('show'); clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove('show'), 3000);
}

/* ===== আইকন (SVG স্প্রাইট) — ইমোজির বদলে সব ডিভাইসে একই রকম পরিষ্কার আইকন ===== */
const ICONS = {
  home:'<path d="M3 11l9-8 9 8M5 10v10h14V10M10 20v-6h4v6"/>',
  stetho:'<path d="M6 3v6a4 4 0 0 0 8 0V3M4 3h4M12 3h4M10 13v2a5 5 0 0 0 10 0v-2"/><circle cx="20" cy="11" r="2"/>',
  hospital:'<path d="M4 21V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v16M2 21h20M12 7v6M9 10h6M10 21v-4h4v4"/>',
  drop:'<path d="M12 3s6 6.500 6 11a6 6 0 0 1-12 0c0-4.500 6-11 6-11z"/>',
  ai:'<path d="M12 3l1.800 5.200L19 10l-5.200 1.800L12 17l-1.800-5.200L5 10l5.200-1.800z"/><path d="M19 16l.7 2 2 .7-2 .7L19 21l-.7-1.600-2-.7 2-.7z"/>',
  kit:'<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M12 11v5M9.500 13.500h5"/>',
  bulb:'<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.500 10.900c.7.500 1 1.200 1 2.100h5c0-.9.300-1.600 1-2.100A6 6 0 0 0 12 3z"/>',
  phone:'<path d="M5 4h4l2 5-2.500 1.500a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/>',
  cap:'<path d="M2 9l10-5 10 5-10 5z"/><path d="M6 11.500V16c0 1.500 3 3 6 3s6-1.500 6-3v-4.500M22 9v6"/>',
  heart:'<path d="M12 20s-8-4.900-8-11a4.500 4.500 0 0 1 8-2.800A4.500 4.500 0 0 1 20 9c0 6.100-8 11-8 11z"/>',
  hand:'<path d="M3 14h4l4 2h4a2 2 0 0 0 0-4h-3M7 14v6M11 16l6 .5 4-3a1.500 1.500 0 0 0-2-2L16 13"/><path d="M14 9.500s-2-1.200-2-2.800a1.600 1.600 0 0 1 2-1.400 1.600 1.600 0 0 1 2 1.400c0 1.600-2 2.800-2 2.800z"/>',
  users:'<circle cx="9" cy="8" r="3.500"/><path d="M2.500 20a6.500 6.500 0 0 1 13 0M16 4.500a3.500 3.500 0 0 1 0 7M18 14.500a6.500 6.500 0 0 1 3.500 5.500"/>',
  ambulance:'<path d="M2 17V7a1 1 0 0 1 1-1h10v11M13 9h4l4 4v4h-2M2 17h3M9 17h6"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/><path d="M7.500 9v4M5.500 11h4"/>',
  flask:'<path d="M9 3h6M10 3v6l-5.500 9.500A2 2 0 0 0 6.200 21h11.600a2 2 0 0 0 1.700-2.500L14 9V3M7.500 15h9"/>',
  pill:'<rect x="2.500" y="8.500" width="19" height="7" rx="3.500" transform="rotate(-45 12 12)"/><path d="M8.500 8.500l7 7"/>',
  cal:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4M16 3v4M3 10h18"/>',
  syringe:'<path d="M15 4l5 5M17 6l-9 9-3 1 1-3 9-9M4 20l3-3M13 8l3 3"/>',
  brain:'<path d="M9 4a3 3 0 0 0-3 3 3 3 0 0 0-2 5 3 3 0 0 0 2 5 3 3 0 0 0 6 1V5a3 3 0 0 0-3-1zM15 4a3 3 0 0 1 3 3 3 3 0 0 1 2 5 3 3 0 0 1-2 5 3 3 0 0 1-6 1"/>',
  siren:'<path d="M7 18v-6a5 5 0 0 1 10 0v6M5 21h14v-3H5zM12 3v2M4 7l1.500 1M20 7l-1.500 1"/>',
  search:'<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.500-3.500"/>',
  pin:'<path d="M12 21s7-6 7-11a7 7 0 0 0-14 0c0 5 7 11 7 11z"/><circle cx="12" cy="10" r="2.500"/>',
  shield:'<path d="M12 3l8 3v6c0 5-3.500 8-8 9-4.500-1-8-4-8-9V6z"/><path d="M8.500 12l2.500 2.500 4.500-5"/>',
  check:'<path d="M5 12.500l4.500 4.500L19 7"/>',
  menu:'<path d="M4 7h16M4 12h16M4 17h16"/>',
  close:'<path d="M6 6l12 12M18 6L6 18"/>',
  chev:'<path d="M6 9l6 6 6-6"/>',
  chevl:'<path d="M15 6l-6 6 6 6"/>',
  chevr:'<path d="M9 6l6 6-6 6"/>',
  arrow:'<path d="M5 12h14M13 6l6 6-6 6"/>',
  up:'<path d="M12 19V5M6 11l6-6 6 6"/>',
  mail:'<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>',
  lock:'<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
  user:'<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  eye:'<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  fb:'<path d="M14 8h3V4h-3a4 4 0 0 0-4 4v3H7v4h3v6h4v-6h3l1-4h-4V8.500a.5.5 0 0 1 .5-.5z"/>',
  yt:'<rect x="2.500" y="5.500" width="19" height="13" rx="4"/><path d="M10 9.500v5l4.500-2.500z"/>',
  wa:'<path d="M4 20l1.200-4A8 8 0 1 1 8 18.800z"/><path d="M9 9c0 3 3 6 6 6l1.500-1.500-2-1-1 .8a4 4 0 0 1-2-2l.8-1-1-2z"/>',
  alert:'<path d="M12 3l10 18H2z"/><path d="M12 10v5M12 18h.01"/>',
  clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  play:'<path d="M8 5l11 7-11 7z"/>',
  bed:'<path d="M3 18V6M3 14h18v4M21 14v-2a3 3 0 0 0-3-3h-7v5"/><circle cx="7" cy="11" r="1.500"/>',
  plus:'<path d="M12 5v14M5 12h14"/>',
  ban:'<circle cx="12" cy="12" r="9"/><path d="M5.700 5.700l12.600 12.600"/>',
  info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
  refresh:'<path d="M20 11a8 8 0 0 0-14-4L4 9M4 4v5h5M4 13a8 8 0 0 0 14 4l2-2M20 20v-5h-5"/>',
  scale:'<path d="M12 3v18M5 7h14M5 7l-3 7a3 3 0 0 0 6 0zM19 7l-3 7a3 3 0 0 0 6 0z"/>',
  logout:'<path d="M9 4H5a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h4M16 8l4 4-4 4M20 12H9"/>',
  star:'<path d="M12 3l2.800 5.700 6.200.9-4.500 4.400 1.100 6.200L12 17.200 6.400 20.200l1.100-6.200L3 9.600l6.200-.9z"/>',
  gift:'<rect x="3" y="8" width="18" height="4" rx="1"/><path d="M12 8v13M5 12v8h14v-8M8 8a2.500 2.500 0 0 1 0-5c2 0 4 2 4 5 0-3 2-5 4-5a2.500 2.500 0 0 1 0 5"/>',
  smile:'<circle cx="12" cy="12" r="9"/><path d="M8.500 14a4.500 4.500 0 0 0 7 0M9 9.500h.01M15 9.500h.01"/>'
};
const ic = (n, c = '') => `<svg class="ic ${c}" aria-hidden="true"><use href="#i-${n}"/></svg>`;
function injectSprite(){
  if($('#sprite')) return;
  document.body.insertAdjacentHTML('afterbegin', `<svg id="sprite" width="0" height="0" style="position:absolute" aria-hidden="true">${Object.entries(ICONS).map(([k, v]) => `<symbol id="i-${k}" viewBox="0 0 24 24">${v}</symbol>`).join('')}</svg>`);
}
/* সেবার কী → আইকন (data.js অপরিবর্তিত রাখা হয়েছে) */
const SVC_ICON = { doctors:'stetho', hospitals:'hospital', blood:'drop', 'help-request':'hand', 'help-donate':'heart', ai:'ai', firstaid:'kit', tips:'bulb', emergency:'siren', career:'cap', tests:'flask', ambulance:'ambulance', medicine:'pill', appointment:'cal', vaccine:'syringe', mental:'brain' };
const svcIc = k => ic(SVC_ICON[k] || 'plus');

/* ===== বিভাগ → জেলা → উপজেলা ===== */
const Geo = {
  bind(dv, ds, up, ph = {}){
    const opt = (arr, t) => `<option value="">${t}</option>` + arr.map(x => `<option>${x}</option>`).join('');
    const fillU = () => {
      const d = DIVISIONS.find(x => x.name === dv.value), s = d && d.districts.find(x => x.name === ds.value);
      up.innerHTML = opt(s ? s.upazilas : [], ph.u || 'সব উপজেলা');
    };
    const fillD = () => {
      const d = DIVISIONS.find(x => x.name === dv.value);
      ds.innerHTML = opt(d ? d.districts.map(x => x.name) : [], ph.s || 'সব জেলা'); fillU();
    };
    dv.innerHTML = opt(DIVISIONS.map(d => d.name), ph.d || 'সব বিভাগ');
    dv.onchange = fillD; ds.onchange = fillU; fillD();
  }
};

/* ===== লগইন সেশন ও Google Sheet API (অপরিবর্তিত) ===== */
const Auth = {
  user(){ try{ return JSON.parse(localStorage.getItem('sh_user')); }catch(e){ return null; } },
  set(u){ localStorage.setItem('sh_user', JSON.stringify(u)); },
  async out(){ try{ const c = sb(); if(c) await c.auth.signOut(); }catch(e){} localStorage.removeItem('sh_user'); location.href = 'index.html'; },
  /* সেশন সত্যিই বৈধ কি না Supabase-এ দেখে নেয়; না থাকলে ক্যাশ মুছে দেয় */
  async sync(){
    const c = sb(); if(!c) return Auth.user();
    const { data:{ session } } = await c.auth.getSession();
    if(!session){ localStorage.removeItem('sh_user'); return null; }
    let u = Auth.user();
    if(!u || u.id !== session.user.id){
      const { data:p } = await c.from('profiles').select('full_name,phone,role,blood_group,district').eq('id', session.user.id).maybeSingle();
      if(p){ u = { id:session.user.id, name:p.full_name, phone:p.phone, role:p.role, email:session.user.email }; Auth.set(u); }
    }
    return u;
  },
  async hash(t){ const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(t)); return [...new Uint8Array(b)].map(x => x.toString(16).padStart(2,'0')).join(''); }
};
async function api(action, data){
  if(!CONFIG.API_URL) return { ok:false, pending:true };
  try{
    const r = await fetch(CONFIG.API_URL, { method:'POST', body: JSON.stringify({ action, ...data }) }); // text/plain → CORS preflight লাগে না
    return await r.json();
  }catch(e){ return { ok:false, msg:'ইন্টারনেট সংযোগ বা সার্ভারে সমস্যা। আবার চেষ্টা করুন।' }; }
}

/* ===== Supabase ক্লায়েন্ট (config.js-এ URL ও anon key বসালে চালু হয়) ===== */
let _sb;
function sb(){
  if(_sb) return _sb;
  if(!CONFIG.SUPABASE_URL || !CONFIG.SUPABASE_ANON_KEY || !window.supabase) return null;
  _sb = window.supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY, { auth:{ persistSession:true, autoRefreshToken:true, detectSessionInUrl:true } });
  return _sb;
}
/* ত্রুটির বার্তা বাংলায় */
function sbErr(e){
  const m = String((e && (e.message || e.code)) || e || '');
  const map = [
    [/Invalid login credentials/i, 'ইমেইল বা পাসওয়ার্ড ভুল।'],
    [/Email not confirmed/i, 'আগে ইমেইলে পাঠানো লিংকে ক্লিক করে ভেরিফাই করুন (স্প্যাম ফোল্ডারও দেখুন)।'],
    [/already registered|already been registered/i, 'এই ইমেইলে আগেই একাউন্ট আছে। লগইন করুন।'],
    [/rate limit|too many/i, 'অনেকবার চেষ্টা হয়েছে। কিছুক্ষণ পর আবার চেষ্টা করুন।'],
    [/Password should be/i, 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের দিন।'],
    [/LOGIN_REQUIRED/, 'এটি করতে আগে লগইন করুন।'],
    [/RATE_LIMIT/, 'আজকের সীমা শেষ। কাল আবার চেষ্টা করুন।'],
    [/DATE_PAST/, 'রক্তের তারিখ অতীতের হতে পারবে না।'],
    [/NOT_FOUND/, 'ডোনারকে পাওয়া যায়নি।'],
    [/Failed to fetch|NetworkError|network/i, 'ইন্টারনেট সংযোগে সমস্যা। আবার চেষ্টা করুন।'],
    [/profiles_phone_check|contact_phone_check/, 'মোবাইল নম্বর সঠিক নয় (যেমন: 01XXXXXXXXX)।']
  ];
  for(const [re, t] of map) if(re.test(m)) return t;
  return 'কিছু একটা সমস্যা হয়েছে। আবার চেষ্টা করুন।';
}
const SB_CDN = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/dist/umd/supabase.min.js';

/* ===== স্ক্রল রিভিল, কাউন্টার ===== */
const Reveal = {
  io: null,
  scan(){
    if(!('IntersectionObserver' in window)){ $$('.rv').forEach(e => e.classList.add('in')); return; }
    if(!this.io) this.io = new IntersectionObserver(es => es.forEach(e => {
      if(!e.isIntersecting) return; e.target.classList.add('in'); this.io.unobserve(e.target);
      $$('[data-count]', e.target).forEach(Reveal.count); if(e.target.dataset.count) Reveal.count(e.target);
    }), { threshold: .12 });
    $$('.rv:not(.in)').forEach(el => this.io.observe(el));
  },
  count(el){
    const to = +el.dataset.count, d = 1500, t0 = performance.now();
    (function f(t){ const p = Math.min((t - t0) / d, 1); el.textContent = bn(Math.floor(to * (1 - Math.pow(1 - p, 3)))) + (el.dataset.plus ? '+' : ''); if(p < 1) requestAnimationFrame(f); })(t0);
  }
};

/* ===== ছবি লোড (কনফিগে লিংক থাকলে সেই ছবি দেখাবে, না থাকলে ইলাস্ট্রেশন) ===== */
function loadImages(){
  $$('[data-img]').forEach(el => {
    const u = imgUrl(CONFIG.IMAGES[el.dataset.img]); if(!u) return;
    const im = new Image(); im.onload = () => { const bg = $('.imgbg', el); if(bg) bg.style.backgroundImage = `url("${u}")`; el.classList.add('has-img'); }; im.src = u;
  });
}

/* ===== হেডার, ফুটার, মেনু ===== */
const Layout = {
  init(active = ''){
    injectSprite();
    const NAV = [
      {h:'index.html',           i:'home',    t:'হোম',                 a:'home'},
      {h:'index.html#specialty', i:'stetho',  t:'কোন ডাক্তার দেখাবেন', a:'spec'},
      {h:'doctors.html',         i:'stetho',  t:'ডাক্তার খুঁজুন',      a:'doctors'},
      {h:'hospitals.html',       i:'hospital',t:'হাসপাতাল',           a:'hospitals'},
      {h:'blood.html',           i:'drop',    t:'রক্তদান',             a:'blood', red:1},
      {h:'help-request.html',    i:'hand',    t:'সহযোগিতা',           a:'help-request', red:1}
    ];
    const top = ['index.html','index.html#specialty','doctors.html','hospitals.html','blood.html','help-request.html'];
    const used = ['doctors','hospitals','blood','help-request'];
    const rest = SERVICES.filter(s => !used.includes(s.k));
    const u = Auth.user();
    const loginBtn = u
      ? `<a href="login.html" class="btn btn-o btn-sm hl">${ic('user')}<span>${esc(u.name.split(' ')[0])}</span></a>`
      : `<a href="login.html" class="btn btn-g btn-sm hl">${ic('user')}<span>লগইন</span></a>`;

    $('#site-header').innerHTML = `
<div class="strip"><div class="container">
  <span class="hide-s">জরুরি অবস্থায় অপেক্ষা করবেন না</span><span class="sep hide-s">•</span>
  <a href="tel:999">${ic('phone')} জাতীয় জরুরি <b>৯৯৯</b></a>
  <a href="tel:16263">${ic('stetho')} স্বাস্থ্য বাতায়ন <b>১৬২৬৩</b></a>
</div></div>
<header class="header" id="hdr"><div class="container">
  <a href="index.html" class="brand" aria-label="সুস্থ হবো — হোম"><img src="logo.svg" alt="" width="42" height="42"><span>সুস্থ হবো</span></a>
  <nav class="nav" aria-label="প্রধান মেনু">
    ${NAV.filter(n => n.a !== 'spec').map(n => `<a href="${n.h}" class="${n.red?'red ':''}${active===n.a?'on':''}">${n.t}</a>`).join('')}
    <div class="more" id="more"><button type="button" aria-haspopup="true">আরও ${ic('chev')}</button>
      <div class="more-menu">${rest.map(s => `<a href="${s.k}.html">${svcIc(s.k)} ${s.t}</a>`).join('')}</div></div>
  </nav>
  <div class="h-act"><a href="blood.html" class="btn btn-r btn-sm hl-r">${ic('drop')} রক্ত চাই</a>${loginBtn}<button class="burger" id="burger" aria-label="মেনু খুলুন">${ic('menu')}</button></div>
</div></header>`;

    document.body.insertAdjacentHTML('beforeend', `
<div class="drawer" id="drawer" aria-hidden="true"><div class="bk"></div><div class="pn">
  <div class="top"><b><img src="logo.svg" alt="">সুস্থ হবো</b><button class="x" id="dx" aria-label="বন্ধ করুন">${ic('close')}</button></div>
  <a href="index.html">${ic('home')} হোম</a>
  ${[...used.map(k => SERVICES.find(s => s.k === k)), ...rest].map(s => `<a href="${s.k}.html" class="${s.red?'red':''}">${svcIc(s.k)} ${s.t}</a>`).join('')}
  <a href="login.html" class="lg">${ic('user')} ${u ? 'আমার প্রোফাইল' : 'লগইন / নিবন্ধন'}</a>
</div></div>
<nav class="bnav" aria-label="নিচের মেনু">
  <a href="index.html" class="${active==='home'?'on':''}">${ic('home')}হোম</a>
  <a href="doctors.html" class="${active==='doctors'?'on':''}">${ic('stetho')}ডাক্তার</a>
  <a href="blood.html" class="mid">${ic('drop')}রক্ত</a>
  <a href="help-request.html" class="${active==='help-request'?'on':''}">${ic('hand')}সহযোগিতা</a>
  <a href="login.html" class="${active==='login'?'on':''}">${ic('user')}${u ? 'প্রোফাইল' : 'লগইন'}</a>
</nav>
<button class="totop" id="totop" aria-label="উপরে যান">${ic('up')}</button>`);

    const so = CONFIG.SOCIAL, link = (k, i, l) => `<a href="${so[k]}" target="_blank" rel="noopener" aria-label="${l}">${ic(i)}</a>`;
    const fl = ks => ks.map(k => { const s = SERVICES.find(x => x.k === k); return `<a href="${k}.html">${s.t}</a>`; }).join('');
    $('#site-footer').innerHTML = `
    <footer class="footer"><div class="flagline"></div><div class="container" style="padding-top:44px">
      <div class="cols">
        <div><a href="index.html" class="brand"><img src="logo.svg" alt=""><span>সুস্থ হবো</span></a>
          <p>সঠিক ডাক্তার, সঠিক হাসপাতাল, জরুরি রক্ত ও চিকিৎসা সহযোগিতা — বাংলাদেশের প্রতিটি মানুষের জন্য, সম্পূর্ণ বাংলায়।</p>
          <div class="soc">${link('facebook','fb','Facebook')}${link('youtube','yt','YouTube')}${link('whatsapp','wa','WhatsApp')}<a href="mailto:${so.email}" aria-label="ইমেইল">${ic('mail')}</a></div></div>
        <div><h4>সেবা</h4>${fl(['doctors','hospitals','tests','ai','appointment'])}</div>
        <div><h4>রক্ত ও সহযোগিতা</h4>${fl(['blood','help-request','help-donate','ambulance'])}</div>
        <div><h4>জানুন</h4>${fl(['firstaid','tips','career','emergency'])}</div>
      </div></div>
      <div class="disc2"><div class="container">${ic('alert')}<span>এই সাইটের তথ্য শুধু সাধারণ নির্দেশনার জন্য, এটি চিকিৎসকের পরামর্শের বিকল্প নয়। জরুরি অবস্থায় ৯৯৯-এ কল করুন বা নিকটস্থ হাসপাতালে যান।</span></div></div>
      <div class="container copy"><span>© ${bn(new Date().getFullYear())} সুস্থ হবো। সর্বস্বত্ব সংরক্ষিত।</span><span class="dev">Developed by <b>Akash</b> ${ic('heart')}</span></div>
    </footer>`;

    const hdr = $('#hdr'), tt = $('#totop'), dr = $('#drawer');
    const onScroll = () => { hdr.classList.toggle('sc', scrollY > 10); tt.classList.toggle('show', scrollY > 600); };
    addEventListener('scroll', onScroll, { passive:true }); onScroll();
    tt.onclick = () => scrollTo({ top:0 });
    const openD = o => { dr.classList.toggle('open', o); dr.setAttribute('aria-hidden', !o); document.body.style.overflow = o ? 'hidden' : ''; };
    $('#burger').onclick = () => openD(true);
    $('#dx').onclick = $('#drawer .bk').onclick = () => openD(false);
    $$('#drawer .pn a').forEach(a => a.addEventListener('click', () => openD(false)));
    addEventListener('keydown', e => { if(e.key === 'Escape'){ openD(false); $('#more').classList.remove('open'); } });
    $('#more button').onclick = e => { e.stopPropagation(); $('#more').classList.toggle('open'); };
    document.addEventListener('click', () => $('#more').classList.remove('open'));
    Reveal.scan(); loadImages();
  }
};

/* ===== "আসিতেছে" পেজ ===== */
const Page = {
  coming(key){
    const s = SERVICES.find(x => x.k === key); document.title = s.t + ' – সুস্থ হবো';
    Layout.init(key);
    $('#page').innerHTML = `
    <section class="cs-hero"><div class="container"><div class="cs-ic">${svcIc(key)}</div><span class="soon-badge">${ic('clock')} আসিতেছে</span><h1>${s.t}</h1><p>${s.d}</p></div></section>
    <section class="container"><div class="cs-grid">
      <div class="card rv"><h3>${ic('star')} যা যা থাকছে</h3><ul>${s.feat.map(f => `<li>${ic('check')}<span>${f}</span></li>`).join('')}</ul>
        <p class="small" style="margin-top:14px">কাজ চলছে — খুব শীঘ্রই চালু হবে।</p><div class="prog"><i></i></div>
        <div style="margin-top:20px;display:flex;gap:10px;flex-wrap:wrap"><a href="index.html" class="btn btn-g">${ic('home')} হোমে ফিরুন</a><a href="login.html" class="btn btn-o">${ic('user')} আগে একাউন্ট খুলুন</a></div></div>
      <div class="card rv" style="border-top:5px solid var(--r)"><h3 style="color:var(--r2)">${ic('siren')} এখনই সাহায্য দরকার?</h3>
        <p style="margin-bottom:14px">জরুরি অবস্থায় অপেক্ষা করবেন না।</p>
        <a href="tel:999" class="btn btn-r btn-block" style="margin-bottom:10px">${ic('phone')} জাতীয় জরুরি সেবা ৯৯৯</a>
        <a href="tel:16263" class="btn btn-o btn-block">${ic('stetho')} স্বাস্থ্য বাতায়ন ১৬২৬৩</a></div>
    </div></section>
    <section class="section"><div class="container"><div class="sec-head"><h2 style="font-size:28px">অন্যান্য সেবা দেখুন</h2></div>
      <div class="grid g4">${SERVICES.filter(x => x.k !== key).slice(0, 8).map(x => `<a class="svc ${x.red?'red':''}" href="${x.k}.html"><div class="ic-w">${svcIc(x.k)}</div><h3>${x.t}</h3></a>`).join('')}</div></div></section>`;
    Reveal.scan();
  }
};
