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

function idOf(value){
  if(!value) return '';
  return String(typeof value === 'object' ? value._id || value.id || '' : value);
}
function sameId(a,b){ return Boolean(idOf(a) && idOf(a) === idOf(b)); }
function assignmentStatusLabel(status){
  return {
    unassigned: 'Unassigned',
    assigned: 'Assigned',
    claimed: 'Claimed',
    completed: 'Completed',
  }[status] || statusLabel(status || 'unassigned');
}
function assignmentBadgeClass(status){
  return `assignment-${status || 'unassigned'}`;
}
function assignedAdminName(profile){
  if(!profile?.assignedAdmin) return 'Unassigned';
  if(typeof profile.assignedAdmin === 'object') return profile.assignedAdmin.name || profile.assignedAdmin.email || 'Assigned';
  if(sameId(profile.assignedAdmin, state.admin?._id)) return state.admin?.name || 'Assigned to you';
  const admin = state.admins.find(a=>sameId(a, profile.assignedAdmin));
  return admin?.name || 'Assigned';
}
function isSuperAdmin(){ return state.admin?.role === 'super_admin'; }

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

  members: [],
  membersLoaded: false,
  assignedProfiles: [],
  assignedProfilesLoaded: false,
  memberViewMode: 'all', // 'all' | 'assigned-to-me'

  admins: [],
  adminsLoaded: false,
  activeAdminModalMode: 'invite', // 'invite' | 'coverage'
  editingAdminId: null,
  assigningProfileId: null,

  matches: [],
  matchesLoaded: false,
  matchFilterMode: null,
  currentMember: null,
  activeModalTab: "Personal",
  matchWizardProfileA: null,
  matchWizardProfileB: null,

  contacts: [],
  contactsLoaded: false,
  activeContactId: null,

  notifications: [],
  notificationsLoaded: false,

  analytics: null,
  analyticsLoaded: false,
  analyticsCharts: {},

  settings: null,
  settingsLoaded: false,
  activeSettingsTab: 'General',
};

function toggleSidebar(force){

    const sidebar = document.getElementById("sidebar");
    const overlay = document.querySelector(".sidebar-overlay");

    const open = force === undefined
        ? !sidebar.classList.contains("open")
        : force;

    sidebar.classList.toggle("open", open);
    overlay.classList.toggle("show", open);
}

