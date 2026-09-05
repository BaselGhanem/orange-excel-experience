const [appModule,firestoreModule]=await Promise.all([
  import(`https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js`),
  import(`https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js`)
]);
const {initializeApp}=appModule;
const {getFirestore,collection,getDocs,doc,getDoc,setDoc,deleteDoc,serverTimestamp}=firestoreModule;
const firebaseConfig={apiKey:`AIzaSyDmkPioDg5ZewsX2ANM1hAqgVWyzLeezeU`,authDomain:`mobilehub-4eb1d.firebaseapp.com`,projectId:`mobilehub-4eb1d`,storageBucket:`mobilehub-4eb1d.firebasestorage.app`,messagingSenderId:`13420871425`,appId:`1:13420871425:web:e253fe9c5aebbc5925a500`,measurementId:`G-RYWYCQXBT8`};
const db=getFirestore(initializeApp(firebaseConfig));
const COLLECTION=`orangeExcelAssessments`;
const CONFIG_COLLECTION=`orangeExcelConfig`;
const CONFIG_DOC=`site`;
const SESSION=`coderzOrangeAdminSession`;
const PIN_HASH=`9060ce5653093cd9bff480cb01ff0e3a790e6f545e214a3dd85841daabac7848`;
const FILES={
  d1f1:{day:1,title:`Advanced Formulas & Logical Functions`,sub:`Customer Care / Operations`},
  d1f2:{day:1,title:`XLOOKUP & Dynamic Arrays`,sub:`HR`},
  d1f3:{day:1,title:`Advanced Text & Date Functions`,sub:`Cross-Department`},
  d1f4:{day:1,title:`Day 1 Integrated Assignment`,sub:`Team Practice`},
  d2f1:{day:2,title:`PivotTable — 20-Second Report`,sub:`Commercial / Management`},
  d2f2:{day:2,title:`Power Query Data Factory`,sub:`Cross-Department`},
  d2f3:{day:2,title:`Power Query Source Pack`,sub:`ZIP Source Files`},
  d2f4:{day:2,title:`Network Alert Engine`,sub:`Network / Technical Operations`},
  d2f5:{day:2,title:`Day 2 Final Challenge`,sub:`Integrated Practice`},
  d3f1:{day:3,title:`Interactive Dashboard`,sub:`Commercial / Management`},
  d3f2:{day:3,title:`Macros + Protection`,sub:`Finance / Back Office`},
  d3f3:{day:3,title:`Final Executive Dashboard Challenge`,sub:`Final Course Challenge`}
};
const DAY_INFO={1:{title:`Day 1`,sub:`Formulas • XLOOKUP • Text & Dates`},2:{title:`Day 2`,sub:`PivotTables • Power Query • Alerts`},3:{title:`Day 3`,sub:`Dashboards • Automation • Final Challenge`}};
const DEFAULT_FILES=Object.fromEntries(Object.keys(FILES).map((id)=>[id,false]));
const DEFAULT_CONFIG={siteLive:true,announcementEnabled:false,announcementText:``,assessmentEnabled:true,assessmentPhase:`pre`,dayVisibility:{day1:false,day2:false,day3:false},files:DEFAULT_FILES};
let config={...DEFAULT_CONFIG,dayVisibility:{...DEFAULT_CONFIG.dayVisibility},files:{...DEFAULT_FILES}};
let attempts=[];
const $=(id)=>document.getElementById(id);
const norm=(raw={})=>({...DEFAULT_CONFIG,...raw,dayVisibility:{...DEFAULT_CONFIG.dayVisibility,...(raw.dayVisibility||{})},files:{...DEFAULT_FILES,...(raw.files||{})}});
const toast=(text)=>{$(`toast`).textContent=text;$(`toast`).classList.add(`show`);clearTimeout(window.__toast);window.__toast=setTimeout(()=>$(`toast`).classList.remove(`show`),1800)};
const hash=async(text)=>{const buffer=await crypto.subtle.digest(`SHA-256`,new TextEncoder().encode(text));return Array.from(new Uint8Array(buffer)).map((b)=>b.toString(16).padStart(2,`0`)).join(``)};
const save=async(patch,message=`تم الحفظ`)=>{config=norm({...config,...patch});await setDoc(doc(db,CONFIG_COLLECTION,CONFIG_DOC),{...patch,updatedAt:serverTimestamp()},{merge:true});renderAll();toast(message)};
const loadConfig=async()=>{const snap=await getDoc(doc(db,CONFIG_COLLECTION,CONFIG_DOC));config=norm(snap.exists()?snap.data():{});if(!snap.exists())await setDoc(doc(db,CONFIG_COLLECTION,CONFIG_DOC),config)};
const countOpenDays=()=>Object.values(config.dayVisibility).filter(Boolean).length;
const countOpenFiles=()=>Object.values(config.files).filter(Boolean).length;
const renderStatus=()=>{$(`statusDays`).textContent=`${countOpenDays()} Days Open`;$(`statusFiles`).textContent=`${countOpenFiles()} Files Open`;$(`statusAssessment`).textContent=config.assessmentEnabled?config.assessmentPhase.toUpperCase():`CLOSED`};
const toggleDay=async(day,open)=>{const dayVisibility={...config.dayVisibility,[`day${day}`]:open};await save({dayVisibility},open?`${DAY_INFO[day].title} ظاهر الآن`:`${DAY_INFO[day].title} مخفي`)};
const toggleFile=async(id,open)=>{const files={...config.files,[id]:open};await save({files},open?`تم إظهار الملف`:`تم إخفاء الملف`)};
const renderDays=()=>{const box=$(`dayCards`);box.innerHTML=``;[1,2,3].forEach((day)=>{const open=!!config.dayVisibility[`day${day}`];const card=document.createElement(`article`);card.className=`day-card${open?` open`:``}`;const rows=Object.entries(FILES).filter(([,f])=>f.day===day).map(([id,f])=>`<div class="file-row"><div><b>${f.title}</b><small>${f.sub}</small></div><label class="switch"><input type="checkbox" data-file="${id}" ${config.files[id]?`checked`:``}><span class="slider"></span></label></div>`).join(``);card.innerHTML=`<div class="day-head"><div><h2>${DAY_INFO[day].title}</h2><p>${DAY_INFO[day].sub}</p></div><label class="switch"><input type="checkbox" data-day="${day}" ${open?`checked`:``}><span class="slider"></span></label></div><a class="day-link" href="../../day-${day}/" target="_blank"><span>فتح رابط ${DAY_INFO[day].title}</span><i data-lucide="external-link" size="13"></i></a><div class="files">${rows}</div>`;box.appendChild(card)});box.querySelectorAll(`[data-day]`).forEach((input)=>input.addEventListener(`change`,()=>toggleDay(Number(input.dataset.day),input.checked)));box.querySelectorAll(`[data-file]`).forEach((input)=>input.addEventListener(`change`,()=>toggleFile(input.dataset.file,input.checked)));lucide.createIcons()};
const setAssessment=async(mode)=>save({assessmentPhase:mode,assessmentEnabled:mode!==`closed`},mode===`pre`?`PRE مفتوح`:mode===`post`?`POST مفتوح`:`التقييم مغلق`);
const renderAssessment=()=>{const phase=config.assessmentEnabled?config.assessmentPhase:`closed`;document.querySelectorAll(`[data-assess]`).forEach((b)=>b.classList.toggle(`active`,b.dataset.assess===phase))};
const renderSite=()=>{$(`announcementText`).value=config.announcementText||``;$(`announcementEnabled`).checked=!!config.announcementEnabled};
const groupPeople=()=>{const map=new Map();attempts.forEach((a)=>{const key=(a.fullName||`Unknown`).trim().toLowerCase();if(!map.has(key))map.set(key,{name:a.fullName||`Unknown`,pre:null,post:null});const person=map.get(key);if(a.mode===`pre`)person.pre=a;if(a.mode===`post`)person.post=a});return [...map.values()].sort((a,b)=>a.name.localeCompare(b.name,`ar`))};
const avg=(arr)=>arr.length?(arr.reduce((s,v)=>s+v,0)/arr.length).toFixed(1):`—`;
const renderResults=()=>{const people=groupPeople();const term=($(`search`).value||``).trim().toLowerCase();const visible=people.filter((p)=>p.name.toLowerCase().includes(term));$(`mPeople`).textContent=people.length;$(`mPre`).textContent=avg(people.filter((p)=>p.pre).map((p)=>Number(p.pre.score||0)));$(`mPost`).textContent=avg(people.filter((p)=>p.post).map((p)=>Number(p.post.score||0)));$(`mGain`).textContent=avg(people.filter((p)=>p.pre&&p.post).map((p)=>Number(p.post.score||0)-Number(p.pre.score||0)));$(`resultsBody`).innerHTML=visible.map((p)=>{const pre=p.pre?Number(p.pre.score||0):null,post=p.post?Number(p.post.score||0):null,gain=pre!==null&&post!==null?post-pre:null;return `<tr><td><b>${p.name}</b></td><td>${pre===null?`—`:`${pre}/15`}</td><td>${post===null?`—`:`${post}/15`}</td><td>${gain===null?`—`:gain>0?`+${gain}`:gain}</td><td><div class="actions">${p.pre?`<button class="btn danger small" data-delete="${p.pre.id}">حذف PRE</button>`:``}${p.post?`<button class="btn danger small" data-delete="${p.post.id}">حذف POST</button>`:``}</div></td></tr>`}).join(``);document.querySelectorAll(`[data-delete]`).forEach((b)=>b.addEventListener(`click`,async()=>{if(!confirm(`حذف هذه النتيجة؟`))return;await deleteDoc(doc(db,COLLECTION,b.dataset.delete));await loadResults();toast(`تم الحذف`)}))};
const loadResults=async()=>{const snap=await getDocs(collection(db,COLLECTION));attempts=snap.docs.map((d)=>({id:d.id,...d.data()}));renderResults()};
const exportCSV=()=>{const people=groupPeople();const rows=[[`Participant`,`Pre`,`Post`,`Gain`],...people.map((p)=>{const pre=p.pre?Number(p.pre.score||0):``,post=p.post?Number(p.post.score||0):``;return [p.name,pre,post,pre!==``&&post!==``?post-pre:``]})];const csv=rows.map((r)=>r.map((v)=>`"${String(v).replaceAll(`"`,`""`)}"`).join(`,`)).join(`\n`);const blob=new Blob([`\uFEFF${csv}`],{type:`text/csv;charset=utf-8`});const a=document.createElement(`a`);a.href=URL.createObjectURL(blob);a.download=`orange-excel-results.csv`;a.click();URL.revokeObjectURL(a.href)};
const renderAll=()=>{renderStatus();renderDays();renderAssessment();renderSite()};
const showAdmin=async()=>{$(`loginView`).classList.add(`hidden`);$(`adminView`).classList.remove(`hidden`);await loadConfig();renderAll();await loadResults();lucide.createIcons()};
const login=async()=>{const value=$(`pin`).value.trim();if(await hash(value)!==PIN_HASH){$(`loginError`).textContent=`الرمز غير صحيح.`;return}sessionStorage.setItem(SESSION,`1`);await showAdmin()};
$(`loginBtn`).addEventListener(`click`,login);$(`pin`).addEventListener(`keydown`,(e)=>{if(e.key===`Enter`)login()});$(`logout`).addEventListener(`click`,()=>{sessionStorage.removeItem(SESSION);location.reload()});
document.querySelectorAll(`.tab`).forEach((b)=>b.addEventListener(`click`,()=>{document.querySelectorAll(`.tab`).forEach((x)=>x.classList.remove(`active`));document.querySelectorAll(`.panel`).forEach((x)=>x.classList.remove(`active`));b.classList.add(`active`);$(`panel-${b.dataset.tab}`).classList.add(`active`)}));
document.querySelectorAll(`[data-assess]`).forEach((b)=>b.addEventListener(`click`,()=>setAssessment(b.dataset.assess)));
$(`saveAnnouncement`).addEventListener(`click`,()=>save({announcementEnabled:$(`announcementEnabled`).checked,announcementText:$(`announcementText`).value.trim()},`تم حفظ الرسالة`));
$(`hideAllDays`).addEventListener(`click`,()=>save({dayVisibility:{day1:false,day2:false,day3:false}},`تم إخفاء كل الأيام`));
$(`hideAllFiles`).addEventListener(`click`,()=>save({files:{...DEFAULT_FILES}},`تم إخفاء كل الملفات`));
$(`search`).addEventListener(`input`,renderResults);$(`reloadResults`).addEventListener(`click`,loadResults);$(`export`).addEventListener(`click`,exportCSV);
if(sessionStorage.getItem(SESSION)===`1`)showAdmin();
lucide.createIcons();