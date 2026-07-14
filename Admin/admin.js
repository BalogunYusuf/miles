
/* ============ MOCK DATA ============ */
const names = [
  ["Grace","Nakato"],["Daniel","Kimutai"],["Miriam","Achieng"],["Samuel","Otieno"],
  ["Ruth","Wanjiru"],["Elias","Muthoni"],["Naomi","Chebet"],["Josiah","Mwangi"],
  ["Deborah","Adhiambo"],["Isaac","Kamau"],["Priscilla","Njoki"],["Timothy","Ochieng"],
  ["Abigail","Wambui"],["Caleb","Kiptoo"],["Hannah","Auma"],["Nathaniel","Odhiambo"],
  ["Esther","Wairimu"],["Joel","Barasa"],["Rebekah","Njeri"],["Ezra","Simiyu"]
];
const congregations = ["Kilimani English","Westlands Swahili","South B Central","Runda North","Karen Hills","Rongai Fellowship","Kasarani East","Lang'ata Peace"];
const countries = ["Kenya","Uganda","Tanzania","Nigeria","South Africa","Ghana"];
const cities = ["Nairobi","Kampala","Dar es Salaam","Lagos","Cape Town","Accra"];
const statuses = ["Verified","Pending","Suspended"];
const matchStatuses = ["Matched","Searching"];
const goldTones = ["#C89A3D","#8a6420","#b98a3a","#a67c2e"];

function initials(f,l){return (f[0]+l[0]).toUpperCase();}
function avatarStyle(i){return `background:linear-gradient(135deg, ${goldTones[i%goldTones.length]}, #5c3a12);`;}

const members = names.map((n,i)=>({
  id: "JW-"+String(1042+i),
  first:n[0], last:n[1],
  gender: i%2===0 ? "Female":"Male",
  age: 22+ (i*3)%28,
  city: cities[i%cities.length],
  country: countries[i%countries.length],
  congregation: congregations[i%congregations.length],
  status: statuses[i%5===0?2:(i%3===0?1:0)],
  matchStatus: matchStatuses[i%2],
  baptized: i%4!==0 ? "Yes":"No",
  pioneer: i%3===0 ? "Yes":"No",
  joined: `2026-0${(i%6)+1}-${String((i*3)%27+1).padStart(2,'0')}`,
  bio: "Devoted to spiritual growth, enjoys hospitality and nature walks, seeking a partner equally rooted in truth.",
  compat: 78 + (i*7)%21
}));

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
};

/* ============ NAV / VIEW SWITCH ============ */
function showView(name, el){
  document.querySelectorAll('.view').forEach(v=>v.classList.remove('active'));
  const target = document.getElementById('view-'+name);
  if(target) target.classList.add('active');
  document.querySelectorAll('.nav-item').forEach(n=>n.classList.remove('active'));
  if(el){
    let top = el.closest('.nav-group').querySelector('.nav-item:not(.nav-sub)');
    if(top) top.classList.add('active');
  } else {
    let match = document.querySelector('.nav-item[data-view="'+name+'"]');
    if(match) match.classList.add('active');
  }
  window.scrollTo({top:0,behavior:'smooth'});
}

