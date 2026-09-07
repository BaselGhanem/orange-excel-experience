(async()=>{
  const [appModule,firestoreModule]=await Promise.all([
    import(`https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js`),
    import(`https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js`)
  ]);
  const {initializeApp,getApps,getApp}=appModule;
  const {getFirestore,doc,onSnapshot,collection,addDoc,setDoc,serverTimestamp}=firestoreModule;
  const firebaseConfig={apiKey:`AIzaSyDmkPioDg5ZewsX2ANM1hAqgVWyzLeezeU`,authDomain:`mobilehub-4eb1d.firebaseapp.com`,projectId:`mobilehub-4eb1d`,storageBucket:`mobilehub-4eb1d.firebasestorage.app`,messagingSenderId:`13420871425`,appId:`1:13420871425:web:e253fe9c5aebbc5925a500`};
  const app=getApps().length?getApp():initializeApp(firebaseConfig);
  const db=getFirestore(app);
  const pageDay=Number((location.pathname.match(/day-(\d)/)||[])[1]||0);
  const DEFAULT={currentFile:``,pulse:{enabled:false,id:``,question:`كيف الوضع؟`,options:[{value:`good`,label:`تمام 👍`},{value:`repeat`,label:`بدنا إعادة نقطة`},{value:`faster`,label:`ممكن أسرع شوي`}]},breakMode:{enabled:false,returnTime:``}};
  let live={...DEFAULT};
  const esc=(s)=>String(s??``).replace(/[&<>"']/g,(c)=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]));
  const visitorId=(()=>{let id=localStorage.getItem(`orangeExcelVisitorId`);if(!id){id=`v_${crypto.randomUUID()}`;localStorage.setItem(`orangeExcelVisitorId`,id)}return id})();
  document.head.insertAdjacentHTML(`beforeend`,`<link rel="stylesheet" href="${pageDay?`../`:``}css/live-experience.css">`);
  const nav=document.querySelector(`.nav`);
  const bar=document.createElement(`div`);bar.className=`lx-livebar`;bar.innerHTML=`<div class="lx-livebar__inner"><div class="lx-session"><span class="lx-dot"></span><span id="lxSession">LIVE TRAINING</span></div><div class="lx-track"><span id="lxProgress"></span></div><div class="lx-now-next"><div class="lx-state now"><small>NOW</small><b id="lxNow">—</b></div><div class="lx-state next"><small>NEXT</small><b id="lxNext">—</b></div></div></div>`;
  nav?.insertAdjacentElement(`afterend`,bar);
  document.body.insertAdjacentHTML(`beforeend`,`
    <div class="lx-fab-stack"><button id="lxQuestionBtn" class="lx-fab primary" type="button">?<span>اسأل المدرب</span></button></div>
    <div id="lxQuestionModal" class="lx-modal"><div class="lx-dialog"><h3>اسأل المدرب</h3><p>السؤال يصل للمدرب بدون اسمك.</p><textarea id="lxQuestionText" class="lx-textarea" maxlength="500" placeholder="اكتب سؤالك هنا..."></textarea><div class="lx-actions"><button class="lx-action" data-close="question">إلغاء</button><button id="lxQuestionSend" class="lx-action primary">إرسال</button></div></div></div>
    <div id="lxPulseModal" class="lx-modal"><div class="lx-dialog"><h3 id="lxPulseQuestion">كيف الوضع؟</h3><p>اختَر أقرب جواب لوضعك الآن.</p><div id="lxPulseBody" class="lx-pulse-options"></div></div></div>
    <div id="lxBreak" class="lx-break"><div class="lx-break-card"><span class="lx-break-tag">CODERZ × ORANGE • BREAK</span><h1>Break.</h1><p>خذ استراحة وارجع جاهز للجولة التالية.</p><div id="lxBreakTime" class="lx-break-time"></div><div id="lxBreakCountdown" class="lx-break-countdown"></div></div></div>
    <div id="lxToast" class="lx-toast"></div>`);
  const $=(id)=>document.getElementById(id);
  const toast=(t)=>{const x=$(`lxToast`);x.textContent=t;x.classList.add(`show`);clearTimeout(window.__lxt);window.__lxt=setTimeout(()=>x.classList.remove(`show`),1700)};
  const questionModal=$(`lxQuestionModal`),pulseModal=$(`lxPulseModal`);
  $(`lxQuestionBtn`).onclick=()=>questionModal.classList.add(`show`);
  document.querySelector(`[data-close="question"]`).onclick=()=>questionModal.classList.remove(`show`);
  questionModal.addEventListener(`click`,e=>{if(e.target===questionModal)questionModal.classList.remove(`show`)});
  $(`lxQuestionSend`).onclick=async()=>{const text=$(`lxQuestionText`).value.trim();if(!text)return;try{await addDoc(collection(db,`orangeExcelQuestions`),{text,visitorId,page:location.pathname,createdAt:serverTimestamp(),status:`new`});$(`lxQuestionText`).value=``;questionModal.classList.remove(`show`);toast(`تم إرسال سؤالك`)}catch(e){console.error(`Question submission failed`,e);toast(`تعذر إرسال السؤال — تحقق من Firestore Rules`)}};
  
  const renderPulse=()=>{
    const p=live.pulse||{};if(!p.enabled||!p.id){pulseModal.classList.remove(`show`);return}
    const key=`orangePulse_${p.id}`;const answered=localStorage.getItem(key);
    $(`lxPulseQuestion`).textContent=p.question||`كيف الوضع؟`;
    if(answered){$(`lxPulseBody`).innerHTML=`<div class="lx-pulse-done">تم تسجيل إجابتك ✓</div>`;pulseModal.classList.remove(`show`);return}
    const options=Array.isArray(p.options)&&p.options.length?p.options:DEFAULT.pulse.options;$(`lxPulseBody`).innerHTML=options.map((o)=>`<button class="lx-pulse-option" data-pulse="${esc(o.value)}">${esc(o.label)}</button>`).join(``);
    $(`lxPulseBody`).querySelectorAll(`[data-pulse]`).forEach(btn=>btn.onclick=async()=>{try{await setDoc(doc(db,`orangeExcelPulseResponses`,`${p.id}_${visitorId}`),{pulseId:p.id,answer:btn.dataset.pulse,visitorId,createdAt:serverTimestamp()});localStorage.setItem(key,btn.dataset.pulse);pulseModal.classList.remove(`show`);toast(`شكراً — وصلت للمدرب`)}catch(e){console.error(`Pulse submission failed`,e);toast(`تعذر تسجيل الإجابة — تحقق من Firestore Rules`)}});
    pulseModal.classList.add(`show`);
  };
  let breakTimer=null;
  const formatTime12=(value)=>{const [h,m]=String(value||``).split(`:`).map(Number);if(!Number.isFinite(h)||!Number.isFinite(m))return String(value||``);const period=h>=12?`PM`:`AM`;const hour=h%12||12;return `${hour}:${String(m).padStart(2,`0`)} ${period}`};
  const renderBreak=()=>{const b=live.breakMode||{};$(`lxBreak`).classList.toggle(`show`,!!b.enabled);$(`lxBreakTime`).textContent=b.returnTime?`Back at ${esc(formatTime12(b.returnTime))}`:``;clearInterval(breakTimer);if(!b.enabled||!b.returnTime){$(`lxBreakCountdown`).textContent=``;return}const tick=()=>{const [h,m]=b.returnTime.split(`:`).map(Number);const now=new Date();const target=new Date();target.setHours(h,m,0,0);if(target<now)target.setDate(target.getDate()+1);const diff=Math.max(0,target-now);const mm=Math.floor(diff/60000),ss=Math.floor((diff%60000)/1000);$(`lxBreakCountdown`).textContent=`${String(mm).padStart(2,`0`)}:${String(ss).padStart(2,`0`)}`};tick();breakTimer=setInterval(tick,1000)};
  const highlightFile=()=>{document.querySelectorAll(`.file`).forEach(el=>el.classList.remove(`lx-file-current`));if(!live.currentFile)return;const el=document.getElementById(live.currentFile);if(el){el.classList.add(`lx-file-current`);if(!el.classList.contains(`show`))el.classList.add(`show`)}};
  let configuredDay=1;
  const getAutoProgress=()=>{const now=new Date();const start=new Date(now);start.setHours(9,0,0,0);const end=new Date(now);end.setHours(15,0,0,0);const total=end-start;const elapsed=now-start;const progress=Math.max(0,Math.min(100,(elapsed/total)*100));let nowText=`Training in progress`;let nextText=``;if(now<start){nowText=`Before training`;nextText=`Starts at 9:00 AM`}else if(now>=end){nowText=`Training day complete`;nextText=`Completed`}else{const mins=Math.ceil((end-now)/60000);const h=Math.floor(mins/60),m=mins%60;nextText=h?`${h}h ${m}m remaining`:`${m}m remaining`}return{progress,nowText,nextText,time:now.toLocaleTimeString([], {hour:`2-digit`,minute:`2-digit`})}};
  const renderAutoProgress=()=>{const a=getAutoProgress();const day=pageDay||configuredDay||1;$(`lxSession`).textContent=`DAY ${day} • 09:00 AM – 03:00 PM`;$(`lxProgress`).style.width=`${a.progress}%`;$(`lxNow`).textContent=`${a.time} • ${Math.round(a.progress)}%`;$(`lxNext`).textContent=a.nextText};
  const render=()=>{renderAutoProgress();highlightFile();renderPulse();renderBreak()};
  onSnapshot(doc(db,`orangeExcelConfig`,`site`),(snap)=>{const raw=snap.exists()?snap.data():{};const openDay=[1,2,3].find((day)=>raw.dayVisibility?.[`day${day}`]);configuredDay=openDay||configuredDay||1;live={...DEFAULT,...(raw.liveExperience||{}),pulse:{...DEFAULT.pulse,...(raw.liveExperience?.pulse||{})},breakMode:{...DEFAULT.breakMode,...(raw.liveExperience?.breakMode||{})}};render()});
  setInterval(renderAutoProgress,15000);
  let heartbeatWarned=false;const heartbeat=async()=>{try{await setDoc(doc(db,`orangeExcelPresence`,visitorId),{visitorId,page:location.pathname,day:pageDay,lastSeen:serverTimestamp()},{merge:true});heartbeatWarned=false}catch(e){if(!heartbeatWarned){console.warn(`Presence heartbeat blocked. Publish the updated Firestore rules.`,e);heartbeatWarned=true}}};heartbeat();setInterval(heartbeat,45000);
})();
