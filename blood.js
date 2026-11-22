Layout.init('blood');
const client = sb();
let ME = null;                       // লগইন করা ইউজার (ক্যাশ)
const gmsg = (t, ok) => { const m = $('#gmsg'); m.className = 'msg ' + (ok ? 'ok' : 'err'); m.textContent = t; };
const fmtDate = d => { try{ return new Date(d + 'T00:00:00').toLocaleDateString('bn-BD', { day:'numeric', month:'long' }); }catch(e){ return d; } };
const optGroups = ph => `<option value="">${ph}</option>` + BLOOD_GROUPS.map(g => `<option>${g}</option>`).join('');
const loginLink = `login.html?next=blood.html`;
const loginBox = t => `<div class="empty">${ic('lock')}<h4>${t}</h4><p style="margin-bottom:14px">এই সেবা ব্যবহার করতে একাউন্ট লাগবে — বিনামূল্যে, ১ মিনিটে।</p><a href="${loginLink}" class="btn btn-g">${ic('user')} লগইন / নিবন্ধন</a></div>`;
const emptyBox = (t, d) => `<div class="empty">${ic('info')}<h4>${t}</h4><p>${d}</p></div>`;
const loading = '<div class="empty"><p>লোড হচ্ছে…</p></div>';

/* ---------- ট্যাব ---------- */
function openTab(t){
  $$('.btabs button').forEach(b => b.classList.toggle('on', b.dataset.tab === t));
  $$('.bp').forEach(p => p.classList.toggle('on', p.id === 'p-' + t));
  if(t === 'donors') loadDonors(); if(t === 'post') drawPost(); if(t === 'me') drawMe();
  history.replaceState(null, '', '#' + t);
}
$$('.btabs button').forEach(b => b.onclick = () => openTab(b.dataset.tab));

/* ---------- ফিল্টার ---------- */
$('#rg').innerHTML = optGroups('সব গ্রুপ'); $('#dg').innerHTML = optGroups('সব গ্রুপ');
Geo.bind($('#rdv'), $('#rdi'), $('#rup')); Geo.bind($('#ddv'), $('#ddi'), $('#dup'));
$('#rgo').onclick = () => loadRequests();
$('#dgo').onclick = () => loadDonors();

/* ---------- ১. রক্তের অনুরোধ ---------- */
async function loadRequests(){
  const box = $('#rList');
  if(!client){ box.innerHTML = emptyBox('এই সেবা শীঘ্রই চালু হবে', 'সেটআপ শেষ হলে এখানে জরুরি রক্তের অনুরোধ দেখা যাবে।'); return; }
  box.innerHTML = loading;
  const { data, error } = await client.rpc('list_blood_requests', { p_group:$('#rg').value || null, p_division:$('#rdv').value || null, p_district:$('#rdi').value || null });
  if(error){ box.innerHTML = ''; return gmsg(sbErr(error), false); }
  if(!data.length){ box.innerHTML = emptyBox('এখন কোনো খোলা অনুরোধ নেই', 'ফিল্টার বদলে দেখুন, অথবা আপনার প্রয়োজনে "রক্ত চাই" ট্যাবে অনুরোধ দিন।'); return; }
  box.innerHTML = data.map(r => `
  <article class="rq rv in">
    <div class="bgchip">${esc(r.blood_group)}<small>${bn(r.units)} ব্যাগ</small></div>
    <div><h4>${esc(r.patient_name)} <span class="tagno">${fmtDate(r.needed_at)}-এর মধ্যে</span></h4>
      <div class="meta"><span>${ic('hospital')}${esc(r.hospital)}</span><span>${ic('pin')}${esc([r.upazila, r.district, r.division].filter(Boolean).join(', '))}</span></div>
      ${r.problem ? `<p class="pr">${esc(r.problem)}</p>` : ''}</div>
    <div class="act">${r.contact_phone
      ? `<a class="btn btn-r btn-sm" href="tel:${esc(r.contact_phone)}">${ic('phone')} ${esc(bn(r.contact_phone))}</a>`
      : `<a class="btn btn-o btn-sm" href="${loginLink}">${ic('lock')} নম্বর দেখতে লগইন</a>`}
      ${r.is_mine ? `<button class="btn btn-ghost btn-sm" data-done="${esc(r.id)}" style="margin-top:6px">${ic('check')} রক্ত পেয়েছি</button>` : ''}</div>
  </article>`).join('');
}
$('#rList').addEventListener('click', async e => {
  const b = e.target.closest('[data-done]'); if(!b) return;
  if(!confirm('রক্ত পাওয়া গেছে? অনুরোধটি তালিকা থেকে সরে যাবে।')) return;
  const { error } = await client.from('blood_requests').update({ status:'fulfilled' }).eq('id', b.dataset.done);
  if(error) return gmsg(sbErr(error), false); toast('ধন্যবাদ! অনুরোধ বন্ধ হয়েছে।'); loadRequests(); if($('#p-me').classList.contains('on')) drawMe();
});