/* ============ DASHBOARD ============ */
function sparkline(seed){
  let pts = [];
  for(let i=0;i<12;i++){ pts.push(20 + Math.abs(Math.sin(seed+i*0.7))*20 + (i*1.2)); }
  const max = Math.max(...pts), min = Math.min(...pts);
  const norm = pts.map((p,i)=> [i*(140/11), 30 - ((p-min)/(max-min||1))*26]);
  const path = "M" + norm.map(p=>p[0].toFixed(1)+","+p[1].toFixed(1)).join(" L ");
  return `<svg class="spark" viewBox="0 0 140 32" preserveAspectRatio="none"><path d="${path}" fill="none" stroke="#C89A3D" stroke-width="2" stroke-linecap="round"/></svg>`;
}
const kpis = [
  {label:"Total Members", value:"1,250", delta:"+4.2%", up:true, icon:ICONS.users},
  {label:"Male Members", value:"642", delta:"+2.1%", up:true, icon:ICONS.male},
  {label:"Female Members", value:"608", delta:"+3.6%", up:true, icon:ICONS.female},
  {label:"Pending Profiles", value:"128", delta:"-6.4%", up:false, icon:ICONS.clock},
  {label:"Successful Matches", value:"320", delta:"+8.9%", up:true, icon:ICONS.heart},
  {label:"Pending Contact Requests", value:"25", delta:"-1.3%", up:false, icon:ICONS.mail},
];
document.getElementById('kpiGrid').innerHTML = kpis.map((k,i)=>`
  <div class="card kpi">
    <div class="top-row">
      <div class="icon">${k.icon}</div>
      <div class="delta ${k.up?'up':'down'}">${k.delta}</div>
    </div>
    <div class="statnum">${k.value}</div>
    <div class="statlabel">${k.label}</div>
    ${sparkline(i+1)}
  </div>
`).join('');

document.getElementById('activityFeed').innerHTML = [
  ["Grace Nakato's profile was approved","2 minutes ago"],
  ["Sarah updated her lifestyle preferences","18 minutes ago"],
  ["New match created: Daniel K. &amp; Ruth W.","1 hour ago"],
  ["Message received from a contact form","3 hours ago"],
  ["Admin Esther Mwangi logged in","5 hours ago"],
  ["Profile suspended: repeated no-shows","Yesterday"],
].map(([t,ti])=>`<div class="feed-item"><div class="feed-dot"></div><div class="feed-text">${t}<div class="t">${ti}</div></div></div>`).join('');

function renderDashMini(){
  const rows = members.slice(0,6).map(m=>`
    <tr>
      <td><div class="avatar" style="${avatarStyle(m.id.length)}">${initials(m.first,m.last)}</div></td>
      <td>${m.first} ${m.last}<div style="font-size:10.5px;color:var(--text-muted);">${m.id}</div></td>
      <td><span class="badge ${m.status.toLowerCase()}">${m.status}</span></td>
      <td><span class="badge ${m.matchStatus==='Matched'?'matched':'searching'}">${m.matchStatus}</span></td>
    </tr>`).join('');
  document.getElementById('dashMiniTable').innerHTML = `<thead><tr><th></th><th>Member</th><th>Verification</th><th>Match</th></tr></thead><tbody>${rows}</tbody>`;
}
renderDashMini();

/* ============ MEMBERS TABLE ============ */
function filterMembers(key,val){
  const map={status:'fStatus', gender:'fGender'};
  if(map[key]) document.getElementById(map[key]).value = val;
  renderMembers();
}
function renderMembers(){
  const g=document.getElementById('fGender').value, s=document.getElementById('fStatus').value,
        ms=document.getElementById('fMatch').value, ageR=document.getElementById('fAge').value,
        bap=document.getElementById('fBaptized').value, pio=document.getElementById('fPioneer').value,
        q=(document.getElementById('fSearch').value||'').toLowerCase();
  let list = members.filter(m=>{
    if(g && m.gender!==g) return false;
    if(s && m.status!==s) return false;
    if(ms && m.matchStatus!==ms) return false;
    if(bap && m.baptized!==bap) return false;
    if(pio && m.pioneer!==pio) return false;
    if(ageR){ const [lo,hi]=ageR.split('-').map(Number); if(m.age<lo||m.age>hi) return false; }
    if(q && !(`${m.first} ${m.last} ${m.id} ${m.congregation} ${m.city}`.toLowerCase().includes(q))) return false;
    return true;
  });
  document.getElementById('membersTbody').innerHTML = list.map(m=>`
    <tr>
      <td><div class="avatar" style="${avatarStyle(m.id.length+m.age)}">${initials(m.first,m.last)}</div></td>
      <td class="member-name-cell">
        <div>
          <div class="nm">${m.first} ${m.last}</div>
          <div class="id">${m.id}</div>
        </div>
      </td>
      <td>${m.gender}</td>
      <td>${m.age}</td>
      <td>${m.city}, ${m.country}</td>
      <td>${m.congregation}</td>
      <td><span class="badge ${m.status.toLowerCase()}">${m.status}</span></td>
      <td><span class="badge ${m.matchStatus==='Matched'?'matched':'searching'}">${m.matchStatus}</span></td>
      <td>
        <div class="row-actions">
          <button title="View" onclick="openProfile('${m.id}')">${ICONS.eye}</button>
          <button title="Edit">${ICONS.edit}</button>
          <button title="Match">${ICONS.link}</button>
          <button title="Suspend">${ICONS.pause}</button>
          <button title="Delete" class="danger">${ICONS.trash}</button>
        </div>
      </td>
    </tr>`).join('') || `<tr><td colspan="9" style="text-align:center; color:var(--text-muted); padding:30px;">No members match these filters.</td></tr>`;
}
renderMembers();

