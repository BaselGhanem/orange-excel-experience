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
  const DEFAULT={activeDay:1,sessionLabel:`Session 1 of 4`,progress:0,now:`Welcome`,next:`Advanced Excel`,currentFile:``,pulse:{enabled:false,id:``,question:`كيف الوضع؟`},breakMode:{enabled:false,returnTime:``}};
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
  const pulseOptions=[[`good`,`تمام 👍`],[`repeat`,`بدنا إعادة نقطة`],[`faster`,`ممكن أسرع شوي`]];
  const renderPulse=()=>{
    const p=live.pulse||{};if(!p.enabled||!p.id){pulseModal.classList.remove(`show`);return}
    const key=`orangePulse_${p.id}`;const answered=localStorage.getItem(key);
    $(`lxPulseQuestion`).textContent=p.question||`كيف الوضع؟`;
    if(answered){$(`lxPulseBody`).innerHTML=`<div class="lx-pulse-done">تم تسجيل إجابتك ✓</div>`;pulseModal.classList.remove(`show`);return}
    $(`lxPulseBody`).innerHTML=pulseOptions.map(([v,l])=>`<button class="lx-pulse-option" data-pulse="${v}">${l}</button>`).join(``);
    $(`lxPulseBody`).querySelectorAll(`[data-pulse]`).forEach(btn=>btn.onclick=async()=>{try{await setDoc(doc(db,`orangeExcelPulseResponses`,`${p.id}_${visitorId}`),{pulseId:p.id,answer:btn.dataset.pulse,visitorId,createdAt:serverTimestamp()});localStorage.setItem(key,btn.dataset.pulse);pulseModal.classList.remove(`show`);toast(`شكراً — وصلت للمدرب`)}catch(e){console.error(`Pulse submission failed`,e);toast(`تعذر تسجيل الإجابة — تحقق من Firestore Rules`)}});
    pulseModal.classList.add(`show`);
  };
  let breakTimer=null;
  const renderBreak=()=>{const b=live.breakMode||{};$(`lxBreak`).classList.toggle(`show`,!!b.enabled);$(`lxBreakTime`).textContent=b.returnTime?`Back at ${esc(b.returnTime)}`:``;clearInterval(breakTimer);if(!b.enabled||!b.returnTime){$(`lxBreakCountdown`).textContent=``;return}const tick=()=>{const [h,m]=b.returnTime.split(`:`).map(Number);const now=new Date();const target=new Date();target.setHours(h,m,0,0);if(target<now)target.setDate(target.getDate()+1);const diff=Math.max(0,target-now);const mm=Math.floor(diff/60000),ss=Math.floor((diff%60000)/1000);$(`lxBreakCountdown`).textContent=`${String(mm).padStart(2,`0`)}:${String(ss).padStart(2,`0`)}`};tick();breakTimer=setInterval(tick,1000)};
  const highlightFile=()=>{document.querySelectorAll(`.file`).forEach(el=>el.classList.remove(`lx-file-current`));if(!live.currentFile)return;const el=document.getElementById(live.currentFile);if(el){el.classList.add(`lx-file-current`);if(!el.classList.contains(`show`))el.classList.add(`show`)}};
  const render=()=>{$(`lxSession`).textContent=`DAY ${live.activeDay||1} • ${live.sessionLabel||`LIVE TRAINING`}`;$(`lxProgress`).style.width=`${Math.min(100,Math.max(0,Number(live.progress)||0))}%`;$(`lxNow`).textContent=live.now||`—`;$(`lxNext`).textContent=live.next||`—`;highlightFile();renderPulse();renderBreak()};
  onSnapshot(doc(db,`orangeExcelConfig`,`site`),(snap)=>{const raw=snap.exists()?snap.data():{};live={...DEFAULT,...(raw.liveExperience||{}),pulse:{...DEFAULT.pulse,...(raw.liveExperience?.pulse||{})},breakMode:{...DEFAULT.breakMode,...(raw.liveExperience?.breakMode||{})}};render()});
  let heartbeatWarned=false;const heartbeat=async()=>{try{await setDoc(doc(db,`orangeExcelPresence`,visitorId),{visitorId,page:location.pathname,day:pageDay,lastSeen:serverTimestamp()},{merge:true});heartbeatWarned=false}catch(e){if(!heartbeatWarned){console.warn(`Presence heartbeat blocked. Publish the updated Firestore rules.`,e);heartbeatWarned=true}}};heartbeat();setInterval(heartbeat,45000);
})();