/* ---------- ২. রক্তদাতা খোঁজা ---------- */
async function loadDonors(){
  const box = $('#dList');
  if(!client){ box.innerHTML = emptyBox('এই সেবা শীঘ্রই চালু হবে', 'সেটআপ শেষ হলে এখানে রক্তদাতা খোঁজা যাবে।'); return; }
  if(!ME){ box.innerHTML = loginBox('রক্তদাতা দেখতে লগইন করুন'); return; }
  box.innerHTML = loading;
  const { data, error } = await client.rpc('search_donors', { p_group:$('#dg').value || null, p_division:$('#ddv').value || null, p_district:$('#ddi').value || null, p_upazila:$('#dup').value || null });
  if(error){ box.innerHTML = ''; return gmsg(sbErr(error), false); }
  if(!data.length){ box.innerHTML = emptyBox('কোনো রক্তদাতা পাওয়া যায়নি', 'অন্য গ্রুপ বা বড় এলাকা (শুধু জেলা/বিভাগ) দিয়ে খুঁজুন।'); return; }
  box.innerHTML = data.map(d => `
  <article class="dn">
    <div class="bgchip">${esc(d.blood_group)}</div>
    <div><h4>${esc(d.display_name)} ${d.available ? '<span class="tagok">রক্ত দিতে প্রস্তুত</span>' : '<span class="tagno">সম্প্রতি রক্ত দিয়েছেন</span>'}</h4>
      <div class="meta"><span>${ic('pin')}${esc([d.upazila, d.district, d.division].filter(Boolean).join(', '))}</span>${d.last_donation ? `<span>${ic('clock')}শেষ রক্তদান: ${fmtDate(d.last_donation)}</span>` : ''}</div></div>
    <div class="act"><button class="btn btn-g btn-sm" data-id="${esc(d.donor_id)}">${ic('phone')} নম্বর দেখুন</button></div>
  </article>`).join('');
}
$('#dList').addEventListener('click', async e => {
  const b = e.target.closest('[data-id]'); if(!b) return;
  b.disabled = true;
  const { data, error } = await client.rpc('get_donor_contact', { p_donor:b.dataset.id });
  if(error || !data || !data[0]){ b.disabled = false; return toast(sbErr(error || 'NOT_FOUND')); }
  b.outerHTML = `<a class="btn btn-r btn-sm" href="tel:${esc(data[0].phone)}">${ic('phone')} ${esc(bn(data[0].phone))}</a>`;
});