/* ============ ADVANCED SEARCH RESULTS ============ */
function renderSearchResults(){
  const list = [...members].sort((a,b)=>b.compat-a.compat).slice(0,9);
  document.getElementById('searchResults').innerHTML = list.map(m=>`
    <div class="card result-card">
      <div class="result-top">
        <div class="avatar" style="${avatarStyle(m.compat)}">${initials(m.first,m.last)}</div>
        <div>
          <div style="font-weight:600; font-size:13.5px;">${m.first} ${m.last}</div>
          <div style="font-size:11.5px; color:var(--text-muted);">${m.age} · ${m.city}, ${m.country}</div>
        </div>
        <div class="compat"><div class="pct">${m.compat}%</div><div class="lbl">Compatible</div></div>
      </div>
      <div class="bio">${m.bio}</div>
      <div class="result-actions">
        <button class="btn btn-ghost btn-sm" onclick="openProfile('${m.id}')">View Profile</button>
        <button class="btn btn-primary btn-sm">Create Match</button>
      </div>
    </div>`).join('');
}
renderSearchResults();

/* ============ KANBAN ============ */
const stages = ["Suggested","Pending Approval","Introduction Sent","Conversation","Engaged","Married","Archived"];
let matches = [
  {a:0,b:1,stage:"Suggested",score:91,date:"Jul 2",admin:"EM"},
  {a:2,b:3,stage:"Suggested",score:84,date:"Jul 3",admin:"TO"},
  {a:4,b:5,stage:"Pending Approval",score:88,date:"Jun 28",admin:"EM"},
  {a:6,b:7,stage:"Introduction Sent",score:93,date:"Jun 20",admin:"JB"},
  {a:8,b:9,stage:"Conversation",score:87,date:"Jun 15",admin:"EM"},
  {a:10,b:11,stage:"Conversation",score:79,date:"Jun 10",admin:"TO"},
  {a:0,b:2,stage:"Engaged",score:95,date:"May 30",admin:"EM"},
  {a:12,b:13,stage:"Married",score:97,date:"Apr 12",admin:"JB"},
  {a:14,b:15,stage:"Archived",score:61,date:"Mar 5",admin:"TO"},
];
function renderKanban(){
  const board = document.getElementById('kanbanBoard');
  board.innerHTML = stages.map(stage=>{
    const cards = matches.filter(m=>m.stage===stage);
    return `
    <div class="kanban-col">
      <div class="kanban-col-head"><h4>${stage}</h4><span class="kanban-count">${cards.length}</span></div>
      <div class="kanban-dropzone" data-stage="${stage}" ondragover="onDragOver(event)" ondragleave="onDragLeave(event)" ondrop="onDrop(event)">
        ${cards.map((m,idx)=>{
          const A=members[m.a], B=members[m.b];
          const globalIdx = matches.indexOf(m);
          return `
          <div class="card match-card" draggable="true" ondragstart="onDragStart(event,${globalIdx})">
            <div class="match-pair">
              <div class="avatar" style="${avatarStyle(m.a)}">${initials(A.first,A.last)}</div>
              <div class="avatar" style="${avatarStyle(m.b)}">${initials(B.first,B.last)}</div>
            </div>
            <div class="match-names">${A.first} ${A.last[0]}. &amp; ${B.first} ${B.last[0]}.</div>
            <div class="match-meta"><span>${m.date} · ${m.admin}</span><span class="cscore">${m.score}%</span></div>
          </div>`;
        }).join('')}
      </div>
    </div>`;
  }).join('');
}
let dragIdx=null;
function onDragStart(e,idx){ dragIdx=idx; e.dataTransfer.effectAllowed='move'; }
function onDragOver(e){ e.preventDefault(); e.currentTarget.classList.add('dragover'); }
function onDragLeave(e){ e.currentTarget.classList.remove('dragover'); }
function onDrop(e){
  e.preventDefault(); e.currentTarget.classList.remove('dragover');
  const stage = e.currentTarget.dataset.stage;
  if(dragIdx!==null){ matches[dragIdx].stage = stage; dragIdx=null; renderKanban(); }
}
renderKanban();