/* ============ NAV / VIEW SWITCH ============ */
function showView(name, el){
  if(name !== 'members'){
    resetMemberFilters();
  }

  if(state.admin && state.admin.role !== 'super_admin' && ['administrators','settings'].includes(name)){
    name = 'dashboard';
    el = null;
  }

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

if (window.innerWidth <= 992) {
    toggleSidebar(false);
}
}
function onViewShown(name){
  if(name==='members'){
    if(state.memberViewMode === 'assigned-to-me'){
      if(!state.assignedProfilesLoaded) loadAssignedProfiles();
      else renderMembers();
    } else if(!state.membersLoaded){
      loadMembers();
    } else {
      renderMembers();
    }
  }
  if(name==='matches' && !state.matchesLoaded) loadMatches();
  if(name==='contacts' && !state.contactsLoaded) loadContacts();
  if(name==='notifications' && !state.notificationsLoaded) loadNotifications();
  if(name==='analytics') loadAnalytics();
  if(name==='reports') renderReports();
  if(name==='administrators' && state.admin?.role === 'super_admin') loadAdministrators();
  if(name==='settings' && state.admin?.role === 'super_admin' && !state.settingsLoaded) loadSettings();
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

    applyRoleVisibility();
    if(state.admin.role === 'super_admin'){
      ensureAdministratorsLoaded().catch(()=>{});
    }
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
  state.memberViewMode = 'all';
  updateMembersViewHeading();
  document.getElementById('fSearch').value = q;
  showView('members');
  document.querySelector('.nav-item[data-view="members"]')?.classList.add('active');
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
function resetMemberFilters(){
  const ids = [
    'fGender',
    'fStatus',
    'fAssignment',
    'fAssignee',
    'fCountry',
    'fCongregation',
    'fAge',
    'fBaptized',
    'fPioneer',
    'fSearch',
  ];

  ids.forEach(id=>{
    const field = document.getElementById(id);
    if(field) field.value = '';
  });
}

function setMemberView(mode, el){
  resetMemberFilters();
  state.memberViewMode = mode === 'assigned-to-me' ? 'assigned-to-me' : 'all';
  updateMembersViewHeading();
  showView('members', el);

  // Explicitly render the correct source even when the Members page is already open.
  if(state.memberViewMode === 'assigned-to-me'){
    if(state.assignedProfilesLoaded) renderMembers();
    else loadAssignedProfiles();
  }else{
    if(state.membersLoaded) renderMembers();
    else loadMembers();
  }
}

function openMemberFilter(key, value, el){
  resetMemberFilters();
  state.memberViewMode = 'all';
  const map = { status:'fStatus', gender:'fGender', assignmentStatus:'fAssignment' };
  if(map[key]) document.getElementById(map[key]).value = value;
  updateMembersViewHeading();
  showView('members', el);
}

function updateMembersViewHeading(){
  const title = document.getElementById('membersPageTitle');
  const subtitle = document.getElementById('membersPageSubtitle');
  if(!title || !subtitle) return;

  if(state.memberViewMode === 'assigned-to-me'){
    title.textContent = 'My Assigned Profiles';
    subtitle.textContent = 'Profiles assigned to you, including work waiting to be claimed or completed.';
  }else{
    title.textContent = 'All Profiles';
    subtitle.textContent = 'Manage member profiles, verification, and assignment workflow.';
  }
}

function filterMembers(key,val){
  const map={status:'fStatus', gender:'fGender', assignmentStatus:'fAssignment'};
  if(map[key]) document.getElementById(map[key]).value = val;
  if(state.memberViewMode === 'assigned-to-me'){
    if(state.assignedProfilesLoaded) renderMembers(); else loadAssignedProfiles();
  }else if(state.membersLoaded){
    renderMembers();
  }else{
    loadMembers();
  }
}

function memberSource(){
  return state.memberViewMode === 'assigned-to-me' ? state.assignedProfiles : state.members;
}

async function loadMembers(){
  const tbody = document.getElementById('membersTbody');
  tbody.innerHTML = `<tr><td colspan="11" style="text-align:center; color:var(--text-muted); padding:30px;">Loading members…</td></tr>`;
  try{
    const res = await AdminAPI.get('/profiles?limit=100&sort=-createdAt');
    state.members = res.data.profiles || [];
    state.membersLoaded = true;
    populateFilterOptions(state.members);
    if(isSuperAdmin()) ensureAdministratorsLoaded().catch(()=>{});
    renderMembers();
  }catch(err){
    tbody.innerHTML = `<tr><td colspan="11" style="text-align:center; color:var(--text-muted); padding:30px;">Couldn't load members: ${esc(err.message)}</td></tr>`;
  }
}

async function loadAssignedProfiles(){
  const tbody = document.getElementById('membersTbody');
  tbody.innerHTML = `<tr><td colspan="11" style="text-align:center; color:var(--text-muted); padding:30px;">Loading assigned profiles…</td></tr>`;
  try{
    const res = await AdminAPI.get('/profiles/my-assigned?limit=100&sort=-assignedAt');
    state.assignedProfiles = res.data.profiles || [];
    state.assignedProfilesLoaded = true;
    populateFilterOptions(state.assignedProfiles);
    renderMembers();
  }catch(err){
    tbody.innerHTML = `<tr><td colspan="11" style="text-align:center; color:var(--text-muted); padding:30px;">Couldn't load assigned profiles: ${esc(err.message)}</td></tr>`;
  }
}

function populateFilterOptions(list){
  const countryCodes = [...new Set(list.map(m=>m.country).filter(Boolean))]
    .sort((a,b)=>countryName(a).localeCompare(countryName(b)));
  const fCountry = document.getElementById('fCountry');
  const curCountry = fCountry.value;
  fCountry.innerHTML = '<option value="">Country</option>' + countryCodes.map(c=>`<option value="${esc(c)}" ${c===curCountry?'selected':''}>${esc(countryName(c))}</option>`).join('');
  populateAssigneeFilter();
}

function populateAssigneeFilter(){
  const select = document.getElementById('fAssignee');
  if(!select) return;
  const current = select.value;
  const admins = state.admins
    .filter(a=>['admin','coordinator'].includes(a.role))
    .sort((a,b)=>(a.name||'').localeCompare(b.name||''));

  select.innerHTML = `
    <option value="">Assigned To</option>
    <option value="unassigned">Unassigned</option>
    ${admins.map(a=>`<option value="${esc(a._id)}">${esc(a.name || a.email)}</option>`).join('')}
  `;
  if([...select.options].some(o=>o.value===current)) select.value = current;
}

function profilePriority(profile){
  const admin = state.admin;
  if(!admin || admin.role === 'super_admin' || admin.canHandleInternational === true) return 1;

  if(sameId(profile.assignedAdmin, admin._id)) return 0;

  const country = String(profile.country || '').toUpperCase();
  const assignedCountries = Array.isArray(admin.assignedCountries)
    ? admin.assignedCountries.map(c=>String(c).toUpperCase())
    : [];

  if(assignedCountries.includes(country)) return 1;
  return 2;
}

function renderMembers(){
  updateMembersViewHeading();

  const gender = document.getElementById('fGender').value;
  const statusSel = document.getElementById('fStatus').value;
  const assignmentStatus = document.getElementById('fAssignment').value;
  const assignee = document.getElementById('fAssignee')?.value || '';
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

  let list = memberSource().filter(m=>{
    if(gender && (m.gender||'').toLowerCase() !== gender.toLowerCase()) return false;
    if(statuses && !statuses.includes(m.status)) return false;
    if(assignmentStatus && (m.assignmentStatus || 'unassigned') !== assignmentStatus) return false;
    if(assignee === 'unassigned' && m.assignedAdmin) return false;
    if(assignee && assignee !== 'unassigned' && !sameId(m.assignedAdmin, assignee)) return false;
    if(country && String(m.country||'').toUpperCase() !== String(country).toUpperCase()) return false;
    if(congregation && !(m.congregation||'').toLowerCase().includes(congregation)) return false;
    if(minAge !== undefined && (m.age === undefined || m.age < minAge)) return false;
    if(maxAge !== undefined && (m.age === undefined || m.age > maxAge)) return false;
    if(bap==='Yes' && !m.baptismYear) return false;
    if(bap==='No' && m.baptismYear) return false;
    if(pio==='Yes' && (!m.pioneerStatus || m.pioneerStatus==='none')) return false;
    if(pio==='No' && m.pioneerStatus && m.pioneerStatus!=='none') return false;
    if(q){
      const hay = `${fullName(m)} ${m.memberId||''} ${m.email||''} ${m.congregation||''} ${countryName(m.country)}`.toLowerCase();
      if(!hay.includes(q)) return false;
    }
    return true;
  });

  list = list.slice().sort((a,b)=>{
    const priorityDiff = profilePriority(a) - profilePriority(b);
    if(priorityDiff) return priorityDiff;
    return new Date(b.createdAt || b.assignedAt || 0) - new Date(a.createdAt || a.assignedAt || 0);
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
      <td><span class="badge ${assignmentBadgeClass(m.assignmentStatus)}">${assignmentStatusLabel(m.assignmentStatus)}</span></td>
      <td>
        <div class="assigned-to-cell">
          <strong>${esc(assignedAdminName(m))}</strong>
          ${m.claimedBy ? `<small>Claimed by ${esc(typeof m.claimedBy==='object' ? (m.claimedBy.name||m.claimedBy.email||'admin') : 'admin')}</small>` : ''}
        </div>
      </td>
      <td>${rowActionsForStatus(m)}</td>
      <td>
        <div class="row-actions">
          <button title="View" onclick="openProfile('${m._id}')">${ICONS.eye}</button>
          <button title="Suggest a match" onclick="openMatchModal('${m._id}')">${ICONS.link}</button>
          ${workflowActionButtons(m)}
          ${statusActionButtons(m)}
          <button title="Delete" class="danger" onclick="deleteMember('${m._id}')">${ICONS.trash}</button>
        </div>
      </td>
    </tr>`).join('') || `<tr><td colspan="11" style="text-align:center; color:var(--text-muted); padding:30px;">No members match these filters.</td></tr>`;
}

function rowActionsForStatus(m){
  if(m.status==='approved') return `<span class="badge matched">Eligible</span>`;
  if(m.status==='pending') return `<span class="badge pending">Awaiting Review</span>`;
  return `<span class="badge searching">—</span>`;
}

function workflowActionButtons(profile){
  const status = profile.assignmentStatus || 'unassigned';
  const assignedToCurrent = sameId(profile.assignedAdmin, state.admin?._id);
  const claimedByCurrent = sameId(profile.claimedBy, state.admin?._id);
  let actions = '';

  if(isSuperAdmin()){
    actions += `<button title="${profile.assignedAdmin?'Reassign':'Assign'} profile" onclick="openAssignmentModal('${profile._id}')">${ICONS.edit}</button>`;
  }

  if(status === 'assigned' && (assignedToCurrent || isSuperAdmin())){
    actions += `<button title="Claim profile" onclick="claimProfile('${profile._id}')">${ICONS.check}</button>`;
  }

  if(status === 'claimed' && (claimedByCurrent || isSuperAdmin())){
    actions += `<button title="Complete assignment" onclick="completeProfileAssignment('${profile._id}')">${ICONS.play}</button>`;
  }

  return actions;
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

async function refreshProfileCollections(profileId, modalTab){
  state.membersLoaded = false;
  state.assignedProfilesLoaded = false;

  if(state.memberViewMode === 'assigned-to-me') await loadAssignedProfiles();
  else await loadMembers();

  if(profileId && document.getElementById('profileModal').classList.contains('open')){
    await openProfile(profileId, modalTab || state.activeModalTab);
  }
}

async function approveMember(id){
  try{ await AdminAPI.patch(`/profiles/${id}/approve`, {}); await refreshProfileCollections(id); loadDashboard(); }
  catch(err){ alert('Could not approve profile: ' + err.message); }
}
async function rejectMember(id){
  const reason = prompt('Reason for rejection (required):');
  if(!reason) return;
  try{ await AdminAPI.patch(`/profiles/${id}/reject`, { note:reason }); await refreshProfileCollections(id); loadDashboard(); }
  catch(err){ alert('Could not reject profile: ' + err.message); }
}
async function suspendMember(id){
  const reason = prompt('Reason for suspension (required):');
  if(!reason) return;
  try{ await AdminAPI.patch(`/profiles/${id}/suspend`, { note:reason }); await refreshProfileCollections(id); loadDashboard(); }
  catch(err){ alert('Could not suspend profile: ' + err.message); }
}
async function reactivateMember(id){
  try{ await AdminAPI.patch(`/profiles/${id}/reactivate`, {}); await refreshProfileCollections(id); loadDashboard(); }
  catch(err){ alert('Could not reactivate profile: ' + err.message); }
}
async function deleteMember(id){
  if(!confirm('Delete this profile? This can only be undone by an administrator directly in the database.')) return;
  try{ await AdminAPI.delete(`/profiles/${id}`); closeModal(); await refreshProfileCollections(); loadDashboard(); }
  catch(err){ alert('Could not delete profile: ' + err.message); }
}

/* ============ PROFILE ASSIGNMENT ACTIONS ============ */
async function openAssignmentModal(profileId){
  if(!isSuperAdmin()) return;
  state.assigningProfileId = profileId;
  const profile = memberSource().find(p=>p._id===profileId)
    || state.members.find(p=>p._id===profileId)
    || (state.currentMember?._id === profileId ? state.currentMember : null);

  document.getElementById('assignmentModal').classList.add('open');
  document.getElementById('assignmentModalTitle').textContent = profile?.assignedAdmin ? 'Reassign Profile' : 'Assign Profile';
  document.getElementById('assignmentModalMeta').textContent =
    profile ? `${fullName(profile)} · ${countryName(profile.country)}` : 'Choose an administrator';
  document.getElementById('assignmentAdminSelect').innerHTML = '<option value="">Loading administrators…</option>';
  document.getElementById('assignmentAdminHint').textContent = '';

  try{
    await ensureAdministratorsLoaded();
    const country = String(profile?.country || '').toUpperCase();
    const eligible = state.admins
      .filter(a=>a.isActive !== false)
      .filter(a=>['admin','coordinator'].includes(a.role))
      .filter(a=>a.canHandleInternational === true || (a.assignedCountries||[]).map(c=>String(c).toUpperCase()).includes(country))
      .sort((a,b)=>(a.name||'').localeCompare(b.name||''));

    const select = document.getElementById('assignmentAdminSelect');
    select.innerHTML = eligible.length
      ? `<option value="">Select an administrator</option>${eligible.map(a=>`
          <option value="${esc(a._id)}" ${sameId(profile?.assignedAdmin,a._id)?'selected':''}>
            ${esc(a.name || a.email)} · ${esc(roleLabel(a.role))}
          </option>`).join('')}`
      : '<option value="">No eligible administrators</option>';

    document.getElementById('assignmentAdminHint').textContent = eligible.length
      ? `Only active administrators covering ${countryName(country)} or international profiles are shown.`
      : `No active administrator currently covers ${countryName(country)}. Update administrator coverage first.`;
  }catch(err){
    document.getElementById('assignmentAdminSelect').innerHTML = '<option value="">Could not load administrators</option>';
    document.getElementById('assignmentAdminHint').textContent = err.message;
  }
}

function closeAssignmentModal(){
  document.getElementById('assignmentModal').classList.remove('open');
  state.assigningProfileId = null;
}

async function submitProfileAssignment(){
  const adminId = document.getElementById('assignmentAdminSelect').value;
  if(!adminId){ alert('Select an administrator first.'); return; }

  const button = document.getElementById('assignmentSubmitButton');
  button.disabled = true;
  button.textContent = 'Assigning…';
  const profileId = state.assigningProfileId;

  try{
    await AdminAPI.patch(`/profiles/${profileId}/assign`, { adminId });
    closeAssignmentModal();
    await refreshProfileCollections(profileId, 'Assignment');
  }catch(err){
    alert('Could not assign profile: ' + err.message);
  }finally{
    button.disabled = false;
    button.textContent = 'Assign Profile';
  }
}

async function claimProfile(profileId){
  if(!confirm('Claim this profile and take responsibility for its review?')) return;
  try{
    await AdminAPI.patch(`/profiles/${profileId}/claim`, {});
    await refreshProfileCollections(profileId, 'Assignment');
  }catch(err){
    alert('Could not claim profile: ' + err.message);
  }
}

async function completeProfileAssignment(profileId){
  if(!confirm('Mark this profile assignment as completed?')) return;
  try{
    await AdminAPI.patch(`/profiles/${profileId}/complete-assignment`, {});
    await refreshProfileCollections(profileId, 'Assignment');
  }catch(err){
    alert('Could not complete assignment: ' + err.message);
  }
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
const res = await AdminAPI.get(`/profiles?status=approved&q=${encodeURIComponent(q)}&limit=10`);      const list = res.data.profiles || [];
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
function renderSuggestionCard(candidate, sourceProfile, international){
  const relocation = candidate.relocation ? statusLabel(String(candidate.relocation).replaceAll('_',' ')) : 'Not specified';
  return `
    <div class="card suggestion-card" onclick="selectMatchProfileB('${candidate._id}')">
      ${avatarHTML(candidate)}
      <div class="suggestion-main">
        <div class="suggestion-name">${esc(fullName(candidate))}</div>
        <div class="suggestion-meta">${candidate.age ?? '—'} · ${formatLocation(candidate)} · ${esc(candidate.congregation||'—')}</div>
        <div class="suggestion-meta">Relocation: ${esc(relocation)}</div>
      </div>
      <span class="badge ${international?'assignment-assigned':'assignment-completed'}">${international?'International':'Same Country'}</span>
    </div>`;
}

function renderSuggestionGroup(title, list, sourceProfile, international){
  if(!list.length) return '';
  return `
    <div class="suggestion-group">
      <div class="section-title">${esc(title)} <span class="kanban-count">${list.length}</span></div>
      ${list.map(b=>renderSuggestionCard(b, sourceProfile, international)).join('')}
    </div>`;
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
    const sameCountry = suggestions.filter(b=>String(b.country||'').toUpperCase() === String(A.country||'').toUpperCase());
    const international = suggestions.filter(b=>String(b.country||'').toUpperCase() !== String(A.country||'').toUpperCase());

    body.innerHTML = `
      <div class="card" style="padding:12px 14px; display:flex; align-items:center; gap:10px; margin-bottom:16px;">
        ${avatarHTML(A)}
        <div><div style="font-weight:600;">${esc(fullName(A))}</div><div style="font-size:11.5px; color:var(--text-muted);">${esc(A.memberId)} · ${esc(A.congregation||'')} · ${esc(countryName(A.country)||'')}</div></div>
        <button class="btn btn-ghost btn-sm" style="margin-left:auto;" onclick="renderMatchWizardStep1()">Change</button>
      </div>
      <div id="matchWizardSuggestions">
        ${suggestions.length
          ? renderSuggestionGroup('Same Country', sameCountry, A, false) + renderSuggestionGroup('International', international, A, true)
          : '<div style="color:var(--text-muted); font-size:13px;">No compatible approved profiles found within the usual age range.</div>'}
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
const modalTabs = ["Personal","Spiritual","Lifestyle","Preferences","Assignment","Notes","Match History"];

async function openProfile(id, preferredTab){
  document.getElementById('profileModal').classList.add('open');
  document.getElementById('mHeadName').textContent = 'Loading…';
  document.getElementById('mBody').innerHTML = '';
  document.getElementById('mTabs').innerHTML = '';
  try{
    const res = await AdminAPI.get(`/profiles/${id}`);
    state.currentMember = res.data.profile;
    state.activeModalTab = modalTabs.includes(preferredTab) ? preferredTab : "Personal";
    const m = state.currentMember;
    const avatar = document.getElementById('mHeadAvatar');
    avatar.removeAttribute('style');
    avatar.innerHTML = '';

    if(m.profileImageUrl){
      avatar.style.cssText = 'padding:0; overflow:hidden;';
      avatar.innerHTML = `<img src="${esc(m.profileImageUrl)}" alt="${esc(fullName(m))}" style="width:100%; height:100%; object-fit:cover; display:block;">`;
    } else {
      avatar.style.cssText = avatarStyle(m.memberId);
      avatar.textContent = initials(m.firstName,m.lastName);
    }

    document.getElementById('mHeadName').textContent = fullName(m);
    document.getElementById('mHeadMeta').innerHTML = `
      ${esc(m.memberId)} ·
      <span class="badge ${statusBadgeClass(m.status)}">${statusLabel(m.status)}</span> ·
      <span class="badge ${assignmentBadgeClass(m.assignmentStatus)}">${assignmentStatusLabel(m.assignmentStatus)}</span> ·
      ${m.age ?? '—'}, ${formatLocation(m)}
    `;
    renderModalTabs();
  }catch(err){
    document.getElementById('mHeadName').textContent = 'Couldn\'t load profile';
    document.getElementById('mBody').innerHTML = esc(err.message);
  }
}

function closeModal(){
  document.getElementById('profileModal').classList.remove('open');
}

function modalAssignmentActions(m){
  const status = m.assignmentStatus || 'unassigned';
  const assignedToCurrent = sameId(m.assignedAdmin, state.admin?._id);
  const claimedByCurrent = sameId(m.claimedBy, state.admin?._id);
  const buttons = [];

  if(isSuperAdmin()){
    buttons.push(`<button class="btn btn-primary" onclick="openAssignmentModal('${m._id}')">${m.assignedAdmin?'Reassign Profile':'Assign Profile'}</button>`);
  }
  if(status === 'assigned' && (assignedToCurrent || isSuperAdmin())){
    buttons.push(`<button class="btn btn-primary" onclick="claimProfile('${m._id}')">Claim Profile</button>`);
  }
  if(status === 'claimed' && (claimedByCurrent || isSuperAdmin())){
    buttons.push(`<button class="btn btn-primary" onclick="completeProfileAssignment('${m._id}')">Complete Assignment</button>`);
  }

  return buttons.length
    ? `<div class="assignment-actions">${buttons.join('')}</div>`
    : `<div class="form-hint">No assignment action is currently available for your account.</div>`;
}

function renderAssignmentTab(m){
  const assigned = typeof m.assignedAdmin === 'object' ? m.assignedAdmin : null;
  const assignedBy = typeof m.assignedBy === 'object' ? m.assignedBy : null;
  const claimedBy = typeof m.claimedBy === 'object' ? m.claimedBy : null;

  const coverage = assigned
    ? assigned.canHandleInternational
      ? 'International access'
      : (assigned.assignedCountries||[]).map(countryName).join(', ') || 'No countries assigned'
    : '—';

  return `
    <div class="assignment-summary">
      <div class="assignment-status-line">
        <span class="badge ${assignmentBadgeClass(m.assignmentStatus)}">${assignmentStatusLabel(m.assignmentStatus)}</span>
        <span>${esc(countryName(m.country)||'Country unavailable')}</span>
      </div>
      <div class="mp-grid">
        <div class="mp-field"><div class="k">Assigned Administrator</div><div class="v">${esc(assigned?.name || assigned?.email || 'Unassigned')}</div></div>
        <div class="mp-field"><div class="k">Assigned By</div><div class="v">${esc(assignedBy?.name || assignedBy?.email || '—')}</div></div>
        <div class="mp-field"><div class="k">Assigned Date</div><div class="v">${fmtDateTime(m.assignedAt)}</div></div>
        <div class="mp-field"><div class="k">Country Coverage</div><div class="v">${esc(coverage)}</div></div>
        <div class="mp-field"><div class="k">Claimed By</div><div class="v">${esc(claimedBy?.name || claimedBy?.email || '—')}</div></div>
        <div class="mp-field"><div class="k">Claimed Date</div><div class="v">${fmtDateTime(m.claimedAt)}</div></div>
      </div>
      ${modalAssignmentActions(m)}
    </div>`;
}

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
  } else if(tab==="Assignment"){
    body = renderAssignmentTab(m);
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
  return {
    new_profile: ICONS.users,
    profile_submitted: ICONS.users,
    profile_approved: ICONS.check,
    profile_suspended: ICONS.pause,
    profile_assigned: ICONS.edit,
    profile_claimed: ICONS.check,
    new_contact: ICONS.mail,
    contact_received: ICONS.mail,
    contact_replied: ICONS.mail,
    new_match: ICONS.heart,
    match_created: ICONS.heart,
    match_status_changed: ICONS.link,
  }[type] || ICONS.clock;
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

/* ============ ADMINISTRATOR MANAGEMENT ============ */
function applyRoleVisibility(){
  const superAdmin = isSuperAdmin();
  document.querySelectorAll('.super-admin-only').forEach(el=>{
    el.style.display = superAdmin ? '' : 'none';
  });

  ['navAdministrators','navSettings','topSettingsButton'].forEach(id=>{
    const el = document.getElementById(id);
    if(el) el.style.display = superAdmin ? '' : 'none';
  });
}

async function ensureAdministratorsLoaded(force = false){
  if(!isSuperAdmin()) return [];
  if(state.adminsLoaded && !force) return state.admins;

  const res = await AdminAPI.get('/admins?limit=100');
  state.admins = res.data?.admins || res.data?.items || res.data || [];
  if(!Array.isArray(state.admins)) state.admins = [];
  state.adminsLoaded = true;
  populateAssigneeFilter();
  return state.admins;
}

async function loadAdministrators(){
  const tbody = document.getElementById('adminTbody');
  if(!tbody) return;
  tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; color:var(--text-muted); padding:30px;">Loading administrators…</td></tr>`;

  try{
    await ensureAdministratorsLoaded(true);
    renderAdministrators();
  }catch(err){
    tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; color:var(--text-muted); padding:30px;">Couldn't load administrators: ${esc(err.message)}</td></tr>`;
  }
}



function renderAdministrators(){
  const tbody = document.getElementById('adminTbody');
  if(!tbody) return;

  const admins = state.admins.slice().sort((a,b)=>{
    if(a.role === 'super_admin' && b.role !== 'super_admin') return -1;
    if(b.role === 'super_admin' && a.role !== 'super_admin') return 1;
    return (a.name||'').localeCompare(b.name||'');
  });

  tbody.innerHTML = admins.map(a=>{
    const countries = (a.assignedCountries||[]).map(countryName);
    const coverage = a.role === 'super_admin'
      ? 'Global'
      : a.canHandleInternational
        ? 'All countries'
        : countries.length ? countries.join(', ') : 'No countries assigned';

    return `
      <tr>
        <td><div class="avatar" style="${avatarStyle(a._id)}">${initials((a.name||'').split(' ')[0], (a.name||'').split(' ')[1])}</div></td>
        <td>
          <div class="nm">${esc(a.name || 'Unnamed administrator')}</div>
          <div class="id">${esc(a.email || '')}</div>
        </td>
        <td>${esc(roleLabel(a.role))}</td>
        <td><div class="admin-coverage">${esc(coverage)}</div></td>
        <td><span class="badge ${a.canHandleInternational || a.role==='super_admin' ? 'assignment-completed' : 'assignment-unassigned'}">${a.canHandleInternational || a.role==='super_admin' ? 'Enabled' : 'Country only'}</span></td>
        <td>${fmtDateTime(a.lastLoginAt || a.lastLogin || a.updatedAt)}</td>
        <td><span class="badge ${a.isActive===false?'suspended':'verified'}">${a.isActive===false?'Inactive':'Active'}</span></td>
        <td>
  <div class="row-actions">
    ${a.role === 'super_admin' ? '' : `
      <button title="Edit country coverage" onclick="openCoverageModal('${a._id}')">
        ${ICONS.edit}
      </button>

      <button
        class="danger"
        title="Delete administrator"
        onclick="deleteAdmin('${a._id}', '${esc(a.email)}')">
        ${ICONS.trash}
      </button>
    `}
  </div>
</td>
      </tr>`;
  }).join('') || `<tr><td colspan="8" style="text-align:center; color:var(--text-muted); padding:30px;">No administrators found.</td></tr>`;
}
async function deleteAdmin(id, email) {
  const confirmed = confirm(
    `Are you sure you want to delete ${email}?`
  );

  if (!confirmed) return;

  try {
    await AdminAPI.delete(`/admins/${id}`);

    state.adminsLoaded = false;
    await loadAdministrators();
  } catch (err) {
    alert(`Could not delete administrator: ${err.message}`);
  }
}

function countryOptionsHTML(selected = []){
  const selectedSet = new Set((selected||[]).map(c=>String(c).toUpperCase()));
  return Object.entries(COUNTRY_NAMES)
    .sort((a,b)=>a[1].localeCompare(b[1]))
    .map(([code,name])=>`<option value="${code}" ${selectedSet.has(code)?'selected':''}>${esc(name)} (${code})</option>`)
    .join('');
}

function openInviteAdminModal(){
  state.activeAdminModalMode = 'invite';
  state.editingAdminId = null;

  document.getElementById('adminModalTitle').textContent = 'Invite Administrator';
  document.getElementById('adminModalSubtitle').textContent = 'Set their role and country coverage before sending the invitation.';
  document.getElementById('adminIdentityFields').style.display = '';
  ['adminName','adminEmail','adminRole'].forEach(id=>document.getElementById(id).disabled = false);
  document.getElementById('adminName').value = '';
  document.getElementById('adminEmail').value = '';
  document.getElementById('adminRole').value = 'admin';
  document.getElementById('adminInternational').checked = false;
  document.getElementById('adminCountries').innerHTML = countryOptionsHTML();
  document.getElementById('adminSubmitButton').textContent = 'Send Invitation';
  document.getElementById('adminFormError').textContent = '';
  toggleAdminCountrySelection();
  document.getElementById('adminModal').classList.add('open');
}

async function openCoverageModal(adminId){
  try{
    await ensureAdministratorsLoaded();
    const admin = state.admins.find(a=>a._id===adminId);
    if(!admin) throw new Error('Administrator not found');

    state.activeAdminModalMode = 'coverage';
    state.editingAdminId = adminId;

    document.getElementById('adminModalTitle').textContent = 'Edit Country Coverage';
    document.getElementById('adminModalSubtitle').textContent = `${admin.name || admin.email} · ${roleLabel(admin.role)}`;
    document.getElementById('adminIdentityFields').style.display = 'none';
    ['adminName','adminEmail','adminRole'].forEach(id=>document.getElementById(id).disabled = true);
    document.getElementById('adminInternational').checked = admin.canHandleInternational === true;
    document.getElementById('adminCountries').innerHTML = countryOptionsHTML(admin.assignedCountries || []);
    document.getElementById('adminSubmitButton').textContent = 'Save Coverage';
    document.getElementById('adminFormError').textContent = '';
    toggleAdminCountrySelection();
    document.getElementById('adminModal').classList.add('open');
  }catch(err){
    alert('Could not open administrator coverage: ' + err.message);
  }
}

function closeAdminModal(){
  document.getElementById('adminModal').classList.remove('open');
  state.editingAdminId = null;
}

function toggleAdminCountrySelection(){
  const international = document.getElementById('adminInternational').checked;
  const select = document.getElementById('adminCountries');
  select.disabled = international;
  if(international){
    [...select.options].forEach(option=>option.selected = false);
  }
}

function selectedAdminCountries(){
  return [...document.getElementById('adminCountries').selectedOptions].map(option=>option.value);
}

async function submitAdminForm(event){
  event.preventDefault();
  const error = document.getElementById('adminFormError');
  const submit = document.getElementById('adminSubmitButton');
  error.textContent = '';

  const canHandleInternational = document.getElementById('adminInternational').checked;
  const assignedCountries = canHandleInternational ? [] : selectedAdminCountries();

  if(!canHandleInternational && assignedCountries.length === 0){
    error.textContent = 'Select at least one country or enable international access.';
    return false;
  }

  const originalText = submit.textContent;
  submit.disabled = true;
  submit.textContent = state.activeAdminModalMode === 'invite' ? 'Sending…' : 'Saving…';

  try{
    if(state.activeAdminModalMode === 'invite'){
      const name = document.getElementById('adminName').value.trim();
      const email = document.getElementById('adminEmail').value.trim();
      const role = document.getElementById('adminRole').value;

      if(!name || !email){
        throw new Error('Name and email are required.');
      }

      await AdminAPI.post('/auth/invite', {
        name,
        email,
        role,
        assignedCountries,
        canHandleInternational,
      });
    }else{
      await AdminAPI.patch(`/admins/${state.editingAdminId}/countries`, {
        assignedCountries,
        canHandleInternational,
      });
    }

    closeAdminModal();
    state.adminsLoaded = false;
    await loadAdministrators();
    if(state.membersLoaded) renderMembers();
  }catch(err){
    error.textContent = err.message;
  }finally{
    submit.disabled = false;
    submit.textContent = originalText;
  }

  return false;
}

document.getElementById('assignmentModal').addEventListener('click', event=>{
  if(event.target.id === 'assignmentModal') closeAssignmentModal();
});
document.getElementById('adminModal').addEventListener('click', event=>{
  if(event.target.id === 'adminModal') closeAdminModal();
});

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


/* ============ ANALYTICS & REPORTS ============ */
function getChartTheme(){
  const css = getComputedStyle(document.documentElement);
  return {
    gold: css.getPropertyValue('--accent-gold').trim() || '#C89A3D',
    goldLight: css.getPropertyValue('--accent-gold-light').trim() || '#E4C374',
    text: css.getPropertyValue('--text').trim() || '#F8F3EC',
    muted: css.getPropertyValue('--text-muted').trim() || '#B9ADA6',
    success: css.getPropertyValue('--success').trim() || '#2E8B57',
    danger: css.getPropertyValue('--danger').trim() || '#C04B4B',
    warning: css.getPropertyValue('--warning').trim() || '#D9A441',
    panel: '#2A1623',
    grid: 'rgba(200,154,61,0.12)',
    faded: 'rgba(185,173,166,0.14)',
  };
}

function destroyAnalyticsCharts(){
  Object.values(state.analyticsCharts).forEach(chart => chart?.destroy());
  state.analyticsCharts = {};
}

function analyticsChartOptions({ legend = false, scales = true, cutout } = {}){
  const t = getChartTheme();
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 500 },
    plugins: {
      legend: {
        display: legend,
        position: 'bottom',
        labels: { color: t.muted, usePointStyle: true, pointStyle: 'circle', padding: 18, font: { family: 'Inter', size: 11 } },
      },
      tooltip: {
        backgroundColor: t.panel,
        titleColor: t.text,
        bodyColor: t.muted,
        borderColor: t.gold,
        borderWidth: 1,
        padding: 12,
        displayColors: true,
      },
    },
  };
  if(cutout) options.cutout = cutout;
  if(scales){
    options.scales = {
      x: { grid: { display: false }, ticks: { color: t.muted, font: { family: 'Inter', size: 10 } }, border: { color: t.grid } },
      y: { beginAtZero: true, ticks: { precision: 0, color: t.muted, font: { family: 'Inter', size: 10 } }, grid: { color: t.grid }, border: { display: false } },
    };
  }
  return options;
}

function normalizeMonthlyRegistrations(rows = [], months = 12){
  const map = new Map(rows.map(r => [`${r.year}-${String(r.month).padStart(2,'0')}`, Number(r.count) || 0]));
  const output = [];
  const now = new Date();
  for(let i = months - 1; i >= 0; i--){
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
    output.push({ label: d.toLocaleDateString('en-US',{month:'short', year:'2-digit'}), count: map.get(key) || 0 });
  }
  return output;
}

function renderRankedAnalyticsList(elementId, rows, nameKey){
  const el = document.getElementById(elementId);
  if(!el) return;
  const clean = (rows || []).filter(row => row?.[nameKey]);
  if(!clean.length){
    el.innerHTML = '<div class="analytics-empty">No data available yet.</div>';
    return;
  }
  const max = Math.max(...clean.map(row => Number(row.count) || 0), 1);
  el.innerHTML = `<div class="analytics-list">${clean.map(row => `
    <div class="analytics-list-row">
      <div class="analytics-list-name" title="${esc(nameKey === 'country' ? countryName(row[nameKey]) : row[nameKey])}">${esc(nameKey === 'country' ? countryName(row[nameKey]) : row[nameKey])}</div>
      <div class="analytics-list-count">${Number(row.count) || 0}</div>
      <div class="analytics-list-track"><div class="analytics-list-fill" style="width:${Math.max(4, ((Number(row.count)||0)/max)*100)}%"></div></div>
    </div>`).join('')}</div>`;
}

function renderAnalytics(){
  const a = state.analytics;
  if(!a || typeof Chart === 'undefined') return;
  const t = getChartTheme();
  Chart.defaults.color = t.muted;
  Chart.defaults.font.family = 'Inter';
  Chart.defaults.borderColor = t.grid;
  destroyAnalyticsCharts();

  const monthly = normalizeMonthlyRegistrations(a.monthlyRegistrations, 12);
  state.analyticsCharts.monthly = new Chart(document.getElementById('monthlyRegistrationsChart'), {
    type: 'line',
    data: {
      labels: monthly.map(x => x.label),
      datasets: [{
        label: 'Registrations',
        data: monthly.map(x => x.count),
        borderColor: t.goldLight,
        backgroundColor: 'rgba(200,154,61,0.16)',
        fill: true,
        tension: .36,
        borderWidth: 2,
        pointBackgroundColor: t.gold,
        pointBorderColor: t.goldLight,
        pointRadius: 3,
        pointHoverRadius: 5,
      }],
    },
    options: analyticsChartOptions({ legend: false, scales: true }),
  });

  const gender = a.genderRatio || {};
  const male = Number(gender.male ?? gender.Male ?? gender.brother ?? gender.Brother ?? 0);
  const female = Number(gender.female ?? gender.Female ?? gender.sister ?? gender.Sister ?? 0);
  state.analyticsCharts.gender = new Chart(document.getElementById('genderRatioChart'), {
    type: 'doughnut',
    data: { labels: ['Brothers', 'Sisters'], datasets: [{ data: [male, female], backgroundColor: [t.gold, t.goldLight], borderColor: [t.panel, t.panel], borderWidth: 3, hoverOffset: 5 }] },
    options: analyticsChartOptions({ legend: true, scales: false, cutout: '68%' }),
  });

  const ages = a.ageDistribution || [];
  state.analyticsCharts.age = new Chart(document.getElementById('ageDistributionChart'), {
    type: 'bar',
    data: {
      labels: ages.map(x => x.label),
      datasets: [{ label: 'Profiles', data: ages.map(x => Number(x.count)||0), backgroundColor: t.gold, borderColor: t.goldLight, borderWidth: 1, borderRadius: 7, maxBarThickness: 42 }],
    },
    options: analyticsChartOptions({ legend: false, scales: true }),
  });

  const approval = a.approvalRate || {};
  const approved = Number(approval.approved) || 0;
  const rejected = Number(approval.rejected) || 0;
  const decided = approved + rejected;
  state.analyticsCharts.approval = new Chart(document.getElementById('approvalRateChart'), {
    type: 'doughnut',
    data: { labels: ['Approved', 'Rejected'], datasets: [{ data: decided ? [approved, rejected] : [1, 0], backgroundColor: decided ? [t.success, t.danger] : [t.faded, t.faded], borderColor: [t.panel, t.panel], borderWidth: 3, hoverOffset: 5 }] },
    options: {
      ...analyticsChartOptions({ legend: true, scales: false, cutout: '70%' }),
      plugins: {
        ...analyticsChartOptions({ legend: true, scales: false, cutout: '70%' }).plugins,
        title: { display: true, text: approval.approvalRate == null ? 'No decisions yet' : `${approval.approvalRate}%`, color: t.goldLight, position: 'top', font: { family: 'DM Sans', size: 24, weight: '700' }, padding: { bottom: 6 } },
      },
    },
  });

  renderRankedAnalyticsList('countryList', a.topCountries, 'country');
  renderRankedAnalyticsList('congList', a.mostActiveCongregations, 'congregation');

  const kpis = [
    { label: 'Pending Profiles', value: a.pendingProfiles ?? a.dashboard?.pendingProfiles ?? 0 },
    { label: 'New Contact Messages', value: a.pendingContacts ?? a.dashboard?.newContacts ?? 0 },
    { label: 'Successful Matches', value: a.successfulMatches ?? a.dashboard?.marriedMatches ?? 0 },
  ];
  document.getElementById('analyticsExtraKpis').innerHTML = kpis.map(k => `<div class="card kpi"><div class="kpi-label">${esc(k.label)}</div><div class="kpi-value">${Number(k.value)||0}</div></div>`).join('');
  renderReports();
}

async function loadAnalytics(){
  const country = document.getElementById('countryList');
  const congregation = document.getElementById('congList');
  if(!state.analyticsLoaded){
    if(country) country.innerHTML = '<div class="analytics-empty">Loading analytics…</div>';
    if(congregation) congregation.innerHTML = '<div class="analytics-empty">Loading analytics…</div>';
  }
  try{
    const res = await AdminAPI.get('/analytics');
    state.analytics = res.data?.analytics || res.analytics || res.data || res;
    state.analyticsLoaded = true;
    renderAnalytics();
  }catch(err){
    const message = `<div class="analytics-empty">Could not load analytics.<br>${esc(err.message)}</div>`;
    if(country) country.innerHTML = message;
    if(congregation) congregation.innerHTML = message;
  }
}

const REPORT_TYPES = [
  { type:'members', title:'Members Report', description:'Complete member profile register and current approval statuses.' },
  { type:'matches', title:'Matches Report', description:'Match records, compatibility scores, and relationship progress.' },
  { type:'contacts', title:'Contact Submissions', description:'Messages received through the public contact form.' },
  { type:'activityLogs', title:'Activity Logs', description:'Recent administrator actions and system activity.' },
  { type:'analytics', title:'Analytics Summary', description:'High-level profile, contact, match, and approval metrics.' },
];

function reportCardsHTML(){
  return REPORT_TYPES.map(report => `
    <div class="card report-card">
      <div class="rt-icon">${ICONS.file || ICONS.users}</div>
      <div><h4>${esc(report.title)}</h4><p>${esc(report.description)}</p></div>
      <div class="export-row">
        <button class="btn btn-ghost" onclick="downloadReport('${report.type}','pdf',this)">PDF</button>
        <button class="btn btn-ghost" onclick="downloadReport('${report.type}','excel',this)">Excel</button>
        <button class="btn btn-ghost" onclick="downloadReport('${report.type}','csv',this)">CSV</button>
      </div>
    </div>`).join('');
}

function renderReports(){
  const html = `<div class="report-grid">${reportCardsHTML()}</div>`;
  const standalone = document.getElementById('reportGrid');
  const inline = document.getElementById('view-reports-inline');
  if(standalone) standalone.innerHTML = reportCardsHTML();
  if(inline) inline.innerHTML = html;
}

async function downloadReport(type, format, button){
  const original = button?.textContent;
  if(button){ button.disabled = true; button.textContent = 'Preparing…'; }
  try{
    const token = AdminAPI.getAccessToken();
    const response = await fetch(`${API_BASE_URL}/reports/${encodeURIComponent(type)}?format=${encodeURIComponent(format)}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      credentials: 'include',
    });
    if(!response.ok){
      let message = `Report generation failed (${response.status})`;
      try{ const body = await response.json(); message = body.message || message; }catch(_err){}
      throw new Error(message);
    }
    const blob = await response.blob();
    const contentDisposition = response.headers.get('content-disposition') || '';
    const match = contentDisposition.match(/filename\*?=(?:UTF-8''|\")?([^\";]+)/i);
    const fallbackExt = format === 'excel' ? 'xlsx' : format;
    const filename = match ? decodeURIComponent(match[1].replace(/\"/g,'')) : `${type}-report.${fallbackExt}`;
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  }catch(err){
    alert(err.message);
  }finally{
    if(button){ button.disabled = false; button.textContent = original; }
  }
}

/* ============ INIT ============ */
(async function init(){
  await initHeader();
  await loadDashboard();
})();