/* ---------- ৩. রক্ত চাই (অনুরোধ জমা) ---------- */
function drawPost(){
  const box = $('#postBox');
  if(!client){ box.innerHTML = emptyBox('এই সেবা শীঘ্রই চালু হবে', 'সেটআপ শেষ হলে এখানে রক্তের অনুরোধ দেওয়া যাবে।'); return; }
  if(!ME){ box.innerHTML = loginBox('রক্তের অনুরোধ দিতে লগইন করুন'); return; }
  if($('#rqForm')) return;
  box.innerHTML = `<form class="fcard" id="rqForm">
    <h3 style="margin-bottom:14px">জরুরি রক্তের অনুরোধ</h3>
    <div class="row2"><div class="field"><label>রোগীর নাম *</label><input name="patient_name" required minlength="2" maxlength="80"></div>
      <div class="field"><label>রক্তের গ্রুপ *</label><select name="blood_group" required>${optGroups('বাছুন')}</select></div></div>
    <div class="row2"><div class="field"><label>কত ব্যাগ *</label><input name="units" type="number" min="1" max="20" value="1" required></div>
      <div class="field"><label>কবে লাগবে *</label><input name="needed_at" type="date" required></div></div>
    <div class="field"><label>হাসপাতালের নাম ও ঠিকানা *</label><input name="hospital" required minlength="3" maxlength="120" placeholder="যেমন: ঢাকা মেডিকেল কলেজ হাসপাতাল"></div>
    <div class="row2"><div class="field"><label>বিভাগ *</label><select name="division" id="qdv" required></select></div><div class="field"><label>জেলা *</label><select name="district" id="qdi" required></select></div></div>
    <div class="field"><label>উপজেলা</label><select name="upazila" id="qup"></select></div>
    <div class="field"><label>সমস্যা (সংক্ষেপে)</label><textarea name="problem" rows="3" maxlength="300" placeholder="যেমন: অপারেশন, ডেঙ্গু, দুর্ঘটনা"></textarea></div>
    <div class="field"><label>যোগাযোগের মোবাইল *</label><input name="contact_phone" required inputmode="numeric" placeholder="01XXXXXXXXX"></div>
    <p class="small" style="margin-bottom:14px">এই নম্বরটি লগইন করা সবাই দেখতে পাবেন। দিনে সর্বোচ্চ ৫টি অনুরোধ দেওয়া যায়।</p>
    <button class="btn btn-r btn-block">অনুরোধ জমা দিন</button></form>`;
  Geo.bind($('#qdv'), $('#qdi'), $('#qup'), { d:'বিভাগ বাছুন', s:'জেলা বাছুন', u:'উপজেলা (ঐচ্ছিক)' });
  $('#rqForm [name=needed_at]').min = new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  client.from('profiles').select('phone').maybeSingle().then(({ data }) => { if(data && !$('#rqForm [name=contact_phone]').value) $('#rqForm [name=contact_phone]').value = data.phone; });
  $('#rqForm').onsubmit = async e => {
    e.preventDefault(); const f = Object.fromEntries(new FormData(e.target)), btn = e.target.querySelector('button'); btn.disabled = true;
    const en = s => String(s).replace(/[০-৯]/g, d => '০১২৩৪৫৬৭৮৯'.indexOf(d));
    const row = { patient_name:f.patient_name.trim(), blood_group:f.blood_group, units:+f.units, needed_at:f.needed_at, hospital:f.hospital.trim(), division:f.division, district:f.district, upazila:f.upazila || null, problem:(f.problem || '').trim() || null, contact_phone:en(f.contact_phone).trim() };
    if(!/^01[3-9][0-9]{8}$/.test(row.contact_phone)){ btn.disabled = false; return gmsg('মোবাইল নম্বর সঠিক নয় (যেমন: 01XXXXXXXXX)', false); }
    const { error } = await client.from('blood_requests').insert(row);
    btn.disabled = false;
    if(error) return gmsg(sbErr(error), false);
    e.target.reset(); gmsg('অনুরোধ জমা হয়েছে। এলাকার রক্তদাতারা এখন দেখতে পাবেন।', true); openTab('req'); loadRequests();
  };
}