document.getElementById('matchTimeline').innerHTML = [
  ["Created Match","Suggested by compatibility engine (91%)","Jun 30, 9:02 AM","Esther Mwangi"],
  ["Accepted","Both members accepted the introduction","Jul 1, 4:15 PM","Esther Mwangi"],
  ["Introduction Sent","Formal introduction email sent to both parties","Jul 2, 10:00 AM","Timothy Ochieng"],
  ["First Contact","Members exchanged initial messages","Jul 4, 6:40 PM","System"],
  ["Follow-up","Admin checked in with both members","Jul 9, 1:20 PM","Esther Mwangi"],
].map(([t,n,ti,a],i,arr)=>`
  <div class="timeline-item">
    <div style="display:flex; flex-direction:column; align-items:center;">
      <div class="tdot"></div>${i<arr.length-1?'<div class="tline"></div>':''}
    </div>
    <div class="timeline-content">
      <div class="tt">${t}</div>
      <div class="tn">${n}</div>
      <div class="tm">${ti} · ${a}</div>
    </div>
  </div>`).join('');

/* ============ CONTACTS INBOX ============ */
const contacts = [
  {name:"Miriam Achieng", email:"miriam.a@example.com", subject:"Question about verification timeline", date:"Jul 12", status:"Unread",
   body:"I submitted my profile for verification eight days ago and wanted to check on the status. I have also uploaded my congregation reference letter — please confirm it was received. Thank you for your patient work in this ministry."},
  {name:"Samuel Otieno", email:"samuel.o@example.com", subject:"Unable to upload photo", date:"Jul 11", status:"Unread",
   body:"Every time I try to upload my profile photo the page reloads and the photo does not save. I have tried on two different devices. Could someone assist me, or let me know an email I can send the photo to instead?"},
  {name:"Deborah Adhiambo", email:"deborah.a@example.com", subject:"Requesting a pause on my profile", date:"Jul 10", status:"Complete",
   body:"I would like to pause my profile for the next month while I travel for an assembly assignment. Please do not delete my information, I plan to return in August."},
  {name:"Isaac Kamau", email:"isaac.k@example.com", subject:"Thank you", date:"Jul 8", status:"Complete",
   body:"I wanted to thank the team — my introduction went very well and we have begun a courtship. I appreciate the discretion and care shown throughout this process."},
  {name:"Priscilla Njoki", email:"priscilla.n@example.com", subject:"Update to congregation details", date:"Jul 6", status:"Archived",
   body:"My family has moved and I now attend the Rongai Fellowship congregation. Could you please update my profile to reflect this change?"},
];
let activeContact = 0;
function renderInbox(){
  document.getElementById('inboxList').innerHTML = contacts.map((c,i)=>`
    <div class="inbox-item ${i===activeContact?'active':''}" onclick="selectContact(${i})">
      <div class="inbox-item-top"><span>${c.name}</span><span class="date">${c.date}</span></div>
      <div class="subj">${c.subject}</div>
      <span class="badge ${c.status==='Unread'?'pending':(c.status==='Complete'?'verified':'searching')}">${c.status}</span>
    </div>`).join('');
  renderPreview();
}
function selectContact(i){ activeContact=i; renderInbox(); }
function renderPreview(){
  const c = contacts[activeContact];
  document.getElementById('previewPanel').innerHTML = `
    <h3>${c.subject}</h3>
    <div class="preview-meta">${c.name} · ${c.email} · ${c.date}</div>
    <div class="preview-body">${c.body}</div>
    <div class="preview-actions">
      <button class="btn btn-primary btn-sm">Reply</button>
      <button class="btn btn-ghost btn-sm">Mark Complete</button>
      <button class="btn btn-ghost btn-sm">Archive</button>
    </div>`;
}
renderInbox();

