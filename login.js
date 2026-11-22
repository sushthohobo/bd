Layout.init('login');
const msg = (t, ok) => { const m = $('#msg'); m.className = 'msg ' + (ok ? 'ok' : 'err'); m.textContent = t; };
const showPane = id => { const tab = id === 'forgot' ? 'login' : id; $$('.atabs button').forEach(b => b.classList.toggle('on', b.dataset.p === tab)); $$('.pane').forEach(p => p.classList.toggle('on', p.getAttribute('id') === id)); $('#msg').className = 'msg'; scrollTo({ top:0, behavior:'smooth' }); };
$$('.atabs button').forEach(b => b.onclick = () => showPane(b.dataset.p));
$$('[data-go]').forEach(b => b.onclick = () => showPane(b.dataset.go));
$$('.eye').forEach(b => b.onclick = () => { const i = b.previousElementSibling; i.type = i.type === 'password' ? 'text' : 'password'; });

Geo.bind($('#rdv'), $('#rdi'), $('#rup'), { d:'বিভাগ বাছুন', s:'জেলা বাছুন', u:'উপজেলা বাছুন' });
$('#bgSel').innerHTML = '<option value="">বাছুন</option>' + BLOOD_GROUPS.map(g => `<option>${g}</option>`).join('');
$$('[name=role]').forEach(r => r.onchange = () => { const d = $('[name=role]:checked').value === 'রক্তদাতা'; $('#bgWrap').style.display = d ? 'block' : 'none'; $('#bgSel').required = d; });
$('#rpass').oninput = e => { const v = e.target.value; let s = 0; if(v.length >= 6) s++; if(v.length >= 9) s++; if(/\d/.test(v) && /[a-zA-Z]/.test(v)) s++; if(/[^a-zA-Z0-9]/.test(v)) s++; const m = $('#meter'); m.style.width = s * 25 + '%'; m.style.background = ['#f42a41','#f59e0b','#84cc16','#006a4e'][Math.max(s - 1, 0)]; };

async function run(btn, fn){ btn.disabled = true; const t = btn.textContent; btn.textContent = 'অপেক্ষা করুন...'; try{ await fn(); } finally { btn.disabled = false; btn.textContent = t; } }
const en2 = s => String(s).replace(/[০-৯]/g, d => '০১২৩৪৫৬৭৮৯'.indexOf(d));
const sub = e => e.submitter || e.target.querySelector('button:not([type=button])');
$('#lastDon').max = new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10);
$$('[name=donated]').forEach(r => r.onchange = () => { const y = $('[name=donated]:checked').value === 'হ্যাঁ'; $('#lastWrap').style.display = y ? 'block' : 'none'; $('#lastDon').required = y; if(!y) $('#lastDon').value = ''; });

const client = sb();
const nextParam = new URLSearchParams(location.search).get('next');
const safeNext = /^[a-z0-9-]+\.html(\?[^#]*)?(#.*)?$/i.test(nextParam || '') ? nextParam : 'index.html';

function showLogged(u){ $('#forms').style.display = 'none'; $('#loggedIn').style.display = 'block'; $('#lname').textContent = u.name; $('#lphone').textContent = (u.role || '') + ' • ' + (u.phone || ''); }
if(!client){
  msg('লগইন সেবা এখনো চালু হয়নি (Supabase সেটআপ বাকি) — শীঘ্রই আসছে।', false);
} else {
  Auth.sync().then(u => { if(u) showLogged(u); });
  if(/type=signup/.test(location.hash + location.search)){ msg('ইমেইল ভেরিফাই হয়েছে! এখন লগইন করুন।', true); history.replaceState(null, '', location.pathname); }
}
const noClient = () => { msg('লগইন সেবা এখনো চালু হয়নি — শীঘ্রই আসছে।', false); };

$('#login').onsubmit = e => { e.preventDefault(); if(!client) return noClient(); run(sub(e), async () => {
  const f = Object.fromEntries(new FormData(e.target));
  const { data, error } = await client.auth.signInWithPassword({ email:f.ident.trim(), password:f.pass });
  if(error) return msg(sbErr(error), false);
  const u = await Auth.sync();
  if(!u) Auth.set({ id:data.user.id, name:'ব্যবহারকারী' });
  location.href = safeNext;
}); };

$('#signup').onsubmit = e => { e.preventDefault(); if(!client) return noClient(); run(sub(e), async () => {
  const f = Object.fromEntries(new FormData(e.target));
  if(f.pass !== f.pass2) return msg('দুটি পাসওয়ার্ড মিলছে না', false);
  const phone = en2(f.phone).trim();
  if(!/^01[3-9][0-9]{8}$/.test(phone)) return msg('মোবাইল নম্বর সঠিক নয় (যেমন: 01XXXXXXXXX)', false);
  const donor = f.role === 'রক্তদাতা';
  const { data, error } = await client.auth.signUp({ email:f.email.trim(), password:f.pass, options:{
    emailRedirectTo: new URL('login.html', location.href).href + '?type=signup',
    data:{ full_name:f.name.trim(), phone, role:f.role, blood_group: donor ? f.blood : '', division:f.division, district:f.district, upazila:f.upazila, last_donation: f.donated === 'হ্যাঁ' ? f.lastDonation : '' } } });
  if(error) return msg(sbErr(error), false);
  e.target.reset(); $('#bgWrap').style.display = 'none'; $('#lastWrap').style.display = 'none';
  if(data.session){ await Auth.sync(); location.href = safeNext; return; }   // ইমেইল ভেরিফিকেশন বন্ধ থাকলে সরাসরি ঢুকে যাবে
  showPane('login'); msg('একাউন্ট তৈরি হয়েছে! ইমেইলে একটি ভেরিফিকেশন লিংক গেছে — সেটিতে ক্লিক করে তারপর লগইন করুন (স্প্যাম ফোল্ডারও দেখুন)।', true);
}); };

$('#f1').onsubmit = e => { e.preventDefault(); if(!client) return noClient(); run(sub(e), async () => {
  const email = new FormData(e.target).get('email').trim();
  const { error } = await client.auth.resetPasswordForEmail(email, { redirectTo: new URL('reset.html', location.href).href });
  if(error) return msg(sbErr(error), false);
  msg('যদি এই ইমেইলে একাউন্ট থাকে, পাসওয়ার্ড বদলানোর লিংক পাঠানো হয়েছে।', true);
}); };