/* ---------- ৪. আমার তথ্য (রক্তদাতা প্রোফাইল + নিজের অনুরোধ) ---------- */
async function drawMe(){
  const box = $('#meBox');
  if(!client){ box.innerHTML = emptyBox('এই সেবা শীঘ্রই চালু হবে', ''); return; }
  if(!ME){ box.innerHTML = loginBox('আপনার তথ্য দেখতে লগইন করুন'); return; }
  box.innerHTML = loading;
  const [{ data:p }, { data:mine }] = await Promise.all([
    client.from('profiles').select('*').maybeSingle(),
    client.from('blood_requests').select('id,patient_name,blood_group,needed_at,status').order('created_at', { ascending:false }).limit(10)]);
  if(!p){ box.innerHTML = emptyBox('প্রোফাইল পাওয়া যায়নি', 'একবার লগআউট করে আবার লগইন করুন।'); return; }
  box.innerHTML = `<form class="fcard" id="meForm">
    <h3 style="margin-bottom:6px">আমার রক্তদাতা তথ্য</h3><p class="small" style="margin-bottom:14px">আপনার মোবাইল নম্বর কেউ সরাসরি দেখবে না; শুধু "নম্বর দেখুন" চাপলে একজন লগইন করা ব্যবহারকারী দেখতে পাবেন।</p>
    <div class="row2"><div class="field"><label>নাম</label><input name="full_name" required minlength="2" maxlength="80" value="${esc(p.full_name)}"></div><div class="field"><label>মোবাইল</label><input name="phone" required inputmode="numeric" value="${esc(p.phone)}"></div></div>
    <label class="chk"><input type="checkbox" name="is_donor" ${p.is_donor ? 'checked' : ''}><span>আমি রক্তদাতা তালিকায় থাকতে চাই</span></label>
    <label class="chk"><input type="checkbox" name="donor_visible" ${p.donor_visible ? 'checked' : ''}><span>খোঁজার ফলাফলে আমার নাম ও এলাকা দেখানো হোক</span></label>
    <div class="row2"><div class="field"><label>রক্তের গ্রুপ</label><select name="blood_group" id="mbg">${optGroups('বাছুন')}</select></div><div class="field"><label>শেষ রক্তদান (থাকলে)</label><input type="date" name="last_donation" value="${esc(p.last_donation || '')}"></div></div>
    <div class="row2"><div class="field"><label>বিভাগ</label><select name="division" id="mdv"></select></div><div class="field"><label>জেলা</label><select name="district" id="mdi"></select></div></div>
    <div class="field"><label>উপজেলা</label><select name="upazila" id="mup"></select></div>
    <button class="btn btn-g btn-block">সংরক্ষণ করুন</button></form>
    <h3 style="margin:26px 0 10px">আমার সাম্প্রতিক অনুরোধ</h3>
    ${mine && mine.length ? mine.map(r => `<div class="myr"><span><b>${esc(r.patient_name)}</b> · ${esc(r.blood_group)} · ${fmtDate(r.needed_at)}</span>${r.status === 'open' ? `<button class="btn btn-ghost btn-sm" data-done="${esc(r.id)}">${ic('check')} রক্ত পেয়েছি</button>` : `<span class="tagok">${r.status === 'fulfilled' ? 'সম্পন্ন' : 'বাতিল'}</span>`}</div>`).join('') : '<p class="small">কোনো অনুরোধ নেই।</p>'}
    <p style="margin-top:20px"><button class="btn btn-o btn-sm" id="lo">${ic('logout')} লগআউট</button></p>`;
  $('#mbg').value = p.blood_group || '';
  Geo.bind($('#mdv'), $('#mdi'), $('#mup'), { d:'বিভাগ বাছুন', s:'জেলা বাছুন', u:'উপজেলা বাছুন' });
  $('#mdv').value = p.division || ''; $('#mdv').onchange(); $('#mdi').value = p.district || ''; $('#mdi').onchange(); $('#mup').value = p.upazila || '';
  $('#lo').onclick = () => Auth.out();
  $$('[data-done]', $('#meBox')).forEach(b => b.onclick = async () => {
    const { error } = await client.from('blood_requests').update({ status:'fulfilled' }).eq('id', b.dataset.done);
    if(error) return gmsg(sbErr(error), false); toast('অনুরোধ বন্ধ হয়েছে'); drawMe();
  });
  $('#meForm').onsubmit = async e => {
    e.preventDefault(); const f = new FormData(e.target), btn = e.target.querySelector('button.btn-block'); btn.disabled = true;
    const isDonor = f.get('is_donor') === 'on';
    if(isDonor && !f.get('blood_group')){ btn.disabled = false; return gmsg('রক্তদাতা হতে রক্তের গ্রুপ বাছুন।', false); }
    const upd = { full_name:f.get('full_name').trim(), phone:String(f.get('phone')).replace(/[০-৯]/g, d => '০১২৩৪৫৬৭৮৯'.indexOf(d)).trim(), is_donor:isDonor, donor_visible:f.get('donor_visible') === 'on',
      blood_group:f.get('blood_group') || null, last_donation:f.get('last_donation') || null, division:f.get('division') || null, district:f.get('district') || null, upazila:f.get('upazila') || null };
    if(!/^01[3-9][0-9]{8}$/.test(upd.phone)){ btn.disabled = false; return gmsg('মোবাইল নম্বর সঠিক নয় (যেমন: 01XXXXXXXXX)', false); }
    const { error } = await client.from('profiles').update(upd).eq('id', ME.id);
    btn.disabled = false;
    if(error) return gmsg(sbErr(error), false);
    ME = { ...ME, name:upd.full_name, phone:upd.phone }; Auth.set(ME); gmsg('তথ্য সংরক্ষিত হয়েছে। ধন্যবাদ!', true);
  };
}

/* ---------- শুরু ---------- */
(async () => {
  if(!client){ gmsg('এই সেবা এখনো চালু হয়নি — Supabase সেটআপ বাকি। সেটআপ শেষ হলে এখানে সবকিছু কাজ করবে।', false); loadRequests(); }
  else { ME = await Auth.sync(); loadRequests(); }
  const h = (location.hash || '').slice(1); if(['donors','post','me'].includes(h)) openTab(h);
})();