/* ============ NOTIFICATIONS ============ */
const notifGroups = [
  {title:"New Registrations", items:[
    ["Ezra Simiyu created a new profile","10 minutes ago",true],
    ["Rebekah Njeri created a new profile","2 hours ago",true],
  ]},
  {title:"Profile Updates", items:[
    ["Naomi Chebet updated her Spiritual tab","45 minutes ago",true],
    ["Josiah Mwangi added new photos","3 hours ago",false],
  ]},
  {title:"Successful Matches", items:[
    ["Isaac Kamau &amp; Priscilla Njoki reported courtship progress","1 day ago",false],
  ]},
  {title:"Unread Messages", items:[
    ["Miriam Achieng sent a contact form message","Yesterday",true],
    ["Samuel Otieno sent a contact form message","Yesterday",true],
  ]},
  {title:"System Alerts", items:[
    ["Weekly backup completed successfully","6 hours ago",false],
    ["3 profiles flagged for review by the matching engine","1 day ago",true],
  ]},
];
document.getElementById('notifGroups').innerHTML = notifGroups.map(g=>`
  <div class="notif-group">
    <h4>${g.title}</h4>
    <div class="card">
      ${g.items.map(([t,ti,unread])=>`
        <div class="notif-item ${unread?'unread':''}">
          <div class="notif-icon">${ICONS.heart}</div>
          <div class="notif-text">${t}<div class="t">${ti}</div></div>
        </div>`).join('')}
    </div>
  </div>`).join('');

/* ============ ANALYTICS CHARTS ============ */
function drawBarChart(){
  const data = [62,74,58,90,101,88,112,96,120,134,118,142];
  const labels = ["J","F","M","A","M","J","J","A","S","O","N","D"];
  const w=600,h=220, pad=30, bw= (w-pad*2)/data.length - 8;
  const max = Math.max(...data);
  let svg = '';
  data.forEach((v,i)=>{
    const bh = (v/max)*(h-50);
    const x = pad + i*((w-pad*2)/data.length);
    const y = h-40-bh;
    svg += `<rect x="${x}" y="${y}" width="${bw}" height="${bh}" rx="4" fill="url(#barGrad)"/>`;
    svg += `<text x="${x+bw/2}" y="${h-18}" font-size="10" fill="#B9ADA6" text-anchor="middle" font-family="Inter">${labels[i]}</text>`;
  });
  document.getElementById('barChart').innerHTML = `
    <defs><linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#E4C374"/><stop offset="100%" stop-color="#8a6420"/>
    </linearGradient></defs>${svg}`;
}
function donut(id, pct, color1, color2, showBg=true){
  const r=80,cx=100,cy=100,circ=2*Math.PI*r;
  const off = circ*(1-pct/100);
  document.getElementById(id).innerHTML = `
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="rgba(248,243,236,0.08)" stroke-width="18"/>
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${color1}" stroke-width="18"
      stroke-dasharray="${circ}" stroke-dashoffset="${off}" stroke-linecap="round" transform="rotate(-90 ${cx} ${cy})"/>
  `;
}
function drawAgeChart(){
  const data=[{r:"18–25",v:210},{r:"26–35",v:410},{r:"36–45",v:340},{r:"46–55",v:180},{r:"56+",v:110}];
  const w=600,h=180,pad=40,bw=70;
  const max=Math.max(...data.map(d=>d.v));
  let svg='';
  data.forEach((d,i)=>{
    const bh=(d.v/max)*(h-50);
    const x= pad + i*((w-pad*2)/data.length) + 10;
    const y= h-40-bh;
    svg+=`<rect x="${x}" y="${y}" width="${bw}" height="${bh}" rx="6" fill="rgba(200,154,61,0.18)" stroke="#C89A3D" stroke-width="1.2"/>`;
    svg+=`<text x="${x+bw/2}" y="${h-18}" font-size="11" fill="#B9ADA6" text-anchor="middle" font-family="Inter">${d.r}</text>`;
    svg+=`<text x="${x+bw/2}" y="${y-8}" font-size="11" fill="#F8F3EC" text-anchor="middle" font-family="DM Sans">${d.v}</text>`;
  });
  document.getElementById('ageChart').innerHTML = svg;
}
drawBarChart();
donut('donutChart', 51, '#C89A3D', '#E4C374');
drawAgeChart();
donut('approvalDonut', 92, '#2E8B57');

