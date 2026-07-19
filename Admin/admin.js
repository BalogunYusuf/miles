requireAuth();

/* ============ UTIL HELPERS ============ */
function esc(s){
  if(s===null||s===undefined) return '';
  return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
const goldTones = ["#C89A3D","#8a6420","#b98a3a","#a67c2e"];
function initials(f,l){ return ((f&&f[0])||'?').toUpperCase() + ((l&&l[0])||''); }
function avatarStyle(seed){
  const n = Math.abs(typeof seed==='number' ? seed : String(seed||'').split('').reduce((a,c)=>a+c.charCodeAt(0),0));
  return `background:linear-gradient(135deg, ${goldTones[n%goldTones.length]}, #5c3a12);`;
}

/* Renders an avatar circle: the member's uploaded photo if one exists, otherwise the
   initials-on-gold-gradient fallback. Used everywhere a member avatar appears (table rows,
   modal header, kanban cards, search results) so the photo behavior stays consistent. */
function avatarHTML(m, sizeStyle){
  const extra = sizeStyle || '';
  if(m && m.profileImageUrl){
    return `<div class="avatar" style="padding:0; overflow:hidden; ${extra}"><img src="${esc(m.profileImageUrl)}" alt="${esc(fullName(m))}" style="width:100%; height:100%; object-fit:cover; display:block;"></div>`;
  }
  return `<div class="avatar" style="${avatarStyle(m && m.memberId)} ${extra}">${initials(m && m.firstName, m && m.lastName)}</div>`;
}

/* Two-letter ISO 3166-1 alpha-2 code -> display name, mirroring the <select> options on the
   public profile form. The backend stores only the code (see Profile model), so the admin UI
   translates it to a readable name at display time. */
const COUNTRY_NAMES = {
  AF:"Afghanistan", AL:"Albania", DZ:"Algeria", AD:"Andorra", AO:"Angola", AG:"Antigua and Barbuda",
  AR:"Argentina", AM:"Armenia", AU:"Australia", AT:"Austria", AZ:"Azerbaijan", BS:"Bahamas",
  BH:"Bahrain", BD:"Bangladesh", BB:"Barbados", BY:"Belarus", BE:"Belgium", BZ:"Belize",
  BJ:"Benin", BT:"Bhutan", BO:"Bolivia", BA:"Bosnia and Herzegovina", BW:"Botswana", BR:"Brazil",
  BN:"Brunei", BG:"Bulgaria", BF:"Burkina Faso", BI:"Burundi", CV:"Cabo Verde", KH:"Cambodia",
  CM:"Cameroon", CA:"Canada", CF:"Central African Republic", TD:"Chad", CL:"Chile", CN:"China",
  CO:"Colombia", KM:"Comoros", CG:"Congo", CD:"Congo (DRC)", CR:"Costa Rica", CI:"Côte d'Ivoire",
  HR:"Croatia", CU:"Cuba", CY:"Cyprus", CZ:"Czechia", DK:"Denmark", DJ:"Djibouti", DM:"Dominica",
  DO:"Dominican Republic", EC:"Ecuador", EG:"Egypt", SV:"El Salvador", GQ:"Equatorial Guinea",
  ER:"Eritrea", EE:"Estonia", SZ:"Eswatini", ET:"Ethiopia", FJ:"Fiji", FI:"Finland", FR:"France",
  GA:"Gabon", GM:"Gambia", GE:"Georgia", DE:"Germany", GH:"Ghana", GR:"Greece", GD:"Grenada",
  GT:"Guatemala", GN:"Guinea", GW:"Guinea-Bissau", GY:"Guyana", HT:"Haiti", HN:"Honduras",
  HU:"Hungary", IS:"Iceland", IN:"India", ID:"Indonesia", IR:"Iran", IQ:"Iraq", IE:"Ireland",
  IL:"Israel", IT:"Italy", JM:"Jamaica", JP:"Japan", JO:"Jordan", KZ:"Kazakhstan", KE:"Kenya",
  KI:"Kiribati", KW:"Kuwait", KG:"Kyrgyzstan", LA:"Laos", LV:"Latvia", LB:"Lebanon", LS:"Lesotho",
  LR:"Liberia", LY:"Libya", LI:"Liechtenstein", LT:"Lithuania", LU:"Luxembourg", MG:"Madagascar",
  MW:"Malawi", MY:"Malaysia", MV:"Maldives", ML:"Mali", MT:"Malta", MH:"Marshall Islands",
  MR:"Mauritania", MU:"Mauritius", MX:"Mexico", FM:"Micronesia", MD:"Moldova", MC:"Monaco",
  MN:"Mongolia", ME:"Montenegro", MA:"Morocco", MZ:"Mozambique", MM:"Myanmar", NA:"Namibia",
  NR:"Nauru", NP:"Nepal", NL:"Netherlands", NZ:"New Zealand", NI:"Nicaragua", NE:"Niger",
  NG:"Nigeria", KP:"North Korea", MK:"North Macedonia", NO:"Norway", OM:"Oman", PK:"Pakistan",
  PW:"Palau", PS:"Palestine", PA:"Panama", PG:"Papua New Guinea", PY:"Paraguay", PE:"Peru",
  PH:"Philippines", PL:"Poland", PT:"Portugal", QA:"Qatar", RO:"Romania", RU:"Russia", RW:"Rwanda",
  KN:"Saint Kitts and Nevis", LC:"Saint Lucia", VC:"Saint Vincent and the Grenadines", WS:"Samoa",
  SM:"San Marino", ST:"Sao Tome and Principe", SA:"Saudi Arabia", SN:"Senegal", RS:"Serbia",
  SC:"Seychelles", SL:"Sierra Leone", SG:"Singapore", SK:"Slovakia", SI:"Slovenia",
  SB:"Solomon Islands", SO:"Somalia", ZA:"South Africa", KR:"South Korea", SS:"South Sudan",
  ES:"Spain", LK:"Sri Lanka", SD:"Sudan", SR:"Suriname", SE:"Sweden", CH:"Switzerland", SY:"Syria",
  TW:"Taiwan", TJ:"Tajikistan", TZ:"Tanzania", TH:"Thailand", TL:"Timor-Leste", TG:"Togo",
  TO:"Tonga", TT:"Trinidad and Tobago", TN:"Tunisia", TR:"Turkey", TM:"Turkmenistan", TV:"Tuvalu",
  UG:"Uganda", UA:"Ukraine", AE:"United Arab Emirates", GB:"United Kingdom", US:"United States",
  UY:"Uruguay", UZ:"Uzbekistan", VU:"Vanuatu", VA:"Vatican City", VE:"Venezuela", VN:"Vietnam",
  YE:"Yemen", ZM:"Zambia", ZW:"Zimbabwe"
};
function countryName(code){
  if(!code) return '';
  const c = String(code).toUpperCase();
  return COUNTRY_NAMES[c] || code;
}

function fmtDate(d){ return d ? new Date(d).toLocaleDateString('en-US',{year:'numeric',month:'short',day:'numeric'}) : '—'; }
function fmtDateTime(d){ return d ? new Date(d).toLocaleString('en-US',{month:'short',day:'numeric',hour:'numeric',minute:'2-digit'}) : '—'; }
function timeAgo(d){
  if(!d) return '—';
  const diff = Date.now() - new Date(d).getTime();
  const mins = Math.floor(diff/60000);
  if(mins<1) return 'just now';
  if(mins<60) return `${mins} minute${mins===1?'':'s'} ago`;
  const hrs = Math.floor(mins/60);
  if(hrs<24) return `${hrs} hour${hrs===1?'':'s'} ago`;
  const days = Math.floor(hrs/24);
  if(days<7) return `${days} day${days===1?'':'s'} ago`;
  return fmtDate(d);
}
function statusBadgeClass(status){
  if(status==='approved') return 'verified';
  if(status==='pending') return 'pending';
  if(status==='suspended' || status==='rejected') return 'suspended';
  return 'pending';
}
function statusLabel(status){ return status ? status.charAt(0).toUpperCase()+status.slice(1) : '—'; }
function roleLabel(role){
  return { super_admin:'Super Administrator', admin:'Administrator', coordinator:'Coordinator' }[role] || role || '';
}
function fullName(p){ return `${p.firstName||''} ${p.lastName||''}`.trim(); }

/* Formats "Region/State, Country" from a profile, using whichever backend field
   (`state`) is actually populated by the profile form, and skipping the separator
   cleanly when either half is missing. Congregation remains the primary way members
   are located/matched — this is just supplementary location context. */
function formatLocation(m){
  const stateVal = m.state || '';
  const country = countryName(m.country) || '';
  if(stateVal && country) return `${esc(stateVal)}, ${esc(country)}`;
  if(stateVal) return esc(stateVal);
  if(country) return esc(country);
  return '—';
}

/* ============ ICONS (reused inline) ============ */
const ICONS = {
  users:'<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
  male:'<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="10" cy="14" r="6"/><path d="M14.5 9.5 21 3"/><path d="M15 3h6v6"/></svg>',
  female:'<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="9" r="6"/><line x1="12" y1="15" x2="12" y2="22"/><line x1="9" y1="19" x2="15" y2="19"/></svg>',
  clock:'<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
  heart:'<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 1 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z"/></svg>',
  mail:'<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 4h16v16H4z"/><path d="m4 6 8 7 8-7"/></svg>',
  eye:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>',
  edit:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4z"/></svg>',
  link:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>',
  pause:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>',
  trash:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>',
  check:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><polyline points="20 6 9 17 4 12"/></svg>',
  x:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
  play:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><polygon points="5 3 19 12 5 21 5 3"/></svg>',
};

/* ============ STAGES (kanban <-> backend match status) ============ */
const STAGES = [
  { key:'suggested', label:'Suggested' },
  { key:'pending_approval', label:'Pending Approval' },
  { key:'introduced', label:'Introduction Sent' },
  { key:'conversation', label:'Conversation' },
  { key:'engaged', label:'Engaged' },
  { key:'married', label:'Married' },
  { key:'archived', label:'Archived' },
];

/* Groupings used by the "Active / Successful / Archived" sidebar links so they actually
   narrow the kanban board instead of just re-showing the full "Suggested Matches" view. */
const MATCH_FILTER_GROUPS = {
  active: ['introduced','conversation','engaged'],
  successful: ['married'],
  archived: ['archived'],
};
const MATCH_FILTER_LABELS = {
  active: 'Active Matches',
  successful: 'Successful Matches',
  archived: 'Archived Matches',
};

/* The "Status" dropdown on the Members table shows friendly labels, but the backend's
   status enum doesn't have a "Verified" value (it's "approved"), and "Suspended" in this
   UI is meant to cover both `suspended` and `rejected` profiles. */
const STATUS_FILTER_MAP = {
  'Verified': ['approved'],
  'Pending': ['pending'],
  'Suspended': ['suspended','rejected'],
};

/* Tabs shown in the Settings sidebar nav, mapped 1:1 onto the top-level keys of the
   Setting model (see models/Setting.js). */
const SETTINGS_TABS = ['General','Notifications','Match Rules','Permissions','Security','Backup'];

/* ============ APP STATE ============ */
const state = {
  admin: null,
  members: [],          // full loaded working set (Members table) — all filtering below is client-side
  membersLoaded: false,
  matches: [],
  matchesLoaded: false,
  matchFilterMode: null, // null | 'active' | 'successful' | 'archived'
  currentMember: null,   // full profile object shown in the modal
  activeModalTab: "Personal",
  matchWizardProfileA: null,
  matchWizardProfileB: null,

  contacts: [],
  contactsLoaded: false,
  activeContactId: null,

  notifications: [],
  notificationsLoaded: false,

  settings: null,
  settingsLoaded: false,
  activeSettingsTab: 'General',
};

/* ============ NAV / VIEW SWITCH ============ */
function showView(name, el){
  document.querySelectorAll('.view').forEach(v=>v.classList.remove('active'));
  const target = document.getElementById('view-'+name);
  if(target) target.classList.add('active');
  document.querySelectorAll('.nav-item').forEach(n=>n.classList.remove('active'));
  if(el){
    el.classList.add('active');
    // Also light up the parent section's top-level item (if different) so the
    // group itself reads as active, e.g. "Matches" stays highlighted while a
    // sub-filter like "Active Matches" is selected underneath it.
    if(el.classList.contains('nav-sub')){
      let top = el.closest('.nav-group').querySelector('.nav-item:not(.nav-sub)');
      if(top) top.classList.add('active');
    }
  } else {
    let match = document.querySelector('.nav-item[data-view="'+name+'"]');
    if(match) match.classList.add('active');
  }
  window.scrollTo({top:0,behavior:'smooth'});
  onViewShown(name);
}
function onViewShown(name){
  if(name==='members' && !state.membersLoaded) loadMembers();
  if(name==='matches' && !state.matchesLoaded) loadMatches();
  if(name==='contacts' && !state.contactsLoaded) loadContacts();
  if(name==='notifications' && !state.notificationsLoaded) loadNotifications();
  if(name==='settings' && !state.settingsLoaded) loadSettings();
}

/* ============ HEADER / SESSION ============ */
async function initHeader(){
  try{
    const res = await AdminAPI.me();
    state.admin = res.data.admin;
    const parts = (state.admin.name||'Admin').split(' ');
    document.getElementById('chipAvatar').textContent = initials(parts[0], parts[1]||'');
    document.getElementById('chipName').textContent = state.admin.name;
    document.getElementById('chipRole').textContent = roleLabel(state.admin.role);
    const hour = new Date().getHours();
    const greeting = hour<12 ? 'Good morning' : hour<18 ? 'Good afternoon' : 'Good evening';
    document.getElementById('dashGreeting').textContent = `${greeting}, ${parts[0]}`;
    document.getElementById('dashSubtitle').textContent =
      `Here's how the congregation of members is doing today, ${new Date().toLocaleDateString('en-US',{month:'long', day:'numeric'})}.`;
  }catch(err){
    AdminAPI.clearAccessToken();
    window.location.href = 'admin-signin.html';
  }
}
async function handleLogout(){
  try{ await AdminAPI.logout(); }catch(err){ /* ignore — clear locally regardless */ }
  AdminAPI.clearAccessToken();
  window.location.href = 'admin-signin.html';
}
function runGlobalSearch(){
  const q = document.getElementById('globalSearch').value.trim();
  showView('members');
  document.querySelector('.nav-item[data-view="members"]').classList.add('active');
  document.getElementById('fSearch').value = q;
  if(state.membersLoaded) renderMembers(); else loadMembers();
}

/* ============ DASHBOARD ============ */
async function loadDashboard(){
  const grid = document.getElementById('kpiGrid');
  grid.innerHTML = `<div class="card kpi">Loading…</div>`;
  try{
    const res = await AdminAPI.get('/dashboard/stats');
    const s = res.data.stats;
    const kpis = [
      {label:"Total Profiles", value:s.totalProfiles, icon:ICONS.users},
      {label:"Approved Profiles", value:s.approvedProfiles, icon:ICONS.check},
      {label:"Pending Profiles", value:s.pendingProfiles, icon:ICONS.clock},
      {label:"Suspended Profiles", value:s.suspendedProfiles, icon:ICONS.x},
      {label:"Total Matches", value:s.totalMatches, icon:ICONS.heart},
      {label:"Active Matches", value:s.activeMatches, icon:ICONS.link},
      {label:"Married", value:s.marriedMatches, icon:ICONS.heart},
      {label:"New Contact Requests", value:s.newContacts, icon:ICONS.mail},
    ];
    grid.innerHTML = kpis.map(k=>`
      <div class="card kpi">
        <div class="top-row"><div class="icon">${k.icon}</div></div>
        <div class="statnum">${k.value}</div>
        <div class="statlabel">${k.label}</div>
      </div>`).join('');
  }catch(err){
    grid.innerHTML = `<div class="card kpi">Couldn't load stats: ${esc(err.message)}</div>`;
  }

  try{
    const res = await AdminAPI.get('/activity-logs?limit=6');
    const logs = res.data.logs || [];
    document.getElementById('activityFeed').innerHTML = logs.length
      ? logs.map(l=>`<div class="feed-item"><div class="feed-dot"></div><div class="feed-text">${esc(l.description)}<div class="t">${timeAgo(l.createdAt)}</div></div></div>`).join('')
      : `<div class="feed-item"><div class="feed-text">No recent activity.</div></div>`;
  }catch(err){
    document.getElementById('activityFeed').innerHTML = `<div class="feed-item"><div class="feed-text">Activity log isn't available for your role.</div></div>`;
  }

  try{
    const res = await AdminAPI.get('/profiles?limit=6&sort=-createdAt');
    renderDashMini(res.data.profiles || []);
  }catch(err){
    document.getElementById('dashMiniTable').innerHTML = `<tbody><tr><td>Couldn't load recent profiles.</td></tr></tbody>`;
  }
}
function renderDashMini(profiles){
  const rows = profiles.map(m=>`
    <tr>
      <td>${avatarHTML(m)}</td>
      <td>${esc(fullName(m))}<div style="font-size:10.5px;color:var(--text-muted);">${esc(m.memberId)}</div></td>
      <td><span class="badge ${statusBadgeClass(m.status)}">${statusLabel(m.status)}</span></td>
      <td>${esc(m.congregation||'—')}</td>
    </tr>`).join('');
  document.getElementById('dashMiniTable').innerHTML =
    `<thead><tr><th></th><th>Member</th><th>Verification</th><th>Congregation</th></tr></thead>
     <tbody>${rows || '<tr><td colspan="4" style="text-align:center;color:var(--text-muted);padding:20px;">No profiles yet.</td></tr>'}</tbody>`;
}

/* ============ MEMBERS TABLE ============ */
function filterMembers(key,val){
  const map={status:'fStatus', gender:'fGender'};
  if(map[key]) document.getElementById(map[key]).value = val;
  if(state.membersLoaded) renderMembers(); else loadMembers();
}

/* Loads the working set of profiles ONCE. All filtering (gender, status, country,
   congregation, age range, baptized, pioneer, free-text search) happens client-side in
   renderMembers() against this cached list — see that function for why. */
async function loadMembers(){
  const tbody = document.getElementById('membersTbody');
  tbody.innerHTML = `<tr><td colspan="9" style="text-align:center; color:var(--text-muted); padding:30px;">Loading members…</td></tr>`;
  try{
    const res = await AdminAPI.get('/profiles?limit=100');
    state.members = res.data.profiles || [];
    state.membersLoaded = true;
    populateFilterOptions(state.members);
    renderMembers();
  }catch(err){
    tbody.innerHTML = `<tr><td colspan="9" style="text-align:center; color:var(--text-muted); padding:30px;">Couldn't load members: ${esc(err.message)}</td></tr>`;
  }
}

/* Country options are derived from whatever is currently loaded (there's no dedicated
   "distinct values" endpoint on the backend yet). Congregation is a free-typed field —
   see fCongregation input in the HTML — so it isn't populated here. */
function populateFilterOptions(list){
  const countryCodes = [...new Set(list.map(m=>m.country).filter(Boolean))]
    .sort((a,b)=>countryName(a).localeCompare(countryName(b)));
  const fCountry = document.getElementById('fCountry');
  const curCountry = fCountry.value;
  fCountry.innerHTML = '<option value="">Country</option>' + countryCodes.map(c=>`<option value="${esc(c)}" ${c===curCountry?'selected':''}>${esc(countryName(c))}</option>`).join('');
}

/* Single source of truth for the Members table. Previously only Baptized/Pioneer/Status
   were applied here while Gender/Country/Congregation/Age/Search silently did nothing
   after the first page load (they only affected a server query in buildMemberQuery(),
   which nothing called again on filter change). Now every filter control re-runs this
   against the already-loaded state.members, so every dropdown/input actually works. */
function renderMembers(){
  const gender = document.getElementById('fGender').value;
  const statusSel = document.getElementById('fStatus').value;
  const country = document.getElementById('fCountry').value;
  const congregation = (document.getElementById('fCongregation').value || '').trim().toLowerCase();
  const ageR = document.getElementById('fAge').value;
  const bap = document.getElementById('fBaptized').value;
  const pio = document.getElementById('fPioneer').value;
  const q = (document.getElementById('fSearch').value || '').trim().toLowerCase();

  const statuses = STATUS_FILTER_MAP[statusSel];
  let minAge, maxAge;
  if(ageR){
    const [lo,hi] = ageR.split('-');
    minAge = lo ? Number(lo) : undefined;
    maxAge = hi ? Number(hi) : undefined;
  }

  let list = state.members.filter(m=>{
    if(gender && (m.gender||'').toLowerCase() !== gender.toLowerCase()) return false;
    if(statuses && !statuses.includes(m.status)) return false;
    if(country && m.country !== country) return false;
    if(congregation && !(m.congregation||'').toLowerCase().includes(congregation)) return false;
    if(minAge !== undefined && (m.age === undefined || m.age < minAge)) return false;
    if(maxAge !== undefined && (m.age === undefined || m.age > maxAge)) return false;
    if(bap==='Yes' && !m.baptismYear) return false;
    if(bap==='No' && m.baptismYear) return false;
    if(pio==='Yes' && (!m.pioneerStatus || m.pioneerStatus==='none')) return false;
    if(pio==='No' && m.pioneerStatus && m.pioneerStatus!=='none') return false;
    if(q){
      const hay = `${fullName(m)} ${m.memberId||''} ${m.email||''} ${m.congregation||''}`.toLowerCase();
      if(!hay.includes(q)) return false;
    }
    return true;
  });

  document.getElementById('membersTbody').innerHTML = list.map(m=>`
    <tr>
      <td>${avatarHTML(m)}</td>
      <td class="member-name-cell">
        <div>
          <div class="nm">${esc(fullName(m))}</div>
          <div class="id">${esc(m.memberId)}</div>
        </div>
      </td>
      <td>${esc(statusLabel(m.gender))}</td>
      <td>${m.age ?? '—'}</td>
      <td>${formatLocation(m)}</td>
      <td>${esc(m.congregation||'—')}</td>
      <td><span class="badge ${statusBadgeClass(m.status)}">${statusLabel(m.status)}</span></td>
      <td>${rowActionsForStatus(m)}</td>
      <td>
        <div class="row-actions">
          <button title="View" onclick="openProfile('${m._id}')">${ICONS.eye}</button>
          <button title="Suggest a match" onclick="openMatchModal('${m._id}')">${ICONS.link}</button>
          ${statusActionButtons(m)}
          <button title="Delete" class="danger" onclick="deleteMember('${m._id}')">${ICONS.trash}</button>
        </div>
      </td>
    </tr>`).join('') || `<tr><td colspan="9" style="text-align:center; color:var(--text-muted); padding:30px;">No members match these filters.</td></tr>`;
}
function rowActionsForStatus(m){
  if(m.status==='approved') return `<span class="badge matched">Eligible</span>`;
  if(m.status==='pending') return `<span class="badge pending">Awaiting Review</span>`;
  return `<span class="badge searching">—</span>`;
}
function statusActionButtons(m){
  if(m.status==='pending'){
    return `<button title="Approve" onclick="approveMember('${m._id}')">${ICONS.check}</button>
            <button title="Reject" onclick="rejectMember('${m._id}')">${ICONS.x}</button>`;
  }
  if(m.status==='approved'){
    return `<button title="Suspend" onclick="suspendMember('${m._id}')">${ICONS.pause}</button>`;
  }
  if(m.status==='suspended' || m.status==='rejected'){
    return `<button title="Reactivate" onclick="reactivateMember('${m._id}')">${ICONS.play}</button>`;
  }
  return '';
}
async function approveMember(id){
  try{ await AdminAPI.patch(`/profiles/${id}/approve`, { status:'approved' }); await loadMembers(); loadDashboard(); }
  catch(err){ alert('Could not approve profile: ' + err.message); }
}
async function rejectMember(id){
  const reason = prompt('Reason for rejection (required):');
  if(!reason) return;
  try{ await AdminAPI.patch(`/profiles/${id}/reject`, { status:'rejected', note:reason }); await loadMembers(); loadDashboard(); }
  catch(err){ alert('Could not reject profile: ' + err.message); }
}
async function suspendMember(id){
  const reason = prompt('Reason for suspension (required):');
  if(!reason) return;
  try{ await AdminAPI.patch(`/profiles/${id}/suspend`, { status:'suspended', note:reason }); await loadMembers(); loadDashboard(); }
  catch(err){ alert('Could not suspend profile: ' + err.message); }
}
async function reactivateMember(id){
  try{ await AdminAPI.patch(`/profiles/${id}/reactivate`, {}); await loadMembers(); loadDashboard(); }
  catch(err){ alert('Could not reactivate profile: ' + err.message); }
}
async function deleteMember(id){
  if(!confirm('Delete this profile? This can only be undone by an administrator directly in the database.')) return;
  try{ await AdminAPI.delete(`/profiles/${id}`); await loadMembers(); loadDashboard(); }
  catch(err){ alert('Could not delete profile: ' + err.message); }
}

/* ============ ADVANCED SEARCH ============ */
/* Reads the four fields that actually have a backend filter (gender, age, country,
   congregation) by their own IDs — see #sGender/#sAge/#sCountry/#sCongregation in the
   HTML. Previously these were read positionally (selects[0], inputs[0], inputs[2],
   inputs[8]), which broke silently the moment a field was added/removed/reordered
   anywhere earlier in the form. Every other field on this form (Height, State, City,
   Baptized, Elder, Hobbies, Marriage Timeline, etc.) is collected in the form for a
   future backend update but isn't sent with the request yet. */
async function renderSearchResults(){
  const grid = document.getElementById('searchResults');
  grid.innerHTML = `<div class="card result-card">Searching…</div>`;

  const gender = document.getElementById('sGender').value;
  const ageRange = document.getElementById('sAge').value.trim();
  const country = document.getElementById('sCountry').value.trim();
  const congregation = document.getElementById('sCongregation').value.trim();

  const params = new URLSearchParams();
  params.set('limit', '30');
  if(gender && gender!=='Any') params.set('gender', gender.toLowerCase());
  if(country) params.set('country', country);
  if(congregation) params.set('congregation', congregation);
  if(ageRange){
    const [lo,hi] = ageRange.split(/[-–]/).map(s=>s.trim());
    if(lo) params.set('minAge', lo);
    if(hi) params.set('maxAge', hi);
  }

  try{
    const res = await AdminAPI.get('/profiles?' + params.toString());
    const list = res.data.profiles || [];
    grid.innerHTML = list.map(m=>`
      <div class="card result-card">
        <div class="result-top">
          ${avatarHTML(m)}
          <div>
            <div style="font-weight:600; font-size:13.5px;">${esc(fullName(m))}</div>
            <div style="font-size:11.5px; color:var(--text-muted);">${m.age ?? '—'} · ${formatLocation(m)}</div>
          </div>
          <span class="badge ${statusBadgeClass(m.status)}" style="margin-left:auto;">${statusLabel(m.status)}</span>
        </div>
        <div class="bio">${esc(m.aboutMe || 'No bio provided yet.')}</div>
        <div class="result-actions">
          <button class="btn btn-ghost btn-sm" onclick="openProfile('${m._id}')">View Profile</button>
          <button class="btn btn-primary btn-sm" onclick="openMatchModal('${m._id}')">Create Match</button>
        </div>
      </div>`).join('') || `<div class="card result-card">No profiles match this search.</div>`;
  }catch(err){
    grid.innerHTML = `<div class="card result-card">Search failed: ${esc(err.message)}</div>`;
  }
}

/* "Clear Filters" button on Advanced Search — previously had no onclick at all. */
function clearSearchFilters(){
  const form = document.querySelector('#view-search .search-form');
  form.querySelectorAll('input').forEach(i => i.value = '');
  form.querySelectorAll('select').forEach(s => s.selectedIndex = 0);
  document.getElementById('searchResults').innerHTML = '';
}

/* ============ MATCHES / KANBAN ============ */
async function loadMatches(){
  const board = document.getElementById('kanbanBoard');
  board.innerHTML = `<div class="kanban-col"><div class="kanban-col-head"><h4>Loading…</h4></div></div>`;
  try{
    const res = await AdminAPI.get('/matches?limit=200');
    state.matches = res.data.matches || [];
    state.matchesLoaded = true;
    renderKanban();
  }catch(err){
    board.innerHTML = `<div class="kanban-col"><div class="kanban-col-head"><h4>Couldn't load matches</h4></div><div style="padding:12px; font-size:12.5px; color:var(--text-muted);">${esc(err.message)}</div></div>`;
  }
}

/* Sets which stage-group the kanban is narrowed to (see MATCH_FILTER_GROUPS) and re-renders.
   Called from the "Active / Successful / Archived Matches" sidebar links; passing null
   (from "Suggested Matches") clears the filter back to the full board. */
function filterMatches(mode){
  state.matchFilterMode = mode;
  if(state.matchesLoaded) renderKanban();
}
function renderMatchFilterBar(){
  const bar = document.getElementById('matchFilterBar');
  if(!bar) return;
  if(!state.matchFilterMode){ bar.innerHTML = ''; return; }
  bar.innerHTML = `<div class="card" style="padding:10px 16px; margin-bottom:14px; display:flex; align-items:center; gap:10px; font-size:12.5px; color:var(--text-muted);">
    Showing: <strong style="color:var(--text-main);">${esc(MATCH_FILTER_LABELS[state.matchFilterMode] || state.matchFilterMode)}</strong>
    <button class="btn btn-ghost btn-sm" style="margin-left:auto;" onclick="filterMatches(null); renderKanban();">Show All Stages</button>
  </div>`;
}
function renderKanban(){
  renderMatchFilterBar();
  const board = document.getElementById('kanbanBoard');
  const allowedStages = state.matchFilterMode ? MATCH_FILTER_GROUPS[state.matchFilterMode] : null;
  const visibleStages = allowedStages ? STAGES.filter(s=>allowedStages.includes(s.key)) : STAGES;
  board.innerHTML = visibleStages.map(stage=>{
    const cards = state.matches.filter(m=>m.status===stage.key);
    return `
    <div class="kanban-col">
      <div class="kanban-col-head"><h4>${stage.label}</h4><span class="kanban-count">${cards.length}</span></div>
      <div class="kanban-dropzone" data-stage="${stage.key}" ondragover="onDragOver(event)" ondragleave="onDragLeave(event)" ondrop="onDrop(event)">
        ${cards.map(m=>{
          const A=m.profileA||{}, B=m.profileB||{};
          return `
          <div class="card match-card" draggable="true" ondragstart="onDragStart(event,'${m._id}')" onclick="openMatchTimeline('${m._id}')">
            <div class="match-pair">
              ${avatarHTML(A, 'width:36px; height:36px;')}
              ${avatarHTML(B, 'width:36px; height:36px;')}
            </div>
            <div class="match-names">${esc(A.firstName||'?')} ${esc((A.lastName||'?')[0]||'')}. &amp; ${esc(B.firstName||'?')} ${esc((B.lastName||'?')[0]||'')}.</div>
            <div class="match-meta"><span>${fmtDate(m.createdAt)} · ${esc(m.createdBy?.name||'—')}</span><span class="cscore">${m.compatibilityScore ?? '—'}%</span></div>
            <select class="stage-select" title="Move to a different stage" onclick="event.stopPropagation()" onchange="event.stopPropagation(); moveMatchStage('${m._id}', this.value)">
              ${STAGES.map(s=>`<option value="${s.key}" ${s.key===m.status?'selected':''}>${s.label}</option>`).join('')}
            </select>
          </div>`;
        }).join('')}
      </div>
    </div>`;
  }).join('') || `<div class="kanban-col"><div class="kanban-col-head"><h4>No matches in this view</h4></div></div>`;
}
let dragMatchId=null;
function onDragStart(e,id){ dragMatchId=id; e.dataTransfer.effectAllowed='move'; }
function onDragOver(e){ e.preventDefault(); e.currentTarget.classList.add('dragover'); }
function onDragLeave(e){ e.currentTarget.classList.remove('dragover'); }
async function onDrop(e){
  e.preventDefault(); e.currentTarget.classList.remove('dragover');
  const status = e.currentTarget.dataset.stage;
  if(!dragMatchId) return;
  const id = dragMatchId; dragMatchId = null;
  await updateMatchStatus(id, status);
}
async function updateMatchStatus(id, status){
  try{
    await AdminAPI.patch(`/matches/${id}/status`, { status });
    await loadMatches();
    loadDashboard();
  }catch(err){
    alert('Could not update match status: ' + err.message);
    loadMatches();
  }
}
function moveMatchStage(id, status){
  updateMatchStatus(id, status);
}
async function openMatchTimeline(id){
  const match = state.matches.find(m=>m._id===id);
  if(!match) return;
  document.getElementById('matchTimelineTitle').textContent =
    `Match History Timeline — ${fullName(match.profileA||{})} & ${fullName(match.profileB||{})}`;
  document.getElementById('matchTimeline').innerHTML = 'Loading…';
  try{
    const res = await AdminAPI.get(`/matches/${id}`);
    const full = res.data.match;
    const events = (full.statusHistory||[]).map(h=>({
      title: STAGES.find(s=>s.key===h.status)?.label || h.status,
      note: h.note || '',
      when: fmtDateTime(h.changedAt),
      by: h.changedBy?.name || 'System',
    }));
    document.getElementById('matchTimeline').innerHTML = events.length
      ? events.map((ev,i)=>`
        <div class="timeline-item">
          <div style="display:flex; flex-direction:column; align-items:center;"><div class="tdot"></div>${i<events.length-1?'<div class="tline"></div>':''}</div>
          <div class="timeline-content"><div class="tt">${esc(ev.title)}</div><div class="tn">${esc(ev.note)}</div><div class="tm">${ev.when} · ${esc(ev.by)}</div></div>
        </div>`).join('')
      : '<div style="color:var(--text-muted);">No history recorded for this match yet.</div>';
  }catch(err){
    document.getElementById('matchTimeline').innerHTML = `Couldn't load match history: ${esc(err.message)}`;
  }
}

/* ============ CREATE MATCH MODAL (member -> suggestions -> create) ============ */
async function openMatchModal(profileId){
  state.matchWizardProfileA = null;
  state.matchWizardProfileB = null;
  document.getElementById('matchModal').classList.add('open');
  if(profileId){
    await selectMatchProfileA(profileId);
  } else {
    renderMatchWizardStep1();
  }
}
function closeMatchModal(){ document.getElementById('matchModal').classList.remove('open'); }
async function renderMatchWizardStep1(){
  const body = document.getElementById('matchModalBody');
  body.innerHTML = `
    <div class="field">
      <label>Search for the first member</label>
      <input class="filter-input" style="width:100%;" id="matchWizardSearch" placeholder="Name, member ID, or email…" oninput="matchWizardSearchProfiles(this.value)">
    </div>
    <div id="matchWizardResults" style="margin-top:10px; max-height:320px; overflow-y:auto;"></div>`;
}
let matchWizardSearchTimer = null;
function matchWizardSearchProfiles(q){
  clearTimeout(matchWizardSearchTimer);
  matchWizardSearchTimer = setTimeout(async ()=>{
    const box = document.getElementById('matchWizardResults');
    if(!q || q.trim().length<2){ box.innerHTML = ''; return; }
    box.innerHTML = 'Searching…';
    try{
      const res = await AdminAPI.get(`/profiles?status=approved&name=${encodeURIComponent(q)}&limit=10`);
      const list = res.data.profiles || [];
      box.innerHTML = list.map(m=>`
        <div class="card" style="padding:10px 14px; margin-bottom:8px; display:flex; align-items:center; gap:10px; cursor:pointer;" onclick="selectMatchProfileA('${m._id}')">
          ${avatarHTML(m)}
          <div><div style="font-weight:600; font-size:13px;">${esc(fullName(m))}</div><div style="font-size:11.5px; color:var(--text-muted);">${esc(m.memberId)} · ${esc(m.congregation||'')}</div></div>
        </div>`).join('') || '<div style="color:var(--text-muted); font-size:13px;">No approved profiles found.</div>';
    }catch(err){
      box.innerHTML = `Search failed: ${esc(err.message)}`;
    }
  }, 300);
}
async function selectMatchProfileA(profileId){
  const body = document.getElementById('matchModalBody');
  body.innerHTML = 'Loading suggestions…';
  try{
    const [profileRes, suggestRes] = await Promise.all([
      AdminAPI.get(`/profiles/${profileId}`),
      AdminAPI.get(`/profiles/${profileId}/suggestions`),
    ]);
    state.matchWizardProfileA = profileRes.data.profile;
    const suggestions = suggestRes.data.suggestions || [];
    const A = state.matchWizardProfileA;
    body.innerHTML = `
      <div class="card" style="padding:12px 14px; display:flex; align-items:center; gap:10px; margin-bottom:16px;">
        ${avatarHTML(A)}
        <div><div style="font-weight:600;">${esc(fullName(A))}</div><div style="font-size:11.5px; color:var(--text-muted);">${esc(A.memberId)} · ${esc(A.congregation||'')}</div></div>
        <button class="btn btn-ghost btn-sm" style="margin-left:auto;" onclick="renderMatchWizardStep1()">Change</button>
      </div>
      <div class="section-title" style="margin-top:0;">Suggested Matches</div>
      <div id="matchWizardSuggestions">
        ${suggestions.length ? suggestions.map(b=>`
          <div class="card" style="padding:10px 14px; margin-bottom:8px; display:flex; align-items:center; gap:10px; cursor:pointer;" onclick="selectMatchProfileB('${b._id}')">
            ${avatarHTML(b)}
            <div style="flex:1;"><div style="font-weight:600; font-size:13px;">${esc(fullName(b))}</div><div style="font-size:11.5px; color:var(--text-muted);">${b.age ?? '—'} · ${formatLocation(b)} · ${esc(b.congregation||'')}</div></div>
          </div>`).join('') : '<div style="color:var(--text-muted); font-size:13px;">No compatible approved profiles found within the usual age range.</div>'}
      </div>`;
  }catch(err){
    body.innerHTML = `Couldn't load suggestions: ${esc(err.message)}`;
  }
}
function selectMatchProfileB(profileId){
  state.matchWizardProfileB = profileId;
  const body = document.getElementById('matchModalBody');
  const noteBox = document.createElement('div');
  noteBox.innerHTML = `
    <div class="field" style="margin-top:16px;">
      <label>Note (optional)</label>
      <input class="filter-input" style="width:100%;" id="matchWizardNote" placeholder="Why this pairing, any context for the record…">
    </div>
    <div style="display:flex; justify-content:flex-end; gap:10px; margin-top:16px;">
      <button class="btn btn-ghost" onclick="closeMatchModal()">Cancel</button>
      <button class="btn btn-primary" onclick="submitCreateMatch()">Create Match</button>
    </div>`;
  body.appendChild(noteBox);
}
async function submitCreateMatch(){
  if(!state.matchWizardProfileA || !state.matchWizardProfileB){ alert('Pick both members first.'); return; }
  const note = document.getElementById('matchWizardNote')?.value.trim();
  try{
    await AdminAPI.post('/matches', {
      profileA: state.matchWizardProfileA._id,
      profileB: state.matchWizardProfileB,
      note: note || undefined,
    });
    closeMatchModal();
    state.matchesLoaded = false;
    if(document.getElementById('view-matches').classList.contains('active')) loadMatches();
    loadDashboard();
    alert('Match created.');
  }catch(err){
    alert('Could not create match: ' + err.message);
  }
}
document.getElementById('matchModal').addEventListener('click', e=>{ if(e.target.id==='matchModal') closeMatchModal(); });

/* ============ PROFILE MODAL ============ */
const modalTabs = ["Personal","Spiritual","Lifestyle","Preferences","Notes","Match History"];
async function openProfile(id){
  document.getElementById('profileModal').classList.add('open');
  document.getElementById('mHeadName').textContent = 'Loading…';
  document.getElementById('mBody').innerHTML = '';
  document.getElementById('mTabs').innerHTML = '';
  try{
    const res = await AdminAPI.get(`/profiles/${id}`);
    state.currentMember = res.data.profile;
    state.activeModalTab = "Personal";
    const m = state.currentMember;
    if(m.profileImageUrl){
      document.getElementById('mHeadAvatar').style.cssText += 'padding:0; overflow:hidden;';
      document.getElementById('mHeadAvatar').innerHTML = `<img src="${esc(m.profileImageUrl)}" alt="${esc(fullName(m))}" style="width:100%; height:100%; object-fit:cover; display:block;">`;
    } else {
      document.getElementById('mHeadAvatar').style.cssText += avatarStyle(m.memberId);
      document.getElementById('mHeadAvatar').textContent = initials(m.firstName,m.lastName);
    }
    document.getElementById('mHeadName').textContent = fullName(m);
    document.getElementById('mHeadMeta').innerHTML = `${esc(m.memberId)} · <span class="badge ${statusBadgeClass(m.status)}">${statusLabel(m.status)}</span> · ${m.age ?? '—'}, ${formatLocation(m)}`;
    renderModalTabs();
  }catch(err){
    document.getElementById('mHeadName').textContent = 'Couldn\'t load profile';
    document.getElementById('mBody').innerHTML = esc(err.message);
  }
}
function closeModal(){ document.getElementById('profileModal').classList.remove('open'); }
function renderModalTabs(){
  document.getElementById('mTabs').innerHTML = modalTabs.map(t=>
    `<div class="modal-tab ${t===state.activeModalTab?'active':''}" onclick="state.activeModalTab='${t}'; renderModalTabs();">${t}</div>`
  ).join('');
  const m = state.currentMember;
  const tab = state.activeModalTab;
  let body = '';
  if(tab==="Personal"){
    body = `<div class="mp-grid">
      <div class="mp-field"><div class="k">Full Name</div><div class="v">${esc(fullName(m))}</div></div>
      <div class="mp-field"><div class="k">Gender</div><div class="v">${esc(statusLabel(m.gender))}</div></div>
      <div class="mp-field"><div class="k">Age</div><div class="v">${m.age ?? '—'}</div></div>
      <div class="mp-field"><div class="k">Location</div><div class="v">${formatLocation(m)}</div></div>
      <div class="mp-field"><div class="k">Congregation</div><div class="v">${esc(m.congregation||'—')}</div></div>
      <div class="mp-field"><div class="k">Date Joined</div><div class="v">${fmtDate(m.createdAt)}</div></div>
      <div class="mp-field"><div class="k">Email</div><div class="v">${esc(m.email||'—')}</div></div>
      <div class="mp-field"><div class="k">Phone</div><div class="v">${esc(m.phone||'—')}</div></div>
    </div>`;
  } else if(tab==="Spiritual"){
    body = `<div class="mp-grid">
      <div class="mp-field"><div class="k">Baptism Year</div><div class="v">${m.baptismYear||'—'}</div></div>
      <div class="mp-field"><div class="k">Pioneer Status</div><div class="v">${esc(statusLabel(m.pioneerStatus))}</div></div>
      <div class="mp-field"><div class="k">Congregation</div><div class="v">${esc(m.congregation||'—')}</div></div>
      <div class="mp-field"><div class="k">Hours / Month</div><div class="v">${m.hoursPerMonth ?? '—'}</div></div>
    </div>
    ${m.spiritualGoals ? `<p class="bio" style="margin-top:14px;">${esc(m.spiritualGoals)}</p>` : ''}`;
  } else if(tab==="Lifestyle"){
    body = `<p class="bio" style="margin-bottom:14px;">${esc(m.aboutMe || 'No bio provided yet.')}</p>
      <div class="mp-grid" style="margin-bottom:14px;">
        <div class="mp-field"><div class="k">Occupation</div><div class="v">${esc(m.occupation||'—')}</div></div>
        <div class="mp-field"><div class="k">Education</div><div class="v">${esc(m.education||'—')}</div></div>
      </div>
      ${(m.qualities||[]).map(q=>`<div class="pill-tag">${esc(q)}</div>`).join('') || ''}`;
  } else if(tab==="Preferences"){
    body = `<div class="mp-grid">
      <div class="mp-field"><div class="k">Looking For</div><div class="v">${esc(m.lookingFor||'—')}</div></div>
      <div class="mp-field"><div class="k">Relocation</div><div class="v">${esc(statusLabel(m.relocation))}</div></div>
      <div class="mp-field"><div class="k">Children</div><div class="v">${esc(statusLabel(m.hasChildren))}</div></div>
      <div class="mp-field"><div class="k">Preferred Contact</div><div class="v">${esc(statusLabel(m.preferredContact))}</div></div>
    </div>`;
  } else if(tab==="Notes"){
    const history = m.statusHistory || [];
    body = history.length
      ? history.map(h=>`<div class="card" style="padding:16px; margin-bottom:12px;">
          <div style="display:flex; justify-content:space-between; font-size:11.5px; color:var(--text-muted); margin-bottom:8px;"><span>${esc(statusLabel(h.status))}</span><span>${fmtDate(h.changedAt)}</span></div>
          <div style="font-size:13px;">${esc(h.note || 'No note added.')}</div>
        </div>`).join('')
      : '<div style="color:var(--text-muted);">No notes recorded yet.</div>';
  } else if(tab==="Match History"){
    body = `<div id="mpTimeline">Loading…</div>`;
  }
  document.getElementById('mBody').innerHTML = body;
  if(tab==="Match History") loadProfileMatchHistory(m._id);
}
async function loadProfileMatchHistory(profileId){
  try{
    const res = await AdminAPI.get(`/matches?profileId=${profileId}&limit=20`);
    const matches = res.data.matches || [];
    document.getElementById('mpTimeline').innerHTML = matches.length
      ? matches.map(mt=>{
          const other = mt.profileA?._id===profileId ? mt.profileB : mt.profileA;
          return `<div class="timeline-item">
            <div style="display:flex; flex-direction:column; align-items:center;"><div class="tdot"></div></div>
            <div class="timeline-content">
              <div class="tt">Matched with ${esc(fullName(other||{}))}</div>
              <div class="tn">${esc(statusLabel(mt.status))} · ${mt.compatibilityScore ?? '—'}% compatible</div>
              <div class="tm">${fmtDate(mt.createdAt)}</div>
            </div>
          </div>`;
        }).join('')
      : '<div style="color:var(--text-muted);">No matches for this member yet.</div>';
  }catch(err){
    document.getElementById('mpTimeline').innerHTML = `Couldn't load match history: ${esc(err.message)}`;
  }
}
document.getElementById('profileModal').addEventListener('click', e=>{ if(e.target.id==='profileModal') closeModal(); });

/* ============ CONTACT SUBMISSIONS ============ */
async function loadContacts(){
  const list = document.getElementById('inboxList');
  const panel = document.getElementById('previewPanel');
  list.innerHTML = `<div style="padding:20px; color:var(--text-muted);">Loading messages…</div>`;
  panel.innerHTML = '';
  try{
    const res = await AdminAPI.get('/contacts?limit=100&sort=-createdAt');
    state.contacts = res.data.contacts || [];
    state.contactsLoaded = true;
    renderInboxList();
    if(state.contacts.length) openContact(state.contacts[0]._id);
    else panel.innerHTML = `<div style="padding:24px; color:var(--text-muted);">No contact submissions yet.</div>`;
  }catch(err){
    list.innerHTML = `<div style="padding:20px; color:var(--text-muted);">Couldn't load messages: ${esc(err.message)}</div>`;
  }
}
function renderInboxList(){
  const list = document.getElementById('inboxList');
  list.innerHTML = state.contacts.map(c=>`
    <div class="inbox-item ${c._id===state.activeContactId?'active':''}" onclick="openContact('${c._id}')">
      <div class="inbox-item-top">
        <span>${esc(c.name)}${c.status==='new'?' <span class="badge pending" style="margin-left:6px; vertical-align:middle;">New</span>':''}</span>
        <span class="date">${timeAgo(c.createdAt)}</span>
      </div>
      <div class="subj">${esc(c.subject || '(no subject)')}</div>
      <div class="subj" style="opacity:.75;">${esc((c.message||'').slice(0,70))}${(c.message||'').length>70?'…':''}</div>
    </div>`).join('') || `<div style="padding:20px; color:var(--text-muted);">No messages.</div>`;
}
async function openContact(id){
  state.activeContactId = id;
  renderInboxList();
  const panel = document.getElementById('previewPanel');
  const c = state.contacts.find(x=>x._id===id);
  if(!c){ panel.innerHTML = ''; return; }
  panel.innerHTML = `
    <h3>${esc(c.subject || 'No subject')}</h3>
    <div class="preview-meta">From <strong>${esc(c.name)}</strong> &lt;${esc(c.email)}&gt;${c.phone? ' · '+esc(c.phone):''} · ${fmtDateTime(c.createdAt)}</div>
    <div class="preview-body">${esc(c.message)}</div>
    ${(c.replies||[]).length ? `
      <div style="margin-bottom:20px;">
        ${(c.replies||[]).map(r=>`
          <div style="background:var(--glass); border:1px solid var(--border-gold); border-radius:12px; padding:12px 16px; margin-bottom:10px;">
            <div class="t" style="color:var(--text-muted); font-size:10.5px; margin-bottom:5px;">${esc(r.repliedBy?.name || 'Admin')} · ${fmtDateTime(r.repliedAt)}</div>
            <div style="font-size:13px; line-height:1.6;">${esc(r.message)}</div>
          </div>`).join('')}
      </div>` : ''}
    <textarea id="contactReplyBox" class="filter-input" style="width:100%; min-height:80px; resize:vertical; font-family:inherit; margin-bottom:12px;" placeholder="Type a reply…"></textarea>
    <div class="preview-actions">
      <select class="filter-select" id="contactStatusSelect" onchange="updateContactStatus('${c._id}', this.value)">
        <option value="new" ${c.status==='new'?'selected':''}>New</option>
        <option value="in_progress" ${c.status==='in_progress'?'selected':''}>In Progress</option>
        <option value="resolved" ${c.status==='resolved'?'selected':''}>Resolved</option>
      </select>
      <button class="btn btn-primary" onclick="sendContactReply('${c._id}')" style="margin-left:auto;">Send Reply</button>
    </div>`;
}
async function sendContactReply(id){
  const box = document.getElementById('contactReplyBox');
  const message = box.value.trim();
  if(!message) return;
  try{
    await AdminAPI.post(`/contacts/${id}/reply`, { message });
    state.contactsLoaded = false;
    await loadContacts();
    state.activeContactId = id;
    renderInboxList();
    openContact(id);
  }catch(err){
    alert('Could not send reply: ' + err.message);
  }
}
async function updateContactStatus(id, status){
  try{
    await AdminAPI.patch(`/contacts/${id}/status`, { status });
    const c = state.contacts.find(x=>x._id===id);
    if(c) c.status = status;
    renderInboxList();
  }catch(err){
    alert('Could not update status: ' + err.message);
  }
}

/* ============ NOTIFICATIONS ============ */
async function loadNotifications(){
  const wrap = document.getElementById('notifGroups');
  wrap.innerHTML = `<div class="card" style="padding:20px; color:var(--text-muted);">Loading notifications…</div>`;
  try{
    const res = await AdminAPI.get('/notifications?limit=100&sort=-createdAt');
    state.notifications = res.data.notifications || [];
    state.notificationsLoaded = true;
    renderNotifications();
  }catch(err){
    wrap.innerHTML = `<div class="card" style="padding:20px; color:var(--text-muted);">Couldn't load notifications: ${esc(err.message)}</div>`;
  }
}
function renderNotifications(){
  const wrap = document.getElementById('notifGroups');
  if(!state.notifications.length){
    wrap.innerHTML = `<div class="card" style="padding:24px; color:var(--text-muted);">You're all caught up — no notifications.</div>`;
    return;
  }
  const groups = {};
  state.notifications.forEach(n=>{
    const key = fmtDate(n.createdAt);
    (groups[key] = groups[key] || []).push(n);
  });
  wrap.innerHTML = Object.entries(groups).map(([day, items])=>`
    <div class="notif-group">
      <h4>${esc(day)}</h4>
      <div class="card">
        ${items.map(n=>`
          <div class="notif-item ${n.isRead?'':'unread'}" onclick="handleNotifClick('${n._id}', ${n.link?`'${esc(n.link)}'`:'null'})">
            <div class="notif-icon">${notifIcon(n.type)}</div>
            <div class="notif-text">
              <div style="font-weight:600;">${esc(n.title)}</div>
              <div>${esc(n.message)}</div>
              <div class="t">${timeAgo(n.createdAt)}</div>
            </div>
          </div>`).join('')}
      </div>
    </div>`).join('');
}
function notifIcon(type){
  return { new_profile: ICONS.users, new_contact: ICONS.mail, new_match: ICONS.heart }[type] || ICONS.clock;
}
async function handleNotifClick(id, link){
  const n = state.notifications.find(x=>x._id===id);
  if(n && !n.isRead){
    try{
      await AdminAPI.patch(`/notifications/${id}/read`, {});
      n.isRead = true;
      renderNotifications();
    }catch(err){ /* non-fatal — still navigate */ }
  }
  if(link) window.location.hash = link;
}

/* ============ SETTINGS ============ */
async function loadSettings(){
  document.getElementById('settingsNav').innerHTML = `<div style="padding:14px; color:var(--text-muted);">Loading…</div>`;
  document.getElementById('settingsPanel').innerHTML = '';
  try{
    const res = await AdminAPI.get('/settings');
    state.settings = res.data.settings;
    state.settingsLoaded = true;
    renderSettingsNav();
    renderSettingsPanel();
  }catch(err){
    document.getElementById('settingsNav').innerHTML = '';
    document.getElementById('settingsPanel').innerHTML = `<div style="padding:20px; color:var(--text-muted);">Couldn't load settings: ${esc(err.message)}</div>`;
  }
}
function renderSettingsNav(){
  document.getElementById('settingsNav').innerHTML = SETTINGS_TABS.map(t=>`
    <div class="settings-nav-item ${t===state.activeSettingsTab?'active':''}"
         onclick="state.activeSettingsTab='${t}'; renderSettingsNav(); renderSettingsPanel();">${t}</div>
  `).join('');
}
function renderSettingsPanel(){
  const tab = state.activeSettingsTab;
  const s = state.settings;
  const panel = document.getElementById('settingsPanel');
  let body = '';

  if(tab==='General'){
    body = `
      <div class="sf-fields" style="margin-bottom:20px;">
        <div class="field"><label>Platform Name</label><input class="filter-input" data-path="platformName" value="${esc(s.platformName)}"></div>
        <div class="field"><label>Support Email</label><input class="filter-input" data-path="supportEmail" value="${esc(s.supportEmail)}"></div>
      </div>
      <div class="toggle-row">
        <div><div class="lbl">Maintenance Mode</div><div class="desc">Show a maintenance message and restrict public access.</div></div>
        <div class="switch ${s.maintenanceMode.enabled?'on':''}" data-path="maintenanceMode.enabled" onclick="toggleSwitchEl(this)"></div>
      </div>
      <div class="field" style="margin-top:14px;"><label>Maintenance Message</label><input class="filter-input" style="width:100%;" data-path="maintenanceMode.message" value="${esc(s.maintenanceMode.message)}"></div>`;

  } else if(tab==='Notifications'){
    const np = s.notificationPreferences;
    body = [
      ['emailOnNewProfile','Email on New Profile','Notify admins when a new profile is submitted.'],
      ['emailOnNewContact','Email on New Contact','Notify admins when a contact form is submitted.'],
      ['emailOnNewMatch','Email on New Match','Notify admins when a match is created.'],
      ['dailyAdminSummary','Daily Admin Summary','Send a daily digest of platform activity.'],
      ['weeklyDigest','Weekly Digest','Send a weekly summary email.'],
    ].map(([key,label,desc])=>`
      <div class="toggle-row">
        <div><div class="lbl">${label}</div><div class="desc">${desc}</div></div>
        <div class="switch ${np[key]?'on':''}" data-path="notificationPreferences.${key}" onclick="toggleSwitchEl(this)"></div>
      </div>`).join('');

  } else if(tab==='Match Rules'){
    const mr = s.matchRules;
    body = `
      <div class="sf-fields" style="margin-bottom:20px;">
        <div class="field"><label>Minimum Age</label><input type="number" class="filter-input" data-path="matchRules.minAge" value="${mr.minAge}"></div>
        <div class="field"><label>Max Age Gap (years)</label><input type="number" class="filter-input" data-path="matchRules.maxAgeGapYears" value="${mr.maxAgeGapYears}"></div>
        <div class="field"><label>Auto-Archive After (days inactive)</label><input type="number" class="filter-input" data-path="matchRules.autoArchiveAfterDaysInactive" value="${mr.autoArchiveAfterDaysInactive}"></div>
      </div>
      <div class="toggle-row">
        <div><div class="lbl">Require Same Country by Default</div><div class="desc">New match suggestions default to same-country only.</div></div>
        <div class="switch ${mr.requireSameCountryByDefault?'on':''}" data-path="matchRules.requireSameCountryByDefault" onclick="toggleSwitchEl(this)"></div>
      </div>`;

  } else if(tab==='Permissions'){
    const p = s.permissions;
    body = [
      ['coordinatorsCanApproveProfiles','Coordinators Can Approve Profiles'],
      ['coordinatorsCanDeleteProfiles','Coordinators Can Delete Profiles'],
      ['coordinatorsCanManageAdmins','Coordinators Can Manage Admins'],
    ].map(([key,label])=>`
      <div class="toggle-row">
        <div><div class="lbl">${label}</div></div>
        <div class="switch ${p[key]?'on':''}" data-path="permissions.${key}" onclick="toggleSwitchEl(this)"></div>
      </div>`).join('');

  } else if(tab==='Security'){
    const sec = s.security;
    body = `
      <div class="sf-fields" style="margin-bottom:20px;">
        <div class="field"><label>Session Timeout (minutes)</label><input type="number" class="filter-input" data-path="security.sessionTimeoutMinutes" value="${sec.sessionTimeoutMinutes}"></div>
        <div class="field"><label>Max Login Attempts</label><input type="number" class="filter-input" data-path="security.maxLoginAttempts" value="${sec.maxLoginAttempts}"></div>
        <div class="field"><label>Lockout Duration (minutes)</label><input type="number" class="filter-input" data-path="security.lockoutMinutes" value="${sec.lockoutMinutes}"></div>
        <div class="field"><label>Password Minimum Length</label><input type="number" class="filter-input" data-path="security.passwordMinLength" value="${sec.passwordMinLength}"></div>
      </div>
      <div class="toggle-row">
        <div><div class="lbl">Require 2FA for Super Admin</div></div>
        <div class="switch ${sec.require2FAForSuperAdmin?'on':''}" data-path="security.require2FAForSuperAdmin" onclick="toggleSwitchEl(this)"></div>
      </div>`;

  } else if(tab==='Backup'){
    const b = s.backup;
    body = `
      <div class="toggle-row">
        <div><div class="lbl">Auto Backup Enabled</div></div>
        <div class="switch ${b.autoBackupEnabled?'on':''}" data-path="backup.autoBackupEnabled" onclick="toggleSwitchEl(this)"></div>
      </div>
      <div class="sf-fields" style="margin-top:16px;">
        <div class="field"><label>Frequency</label>
          <select class="filter-select" data-path="backup.frequency">
            <option value="daily" ${b.frequency==='daily'?'selected':''}>Daily</option>
            <option value="weekly" ${b.frequency==='weekly'?'selected':''}>Weekly</option>
            <option value="monthly" ${b.frequency==='monthly'?'selected':''}>Monthly</option>
          </select>
        </div>
        <div class="field"><label>Retention (days)</label><input type="number" class="filter-input" data-path="backup.retentionDays" value="${b.retentionDays}"></div>
      </div>`;
  }

  panel.innerHTML = `
    <div class="section-title" style="margin-top:0;">${esc(tab)}</div>
    ${body}
    <div style="display:flex; justify-content:flex-end; margin-top:22px;">
      <button class="btn btn-primary" onclick="saveSettingsPanel()">Save Changes</button>
    </div>`;
}
function toggleSwitchEl(el){ el.classList.toggle('on'); }
function setPath(obj, path, val){
  const parts = path.split('.');
  let o = obj;
  for(let i=0;i<parts.length-1;i++){
    o[parts[i]] = o[parts[i]] || {};
    o = o[parts[i]];
  }
  o[parts[parts.length-1]] = val;
}
function buildSettingsPayload(){
  const payload = {};
  document.getElementById('settingsPanel').querySelectorAll('[data-path]').forEach(el=>{
    const path = el.dataset.path;
    let val;
    if(el.classList.contains('switch')) val = el.classList.contains('on');
    else if(el.type === 'number') val = Number(el.value);
    else val = el.value;
    setPath(payload, path, val);
  });
  return payload;
}
async function saveSettingsPanel(){
  const payload = buildSettingsPayload();
  try{
    const res = await AdminAPI.patch('/settings', payload);
    state.settings = res.data.settings;
    renderSettingsPanel();
  }catch(err){
    alert('Could not save settings: ' + err.message);
  }
}

/* ============ INIT ============ */
(async function init(){
  await initHeader();
  await loadDashboard();
})();