document.getElementById('countryList').innerHTML = [
  ["Kenya",520],["Uganda",286],["Nigeria",198],["Tanzania",140],["South Africa",68],["Ghana",38]
].map(([c,v])=>`<div class="mini-stat-row"><span>${c}</span><span class="v">${v}</span></div>`).join('');

document.getElementById('congList').innerHTML = [
  ["Kilimani English",64],["Westlands Swahili",57],["South B Central",49],["Runda North",41],["Karen Hills",33]
].map(([c,v])=>`<div class="mini-stat-row"><span>${c}</span><span class="v">${v} members</span></div>`).join('');

/* Reports shared render */
const reportDefs = [
  ["Member Report","Full roster with verification and demographic breakdowns.",ICONS.users],
  ["Match Report","All matches by stage, score, and outcome.",ICONS.heart],
  ["Contact Report","Contact submissions and resolution times.",ICONS.mail],
  ["Admin Activity","Audit log of administrator actions.",ICONS.clock],
  ["Registration Report","New sign-ups over any date range.",ICONS.users],
];
function reportCardsHTML(){
  return reportDefs.map(([t,d,icon])=>`
    <div class="card report-card">
      <div class="rt-icon">${icon}</div>
      <div>
        <div style="font-weight:600; font-size:14px; margin-bottom:4px;">${t}</div>
        <div style="font-size:12px; color:var(--text-muted);">${d}</div>
      </div>
      <div class="export-row">
        <button class="btn btn-ghost btn-sm">PDF</button>
        <button class="btn btn-ghost btn-sm">Excel</button>
        <button class="btn btn-ghost btn-sm">CSV</button>
      </div>
    </div>`).join('');
}
document.getElementById('reportGrid').innerHTML = reportCardsHTML();
document.getElementById('view-reports-inline').innerHTML = `<div class="report-grid">${reportCardsHTML()}</div>`;

/* ============ ADMINISTRATORS ============ */
const admins = [
  ["Esther Mwangi","Lead Administrator","East Africa","2 minutes ago","Active"],
  ["Timothy Ochieng","Matchmaking Coordinator","East Africa","1 hour ago","Active"],
  ["Joel Barasa","Verification Officer","West Africa","Yesterday","Active"],
  ["Hannah Auma","Support Administrator","Southern Africa","3 days ago","Inactive"],
];
document.getElementById('adminTbody').innerHTML = admins.map(([n,r,reg,la,st])=>{
  const parts=n.split(" ");
  return `<tr>
    <td><div class="avatar" style="${avatarStyle(n.length)}">${initials(parts[0],parts[1])}</div></td>
    <td>${n}</td><td>${r}</td><td>${reg}</td><td>${la}</td>
    <td><span class="badge ${st==='Active'?'verified':'suspended'}">${st}</span></td>
    <td><div class="row-actions"><button title="Edit">${ICONS.edit}</button><button title="Remove" class="danger">${ICONS.trash}</button></div></td>
  </tr>`;
}).join('');

/* ============ SETTINGS ============ */
const settingsSections = {
  "General": [
    ["Platform Name","JW Courtship Advisory — appears in emails and headers",false],
    ["Maintenance Mode","Temporarily disable public access to the site",false],
  ],
  "Email Templates": [
    ["Welcome Email","Sent when a new profile is created",true],
    ["Match Introduction","Sent when a new match is proposed",true],
    ["Verification Approved","Sent once a profile passes review",true],
  ],
  "Notifications": [
    ["New Registration Alerts","Notify admins when a member signs up",true],
    ["Contact Form Alerts","Notify admins of new contact submissions",true],
    ["Weekly Digest","Send a weekly summary to all administrators",false],
  ],
  "Matching Rules": [
    ["Require Congregation Reference","Members must supply a reference before matching",true],
    ["Auto-suggest Matches","Let the compatibility engine suggest matches automatically",true],
    ["Minimum Age Gap Enforcement","Restrict suggested matches to a configured age range",false],
  ],
  "Permissions": [
    ["Allow Coordinators to Suspend Profiles","Extend suspension rights beyond Lead Administrators",false],
    ["Allow Coordinators to Delete Profiles","Extend deletion rights beyond Lead Administrators",false],
  ],
  "Backup": [
    ["Daily Automatic Backup","Back up the database every night at 2:00 AM",true],
    ["Offsite Backup Copy","Store an encrypted copy in secondary storage",true],
  ],
  "Security": [
    ["Two-Factor Authentication","Require 2FA for all administrator accounts",true],
    ["Session Timeout (30 min)","Automatically sign out inactive administrators",true],
  ],
};
let activeSettingsTab = "General";
function renderSettings(){
  document.getElementById('settingsNav').innerHTML = Object.keys(settingsSections).map(s=>
    `<div class="settings-nav-item ${s===activeSettingsTab?'active':''}" onclick="activeSettingsTab='${s}'; renderSettings();">${s}</div>`
  ).join('');
  document.getElementById('settingsPanel').innerHTML = `
    <h3 style="margin-bottom:18px;">${activeSettingsTab}</h3>
    ${settingsSections[activeSettingsTab].map(([lbl,desc,on],i)=>`
      <div class="toggle-row">
        <div><div class="lbl">${lbl}</div><div class="desc">${desc}</div></div>
        <div class="switch ${on?'on':''}" onclick="this.classList.toggle('on')"></div>
      </div>`).join('')}
    <div style="margin-top:22px; display:flex; justify-content:flex-end;">
      <button class="btn btn-primary">Save Changes</button>
    </div>`;
}
renderSettings();

/* ============ PROFILE MODAL ============ */
const modalTabs = ["Personal","Spiritual","Lifestyle","Photos","Preferences","Notes","Match History"];
let activeModalTab = "Personal";
let currentMember = null;
function openProfile(id){
  currentMember = members.find(m=>m.id===id) || members[0];
  activeModalTab = "Personal";
  document.getElementById('mHeadAvatar').style.cssText += avatarStyle(currentMember.age);
  document.getElementById('mHeadAvatar').textContent = initials(currentMember.first, currentMember.last);
  document.getElementById('mHeadName').textContent = `${currentMember.first} ${currentMember.last}`;
  document.getElementById('mHeadMeta').innerHTML = `${currentMember.id} · <span class="badge ${currentMember.status.toLowerCase()}">${currentMember.status}</span> · ${currentMember.age}, ${currentMember.city}`;
  renderModalTabs();
  document.getElementById('profileModal').classList.add('open');
}
function closeModal(){ document.getElementById('profileModal').classList.remove('open'); }
function renderModalTabs(){
  document.getElementById('mTabs').innerHTML = modalTabs.map(t=>
    `<div class="modal-tab ${t===activeModalTab?'active':''}" onclick="activeModalTab='${t}'; renderModalTabs();">${t}</div>`
  ).join('');
  const m = currentMember;
  let body = '';
  if(activeModalTab==="Personal"){
    body = `<div class="mp-grid">
      <div class="mp-field"><div class="k">Full Name</div><div class="v">${m.first} ${m.last}</div></div>
      <div class="mp-field"><div class="k">Gender</div><div class="v">${m.gender}</div></div>
      <div class="mp-field"><div class="k">Age</div><div class="v">${m.age}</div></div>
      <div class="mp-field"><div class="k">Location</div><div class="v">${m.city}, ${m.country}</div></div>
      <div class="mp-field"><div class="k">Congregation</div><div class="v">${m.congregation}</div></div>
      <div class="mp-field"><div class="k">Date Joined</div><div class="v">${m.joined}</div></div>
    </div>`;
  } else if(activeModalTab==="Spiritual"){
    body = `<div class="mp-grid">
      <div class="mp-field"><div class="k">Baptized</div><div class="v">${m.baptized}</div></div>
      <div class="mp-field"><div class="k">Pioneer</div><div class="v">${m.pioneer}</div></div>
      <div class="mp-field"><div class="k">Meeting Attendance</div><div class="v">Regular</div></div>
      <div class="mp-field"><div class="k">Congregation</div><div class="v">${m.congregation}</div></div>
    </div>`;
  } else if(activeModalTab==="Lifestyle"){
    body = `<p class="bio" style="margin-bottom:14px;">${m.bio}</p>
      <div class="pill-tag">Hospitality</div><div class="pill-tag">Nature Walks</div><div class="pill-tag">Music</div><div class="pill-tag">Family-Oriented</div>`;
  } else if(activeModalTab==="Photos"){
    body = `<div style="display:grid; grid-template-columns:repeat(4,1fr); gap:10px;">
      ${[0,1,2,3].map(i=>`<div class="avatar" style="width:100%; height:120px; border-radius:12px; font-size:24px; ${avatarStyle(m.age+i)}">${initials(m.first,m.last)}</div>`).join('')}
    </div>`;
  } else if(activeModalTab==="Preferences"){
    body = `<div class="mp-grid">
      <div class="mp-field"><div class="k">Age Preference</div><div class="v">Within 6 years</div></div>
      <div class="mp-field"><div class="k">Distance</div><div class="v">Within 60 miles</div></div>
      <div class="mp-field"><div class="k">Children</div><div class="v">Wants children</div></div>
      <div class="mp-field"><div class="k">Marriage Timeline</div><div class="v">1–2 years</div></div>
    </div>`;
  } else if(activeModalTab==="Notes"){
    body = `<div class="card" style="padding:16px; margin-bottom:12px;">
      <div style="display:flex; justify-content:space-between; font-size:11.5px; color:var(--text-muted); margin-bottom:8px;"><span>Esther Mwangi</span><span>Jul 9, 2026</span></div>
      <div style="font-size:13px;">Reference letter confirmed with congregation elder. Cleared for matching.</div>
    </div>
    <div class="card" style="padding:16px;">
      <div style="display:flex; justify-content:space-between; font-size:11.5px; color:var(--text-muted); margin-bottom:8px;"><span>Follow-up Reminder</span><span>Jul 20, 2026</span></div>
      <div style="font-size:13px;">Check in after first introduction.</div>
    </div>`;
  } else if(activeModalTab==="Match History"){
    body = `<div id="mpTimeline"></div>`;
  }
  document.getElementById('mBody').innerHTML = body;
  if(activeModalTab==="Match History"){
    document.getElementById('mpTimeline').innerHTML = [
      ["Match Suggested","Paired based on 88% compatibility","Jun 12, 2026"],
      ["Introduction Sent","Both parties notified","Jun 14, 2026"],
      ["Conversation Ongoing","Weekly check-ins scheduled","Jun 20, 2026"],
    ].map(([t,n,ti],i,arr)=>`
      <div class="timeline-item">
        <div style="display:flex; flex-direction:column; align-items:center;"><div class="tdot"></div>${i<arr.length-1?'<div class="tline"></div>':''}</div>
        <div class="timeline-content"><div class="tt">${t}</div><div class="tn">${n}</div><div class="tm">${ti}</div></div>
      </div>`).join('');
  }
}
document.getElementById('profileModal').addEventListener('click', e=>{ if(e.target.id==='profileModal') closeModal(); });
