function qs(id){return document.getElementById(id)}
function currentUser(){return JSON.parse(localStorage.getItem('isp_user')||'{}')}
function token(){return localStorage.getItem('isp_session')||''}

function showLoader(title='Please wait...', text='Processing your request'){
  const overlay=qs('loaderOverlay');
  if(overlay){
    const t=qs('loaderTitle'), p=qs('loaderText');
    if(t) t.textContent=title;
    if(p) p.textContent=text;
    overlay.classList.add('active');
  }
}
function hideLoader(){
  const overlay=qs('loaderOverlay');
  if(overlay) overlay.classList.remove('active');
}
window.addEventListener('load',()=>setTimeout(hideLoader,900));

function toast(message){
  let el = document.getElementById('ispToast');
  if(!el){
    el = document.createElement('div');
    el.id = 'ispToast';
    el.className = 'toast';
    document.body.appendChild(el);
  }
  el.textContent = message;
  el.classList.add('active');
  setTimeout(()=>el.classList.remove('active'), 1800);
}

function setButtonLoading(btn,isLoading,text){
  if(!btn)return;
  if(isLoading){btn.dataset.oldText=btn.textContent;btn.textContent=text||'Please wait';btn.classList.add('loading');btn.disabled=true}
  else{btn.textContent=btn.dataset.oldText||btn.textContent;btn.classList.remove('loading');btn.disabled=false}
}
function showMsg(t,ok=true){const m=qs('msg'); if(m){m.textContent=t;m.style.color=ok?'#137333':'#b00020'}else if(t){console.log(t)}}
function showSmall(id,t,ok=true){const m=qs(id); if(m){m.textContent=t;m.style.color=ok?'#137333':'#b00020'}}

function showForm(name){
  document.querySelectorAll('.form').forEach(f=>f.classList.remove('active'));
  document.querySelectorAll('.tab').forEach(t=>t.classList.remove('active'));
  const map={login:'loginForm',signup:'signupForm',forgot:'forgotForm',reset:'resetForm'};
  if(qs(map[name])) qs(map[name]).classList.add('active');
  showMsg('');
}

const V36_SAFE_RETRY_ACTIONS=new Set([
  'getProfile','getRegistrationProfile','getMyGamification','getXpLeaderboard',
  'getDailyQuiz','listNotes','listBookmarks','getNotifications','getMyAchievements',
  'adminEmailDeliveryReport','emailSystemHealth','systemHealth'
]);

async function api(action,data={}){
  if(!API_URL||API_URL.includes('PASTE_')){
    return{success:false,message:'API URL is not configured.'};
  }

  const attempts=V36_SAFE_RETRY_ACTIONS.has(action)?2:1;
  let lastError='';

  for(let attempt=1;attempt<=attempts;attempt++){
    const controller=new AbortController();
    const timeout=setTimeout(()=>controller.abort(),12000);

    try{
      const response=await fetch(API_URL,{
        method:'POST',
        headers:{'Content-Type':'text/plain;charset=utf-8'},
        body:JSON.stringify({action,...data}),
        redirect:'follow',
        signal:controller.signal,
        cache:'no-store'
      });

      clearTimeout(timeout);
      const text=await response.text();

      try{
        const result=JSON.parse(text);
        window.V36_LAST_API_OK=Date.now();
        updateV36ConnectionState('online','Portal Connected','All services are available.');
        return result;
      }catch(error){
        lastError='The server returned an invalid response.';
        if(attempt===attempts){
          updateV36ConnectionState('error','Service Response Error',lastError);
          return{success:false,message:lastError};
        }
      }
    }catch(error){
      clearTimeout(timeout);
      lastError=error?.name==='AbortError'
        ?'The request timed out. Please try again.'
        :'The portal could not connect to the server.';

      if(attempt<attempts){
        await new Promise(resolve=>setTimeout(resolve,450));
        continue;
      }

      updateV36ConnectionState(
        navigator.onLine?'error':'offline',
        navigator.onLine?'Service Unavailable':'You Are Offline',
        lastError
      );
      return{success:false,message:lastError};
    }
  }

  return{success:false,message:lastError||'Request failed.'};
}

/* Auth */
async function signupUser(e){
  e.preventDefault();
  const btn=e.submitter;
  const password=qs('signupPassword')?.value||'';
  const confirmPassword=qs('signupConfirmPassword')?.value||'';

  if(password!==confirmPassword){
    showMsg('Passwords do not match.',false);
    const match=qs('signupPasswordMatch');
    if(match){
      match.textContent='Passwords do not match';
      match.className='v318-password-match error';
    }
    qs('signupConfirmPassword')?.focus();
    return;
  }

  if(password.length<6){
    showMsg('Password must contain at least 6 characters.',false);
    return;
  }

  setButtonLoading(btn,true,'Creating account');
  showLoader('Creating account...','Setting up your member account and emails');

  try{
    const r=await api('signup',{
      name:qs('signupName').value,
      email:qs('signupEmail').value,
      mobile:qs('signupMobile').value,
      qualification:qs('signupQualification')?.value||'',
      targetExam:qs('signupTargetExam')?.value||'',
      state:qs('signupState')?.value||'',
      district:qs('signupDistrict')?.value||'',
      subject:qs('signupSubject')?.value||'',
      password,
      confirmPassword
    });

    showMsg(r.message,r.success);

    if(r.success){
      if(r.emailWarning){
        toast('Account created. Email delivery is pending/failed.');
      }else{
        toast('Account created and welcome email sent');
      }
      showForm('login');
      e.target.reset();
      const match=qs('signupPasswordMatch');
      if(match){
        match.textContent='';
        match.className='v318-password-match';
      }
    }
  }finally{
    hideLoader();
    setButtonLoading(btn,false);
  }
}
async function loginUser(e){
  e.preventDefault();
  const btn=e.submitter;
  setButtonLoading(btn,true,'Checking login');
  showLoader('Logging in...','Checking your member account');
  const r=await api('login',{email:qs('loginEmail').value,password:qs('loginPassword').value});
  if(r.success){
    localStorage.setItem('isp_session',r.token);
    localStorage.setItem('isp_user',JSON.stringify(r.user));
    const lt=qs('loaderTitle'), lp=qs('loaderText');
    if(lt) lt.textContent='Login successful';
    if(lp) lp.textContent='Opening dashboard';
    setTimeout(()=>{location.href=r.user.role==='Admin'?'admin.html':'dashboard.html'},500);
    return;
  }
  hideLoader();setButtonLoading(btn,false);showMsg(r.message,r.success);
}
async function sendResetOtp(e){
  e.preventDefault();
  const btn=e.submitter,email=qs('forgotEmail').value;
  setButtonLoading(btn,true,'Sending OTP');showLoader('Sending OTP...','Please check your email');
  const r=await api('sendResetOtp',{email});
  hideLoader();setButtonLoading(btn,false);showMsg(r.message,r.success);
  if(r.success){qs('resetEmail').value=email;showForm('reset')}
}
async function resetPassword(e){
  e.preventDefault();
  const btn=e.submitter;
  setButtonLoading(btn,true,'Resetting');showLoader('Resetting password...','Please wait');
  const r=await api('resetPassword',{email:qs('resetEmail').value,otp:qs('resetOtp').value,password:qs('resetPassword').value});
  hideLoader();setButtonLoading(btn,false);showMsg(r.message,r.success);
  if(r.success)showForm('login');
}

/* Dashboard navigation */
function openDashSection(id,btn){
  document.querySelectorAll('.dash-section').forEach(s=>s.classList.remove('active'));
  document.querySelectorAll('.side-nav button').forEach(b=>b.classList.remove('active'));
  const sec=qs(id);
  if(sec) sec.classList.add('active');
  if(btn) btn.classList.add('active');
  if(id==='library') renderContinueReading();
  if(id==='notes') loadNotes();
  if(id==='bookmarks') loadBookmarks();
  if(id==='v42ExamHubModule') initV42ExamHub();
  if(id==='v43SmartLearningModule') initV43SmartLearning();
}

function logout(){
  showLoader('Logging out...','Please wait');
  localStorage.removeItem('isp_session');
  localStorage.removeItem('isp_user');
  setTimeout(()=>location.href='index.html',250);
}

/* Blogger Feed */
const ISP_BLOG = "https://iasselectionpoint.blogspot.com";
let ISP_LOADED_POSTS = [];
let ISP_LATEST_POSTS = [];
let ISP_CURRENT_CATEGORY = "";
let ISP_ACTIVE_MODULE = "";
let ISP_CURRENT_READER_POST = null;
let ISP_READER_FONT = 18;
const ISP_FEED_CACHE = {};
const ISP_FEED_CACHE_TIME = {};
const ISP_CACHE_TTL = 10*60*1000;

const ISP_LABEL_ALIASES = {
  "CURRENT AFFAIRS":["CURRENT AFFAIRS","Current Affairs"],
  "CURRENT CONTENT":["CURRENT CONTENT","Current Content"],
  "GENERAL KNOWLEDGE(GK)":["GENERAL KNOWLEDGE(GK)","GENERAL KNOWLEDGE (GK)","GK"],
  "GS PAPER-I":["GS PAPER-I","GS PAPER I","GS PAPER-1"],
  "GS PAPER-II":["GS PAPER-II","GS PAPER II","GS PAPER-2"],
  "GS PAPER-III":["GS PAPER-III","GS PAPER III","GS PAPER-3"],
  "GS PAPER-IV":["GS PAPER-IV","GS PAPER IV","GS PAPER-4"],
  "NEWS ARTICLE":["NEWS ARTICLE","News Article"],
  "NEWS CUTTING":["NEWS CUTTING","NEWS CUTING","News Cutting","News cuting"],
  "PAPER-I(OPT.)":["PAPER-I(OPT.)","PAPER-I (OPT.)","Paper-I (Optional)","PAPER-I"],
  "PAPER-II(OPT.)":["PAPER-II(OPT.)","PAPER-II (OPT.)","Paper-II (Optional)","PAPER-II"],
  "INDIAN GOVT & POLITICS":["INDIAN GOVT & POLITICS","Indian Govt & Politics","Indian Govt and Politics"],
  "INDIA'S FOREIGN POLICY":["INDIA'S FOREIGN POLICY","India's Foreign Policy"],
  "INTERNATIONAL ORGANISATIONS & GLOBAL ORDER":["INTERNATIONAL ORGANISATIONS & GLOBAL ORDER","International Organisations & Global Order","International Organizations & Global Order"]
};
function normalizeLabelValue(v){return String(v||'').toLowerCase().replace(/&/g,'and').replace(/\(opt\.\)/g,'optional').replace(/\(opt\)/g,'optional').replace(/\./g,'').replace(/['’]/g,'').replace(/[^a-z0-9]+/g,' ').replace(/\s+/g,' ').trim()}
function aliasesFor(label){return [...new Set([...(ISP_LABEL_ALIASES[label]||[]),label])]}
function entryLabels(entry){return (entry.category||[]).map(c=>c.term||'').filter(Boolean)}
function entryMatchesLabel(entry,targetLabel){const labels=entryLabels(entry).map(normalizeLabelValue);return aliasesFor(targetLabel).map(normalizeLabelValue).some(a=>labels.includes(a))}

function bloggerFeedJsonp(label,max=25){
  return new Promise((resolve,reject)=>{
    const cb="ispFeed_"+Date.now()+"_"+Math.floor(Math.random()*9999);
    const script=document.createElement("script");
    const timer=setTimeout(()=>{cleanup();reject(new Error("Feed timeout"));},10000);
    window[cb]=data=>{clearTimeout(timer);cleanup();resolve(data)};
    function cleanup(){try{delete window[cb]}catch(e){window[cb]=undefined} if(script.parentNode) script.parentNode.removeChild(script)}
    script.onerror=()=>{clearTimeout(timer);cleanup();reject(new Error("Feed failed"))};
    script.src=`${ISP_BLOG}/feeds/posts/default/-/${encodeURIComponent(label)}?alt=json-in-script&max-results=${max}&callback=${cb}`;
    document.body.appendChild(script);
  });
}
function bloggerAllPostsJsonp(max=200){
  return new Promise((resolve,reject)=>{
    const cb="ispAllFeed_"+Date.now()+"_"+Math.floor(Math.random()*9999);
    const script=document.createElement("script");
    const timer=setTimeout(()=>{cleanup();reject(new Error("All posts feed timeout"));},12000);
    window[cb]=data=>{clearTimeout(timer);cleanup();resolve(data)};
    function cleanup(){try{delete window[cb]}catch(e){window[cb]=undefined} if(script.parentNode) script.parentNode.removeChild(script)}
    script.onerror=()=>{clearTimeout(timer);cleanup();reject(new Error("All posts feed failed"))};
    script.src=`${ISP_BLOG}/feeds/posts/default?alt=json-in-script&max-results=${max}&callback=${cb}`;
    document.body.appendChild(script);
  });
}
async function fetchPostsForLabel(label,max=35){
  try{const exact=await bloggerFeedJsonp(label,max);const entries=exact.feed?.entry||[];if(entries.length)return{entries}}catch(e){}
  for(const alias of aliasesFor(label)){
    if(alias===label)continue;
    try{const data=await bloggerFeedJsonp(alias,max);const entries=data.feed?.entry||[];if(entries.length)return{entries}}catch(e){}
  }
  const all=await bloggerAllPostsJsonp(200);
  const allEntries=all.feed?.entry||[];
  return{entries:allEntries.filter(e=>entryMatchesLabel(e,label)).slice(0,max)};
}
function entryToPost(entry){
  const title=entry.title?.$t||"Untitled Post";
  const content=entry.content?.$t||entry.summary?.$t||"";
  const published=entry.published?.$t?new Date(entry.published.$t).toLocaleDateString():"";
  let link=""; if(entry.link){const alt=entry.link.find(l=>l.rel==="alternate"); if(alt)link=alt.href}
  const plain=stripHtml(content).slice(0,180);
  let thumbnail=entry.media$thumbnail?.url||"";
  if(!thumbnail){
    const match=String(content).match(/<img[^>]+src=["']([^"']+)["']/i);
    if(match)thumbnail=match[1];
  }
  if(thumbnail){
    thumbnail=thumbnail.replace(/\/s\d+(-c)?\//,'/s160-c/');
  }
  return{title,content,published,link,plain,thumbnail};
}

/* Module categories */
const ISP_KNOWLEDGE_CATEGORIES=[
  {title:"Current Affairs",label:"CURRENT AFFAIRS",icon:"🗞️",module:"Knowledge Center"},
  {title:"News Article",label:"NEWS ARTICLE",icon:"📰",module:"Knowledge Center"},
  {title:"Current Content",label:"CURRENT CONTENT",icon:"⚡",module:"Knowledge Center"},
  {title:"News Cutting",label:"NEWS CUTTING",icon:"✂️",module:"Knowledge Center"},
  {title:"General Knowledge (GK)",label:"GENERAL KNOWLEDGE(GK)",icon:"🧠",module:"Knowledge Center"}
];
const ISP_UPSC_GS_CATEGORIES=[
  {title:"GS Paper-I",label:"GS PAPER-I",icon:"📘",module:"UPSC"},
  {title:"GS Paper-II",label:"GS PAPER-II",icon:"📗",module:"UPSC"},
  {title:"GS Paper-III",label:"GS PAPER-III",icon:"📙",module:"UPSC"},
  {title:"GS Paper-IV",label:"GS PAPER-IV",icon:"📕",module:"UPSC"},
  {title:"Essay",label:"ESSAY",icon:"✍️",module:"UPSC"},
  {title:"Interview",label:"INTERVIEW",icon:"🎙️",module:"UPSC"}
];
const ISP_OPTIONAL_CATEGORIES=[
  {title:"Paper-I (Optional)",label:"PAPER-I(OPT.)",icon:"📘",module:"UPSC Optional Subject"},
  {title:"Paper-II (Optional)",label:"PAPER-II(OPT.)",icon:"📗",module:"UPSC Optional Subject"}
];
const ISP_UGC_POLITICAL_SCIENCE=[
  {title:"Indian Political Thought",label:"INDIAN POLITICAL THOUGHT",icon:"🧠",module:"UGC · Political Science"},
  {title:"Western Political Thought",label:"WESTERN POLITICAL THOUGHT",icon:"📖",module:"UGC · Political Science"},
  {title:"Indian Govt & Politics",label:"INDIAN GOVT & POLITICS",icon:"🏛️",module:"UGC · Political Science"},
  {title:"International Relations",label:"INTERNATIONAL RELATIONS",icon:"🤝",module:"UGC · Political Science"},
  {title:"Public Administration",label:"PUBLIC ADMINISTRATION",icon:"📋",module:"UGC · Political Science"},
  {title:"Research Methodology",label:"RESEARCH METHODOLOGY",icon:"🔬",module:"UGC · Political Science"},
  {title:"India's Foreign Policy",label:"INDIA'S FOREIGN POLICY",icon:"🇮🇳",module:"UGC · Political Science"},
  {title:"Political Theory",label:"POLITICAL THEORY",icon:"⚖️",module:"UGC · Political Science"},
  {title:"Comparative Politics",label:"COMPARATIVE POLITICS",icon:"🌍",module:"UGC · Political Science"},
  {title:"International Law",label:"INTERNATIONAL LAW",icon:"🌐",module:"UGC · Political Science"}
];

function renderV13Categories(){
  renderCategoryGridV13('knowledgeGrid',ISP_KNOWLEDGE_CATEGORIES,'knowledge');
  renderCategoryGridV13('upscGrid',ISP_UPSC_GS_CATEGORIES,'upsc');
  renderCategoryGridV13('optionalGrid',ISP_OPTIONAL_CATEGORIES,'upsc');
  renderCategoryGridV13('politicalScienceGrid',ISP_UGC_POLITICAL_SCIENCE,'ugc');
}
function renderCategoryGridV13(id,cats,moduleKey){
  const box=qs(id); if(!box)return;
  box.innerHTML=cats.map(c=>`<div class="private-cat-card" onclick="loadV13Category('${moduleKey}','${escapeAttr(c.label)}','${escapeAttr(c.title)}','${escapeAttr(c.module)}')"><span>${c.icon}</span><b>${escapeHtml(c.title)}</b><small>${escapeHtml(c.module)} · Read inside portal</small>${ISP_FEED_CACHE[c.label]?'<span class="cache-note">Cached</span>':''}</div>`).join('');
}
function listIdForModule(moduleKey){return moduleKey==='knowledge'?'knowledgePostList':moduleKey==='ugc'?'ugcPostList':'upscPostList'}
function titleIdForModule(moduleKey){return moduleKey==='knowledge'?'knowledgePostTitle':moduleKey==='ugc'?'ugcPostTitle':'upscPostTitle'}
function setLearningListHtml(listId,html){if(qs(listId))qs(listId).innerHTML=html}
function showSkeleton(listId){if(qs(listId))qs(listId).innerHTML='<div class="skeleton-card"></div><div class="skeleton-card"></div><div class="skeleton-card"></div>'}
async function getCachedPosts(label,title,moduleName){
  const now=Date.now();
  if(ISP_FEED_CACHE[label]&&(now-(ISP_FEED_CACHE_TIME[label]||0))<ISP_CACHE_TTL)return ISP_FEED_CACHE[label];
  const result=await fetchPostsForLabel(label,35);
  const posts=result.entries.map(entryToPost).map(p=>({...p,moduleName,categoryTitle:title}));
  ISP_FEED_CACHE[label]=posts; ISP_FEED_CACHE_TIME[label]=now;
  return posts;
}
async function loadV13Category(moduleKey,label,title,moduleName){
  ISP_CURRENT_CATEGORY=title; ISP_ACTIVE_MODULE=moduleKey;
  const listId=listIdForModule(moduleKey), titleId=titleIdForModule(moduleKey);
  if(qs(titleId))qs(titleId).textContent=title;
  if(ISP_FEED_CACHE[label]){ISP_LOADED_POSTS=ISP_FEED_CACHE[label];renderLearningPosts(ISP_LOADED_POSTS,listId)}else showSkeleton(listId);
  try{
    const posts=await getCachedPosts(label,title,moduleName);
    ISP_LOADED_POSTS=posts;
    if(!posts.length)setLearningListHtml(listId,`<p class="muted">No articles found for: <b>${escapeHtml(title)}</b></p>`);
    else renderLearningPosts(posts,listId);
    renderV13Categories();
  }catch(err){setLearningListHtml(listId,`<p class="muted">Unable to load articles.</p><div class="feed-debug">${escapeHtml(err.message)}</div>`)}
}
function renderLearningPosts(posts,listId){
  const html=posts.map((p,i)=>`<div class="post-item" onclick="openPostReader(${i})"><span class="module-tag">${escapeHtml(p.moduleName||'')}</span><h4>${escapeHtml(p.title)}</h4><p>${escapeHtml(p.plain)}...</p><span class="post-meta">${escapeHtml(p.categoryTitle||ISP_CURRENT_CATEGORY)} ${p.published?'· '+escapeHtml(p.published):''} · Read Article</span><div class="article-actions" onclick="event.stopPropagation()"><button onclick="quickSavePost('loaded',${i})">🔖 Save</button><button onclick="quickSharePost('loaded',${i})">📤 Share</button></div></div>`).join('');
  setLearningListHtml(listId,html);
}
function filterLoadedPosts(){
  const q=((qs('knowledgeSearch')?.value||'')||(qs('upscSearch')?.value||'')||(qs('ugcSearch')?.value||'')||'').toLowerCase();
  const filtered=ISP_LOADED_POSTS.filter(p=>p.title.toLowerCase().includes(q)||p.plain.toLowerCase().includes(q));
  renderLearningPosts(filtered,listIdForModule(ISP_ACTIVE_MODULE||'knowledge'));
}

/* Reader */
function openPostReader(index){
  const p=ISP_LOADED_POSTS[index]; if(!p)return;
  ISP_CURRENT_READER_POST=p;
  qs('readerTitle').textContent=p.title;
  qs('readerBody').style.fontSize=ISP_READER_FONT+'px';
  qs('readerBody').innerHTML=`<h1>${escapeHtml(p.title)}</h1><p class="muted">${escapeHtml(p.moduleName||'')} · ${escapeHtml(p.categoryTitle||ISP_CURRENT_CATEGORY)} ${p.published?' · '+escapeHtml(p.published):''}</p><p class="muted">Estimated reading time: ${estimateReadTime(p.content)} min</p><hr>${sanitizePostHtml(p.content)}`;
  qs('readerModal').classList.add('active');
  saveReadingHistory(p); renderContinueReading();
}
function closeReader(){if(qs('readerModal'))qs('readerModal').classList.remove('active')}
function readerFullScreen(){const m=qs('readerModal'); if(m&&m.requestFullscreen)m.requestFullscreen()}
function changeReaderFont(delta){ISP_READER_FONT=Math.max(14,Math.min(24,ISP_READER_FONT+delta)); if(qs('readerBody'))qs('readerBody').style.fontSize=ISP_READER_FONT+'px'}
function toggleReaderDark(){qs('readerModal').classList.toggle('dark-reader')}
function estimateReadTime(html){const words=stripHtml(html).split(/\s+/).filter(Boolean).length;return Math.max(1,Math.ceil(words/180))}
function saveCurrentArticle(){if(!ISP_CURRENT_READER_POST){toast('No article selected');return} saveArticleToBookmarks(ISP_CURRENT_READER_POST)}
async function shareCurrentArticle(){if(!ISP_CURRENT_READER_POST){toast('No article selected');return} await sharePost(ISP_CURRENT_READER_POST)}
async function copyCurrentArticleLink(){if(!ISP_CURRENT_READER_POST){toast('No article selected');return} await navigator.clipboard.writeText(ISP_CURRENT_READER_POST.link||location.href); toast('Article link copied')}

/* Latest/search/bookmarks */
async function loadLatestArticles(){
  const box=qs('latestArticles'); if(!box)return;
  box.innerHTML="<p class='muted'>Loading latest articles...</p>";
  try{
    const data=await bloggerAllPostsJsonp(20);
    ISP_LATEST_POSTS=(data.feed?.entry||[]).map(entryToPost).map(p=>({...p,moduleName:'Latest Articles',categoryTitle:'Latest'}));
    if(!ISP_LATEST_POSTS.length){box.innerHTML="<p class='muted'>No latest articles found.</p>";return}
    box.innerHTML=ISP_LATEST_POSTS.slice(0,8).map((p,i)=>`<div class="post-item" onclick="openLatestReader(${i})"><span class="latest-badge">Latest</span><h4>${escapeHtml(p.title)}</h4><p>${escapeHtml(p.plain)}...</p><span class="post-meta">${escapeHtml(p.published||'')} · Read Article</span><div class="article-actions" onclick="event.stopPropagation()"><button onclick="quickSavePost('latest',${i})">🔖 Save</button><button onclick="quickSharePost('latest',${i})">📤 Share</button></div></div>`).join('');
  }catch(err){box.innerHTML=`<p class="muted">Latest articles could not be loaded.</p>`}
}
function openLatestReader(index){ISP_LOADED_POSTS=ISP_LATEST_POSTS;openPostReader(index)}
function saveArticleToBookmarks(post){
  const u=currentUser().email||'guest', key='isp_bookmarks_'+u;
  const arr=JSON.parse(localStorage.getItem(key)||'[]');
  if(!arr.some(x=>x.url===post.link||x.title===post.title)){arr.unshift({id:Date.now(),title:post.title,url:post.link||post.title});localStorage.setItem(key,JSON.stringify(arr))}
  loadBookmarks();toast('Saved to bookmarks');
}
function quickSavePost(source,index){const post=source==='latest'?ISP_LATEST_POSTS[index]:ISP_LOADED_POSTS[index]; if(post)saveArticleToBookmarks(post)}
async function quickSharePost(source,index){const post=source==='latest'?ISP_LATEST_POSTS[index]:ISP_LOADED_POSTS[index]; if(post)await sharePost(post)}
async function sharePost(post){
  const data={title:post.title,text:post.plain||post.title,url:post.link||location.href};
  if(navigator.share){try{await navigator.share(data)}catch(e){}}else{await navigator.clipboard.writeText(`${post.title}\n${post.link||location.href}`);toast('Article link copied')}
}
function runGlobalSearch(){
  const q=(qs('globalSearch')?.value||'').trim().toLowerCase(), panel=qs('searchResultsPanel'), box=qs('globalSearchResults');
  if(!panel||!box)return;
  if(q.length<2){panel.style.display='none';return}
  panel.style.display='block';
  const pool=[...ISP_LATEST_POSTS,...ISP_LOADED_POSTS], seen=new Set();
  const results=pool.filter(p=>{const key=p.link||p.title;if(seen.has(key))return false;seen.add(key);return p.title.toLowerCase().includes(q)||p.plain.toLowerCase().includes(q)}).slice(0,12);
  if(!results.length){box.innerHTML="<p class='muted'>No matching article loaded yet. Open a module/category or refresh latest articles.</p>";return}
  window.ISP_SEARCH_RESULTS=results;
  box.innerHTML=results.map((p,i)=>`<div class="post-item" onclick="openSearchReader(${i})"><span class="module-tag">${escapeHtml(p.moduleName||'Article')}</span><h4>${escapeHtml(p.title)}</h4><p>${escapeHtml(p.plain)}...</p><span class="post-meta">${escapeHtml(p.categoryTitle||'')} · Read Article</span></div>`).join('');
}
function openSearchReader(index){ISP_LOADED_POSTS=window.ISP_SEARCH_RESULTS||[];openPostReader(index)}
function clearGlobalSearch(){if(qs('globalSearch'))qs('globalSearch').value=''; if(qs('searchResultsPanel'))qs('searchResultsPanel').style.display='none'}
function addBookmark(){
  const title=qs('bookmarkTitle').value.trim(), url=qs('bookmarkUrl').value.trim();
  if(!title||!url){alert('Title and URL required');return}
  const u=currentUser().email,key='isp_bookmarks_'+u, arr=JSON.parse(localStorage.getItem(key)||'[]');
  arr.unshift({id:Date.now(),title,url});localStorage.setItem(key,JSON.stringify(arr));qs('bookmarkTitle').value='';qs('bookmarkUrl').value='';loadBookmarks();
}
function loadBookmarks(){
  const box=qs('bookmarksList'); const u=currentUser().email||'guest'; const arr=JSON.parse(localStorage.getItem('isp_bookmarks_'+u)||'[]');
  if(qs('bookmarkCount'))qs('bookmarkCount').textContent=arr.length;
  if(!box)return;
  if(!arr.length){box.innerHTML='<p>No bookmarks yet.</p>';return}
  box.innerHTML=arr.map(b=>`<div class="bookmark-card"><h4>${escapeHtml(b.title)}</h4><p>${escapeHtml(b.url)}</p><a class="mini-btn" target="_blank" href="${escapeAttr(b.url)}">Open</a> <button class="mini-btn danger-btn" onclick="deleteBookmark(${b.id})">Delete</button></div>`).join('');
}
function deleteBookmark(id){const u=currentUser().email,key='isp_bookmarks_'+u;const arr=JSON.parse(localStorage.getItem(key)||'[]').filter(x=>x.id!==id);localStorage.setItem(key,JSON.stringify(arr));loadBookmarks()}

/* Notes/Profile */
async function loadNotes(){
  const box=qs('notesList'); if(!box)return;
  box.innerHTML='<p>Loading notes...</p>';
  const r=await api('listNotes',{token:token()});
  if(!r.success){box.innerHTML='<p>'+escapeHtml(r.message)+'</p>';return}
  if(qs('notesCount'))qs('notesCount').textContent=(r.notes||[]).length;
  if(!r.notes.length){box.innerHTML='<p>No notes yet.</p>';return}
  box.innerHTML=r.notes.map(n=>`<div class="note-card"><h4>${escapeHtml(n.title)}</h4><p>${escapeHtml(n.body)}</p><button class="mini-btn danger-btn" onclick="deleteNote('${n.id}')">Delete</button></div>`).join('');
}
async function addNote(){
  const title=qs('noteTitle').value.trim(), body=qs('noteBody').value.trim();
  if(!title||!body){alert('Note title and body required');return}
  showLoader('Saving note...','Please wait');
  const r=await api('addNote',{token:token(),title,body}); hideLoader();
  if(r.success){qs('noteTitle').value='';qs('noteBody').value='';loadNotes()}else alert(r.message)
}
async function deleteNote(id){if(!confirm('Delete this note?'))return;showLoader('Deleting note...','Please wait');const r=await api('deleteNote',{token:token(),id});hideLoader();if(r.success)loadNotes();else alert(r.message)}
async function saveProfile(){
  showLoader('Saving profile...','Please wait');
  const data={token:token(),name:qs('profileName').value,mobile:qs('profileMobile').value,city:qs('profileCity').value,exam:qs('profileExam').value};
  const r=await api('saveProfile',data); hideLoader(); showSmall('profileMsg',r.message,r.success);
  if(r.success){const u=currentUser();u.name=data.name;localStorage.setItem('isp_user',JSON.stringify(u));if(qs('memberName'))qs('memberName').textContent=data.name}
}
async function changePassword(){
  showLoader('Changing password...','Please wait');
  const r=await api('changePassword',{token:token(),oldPassword:qs('oldPassword').value,newPassword:qs('newPassword').value}); hideLoader();
  showSmall('securityMsg',r.message,r.success); if(r.success){qs('oldPassword').value='';qs('newPassword').value=''}
}
function setStudyGoal(){
  const current=localStorage.getItem('isp_study_goal')||'Read 2 articles today and revise your notes.';
  const goal=prompt('Set your study goal:',current);
  if(goal){localStorage.setItem('isp_study_goal',goal);if(qs('studyGoalBox'))qs('studyGoalBox').textContent=goal;toast('Study goal saved')}
}
function saveReadingHistory(post){
  const u=currentUser().email||'guest', key='isp_reading_history_'+u;
  let arr=JSON.parse(localStorage.getItem(key)||'[]'); arr=arr.filter(x=>x.link!==post.link);
  arr.unshift({title:post.title,categoryTitle:post.categoryTitle||ISP_CURRENT_CATEGORY,moduleName:post.moduleName||'',date:new Date().toLocaleString(),link:post.link,plain:post.plain});
  localStorage.setItem(key,JSON.stringify(arr.slice(0,20)));
}
function renderContinueReading(){
  const u=currentUser().email||'guest', arr=JSON.parse(localStorage.getItem('isp_reading_history_'+u)||'[]');
  const box=qs('continueReading'); if(box){box.innerHTML=arr.length?`<b>${escapeHtml(arr[0].title)}</b><br><small>${escapeHtml(arr[0].moduleName)} · ${escapeHtml(arr[0].categoryTitle)} · ${escapeHtml(arr[0].date)}</small>`:'No article opened yet.'}
  const hist=qs('readingHistory'); if(hist){hist.innerHTML=arr.length?arr.map(x=>`<div class="post-item"><span class="module-tag">${escapeHtml(x.moduleName)}</span><h4>${escapeHtml(x.title)}</h4><p>${escapeHtml(x.plain||'')}...</p><span class="post-meta">${escapeHtml(x.categoryTitle)} · ${escapeHtml(x.date)}</span></div>`).join(''):"<p class='muted'>No reading history yet.</p>"}
}

/* Admin */
let ISP_ADMIN_USERS=[];
function openAdminSection(id,btn){
  document.querySelectorAll('.admin-section').forEach(s=>s.classList.remove('active'));
  document.querySelectorAll('.side-nav button').forEach(b=>b.classList.remove('active'));
  if(qs(id))qs(id).classList.add('active'); if(btn)btn.classList.add('active'); if(id==='adminLogs')renderAdminLogsLocal();
}
async function loadAdmin(){
  showLoader('Opening admin panel...','Loading users and controls');
  const u=currentUser(); if(!u.email||u.role!=='Admin'){location.href='index.html';return}
  if(qs('adminEmail'))qs('adminEmail').textContent=u.email;
  const r=await api('adminStats',{token:token()}); hideLoader();
  if(r.success){ISP_ADMIN_USERS=r.users||[]; if(qs('totalUsers'))qs('totalUsers').textContent=r.totalUsers||0; if(qs('activeUsers'))qs('activeUsers').textContent=r.activeUsers||0; if(qs('blockedUsers'))qs('blockedUsers').textContent=ISP_ADMIN_USERS.filter(x=>String(x.status).toLowerCase()==='blocked').length; if(qs('adminCount'))qs('adminCount').textContent=ISP_ADMIN_USERS.filter(x=>x.role==='Admin').length||1; renderUsersTable(ISP_ADMIN_USERS); renderRecentUsersV14(ISP_ADMIN_USERS); renderAdminLogsLocal()}else alert(r.message)
}
function renderUsersTable(users){
  const tbody=qs('usersTable'); if(!tbody)return;
  tbody.innerHTML=users.map(x=>{const isAdmin=String(x.role).toLowerCase()==='admin';const status=String(x.status||'Active');const sc=status.toLowerCase()==='blocked'?'blocked':status.toLowerCase()==='deleted'?'deleted':status.toLowerCase()==='pending'?'pending':'';const rc=isAdmin?'admin':'member';return `<tr><td><b>${escapeHtml(x.name||'')}</b></td><td>${escapeHtml(x.email||'')}</td><td><span class="role-pill ${rc}">${escapeHtml(x.role||'')}</span></td><td><span class="status-pill ${sc}">${escapeHtml(status)}</span></td><td>${escapeHtml(x.lastLogin||'')}</td><td><div class="action-btns"><button class="action-btn activate-btn" onclick="adminUpdateUser('${escapeAttr(x.email)}','Active')" ${isAdmin?'disabled':''}>Activate</button><button class="action-btn block-btn" onclick="adminUpdateUser('${escapeAttr(x.email)}','Blocked')" ${isAdmin?'disabled':''}>Block</button><button class="action-btn delete-btn" onclick="adminDeleteUser('${escapeAttr(x.email)}')" ${isAdmin?'disabled':''}>Delete</button></div></td></tr>`}).join('');
}
function renderRecentUsersV14(users){const box=qs('recentUsers');if(!box)return;box.innerHTML=users.slice(-5).reverse().map(x=>`<div class="user-row"><b>${escapeHtml(x.name)}</b><br>${escapeHtml(x.email)} · ${escapeHtml(x.role)} · ${escapeHtml(x.status)}</div>`).join('')}
function filterUsers(){const q=(qs('userSearch')?.value||'').toLowerCase();renderUsersTable(ISP_ADMIN_USERS.filter(x=>String(x.name||'').toLowerCase().includes(q)||String(x.email||'').toLowerCase().includes(q)||String(x.status||'').toLowerCase().includes(q)))}
async function adminUpdateUser(email,status){if(!confirm(`Set ${email} as ${status}?`))return;showLoader('Updating user...','Please wait');const r=await api('adminUpdateUserStatus',{token:token(),email,status});hideLoader();if(r.success){saveAdminLogLocal(`User ${email} set as ${status}`);toast(r.message);await loadAdmin()}else alert(r.message)}
async function adminDeleteUser(email){if(!confirm(`Delete ${email}? This will mark the account as Deleted.`))return;showLoader('Deleting user...','Please wait');const r=await api('adminDeleteUser',{token:token(),email});hideLoader();if(r.success){saveAdminLogLocal(`User ${email} deleted`);toast(r.message);await loadAdmin()}else alert(r.message)}
function saveAdminLogLocal(text){const key='isp_admin_logs';const arr=JSON.parse(localStorage.getItem(key)||'[]');arr.unshift({text,date:new Date().toLocaleString()});localStorage.setItem(key,JSON.stringify(arr.slice(0,20)))}
function renderAdminLogsLocal(){const box=qs('adminLogsList');if(!box)return;const arr=JSON.parse(localStorage.getItem('isp_admin_logs')||'[]');box.innerHTML=arr.length?arr.map(x=>`<div class="post-item"><h4>${escapeHtml(x.text)}</h4><span class="post-meta">${escapeHtml(x.date)}</span></div>`).join(''):'<p class="muted">No admin action yet.</p>'}
function downloadUsersCSV(){if(!ISP_ADMIN_USERS.length){alert('No users found');return}const rows=[['Name','Email','Role','Status','Last Login'],...ISP_ADMIN_USERS.map(u=>[u.name,u.email,u.role,u.status,u.lastLogin||''])];const csv=rows.map(r=>r.map(v=>`"${String(v||'').replace(/"/g,'""')}"`).join(',')).join('\n');const blob=new Blob([csv],{type:'text/csv'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='ias-selection-point-users.csv';a.click()}

/* Utilities */
function stripHtml(html){const d=document.createElement('div');d.innerHTML=html||'';return(d.textContent||d.innerText||'').replace(/\s+/g,' ').trim()}
function sanitizePostHtml(html){const d=document.createElement('div');d.innerHTML=html||'';d.querySelectorAll('script, iframe, object, embed').forEach(x=>x.remove());d.querySelectorAll('a').forEach(a=>{a.setAttribute('target','_blank');a.setAttribute('rel','noopener')});return d.innerHTML}
function escapeHtml(s){return String(s||'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]))}
function escapeAttr(s){return String(s||'').replace(/"/g,'%22').replace(/javascript:/gi,'')}

/* Page load */
async function loadDashboard(){
  showLoader('Opening dashboard...','Fast cached portal loading');
  const u=currentUser(); if(!u.email){location.href='index.html';return}
  if(qs('memberName'))qs('memberName').textContent=u.name||'Member';
  if(qs('memberEmail'))qs('memberEmail').textContent=u.email||'';
  if(qs('memberStatus'))qs('memberStatus').textContent=u.status||'Active';
  renderV13Categories(); loadBookmarks(); renderContinueReading();
  if(qs('studyGoalBox'))qs('studyGoalBox').textContent=localStorage.getItem('isp_study_goal')||'Read 2 articles today and revise your notes.';
  setTimeout(hideLoader,650);
  setTimeout(()=>{try{loadLatestArticles()}catch(e){}},500);
  Promise.race([api('getProfile',{token:token()}),new Promise(resolve=>setTimeout(()=>resolve({success:false,timeout:true}),2500))]).then(r=>{if(r&&r.success){if(qs('profileName'))qs('profileName').value=r.profile.name||u.name||'';if(qs('profileMobile'))qs('profileMobile').value=r.profile.mobile||'';if(qs('profileCity'))qs('profileCity').value=r.profile.city||'';if(qs('profileExam'))qs('profileExam').value=r.profile.exam||''}});
  setTimeout(()=>{try{loadNotes()}catch(e){}},300);
}


/* ===== v14.2 Deactivate User Control Override ===== */
renderUsersTable = function(users){
  const tbody=qs('usersTable'); 
  if(!tbody)return;
  tbody.innerHTML=users.map(x=>{
    const isAdmin=String(x.role).toLowerCase()==='admin';
    const status=String(x.status||'Active');
    const sl=status.toLowerCase();
    const sc=sl==='blocked'?'blocked':sl==='deleted'?'deleted':sl==='pending'?'pending':sl==='deactivated'?'deactivated':'';
    const rc=isAdmin?'admin':'member';
    return `<tr>
      <td><b>${escapeHtml(x.name||'')}</b></td>
      <td>${escapeHtml(x.email||'')}</td>
      <td><span class="role-pill ${rc}">${escapeHtml(x.role||'')}</span></td>
      <td><span class="status-pill ${sc}">${escapeHtml(status)}</span></td>
      <td>${escapeHtml(x.lastLogin||'')}</td>
      <td>
        <div class="action-btns">
          <button class="action-btn activate-btn" onclick="adminUpdateUser('${escapeAttr(x.email)}','Active')" ${isAdmin?'disabled':''}>Activate</button>
          <button class="action-btn deactivate-btn" onclick="adminUpdateUser('${escapeAttr(x.email)}','Deactivated')" ${isAdmin?'disabled':''}>Deactivate</button>
          <button class="action-btn block-btn" onclick="adminUpdateUser('${escapeAttr(x.email)}','Blocked')" ${isAdmin?'disabled':''}>Block</button>
          <button class="action-btn delete-btn" onclick="adminDeleteUser('${escapeAttr(x.email)}')" ${isAdmin?'disabled':''}>Delete</button>
        </div>
      </td>
    </tr>`;
  }).join('');
};

const ISP_OLD_LOAD_ADMIN_142 = typeof loadAdmin === 'function' ? loadAdmin : null;
loadAdmin = async function(){
  showLoader('Opening admin panel...','Loading users and controls');
  const u=currentUser(); 
  if(!u.email||u.role!=='Admin'){location.href='index.html';return}
  if(qs('adminEmail'))qs('adminEmail').textContent=u.email;
  const r=await api('adminStats',{token:token()}); 
  hideLoader();
  if(r.success){
    ISP_ADMIN_USERS=r.users||[]; 
    if(qs('totalUsers'))qs('totalUsers').textContent=r.totalUsers||0; 
    if(qs('activeUsers'))qs('activeUsers').textContent=r.activeUsers||0; 
    if(qs('blockedUsers'))qs('blockedUsers').textContent=ISP_ADMIN_USERS.filter(x=>['blocked','deactivated'].includes(String(x.status).toLowerCase())).length; 
    if(qs('adminCount'))qs('adminCount').textContent=ISP_ADMIN_USERS.filter(x=>x.role==='Admin').length||1; 
    renderUsersTable(ISP_ADMIN_USERS); 
    renderRecentUsersV14(ISP_ADMIN_USERS); 
    renderAdminLogsLocal();
  }else alert(r.message);
};


/* ===== v14.3 Admin Email Notification UI Note ===== */
const ISP_OLD_RENDER_USERS_143 = renderUsersTable;
renderUsersTable = function(users){
  ISP_OLD_RENDER_USERS_143(users);
  document.querySelectorAll('#usersTable tr td:last-child').forEach(td => {
    if(!td.querySelector('.email-note')){
      const note=document.createElement('div');
      note.className='email-note';
      note.textContent='Email will be sent to user';
      td.appendChild(note);
    }
  });
};

/* ===== v15 Admin Email Center ===== */
async function sendBulkEmail(){
  const subject = qs('bulkEmailSubject')?.value.trim();
  const body = qs('bulkEmailBody')?.value.trim();
  if(!subject || !body){ showSmall('bulkEmailMsg','Please enter subject and message.',false); return; }
  if(!confirm('Send this email to all active members?')) return;
  showLoader('Sending emails...','Please wait');
  const r = await api('adminSendBulkEmail',{token:token(),subject,body});
  hideLoader();
  showSmall('bulkEmailMsg', r.message, r.success);
  if(r.success){ qs('bulkEmailSubject').value=''; qs('bulkEmailBody').value=''; }
}


/* ===== v16: show 5 posts per page with Next / Previous ===== */
let ISP_POST_PAGE = 1;
const ISP_POSTS_PER_PAGE = 5;
let ISP_CURRENT_LIST_ID = "";

function paginatePosts(posts, page){
  const start = (page - 1) * ISP_POSTS_PER_PAGE;
  return posts.slice(start, start + ISP_POSTS_PER_PAGE);
}

function renderLearningPosts(posts, listId){
  ISP_CURRENT_LIST_ID = listId;
  const total = posts.length;
  const totalPages = Math.max(1, Math.ceil(total / ISP_POSTS_PER_PAGE));
  if(ISP_POST_PAGE > totalPages) ISP_POST_PAGE = totalPages;
  if(ISP_POST_PAGE < 1) ISP_POST_PAGE = 1;

  const pagePosts = paginatePosts(posts, ISP_POST_PAGE);
  const html = pagePosts.map((p, localIndex) => {
    const realIndex = ((ISP_POST_PAGE - 1) * ISP_POSTS_PER_PAGE) + localIndex;
    return `<div class="post-item" onclick="openPostReader(${realIndex})">
      <span class="module-tag">${escapeHtml(p.moduleName || '')}</span>
      <h4>${escapeHtml(p.title)}</h4>
      <p>${escapeHtml(p.plain)}...</p>
      <span class="post-meta">${escapeHtml(p.categoryTitle || ISP_CURRENT_CATEGORY)} ${p.published ? '· ' + escapeHtml(p.published) : ''} · Read Article</span>
      <div class="article-actions" onclick="event.stopPropagation()">
        <button onclick="quickSavePost('loaded',${realIndex})">🔖 Save</button>
        <button onclick="quickSharePost('loaded',${realIndex})">📤 Share</button>
      </div>
    </div>`;
  }).join('');

  const pagination = total > ISP_POSTS_PER_PAGE ? `
    <div class="pagination-bar">
      <button onclick="changePostPage(-1)" ${ISP_POST_PAGE <= 1 ? 'disabled' : ''}>← Previous</button>
      <span class="pagination-info">Showing ${((ISP_POST_PAGE-1)*ISP_POSTS_PER_PAGE)+1}-${Math.min(ISP_POST_PAGE*ISP_POSTS_PER_PAGE,total)} of ${total} posts · Page ${ISP_POST_PAGE} of ${totalPages}</span>
      <button onclick="changePostPage(1)" ${ISP_POST_PAGE >= totalPages ? 'disabled' : ''}>Next →</button>
    </div>` : '';

  setLearningListHtml(listId, html + pagination);
}

function changePostPage(direction){
  ISP_POST_PAGE += direction;
  renderLearningPosts(ISP_LOADED_POSTS, ISP_CURRENT_LIST_ID || listIdForModule(ISP_ACTIVE_MODULE || 'knowledge'));
  const el = qs(ISP_CURRENT_LIST_ID || '');
  if(el) el.scrollIntoView({behavior:'smooth', block:'start'});
}

if(typeof loadV13Category === 'function'){
  const ISP_OLD_LOAD_V13_CATEGORY_V16 = loadV13Category;
  loadV13Category = async function(moduleKey,label,title,moduleName){
    ISP_POST_PAGE = 1;
    await ISP_OLD_LOAD_V13_CATEGORY_V16(moduleKey,label,title,moduleName);
  }
}


/* ===== v16.1 Title-only Post Lists Override ===== */
function renderLearningPosts(posts, listId){
  ISP_CURRENT_LIST_ID = listId;
  const total = posts.length;
  const totalPages = Math.max(1, Math.ceil(total / ISP_POSTS_PER_PAGE));
  if(ISP_POST_PAGE > totalPages) ISP_POST_PAGE = totalPages;
  if(ISP_POST_PAGE < 1) ISP_POST_PAGE = 1;

  const pagePosts = paginatePosts(posts, ISP_POST_PAGE);
  const html = pagePosts.map((p, localIndex) => {
    const realIndex = ((ISP_POST_PAGE - 1) * ISP_POSTS_PER_PAGE) + localIndex;
    return `<div class="post-item title-only-post" onclick="openPostReader(${realIndex})">
      <span class="module-tag">${escapeHtml(p.moduleName || '')}</span>
      <h4>${escapeHtml(p.title)}</h4>
      <span class="post-meta">${escapeHtml(p.categoryTitle || ISP_CURRENT_CATEGORY)} ${p.published ? '· ' + escapeHtml(p.published) : ''} · Read Article</span>
      <div class="article-actions" onclick="event.stopPropagation()">
        <button onclick="quickSavePost('loaded',${realIndex})">🔖 Save</button>
        <button onclick="quickSharePost('loaded',${realIndex})">📤 Share</button>
      </div>
    </div>`;
  }).join('');

  const pagination = total > ISP_POSTS_PER_PAGE ? `
    <div class="pagination-bar">
      <button onclick="changePostPage(-1)" ${ISP_POST_PAGE <= 1 ? 'disabled' : ''}>← Previous</button>
      <span class="pagination-info">Showing ${((ISP_POST_PAGE-1)*ISP_POSTS_PER_PAGE)+1}-${Math.min(ISP_POST_PAGE*ISP_POSTS_PER_PAGE,total)} of ${total} posts · Page ${ISP_POST_PAGE} of ${totalPages}</span>
      <button onclick="changePostPage(1)" ${ISP_POST_PAGE >= totalPages ? 'disabled' : ''}>Next →</button>
    </div>` : '';

  setLearningListHtml(listId, html + pagination);
}


/* ===== v16.2 Footer Internal Reader + Copyright ===== */
let ISP_FOOTER_URL = '';

function openFooterPage(title, url){
  ISP_FOOTER_URL = url;
  const modal = qs('footerPageModal');
  const frame = qs('footerPageFrame');
  const heading = qs('footerPageTitle');
  if(heading) heading.textContent = title;
  if(frame) frame.src = url;
  if(modal) modal.classList.add('active');
}

function closeFooterPage(){
  const modal = qs('footerPageModal');
  const frame = qs('footerPageFrame');
  if(modal) modal.classList.remove('active');
  if(frame) frame.src = '';
}

function openFooterExternal(){
  if(ISP_FOOTER_URL) window.open(ISP_FOOTER_URL, '_blank');
}

document.addEventListener('DOMContentLoaded', function(){
  document.querySelectorAll('#copyrightYear').forEach(el => el.textContent = new Date().getFullYear());
});

/* Strong title-only list override */
function renderLearningPosts(posts, listId){
  ISP_CURRENT_LIST_ID = listId;
  const total = posts.length;
  const totalPages = Math.max(1, Math.ceil(total / ISP_POSTS_PER_PAGE));
  if(ISP_POST_PAGE > totalPages) ISP_POST_PAGE = totalPages;
  if(ISP_POST_PAGE < 1) ISP_POST_PAGE = 1;

  const pagePosts = paginatePosts(posts, ISP_POST_PAGE);
  const html = pagePosts.map((p, localIndex) => {
    const realIndex = ((ISP_POST_PAGE - 1) * ISP_POSTS_PER_PAGE) + localIndex;
    return `<div class="post-item title-only-post" onclick="openPostReader(${realIndex})">
      <span class="module-tag">${escapeHtml(p.moduleName || '')}</span>
      <h4 title="${escapeAttr(p.title)}">${escapeHtml(p.title)}</h4>
      <span class="post-meta">${escapeHtml(p.categoryTitle || ISP_CURRENT_CATEGORY)} ${p.published ? '· ' + escapeHtml(p.published) : ''}</span>
      <div class="article-actions" onclick="event.stopPropagation()">
        <button onclick="quickSavePost('loaded',${realIndex})">🔖 Save</button>
        <button onclick="quickSharePost('loaded',${realIndex})">📤 Share</button>
      </div>
    </div>`;
  }).join('');

  const pagination = total > ISP_POSTS_PER_PAGE ? `
    <div class="pagination-bar">
      <button onclick="changePostPage(-1)" ${ISP_POST_PAGE <= 1 ? 'disabled' : ''}>← Previous</button>
      <span class="pagination-info">Showing ${((ISP_POST_PAGE-1)*ISP_POSTS_PER_PAGE)+1}-${Math.min(ISP_POST_PAGE*ISP_POSTS_PER_PAGE,total)} of ${total} posts · Page ${ISP_POST_PAGE} of ${totalPages}</span>
      <button onclick="changePostPage(1)" ${ISP_POST_PAGE >= totalPages ? 'disabled' : ''}>Next →</button>
    </div>` : '';

  setLearningListHtml(listId, html + pagination);
}


/* ===== v16.3 Clean Footer Content Modal ===== */
const ISP_FOOTER_PAGES = {
  about: {
    title: 'About Us',
    html: `<h2>About IAS Selection Point</h2>
      <p><b>IAS Selection Point</b> is a professional learning portal created for students and aspirants who want organized study content in one place.</p>
      <div class="info-box">
        <b>Our purpose:</b> To provide study resources, current affairs, political science content, general knowledge, and exam-related material through a clean member dashboard.
      </div>
      <p>The portal is designed to help learners read articles, save bookmarks, create notes, and continue their preparation with a focused interface.</p>`
  },
  contact: {
    title: 'Contact Us',
    html: `<h2>Contact Us</h2>
      <p>You can contact IAS Selection Point for support, account-related help, content queries, or portal access issues.</p>
      <div class="info-box">
        <p><b>Email:</b> <a href="mailto:kaitsatnam@gmail.com">kaitsatnam@gmail.com</a></p>
        <p><b>Website:</b> <a href="https://iasselectionpoint.blogspot.com/" target="_blank">IAS Selection Point</a></p>
      </div>
      <p>For account activation, deactivation, blocking, or password-related issues, please contact the admin.</p>`
  },
  cookies: {
    title: 'Cookies Policy',
    html: `<h2>Cookies Policy</h2>
      <p>IAS Selection Point may use browser storage and cookies to improve user experience and keep the portal working properly.</p>
      <div class="info-box">
        <b>Examples:</b> Login session, bookmarks, reading history, dashboard settings, and local preferences.
      </div>
      <p>By using this portal, you agree that essential cookies or local storage may be used for functionality and security.</p>`
  },
  privacy: {
    title: 'Privacy Policy',
    html: `<h2>Privacy Policy</h2>
      <p>IAS Selection Point respects user privacy. The portal may store basic account details such as name, email, mobile number, account status, login records, notes, and profile details.</p>
      <div class="info-box">
        <b>Use of data:</b> Account management, login access, password reset, admin controls, email notifications, and learning portal features.
      </div>
      <p>Your information is not intended to be sold or misused. Account-related emails may be sent for security and portal communication.</p>`
  },
  terms: {
    title: 'Terms & Conditions',
    html: `<h2>Terms & Conditions</h2>
      <p>By using IAS Selection Point Learning Portal, users agree to use the platform for educational and lawful purposes only.</p>
      <div class="info-box">
        <b>User responsibility:</b> Keep login details secure, do not misuse the portal, and respect the content and access rules.
      </div>
      <p>Admin may activate, deactivate, block, or delete accounts when required for portal management, security, or misuse prevention.</p>`
  },
  disclaimer: {
    title: 'Disclaimer',
    html: `<h2>Disclaimer</h2>
      <p>The information provided on IAS Selection Point is for educational and general information purposes only.</p>
      <div class="info-box">
        <b>Accuracy:</b> We try to provide useful and accurate study material, but users should verify important information from official sources when needed.
      </div>
      <p>IAS Selection Point will not be responsible for any loss or issue caused by relying solely on the information published on the website or portal.</p>`
  }
};

function openFooterPage(key){
  const data = ISP_FOOTER_PAGES[key];
  if(!data) return;
  const modal = qs('footerPageModal');
  const heading = qs('footerPageTitle');
  const content = qs('footerPageContent');
  if(heading) heading.textContent = data.title;
  if(content) content.innerHTML = data.html;
  if(modal) modal.classList.add('active');
}

function closeFooterPage(){
  const modal = qs('footerPageModal');
  if(modal) modal.classList.remove('active');
}

function openFooterExternal(){
  // Kept for compatibility, but footer pages now open inside dashboard.
}


/* ===== v17 Study Progress + Notification Center ===== */
function todayKey(){
  const d = new Date();
  return d.getFullYear() + '-' + (d.getMonth()+1) + '-' + d.getDate();
}

function getDailyReadCount(){
  const u = currentUser().email || 'guest';
  return Number(localStorage.getItem('isp_daily_read_' + u + '_' + todayKey()) || 0);
}

function setDailyReadCount(n){
  const u = currentUser().email || 'guest';
  localStorage.setItem('isp_daily_read_' + u + '_' + todayKey(), String(n));
  updateDailyProgress();
}

function updateDailyProgress(){
  const count = getDailyReadCount();
  const target = 5;
  const pct = Math.min(100, Math.round((count / target) * 100));
  if(qs('dailyProgressBar')) qs('dailyProgressBar').style.width = pct + '%';
  if(qs('dailyProgressText')) qs('dailyProgressText').textContent = `${count} of ${target} articles read today.`;
}

function resetDailyProgress(){
  setDailyReadCount(0);
  toast ? toast('Daily progress reset') : alert('Daily progress reset');
}

/* Count article read when user opens reader */
if(typeof openPostReader === 'function'){
  const ISP_OLD_OPEN_POST_READER_V17 = openPostReader;
  openPostReader = function(index){
    const beforeTitle = ISP_LOADED_POSTS[index]?.title || '';
    ISP_OLD_OPEN_POST_READER_V17(index);
    if(beforeTitle){
      const u = currentUser().email || 'guest';
      const readKey = 'isp_read_once_' + u + '_' + todayKey() + '_' + beforeTitle;
      if(!localStorage.getItem(readKey)){
        localStorage.setItem(readKey, '1');
        setDailyReadCount(getDailyReadCount() + 1);
      }
    }
  };
}

function defaultNotifications(){
  return [
    {id:1,title:'Welcome to IAS Selection Point',body:'Explore Knowledge Center, UPSC and UGC Political Science modules from your dashboard.',date:new Date().toLocaleDateString(),read:false},
    {id:2,title:'Study Tip',body:'Read at least 5 articles daily and revise your saved notes.',date:new Date().toLocaleDateString(),read:false}
  ];
}

function getNotifications(){
  const key = 'isp_notifications_' + (currentUser().email || 'guest');
  let arr = JSON.parse(localStorage.getItem(key) || 'null');
  if(!arr){
    arr = defaultNotifications();
    localStorage.setItem(key, JSON.stringify(arr));
  }
  return arr;
}

function saveNotifications(arr){
  const key = 'isp_notifications_' + (currentUser().email || 'guest');
  localStorage.setItem(key, JSON.stringify(arr));
}

function renderNotifications(){
  const arr = getNotifications();
  const list = qs('notificationsList');
  const preview = qs('notificationPreviewBox');
  if(preview){
    const latest = arr.find(x => !x.read) || arr[0];
    preview.innerHTML = latest ? `<b>${escapeHtml(latest.title)}</b><p>${escapeHtml(latest.body)}</p>` : 'No notification.';
  }
  if(list){
    if(!arr.length){ list.innerHTML = '<p class="muted">No notifications yet.</p>'; return; }
    list.innerHTML = arr.map(n => `
      <div class="notification-item ${n.read ? '' : 'unread'}">
        <h4>${escapeHtml(n.title)}</h4>
        <p>${escapeHtml(n.body)}</p>
        <small>${escapeHtml(n.date)} ${n.read ? '· Read' : '· New'}</small>
      </div>
    `).join('');
  }
}

function markAllNotificationsRead(){
  const arr = getNotifications().map(n => ({...n, read:true}));
  saveNotifications(arr);
  renderNotifications();
  toast ? toast('Notifications marked as read') : alert('Notifications marked as read');
}

function savePortalNotification(){
  const title = qs('notifyTitle')?.value.trim();
  const body = qs('notifyBody')?.value.trim();
  if(!title || !body){ showSmall('notifyMsg','Title and message required.',false); return; }
  const arr = JSON.parse(localStorage.getItem('isp_admin_global_notifications') || '[]');
  arr.unshift({id:Date.now(),title,body,date:new Date().toLocaleString(),read:false});
  localStorage.setItem('isp_admin_global_notifications', JSON.stringify(arr.slice(0,30)));
  showSmall('notifyMsg','Notification saved successfully.',true);
  if(qs('notifyTitle')) qs('notifyTitle').value = '';
  if(qs('notifyBody')) qs('notifyBody').value = '';
}

/* Merge admin local notifications into user notifications */
function syncAdminNotifications(){
  const adminArr = JSON.parse(localStorage.getItem('isp_admin_global_notifications') || '[]');
  if(!adminArr.length) return;
  const userArr = getNotifications();
  const existing = new Set(userArr.map(x => x.id));
  adminArr.forEach(n => { if(!existing.has(n.id)) userArr.unshift(n); });
  saveNotifications(userArr.slice(0,40));
}

/* Hook dashboard load */
if(typeof loadDashboard === 'function'){
  const ISP_OLD_LOAD_DASHBOARD_V17 = loadDashboard;
  loadDashboard = async function(){
    await ISP_OLD_LOAD_DASHBOARD_V17();
    syncAdminNotifications();
    updateDailyProgress();
    renderNotifications();
  };
}

/* Extend section open */
if(typeof openDashSection === 'function'){
  const ISP_OLD_OPEN_DASH_SECTION_V17 = openDashSection;
  openDashSection = function(id,btn){
    ISP_OLD_OPEN_DASH_SECTION_V17(id,btn);
    if(id === 'notificationsModule') renderNotifications();
  };
}


/* ===== v18 Performance + Study Tools ===== */
const ISP_PERF_CACHE_VERSION = 'v18';
let ISP_PREFETCH_STARTED = false;

function applySavedTheme(){
  const theme = localStorage.getItem('isp_theme') || 'light';
  document.body.classList.toggle('portal-dark', theme === 'dark');
}
function togglePortalTheme(){
  const isDark = document.body.classList.toggle('portal-dark');
  localStorage.setItem('isp_theme', isDark ? 'dark' : 'light');
  if(typeof toast === 'function') toast(isDark ? 'Dark mode enabled' : 'Light mode enabled');
}
document.addEventListener('DOMContentLoaded', applySavedTheme);

function todayKey(){
  const d = new Date();
  return d.getFullYear() + '-' + (d.getMonth()+1) + '-' + d.getDate();
}
function getDailyReadCount(){
  const u = currentUser().email || 'guest';
  return Number(localStorage.getItem('isp_daily_read_' + u + '_' + todayKey()) || 0);
}
function setDailyReadCount(n){
  const u = currentUser().email || 'guest';
  localStorage.setItem('isp_daily_read_' + u + '_' + todayKey(), String(n));
  updateDailyProgress();
}
function updateDailyProgress(){
  const count = getDailyReadCount();
  const target = 5;
  const pct = Math.min(100, Math.round((count / target) * 100));
  if(qs('dailyProgressBar')) qs('dailyProgressBar').style.width = pct + '%';
  if(qs('dailyProgressText')) qs('dailyProgressText').textContent = `${count} of ${target} articles read today.`;
  if(qs('statToday')) qs('statToday').textContent = count;
}
function resetDailyProgress(){
  setDailyReadCount(0);
  if(typeof toast === 'function') toast('Daily progress reset');
}

/* Notification Center */
function defaultNotifications(){
  return [
    {id:1,title:'Welcome to IAS Selection Point',body:'Explore Knowledge Center, UPSC and UGC Political Science modules from your dashboard.',date:new Date().toLocaleDateString(),read:false},
    {id:2,title:'Study Tip',body:'Read at least 5 articles daily and revise your saved notes.',date:new Date().toLocaleDateString(),read:false}
  ];
}
function getNotifications(){
  const key = 'isp_notifications_' + (currentUser().email || 'guest');
  let arr = JSON.parse(localStorage.getItem(key) || 'null');
  if(!arr){ arr = defaultNotifications(); localStorage.setItem(key, JSON.stringify(arr)); }
  return arr;
}
function saveNotifications(arr){
  const key = 'isp_notifications_' + (currentUser().email || 'guest');
  localStorage.setItem(key, JSON.stringify(arr));
}
function renderNotifications(){
  const arr = getNotifications();
  const list = qs('notificationsList');
  const preview = qs('notificationPreviewBox');
  if(preview){
    const latest = arr.find(x => !x.read) || arr[0];
    preview.innerHTML = latest ? `<b>${escapeHtml(latest.title)}</b><p>${escapeHtml(latest.body)}</p>` : 'No notification.';
  }
  if(list){
    list.innerHTML = arr.length ? arr.map(n => `
      <div class="notification-item ${n.read ? '' : 'unread'}">
        <h4>${escapeHtml(n.title)}</h4>
        <p>${escapeHtml(n.body)}</p>
        <small>${escapeHtml(n.date)} ${n.read ? '· Read' : '· New'}</small>
      </div>`).join('') : '<p class="muted">No notifications yet.</p>';
  }
}
function markAllNotificationsRead(){
  saveNotifications(getNotifications().map(n => ({...n, read:true})));
  renderNotifications();
}
function savePortalNotification(){
  const title = qs('notifyTitle')?.value.trim();
  const body = qs('notifyBody')?.value.trim();
  if(!title || !body){ showSmall('notifyMsg','Title and message required.',false); return; }
  const arr = JSON.parse(localStorage.getItem('isp_admin_global_notifications') || '[]');
  arr.unshift({id:Date.now(),title,body,date:new Date().toLocaleString(),read:false});
  localStorage.setItem('isp_admin_global_notifications', JSON.stringify(arr.slice(0,30)));
  showSmall('notifyMsg','Notification saved successfully.',true);
  if(qs('notifyTitle')) qs('notifyTitle').value = '';
  if(qs('notifyBody')) qs('notifyBody').value = '';
}
function syncAdminNotifications(){
  const adminArr = JSON.parse(localStorage.getItem('isp_admin_global_notifications') || '[]');
  if(!adminArr.length) return;
  const userArr = getNotifications();
  const existing = new Set(userArr.map(x => x.id));
  adminArr.forEach(n => { if(!existing.has(n.id)) userArr.unshift(n); });
  saveNotifications(userArr.slice(0,40));
}

/* Pomodoro */
let pomodoroSeconds = 25 * 60;
let pomodoroTimer = null;
function updatePomodoroDisplay(){
  const m = Math.floor(pomodoroSeconds / 60);
  const s = pomodoroSeconds % 60;
  const el = qs('pomodoroTime');
  if(el) el.textContent = `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
}
function startPomodoro(){
  if(pomodoroTimer) return;
  pomodoroTimer = setInterval(() => {
    pomodoroSeconds--;
    updatePomodoroDisplay();
    if(pomodoroSeconds <= 0){
      clearInterval(pomodoroTimer);
      pomodoroTimer = null;
      pomodoroSeconds = 25 * 60;
      updatePomodoroDisplay();
      if(typeof toast === 'function') toast('Study session completed');
      setDailyReadCount(getDailyReadCount() + 1);
    }
  }, 1000);
}
function pausePomodoro(){
  if(pomodoroTimer){ clearInterval(pomodoroTimer); pomodoroTimer = null; }
}
function resetPomodoro(){
  pausePomodoro();
  pomodoroSeconds = 25 * 60;
  updatePomodoroDisplay();
}

/* Speed: cache feed results in localStorage */
function feedCacheKey(label){ return 'isp_feed_cache_' + ISP_PERF_CACHE_VERSION + '_' + label; }
function getLocalFeedCache(label){
  try{
    const raw = localStorage.getItem(feedCacheKey(label));
    if(!raw) return null;
    const obj = JSON.parse(raw);
    if(Date.now() - obj.time > 15 * 60 * 1000) return null;
    return obj.posts || null;
  }catch(e){ return null; }
}
function setLocalFeedCache(label, posts){
  try{ localStorage.setItem(feedCacheKey(label), JSON.stringify({time:Date.now(), posts})); }catch(e){}
}

if(typeof getCachedPosts === 'function'){
  const ISP_OLD_GET_CACHED_POSTS_V18 = getCachedPosts;
  getCachedPosts = async function(label,title,moduleName){
    const local = getLocalFeedCache(label);
    if(local && local.length){
      ISP_FEED_CACHE[label] = local;
      return local;
    }
    const posts = await ISP_OLD_GET_CACHED_POSTS_V18(label,title,moduleName);
    setLocalFeedCache(label, posts);
    return posts;
  };
}

/* Speed: show lightweight skeletons */
if(typeof showSkeleton === 'function'){
  showSkeleton = function(listId){
    if(qs(listId)) qs(listId).innerHTML = '<div class="fast-skeleton"></div><div class="fast-skeleton"></div><div class="fast-skeleton"></div>';
  };
}

/* Recently read + stats */
function updateReadingMiniStats(){
  const u = currentUser().email || 'guest';
  const history = JSON.parse(localStorage.getItem('isp_reading_history_' + u) || '[]');
  const bookmarks = JSON.parse(localStorage.getItem('isp_bookmarks_' + u) || '[]');
  const favs = JSON.parse(localStorage.getItem('isp_favourites_' + u) || '[]');
  if(qs('recentlyReadBox')){
    qs('recentlyReadBox').innerHTML = history.length ? `<b>${escapeHtml(history[0].title)}</b><br><small>${escapeHtml(history[0].date || '')}</small>` : 'No recent article yet.';
  }
  if(qs('statSaved')) qs('statSaved').textContent = bookmarks.length;
  if(qs('statFav')) qs('statFav').textContent = favs.length;
}

function addFavouriteArticle(post){
  const u = currentUser().email || 'guest';
  const key = 'isp_favourites_' + u;
  const arr = JSON.parse(localStorage.getItem(key) || '[]');
  if(!arr.some(x => x.title === post.title)){
    arr.unshift({title:post.title, link:post.link || '', date:new Date().toLocaleString()});
    localStorage.setItem(key, JSON.stringify(arr.slice(0,50)));
  }
  updateReadingMiniStats();
  if(typeof toast === 'function') toast('Added to favourites');
}

/* Override reader open for progress */
if(typeof openPostReader === 'function'){
  const ISP_OLD_OPEN_POST_READER_V18 = openPostReader;
  openPostReader = function(index){
    const post = ISP_LOADED_POSTS[index];
    ISP_OLD_OPEN_POST_READER_V18(index);
    if(post && post.title){
      const u = currentUser().email || 'guest';
      const readKey = 'isp_read_once_' + u + '_' + todayKey() + '_' + post.title;
      if(!localStorage.getItem(readKey)){
        localStorage.setItem(readKey, '1');
        setDailyReadCount(getDailyReadCount() + 1);
      }
      setTimeout(updateReadingMiniStats, 100);
    }
  };
}

/* Override post list: add Favourite button but keep title-only */
if(typeof renderLearningPosts === 'function'){
  renderLearningPosts = function(posts, listId){
    ISP_CURRENT_LIST_ID = listId;
    const total = posts.length;
    const totalPages = Math.max(1, Math.ceil(total / ISP_POSTS_PER_PAGE));
    if(ISP_POST_PAGE > totalPages) ISP_POST_PAGE = totalPages;
    if(ISP_POST_PAGE < 1) ISP_POST_PAGE = 1;

    const pagePosts = paginatePosts(posts, ISP_POST_PAGE);
    const html = pagePosts.map((p, localIndex) => {
      const realIndex = ((ISP_POST_PAGE - 1) * ISP_POSTS_PER_PAGE) + localIndex;
      return `<div class="post-item title-only-post" onclick="openPostReader(${realIndex})">
        <span class="module-tag">${escapeHtml(p.moduleName || '')}</span>
        <h4 title="${escapeAttr(p.title)}">${escapeHtml(p.title)}</h4>
        <span class="post-meta">${escapeHtml(p.categoryTitle || ISP_CURRENT_CATEGORY)} ${p.published ? '· ' + escapeHtml(p.published) : ''}</span>
        <div class="article-actions" onclick="event.stopPropagation()">
          <button onclick="quickSavePost('loaded',${realIndex})">🔖 Save</button>
          <button onclick="addFavouriteArticle(ISP_LOADED_POSTS[${realIndex}])">⭐ Fav</button>
          <button onclick="quickSharePost('loaded',${realIndex})">📤 Share</button>
        </div>
      </div>`;
    }).join('');

    const pagination = total > ISP_POSTS_PER_PAGE ? `
      <div class="pagination-bar">
        <button onclick="changePostPage(-1)" ${ISP_POST_PAGE <= 1 ? 'disabled' : ''}>← Previous</button>
        <span class="pagination-info">Showing ${((ISP_POST_PAGE-1)*ISP_POSTS_PER_PAGE)+1}-${Math.min(ISP_POST_PAGE*ISP_POSTS_PER_PAGE,total)} of ${total} posts · Page ${ISP_POST_PAGE} of ${totalPages}</span>
        <button onclick="changePostPage(1)" ${ISP_POST_PAGE >= totalPages ? 'disabled' : ''}>Next →</button>
      </div>` : '';
    setLearningListHtml(listId, html + pagination);
  };
}

/* Speed: defer non-critical loads */
function startSmartPrefetch(){
  if(ISP_PREFETCH_STARTED) return;
  ISP_PREFETCH_STARTED = true;
  const cats = [];
  try{
    if(typeof ISP_KNOWLEDGE_CATEGORIES !== 'undefined') cats.push(...ISP_KNOWLEDGE_CATEGORIES.slice(0,2));
    if(typeof ISP_UPSC_GS_CATEGORIES !== 'undefined') cats.push(...ISP_UPSC_GS_CATEGORIES.slice(0,1));
    if(typeof ISP_UGC_POLITICAL_SCIENCE !== 'undefined') cats.push(...ISP_UGC_POLITICAL_SCIENCE.slice(0,1));
  }catch(e){}
  cats.forEach((c,i)=>{
    setTimeout(()=>{ try{ getCachedPosts(c.label,c.title,c.module).catch(()=>{}); }catch(e){} }, 1200 + i*1200);
  });
}

/* Hook loadDashboard */
if(typeof loadDashboard === 'function'){
  const ISP_OLD_LOAD_DASHBOARD_V18 = loadDashboard;
  loadDashboard = async function(){
    applySavedTheme();
    await ISP_OLD_LOAD_DASHBOARD_V18();
    syncAdminNotifications();
    updateDailyProgress();
    renderNotifications();
    updatePomodoroDisplay();
    updateReadingMiniStats();
    setTimeout(startSmartPrefetch, 1500);
  };
}

if(typeof openDashSection === 'function'){
  const ISP_OLD_OPEN_DASH_SECTION_V18 = openDashSection;
  openDashSection = function(id,btn){
    ISP_OLD_OPEN_DASH_SECTION_V18(id,btn);
    if(id === 'notificationsModule') renderNotifications();
    if(id === 'studyToolsModule') updatePomodoroDisplay();
    if(id === 'library') updateReadingMiniStats();
  };
}


/* ===== v19 Backend Notifications + Daily Goal Email ===== */
function toggleNotifyEmailBox(){
  const target = qs('notifyTarget')?.value || 'all';
  if(qs('notifyEmail')) qs('notifyEmail').style.display = target === 'single' ? 'block' : 'none';
}

async function sendPortalNotification(){
  const target = qs('notifyTarget')?.value || 'all';
  const email = qs('notifyEmail')?.value.trim() || '';
  const title = qs('notifyTitle')?.value.trim() || '';
  const body = qs('notifyBody')?.value.trim() || '';
  if(!title || !body){ showSmall('notifyMsg','Title and message required.',false); return; }
  if(target === 'single' && !email){ showSmall('notifyMsg','User email required.',false); return; }
  showLoader('Sending notification...','Email and dashboard notification');
  const r = await api('adminSendPortalNotification',{token:token(),target,email,title,body});
  hideLoader();
  showSmall('notifyMsg', r.message, r.success);
  if(r.success){
    if(qs('notifyEmail')) qs('notifyEmail').value='';
    if(qs('notifyTitle')) qs('notifyTitle').value='';
    if(qs('notifyBody')) qs('notifyBody').value='';
  }
}

async function fetchBackendNotifications(){
  const r = await api('getNotifications',{token:token()});
  if(r && r.success){
    const key = 'isp_notifications_' + (currentUser().email || 'guest');
    const local = JSON.parse(localStorage.getItem(key) || '[]');
    const byId = new Map(local.map(n => [String(n.id), n]));
    (r.notifications || []).forEach(n => {
      if(!byId.has(String(n.id))) byId.set(String(n.id), {...n, read:false});
    });
    const merged = Array.from(byId.values()).sort((a,b)=>String(b.date).localeCompare(String(a.date)));
    localStorage.setItem(key, JSON.stringify(merged.slice(0,80)));
  }
  renderNotifications();
}

function updateNotificationBadge(){
  const arr = getNotifications ? getNotifications() : [];
  const count = arr.filter(n => !n.read).length;
  if(qs('notificationBadge')) qs('notificationBadge').textContent = count;
  if(qs('notificationBadge')) qs('notificationBadge').style.display = count ? 'inline-block' : 'none';
}

if(typeof renderNotifications === 'function'){
  const ISP_OLD_RENDER_NOTIFICATIONS_V19 = renderNotifications;
  renderNotifications = function(){
    ISP_OLD_RENDER_NOTIFICATIONS_V19();
    updateNotificationBadge();
  };
}

async function sendDailyGoalEmailIfNeeded(count){
  const u = currentUser();
  if(!u.email || count < 5) return;
  const key = 'isp_goal_email_sent_' + u.email + '_' + todayKey();
  if(localStorage.getItem(key)) return;
  localStorage.setItem(key, '1');
  try{
    await api('sendDailyGoalCongrats',{token:token(),count});
  }catch(e){}
}

if(typeof setDailyReadCount === 'function'){
  const ISP_OLD_SET_DAILY_READ_COUNT_V19 = setDailyReadCount;
  setDailyReadCount = function(n){
    ISP_OLD_SET_DAILY_READ_COUNT_V19(n);
    sendDailyGoalEmailIfNeeded(n);
  };
}

if(typeof loadDashboard === 'function'){
  const ISP_OLD_LOAD_DASHBOARD_V19 = loadDashboard;
  loadDashboard = async function(){
    await ISP_OLD_LOAD_DASHBOARD_V19();
    setTimeout(fetchBackendNotifications, 700);
    setInterval(fetchBackendNotifications, 60000);
  };
}

if(typeof markAllNotificationsRead === 'function'){
  const ISP_OLD_MARK_ALL_READ_V19 = markAllNotificationsRead;
  markAllNotificationsRead = function(){
    ISP_OLD_MARK_ALL_READ_V19();
    updateNotificationBadge();
  };
}


/* ===== v21 Admin Pro + WhatsApp + Profile Upgrade ===== */
function cleanPhoneForWhatsApp(mobile){
  let n = String(mobile || '').replace(/\D/g,'');
  if(!n) return '';
  if(n.length === 10) n = '91' + n;
  return n;
}

function buildWhatsAppMessage(user, type){
  const custom = qs('waCustomMessage')?.value.trim();
  if(custom) return custom;
  const name = user.name || 'Member';
  const portal = 'https://officialkaitsatnam.github.io/IAS-Selection-Point-/';
  const templates = {
    welcome: `Hello ${name}, welcome to IAS Selection Point Learning Portal. You can login and start your study journey here: ${portal}`,
    active: `Hello ${name}, your IAS Selection Point account has been activated. You can now access the learning portal: ${portal}`,
    blocked: `Hello ${name}, your IAS Selection Point account has been blocked. Please contact admin for more details.`,
    study: `Hello ${name}, new study material has been added on IAS Selection Point. Please check your dashboard: ${portal}`,
    goal: `Hello ${name}, keep your daily study target complete. Open IAS Selection Point and continue learning: ${portal}`
  };
  return templates[type] || templates.welcome;
}

function openWhatsAppForUser(email){
  const user = (ISP_ADMIN_USERS || []).find(x => String(x.email).toLowerCase() === String(email).toLowerCase());
  if(!user){ alert('User not found'); return; }
  const phone = cleanPhoneForWhatsApp(user.mobile || user.Mobile || '');
  if(!phone){ alert('Mobile/WhatsApp number not found for this user.'); return; }
  const type = qs('waTemplate')?.value || 'welcome';
  const msg = encodeURIComponent(buildWhatsAppMessage(user, type));
  window.open(`https://wa.me/${phone}?text=${msg}`, '_blank');
}

function openUserDetail(email){
  const user = (ISP_ADMIN_USERS || []).find(x => String(x.email).toLowerCase() === String(email).toLowerCase());
  if(!user){ alert('User not found'); return; }
  let modal = qs('userDetailModal');
  if(!modal){
    modal = document.createElement('div');
    modal.id = 'userDetailModal';
    modal.className = 'user-detail-modal';
    document.body.appendChild(modal);
  }
  modal.innerHTML = `
    <div class="user-detail-card">
      <div class="user-detail-head">
        <h3>👤 User Details</h3>
        <button onclick="closeUserDetail()">Close</button>
      </div>
      <div class="user-detail-body">
        <div class="detail-grid">
          <div class="detail-item"><small>Name</small><b>${escapeHtml(user.name || '')}</b></div>
          <div class="detail-item"><small>Email</small><b>${escapeHtml(user.email || '')}</b></div>
          <div class="detail-item"><small>Mobile</small><b>${escapeHtml(user.mobile || '')}</b></div>
          <div class="detail-item"><small>Role</small><b>${escapeHtml(user.role || '')}</b></div>
          <div class="detail-item"><small>Status</small><b>${escapeHtml(user.status || '')}</b></div>
          <div class="detail-item"><small>Last Login</small><b>${escapeHtml(user.lastLogin || '')}</b></div>
        </div>
        <div class="quick-actions" style="margin-top:16px;">
          <button onclick="openWhatsAppForUser('${escapeAttr(user.email)}')">💬 WhatsApp</button>
          <button onclick="prefillSingleMessage('${escapeAttr(user.email)}')">📧 Message</button>
          <button onclick="adminUpdateUser('${escapeAttr(user.email)}','Active')">Activate</button>
          <button onclick="adminUpdateUser('${escapeAttr(user.email)}','Deactivated')">Deactivate</button>
        </div>
      </div>
    </div>`;
  modal.classList.add('active');
}
function closeUserDetail(){
  if(qs('userDetailModal')) qs('userDetailModal').classList.remove('active');
}

function prefillSingleMessage(email){
  if(qs('singleMsgEmail')) qs('singleMsgEmail').value = email;
  openAdminSection('adminProTools');
  closeUserDetail();
}

async function sendSingleUserMessage(){
  const email = qs('singleMsgEmail')?.value.trim();
  const subject = qs('singleMsgSubject')?.value.trim();
  const body = qs('singleMsgBody')?.value.trim();
  if(!email || !subject || !body){
    showSmall('singleMsgStatus','Email, subject and message are required.',false);
    return;
  }
  showLoader('Sending message...','Email and dashboard notification');
  const r = await api('adminSendPortalNotification',{token:token(),target:'single',email,title:subject,body});
  hideLoader();
  showSmall('singleMsgStatus', r.message, r.success);
  if(r.success){
    qs('singleMsgSubject').value='';
    qs('singleMsgBody').value='';
  }
}

/* Strong admin table override with mobile/WhatsApp */
renderUsersTable = function(users){
  const tbody=qs('usersTable'); 
  if(!tbody)return;
  tbody.innerHTML=users.map(x=>{
    const isAdmin=String(x.role).toLowerCase()==='admin';
    const status=String(x.status||'Active');
    const sl=status.toLowerCase();
    const sc=sl==='blocked'?'blocked':sl==='deleted'?'deleted':sl==='pending'?'pending':sl==='deactivated'?'deactivated':'';
    const rc=isAdmin?'admin':'member';
    return `<tr>
      <td><b>${escapeHtml(x.name||'')}</b></td>
      <td>${escapeHtml(x.email||'')}</td>
      <td>${escapeHtml(x.mobile||'')}</td>
      <td><span class="role-pill ${rc}">${escapeHtml(x.role||'')}</span></td>
      <td><span class="status-pill ${sc}">${escapeHtml(status)}</span></td>
      <td>${escapeHtml(x.lastLogin||'')}</td>
      <td>
        <div class="action-btns">
          <button class="action-btn view-btn" onclick="openUserDetail('${escapeAttr(x.email)}')">View</button>
          <button class="action-btn wa-btn" onclick="openWhatsAppForUser('${escapeAttr(x.email)}')" ${x.mobile?'':'disabled'}>WhatsApp</button>
          <button class="action-btn email-btn" onclick="prefillSingleMessage('${escapeAttr(x.email)}')">Msg</button>
          <button class="action-btn activate-btn" onclick="adminUpdateUser('${escapeAttr(x.email)}','Active')" ${isAdmin?'disabled':''}>Activate</button>
          <button class="action-btn deactivate-btn" onclick="adminUpdateUser('${escapeAttr(x.email)}','Deactivated')" ${isAdmin?'disabled':''}>Deactivate</button>
          <button class="action-btn block-btn" onclick="adminUpdateUser('${escapeAttr(x.email)}','Blocked')" ${isAdmin?'disabled':''}>Block</button>
          <button class="action-btn delete-btn" onclick="adminDeleteUser('${escapeAttr(x.email)}')" ${isAdmin?'disabled':''}>Delete</button>
        </div>
      </td>
    </tr>`;
  }).join('');
};

/* Upgrade loadAdmin to keep mobile from backend rows */
if(typeof loadAdmin === 'function'){
  const ISP_OLD_LOAD_ADMIN_V21 = loadAdmin;
  loadAdmin = async function(){
    showLoader('Opening admin panel...','Loading users and controls');
    const u=currentUser(); 
    if(!u.email||u.role!=='Admin'){location.href='index.html';return}
    if(qs('adminEmail'))qs('adminEmail').textContent=u.email;
    const r=await api('adminStats',{token:token()}); 
    hideLoader();
    if(r.success){
      ISP_ADMIN_USERS=r.users||[]; 
      if(qs('totalUsers'))qs('totalUsers').textContent=r.totalUsers||0; 
      if(qs('activeUsers'))qs('activeUsers').textContent=r.activeUsers||0; 
      if(qs('blockedUsers'))qs('blockedUsers').textContent=ISP_ADMIN_USERS.filter(x=>['blocked','deactivated'].includes(String(x.status).toLowerCase())).length; 
      if(qs('adminCount'))qs('adminCount').textContent=ISP_ADMIN_USERS.filter(x=>x.role==='Admin').length||1; 
      renderUsersTable(ISP_ADMIN_USERS); 
      renderRecentUsersV14(ISP_ADMIN_USERS); 
      renderAdminLogsLocal();
    }else alert(r.message);
  };
}

/* Profile pro local fields + backend save */
if(typeof saveProfile === 'function'){
  const ISP_OLD_SAVE_PROFILE_V21 = saveProfile;
  saveProfile = async function(){
    const extra = {
      subject: qs('profileSubject')?.value || '',
      goal: qs('profileGoal')?.value || '',
      bio: qs('profileBio')?.value || ''
    };
    localStorage.setItem('isp_profile_extra_' + (currentUser().email || 'guest'), JSON.stringify(extra));
    await ISP_OLD_SAVE_PROFILE_V21();
    updateProfileSummary();
  };
}

function loadProfileExtra(){
  const extra = JSON.parse(localStorage.getItem('isp_profile_extra_' + (currentUser().email || 'guest')) || '{}');
  if(qs('profileSubject')) qs('profileSubject').value = extra.subject || '';
  if(qs('profileGoal')) qs('profileGoal').value = extra.goal || '';
  if(qs('profileBio')) qs('profileBio').value = extra.bio || '';
  updateProfileSummary();
}

function updateProfileSummary(){
  const extra = JSON.parse(localStorage.getItem('isp_profile_extra_' + (currentUser().email || 'guest')) || '{}');
  if(qs('profileSummaryCard')){
    qs('profileSummaryCard').innerHTML = `<b>${escapeHtml(currentUser().name || 'Member')}</b>
      <span>${escapeHtml(qs('profileExam')?.value || 'Target exam not selected')} · ${escapeHtml(extra.subject || 'Subject not added')} · ${escapeHtml(extra.goal || 'Goal not added')}</span>`;
  }
}

if(typeof loadDashboard === 'function'){
  const ISP_OLD_LOAD_DASHBOARD_V21 = loadDashboard;
  loadDashboard = async function(){
    await ISP_OLD_LOAD_DASHBOARD_V21();
    setTimeout(loadProfileExtra, 600);
  };
}

if(typeof openDashSection === 'function'){
  const ISP_OLD_OPEN_DASH_SECTION_V21 = openDashSection;
  openDashSection = function(id,btn){
    ISP_OLD_OPEN_DASH_SECTION_V21(id,btn);
    if(id === 'profile') loadProfileExtra();
  };
}


/* ===== v22 Enterprise Admin Suite ===== */
let ISP_SELECTED_USERS = new Set();
let ISP_ADMIN_TICKETS = [];

function updateSelectedUserCount(){
  if(qs('selectedUserCount')) qs('selectedUserCount').textContent = `${ISP_SELECTED_USERS.size} selected`;
  const all = document.querySelectorAll('.user-select-checkbox');
  if(qs('selectAllUsers')) qs('selectAllUsers').checked = all.length > 0 && Array.from(all).every(x => x.checked);
}
function toggleUserSelection(email, checked){
  if(checked) ISP_SELECTED_USERS.add(email);
  else ISP_SELECTED_USERS.delete(email);
  updateSelectedUserCount();
}
function toggleSelectAllUsers(){
  const checked = !!qs('selectAllUsers')?.checked;
  document.querySelectorAll('.user-select-checkbox').forEach(cb => {
    cb.checked = checked;
    toggleUserSelection(cb.dataset.email, checked);
  });
}
function getSelectedEmails(){ return Array.from(ISP_SELECTED_USERS); }

function filterUsers(){
  const q=(qs('userSearch')?.value||'').toLowerCase();
  const status=(qs('userStatusFilter')?.value||'').toLowerCase();
  const filtered=(ISP_ADMIN_USERS||[]).filter(x=>{
    const matchesText =
      String(x.name||'').toLowerCase().includes(q) ||
      String(x.email||'').toLowerCase().includes(q) ||
      String(x.mobile||'').toLowerCase().includes(q);
    const matchesStatus = !status || String(x.status||'').toLowerCase() === status;
    return matchesText && matchesStatus;
  });
  renderUsersTable(filtered);
}

renderUsersTable = function(users){
  const tbody=qs('usersTable');
  if(!tbody)return;
  tbody.innerHTML=users.map(x=>{
    const isAdmin=String(x.role).toLowerCase()==='admin';
    const status=String(x.status||'Active');
    const sl=status.toLowerCase();
    const sc=sl==='blocked'?'blocked':sl==='deleted'?'deleted':sl==='pending'?'pending':sl==='deactivated'?'deactivated':'';
    const rc=isAdmin?'admin':'member';
    const selected=ISP_SELECTED_USERS.has(x.email);
    return `<tr>
      <td><input class="ticket-check user-select-checkbox" type="checkbox" data-email="${escapeAttr(x.email)}" ${selected?'checked':''} onchange="toggleUserSelection('${escapeAttr(x.email)}',this.checked)"></td>
      <td><b>${escapeHtml(x.name||'')}</b></td>
      <td>${escapeHtml(x.email||'')}</td>
      <td>${escapeHtml(x.mobile||'')}</td>
      <td><span class="role-pill ${rc}">${escapeHtml(x.role||'')}</span></td>
      <td><span class="status-pill ${sc}">${escapeHtml(status)}</span></td>
      <td>${escapeHtml(x.lastLogin||'')}</td>
      <td><div class="action-btns">
        <button class="action-btn view-btn" onclick="openUserDetail('${escapeAttr(x.email)}')">View</button>
        <button class="action-btn wa-btn" onclick="openWhatsAppForUser('${escapeAttr(x.email)}')" ${x.mobile?'':'disabled'}>WhatsApp</button>
        <button class="action-btn email-btn" onclick="prefillSingleMessage('${escapeAttr(x.email)}')">Msg</button>
        <button class="action-btn activate-btn" onclick="adminUpdateUser('${escapeAttr(x.email)}','Active')" ${isAdmin?'disabled':''}>Activate</button>
        <button class="action-btn deactivate-btn" onclick="adminUpdateUser('${escapeAttr(x.email)}','Deactivated')" ${isAdmin?'disabled':''}>Deactivate</button>
        <button class="action-btn block-btn" onclick="adminUpdateUser('${escapeAttr(x.email)}','Blocked')" ${isAdmin?'disabled':''}>Block</button>
      </div></td>
    </tr>`;
  }).join('');
  updateSelectedUserCount();
};

async function bulkUpdateUsers(status){
  const emails=getSelectedEmails();
  if(!emails.length){ alert('Select at least one user.'); return; }
  if(!confirm(`Set ${emails.length} selected user(s) as ${status}?`)) return;
  showLoader('Updating users...','Applying bulk action');
  const r=await api('adminBulkUpdateUsers',{token:token(),emails,status});
  hideLoader();
  if(r.success){
    ISP_SELECTED_USERS.clear();
    toast(r.message);
    await loadAdmin();
  }else alert(r.message);
}

function openSelectedCommunication(){
  if(!ISP_SELECTED_USERS.size){ alert('Select users first.'); return; }
  if(qs('commAudience')) qs('commAudience').value='selected';
  openAdminSection('adminCommunicationHub');
  toggleCommunicationAudience();
}
function toggleCommunicationAudience(){
  const val=qs('commAudience')?.value||'all';
  if(qs('commSingleEmailWrap')) qs('commSingleEmailWrap').style.display=val==='single'?'block':'none';
}
async function sendCommunicationHub(){
  const audience=qs('commAudience')?.value||'all';
  const email=qs('commSingleEmail')?.value.trim()||'';
  const title=qs('commSubject')?.value.trim()||'';
  const body=qs('commMessage')?.value.trim()||'';
  const sendEmail=!!qs('commEmail')?.checked;
  const sendDashboard=!!qs('commDashboard')?.checked;
  const emails=audience==='selected'?getSelectedEmails():[];
  if(!title||!body){showSmall('commStatus','Subject and message are required.',false);return}
  if(audience==='single'&&!email){showSmall('commStatus','Single user email is required.',false);return}
  if(audience==='selected'&&!emails.length){showSmall('commStatus','Select users first.',false);return}
  showLoader('Sending communication...','Please wait');
  const r=await api('adminCommunicationHub',{token:token(),audience,email,emails,title,body,sendEmail,sendDashboard});
  hideLoader();
  showSmall('commStatus',r.message,r.success);
  if(r.success){
    qs('commSubject').value='';
    qs('commMessage').value='';
  }
}

/* Admin support tickets */
async function loadAdminTickets(){
  const r=await api('adminListTickets',{token:token()});
  if(r.success){ ISP_ADMIN_TICKETS=r.tickets||[]; renderAdminTickets(); }
  else if(qs('adminTicketsList')) qs('adminTicketsList').innerHTML=`<p class="muted">${escapeHtml(r.message)}</p>`;
}
function renderAdminTickets(){
  const box=qs('adminTicketsList'); if(!box)return;
  const filter=qs('ticketStatusFilter')?.value||'';
  const rows=ISP_ADMIN_TICKETS.filter(t=>!filter||t.status===filter);
  if(qs('openTicketsCount')) qs('openTicketsCount').textContent=ISP_ADMIN_TICKETS.filter(t=>t.status!=='Resolved').length;
  if(!rows.length){box.innerHTML='<p class="muted">No tickets found.</p>';return}
  box.innerHTML=rows.map(t=>`<div class="ticket-card ${String(t.status).toLowerCase()}">
    <div class="ticket-head"><div><h4>${escapeHtml(t.subject)}</h4><div class="ticket-meta">${escapeHtml(t.category)} · ${escapeHtml(t.email)} · ${escapeHtml(t.createdAt)}</div></div><span class="status-pill">${escapeHtml(t.status)}</span></div>
    <div class="ticket-body">${escapeHtml(t.message)}</div>
    ${t.adminReply?`<div class="ticket-reply"><b>Admin Reply:</b><br>${escapeHtml(t.adminReply)}</div>`:''}
    <textarea id="reply_${escapeAttr(t.id)}" placeholder="Write reply...">${escapeHtml(t.adminReply||'')}</textarea>
    <div class="ticket-actions">
      <select id="status_${escapeAttr(t.id)}"><option ${t.status==='Open'?'selected':''}>Open</option><option ${t.status==='Pending'?'selected':''}>Pending</option><option ${t.status==='Resolved'?'selected':''}>Resolved</option></select>
      <button onclick="updateAdminTicket('${escapeAttr(t.id)}')">Save Reply & Status</button>
    </div>
  </div>`).join('');
}
async function updateAdminTicket(id){
  const reply=qs('reply_'+id)?.value.trim()||'';
  const status=qs('status_'+id)?.value||'Pending';
  showLoader('Updating ticket...','Saving reply');
  const r=await api('adminUpdateTicket',{token:token(),ticketId:id,reply,status});
  hideLoader();
  if(r.success){toast(r.message);loadAdminTickets()}else alert(r.message);
}

/* User support tickets */
async function createSupportTicket(){
  const category=qs('ticketCategory')?.value||'Technical Issue';
  const subject=qs('ticketSubject')?.value.trim()||'';
  const message=qs('ticketMessage')?.value.trim()||'';
  if(!subject||!message){showSmall('ticketMsg','Subject and message are required.',false);return}
  showLoader('Submitting ticket...','Please wait');
  const r=await api('createTicket',{token:token(),category,subject,message});
  hideLoader();
  showSmall('ticketMsg',r.message,r.success);
  if(r.success){
    qs('ticketSubject').value='';
    qs('ticketMessage').value='';
    loadMyTickets();
  }
}
async function loadMyTickets(){
  const box=qs('myTicketsList'); if(!box)return;
  const r=await api('listMyTickets',{token:token()});
  if(!r.success){box.innerHTML=`<p class="muted">${escapeHtml(r.message)}</p>`;return}
  const rows=r.tickets||[];
  if(!rows.length){box.innerHTML='<p class="muted">No support tickets yet.</p>';return}
  box.innerHTML=rows.map(t=>`<div class="ticket-card ${String(t.status).toLowerCase()}">
    <div class="ticket-head"><h4>${escapeHtml(t.subject)}</h4><span class="status-pill">${escapeHtml(t.status)}</span></div>
    <div class="ticket-meta">${escapeHtml(t.category)} · ${escapeHtml(t.createdAt)}</div>
    <div class="ticket-body">${escapeHtml(t.message)}</div>
    ${t.adminReply?`<div class="ticket-reply"><b>Admin Reply:</b><br>${escapeHtml(t.adminReply)}</div>`:''}
  </div>`).join('');
}

/* Hook admin/dashboard sections */
if(typeof openAdminSection==='function'){
  const OLD_OPEN_ADMIN_V22=openAdminSection;
  openAdminSection=function(id,btn){
    OLD_OPEN_ADMIN_V22(id,btn);
    if(id==='adminTickets') loadAdminTickets();
  };
}
if(typeof openDashSection==='function'){
  const OLD_OPEN_DASH_V22=openDashSection;
  openDashSection=function(id,btn){
    OLD_OPEN_DASH_V22(id,btn);
    if(id==='supportModule') loadMyTickets();
  };
}
if(typeof loadAdmin==='function'){
  const OLD_LOAD_ADMIN_V22=loadAdmin;
  loadAdmin=async function(){
    await OLD_LOAD_ADMIN_V22();
    const r=await api('adminEnterpriseStats',{token:token()});
    if(r.success){
      if(qs('newUsersToday'))qs('newUsersToday').textContent=r.newUsersToday||0;
      if(qs('loginsToday'))qs('loginsToday').textContent=r.loginsToday||0;
      if(qs('emailsSentCount'))qs('emailsSentCount').textContent=r.emailsSent||0;
      if(qs('openTicketsCount'))qs('openTicketsCount').textContent=r.openTickets||0;
    }
    setTimeout(loadAdminTickets,300);
  };
}


/* ===== v23 Google Sheet Center ===== */
async function formatGoogleSheets(){
  showLoader('Formatting Google Sheets...','Applying professional design');
  const r=await api('formatAllSheets',{token:token()});
  hideLoader();
  showSmall('sheetCenterMsg',r.message,r.success);
}
async function refreshSheetDashboard(){
  showLoader('Refreshing Sheet Dashboard...','Building database summary');
  const r=await api('refreshSheetDashboard',{token:token()});
  hideLoader();
  showSmall('sheetCenterMsg',r.message,r.success);
}
async function runSheetMaintenance(){
  showLoader('Running maintenance...','Cleaning empty rows and refreshing filters');
  const r=await api('runSheetMaintenance',{token:token()});
  hideLoader();
  showSmall('sheetCenterMsg',r.message,r.success);
}


/* ===== v23.1 Sheet Center Stable Hotfix ===== */
async function formatGoogleSheets(){
  showLoader('Formatting Google Sheets...','Refreshing professional design safely');
  const r=await api('formatAllSheets',{token:token()});
  hideLoader();
  showSmall('sheetCenterMsg',r.message,r.success);
}
async function refreshSheetDashboard(){
  showLoader('Refreshing Sheet Dashboard...','Rebuilding database summary safely');
  const r=await api('refreshSheetDashboard',{token:token()});
  hideLoader();
  showSmall('sheetCenterMsg',r.message,r.success);
}
async function runSheetMaintenance(){
  showLoader('Running maintenance...','Cleaning filters, rows and alternating colors safely');
  const r=await api('runSheetMaintenance',{token:token()});
  hideLoader();
  showSmall('sheetCenterMsg',r.message,r.success);
}


/* ===== v24 Student Performance + Achievements ===== */
const ISP_BADGES = [
  {id:'first_read',icon:'📖',name:'First Step',desc:'Read your first article',target:1},
  {id:'five_reads',icon:'⭐',name:'Focused Learner',desc:'Read 5 articles',target:5},
  {id:'twenty_reads',icon:'🏅',name:'Consistent Reader',desc:'Read 20 articles',target:20},
  {id:'fifty_reads',icon:'🥇',name:'Knowledge Seeker',desc:'Read 50 articles',target:50},
  {id:'streak_3',icon:'🔥',name:'3-Day Streak',desc:'Study for 3 consecutive days',streak:3},
  {id:'streak_7',icon:'💎',name:'7-Day Champion',desc:'Study for 7 consecutive days',streak:7}
];

function performanceKey(){
  return 'isp_performance_' + (currentUser().email || 'guest');
}
function getPerformanceData(){
  const fallback={totalReads:0,days:{},lastReadDate:'',streak:0,badges:[]};
  try{return {...fallback,...JSON.parse(localStorage.getItem(performanceKey())||'{}')}}
  catch(e){return fallback}
}
function savePerformanceData(data){
  localStorage.setItem(performanceKey(),JSON.stringify(data));
}
function isoDate(d=new Date()){
  const y=d.getFullYear(),m=String(d.getMonth()+1).padStart(2,'0'),day=String(d.getDate()).padStart(2,'0');
  return `${y}-${m}-${day}`;
}
function calculateStreak(days){
  let streak=0;
  const d=new Date();
  for(let i=0;i<365;i++){
    const key=isoDate(d);
    if(Number(days[key]||0)>0){streak++;d.setDate(d.getDate()-1)}
    else break;
  }
  return streak;
}
function recordPerformanceRead(post){
  const data=getPerformanceData();
  const today=isoDate();
  const uniqueKey='isp_perf_once_'+(currentUser().email||'guest')+'_'+today+'_'+(post?.title||'article');
  if(localStorage.getItem(uniqueKey)) return;
  localStorage.setItem(uniqueKey,'1');
  data.totalReads=Number(data.totalReads||0)+1;
  data.days[today]=Number(data.days[today]||0)+1;
  data.lastReadDate=today;
  data.streak=calculateStreak(data.days);
  data.badges=ISP_BADGES.filter(b=>
    (b.target&&data.totalReads>=b.target)||(b.streak&&data.streak>=b.streak)
  ).map(b=>b.id);
  savePerformanceData(data);
  syncPerformanceBackend(data);
  renderPerformanceDashboard();
}
async function syncPerformanceBackend(data){
  try{
    await api('syncStudyProgress',{
      token:token(),
      totalReads:data.totalReads,
      streak:data.streak,
      days:data.days,
      badges:data.badges
    });
  }catch(e){}
}
function renderPerformanceDashboard(){
  const data=getPerformanceData();
  const today=isoDate();
  const todayCount=Number(data.days[today]||0);
  const goal=Math.min(100,Math.round((todayCount/5)*100));
  const now=new Date();
  let weekly=0;
  const weekData=[];
  for(let i=6;i>=0;i--){
    const d=new Date(now);
    d.setDate(now.getDate()-i);
    const key=isoDate(d);
    const count=Number(data.days[key]||0);
    weekly+=count;
    weekData.push({label:d.toLocaleDateString(undefined,{weekday:'short'}).slice(0,2),count});
  }

  if(qs('currentStreak'))qs('currentStreak').textContent=data.streak||0;
  if(qs('totalReadStat'))qs('totalReadStat').textContent=data.totalReads||0;
  if(qs('weeklyReadStat'))qs('weeklyReadStat').textContent=weekly;
  if(qs('badgeCountStat'))qs('badgeCountStat').textContent=(data.badges||[]).length;
  if(qs('goalPercentStat'))qs('goalPercentStat').textContent=goal+'%';
  if(qs('goalRingText'))qs('goalRingText').textContent=goal+'%';
  if(qs('goalRing'))qs('goalRing').style.setProperty('--progress',(goal*3.6)+'deg');
  if(qs('goalDescription'))qs('goalDescription').textContent=`${todayCount} of 5 articles completed today`;

  const cal=qs('readingCalendar');
  if(cal){
    const boxes=[];
    for(let i=27;i>=0;i--){
      const d=new Date(now);
      d.setDate(now.getDate()-i);
      const key=isoDate(d);
      const count=Number(data.days[key]||0);
      const level=count>=5?4:count>=3?3:count>=2?2:count>=1?1:0;
      boxes.push(`<div class="calendar-day level-${level}" title="${escapeAttr(key)} · ${count} read">${d.getDate()}</div>`);
    }
    cal.innerHTML=boxes.join('');
  }

  const achievement=qs('achievementGrid');
  if(achievement){
    achievement.innerHTML=ISP_BADGES.map(b=>{
      const unlocked=(data.badges||[]).includes(b.id);
      return `<div class="achievement-card ${unlocked?'':'locked'}">
        <div class="achievement-icon">${b.icon}</div>
        <div><b>${escapeHtml(b.name)}</b><small>${escapeHtml(b.desc)}</small></div>
      </div>`;
    }).join('');
  }

  const bars=qs('weeklyProgressChart');
  if(bars){
    const max=Math.max(5,...weekData.map(x=>x.count));
    bars.innerHTML=weekData.map(x=>{
      const h=Math.max(6,Math.round((x.count/max)*150));
      return `<div class="week-bar-item"><b>${x.count}</b><div class="week-bar" style="height:${h}px"></div><span>${x.label}</span></div>`;
    }).join('');
  }
}

if(typeof openPostReader==='function'){
  const OLD_OPEN_POST_READER_V24=openPostReader;
  openPostReader=function(index){
    const post=ISP_LOADED_POSTS[index];
    OLD_OPEN_POST_READER_V24(index);
    if(post) recordPerformanceRead(post);
  };
}
if(typeof openDashSection==='function'){
  const OLD_OPEN_DASH_V24=openDashSection;
  openDashSection=function(id,btn){
    OLD_OPEN_DASH_V24(id,btn);
    if(id==='performanceModule')renderPerformanceDashboard();
  };
}
if(typeof loadDashboard==='function'){
  const OLD_LOAD_DASH_V24=loadDashboard;
  loadDashboard=async function(){
    await OLD_LOAD_DASH_V24();
    setTimeout(renderPerformanceDashboard,400);
  };
}

/* Admin performance */
async function loadAdminPerformance(){
  const r=await api('adminPerformanceStats',{token:token()});
  if(!r.success){
    if(qs('adminLeaderboard'))qs('adminLeaderboard').innerHTML=`<p class="muted">${escapeHtml(r.message)}</p>`;
    return;
  }
  if(qs('adminTotalReads'))qs('adminTotalReads').textContent=r.totalReads||0;
  if(qs('adminActiveStreaks'))qs('adminActiveStreaks').textContent=r.activeStreaks||0;
  if(qs('adminBadgesAwarded'))qs('adminBadgesAwarded').textContent=r.badgesAwarded||0;
  if(qs('adminTopScore'))qs('adminTopScore').textContent=r.topScore||0;
  const box=qs('adminLeaderboard');
  const rows=r.leaderboard||[];
  if(box){
    box.innerHTML=rows.length?rows.map((x,i)=>`<div class="leaderboard-item">
      <div class="leaderboard-rank">${i+1}</div>
      <div class="leaderboard-user"><b>${escapeHtml(x.name||x.email)}</b><small>${escapeHtml(x.email)}</small></div>
      <div class="leaderboard-score">${x.totalReads} reads</div>
      <div class="leaderboard-streak">🔥 ${x.streak}</div>
    </div>`).join(''):'<p class="muted">No performance data yet.</p>';
  }
}
if(typeof openAdminSection==='function'){
  const OLD_OPEN_ADMIN_V24=openAdminSection;
  openAdminSection=function(id,btn){
    OLD_OPEN_ADMIN_V24(id,btn);
    if(id==='adminPerformance')loadAdminPerformance();
  };
}

/* ===== v25 Performance Engine + Smart Reader ===== */
const ISP_V25_CACHE_TTL=30*60*1000;
const ISP_PENDING_REQUESTS=new Map();
let ISP_V25_SEARCH_TIMER=null;
let ISP_V25_CURRENT_POST=null;
let ISP_V25_FONT=Number(localStorage.getItem('isp_v25_font')||18);
let ISP_V25_THEME=localStorage.getItem('isp_v25_theme')||'light';

function v25CacheGet(key){try{const raw=localStorage.getItem('isp_v25_'+key);if(!raw)return null;const obj=JSON.parse(raw);if(Date.now()-obj.time>ISP_V25_CACHE_TTL){localStorage.removeItem('isp_v25_'+key);return null}return obj.data}catch(e){return null}}
function v25CacheSet(key,data){try{localStorage.setItem('isp_v25_'+key,JSON.stringify({time:Date.now(),data}))}catch(e){}}

if(typeof api==='function'){
  const OLD_API_V25=api;
  api=async function(action,payload={}){
    const key=action+'|'+JSON.stringify(payload);
    if(ISP_PENDING_REQUESTS.has(key))return ISP_PENDING_REQUESTS.get(key);
    const p=OLD_API_V25(action,payload).finally(()=>ISP_PENDING_REQUESTS.delete(key));
    ISP_PENDING_REQUESTS.set(key,p);
    return p;
  };
}

if(typeof getCachedPosts==='function'){
  const OLD_GET_CACHED_POSTS_V25=getCachedPosts;
  getCachedPosts=async function(label,title,moduleName){
    const local=v25CacheGet('feed_'+label);
    if(local&&local.length){ISP_FEED_CACHE[label]=local;return local}
    const result=await OLD_GET_CACHED_POSTS_V25(label,title,moduleName);
    v25CacheSet('feed_'+label,result);
    return result;
  };
}

if(typeof showSkeleton==='function'){
  showSkeleton=function(listId){
    const el=qs(listId);
    if(el)el.innerHTML='<div class="fast-skeleton"></div><div class="fast-skeleton"></div><div class="fast-skeleton"></div>';
  };
}

if(typeof filterLoadedPosts==='function'){
  const OLD_FILTER_V25=filterLoadedPosts;
  filterLoadedPosts=function(){
    clearTimeout(ISP_V25_SEARCH_TIMER);
    ISP_V25_SEARCH_TIMER=setTimeout(()=>OLD_FILTER_V25(),180);
  };
}

function v25HistoryKey(){return 'isp_v25_history_'+(currentUser().email||'guest')}
function v25GetHistory(){try{return JSON.parse(localStorage.getItem(v25HistoryKey())||'[]')}catch(e){return []}}
function v25SaveHistory(arr){localStorage.setItem(v25HistoryKey(),JSON.stringify(arr.slice(0,50)))}
function v25AddHistory(post){
  if(!post||!post.title)return;
  const rows=v25GetHistory().filter(x=>x.title!==post.title);
  rows.unshift({title:post.title,category:post.categoryTitle||ISP_CURRENT_CATEGORY||'',openedAt:new Date().toLocaleString(),scroll:0});
  v25SaveHistory(rows);
}
function renderReadingHistory(){
  const box=qs('readingHistoryList');if(!box)return;
  const rows=v25GetHistory();
  box.innerHTML=rows.length?rows.map((x,i)=>`<div class="history-item"><div><b>${escapeHtml(x.title)}</b><small>${escapeHtml(x.category)} · ${escapeHtml(x.openedAt)}</small></div><button onclick="openHistoryArticle(${i})">Continue</button></div>`).join(''):'<p class="muted">No reading history yet.</p>';
}
function openHistoryArticle(i){
  const item=v25GetHistory()[i];if(!item)return;
  const index=ISP_LOADED_POSTS.findIndex(x=>x.title===item.title);
  if(index<0)return alert('Open the related category first, then continue reading.');
  openPostReader(index);
  setTimeout(()=>{const body=v25ReaderBody();if(body)body.scrollTop=Number(item.scroll||0)},250);
}
function clearReadingHistory(){if(confirm('Clear reading history?')){localStorage.removeItem(v25HistoryKey());renderReadingHistory()}}

function v25ReaderBody(){return qs('readerContent')||qs('articleReaderContent')||document.querySelector('.reader-content')}
function v25EnsureReaderTools(){
  const body=v25ReaderBody();if(!body||qs('v25ReaderTools'))return;
  const tools=document.createElement('div');
  tools.id='v25ReaderTools';tools.className='v25-reader-tools';
  tools.innerHTML='<button onclick="v25ChangeFont(-1)">A−</button><button onclick="v25ChangeFont(1)">A+</button><button onclick="v25SetTheme(\'light\')">Light</button><button onclick="v25SetTheme(\'sepia\')">Sepia</button><button onclick="v25SetTheme(\'dark\')">Dark</button><button onclick="v25Speak()">🔊 Listen</button><button onclick="v25Print()">🖨 Print</button>';
  body.parentElement.insertBefore(tools,body);
  const progress=document.createElement('div');progress.className='v25-reader-progress';progress.innerHTML='<span id="v25ReaderProgress"></span>';
  body.parentElement.insertBefore(progress,body);
}
function v25ApplyReader(){
  const body=v25ReaderBody();if(!body)return;
  body.style.fontSize=ISP_V25_FONT+'px';
  body.classList.remove('v25-reader-sepia','v25-reader-dark');
  if(ISP_V25_THEME==='sepia')body.classList.add('v25-reader-sepia');
  if(ISP_V25_THEME==='dark')body.classList.add('v25-reader-dark');
}
function v25ChangeFont(delta){ISP_V25_FONT=Math.max(14,Math.min(26,ISP_V25_FONT+delta));localStorage.setItem('isp_v25_font',ISP_V25_FONT);v25ApplyReader()}
function v25SetTheme(theme){ISP_V25_THEME=theme;localStorage.setItem('isp_v25_theme',theme);v25ApplyReader()}
function v25UpdateProgress(){
  const body=v25ReaderBody();if(!body)return;
  const max=Math.max(1,body.scrollHeight-body.clientHeight);
  const pct=Math.min(100,Math.round((body.scrollTop/max)*100));
  if(qs('v25ReaderProgress'))qs('v25ReaderProgress').style.width=pct+'%';
  if(ISP_V25_CURRENT_POST){
    const rows=v25GetHistory(),item=rows.find(x=>x.title===ISP_V25_CURRENT_POST.title);
    if(item){item.scroll=body.scrollTop;v25SaveHistory(rows)}
  }
}
function v25Speak(){const body=v25ReaderBody();if(!body||!('speechSynthesis'in window))return alert('Text-to-speech unsupported.');speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(body.innerText.slice(0,12000));u.rate=.95;speechSynthesis.speak(u)}
function v25Print(){const body=v25ReaderBody();if(!body)return;const w=window.open('','_blank');w.document.write(`<html><head><title>${escapeHtml(ISP_V25_CURRENT_POST?.title||'Article')}</title></head><body>${body.innerHTML}</body></html>`);w.document.close();w.print()}

if(typeof openPostReader==='function'){
  const OLD_OPEN_READER_V25=openPostReader;
  openPostReader=function(index){
    ISP_V25_CURRENT_POST=ISP_LOADED_POSTS[index]||null;
    v25AddHistory(ISP_V25_CURRENT_POST);
    OLD_OPEN_READER_V25(index);
    setTimeout(()=>{
      v25EnsureReaderTools();v25ApplyReader();
      const body=v25ReaderBody();
      if(body){body.removeEventListener('scroll',v25UpdateProgress);body.addEventListener('scroll',v25UpdateProgress,{passive:true});v25UpdateProgress()}
    },200);
  };
}

if(typeof openDashSection==='function'){
  const OLD_OPEN_DASH_V25=openDashSection;
  openDashSection=function(id,btn){OLD_OPEN_DASH_V25(id,btn);if(id==='readingHistoryModule')renderReadingHistory()};
}
if(typeof loadDashboard==='function'){
  const OLD_LOAD_DASH_V25=loadDashboard;
  loadDashboard=async function(){await OLD_LOAD_DASH_V25();requestAnimationFrame(()=>setTimeout(()=>{try{renderReadingHistory()}catch(e){}},350))};
}
window.startSmartPrefetch=function(){if(ISP_PREFETCH_STARTED)return;ISP_PREFETCH_STARTED=true;setTimeout(()=>{try{const first=(typeof ISP_KNOWLEDGE_CATEGORIES!=='undefined'&&ISP_KNOWLEDGE_CATEGORIES[0])||null;if(first)getCachedPosts(first.label,first.title,first.module).catch(()=>{})}catch(e){}},4000)};


/* ===== v26 Premium Reader + Offline Performance ===== */
let ISP_V26_CURRENT_INDEX=-1;
let ISP_V26_READER_THEME=localStorage.getItem('isp_v26_reader_theme')||'light';
let ISP_V26_READER_FONT=Number(localStorage.getItem('isp_v26_reader_font')||18);
let ISP_V26_FOCUS=localStorage.getItem('isp_v26_focus')==='1';

function v26OfflineKey(title){
  return 'isp_v26_offline_'+btoa(unescape(encodeURIComponent(title))).replace(/=/g,'');
}
function v26SaveOfflineArticle(post){
  if(!post||!post.title)return;
  try{
    const data={title:post.title,content:post.content||post.html||'',category:post.categoryTitle||'',published:post.published||'',savedAt:Date.now()};
    localStorage.setItem(v26OfflineKey(post.title),JSON.stringify(data));
    const index=JSON.parse(localStorage.getItem('isp_v26_offline_index')||'[]').filter(x=>x.title!==post.title);
    index.unshift({title:post.title,key:v26OfflineKey(post.title),savedAt:Date.now()});
    const keep=index.slice(0,20);
    localStorage.setItem('isp_v26_offline_index',JSON.stringify(keep));
    index.slice(20).forEach(x=>localStorage.removeItem(x.key));
  }catch(e){}
}
function v26GetResume(title){
  try{return Number(localStorage.getItem('isp_v26_resume_'+title)||0)}catch(e){return 0}
}
function v26SetResume(title,value){
  try{localStorage.setItem('isp_v26_resume_'+title,String(value))}catch(e){}
}
function v26ReaderRoot(){
  return document.querySelector('.reader-shell-premium');
}
function v26ReaderContent(){
  return qs('v26ReaderContent');
}
function v26BuildReader(post,index){
  const oldModal=qs('readerModal')||document.querySelector('.reader-modal')||document.querySelector('.article-reader');
  if(!oldModal)return false;
  ISP_V26_CURRENT_INDEX=index;

  const title=post?.title||'Article';
  const content=post?.content||post?.html||post?.full||post?.plain||'';
  const category=post?.categoryTitle||ISP_CURRENT_CATEGORY||'Article';
  const date=post?.published||'';
  const words=String(content).replace(/<[^>]+>/g,' ').trim().split(/\s+/).filter(Boolean).length;
  const mins=Math.max(1,Math.ceil(words/220));

  oldModal.innerHTML=`
    <div class="reader-shell-premium" id="v26ReaderRoot">
      <div class="reader-premium-header">
        <button class="reader-back-btn" onclick="v261ClosePremiumReader()">← Back</button>
        <h2>${escapeHtml(title)}</h2>
        <span class="reader-offline-badge">⚡ Cached</span>
      </div>
      <div class="reader-premium-progress"><span id="v26TopProgress"></span></div>
      <div class="reader-layout-premium">
        <article class="reader-paper">
          <div class="reader-paper-inner" id="v26ReaderContent">
            <h1>${escapeHtml(title)}</h1>
            <div class="reader-meta-premium">
              <span>${escapeHtml(category)}</span>
              ${date?`<span>${escapeHtml(date)}</span>`:''}
              <span>Estimated reading time: ${mins} min</span>
            </div>
            <div id="v26ArticleBody">${content}</div>
            <div class="reader-nav-bottom">
              <button onclick="v26OpenAdjacent(-1)" ${index<=0?'disabled':''}>← Previous Article</button>
              <button onclick="v26OpenAdjacent(1)" ${index>=ISP_LOADED_POSTS.length-1?'disabled':''}>Next Article →</button>
            </div>
          </div>
        </article>
        <aside class="reader-sidebar-premium">
          <div class="reader-tool-card">
            <div class="reader-progress-circle" id="v26ProgressCircle"><span id="v26CircleText">0%</span></div>
            <div class="reader-tool-grid">
              <button onclick="v26ChangeFont(-1)">A−</button>
              <button onclick="v26ChangeFont(1)">A+</button>
              <button onclick="v26SetTheme('light')">Light</button>
              <button onclick="v26SetTheme('sepia')">Sepia</button>
              <button onclick="v26SetTheme('dark')">Dark</button>
              <button onclick="v26ToggleFocus()">Focus</button>
              <button onclick="v26Speak()">🔊 Listen</button>
              <button onclick="v26Print()">🖨 Print</button>
              <button onclick="quickSavePost('loaded',${index})">🔖 Save</button>
              <button onclick="quickSharePost('loaded',${index})">📤 Share</button>
            </div>
          </div>
          <div class="reader-toc-card">
            <h4>Contents</h4>
            <div class="reader-toc-list" id="v26Toc"></div>
          </div>
          <div class="reader-related-card">
            <h4>Related Articles</h4>
            <div class="reader-related-list" id="v26Related"></div>
          </div>
        </aside>
      </div>
    </div>`;

  v26ApplyTheme();
  v26BuildToc();
  v26BuildRelated(index);
  v26SaveOfflineArticle(post);

  const contentEl=v26ReaderContent();
  if(contentEl){
    contentEl.style.fontSize=ISP_V26_READER_FONT+'px';
    contentEl.addEventListener('scroll',v26UpdateProgress,{passive:true});
    window.addEventListener('scroll',v26UpdateProgress,{passive:true});
  }

  const resume=v26GetResume(title);
  if(resume>0){
    setTimeout(()=>{
      window.scrollTo({top:resume,behavior:'smooth'});
      v26ShowResumeToast(Math.round(resume));
    },220);
  }
  v26UpdateProgress();
  return true;
}
function v26ApplyTheme(){
  const root=v26ReaderRoot();if(!root)return;
  root.classList.remove('reader-sepia','reader-dark','reader-focus-mode');
  if(ISP_V26_READER_THEME==='sepia')root.classList.add('reader-sepia');
  if(ISP_V26_READER_THEME==='dark')root.classList.add('reader-dark');
  if(ISP_V26_FOCUS)root.classList.add('reader-focus-mode');
}
function v26ChangeFont(delta){
  ISP_V26_READER_FONT=Math.max(14,Math.min(27,ISP_V26_READER_FONT+delta));
  localStorage.setItem('isp_v26_reader_font',ISP_V26_READER_FONT);
  const el=v26ReaderContent();if(el)el.style.fontSize=ISP_V26_READER_FONT+'px';
}
function v26SetTheme(theme){
  ISP_V26_READER_THEME=theme;
  localStorage.setItem('isp_v26_reader_theme',theme);
  v26ApplyTheme();
}
function v26ToggleFocus(){
  ISP_V26_FOCUS=!ISP_V26_FOCUS;
  localStorage.setItem('isp_v26_focus',ISP_V26_FOCUS?'1':'0');
  v26ApplyTheme();
}
function v26UpdateProgress(){
  const doc=document.documentElement;
  const max=Math.max(1,doc.scrollHeight-window.innerHeight);
  const pct=Math.min(100,Math.round((window.scrollY/max)*100));
  if(qs('v26TopProgress'))qs('v26TopProgress').style.width=pct+'%';
  if(qs('v26CircleText'))qs('v26CircleText').textContent=pct+'%';
  if(qs('v26ProgressCircle'))qs('v26ProgressCircle').style.setProperty('--reader-angle',(pct*3.6)+'deg');
  const post=ISP_LOADED_POSTS[ISP_V26_CURRENT_INDEX];
  if(post?.title)v26SetResume(post.title,window.scrollY);
}
function v26BuildToc(){
  const body=qs('v26ArticleBody'),toc=qs('v26Toc');
  if(!body||!toc)return;
  const headings=[...body.querySelectorAll('h2,h3')];
  if(!headings.length){toc.innerHTML='<span class="muted">No headings available.</span>';return}
  toc.innerHTML=headings.map((h,i)=>{
    if(!h.id)h.id='v26_heading_'+i;
    return `<button onclick="document.getElementById('${h.id}').scrollIntoView({behavior:'smooth'})">${escapeHtml(h.textContent)}</button>`;
  }).join('');
}
function v26BuildRelated(index){
  const box=qs('v26Related');if(!box)return;
  const current=ISP_LOADED_POSTS[index];
  const rows=ISP_LOADED_POSTS.filter((x,i)=>i!==index&&(x.categoryTitle===current?.categoryTitle||!current?.categoryTitle)).slice(0,4);
  box.innerHTML=rows.length?rows.map(x=>{
    const real=ISP_LOADED_POSTS.indexOf(x);
    return `<button onclick="openPostReader(${real})">${escapeHtml(x.title)}</button>`;
  }).join(''):'<span class="muted">No related articles.</span>';
}
function v26OpenAdjacent(dir){
  const next=ISP_V26_CURRENT_INDEX+dir;
  if(next>=0&&next<ISP_LOADED_POSTS.length)openPostReader(next);
}
function v26Speak(){
  const body=qs('v26ArticleBody');
  if(!body||!('speechSynthesis'in window))return alert('Text-to-speech is not supported.');
  speechSynthesis.cancel();
  const u=new SpeechSynthesisUtterance(body.innerText.slice(0,18000));
  u.rate=.95;
  speechSynthesis.speak(u);
}
function v26Print(){
  const body=qs('v26ArticleBody'),post=ISP_LOADED_POSTS[ISP_V26_CURRENT_INDEX];
  if(!body)return;
  const w=window.open('','_blank');
  w.document.write(`<html><head><title>${escapeHtml(post?.title||'Article')}</title><style>body{font-family:Arial;max-width:760px;margin:40px auto;line-height:1.7}</style></head><body><h1>${escapeHtml(post?.title||'Article')}</h1>${body.innerHTML}</body></html>`);
  w.document.close();w.print();
}
function v26ShowResumeToast(position){
  const el=document.createElement('div');
  el.className='reader-resume-toast';
  el.textContent='Continued from your last reading position';
  document.body.appendChild(el);
  setTimeout(()=>el.remove(),2200);
}
document.addEventListener('keydown',e=>{
  if(!v26ReaderRoot())return;
  if(e.key==='ArrowLeft')v26OpenAdjacent(-1);
  if(e.key==='ArrowRight')v26OpenAdjacent(1);
  if(e.key.toLowerCase()==='f')v26ToggleFocus();
  if(e.key.toLowerCase()==='d')v26SetTheme(ISP_V26_READER_THEME==='dark'?'light':'dark');
  if(e.key==='+')v26ChangeFont(1);
  if(e.key==='-')v26ChangeFont(-1);
});

if(typeof openPostReader==='function'){
  const OLD_OPEN_POST_READER_V26=openPostReader;
  openPostReader=function(index){
    const post=ISP_LOADED_POSTS[index];
    OLD_OPEN_POST_READER_V26(index);
    setTimeout(()=>{
      try{v26BuildReader(post,index)}catch(e){console.error('v26 reader',e)}
    },90);
  };
}

/* Faster instant article cache */
function v26WarmArticleCache(posts){
  (posts||[]).slice(0,5).forEach(post=>{
    if(post?.title&&(post.content||post.html))v26SaveOfflineArticle(post);
  });
}
if(typeof renderLearningPosts==='function'){
  const OLD_RENDER_LEARNING_V26=renderLearningPosts;
  renderLearningPosts=function(posts,listId){
    OLD_RENDER_LEARNING_V26(posts,listId);
    requestIdleCallback?requestIdleCallback(()=>v26WarmArticleCache(posts),{timeout:1200}):setTimeout(()=>v26WarmArticleCache(posts),700);
  };
}


/* ===== v26.1 Reader Back Button Hotfix ===== */
function v261ClosePremiumReader(){
  try{
    if('speechSynthesis' in window) window.speechSynthesis.cancel();
  }catch(e){}

  const modal =
    (typeof qs === 'function' && qs('readerModal')) ||
    document.getElementById('readerModal') ||
    document.querySelector('.reader-modal') ||
    document.querySelector('.article-reader');

  if(modal){
    modal.classList.remove('active');
    modal.classList.remove('dark-reader');
  }

  document.body.classList.remove('reader-open');
  document.documentElement.classList.remove('reader-open');

  try{
    if(document.fullscreenElement && document.exitFullscreen){
      document.exitFullscreen().catch(function(){});
    }
  }catch(e){}

  window.scrollTo({top:0, behavior:'smooth'});
}

/* Compatibility alias for any old/new reader button. */
window.closePostReader = v261ClosePremiumReader;


/* =========================================================
   v27 FINAL STABLE CONTROL LAYER
   ========================================================= */
(function(){
  'use strict';

  let currentIndex = -1;
  let currentPost = null;
  let readerFont = Number(localStorage.getItem('isp_v27_reader_font') || 18);
  let readerTheme = localStorage.getItem('isp_v27_reader_theme') || 'light';
  let focusMode = localStorage.getItem('isp_v27_reader_focus') === '1';
  let speechActive = false;

  function getModal(){
    return document.getElementById('readerModal');
  }

  function sanitizedContent(post){
    const html = post && (post.content || post.html || post.full || '');
    try{
      return typeof sanitizePostHtml === 'function' ? sanitizePostHtml(html) : html;
    }catch(e){
      return html || '<p>Article content is unavailable.</p>';
    }
  }

  function estimate(post){
    try{
      if(typeof estimateReadTime === 'function') return estimateReadTime(post.content || '');
    }catch(e){}
    const words = String(post.content || '').replace(/<[^>]+>/g,' ').trim().split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.ceil(words / 200));
  }

  function buildReader(index){
    const posts = Array.isArray(window.ISP_LOADED_POSTS) ? window.ISP_LOADED_POSTS : ISP_LOADED_POSTS;
    const post = posts && posts[index];
    if(!post) return;

    currentIndex = index;
    currentPost = post;
    window.ISP_CURRENT_READER_POST = post;

    const modal = getModal();
    if(!modal) return;

    modal.className = 'reader-modal v27-reader-modal active';
    modal.innerHTML = `
      <div class="v27-reader-shell">
        <header class="v27-reader-header">
          <button class="v27-reader-button" type="button" data-v27-action="back">← Back</button>
          <h2>${escapeHtml(post.title || 'Article')}</h2>
          <button class="v27-reader-button secondary" type="button" data-v27-action="save">🔖 Save</button>
          <button class="v27-reader-button secondary" type="button" data-v27-action="share">📤 Share</button>
        </header>
        <div class="v27-reader-progress"><span id="v27TopProgress"></span></div>

        <div class="v27-reader-layout">
          <article class="v27-reader-paper">
            <div class="v27-reader-content" id="v27ReaderContent">
              <h1>${escapeHtml(post.title || 'Article')}</h1>
              <div class="v27-reader-meta">
                <span>${escapeHtml(post.moduleName || '')}</span>
                <span>${escapeHtml(post.categoryTitle || window.ISP_CURRENT_CATEGORY || '')}</span>
                ${post.published ? `<span>${escapeHtml(post.published)}</span>` : ''}
                <span>${estimate(post)} min read</span>
              </div>
              <div id="v27ArticleBody">${sanitizedContent(post)}</div>
              <div class="v27-reader-nav">
                <button type="button" data-v27-action="previous" ${index <= 0 ? 'disabled' : ''}>← Previous</button>
                <button type="button" data-v27-action="next" ${index >= posts.length - 1 ? 'disabled' : ''}>Next →</button>
              </div>
            </div>
          </article>

          <aside class="v27-reader-side">
            <div class="v27-reader-card">
              <div class="v27-progress-circle" id="v27ProgressCircle"><span id="v27CircleText">0%</span></div>
              <div class="v27-tool-grid">
                <button type="button" data-v27-action="font-down">A−</button>
                <button type="button" data-v27-action="font-up">A+</button>
                <button type="button" data-v27-action="light">Light</button>
                <button type="button" data-v27-action="sepia">Sepia</button>
                <button type="button" data-v27-action="dark">Dark</button>
                <button type="button" data-v27-action="focus">Focus</button>
                <button type="button" data-v27-action="listen">🔊 Listen</button>
                <button type="button" data-v27-action="stop-listen">⏹ Stop</button>
                <button type="button" data-v27-action="fullscreen">⛶ Screen</button>
                <button type="button" data-v27-action="print">🖨 Print</button>
                <button type="button" data-v27-action="copy">🔗 Copy</button>
                <button type="button" data-v27-action="bookmark">⭐ Fav</button>
                <button type="button" data-v27-action="note">📝 Note</button>
                <button type="button" data-v27-action="revision">🎯 Revise</button>
              </div>
            </div>

            <div class="v27-reader-card">
              <h4>Contents</h4>
              <div class="v27-toc" id="v27Toc"></div>
            </div>

            <div class="v27-reader-card">
              <h4>Related Articles</h4>
              <div class="v27-related" id="v27Related"></div>
            </div>
          </aside>
        </div>
      </div>`;

    document.body.classList.add('v27-reader-open');
    applyReaderSettings();
    buildToc();
    buildRelated();
    restorePosition();

    window.addEventListener('scroll', updateProgress, {passive:true});
    updateProgress();

    try{
      if(typeof saveReadingHistory === 'function') saveReadingHistory(post);
      if(typeof renderContinueReading === 'function') renderContinueReading();
      if(typeof v25AddHistory === 'function') v25AddHistory(post);
      if(typeof recordPerformanceRead === 'function') recordPerformanceRead(post);
    }catch(e){}
  }

  function closeReaderStable(){
    try{
      if('speechSynthesis' in window) speechSynthesis.cancel();
    }catch(e){}
    speechActive = false;
    savePosition();

    const modal = getModal();
    if(modal){
      modal.classList.remove('active');
      modal.innerHTML = '';
    }
    document.body.classList.remove('v27-reader-open');
    window.removeEventListener('scroll', updateProgress);

    if(document.fullscreenElement && document.exitFullscreen){
      document.exitFullscreen().catch(function(){});
    }
  }

  function applyReaderSettings(){
    const modal = getModal();
    const content = document.getElementById('v27ReaderContent');
    if(!modal || !content) return;

    content.style.fontSize = readerFont + 'px';
    modal.classList.remove('v27-reader-sepia','v27-reader-dark','v27-reader-focus');
    if(readerTheme === 'sepia') modal.classList.add('v27-reader-sepia');
    if(readerTheme === 'dark') modal.classList.add('v27-reader-dark');
    if(focusMode) modal.classList.add('v27-reader-focus');
  }

  function setTheme(theme){
    readerTheme = theme;
    localStorage.setItem('isp_v27_reader_theme', theme);
    applyReaderSettings();
  }

  function changeFont(delta){
    readerFont = Math.max(14, Math.min(28, readerFont + delta));
    localStorage.setItem('isp_v27_reader_font', readerFont);
    applyReaderSettings();
  }

  function toggleFocus(){
    focusMode = !focusMode;
    localStorage.setItem('isp_v27_reader_focus', focusMode ? '1' : '0');
    applyReaderSettings();
  }

  function updateProgress(){
    const modal = getModal();
    if(!modal || !modal.classList.contains('active')) return;
    const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const percent = Math.min(100, Math.max(0, Math.round((window.scrollY / max) * 100)));

    const top = document.getElementById('v27TopProgress');
    const circle = document.getElementById('v27ProgressCircle');
    const text = document.getElementById('v27CircleText');

    if(top) top.style.width = percent + '%';
    if(circle) circle.style.setProperty('--v27-angle', (percent * 3.6) + 'deg');
    if(text) text.textContent = percent + '%';

    savePosition();
  }

  function positionKey(){
    return 'isp_v27_position_' + (currentPost ? currentPost.title : '');
  }

  function savePosition(){
    if(!currentPost) return;
    try{ localStorage.setItem(positionKey(), String(window.scrollY || 0)); }catch(e){}
  }

  function restorePosition(){
    if(!currentPost) return;
    let pos = 0;
    try{ pos = Number(localStorage.getItem(positionKey()) || 0); }catch(e){}
    if(pos > 80){
      setTimeout(function(){
        window.scrollTo({top:pos, behavior:'smooth'});
      }, 180);
    }else{
      window.scrollTo(0,0);
    }
  }

  function buildToc(){
    const body = document.getElementById('v27ArticleBody');
    const box = document.getElementById('v27Toc');
    if(!body || !box) return;
    const headings = Array.from(body.querySelectorAll('h2,h3'));
    if(!headings.length){
      box.innerHTML = '<span class="muted">No headings available.</span>';
      return;
    }
    box.innerHTML = '';
    headings.forEach(function(h, i){
      if(!h.id) h.id = 'v27_heading_' + i;
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = h.textContent || ('Section ' + (i+1));
      btn.addEventListener('click', function(){
        h.scrollIntoView({behavior:'smooth', block:'start'});
      });
      box.appendChild(btn);
    });
  }

  function buildRelated(){
    const box = document.getElementById('v27Related');
    if(!box) return;
    const posts = ISP_LOADED_POSTS || [];
    const related = posts
      .map(function(post,index){ return {post:post,index:index}; })
      .filter(function(x){
        return x.index !== currentIndex &&
          (!currentPost.categoryTitle || x.post.categoryTitle === currentPost.categoryTitle);
      })
      .slice(0,4);

    if(!related.length){
      box.innerHTML = '<span class="muted">No related articles.</span>';
      return;
    }
    box.innerHTML = '';
    related.forEach(function(item){
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = item.post.title || 'Article';
      btn.addEventListener('click', function(){ buildReader(item.index); });
      box.appendChild(btn);
    });
  }

  function saveArticle(){
    if(!currentPost) return;
    try{
      if(typeof saveArticleToBookmarks === 'function'){
        saveArticleToBookmarks(currentPost);
      }else if(typeof quickSavePost === 'function'){
        quickSavePost('loaded', currentIndex);
      }
    }catch(e){
      alert('Unable to save article.');
    }
  }

  async function shareArticle(){
    if(!currentPost) return;
    try{
      if(navigator.share){
        await navigator.share({
          title: currentPost.title || 'Article',
          text: currentPost.title || '',
          url: currentPost.link || location.href
        });
      }else if(typeof sharePost === 'function'){
        await sharePost(currentPost);
      }else{
        await navigator.clipboard.writeText(currentPost.link || location.href);
        alert('Link copied.');
      }
    }catch(e){}
  }

  async function copyLink(){
    try{
      await navigator.clipboard.writeText((currentPost && currentPost.link) || location.href);
      if(typeof toast === 'function') toast('Article link copied');
      else alert('Article link copied');
    }catch(e){
      alert('Copy failed.');
    }
  }

  function listen(){
    const body = document.getElementById('v27ArticleBody');
    if(!body || !('speechSynthesis' in window)){
      alert('Text-to-speech is not supported.');
      return;
    }
    speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(body.innerText.slice(0,18000));
    utterance.rate = 0.95;
    speechActive = true;
    utterance.onend = function(){ speechActive = false; };
    speechSynthesis.speak(utterance);
  }

  function stopListen(){
    if('speechSynthesis' in window) speechSynthesis.cancel();
    speechActive = false;
  }

  function printArticle(){
    const body = document.getElementById('v27ArticleBody');
    if(!body) return;
    const win = window.open('', '_blank');
    if(!win) return alert('Please allow pop-ups to print.');
    win.document.write(
      '<html><head><title>' + escapeHtml(currentPost.title || 'Article') + '</title>' +
      '<style>body{font-family:Arial,sans-serif;max-width:760px;margin:40px auto;line-height:1.7;padding:0 20px}h1{line-height:1.2}</style>' +
      '</head><body><h1>' + escapeHtml(currentPost.title || 'Article') + '</h1>' +
      body.innerHTML + '</body></html>'
    );
    win.document.close();
    win.focus();
    setTimeout(function(){ win.print(); }, 250);
  }

  function toggleFullscreen(){
    const modal = getModal();
    if(!modal) return;
    if(document.fullscreenElement){
      document.exitFullscreen().catch(function(){});
    }else if(modal.requestFullscreen){
      modal.requestFullscreen().catch(function(){});
    }
  }

  function openAdjacent(direction){
    const next = currentIndex + direction;
    if(next >= 0 && next < ISP_LOADED_POSTS.length){
      buildReader(next);
    }
  }

  function favourite(){
    try{
      if(typeof addFavouriteArticle === 'function'){
        addFavouriteArticle(currentPost);
      }else{
        saveArticle();
      }
    }catch(e){
      saveArticle();
    }
  }

  document.addEventListener('click', function(event){
    const button = event.target.closest('[data-v27-action]');
    if(!button) return;

    event.preventDefault();
    event.stopPropagation();

    const action = button.getAttribute('data-v27-action');
    const actions = {
      back: closeReaderStable,
      save: saveArticle,
      share: shareArticle,
      copy: copyLink,
      'font-down': function(){ changeFont(-1); },
      'font-up': function(){ changeFont(1); },
      light: function(){ setTheme('light'); },
      sepia: function(){ setTheme('sepia'); },
      dark: function(){ setTheme('dark'); },
      focus: toggleFocus,
      listen: listen,
      'stop-listen': stopListen,
      fullscreen: toggleFullscreen,
      print: printArticle,
      bookmark: favourite,
      note: function(){ window.openV28NoteModal(currentPost); },
      revision: function(){ window.openV28RevisionPicker(currentPost); },
      previous: function(){ openAdjacent(-1); },
      next: function(){ openAdjacent(1); }
    };
    if(actions[action]) actions[action]();
  });

  document.addEventListener('keydown', function(event){
    const modal = getModal();
    if(!modal || !modal.classList.contains('active')) return;

    if(event.key === 'Escape') closeReaderStable();
    else if(event.key === 'ArrowLeft') openAdjacent(-1);
    else if(event.key === 'ArrowRight') openAdjacent(1);
    else if(event.key.toLowerCase() === 'f') toggleFocus();
    else if(event.key.toLowerCase() === 'd') setTheme(readerTheme === 'dark' ? 'light' : 'dark');
    else if(event.key === '+') changeFont(1);
    else if(event.key === '-') changeFont(-1);
  });

  // Final global overrides
  window.openPostReader = buildReader;
  window.closeReader = closeReaderStable;
  window.closePostReader = closeReaderStable;
  window.v261ClosePremiumReader = closeReaderStable;

  // Mobile sidebar
  function sidebar(){
    return document.querySelector('.sidebar-pro');
  }
  function backdrop(){
    return document.getElementById('mobileSidebarBackdrop');
  }
  function openMobileSidebar(){
    const side = sidebar();
    const back = backdrop();
    if(side) side.classList.add('mobile-open');
    if(back) back.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
  function closeMobileSidebar(){
    const side = sidebar();
    const back = backdrop();
    if(side) side.classList.remove('mobile-open');
    if(back) back.classList.remove('active');
    if(!document.body.classList.contains('v27-reader-open')) document.body.style.overflow = '';
  }

  document.addEventListener('DOMContentLoaded', function(){
    const menu = document.getElementById('mobileMenuButton');
    const back = backdrop();

    if(menu) menu.addEventListener('click', openMobileSidebar);
    if(back) back.addEventListener('click', closeMobileSidebar);

    document.querySelectorAll('.side-nav button, .side-logout').forEach(function(btn){
      btn.addEventListener('click', function(){
        if(window.innerWidth <= 900) closeMobileSidebar();
      });
    });
  });

  window.addEventListener('resize', function(){
    if(window.innerWidth > 900) closeMobileSidebar();
  });
})();


/* =========================================================
   v28 PWA + NOTES + REVISION CENTER
   ========================================================= */
let V28_INSTALL_PROMPT = null;
let V28_REVISION_FILTER = 'all';
let V28_NOTE_POST = null;

function v28UserKey(prefix){
  return prefix + '_' + ((typeof currentUser==='function' && currentUser().email) || 'guest');
}
function v28GetNotes(){
  try{return JSON.parse(localStorage.getItem(v28UserKey('isp_v28_notes'))||'[]')}catch(e){return []}
}
function v28SaveNotes(rows){
  localStorage.setItem(v28UserKey('isp_v28_notes'),JSON.stringify(rows.slice(0,200)));
}
function v28GetRevisions(){
  try{return JSON.parse(localStorage.getItem(v28UserKey('isp_v28_revisions'))||'[]')}catch(e){return []}
}
function v28SaveRevisions(rows){
  localStorage.setItem(v28UserKey('isp_v28_revisions'),JSON.stringify(rows.slice(0,300)));
}

window.openV28NoteModal=function(post){
  V28_NOTE_POST=post||window.ISP_CURRENT_READER_POST||null;
  let modal=document.getElementById('v28NoteModal');
  if(!modal){
    modal=document.createElement('div');
    modal.id='v28NoteModal';
    modal.className='v28-note-modal';
    modal.innerHTML=`
      <div class="v28-note-dialog">
        <header><h3>📝 Add Personal Note</h3><button type="button" onclick="closeV28NoteModal()">Close</button></header>
        <div class="body">
          <p class="muted" id="v28NoteArticleTitle"></p>
          <textarea id="v28NoteText" placeholder="Write your note, important point or revision summary..."></textarea>
          <div class="actions">
            <button class="mini-btn" type="button" onclick="closeV28NoteModal()">Cancel</button>
            <button class="primary-btn" type="button" onclick="saveV28Note()">Save Note</button>
          </div>
        </div>
      </div>`;
    document.body.appendChild(modal);
  }
  const title=document.getElementById('v28NoteArticleTitle');
  if(title)title.textContent=V28_NOTE_POST?.title||'General Note';
  const area=document.getElementById('v28NoteText');
  if(area)area.value='';
  modal.classList.add('active');
  setTimeout(()=>area&&area.focus(),100);
};
window.closeV28NoteModal=function(){
  const modal=document.getElementById('v28NoteModal');
  if(modal)modal.classList.remove('active');
};
window.saveV28Note=function(){
  const text=document.getElementById('v28NoteText')?.value.trim()||'';
  if(!text)return alert('Please write a note.');
  const post=V28_NOTE_POST||{};
  const rows=v28GetNotes();
  rows.unshift({
    id:'NOTE_'+Date.now(),
    title:post.title||'General Note',
    category:post.categoryTitle||window.ISP_CURRENT_CATEGORY||'',
    articleLink:post.link||'',
    text:text,
    createdAt:new Date().toISOString()
  });
  v28SaveNotes(rows);
  closeV28NoteModal();
  if(typeof toast==='function')toast('Note saved');
  renderV28Notes();
  try{
    if(typeof api==='function')api('saveV28Note',{token:token(),note:rows[0]}).catch(()=>{});
  }catch(e){}
};
window.renderV28Notes=function(){
  const box=document.getElementById('v28NotesList');
  if(!box)return;
  const q=(document.getElementById('notesSearch')?.value||'').toLowerCase();
  const rows=v28GetNotes().filter(n=>
    String(n.title||'').toLowerCase().includes(q)||
    String(n.text||'').toLowerCase().includes(q)||
    String(n.category||'').toLowerCase().includes(q)
  );
  if(!rows.length){box.innerHTML='<p class="muted">No notes found.</p>';return}
  box.innerHTML=rows.map(n=>`<div class="v28-note-card">
    <div class="v28-note-head"><div><h4>${escapeHtml(n.title)}</h4><div class="v28-note-meta">${escapeHtml(n.category||'')} · ${escapeHtml(new Date(n.createdAt).toLocaleString())}</div></div></div>
    <div class="v28-note-body">${escapeHtml(n.text)}</div>
    <div class="v28-card-actions">
      <button onclick="copyV28Note('${escapeAttr(n.id)}')">Copy</button>
      <button class="danger" onclick="deleteV28Note('${escapeAttr(n.id)}')">Delete</button>
    </div>
  </div>`).join('');
};
window.copyV28Note=async function(id){
  const n=v28GetNotes().find(x=>x.id===id);if(!n)return;
  try{await navigator.clipboard.writeText(n.text);if(typeof toast==='function')toast('Note copied')}catch(e){alert('Copy failed')}
};
window.deleteV28Note=function(id){
  if(!confirm('Delete this note?'))return;
  v28SaveNotes(v28GetNotes().filter(x=>x.id!==id));
  renderV28Notes();
};

window.openV28RevisionPicker=function(post){
  const target=post||window.ISP_CURRENT_READER_POST;
  if(!target)return;
  const choice=prompt('Revision after how many days? Enter 1, 7 or 30','7');
  if(choice===null)return;
  const days=[1,7,30].includes(Number(choice))?Number(choice):7;
  const due=new Date();
  due.setDate(due.getDate()+days);
  const rows=v28GetRevisions().filter(x=>x.title!==target.title||x.status==='completed');
  const item={
    id:'REV_'+Date.now(),
    title:target.title,
    category:target.categoryTitle||window.ISP_CURRENT_CATEGORY||'',
    link:target.link||'',
    dueDate:due.toISOString(),
    createdAt:new Date().toISOString(),
    status:'pending',
    intervalDays:days
  };
  rows.unshift(item);
  v28SaveRevisions(rows);
  if(typeof toast==='function')toast(`Revision scheduled in ${days} day(s)`);
  renderV28Revisions();
  try{
    if(typeof api==='function')api('saveV28Revision',{token:token(),revision:item}).catch(()=>{});
  }catch(e){}
};
function v28RevisionState(item){
  if(item.status==='completed')return 'completed';
  return new Date(item.dueDate)<=new Date()?'due':'upcoming';
}
window.setRevisionFilter=function(filter){
  V28_REVISION_FILTER=filter;
  renderV28Revisions();
};
window.renderV28Revisions=function(){
  const box=document.getElementById('v28RevisionList');
  const badge=document.getElementById('revisionDueBadge');
  if(!box)return;
  const all=v28GetRevisions();
  const dueCount=all.filter(x=>v28RevisionState(x)==='due').length;
  if(badge)badge.textContent=dueCount+' due';
  const rows=all.filter(x=>V28_REVISION_FILTER==='all'||v28RevisionState(x)===V28_REVISION_FILTER);
  if(!rows.length){box.innerHTML='<p class="muted">No revision items in this view.</p>';return}
  box.innerHTML=rows.map(x=>{
    const state=v28RevisionState(x);
    return `<div class="v28-revision-card">
      <div class="v28-revision-head">
        <div><h4>${escapeHtml(x.title)}</h4><div class="v28-revision-meta">${escapeHtml(x.category||'')} · Due: ${escapeHtml(new Date(x.dueDate).toLocaleDateString())}</div></div>
        <span class="revision-status ${state}">${state}</span>
      </div>
      <div class="v28-card-actions">
        <button onclick="completeV28Revision('${escapeAttr(x.id)}')">Complete</button>
        <button onclick="rescheduleV28Revision('${escapeAttr(x.id)}',7)">+7 Days</button>
        <button class="danger" onclick="deleteV28Revision('${escapeAttr(x.id)}')">Delete</button>
      </div>
    </div>`;
  }).join('');
};
window.completeV28Revision=function(id){
  const rows=v28GetRevisions();
  const item=rows.find(x=>x.id===id);
  if(item){item.status='completed';item.completedAt=new Date().toISOString()}
  v28SaveRevisions(rows);renderV28Revisions();
};
window.rescheduleV28Revision=function(id,days){
  const rows=v28GetRevisions();
  const item=rows.find(x=>x.id===id);
  if(item){const d=new Date();d.setDate(d.getDate()+days);item.dueDate=d.toISOString();item.status='pending'}
  v28SaveRevisions(rows);renderV28Revisions();
};
window.deleteV28Revision=function(id){
  if(!confirm('Delete this revision item?'))return;
  v28SaveRevisions(v28GetRevisions().filter(x=>x.id!==id));
  renderV28Revisions();
};

/* PWA */
window.addEventListener('beforeinstallprompt',function(event){
  event.preventDefault();
  V28_INSTALL_PROMPT=event;
  const btn=document.getElementById('installAppBtn');
  if(btn)btn.style.display='inline-flex';
});
window.installPortalApp=async function(){
  if(!V28_INSTALL_PROMPT){
    alert('Install option is available from your browser menu: Add to Home screen / Install app.');
    return;
  }
  V28_INSTALL_PROMPT.prompt();
  await V28_INSTALL_PROMPT.userChoice;
  V28_INSTALL_PROMPT=null;
  const btn=document.getElementById('installAppBtn');
  if(btn)btn.style.display='none';
};
window.addEventListener('appinstalled',function(){
  const btn=document.getElementById('installAppBtn');
  if(btn)btn.style.display='none';
  if(typeof toast==='function')toast('IAS Selection Point app installed');
});
if('serviceWorker' in navigator){
  window.addEventListener('load',function(){
    navigator.serviceWorker.register('sw.js?v=33').catch(function(err){
      console.warn('Service worker registration failed',err);
    });
  });
}
function showV28NetworkStatus(message){
  const old=document.querySelector('.v28-offline-banner');if(old)old.remove();
  const el=document.createElement('div');el.className='v28-offline-banner';el.textContent=message;
  document.body.appendChild(el);setTimeout(()=>el.remove(),2500);
}
window.addEventListener('offline',()=>showV28NetworkStatus('You are offline. Cached portal pages remain available.'));
window.addEventListener('online',()=>showV28NetworkStatus('Internet connection restored.'));

if(typeof openDashSection==='function'){
  const OLD_OPEN_DASH_V28=openDashSection;
  openDashSection=function(id,btn){
    OLD_OPEN_DASH_V28(id,btn);
    if(id==='notesCenterModule')renderV28Notes();
    if(id==='revisionCenterModule')renderV28Revisions();
  };
}
if(typeof loadDashboard==='function'){
  const OLD_LOAD_DASH_V28=loadDashboard;
  loadDashboard=async function(){
    await OLD_LOAD_DASH_V28();
    setTimeout(()=>{renderV28Notes();renderV28Revisions()},500);
  };
}


/* ======================================================
   v29.1 STABLE NOTIFICATION, TICKER AND PROFILE
   ====================================================== */
let V291_TICKER_INDEX=0;

window.toggleV291Notifications=function(event){
  if(event){event.preventDefault();event.stopPropagation()}
  const panel=document.getElementById('v291NotificationDropdown');
  if(!panel)return;
  panel.classList.toggle('active');
  renderV291Notifications();
};

window.renderV291Notifications=function(){
  const box=document.getElementById('v291NotificationList');
  if(!box)return;
  let rows=[];
  try{rows=(typeof getNotifications==='function'?getNotifications():[])||[]}catch(e){}
  if(!rows.length){
    box.innerHTML='<div class="v291-notification-item"><p>No notifications yet.</p></div>';
    return;
  }
  box.innerHTML=rows.slice(0,25).map(function(n){
    return `<div class="v291-notification-item ${n.read?'':'unread'}">
      <b>${escapeHtml(n.title||'Notification')}</b>
      <p>${escapeHtml(n.body||'')}</p>
      <small>${escapeHtml(n.date||'')}</small>
    </div>`;
  }).join('');
};

document.addEventListener('click',function(event){
  const panel=document.getElementById('v291NotificationDropdown');
  if(panel&&!event.target.closest('.v291-bell-wrap'))panel.classList.remove('active');
});

function v291TickerPosts(){
  if(Array.isArray(window.ISP_LATEST_POSTS)&&window.ISP_LATEST_POSTS.length)return window.ISP_LATEST_POSTS;
  if(typeof ISP_LATEST_POSTS!=='undefined'&&Array.isArray(ISP_LATEST_POSTS)&&ISP_LATEST_POSTS.length)return ISP_LATEST_POSTS;
  if(typeof ISP_LOADED_POSTS!=='undefined'&&Array.isArray(ISP_LOADED_POSTS))return ISP_LOADED_POSTS;
  return [];
}
window.renderV291Ticker=function(){
  const box=document.getElementById('v291TickerTrack');
  if(!box)return;
  const rows=v291TickerPosts().slice(0,12);
  if(!rows.length){
    box.innerHTML='<span>Latest posts will appear here automatically.</span>';
    return;
  }
  box.innerHTML=rows.map(function(post,index){
    return `<span class="v291-ticker-item" data-v291-index="${index}">${escapeHtml(post.title||'Article')}</span>`;
  }).join('');
  V291_TICKER_INDEX=0;
  box.style.transform='translateX(0)';
};
document.addEventListener('click',function(event){
  const item=event.target.closest('.v291-ticker-item');
  if(!item)return;
  const index=Number(item.getAttribute('data-v291-index'));
  const posts=v291TickerPosts();
  const post=posts[index];
  if(!post)return;
  const loadedIndex=(typeof ISP_LOADED_POSTS!=='undefined')?ISP_LOADED_POSTS.findIndex(x=>x.title===post.title):-1;
  if(loadedIndex>=0){
    openPostReader(loadedIndex);
  }else if(post.link){
    window.open(post.link,'_blank','noopener');
  }
});
window.moveV291Ticker=function(direction){
  const box=document.getElementById('v291TickerTrack');
  const rows=v291TickerPosts().slice(0,12);
  if(!box||!rows.length)return;
  V291_TICKER_INDEX=Math.max(0,Math.min(rows.length-1,V291_TICKER_INDEX+direction));
  box.style.transform=`translateX(-${V291_TICKER_INDEX*260}px)`;
};

if(typeof loadLatestArticles==='function'){
  const OLD_LOAD_LATEST_V291=loadLatestArticles;
  loadLatestArticles=async function(){
    const result=await OLD_LOAD_LATEST_V291();
    setTimeout(renderV291Ticker,80);
    return result;
  };
}
if(typeof renderLearningPosts==='function'){
  const OLD_RENDER_POSTS_V291=renderLearningPosts;
  renderLearningPosts=function(posts,listId){
    OLD_RENDER_POSTS_V291(posts,listId);
    setTimeout(renderV291Ticker,60);
  };
}

function v291ProfileKey(){
  const u=(typeof currentUser==='function'?currentUser():{})||{};
  return 'isp_v291_profile_'+(u.email||'guest');
}
function getV291Profile(){
  try{return JSON.parse(localStorage.getItem(v291ProfileKey())||'{}')}catch(e){return {}}
}
function saveV291Profile(data){
  localStorage.setItem(v291ProfileKey(),JSON.stringify(data));
}
window.handleV291ProfilePhoto=function(event){
  const file=event.target.files&&event.target.files[0];
  if(!file)return;
  if(file.size>2*1024*1024)return alert('Please choose an image smaller than 2 MB.');
  const reader=new FileReader();
  reader.onload=function(){
    const p=getV291Profile();
    p.photo=reader.result;
    saveV291Profile(p);
    const img=document.getElementById('v291ProfilePhoto');
    if(img)img.src=reader.result;
    updateV291ProfileCompletion();
  };
  reader.readAsDataURL(file);
};
window.loadV291ProfessionalProfile=function(){
  const p=getV291Profile();
  const u=(typeof currentUser==='function'?currentUser():{})||{};
  const map={
    v291State:'state',v291District:'district',v291Dob:'dob',v291Gender:'gender',
    v291Qualification:'qualification',v291Occupation:'occupation',
    v291Language:'language',v291Address:'address',v291Website:'website'
  };
  Object.keys(map).forEach(function(id){
    const el=document.getElementById(id);
    if(el)el.value=p[map[id]]||'';
  });
  const img=document.getElementById('v291ProfilePhoto');
  if(img)img.src=p.photo||'logo.jpg';
  const name=document.getElementById('v291ProfileDisplayName');
  if(name)name.textContent=u.name||document.getElementById('profileName')?.value||'Member';
  const email=document.getElementById('v291ProfileDisplayEmail');
  if(email)email.textContent=u.email||'';
  updateV291ProfileCompletion();
};
window.updateV291ProfileCompletion=function(){
  const p=getV291Profile();
  const ids=[
    'profileName','profileMobile','profileCity','v291State','v291District','v291Dob',
    'v291Gender','profileExam','profileSubject','v291Qualification','v291Occupation',
    'v291Language','profileGoal','v291Address','profileBio'
  ];
  const completed=ids.filter(function(id){
    const el=document.getElementById(id);
    return el&&String(el.value||'').trim();
  }).length+(p.photo?1:0);
  const percent=Math.round((completed/(ids.length+1))*100);
  const text=document.getElementById('v291CompletionText');
  const bar=document.getElementById('v291CompletionBar');
  if(text)text.textContent=percent+'%';
  if(bar)bar.style.width=percent+'%';
};
window.saveV291ProfessionalProfile=async function(){
  const p=getV291Profile();
  const map={
    state:'v291State',district:'v291District',dob:'v291Dob',gender:'v291Gender',
    qualification:'v291Qualification',occupation:'v291Occupation',
    language:'v291Language',address:'v291Address',website:'v291Website'
  };
  Object.keys(map).forEach(function(key){
    p[key]=document.getElementById(map[key])?.value.trim()||'';
  });
  saveV291Profile(p);
  try{
    if(typeof saveProfile==='function')await saveProfile();
  }catch(e){}
  updateV291ProfileCompletion();
  if(typeof toast==='function')toast('Professional profile saved');
  try{
    if(typeof api==='function')await api('saveV291Profile',{token:token(),profile:p});
  }catch(e){}
};

['input','change'].forEach(function(type){
  document.addEventListener(type,function(event){
    if(event.target&&event.target.closest('.v291-profile-grid'))updateV291ProfileCompletion();
  });
});

if(typeof renderNotifications==='function'){
  const OLD_RENDER_NOTIFICATION_V291=renderNotifications;
  renderNotifications=function(){
    OLD_RENDER_NOTIFICATION_V291();
    renderV291Notifications();
  };
}
if(typeof openDashSection==='function'){
  const OLD_OPEN_DASH_V291=openDashSection;
  openDashSection=function(id,button){
    OLD_OPEN_DASH_V291(id,button);
    if(id==='profile')setTimeout(loadV291ProfessionalProfile,60);
  };
}
if(typeof loadDashboard==='function'){
  const OLD_LOAD_DASHBOARD_V291=loadDashboard;
  loadDashboard=async function(){
    await OLD_LOAD_DASHBOARD_V291();
    setTimeout(function(){
      renderV291Notifications();
      renderV291Ticker();
      loadV291ProfessionalProfile();
    },450);
  };
}


/* ======================================================
   v29.2 AUTO IMAGE TICKER — INTERNAL PORTAL READER
   ====================================================== */
function v292EscapeImageUrl(url){
  return String(url||'').replace(/"/g,'&quot;');
}
function v292PostImage(post){
  if(post&&post.thumbnail)return post.thumbnail;
  const html=String((post&&(post.content||post.html))||'');
  const match=html.match(/<img[^>]+src=["']([^"']+)["']/i);
  return match?match[1]:'logo.jpg';
}
function v292TickerPosts(){
  if(typeof ISP_LATEST_POSTS!=='undefined'&&Array.isArray(ISP_LATEST_POSTS)&&ISP_LATEST_POSTS.length){
    return ISP_LATEST_POSTS;
  }
  if(typeof ISP_LOADED_POSTS!=='undefined'&&Array.isArray(ISP_LOADED_POSTS)){
    return ISP_LOADED_POSTS;
  }
  return [];
}
window.renderV291Ticker=function(){
  const track=document.getElementById('v291TickerTrack');
  if(!track)return;

  const posts=v292TickerPosts().slice(0,12);
  if(!posts.length){
    track.classList.remove('v292-auto-track');
    track.innerHTML='<span style="padding:0 18px;">Latest posts will appear here automatically.</span>';
    return;
  }

  track.classList.add('v292-auto-track');

  const createCards=function(group){
    return posts.map(function(post,index){
      const image=v292PostImage(post);
      return `<article class="v292-ticker-card" data-v292-index="${index}" data-v292-group="${group}" role="button" tabindex="0">
        <img class="v292-ticker-thumb" src="${v292EscapeImageUrl(image)}" alt="" loading="lazy"
             onerror="this.onerror=null;this.src='logo.jpg'">
        <div class="v292-ticker-copy">
          <div class="v292-ticker-top">
            <span class="v292-latest-pill">LATEST</span>
            <span class="v292-ticker-date">${escapeHtml(post.published||'')}</span>
          </div>
          <span class="v292-ticker-title">${escapeHtml(post.title||'Article')}</span>
        </div>
      </article>`;
    }).join('');
  };

  // Two identical groups make the CSS animation seamless.
  track.innerHTML=`<div class="v292-ticker-group">${createCards(1)}</div><div class="v292-ticker-group" aria-hidden="true">${createCards(2)}</div>`;

  const estimatedWidth=Math.max(1,posts.length)*355;
  const seconds=Math.max(32,Math.min(80,Math.round(estimatedWidth/58)));
  track.style.setProperty('--v292-duration',seconds+'s');
};

function v292OpenTickerPost(index){
  const posts=v292TickerPosts();
  const post=posts[index];
  if(!post)return;

  // Always open inside the portal reader—never redirect to the public blog.
  if(typeof ISP_LOADED_POSTS!=='undefined'){
    ISP_LOADED_POSTS=posts.slice();
  }
  if(typeof openPostReader==='function'){
    openPostReader(index);
  }
}

document.addEventListener('click',function(event){
  const card=event.target.closest('.v292-ticker-card');
  if(!card)return;
  event.preventDefault();
  event.stopPropagation();
  v292OpenTickerPost(Number(card.getAttribute('data-v292-index')));
},true);

document.addEventListener('keydown',function(event){
  const card=event.target.closest&&event.target.closest('.v292-ticker-card');
  if(!card||!(event.key==='Enter'||event.key===' '))return;
  event.preventDefault();
  v292OpenTickerPost(Number(card.getAttribute('data-v292-index')));
});

/* Disable the old manual ticker movement; animation is now automatic. */
window.moveV291Ticker=function(){};

/* Ensure the latest feed and ticker load independently on dashboard startup. */
async function v292EnsureLatestTicker(){
  try{
    if((typeof ISP_LATEST_POSTS==='undefined'||!ISP_LATEST_POSTS.length)&&typeof bloggerAllPostsJsonp==='function'){
      const data=await bloggerAllPostsJsonp(20);
      ISP_LATEST_POSTS=(data.feed?.entry||[]).map(entryToPost).map(function(post){
        return Object.assign({},post,{moduleName:'Latest Articles',categoryTitle:'Latest'});
      });
    }
  }catch(e){}
  renderV291Ticker();
}

if(typeof loadDashboard==='function'){
  const OLD_LOAD_DASHBOARD_V292=loadDashboard;
  loadDashboard=async function(){
    await OLD_LOAD_DASHBOARD_V292();
    setTimeout(v292EnsureLatestTicker,250);
  };
}


/* ======================================================
   v29.3 ROBUST CONTINUOUS NEWS TICKER ENGINE
   ====================================================== */
(function(){
  let tickerRaf = 0;
  let tickerLastTime = 0;
  let tickerOffset = 0;
  let tickerHalfWidth = 0;
  let tickerPaused = false;
  let tickerSpeed = 54; // pixels per second

  function track(){
    return document.getElementById('v291TickerTrack');
  }

  function measureTicker(){
    const el = track();
    if(!el) return false;

    const groups = el.querySelectorAll('.v292-ticker-group');
    if(groups.length < 2) return false;

    tickerHalfWidth = groups[0].scrollWidth;
    if(!tickerHalfWidth || tickerHalfWidth < 10) return false;

    if(tickerOffset >= tickerHalfWidth) tickerOffset = tickerOffset % tickerHalfWidth;
    el.style.transform = `translate3d(${-tickerOffset}px,0,0)`;
    return true;
  }

  function frame(time){
    const el = track();
    if(!el){
      tickerRaf = requestAnimationFrame(frame);
      return;
    }

    if(!tickerLastTime) tickerLastTime = time;
    const delta = Math.min(50, time - tickerLastTime);
    tickerLastTime = time;

    if(!tickerPaused && tickerHalfWidth > 0){
      tickerOffset += tickerSpeed * (delta / 1000);
      if(tickerOffset >= tickerHalfWidth){
        tickerOffset -= tickerHalfWidth;
      }
      el.style.transform = `translate3d(${-tickerOffset}px,0,0)`;
    }

    tickerRaf = requestAnimationFrame(frame);
  }

  function startTicker(){
    cancelAnimationFrame(tickerRaf);
    tickerLastTime = 0;

    // Wait for images/layout to finish, then measure and start.
    let attempts = 0;
    const waitForLayout = function(){
      attempts++;
      if(measureTicker() || attempts > 30){
        tickerRaf = requestAnimationFrame(frame);
      }else{
        setTimeout(waitForLayout, 100);
      }
    };
    waitForLayout();
  }

  function attachPauseEvents(){
    const win = document.querySelector('.v291-breaking-window');
    if(!win || win.dataset.v293Bound === '1') return;
    win.dataset.v293Bound = '1';

    win.addEventListener('mouseenter', ()=>{ tickerPaused = true; });
    win.addEventListener('mouseleave', ()=>{ tickerPaused = false; });
    win.addEventListener('touchstart', ()=>{ tickerPaused = true; }, {passive:true});
    win.addEventListener('touchend', ()=>{ tickerPaused = false; }, {passive:true});
    win.addEventListener('pointerdown', ()=>{ tickerPaused = true; });
    win.addEventListener('pointerup', ()=>{ tickerPaused = false; });
  }

  // Wrap the existing renderer: render cards first, then start JS motion.
  if(typeof window.renderV291Ticker === 'function'){
    const oldRender = window.renderV291Ticker;
    window.renderV291Ticker = function(){
      oldRender();
      tickerOffset = 0;
      attachPauseEvents();
      setTimeout(startTicker, 80);
    };
  }

  // Keep measurements correct after resize/orientation change.
  window.addEventListener('resize', function(){
    setTimeout(function(){
      measureTicker();
    }, 120);
  });

  document.addEventListener('visibilitychange', function(){
    tickerPaused = document.hidden;
    if(!document.hidden){
      tickerLastTime = 0;
      measureTicker();
    }
  });

  // Start once the dashboard is ready, including service-worker cached loads.
  window.addEventListener('load', function(){
    setTimeout(function(){
      attachPauseEvents();
      if(track() && track().querySelector('.v292-ticker-group')){
        startTicker();
      }else if(typeof window.renderV291Ticker === 'function'){
        window.renderV291Ticker();
      }
    }, 500);
  });
})();


/* ======================================================
   v29.4 NATIVE MARQUEE TICKER FINAL OVERRIDE
   ====================================================== */
(function(){
  function posts(){
    if(typeof ISP_LATEST_POSTS!=='undefined' && Array.isArray(ISP_LATEST_POSTS) && ISP_LATEST_POSTS.length){
      return ISP_LATEST_POSTS.slice(0,15);
    }
    if(typeof ISP_LOADED_POSTS!=='undefined' && Array.isArray(ISP_LOADED_POSTS)){
      return ISP_LOADED_POSTS.slice(0,15);
    }
    return [];
  }

  function image(post){
    if(post && post.thumbnail) return post.thumbnail;
    const html=String((post && (post.content||post.html)) || '');
    const match=html.match(/<img[^>]+src=["']([^"']+)["']/i);
    return match ? match[1] : 'logo.jpg';
  }

  function safeUrl(value){
    return String(value||'').replace(/&/g,'&amp;').replace(/"/g,'&quot;');
  }

  window.renderV291Ticker=function(){
    const content=document.getElementById('v294TickerContent');
    const marquee=document.getElementById('v294TickerMarquee');
    if(!content || !marquee) return;

    const rows=posts();
    if(!rows.length){
      content.innerHTML='<span style="padding:0 20px;">Latest posts will appear here automatically.</span>';
      return;
    }

    // Duplicate cards provide a long continuous stream.
    const doubled=rows.concat(rows);
    content.innerHTML=doubled.map(function(post,index){
      const realIndex=index % rows.length;
      return `<span class="v294-native-card" data-v294-index="${realIndex}" role="button" tabindex="0">
        <img src="${safeUrl(image(post))}" alt="" loading="eager"
             onerror="this.onerror=null;this.src='logo.jpg'">
        <span class="v294-native-copy">
          <span class="v294-native-meta">
            <span class="v294-native-pill">LATEST</span>
            <span class="v294-native-date">${escapeHtml(post.published||'')}</span>
          </span>
          <span class="v294-native-title">${escapeHtml(post.title||'Article')}</span>
        </span>
      </span>`;
    }).join('');

    // Force restart even if the browser restored a stopped marquee state.
    try{
      marquee.stop();
      setTimeout(function(){ marquee.start(); },50);
    }catch(e){}
  };

  function openInside(index){
    const rows=posts();
    const post=rows[index];
    if(!post) return;

    // Open inside the portal Premium Reader.
    if(typeof ISP_LOADED_POSTS!=='undefined'){
      ISP_LOADED_POSTS=rows.slice();
    }
    if(typeof openPostReader==='function'){
      openPostReader(index);
    }
  }

  document.addEventListener('click',function(event){
    const card=event.target.closest('.v294-native-card');
    if(!card) return;
    event.preventDefault();
    event.stopPropagation();
    openInside(Number(card.getAttribute('data-v294-index')));
  },true);

  document.addEventListener('keydown',function(event){
    const card=event.target.closest && event.target.closest('.v294-native-card');
    if(!card || (event.key!=='Enter' && event.key!==' ')) return;
    event.preventDefault();
    openInside(Number(card.getAttribute('data-v294-index')));
  });

  async function ensure(){
    try{
      if((typeof ISP_LATEST_POSTS==='undefined' || !ISP_LATEST_POSTS.length) &&
         typeof bloggerAllPostsJsonp==='function'){
        const data=await bloggerAllPostsJsonp(20);
        ISP_LATEST_POSTS=(data.feed?.entry||[]).map(entryToPost).map(function(post){
          return Object.assign({},post,{moduleName:'Latest Articles',categoryTitle:'Latest'});
        });
      }
    }catch(e){}
    window.renderV291Ticker();
  }

  window.addEventListener('load',function(){
    setTimeout(ensure,300);
  });

  if(typeof loadDashboard==='function'){
    const OLD_LOAD_DASHBOARD_V294=loadDashboard;
    loadDashboard=async function(){
      await OLD_LOAD_DASHBOARD_V294();
      setTimeout(ensure,220);
    };
  }
})();


/* ======================================================
   v30 SMOOTH TICKER CONTROLS + SMART DASHBOARD
   ====================================================== */
let V30_TICKER_PAUSED=false;

window.toggleV30Ticker=function(){
  const marquee=document.getElementById('v294TickerMarquee');
  const button=document.getElementById('v30TickerToggle');
  if(!marquee)return;

  if(V30_TICKER_PAUSED){
    try{marquee.start()}catch(e){}
    V30_TICKER_PAUSED=false;
    if(button)button.textContent='⏸';
    if(button)button.title='Pause ticker';
  }else{
    try{marquee.stop()}catch(e){}
    V30_TICKER_PAUSED=true;
    if(button)button.textContent='▶';
    if(button)button.title='Play ticker';
  }
};

function v30HistoryRows(){
  try{
    if(typeof v25GetHistory==='function')return v25GetHistory()||[];
  }catch(e){}
  try{
    const key='isp_v25_history_'+((currentUser&&currentUser().email)||'guest');
    return JSON.parse(localStorage.getItem(key)||'[]');
  }catch(e){return []}
}
function v30RevisionRows(){
  try{
    if(typeof v28GetRevisions==='function')return v28GetRevisions()||[];
  }catch(e){}
  return [];
}
function v30NotesRows(){
  try{
    if(typeof v28GetNotes==='function')return v28GetNotes()||[];
  }catch(e){}
  return [];
}
window.renderV30SmartDashboard=function(){
  const history=v30HistoryRows();
  const revisions=v30RevisionRows();
  const notes=v30NotesRows();

  const continueTitle=document.getElementById('v30ContinueTitle');
  const due=document.getElementById('v30DueRevisionCount');
  const noteCount=document.getElementById('v30NotesCount');

  if(continueTitle){
    continueTitle.textContent=history.length?(history[0].title||'Continue reading'):'Open an article to begin';
  }
  if(due){
    const count=revisions.filter(function(item){
      if(item.status==='completed')return false;
      return new Date(item.dueDate)<=new Date();
    }).length;
    due.textContent=count+' item'+(count===1?'':'s');
  }
  if(noteCount){
    noteCount.textContent=notes.length+' note'+(notes.length===1?'':'s');
  }
};
window.openV30ContinueLearning=function(){
  const history=v30HistoryRows();
  if(!history.length){
    if(typeof toast==='function')toast('Open an article first');
    else alert('Open an article first.');
    return;
  }
  const item=history[0];
  const posts=(typeof ISP_LOADED_POSTS!=='undefined'&&Array.isArray(ISP_LOADED_POSTS))?ISP_LOADED_POSTS:[];
  const index=posts.findIndex(function(post){return post.title===item.title});
  if(index>=0&&typeof openPostReader==='function'){
    openPostReader(index);
    return;
  }
  if(typeof openDashSection==='function'){
    openDashSection('readingHistoryModule');
  }
};

if(typeof loadDashboard==='function'){
  const OLD_LOAD_DASHBOARD_V30=loadDashboard;
  loadDashboard=async function(){
    await OLD_LOAD_DASHBOARD_V30();
    setTimeout(renderV30SmartDashboard,450);
  };
}
if(typeof openDashSection==='function'){
  const OLD_OPEN_DASH_V30=openDashSection;
  openDashSection=function(id,button){
    OLD_OPEN_DASH_V30(id,button);
    setTimeout(renderV30SmartDashboard,80);
  };
}
window.addEventListener('load',function(){
  setTimeout(function(){
    const button=document.getElementById('v30TickerToggle');
    if(button)button.title='Pause ticker';
    renderV30SmartDashboard();
  },600);
});


/* ======================================================
   v31 ENTERPRISE MOCK TEST ENGINE
   ====================================================== */
let V31_TESTS=[];
let V31_ACTIVE_TEST=null;
let V31_QUESTIONS=[];
let V31_CURRENT_INDEX=0;
let V31_ANSWERS={};
let V31_REVIEW=new Set();
let V31_TIMER=null;
let V31_SECONDS_LEFT=0;

function v31AttemptKey(testId){
  return 'isp_v31_attempt_'+((currentUser&&currentUser().email)||'guest')+'_'+testId;
}
function v31ResultsKey(){
  return 'isp_v31_results_'+((currentUser&&currentUser().email)||'guest');
}
function v31GetLocalResults(){
  try{return JSON.parse(localStorage.getItem(v31ResultsKey())||'[]')}catch(e){return []}
}
function v31SaveLocalResults(rows){
  localStorage.setItem(v31ResultsKey(),JSON.stringify(rows.slice(0,100)));
}

window.loadV31Tests=async function(){
  const box=document.getElementById('v31TestsList');if(!box)return;
  box.innerHTML='<p class="muted">Loading tests...</p>';
  const r=await api('listPublishedTests',{token:token()});
  if(!r.success){box.innerHTML=`<p class="muted">${escapeHtml(r.message)}</p>`;return}
  V31_TESTS=r.tests||[];
  if(!V31_TESTS.length){box.innerHTML='<p class="muted">No published tests available.</p>';return}
  box.innerHTML=V31_TESTS.map(t=>`<div class="v31-test-card">
    <h4>${escapeHtml(t.title)}</h4>
    <p>${escapeHtml(t.description||'Practice mock test')}</p>
    <div class="v31-test-meta">
      <span>${escapeHtml(t.category||'General')}</span>
      <span>${t.duration} min</span>
      <span>${t.questionCount} questions</span>
    </div>
    <button onclick="startV31Test('${escapeAttr(t.id)}')">Start Test</button>
  </div>`).join('');
};

window.startV31Test=async function(testId){
  const test=V31_TESTS.find(x=>x.id===testId);
  if(!test)return;
  showLoader('Loading test...','Preparing questions');
  const r=await api('getTestQuestions',{token:token(),testId});
  hideLoader();
  if(!r.success)return alert(r.message);
  V31_ACTIVE_TEST=test;
  V31_QUESTIONS=r.questions||[];
  if(!V31_QUESTIONS.length)return alert('No questions added to this test.');

  let saved=null;
  try{saved=JSON.parse(localStorage.getItem(v31AttemptKey(testId))||'null')}catch(e){}
  V31_ANSWERS=saved?.answers||{};
  V31_REVIEW=new Set(saved?.review||[]);
  V31_CURRENT_INDEX=Math.min(saved?.currentIndex||0,V31_QUESTIONS.length-1);
  V31_SECONDS_LEFT=saved?.secondsLeft||Number(test.duration||10)*60;

  document.getElementById('v31ExamTitle').textContent=test.title;
  openDashSection('v31ExamModule');
  renderV31Question();
  renderV31Palette();
  startV31Timer();
};

function saveV31Attempt(){
  if(!V31_ACTIVE_TEST)return;
  localStorage.setItem(v31AttemptKey(V31_ACTIVE_TEST.id),JSON.stringify({
    answers:V31_ANSWERS,
    review:Array.from(V31_REVIEW),
    currentIndex:V31_CURRENT_INDEX,
    secondsLeft:V31_SECONDS_LEFT
  }));
}
function startV31Timer(){
  clearInterval(V31_TIMER);
  updateV31TimerText();
  V31_TIMER=setInterval(()=>{
    V31_SECONDS_LEFT--;
    updateV31TimerText();
    saveV31Attempt();
    if(V31_SECONDS_LEFT<=0){
      clearInterval(V31_TIMER);
      submitV31Test(true);
    }
  },1000);
}
function updateV31TimerText(){
  const m=Math.floor(Math.max(0,V31_SECONDS_LEFT)/60);
  const s=Math.max(0,V31_SECONDS_LEFT)%60;
  const el=document.getElementById('v31TimerText');
  if(el)el.textContent=String(m).padStart(2,'0')+':'+String(s).padStart(2,'0');
}
function renderV31Question(){
  const q=V31_QUESTIONS[V31_CURRENT_INDEX];if(!q)return;
  document.getElementById('v31QuestionNumber').textContent=`Question ${V31_CURRENT_INDEX+1} of ${V31_QUESTIONS.length}`;
  document.getElementById('v31QuestionText').textContent=q.question;
  document.getElementById('v31QuestionStatus').textContent=V31_REVIEW.has(q.id)?'Marked for Review':(V31_ANSWERS[q.id]?'Answered':'Not Answered');
  const options=['A','B','C','D'];
  document.getElementById('v31OptionsList').innerHTML=options.map(key=>`<label class="v31-option ${V31_ANSWERS[q.id]===key?'selected':''}">
    <input type="radio" name="v31Option" value="${key}" ${V31_ANSWERS[q.id]===key?'checked':''} onchange="selectV31Answer('${escapeAttr(q.id)}','${key}')">
    <span><b>${key}.</b> ${escapeHtml(q['option'+key]||'')}</span>
  </label>`).join('');
  renderV31Palette();
}
window.selectV31Answer=function(questionId,option){
  V31_ANSWERS[questionId]=option;
  saveV31Attempt();
  renderV31Question();
};
window.v31PreviousQuestion=function(){if(V31_CURRENT_INDEX>0){V31_CURRENT_INDEX--;renderV31Question();saveV31Attempt()}};
window.v31NextQuestion=function(){if(V31_CURRENT_INDEX<V31_QUESTIONS.length-1){V31_CURRENT_INDEX++;renderV31Question();saveV31Attempt()}};
window.v31ClearResponse=function(){
  const q=V31_QUESTIONS[V31_CURRENT_INDEX];if(!q)return;
  delete V31_ANSWERS[q.id];saveV31Attempt();renderV31Question();
};
window.v31MarkForReview=function(){
  const q=V31_QUESTIONS[V31_CURRENT_INDEX];if(!q)return;
  if(V31_REVIEW.has(q.id))V31_REVIEW.delete(q.id);else V31_REVIEW.add(q.id);
  saveV31Attempt();renderV31Question();
};
function renderV31Palette(){
  const box=document.getElementById('v31QuestionPalette');if(!box)return;
  box.innerHTML=V31_QUESTIONS.map((q,i)=>{
    let cls='';
    if(V31_REVIEW.has(q.id))cls='review';
    else if(V31_ANSWERS[q.id])cls='answered';
    if(i===V31_CURRENT_INDEX)cls+=' current';
    return `<button class="${cls}" onclick="V31_CURRENT_INDEX=${i};renderV31Question();saveV31Attempt()">${i+1}</button>`;
  }).join('');
}
window.submitV31Test=async function(autoSubmit){
  if(!V31_ACTIVE_TEST)return;
  if(!autoSubmit&&!confirm('Submit this test now?'))return;
  clearInterval(V31_TIMER);

  const result=calculateV31Result();
  localStorage.removeItem(v31AttemptKey(V31_ACTIVE_TEST.id));
  const rows=v31GetLocalResults();
  rows.unshift(result);
  v31SaveLocalResults(rows);

  try{
    await api('submitTestResult',{token:token(),result});
  }catch(e){}

  renderV31Result(result);
  openDashSection('v31ResultModule');
  renderV31MyResults();
};
function calculateV31Result(){
  let correct=0,wrong=0,unanswered=0;
  const review=[];
  V31_QUESTIONS.forEach(q=>{
    const answer=V31_ANSWERS[q.id]||'';
    if(!answer)unanswered++;
    else if(answer===q.correctOption)correct++;
    else wrong++;
    review.push({
      question:q.question,
      selected:answer,
      correct:q.correctOption,
      explanation:q.explanation||'',
      isCorrect:answer===q.correctOption
    });
  });
  const score=correct*Number(V31_ACTIVE_TEST.positiveMarks||1)-wrong*Number(V31_ACTIVE_TEST.negativeMarks||0);
  const maxScore=V31_QUESTIONS.length*Number(V31_ACTIVE_TEST.positiveMarks||1);
  const percentage=maxScore?Math.max(0,Math.round((score/maxScore)*100)):0;
  return {
    id:'RES_'+Date.now(),
    testId:V31_ACTIVE_TEST.id,
    testTitle:V31_ACTIVE_TEST.title,
    correct,wrong,unanswered,score:Number(score.toFixed(2)),
    maxScore:Number(maxScore.toFixed(2)),
    percentage,
    passed:score>=Number(V31_ACTIVE_TEST.passingMarks||0),
    timeTaken:Number(V31_ACTIVE_TEST.duration||10)*60-V31_SECONDS_LEFT,
    submittedAt:new Date().toISOString(),
    review
  };
}
function renderV31Result(r){
  document.getElementById('v31ResultTitle').textContent=r.passed?'Congratulations! Test Passed':'Test Completed';
  document.getElementById('v31ResultSummary').textContent=`You scored ${r.score} out of ${r.maxScore} (${r.percentage}%).`;
  document.getElementById('v31ScoreStat').textContent=r.score+'/'+r.maxScore;
  document.getElementById('v31CorrectStat').textContent=r.correct;
  document.getElementById('v31WrongStat').textContent=r.wrong;
  document.getElementById('v31UnansweredStat').textContent=r.unanswered;
  document.getElementById('v31AnswerReview').innerHTML=r.review.map((x,i)=>`<div class="v31-review-item ${x.isCorrect?'correct':'wrong'}">
    <b>Q${i+1}. ${escapeHtml(x.question)}</b>
    <p>Your Answer: ${escapeHtml(x.selected||'Not Answered')} | Correct: ${escapeHtml(x.correct)}</p>
    ${x.explanation?`<small>${escapeHtml(x.explanation)}</small>`:''}
  </div>`).join('');
}
window.renderV31MyResults=function(){
  const box=document.getElementById('v31ResultsList');if(!box)return;
  const rows=v31GetLocalResults();
  if(!rows.length){box.innerHTML='<p class="muted">No test attempts yet.</p>';return}
  box.innerHTML=rows.map(r=>`<div class="v31-result-row">
    <div><b>${escapeHtml(r.testTitle)}</b><small>${escapeHtml(new Date(r.submittedAt).toLocaleString())}</small></div>
    <strong>${r.score}/${r.maxScore}</strong>
    <span>${r.percentage}%</span>
  </div>`).join('');
};

/* Admin Exam Management */
let V31_ADMIN_TESTS=[];
window.loadV31AdminTests=async function(){
  const r=await api('adminListTests',{token:token()});
  if(!r.success)return;
  V31_ADMIN_TESTS=r.tests||[];
  const select=document.getElementById('v31AdminQuestionTest');
  if(select)select.innerHTML=V31_ADMIN_TESTS.map(t=>`<option value="${escapeAttr(t.id)}">${escapeHtml(t.title)}</option>`).join('');
  const box=document.getElementById('v31AdminTestsList');
  if(box)box.innerHTML=V31_ADMIN_TESTS.length?V31_ADMIN_TESTS.map(t=>`<div class="v31-admin-test-row">
    <div><b>${escapeHtml(t.title)}</b><small>${escapeHtml(t.category||'')} · ${t.questionCount} questions</small></div>
    <span>${escapeHtml(t.status)}</span>
    <button onclick="toggleV31TestPublish('${escapeAttr(t.id)}','${t.status==='Published'?'Draft':'Published'}')">${t.status==='Published'?'Unpublish':'Publish'}</button>
  </div>`).join(''):'<p class="muted">No tests created.</p>';
};
window.createV31AdminTest=async function(){
  const payload={
    title:document.getElementById('v31AdminTestTitle')?.value.trim(),
    category:document.getElementById('v31AdminTestCategory')?.value.trim(),
    duration:Number(document.getElementById('v31AdminTestDuration')?.value||10),
    positiveMarks:Number(document.getElementById('v31AdminPositiveMarks')?.value||1),
    negativeMarks:Number(document.getElementById('v31AdminNegativeMarks')?.value||0),
    passingMarks:Number(document.getElementById('v31AdminPassingMarks')?.value||0),
    description:document.getElementById('v31AdminTestDescription')?.value.trim()
  };
  if(!payload.title)return showSmall('v31AdminTestMsg','Test title required.',false);
  const r=await api('adminCreateTest',{token:token(),...payload});
  showSmall('v31AdminTestMsg',r.message,r.success);
  if(r.success)loadV31AdminTests();
};
window.addV31AdminQuestion=async function(){
  const payload={
    testId:document.getElementById('v31AdminQuestionTest')?.value,
    question:document.getElementById('v31AdminQuestionText')?.value.trim(),
    optionA:document.getElementById('v31OptionA')?.value.trim(),
    optionB:document.getElementById('v31OptionB')?.value.trim(),
    optionC:document.getElementById('v31OptionC')?.value.trim(),
    optionD:document.getElementById('v31OptionD')?.value.trim(),
    correctOption:document.getElementById('v31CorrectOption')?.value,
    explanation:document.getElementById('v31Explanation')?.value.trim()
  };
  if(!payload.testId||!payload.question||!payload.optionA||!payload.optionB)return showSmall('v31AdminQuestionMsg','Test, question and options required.',false);
  const r=await api('adminAddQuestion',{token:token(),...payload});
  showSmall('v31AdminQuestionMsg',r.message,r.success);
  if(r.success)loadV31AdminTests();
};
window.toggleV31TestPublish=async function(testId,status){
  const r=await api('adminUpdateTestStatus',{token:token(),testId,status});
  if(r.success)loadV31AdminTests();else alert(r.message);
};

if(typeof openDashSection==='function'){
  const OLD_OPEN_DASH_V31=openDashSection;
  openDashSection=function(id,btn){
    OLD_OPEN_DASH_V31(id,btn);
    if(id==='mockTestsModule')loadV31Tests();
    if(id==='myResultsModule')renderV31MyResults();
  };
}
if(typeof openAdminSection==='function'){
  const OLD_OPEN_ADMIN_V31=openAdminSection;
  openAdminSection=function(id,btn){
    OLD_OPEN_ADMIN_V31(id,btn);
    if(id==='adminExamManager')loadV31AdminTests();
  };
}


/* ======================================================
   v31.1 EXAM MANAGEMENT STABLE CONTROLS
   ====================================================== */
window.loadV31AdminTests=async function(){
  const box=document.getElementById('v31AdminTestsList');
  if(box)box.innerHTML='<p class="muted">Loading tests...</p>';

  const r=await api('adminListTests',{token:token()});
  if(!r.success){
    if(box)box.innerHTML=`<p class="muted">${escapeHtml(r.message)}</p>`;
    return;
  }

  V31_ADMIN_TESTS=r.tests||[];
  const select=document.getElementById('v31AdminQuestionTest');
  if(select){
    select.innerHTML=V31_ADMIN_TESTS.length
      ? V31_ADMIN_TESTS.map(t=>`<option value="${escapeAttr(t.id)}">${escapeHtml(t.title)} (${t.questionCount} questions)</option>`).join('')
      : '<option value="">Create a test first</option>';
  }

  if(!box)return;
  if(!V31_ADMIN_TESTS.length){
    box.innerHTML='<div class="v311-member-test-help"><b>No tests created yet.</b><span>Use Create Mock Test above, or click Create Demo Test.</span></div>';
    return;
  }

  box.innerHTML=V31_ADMIN_TESTS.map(t=>`<div class="v31-admin-test-row">
    <div>
      <b>${escapeHtml(t.title)}</b>
      <small>${escapeHtml(t.category||'General')} · ${t.questionCount} question${t.questionCount===1?'':'s'} · ${t.duration} min</small>
    </div>
    <span>${escapeHtml(t.status)}</span>
    <div class="v31-admin-row-actions">
      <button onclick="toggleV31TestPublish('${escapeAttr(t.id)}','${t.status==='Published'?'Draft':'Published'}')">${t.status==='Published'?'Unpublish':'Publish'}</button>
      <button onclick="editV311Test('${escapeAttr(t.id)}')">Edit</button>
      <button class="danger" onclick="deleteV311Test('${escapeAttr(t.id)}')">Delete</button>
    </div>
  </div>`).join('');
};

window.createV311DemoTest=async function(){
  if(!confirm('Create a sample 5-question published test?'))return;
  showLoader('Creating demo test...','Adding questions and publishing');
  const r=await api('adminCreateDemoTest',{token:token()});
  hideLoader();
  if(r.success){
    if(typeof toast==='function')toast('Demo test created and published');
    await loadV31AdminTests();
  }else{
    alert(r.message);
  }
};

window.editV311Test=function(testId){
  const t=(V31_ADMIN_TESTS||[]).find(x=>x.id===testId);
  if(!t)return;
  const title=prompt('Test title',t.title);
  if(title===null)return;
  const category=prompt('Category',t.category||'');
  if(category===null)return;
  const duration=prompt('Duration in minutes',String(t.duration||10));
  if(duration===null)return;
  updateV311Test(testId,{title,category,duration:Number(duration||10)});
};

async function updateV311Test(testId,changes){
  const r=await api('adminEditTest',{token:token(),testId,...changes});
  if(r.success){
    if(typeof toast==='function')toast('Test updated');
    loadV31AdminTests();
  }else alert(r.message);
}

window.deleteV311Test=async function(testId){
  if(!confirm('Delete this test and all its questions?'))return;
  const r=await api('adminDeleteTest',{token:token(),testId});
  if(r.success){
    if(typeof toast==='function')toast('Test deleted');
    loadV31AdminTests();
  }else alert(r.message);
};

/* Ensure member list always explains why no test appears */
window.loadV31Tests=async function(){
  const box=document.getElementById('v31TestsList');if(!box)return;
  box.innerHTML='<p class="muted">Loading tests...</p>';
  const r=await api('listPublishedTests',{token:token()});
  if(!r.success){
    box.innerHTML=`<p class="muted">${escapeHtml(r.message)}</p>`;
    return;
  }
  V31_TESTS=r.tests||[];
  if(!V31_TESTS.length){
    box.innerHTML=`<div class="v311-member-test-help">
      <b>No published tests available.</b>
      <span>Admin must create a test, add at least one question and publish it from Admin → Exam Management.</span>
    </div>`;
    return;
  }
  box.innerHTML=V31_TESTS.map(t=>`<div class="v31-test-card">
    <h4>${escapeHtml(t.title)}</h4>
    <p>${escapeHtml(t.description||'Practice mock test')}</p>
    <div class="v31-test-meta">
      <span>${escapeHtml(t.category||'General')}</span>
      <span>${t.duration} min</span>
      <span>${t.questionCount} questions</span>
    </div>
    <button onclick="startV31Test('${escapeAttr(t.id)}')">Start Test</button>
  </div>`).join('');
};


/* ======================================================
   v31.2 QUESTION MANAGER + FAST REQUEST CONTROLS
   ====================================================== */
const V312_PENDING_ACTIONS = new Set();

function v312Toast(message,type='success'){
  const old=document.querySelector('.v312-fast-toast');
  if(old)old.remove();
  const el=document.createElement('div');
  el.className='v312-fast-toast '+type;
  el.textContent=message;
  document.body.appendChild(el);
  setTimeout(()=>el.remove(),2600);
}

async function v312Api(action,payload={},timeoutMs=15000){
  let timer;
  try{
    return await Promise.race([
      api(action,payload),
      new Promise((_,reject)=>{
        timer=setTimeout(()=>reject(new Error('Request timed out. Please check internet or Apps Script deployment.')),timeoutMs);
      })
    ]);
  }finally{
    clearTimeout(timer);
  }
}

function v312SetButton(buttonId,loading,loadingText,normalText){
  const btn=document.getElementById(buttonId);
  if(!btn)return;
  btn.disabled=loading;
  btn.classList.toggle('v312-button-loading',loading);
  btn.textContent=loading?loadingText:normalText;
}

function v312ClearQuestionForm(){
  ['v31AdminQuestionText','v31OptionA','v31OptionB','v31OptionC','v31OptionD','v31Explanation']
    .forEach(id=>{
      const el=document.getElementById(id);
      if(el)el.value='';
    });
  const correct=document.getElementById('v31CorrectOption');
  if(correct)correct.value='A';
  const question=document.getElementById('v31AdminQuestionText');
  if(question)question.focus();
}

window.createV312AdminTest=async function(){
  if(V312_PENDING_ACTIONS.has('createTest'))return;
  const payload={
    title:document.getElementById('v31AdminTestTitle')?.value.trim(),
    category:document.getElementById('v31AdminTestCategory')?.value.trim(),
    duration:Number(document.getElementById('v31AdminTestDuration')?.value||10),
    positiveMarks:Number(document.getElementById('v31AdminPositiveMarks')?.value||1),
    negativeMarks:Number(document.getElementById('v31AdminNegativeMarks')?.value||0),
    passingMarks:Number(document.getElementById('v31AdminPassingMarks')?.value||0),
    description:document.getElementById('v31AdminTestDescription')?.value.trim()
  };

  if(!payload.title){
    showSmall('v31AdminTestMsg','Test title is required.',false);
    document.getElementById('v31AdminTestTitle')?.focus();
    return;
  }
  if(payload.duration<1){
    showSmall('v31AdminTestMsg','Duration must be at least 1 minute.',false);
    return;
  }

  V312_PENDING_ACTIONS.add('createTest');
  v312SetButton('v312CreateTestBtn',true,'Creating...','Create Test');
  showSmall('v31AdminTestMsg','Creating test...',true);

  try{
    const r=await v312Api('adminCreateTest',{token:token(),...payload},15000);
    showSmall('v31AdminTestMsg',r.message,r.success);
    if(r.success){
      v312Toast('Test created successfully');
      document.getElementById('v31AdminTestTitle').value='';
      document.getElementById('v31AdminTestDescription').value='';
      await loadV312AdminTestsFast();
    }
  }catch(error){
    showSmall('v31AdminTestMsg',error.message,false);
    v312Toast(error.message,'error');
  }finally{
    V312_PENDING_ACTIONS.delete('createTest');
    v312SetButton('v312CreateTestBtn',false,'Creating...','Create Test');
  }
};

window.addV312AdminQuestion=async function(){
  if(V312_PENDING_ACTIONS.has('addQuestion'))return;

  const payload={
    testId:document.getElementById('v31AdminQuestionTest')?.value,
    question:document.getElementById('v31AdminQuestionText')?.value.trim(),
    optionA:document.getElementById('v31OptionA')?.value.trim(),
    optionB:document.getElementById('v31OptionB')?.value.trim(),
    optionC:document.getElementById('v31OptionC')?.value.trim(),
    optionD:document.getElementById('v31OptionD')?.value.trim(),
    correctOption:document.getElementById('v31CorrectOption')?.value||'A',
    explanation:document.getElementById('v31Explanation')?.value.trim()
  };

  if(!payload.testId){
    showSmall('v31AdminQuestionMsg','Create or select a test first.',false);
    return;
  }
  if(!payload.question){
    showSmall('v31AdminQuestionMsg','Question text is required.',false);
    document.getElementById('v31AdminQuestionText')?.focus();
    return;
  }
  if(!payload.optionA||!payload.optionB||!payload.optionC||!payload.optionD){
    showSmall('v31AdminQuestionMsg','All four options are required.',false);
    return;
  }

  V312_PENDING_ACTIONS.add('addQuestion');
  v312SetButton('v312AddQuestionBtn',true,'Saving...','Add Question');
  showSmall('v31AdminQuestionMsg','Saving question...',true);

  try{
    const r=await v312Api('adminAddQuestion',{token:token(),...payload},15000);
    showSmall('v31AdminQuestionMsg',r.message,r.success);
    if(r.success){
      v312Toast('Question added successfully');
      v312ClearQuestionForm();
      await loadV312AdminTestsFast(payload.testId);
    }
  }catch(error){
    showSmall('v31AdminQuestionMsg',error.message,false);
    v312Toast(error.message,'error');
  }finally{
    V312_PENDING_ACTIONS.delete('addQuestion');
    v312SetButton('v312AddQuestionBtn',false,'Saving...','Add Question');
  }
};

window.loadV312AdminTestsFast=async function(keepSelectedTestId=''){
  const box=document.getElementById('v31AdminTestsList');
  if(box&&!box.children.length)box.innerHTML='<p class="muted">Loading tests...</p>';

  try{
    const r=await v312Api('adminListTests',{token:token()},12000);
    if(!r.success){
      if(box)box.innerHTML=`<p class="muted">${escapeHtml(r.message)}</p>`;
      return;
    }

    V31_ADMIN_TESTS=r.tests||[];
    const select=document.getElementById('v31AdminQuestionTest');
    const previous=keepSelectedTestId||select?.value||'';

    if(select){
      select.innerHTML=V31_ADMIN_TESTS.length
        ?V31_ADMIN_TESTS.map(t=>`<option value="${escapeAttr(t.id)}">${escapeHtml(t.title)} (${t.questionCount} questions)</option>`).join('')
        :'<option value="">Create a test first</option>';
      if(previous&&V31_ADMIN_TESTS.some(t=>t.id===previous))select.value=previous;
    }

    if(!box)return;
    if(!V31_ADMIN_TESTS.length){
      box.innerHTML='<div class="v311-member-test-help"><b>No tests created yet.</b><span>Create a test above or use Create Demo Test.</span></div>';
      return;
    }

    box.innerHTML=V31_ADMIN_TESTS.map(t=>`<div class="v31-admin-test-row">
      <div>
        <b>${escapeHtml(t.title)}</b>
        <small>${escapeHtml(t.category||'General')} · ${t.questionCount} question${t.questionCount===1?'':'s'} · ${t.duration} min</small>
      </div>
      <span>${escapeHtml(t.status)}</span>
      <div class="v31-admin-row-actions">
        <button onclick="toggleV31TestPublish('${escapeAttr(t.id)}','${t.status==='Published'?'Draft':'Published'}')">${t.status==='Published'?'Unpublish':'Publish'}</button>
        <button onclick="editV311Test('${escapeAttr(t.id)}')">Edit</button>
        <button class="danger" onclick="deleteV311Test('${escapeAttr(t.id)}')">Delete</button>
      </div>
    </div>`).join('');
  }catch(error){
    if(box)box.innerHTML=`<p class="muted">${escapeHtml(error.message)}</p>`;
    v312Toast(error.message,'error');
  }
};

window.loadV31AdminTests=loadV312AdminTestsFast;

/* Faster member-side test loading with timeout and cached fallback */
window.loadV31Tests=async function(){
  const box=document.getElementById('v31TestsList');if(!box)return;
  box.innerHTML='<p class="muted">Loading published tests...</p>';

  try{
    const r=await v312Api('listPublishedTests',{token:token()},12000);
    if(!r.success){
      box.innerHTML=`<p class="muted">${escapeHtml(r.message)}</p>`;
      return;
    }
    V31_TESTS=r.tests||[];
    try{localStorage.setItem('isp_v312_tests_cache',JSON.stringify(V31_TESTS))}catch(e){}

    if(!V31_TESTS.length){
      box.innerHTML=`<div class="v311-member-test-help">
        <b>No published tests available.</b>
        <span>Admin must create a test, add questions and publish it.</span>
      </div>`;
      return;
    }

    box.innerHTML=V31_TESTS.map(t=>`<div class="v31-test-card">
      <h4>${escapeHtml(t.title)}</h4>
      <p>${escapeHtml(t.description||'Practice mock test')}</p>
      <div class="v31-test-meta">
        <span>${escapeHtml(t.category||'General')}</span>
        <span>${t.duration} min</span>
        <span>${t.questionCount} questions</span>
      </div>
      <button onclick="startV31Test('${escapeAttr(t.id)}')">Start Test</button>
    </div>`).join('');
  }catch(error){
    let cached=[];
    try{cached=JSON.parse(localStorage.getItem('isp_v312_tests_cache')||'[]')}catch(e){}
    if(cached.length){
      V31_TESTS=cached;
      box.innerHTML=cached.map(t=>`<div class="v31-test-card">
        <h4>${escapeHtml(t.title)}</h4>
        <p>${escapeHtml(t.description||'Practice mock test')}</p>
        <div class="v31-test-meta">
          <span>${escapeHtml(t.category||'General')}</span>
          <span>${t.duration} min</span>
          <span>${t.questionCount} questions</span>
        </div>
        <button onclick="startV31Test('${escapeAttr(t.id)}')">Start Test</button>
      </div>`).join('');
      v312Toast('Showing cached tests. Server response was slow.','error');
    }else{
      box.innerHTML=`<p class="muted">${escapeHtml(error.message)}</p>`;
    }
  }
};


/* ======================================================
   v31.3 MOCK TEST OPENING + GUARANTEED LOADER CLEANUP
   ====================================================== */
let V313_TEST_OPENING=false;

function v313QuestionsCacheKey(testId){
  return 'isp_v313_questions_'+testId;
}
function v313GetCachedQuestions(testId){
  try{
    const raw=localStorage.getItem(v313QuestionsCacheKey(testId));
    if(!raw)return null;
    const obj=JSON.parse(raw);
    if(Date.now()-obj.savedAt>30*60*1000){
      localStorage.removeItem(v313QuestionsCacheKey(testId));
      return null;
    }
    return obj.questions||[];
  }catch(e){return null}
}
function v313SaveQuestions(testId,questions){
  try{
    localStorage.setItem(v313QuestionsCacheKey(testId),JSON.stringify({
      savedAt:Date.now(),
      questions:questions
    }));
  }catch(e){}
}
function v313SetStartButtons(testId,loading){
  document.querySelectorAll('.v313-start-test-btn').forEach(function(btn){
    if(btn.dataset.testId===testId){
      btn.disabled=loading;
      btn.classList.toggle('loading',loading);
      btn.textContent=loading?'Opening Test...':'Start Test';
    }else if(loading){
      btn.disabled=true;
    }else{
      btn.disabled=btn.dataset.noQuestions==='1';
    }
  });
}

window.loadV31Tests=async function(){
  const box=document.getElementById('v31TestsList');
  if(!box)return;
  box.innerHTML='<p class="muted">Loading published tests...</p>';

  try{
    const r=await v312Api('listPublishedTests',{token:token()},12000);
    if(!r.success){
      box.innerHTML=`<p class="muted">${escapeHtml(r.message)}</p>`;
      return;
    }

    V31_TESTS=r.tests||[];
    try{
      localStorage.setItem('isp_v312_tests_cache',JSON.stringify(V31_TESTS));
    }catch(e){}

    if(!V31_TESTS.length){
      box.innerHTML=`<div class="v311-member-test-help">
        <b>No published tests available.</b>
        <span>Admin must create a test, add questions and publish it.</span>
      </div>`;
      return;
    }

    box.innerHTML=V31_TESTS.map(function(t){
      const noQuestions=Number(t.questionCount||0)===0;
      return `<div class="v31-test-card">
        <h4>${escapeHtml(t.title)}</h4>
        <p>${escapeHtml(t.description||'Practice mock test')}</p>
        <div class="v31-test-meta">
          <span>${escapeHtml(t.category||'General')}</span>
          <span>${t.duration} min</span>
          <span>${t.questionCount} questions</span>
        </div>
        <button
          class="v313-start-test-btn"
          data-test-id="${escapeAttr(t.id)}"
          data-no-questions="${noQuestions?'1':'0'}"
          onclick="startV313Test('${escapeAttr(t.id)}')"
          ${noQuestions?'disabled':''}>
          ${noQuestions?'No Questions Added':'Start Test'}
        </button>
        <div id="v313TestError_${escapeAttr(t.id)}"></div>
      </div>`;
    }).join('');
  }catch(error){
    let cached=[];
    try{
      cached=JSON.parse(localStorage.getItem('isp_v312_tests_cache')||'[]');
    }catch(e){}

    if(cached.length){
      V31_TESTS=cached;
      box.innerHTML=cached.map(function(t){
        const noQuestions=Number(t.questionCount||0)===0;
        return `<div class="v31-test-card">
          <h4>${escapeHtml(t.title)}</h4>
          <p>${escapeHtml(t.description||'Practice mock test')}</p>
          <div class="v31-test-meta">
            <span>${escapeHtml(t.category||'General')}</span>
            <span>${t.duration} min</span>
            <span>${t.questionCount} questions</span>
          </div>
          <button
            class="v313-start-test-btn"
            data-test-id="${escapeAttr(t.id)}"
            data-no-questions="${noQuestions?'1':'0'}"
            onclick="startV313Test('${escapeAttr(t.id)}')"
            ${noQuestions?'disabled':''}>
            ${noQuestions?'No Questions Added':'Start Test'}
          </button>
          <div id="v313TestError_${escapeAttr(t.id)}"></div>
        </div>`;
      }).join('');
      v312Toast('Showing cached tests because server response was slow.','error');
    }else{
      box.innerHTML=`<p class="muted">${escapeHtml(error.message)}</p>`;
    }
  }
};

window.startV313Test=async function(testId){
  if(V313_TEST_OPENING)return;

  const test=(V31_TESTS||[]).find(function(x){return String(x.id)===String(testId)});
  if(!test){
    v312Toast('Test details not found. Refresh tests.','error');
    return;
  }
  if(Number(test.questionCount||0)<1){
    v312Toast('This test has no questions. Ask admin to add questions.','error');
    return;
  }

  const errorBox=document.getElementById('v313TestError_'+testId);
  if(errorBox)errorBox.innerHTML='';

  V313_TEST_OPENING=true;
  v313SetStartButtons(testId,true);
  showLoader('Opening mock test...','Loading questions. Please wait.');

  try{
    let questions=v313GetCachedQuestions(testId);

    if(!questions||!questions.length){
      const response=await v312Api(
        'getTestQuestions',
        {token:token(),testId:testId},
        15000
      );

      if(!response||!response.success){
        throw new Error(response?.message||'Unable to load questions.');
      }
      questions=response.questions||[];
      if(questions.length)v313SaveQuestions(testId,questions);
    }

    if(!questions.length){
      throw new Error('No questions were found for this test. Check that questions were added to the same Test ID.');
    }

    V31_ACTIVE_TEST=test;
    V31_QUESTIONS=questions;

    let saved=null;
    try{
      saved=JSON.parse(localStorage.getItem(v31AttemptKey(testId))||'null');
    }catch(e){}

    V31_ANSWERS=saved?.answers||{};
    V31_REVIEW=new Set(saved?.review||[]);
    V31_CURRENT_INDEX=Math.min(
      Number(saved?.currentIndex||0),
      V31_QUESTIONS.length-1
    );
    V31_SECONDS_LEFT=Number(
      saved?.secondsLeft||Number(test.duration||10)*60
    );

    const title=document.getElementById('v31ExamTitle');
    if(title)title.textContent=test.title;

    openDashSection('v31ExamModule');
    renderV31Question();
    renderV31Palette();
    startV31Timer();

    v312Toast('Test opened successfully');
  }catch(error){
    console.error('v31.3 test opening error',error);

    if(errorBox){
      errorBox.innerHTML=`<div class="v313-test-error">
        ${escapeHtml(error.message)}
        <br>
        <button type="button" onclick="startV313Test('${escapeAttr(testId)}')">Retry</button>
      </div>`;
    }
    v312Toast(error.message||'Test could not be opened.','error');
  }finally{
    hideLoader();
    V313_TEST_OPENING=false;
    v313SetStartButtons(testId,false);
  }
};

/* Preserve old entry point references */
window.startV31Test=window.startV313Test;

/* Safety: no loader may remain open indefinitely */
(function(){
  const oldShowLoader=window.showLoader||showLoader;
  let loaderSafetyTimer=null;

  window.showLoader=function(title,text){
    clearTimeout(loaderSafetyTimer);
    oldShowLoader(title,text);
    loaderSafetyTimer=setTimeout(function(){
      hideLoader();
      if(V313_TEST_OPENING){
        V313_TEST_OPENING=false;
        document.querySelectorAll('.v313-start-test-btn').forEach(function(btn){
          btn.classList.remove('loading');
          btn.disabled=btn.dataset.noQuestions==='1';
          btn.textContent=btn.dataset.noQuestions==='1'?'No Questions Added':'Start Test';
        });
        v312Toast('Loading took too long. Please try again.','error');
      }
    },18000);
  };
})();


/* ======================================================
   v31.4 FINAL MOCK TEST NAVIGATION + SYNC FIX
   ====================================================== */
(function(){
  let testsRequestId=0;

  async function loadTestsFinal(){
    const box=document.getElementById('v31TestsList');
    if(!box)return;
    const requestId=++testsRequestId;
    box.innerHTML='<div class="v314-test-loading">Loading published tests...</div>';

    try{
      const response=await v312Api('listPublishedTests',{token:token()},12000);
      if(requestId!==testsRequestId)return;
      if(!response||!response.success){
        throw new Error(response?.message||'Unable to load mock tests.');
      }

      V31_TESTS=Array.isArray(response.tests)?response.tests:[];
      try{localStorage.setItem('isp_v314_tests_cache',JSON.stringify({time:Date.now(),tests:V31_TESTS}))}catch(e){}

      if(!V31_TESTS.length){
        box.innerHTML=`<div class="v311-member-test-help">
          <b>No published tests available.</b>
          <span>Admin must create a test, add questions and publish it.</span>
        </div>`;
        return;
      }

      box.innerHTML=V31_TESTS.map(function(t){
        const count=Number(t.questionCount||0);
        return `<div class="v31-test-card">
          <h4>${escapeHtml(t.title)}</h4>
          <p>${escapeHtml(t.description||'Practice mock test')}</p>
          <div class="v31-test-meta">
            <span>${escapeHtml(t.category||'General')}</span>
            <span>${Number(t.duration||10)} min</span>
            <span>${count} question${count===1?'':'s'}</span>
          </div>
          <button class="v313-start-test-btn" data-test-id="${escapeAttr(t.id)}" data-no-questions="${count?'0':'1'}"
            onclick="startV313Test('${escapeAttr(t.id)}')" ${count?'':'disabled'}>
            ${count?'Start Test':'No Questions Added'}
          </button>
          <div id="v313TestError_${escapeAttr(t.id)}"></div>
        </div>`;
      }).join('');
    }catch(error){
      if(requestId!==testsRequestId)return;
      let cached=[];
      try{
        const c=JSON.parse(localStorage.getItem('isp_v314_tests_cache')||'null');
        if(c&&Date.now()-c.time<30*60*1000)cached=c.tests||[];
      }catch(e){}
      if(cached.length){
        V31_TESTS=cached;
        box.innerHTML=cached.map(function(t){
          const count=Number(t.questionCount||0);
          return `<div class="v31-test-card">
            <h4>${escapeHtml(t.title)}</h4><p>${escapeHtml(t.description||'Practice mock test')}</p>
            <div class="v31-test-meta"><span>${escapeHtml(t.category||'General')}</span><span>${Number(t.duration||10)} min</span><span>${count} questions</span></div>
            <button class="v313-start-test-btn" data-test-id="${escapeAttr(t.id)}" data-no-questions="${count?'0':'1'}" onclick="startV313Test('${escapeAttr(t.id)}')" ${count?'':'disabled'}>${count?'Start Test':'No Questions Added'}</button>
            <div id="v313TestError_${escapeAttr(t.id)}"></div>
          </div>`;
        }).join('');
        v312Toast('Server was slow. Cached tests are shown.','error');
      }else{
        box.innerHTML=`<div class="v314-retry-box">${escapeHtml(error.message)}<br><button type="button" onclick="window.loadV31Tests()">Retry</button></div>`;
      }
    }
  }

  window.loadV31Tests=loadTestsFinal;

  // Replace the navigation function itself, avoiding the old locked lexical reference.
  const previousOpenDash=window.openDashSection;
  window.openDashSection=function(id,btn){
    previousOpenDash(id,btn);
    if(id==='mockTestsModule')setTimeout(()=>window.loadV31Tests(),0);
    if(id==='myResultsModule'&&typeof window.renderV31MyResults==='function')setTimeout(()=>window.renderV31MyResults(),0);
  };
  // Update the global identifier used by inline onclick handlers and older wrappers.
  try{openDashSection=window.openDashSection}catch(e){}

  if(typeof window.openAdminSection==='function'){
    const previousOpenAdmin=window.openAdminSection;
    window.openAdminSection=function(id,btn){
      previousOpenAdmin(id,btn);
      if(id==='adminExamManager')setTimeout(()=>window.loadV31AdminTests(),0);
    };
    try{openAdminSection=window.openAdminSection}catch(e){}
  }

  // Preload after dashboard is usable.
  window.addEventListener('load',function(){
    setTimeout(function(){
      const sec=document.getElementById('mockTestsModule');
      if(sec&&sec.classList.contains('active'))window.loadV31Tests();
    },700);
  });
})();


/* ======================================================
   v31.6 PASSWORD VISIBILITY + STRENGTH UX
   ====================================================== */
(function(){
  'use strict';

  function fieldLabel(input){
    const id=(input.id||'').toLowerCase();
    const name=(input.name||'').toLowerCase();
    const placeholder=(input.placeholder||'').toLowerCase();
    return id+' '+name+' '+placeholder;
  }

  function passwordIcon(visible){
    return visible ? '🙈' : '👁';
  }

  function enhancePasswordInput(input){
    if(!input || input.dataset.v316Enhanced==='1') return;
    if(input.type!=='password') return;

    input.dataset.v316Enhanced='1';

    const parent=input.parentElement;
    if(!parent) return;

    let wrap;
    if(parent.classList.contains('password-field-wrap')){
      wrap=parent;
    }else{
      wrap=document.createElement('div');
      wrap.className='password-field-wrap';
      parent.insertBefore(wrap,input);
      wrap.appendChild(input);
    }

    const button=document.createElement('button');
    button.type='button';
    button.className='password-toggle-btn';
    button.setAttribute('aria-label','Show password');
    button.setAttribute('aria-pressed','false');
    button.title='Show password';
    button.textContent=passwordIcon(false);

    button.addEventListener('click',function(event){
      event.preventDefault();
      const selectionStart=input.selectionStart;
      const selectionEnd=input.selectionEnd;
      const visible=input.type==='text';

      input.type=visible?'password':'text';
      button.setAttribute('aria-pressed',visible?'false':'true');
      button.setAttribute('aria-label',visible?'Show password':'Hide password');
      button.title=visible?'Show password':'Hide password';
      button.textContent=passwordIcon(!visible);

      input.focus({preventScroll:true});
      try{
        input.setSelectionRange(selectionStart,selectionEnd);
      }catch(e){}
    });

    wrap.appendChild(button);

    const label=fieldLabel(input);
    const isMainPassword=!label.includes('confirm')&&!label.includes('repeat')&&!label.includes('otp');
    const isSignupPassword=isMainPassword && (
      label.includes('signup') ||
      input.closest('#signupForm,.signup-form,[data-form="signup"]')
    );

    if(isSignupPassword){
      addStrengthIndicator(input,wrap);
    }

    if(label.includes('confirm')||label.includes('repeat')){
      addMatchIndicator(input,wrap);
    }
  }

  function scorePassword(value){
    let score=0;
    if(value.length>=6)score++;
    if(/[a-z]/.test(value)&&/[A-Z]/.test(value))score++;
    if(/\d/.test(value))score++;
    if(/[^A-Za-z0-9]/.test(value))score++;
    return score;
  }

  function addStrengthIndicator(input,wrap){
    if(wrap.nextElementSibling?.classList.contains('password-strength-box'))return;

    const box=document.createElement('div');
    box.className='password-strength-box';
    box.innerHTML='<div class="password-strength-track"><span></span></div><div class="password-strength-text">Enter a strong password</div>';
    wrap.insertAdjacentElement('afterend',box);

    function update(){
      const value=input.value||'';
      const score=scorePassword(value);
      box.classList.remove('weak','fair','good','strong');
      if(!value){
        box.querySelector('.password-strength-text').textContent='Use uppercase, lowercase, number and symbol';
        return;
      }
      const states=[
        ['weak','Weak password'],
        ['fair','Fair password'],
        ['good','Good password'],
        ['strong','Strong password']
      ];
      const state=states[Math.max(0,score-1)];
      box.classList.add(state[0]);
      box.querySelector('.password-strength-text').textContent=state[1];
    }

    input.addEventListener('input',update);
    update();
  }

  function addMatchIndicator(confirmInput,wrap){
    if(wrap.nextElementSibling?.classList.contains('password-match-message'))return;

    const message=document.createElement('div');
    message.className='password-match-message';
    wrap.insertAdjacentElement('afterend',message);

    function findPrimaryPassword(){
      const form=confirmInput.closest('form')||document;
      const passwords=[...form.querySelectorAll('input[type="password"],input[data-v316-enhanced="1"]')]
        .filter(el=>el!==confirmInput);
      return passwords.find(el=>{
        const label=fieldLabel(el);
        return !label.includes('confirm')&&!label.includes('repeat');
      })||passwords[0];
    }

    function update(){
      const primary=findPrimaryPassword();
      if(!confirmInput.value){
        message.textContent='';
        message.className='password-match-message';
        return;
      }
      const match=primary && primary.value===confirmInput.value;
      message.textContent=match?'Passwords match':'Passwords do not match';
      message.className='password-match-message '+(match?'match':'no-match');
    }

    confirmInput.addEventListener('input',update);
    document.addEventListener('input',function(event){
      if(event.target!==confirmInput && event.target.matches('input[type="password"],input[data-v316-enhanced="1"]')){
        update();
      }
    });
  }

  function scanPasswordFields(root=document){
    root.querySelectorAll('input[type="password"]').forEach(enhancePasswordInput);
  }

  document.addEventListener('DOMContentLoaded',function(){
    scanPasswordFields();

    const observer=new MutationObserver(function(mutations){
      for(const mutation of mutations){
        for(const node of mutation.addedNodes){
          if(node.nodeType!==1)continue;
          if(node.matches?.('input[type="password"]'))enhancePasswordInput(node);
          scanPasswordFields(node);
        }
      }
    });

    observer.observe(document.body,{childList:true,subtree:true});
  });

  window.enhanceV316PasswordFields=scanPasswordFields;
})();


/* ======================================================
   v31.7 ACHIEVEMENT + EMAIL REWARD SYSTEM
   ====================================================== */
const V317_MILESTONES=[
  {count:10,key:'READ_10',title:'Bronze Reader',icon:'🥉'},
  {count:20,key:'READ_20',title:'Silver Reader',icon:'🥈'},
  {count:30,key:'READ_30',title:'Gold Reader',icon:'🥇'},
  {count:50,key:'READ_50',title:'Platinum Reader',icon:'💎'},
  {count:100,key:'READ_100',title:'Diamond Reader',icon:'👑'}
];
const V317_BADGES=[
  {key:'FIRST_ARTICLE',title:'First Step',icon:'📖',description:'Read your first article'},
  {key:'READ_10',title:'Bronze Reader',icon:'🥉',description:'Read 10 articles'},
  {key:'READ_20',title:'Silver Reader',icon:'🥈',description:'Read 20 articles'},
  {key:'READ_30',title:'Gold Reader',icon:'🥇',description:'Read 30 articles'},
  {key:'READ_50',title:'Platinum Reader',icon:'💎',description:'Read 50 articles'},
  {key:'READ_100',title:'Diamond Reader',icon:'👑',description:'Read 100 articles'},
  {key:'FIRST_NOTE',title:'Note Maker',icon:'📝',description:'Create your first note'},
  {key:'FIRST_BOOKMARK',title:'Smart Saver',icon:'🔖',description:'Save your first article'},
  {key:'FIRST_TEST',title:'Test Starter',icon:'🎯',description:'Complete your first mock test'},
  {key:'HIGH_SCORE',title:'Top Performer',icon:'🏆',description:'Score 90% or more in a test'},
  {key:'FIRST_REVISION',title:'Revision Master',icon:'🔁',description:'Complete your first revision'}
];

function v317AchievementKey(){
  return 'isp_v317_achievements_'+((currentUser&&currentUser().email)||'guest');
}
function v317GetLocalAchievements(){
  try{return JSON.parse(localStorage.getItem(v317AchievementKey())||'[]')}catch(e){return []}
}
function v317SaveLocalAchievements(rows){
  localStorage.setItem(v317AchievementKey(),JSON.stringify(rows.slice(0,200)));
}
function v317HistoryCount(){
  try{
    if(typeof v25GetHistory==='function'){
      const rows=v25GetHistory()||[];
      return new Set(rows.map(x=>x.title||x.link||JSON.stringify(x))).size;
    }
  }catch(e){}
  try{
    const user=(currentUser&&currentUser())||{};
    const keys=Object.keys(localStorage);
    const historyKey=keys.find(k=>k.startsWith('isp_v25_history_')&&k.includes(user.email||''));
    const rows=historyKey?JSON.parse(localStorage.getItem(historyKey)||'[]'):[];
    return new Set(rows.map(x=>x.title||x.link||JSON.stringify(x))).size;
  }catch(e){return 0}
}
async function unlockV317Achievement(key,meta={}){
  const badge=V317_BADGES.find(x=>x.key===key)||{key,title:key,icon:'🏅',description:''};
  const current=v317GetLocalAchievements();
  if(current.some(x=>x.key===key))return false;

  const item={
    key,
    title:badge.title,
    icon:badge.icon,
    description:badge.description,
    meta,
    unlockedAt:new Date().toISOString()
  };
  current.unshift(item);
  v317SaveLocalAchievements(current);
  renderV317Achievements();
  if(typeof toast==='function')toast(`${badge.icon} ${badge.title} unlocked`);

  try{
    const response=await api('unlockAchievement',{
      token:token(),
      achievement:item
    });
    if(response?.success && response.emailSent){
      if(typeof toast==='function')toast('Congratulations email sent');
    }
  }catch(e){}
  return true;
}
window.checkV317ReadingMilestones=async function(){
  const count=v317HistoryCount();
  if(count>=1)await unlockV317Achievement('FIRST_ARTICLE',{articlesRead:count});
  for(const milestone of V317_MILESTONES){
    if(count>=milestone.count){
      await unlockV317Achievement(milestone.key,{articlesRead:count,milestone:milestone.count});
    }
  }
  renderV317Achievements();
};
function nextV317Milestone(count){
  return V317_MILESTONES.find(x=>count<x.count)||null;
}
window.renderV317Achievements=function(){
  const count=v317HistoryCount();
  const rows=v317GetLocalAchievements();
  const next=nextV317Milestone(count);
  const previous=V317_MILESTONES.filter(x=>count>=x.count).slice(-1)[0];
  const start=previous?previous.count:0;
  const target=next?next.count:(V317_MILESTONES.slice(-1)[0]?.count||100);
  const pct=next?Math.max(0,Math.min(100,((count-start)/(target-start))*100)):100;

  const total=document.getElementById('v317TotalBadges');
  const read=document.getElementById('v317ArticlesRead');
  const nextEl=document.getElementById('v317NextMilestone');
  const progressText=document.getElementById('v317ProgressText');
  const progressBar=document.getElementById('v317ProgressBar');

  if(total)total.textContent=rows.length;
  if(read)read.textContent=count;
  if(nextEl)nextEl.textContent=next?next.count:'Completed';
  if(progressText)progressText.textContent=next?`${count} / ${next.count}`:`${count} articles`;
  if(progressBar)progressBar.style.width=pct+'%';

  const badgeGrid=document.getElementById('v317BadgeGrid');
  if(badgeGrid){
    badgeGrid.innerHTML=V317_BADGES.map(b=>{
      const unlocked=rows.some(x=>x.key===b.key);
      return `<div class="v317-badge-card ${unlocked?'unlocked':''}">
        <div class="v317-badge-icon">${b.icon}</div>
        <h4>${escapeHtml(b.title)}</h4>
        <p>${escapeHtml(b.description)}</p>
      </div>`;
    }).join('');
  }

  const timeline=document.getElementById('v317AchievementTimeline');
  if(timeline){
    timeline.innerHTML=rows.length?rows.map(x=>`<div class="v317-timeline-row">
      <span>${x.icon||'🏅'}</span>
      <div><b>${escapeHtml(x.title)}</b><small>${escapeHtml(x.description||'Achievement unlocked')}</small></div>
      <time>${escapeHtml(new Date(x.unlockedAt).toLocaleDateString())}</time>
    </div>`).join(''):'<p class="muted">No achievements unlocked yet.</p>';
  }
};
window.loadV317Achievements=async function(){
  renderV317Achievements();
  try{
    const r=await api('getMyAchievements',{token:token()});
    if(r?.success&&Array.isArray(r.achievements)){
      const local=v317GetLocalAchievements();
      const merged=[...r.achievements,...local].filter((x,i,a)=>a.findIndex(y=>y.key===x.key)===i);
      v317SaveLocalAchievements(merged);
      renderV317Achievements();
    }
  }catch(e){}
};

/* Hook reading completion */
if(typeof saveReadingHistory==='function'){
  const OLD_SAVE_READING_V317=saveReadingHistory;
  saveReadingHistory=function(post){
    const result=OLD_SAVE_READING_V317(post);
    setTimeout(checkV317ReadingMilestones,100);
    return result;
  };
}
if(typeof v25AddHistory==='function'){
  const OLD_V25_HISTORY_V317=v25AddHistory;
  v25AddHistory=function(post){
    const result=OLD_V25_HISTORY_V317(post);
    setTimeout(checkV317ReadingMilestones,120);
    return result;
  };
}

/* Other task/badge hooks */
if(typeof saveV28Note==='function'){
  const OLD_SAVE_NOTE_V317=saveV28Note;
  saveV28Note=async function(){
    const result=await OLD_SAVE_NOTE_V317();
    setTimeout(()=>unlockV317Achievement('FIRST_NOTE'),100);
    return result;
  };
}
if(typeof quickSavePost==='function'){
  const OLD_QUICK_SAVE_V317=quickSavePost;
  quickSavePost=function(...args){
    const result=OLD_QUICK_SAVE_V317(...args);
    setTimeout(()=>unlockV317Achievement('FIRST_BOOKMARK'),100);
    return result;
  };
}
if(typeof submitV31Test==='function'){
  const OLD_SUBMIT_TEST_V317=submitV31Test;
  submitV31Test=async function(autoSubmit){
    const before=v31GetLocalResults?.().length||0;
    const result=await OLD_SUBMIT_TEST_V317(autoSubmit);
    setTimeout(async()=>{
      const rows=v31GetLocalResults?.()||[];
      if(rows.length>before){
        await unlockV317Achievement('FIRST_TEST');
        if(Number(rows[0]?.percentage||0)>=90)await unlockV317Achievement('HIGH_SCORE',{percentage:rows[0].percentage});
      }
    },250);
    return result;
  };
}
if(typeof completeV28Revision==='function'){
  const OLD_COMPLETE_REV_V317=completeV28Revision;
  completeV28Revision=function(id){
    const result=OLD_COMPLETE_REV_V317(id);
    setTimeout(()=>unlockV317Achievement('FIRST_REVISION'),100);
    return result;
  };
}

/* Admin */
window.loadV317AdminAchievements=async function(){
  const list=document.getElementById('v317AdminAchievementList');
  const stats=document.getElementById('v317AdminAchievementStats');
  if(list)list.innerHTML='<p class="muted">Loading achievement history...</p>';
  try{
    const r=await api('adminAchievementReport',{token:token()});
    if(!r.success){
      if(list)list.innerHTML=`<p class="muted">${escapeHtml(r.message)}</p>`;
      return;
    }
    if(stats){
      stats.innerHTML=`
        <div><small>TOTAL UNLOCKS</small><b>${r.total||0}</b></div>
        <div><small>EMAILS SENT</small><b>${r.emailsSent||0}</b></div>
        <div><small>USERS REWARDED</small><b>${r.users||0}</b></div>`;
    }
    if(list){
      list.innerHTML=(r.rows||[]).length?(r.rows||[]).map(x=>`<div class="v317-timeline-row">
        <span>${x.icon||'🏅'}</span>
        <div><b>${escapeHtml(x.title)} — ${escapeHtml(x.email)}</b><small>${escapeHtml(x.key)} · Email: ${escapeHtml(x.emailStatus)}</small></div>
        <time>${escapeHtml(x.unlockedAt)}</time>
      </div>`).join(''):'<p class="muted">No achievement records yet.</p>';
    }
  }catch(e){
    if(list)list.innerHTML=`<p class="muted">${escapeHtml(e.message)}</p>`;
  }
};

if(typeof openDashSection==='function'){
  const OLD_OPEN_DASH_V317=openDashSection;
  openDashSection=function(id,btn){
    OLD_OPEN_DASH_V317(id,btn);
    if(id==='achievementsModule')loadV317Achievements();
  };
}
if(typeof openAdminSection==='function'){
  const OLD_OPEN_ADMIN_V317=openAdminSection;
  openAdminSection=function(id,btn){
    OLD_OPEN_ADMIN_V317(id,btn);
    if(id==='adminAchievements')loadV317AdminAchievements();
  };
}
if(typeof loadDashboard==='function'){
  const OLD_LOAD_DASH_V317=loadDashboard;
  loadDashboard=async function(){
    await OLD_LOAD_DASH_V317();
    setTimeout(checkV317ReadingMilestones,700);
  };
}


/* ======================================================
   v31.8 CONFIRM PASSWORD + EMAIL REPORT UI
   ====================================================== */
(function(){
  function updateSignupPasswordMatch(){
    const password=document.getElementById('signupPassword');
    const confirm=document.getElementById('signupConfirmPassword');
    const message=document.getElementById('signupPasswordMatch');
    if(!password||!confirm||!message)return;

    if(!confirm.value){
      message.textContent='';
      message.className='v318-password-match';
      return;
    }

    const match=password.value===confirm.value;
    message.textContent=match?'Passwords match':'Passwords do not match';
    message.className='v318-password-match '+(match?'ok':'error');
  }

  document.addEventListener('input',function(event){
    if(event.target?.id==='signupPassword'||event.target?.id==='signupConfirmPassword'){
      updateSignupPasswordMatch();
    }
  });

  window.loadV318EmailReport=async function(){
    const stats=document.getElementById('v318EmailDeliveryStats');
    const list=document.getElementById('v318EmailDeliveryList');
    if(!stats||!list)return;

    list.innerHTML='<p class="muted">Loading email delivery history...</p>';

    try{
      const r=await api('adminEmailDeliveryReport',{token:token()});
      if(!r.success){
        list.innerHTML=`<p class="muted">${escapeHtml(r.message)}</p>`;
        return;
      }

      stats.innerHTML=`
        <div class="v318-email-stat"><small>TOTAL EMAILS</small><b>${r.total||0}</b></div>
        <div class="v318-email-stat"><small>SENT</small><b>${r.sent||0}</b></div>
        <div class="v318-email-stat"><small>FAILED</small><b>${r.failed||0}</b></div>
        <div class="v318-email-stat"><small>WELCOME EMAILS</small><b>${r.welcome||0}</b></div>`;

      list.innerHTML=(r.rows||[]).length?(r.rows||[]).map(row=>`
        <div class="v318-email-row">
          <div><b>${escapeHtml(row.to||'')}</b><small>${escapeHtml(row.type||'System')}</small></div>
          <div><b>${escapeHtml(row.subject||'')}</b><small>${escapeHtml(row.error||'')}</small></div>
          <span class="v318-email-status ${String(row.status).toLowerCase()==='sent'?'sent':'failed'}">${escapeHtml(row.status||'Unknown')}</span>
          <small>${escapeHtml(row.sentAt||'')}</small>
        </div>`).join(''):'<p class="muted">No email records yet.</p>';
    }catch(error){
      list.innerHTML=`<p class="muted">${escapeHtml(error.message)}</p>`;
    }
  };

  if(typeof openAdminSection==='function'){
    const OLD_OPEN_ADMIN_318=openAdminSection;
    openAdminSection=function(id,btn){
      OLD_OPEN_ADMIN_318(id,btn);
      if(id==='adminEmailCenter')setTimeout(loadV318EmailReport,80);
    };
  }
})();

/* v32 HSSC dynamic module */
const V32_HSSC_CATEGORIES=[{label:'Haryana GK',title:'Haryana GK',icon:'📚'},{label:'Haryana Cet-C',title:'Haryana CET-C',icon:'🟢'},{label:'Haryana Cet-D',title:'Haryana CET-D',icon:'🟩'},{label:'Haryana Current Affairs',title:'Haryana Current Affairs',icon:'📰'},{label:'Haryana History',title:'Haryana History',icon:'🏛️'},{label:'Haryana Geography',title:'Haryana Geography',icon:'🗺️'},{label:'Haryana Polity',title:'Haryana Polity',icon:'⚖️'},{label:'Haryana Economy',title:'Haryana Economy',icon:'📈'},{label:'Haryana Science',title:'Haryana Science',icon:'🔬'}];
let V32_HSSC_POSTS=[],V32_HSSC_ACTIVE_LABEL='';
window.loadV32HsscOverview=function(){const g=document.getElementById('v32HsscCategoryGrid'),a=document.getElementById('v32HsscPostArea');if(!g)return;g.innerHTML=V32_HSSC_CATEGORIES.map(c=>`<article class="v32-hssc-category ${V32_HSSC_ACTIVE_LABEL===c.label?'active':''}" onclick="loadV32HsscCategory('${escapeAttr(c.label)}','${escapeAttr(c.title)}')"><span>${c.icon}</span><h4>${escapeHtml(c.title)}</h4><p>Blogger label: ${escapeHtml(c.label)}</p></article>`).join('');if(a&&!V32_HSSC_ACTIVE_LABEL)a.innerHTML='<p class="muted">Choose a category to load articles.</p>'};
window.loadV32HsscCategory=async function(label,title){const area=document.getElementById('v32HsscPostArea');if(!area)return;V32_HSSC_ACTIVE_LABEL=label;loadV32HsscOverview();area.innerHTML=`<p class="muted">Loading ${escapeHtml(title)} articles...</p>`;try{let data;if(typeof bloggerLabelJsonp==='function')data=await bloggerLabelJsonp(label,50);else{const all=await bloggerAllPostsJsonp(150);data={feed:{entry:(all.feed?.entry||[]).filter(e=>(e.category||[]).map(x=>String(x.term||'').toLowerCase()).includes(String(label).toLowerCase()))}}}const posts=(data.feed?.entry||[]).map(entryToPost).map(p=>({...p,moduleName:'HSSC',categoryTitle:title}));V32_HSSC_POSTS=posts;if(typeof ISP_LOADED_POSTS!=='undefined')ISP_LOADED_POSTS=posts.slice();if(!posts.length){area.innerHTML=`<div class="v32-empty-category"><b>No articles available yet.</b><br>Blogger par <b>${escapeHtml(label)}</b> label se post publish karte hi yahan automatically show hogi.</div>`;return}area.innerHTML=`<div class="v32-hssc-post-list">${posts.map((post,i)=>`<article class="v32-hssc-post-row" onclick="openV32HsscPost(${i})"><img src="${escapeAttr(post.thumbnail||'logo.jpg')}" onerror="this.src='logo.jpg'"><div><b>${escapeHtml(post.title||'Article')}</b><small>${escapeHtml(post.published||'')}</small></div><span>Open →</span></article>`).join('')}</div>`}catch(e){area.innerHTML=`<div class="v32-empty-category"><b>Articles could not be loaded.</b><br>${escapeHtml(e.message)}</div>`}};
window.openV32HsscPost=function(i){if(typeof ISP_LOADED_POSTS!=='undefined')ISP_LOADED_POSTS=V32_HSSC_POSTS.slice();if(typeof openPostReader==='function')openPostReader(i)};
window.runV32EmailHealthCheck=async function(){const b=document.getElementById('v32EmailHealthResult');if(!b)return;b.innerHTML='<p class="muted">Checking email system...</p>';try{const r=await api('emailSystemHealth',{token:token()});const c=r.ready?'v32-health-ok':'v32-health-warn';b.innerHTML=`<div class="${c}">MailApp Ready: ${r.ready?'Yes':'No'}<br>Daily Quota Remaining: ${r.remainingQuota}<br>Recent Failed Emails: ${r.recentFailed}<br>${escapeHtml(r.note||'')}</div>`}catch(e){b.innerHTML=`<div class="v32-health-warn">${escapeHtml(e.message)}</div>`}};
if(typeof openDashSection==='function'){const O=openDashSection;openDashSection=function(id,btn){O(id,btn);if(id==='hsscModule')setTimeout(loadV32HsscOverview,80)}}


/* ======================================================
   v33 INSTALL APP + DAILY QUIZ + XP LEADERBOARD
   ====================================================== */
let V33_INSTALL_PROMPT=null;
let V33_DAILY_QUIZ=[];
let V33_QUIZ_INDEX=0;
let V33_QUIZ_ANSWERS={};
let V33_QUIZ_SECONDS=600;
let V33_QUIZ_TIMER=null;
let V33_QUIZ_DATE='';

window.addEventListener('beforeinstallprompt',function(event){
  event.preventDefault();
  V33_INSTALL_PROMPT=event;
  const legacy=document.getElementById('installAppBtn');
  if(legacy)legacy.style.display='inline-flex';
});

window.installV33App=async function(){
  if(window.matchMedia('(display-mode: standalone)').matches){
    if(typeof toast==='function')toast('App is already installed');
    return;
  }
  const prompt=V33_INSTALL_PROMPT||window.V28_INSTALL_PROMPT;
  if(prompt){
    prompt.prompt();
    const choice=await prompt.userChoice;
    if(choice.outcome==='accepted'&&typeof toast==='function')toast('IAS Selection Point app installed');
    V33_INSTALL_PROMPT=null;
    window.V28_INSTALL_PROMPT=null;
    return;
  }
  alert('Chrome menu (⋮) open karein aur “Install app” ya “Add to Home screen” select karein.');
};

function v33LevelFromXp(xp){
  xp=Number(xp||0);
  if(xp>=2000)return 'Master';
  if(xp>=1000)return 'Expert';
  if(xp>=500)return 'Advanced';
  if(xp>=200)return 'Learner';
  return 'Beginner';
}

window.loadV33UserStats=async function(){
  try{
    const r=await api('getMyGamification',{token:token()});
    if(!r.success)return;
    const xp=document.getElementById('v33MyXp');
    const streak=document.getElementById('v33MyStreak');
    const level=document.getElementById('v33MyLevel');
    if(xp)xp.textContent=(r.xp||0)+' XP';
    if(streak)streak.textContent=(r.streak||0)+' Days';
    if(level)level.textContent=r.level||v33LevelFromXp(r.xp);
  }catch(e){}
};

window.loadV33DailyQuiz=async function(){
  const message=document.getElementById('v33QuizUnavailable');
  const intro=document.getElementById('v33QuizIntro');
  if(message)message.innerHTML='<p class="muted">Checking today’s quiz...</p>';
  try{
    const r=await api('getDailyQuiz',{token:token()});
    if(!r.success){
      if(message)message.innerHTML=`<div class="v32-empty-category">${escapeHtml(r.message)}</div>`;
      return;
    }
    V33_DAILY_QUIZ=r.questions||[];
    V33_QUIZ_DATE=r.quizDate||'';
    if(!V33_DAILY_QUIZ.length){
      if(message)message.innerHTML='<div class="v32-empty-category"><b>Daily Quiz is not available yet.</b><br>Admin Question Bank me questions add karte hi quiz automatically ready ho jayega.</div>';
      if(intro)intro.querySelector('button').disabled=true;
      return;
    }
    if(message)message.innerHTML=`<div class="v32-health-ok">Today’s quiz is ready: ${V33_DAILY_QUIZ.length} questions.</div>`;
    if(intro)intro.querySelector('button').disabled=false;
  }catch(error){
    if(message)message.innerHTML=`<div class="v32-health-warn">${escapeHtml(error.message)}</div>`;
  }
};

window.startV33DailyQuiz=async function(){
  if(!V33_DAILY_QUIZ.length)await loadV33DailyQuiz();
  if(!V33_DAILY_QUIZ.length)return;

  V33_QUIZ_INDEX=0;
  V33_QUIZ_ANSWERS={};
  V33_QUIZ_SECONDS=600;

  document.getElementById('v33QuizIntro').hidden=true;
  document.getElementById('v33QuizUnavailable').hidden=true;
  document.getElementById('v33QuizResult').hidden=true;
  document.getElementById('v33QuizPlayer').hidden=false;

  renderV33QuizQuestion();
  clearInterval(V33_QUIZ_TIMER);
  updateV33QuizTimer();
  V33_QUIZ_TIMER=setInterval(function(){
    V33_QUIZ_SECONDS--;
    updateV33QuizTimer();
    if(V33_QUIZ_SECONDS<=0){
      clearInterval(V33_QUIZ_TIMER);
      submitV33DailyQuiz(true);
    }
  },1000);
};

function updateV33QuizTimer(){
  const m=Math.floor(Math.max(0,V33_QUIZ_SECONDS)/60);
  const s=Math.max(0,V33_QUIZ_SECONDS)%60;
  const el=document.getElementById('v33QuizTimer');
  if(el)el.textContent=String(m).padStart(2,'0')+':'+String(s).padStart(2,'0');
}

function renderV33QuizQuestion(){
  const q=V33_DAILY_QUIZ[V33_QUIZ_INDEX];if(!q)return;
  document.getElementById('v33QuizQuestionNumber').textContent=`Question ${V33_QUIZ_INDEX+1} of ${V33_DAILY_QUIZ.length}`;
  document.getElementById('v33QuizQuestionText').textContent=q.question;
  document.getElementById('v33QuizProgressBar').style.width=((V33_QUIZ_INDEX+1)/V33_DAILY_QUIZ.length*100)+'%';
  document.getElementById('v33QuizOptions').innerHTML=['A','B','C','D'].map(key=>`
    <label class="v33-quiz-option ${V33_QUIZ_ANSWERS[q.id]===key?'selected':''}">
      <input type="radio" name="v33DailyOption" value="${key}"
             ${V33_QUIZ_ANSWERS[q.id]===key?'checked':''}
             onchange="selectV33QuizAnswer('${escapeAttr(q.id)}','${key}')">
      <span><b>${key}.</b> ${escapeHtml(q['option'+key]||'')}</span>
    </label>`).join('');
}
window.selectV33QuizAnswer=function(id,answer){
  V33_QUIZ_ANSWERS[id]=answer;
  renderV33QuizQuestion();
};
window.v33QuizPrevious=function(){
  if(V33_QUIZ_INDEX>0){V33_QUIZ_INDEX--;renderV33QuizQuestion()}
};
window.v33QuizNext=function(){
  if(V33_QUIZ_INDEX<V33_DAILY_QUIZ.length-1){V33_QUIZ_INDEX++;renderV33QuizQuestion()}
};

window.submitV33DailyQuiz=async function(autoSubmit){
  if(!autoSubmit&&!confirm('Submit today’s quiz?'))return;
  clearInterval(V33_QUIZ_TIMER);
  showLoader('Submitting quiz...','Calculating result and XP');

  try{
    const r=await api('submitDailyQuiz',{
      token:token(),
      quizDate:V33_QUIZ_DATE,
      answers:V33_QUIZ_ANSWERS,
      timeTaken:600-V33_QUIZ_SECONDS
    });
    if(!r.success){
      alert(r.message);
      return;
    }

    document.getElementById('v33QuizPlayer').hidden=true;
    const result=document.getElementById('v33QuizResult');
    result.hidden=false;
    result.innerHTML=`
      <div style="font-size:46px">🎉</div>
      <h2>Daily Quiz Completed!</h2>
      <p>${escapeHtml(r.message||'Your result has been saved.')}</p>
      <div class="v33-result-stats">
        <div><b>${r.correct||0}</b><span>Correct</span></div>
        <div><b>${r.wrong||0}</b><span>Wrong</span></div>
        <div><b>${r.percentage||0}%</b><span>Score</span></div>
        <div><b>+${r.xpEarned||0}</b><span>XP Earned</span></div>
      </div>
      <p><b>Total XP:</b> ${r.totalXp||0} · <b>Streak:</b> ${r.streak||0} days · <b>Level:</b> ${escapeHtml(r.level||'Beginner')}</p>
      <button class="primary-btn" onclick="openDashSection('xpLeaderboardModule')">View Leaderboard</button>`;
    loadV33UserStats();
  }finally{
    hideLoader();
  }
};

window.loadV33Leaderboard=async function(){
  const list=document.getElementById('v33LeaderboardList');
  const mine=document.getElementById('v33MyRankCard');
  if(list)list.innerHTML='<p class="muted">Loading leaderboard...</p>';

  try{
    const r=await api('getXpLeaderboard',{token:token()});
    if(!r.success){
      if(list)list.innerHTML=`<p class="muted">${escapeHtml(r.message)}</p>`;
      return;
    }

    if(mine){
      mine.innerHTML=`<b>Your Rank: #${r.myRank||'-'}</b><br>
      ${r.myXp||0} XP · ${r.myStreak||0} day streak · ${escapeHtml(r.myLevel||'Beginner')}`;
    }

    if(list){
      list.innerHTML=(r.leaderboard||[]).length?(r.leaderboard||[]).map((x,i)=>`
        <div class="v33-leader-row">
          <div class="v33-rank-number">${i+1}</div>
          <div><b>${escapeHtml(x.name||x.email)}</b><small>${escapeHtml(x.level||'Beginner')}</small></div>
          <span class="v33-xp-pill">${x.xp||0} XP</span>
          <span class="v33-streak-cell">🔥 ${x.streak||0}</span>
        </div>`).join(''):'<p class="muted">No leaderboard entries yet.</p>';
    }
  }catch(error){
    if(list)list.innerHTML=`<p class="muted">${escapeHtml(error.message)}</p>`;
  }
};

if(typeof openDashSection==='function'){
  const OLD_OPEN_DASH_V33=openDashSection;
  openDashSection=function(id,btn){
    OLD_OPEN_DASH_V33(id,btn);
    if(id==='dailyQuizModule')setTimeout(loadV33DailyQuiz,60);
    if(id==='xpLeaderboardModule')setTimeout(loadV33Leaderboard,60);
  };
}
if(typeof loadDashboard==='function'){
  const OLD_LOAD_DASH_V33=loadDashboard;
  loadDashboard=async function(){
    await OLD_LOAD_DASH_V33();
    setTimeout(loadV33UserStats,600);
  };
}

const V34_INDIA_STATE_DISTRICTS={"Andaman and Nicobar Islands": ["Nicobar", "North and Middle Andaman", "South Andaman"], "Andhra Pradesh": ["Alluri Sitharama Raju", "Anakapalli", "Anantapur", "Annamayya", "Bapatla", "Chittoor", "Dr. B.R. Ambedkar Konaseema", "East Godavari", "Eluru", "Guntur", "Kakinada", "Krishna", "Kurnool", "Nandyal", "NTR", "Palnadu", "Parvathipuram Manyam", "Prakasam", "Sri Potti Sriramulu Nellore", "Sri Sathya Sai", "Srikakulam", "Tirupati", "Visakhapatnam", "Vizianagaram", "West Godavari", "YSR Kadapa"], "Arunachal Pradesh": ["Anjaw", "Bichom", "Changlang", "Dibang Valley", "East Kameng", "East Siang", "Kamle", "Keyi Panyor", "Kra Daadi", "Kurung Kumey", "Leparada", "Lohit", "Longding", "Lower Dibang Valley", "Lower Siang", "Lower Subansiri", "Namsai", "Pakke-Kessang", "Papum Pare", "Shi Yomi", "Siang", "Tawang", "Tirap", "Upper Siang", "Upper Subansiri", "West Kameng", "West Siang"], "Assam": ["Bajali", "Baksa", "Barpeta", "Biswanath", "Bongaigaon", "Cachar", "Charaideo", "Chirang", "Darrang", "Dhemaji", "Dhubri", "Dibrugarh", "Dima Hasao", "Goalpara", "Golaghat", "Hailakandi", "Hojai", "Jorhat", "Kamrup", "Kamrup Metropolitan", "Karbi Anglong", "Kokrajhar", "Lakhimpur", "Majuli", "Morigaon", "Nagaon", "Nalbari", "Sivasagar", "Sonitpur", "South Salmara-Mankachar", "Tamulpur", "Tinsukia", "Udalguri", "West Karbi Anglong"], "Bihar": ["Araria", "Arwal", "Aurangabad", "Banka", "Begusarai", "Bhagalpur", "Bhojpur", "Buxar", "Darbhanga", "East Champaran", "Gaya", "Gopalganj", "Jamui", "Jehanabad", "Kaimur", "Katihar", "Khagaria", "Kishanganj", "Lakhisarai", "Madhepura", "Madhubani", "Munger", "Muzaffarpur", "Nalanda", "Nawada", "Patna", "Purnia", "Rohtas", "Saharsa", "Samastipur", "Saran", "Sheikhpura", "Sheohar", "Sitamarhi", "Siwan", "Supaul", "Vaishali", "West Champaran"], "Chandigarh": ["Chandigarh"], "Chhattisgarh": ["Balod", "Baloda Bazar", "Balrampur", "Bastar", "Bemetara", "Bijapur", "Bilaspur", "Dantewada", "Dhamtari", "Durg", "Gariaband", "Gaurela-Pendra-Marwahi", "Janjgir-Champa", "Jashpur", "Kabirdham", "Kanker", "Khairagarh-Chhuikhadan-Gandai", "Kondagaon", "Korba", "Koriya", "Mahasamund", "Manendragarh-Chirmiri-Bharatpur", "Mohla-Manpur-Ambagarh Chowki", "Mungeli", "Narayanpur", "Raigarh", "Raipur", "Rajnandgaon", "Sakti", "Sarangarh-Bilaigarh", "Sukma", "Surajpur", "Surguja"], "Dadra and Nagar Haveli and Daman and Diu": ["Dadra and Nagar Haveli", "Daman", "Diu"], "Delhi": ["Central Delhi", "East Delhi", "New Delhi", "North Delhi", "North East Delhi", "North West Delhi", "Shahdara", "South Delhi", "South East Delhi", "South West Delhi", "West Delhi"], "Goa": ["North Goa", "South Goa"], "Gujarat": ["Ahmedabad", "Amreli", "Anand", "Aravalli", "Banaskantha", "Bharuch", "Bhavnagar", "Botad", "Chhota Udaipur", "Dahod", "Dang", "Devbhoomi Dwarka", "Gandhinagar", "Gir Somnath", "Jamnagar", "Junagadh", "Kheda", "Kutch", "Mahisagar", "Mehsana", "Morbi", "Narmada", "Navsari", "Panchmahal", "Patan", "Porbandar", "Rajkot", "Sabarkantha", "Surat", "Surendranagar", "Tapi", "Vadodara", "Valsad"], "Haryana": ["Ambala", "Bhiwani", "Charkhi Dadri", "Faridabad", "Fatehabad", "Gurugram", "Hisar", "Jhajjar", "Jind", "Kaithal", "Karnal", "Kurukshetra", "Mahendragarh", "Nuh", "Palwal", "Panchkula", "Panipat", "Rewari", "Rohtak", "Sirsa", "Sonipat", "Yamunanagar"], "Himachal Pradesh": ["Bilaspur", "Chamba", "Hamirpur", "Kangra", "Kinnaur", "Kullu", "Lahaul and Spiti", "Mandi", "Shimla", "Sirmaur", "Solan", "Una"], "Jammu and Kashmir": ["Anantnag", "Bandipora", "Baramulla", "Budgam", "Doda", "Ganderbal", "Jammu", "Kathua", "Kishtwar", "Kulgam", "Kupwara", "Poonch", "Pulwama", "Rajouri", "Ramban", "Reasi", "Samba", "Shopian", "Srinagar", "Udhampur"], "Jharkhand": ["Bokaro", "Chatra", "Deoghar", "Dhanbad", "Dumka", "East Singhbhum", "Garhwa", "Giridih", "Godda", "Gumla", "Hazaribagh", "Jamtara", "Khunti", "Koderma", "Latehar", "Lohardaga", "Pakur", "Palamu", "Ramgarh", "Ranchi", "Sahibganj", "Seraikela Kharsawan", "Simdega", "West Singhbhum"], "Karnataka": ["Bagalkot", "Ballari", "Belagavi", "Bengaluru Rural", "Bengaluru Urban", "Bidar", "Chamarajanagar", "Chikkaballapur", "Chikkamagaluru", "Chitradurga", "Dakshina Kannada", "Davanagere", "Dharwad", "Gadag", "Hassan", "Haveri", "Kalaburagi", "Kodagu", "Kolar", "Koppal", "Mandya", "Mysuru", "Raichur", "Ramanagara", "Shivamogga", "Tumakuru", "Udupi", "Uttara Kannada", "Vijayapura", "Vijayanagara", "Yadgir"], "Kerala": ["Alappuzha", "Ernakulam", "Idukki", "Kannur", "Kasaragod", "Kollam", "Kottayam", "Kozhikode", "Malappuram", "Palakkad", "Pathanamthitta", "Thiruvananthapuram", "Thrissur", "Wayanad"], "Ladakh": ["Kargil", "Leh"], "Lakshadweep": ["Lakshadweep"], "Madhya Pradesh": ["Agar Malwa", "Alirajpur", "Anuppur", "Ashoknagar", "Balaghat", "Barwani", "Betul", "Bhind", "Bhopal", "Burhanpur", "Chhatarpur", "Chhindwara", "Damoh", "Datia", "Dewas", "Dhar", "Dindori", "Guna", "Gwalior", "Harda", "Indore", "Jabalpur", "Jhabua", "Katni", "Khandwa", "Khargone", "Maihar", "Mandla", "Mandsaur", "Mauganj", "Morena", "Narmadapuram", "Narsinghpur", "Neemuch", "Niwari", "Pandhurna", "Panna", "Raisen", "Rajgarh", "Ratlam", "Rewa", "Sagar", "Satna", "Sehore", "Seoni", "Shahdol", "Shajapur", "Sheopur", "Shivpuri", "Sidhi", "Singrauli", "Tikamgarh", "Ujjain", "Umaria", "Vidisha"], "Maharashtra": ["Ahmednagar", "Akola", "Amravati", "Aurangabad", "Beed", "Bhandara", "Buldhana", "Chandrapur", "Dhule", "Gadchiroli", "Gondia", "Hingoli", "Jalgaon", "Jalna", "Kolhapur", "Latur", "Mumbai City", "Mumbai Suburban", "Nagpur", "Nanded", "Nandurbar", "Nashik", "Osmanabad", "Palghar", "Parbhani", "Pune", "Raigad", "Ratnagiri", "Sangli", "Satara", "Sindhudurg", "Solapur", "Thane", "Wardha", "Washim", "Yavatmal"], "Manipur": ["Bishnupur", "Chandel", "Churachandpur", "Imphal East", "Imphal West", "Jiribam", "Kakching", "Kamjong", "Kangpokpi", "Noney", "Pherzawl", "Senapati", "Tamenglong", "Tengnoupal", "Thoubal", "Ukhrul"], "Meghalaya": ["East Garo Hills", "East Jaintia Hills", "East Khasi Hills", "Eastern West Khasi Hills", "North Garo Hills", "Ri Bhoi", "South Garo Hills", "South West Garo Hills", "South West Khasi Hills", "West Garo Hills", "West Jaintia Hills", "West Khasi Hills"], "Mizoram": ["Aizawl", "Champhai", "Hnahthial", "Khawzawl", "Kolasib", "Lawngtlai", "Lunglei", "Mamit", "Saiha", "Saitual", "Serchhip"], "Nagaland": ["Chumoukedima", "Dimapur", "Kiphire", "Kohima", "Longleng", "Mokokchung", "Mon", "Niuland", "Noklak", "Peren", "Phek", "Shamator", "Tseminyu", "Tuensang", "Wokha", "Zunheboto"], "Odisha": ["Angul", "Balangir", "Balasore", "Bargarh", "Bhadrak", "Boudh", "Cuttack", "Deogarh", "Dhenkanal", "Gajapati", "Ganjam", "Jagatsinghpur", "Jajpur", "Jharsuguda", "Kalahandi", "Kandhamal", "Kendrapara", "Kendujhar", "Khordha", "Koraput", "Malkangiri", "Mayurbhanj", "Nabarangpur", "Nayagarh", "Nuapada", "Puri", "Rayagada", "Sambalpur", "Subarnapur", "Sundargarh"], "Puducherry": ["Karaikal", "Mahe", "Puducherry", "Yanam"], "Punjab": ["Amritsar", "Barnala", "Bathinda", "Faridkot", "Fatehgarh Sahib", "Fazilka", "Ferozepur", "Gurdaspur", "Hoshiarpur", "Jalandhar", "Kapurthala", "Ludhiana", "Malerkotla", "Mansa", "Moga", "Pathankot", "Patiala", "Rupnagar", "Sahibzada Ajit Singh Nagar", "Sangrur", "Shaheed Bhagat Singh Nagar", "Sri Muktsar Sahib", "Tarn Taran"], "Rajasthan": ["Ajmer", "Alwar", "Anupgarh", "Balotra", "Banswara", "Baran", "Barmer", "Beawar", "Bharatpur", "Bhilwara", "Bikaner", "Bundi", "Chittorgarh", "Churu", "Dausa", "Deeg", "Dholpur", "Didwana-Kuchaman", "Dudu", "Dungarpur", "Gangapur City", "Hanumangarh", "Jaipur", "Jaipur Rural", "Jaisalmer", "Jalore", "Jhalawar", "Jhunjhunu", "Jodhpur", "Jodhpur Rural", "Karauli", "Kekri", "Khairthal-Tijara", "Kota", "Kotputli-Behror", "Nagaur", "Neem Ka Thana", "Pali", "Phalodi", "Pratapgarh", "Rajsamand", "Salumbar", "Sanchore", "Sawai Madhopur", "Shahpura", "Sikar", "Sirohi", "Sri Ganganagar", "Tonk", "Udaipur"], "Sikkim": ["Gangtok", "Gyalshing", "Mangan", "Namchi", "Pakyong", "Soreng"], "Tamil Nadu": ["Ariyalur", "Chengalpattu", "Chennai", "Coimbatore", "Cuddalore", "Dharmapuri", "Dindigul", "Erode", "Kallakurichi", "Kanchipuram", "Kanyakumari", "Karur", "Krishnagiri", "Madurai", "Mayiladuthurai", "Nagapattinam", "Namakkal", "Nilgiris", "Perambalur", "Pudukkottai", "Ramanathapuram", "Ranipet", "Salem", "Sivaganga", "Tenkasi", "Thanjavur", "Theni", "Thoothukudi", "Tiruchirappalli", "Tirunelveli", "Tirupathur", "Tiruppur", "Tiruvallur", "Tiruvannamalai", "Tiruvarur", "Vellore", "Viluppuram", "Virudhunagar"], "Telangana": ["Adilabad", "Bhadradri Kothagudem", "Hanamkonda", "Hyderabad", "Jagtial", "Jangaon", "Jayashankar Bhupalpally", "Jogulamba Gadwal", "Kamareddy", "Karimnagar", "Khammam", "Komaram Bheem Asifabad", "Mahabubabad", "Mahabubnagar", "Mancherial", "Medak", "Medchal-Malkajgiri", "Mulugu", "Nagarkurnool", "Nalgonda", "Narayanpet", "Nirmal", "Nizamabad", "Peddapalli", "Rajanna Sircilla", "Rangareddy", "Sangareddy", "Siddipet", "Suryapet", "Vikarabad", "Wanaparthy", "Warangal", "Yadadri Bhuvanagiri"], "Tripura": ["Dhalai", "Gomati", "Khowai", "North Tripura", "Sepahijala", "South Tripura", "Unakoti", "West Tripura"], "Uttar Pradesh": ["Agra", "Aligarh", "Ambedkar Nagar", "Amethi", "Amroha", "Auraiya", "Ayodhya", "Azamgarh", "Baghpat", "Bahraich", "Ballia", "Balrampur", "Banda", "Barabanki", "Bareilly", "Basti", "Bhadohi", "Bijnor", "Budaun", "Bulandshahr", "Chandauli", "Chitrakoot", "Deoria", "Etah", "Etawah", "Farrukhabad", "Fatehpur", "Firozabad", "Gautam Buddha Nagar", "Ghaziabad", "Ghazipur", "Gonda", "Gorakhpur", "Hamirpur", "Hapur", "Hardoi", "Hathras", "Jalaun", "Jaunpur", "Jhansi", "Kannauj", "Kanpur Dehat", "Kanpur Nagar", "Kasganj", "Kaushambi", "Kheri", "Kushinagar", "Lalitpur", "Lucknow", "Maharajganj", "Mahoba", "Mainpuri", "Mathura", "Mau", "Meerut", "Mirzapur", "Moradabad", "Muzaffarnagar", "Pilibhit", "Pratapgarh", "Prayagraj", "Raebareli", "Rampur", "Saharanpur", "Sambhal", "Sant Kabir Nagar", "Shahjahanpur", "Shamli", "Shravasti", "Siddharthnagar", "Sitapur", "Sonbhadra", "Sultanpur", "Unnao", "Varanasi"], "Uttarakhand": ["Almora", "Bageshwar", "Chamoli", "Champawat", "Dehradun", "Haridwar", "Nainital", "Pauri Garhwal", "Pithoragarh", "Rudraprayag", "Tehri Garhwal", "Udham Singh Nagar", "Uttarkashi"], "West Bengal": ["Alipurduar", "Bankura", "Birbhum", "Cooch Behar", "Dakshin Dinajpur", "Darjeeling", "Hooghly", "Howrah", "Jalpaiguri", "Jhargram", "Kalimpong", "Kolkata", "Malda", "Murshidabad", "Nadia", "North 24 Parganas", "Paschim Bardhaman", "Paschim Medinipur", "Purba Bardhaman", "Purba Medinipur", "Purulia", "South 24 Parganas", "Uttar Dinajpur"]};
(function(){
  const state=document.getElementById('signupState');
  const district=document.getElementById('signupDistrict');
  if(!state||!district)return;
  Object.keys(V34_INDIA_STATE_DISTRICTS).sort().forEach(name=>{
    const option=document.createElement('option');
    option.value=name; option.textContent=name; state.appendChild(option);
  });
  state.addEventListener('change',function(){
    district.innerHTML='<option value="">Select district</option>';
    const rows=V34_INDIA_STATE_DISTRICTS[state.value]||[];
    district.disabled=!rows.length;
    rows.forEach(name=>{
      const option=document.createElement('option');
      option.value=name; option.textContent=name; district.appendChild(option);
    });
  });
})();

window.toggleV35ProfileMenu=function(e){e?.stopPropagation();const m=document.getElementById('v35ProfileMenu');if(m)m.hidden=!m.hidden};
window.closeV35ProfileMenu=function(){const m=document.getElementById('v35ProfileMenu');if(m)m.hidden=true};
document.addEventListener('click',e=>{const w=document.querySelector('.v35-profile-menu-wrap');if(w&&!w.contains(e.target))closeV35ProfileMenu()});
window.openV35ProfileSection=function(id){closeV35ProfileMenu();if(typeof openDashSection==='function')openDashSection(id)};
window.loadV35DashboardOverview=async function(){
  const user=(typeof currentUser==='function'&&currentUser())||{};
  const name=user.name||user.Name||user.email?.split('@')[0]||'Member';
  const email=user.email||user.Email||'';
  ['v35HeaderName','v35MenuName'].forEach(id=>{const e=document.getElementById(id);if(e)e.textContent=name});
  const em=document.getElementById('v35MenuEmail');if(em)em.textContent=email;
  let reg={},game={xp:0,streak:0,level:'Beginner'};
  try{const r=await api('getRegistrationProfile',{token:token()});if(r?.success)reg=r.profile||{}}catch(e){}
  try{const g=await api('getMyGamification',{token:token()});if(g?.success)game=g}catch(e){}
  const set=(id,v,f)=>{const e=document.getElementById(id);if(e)e.textContent=v||f||''};
  set('v35TargetExam',reg.targetExam,'Target Examination');set('v35Qualification',reg.qualification,'Qualification');
  set('v35Location',[reg.state,reg.district].filter(Boolean).join(', '),'Location');set('v35CurrentLevel',game.level,'Beginner');
  set('v35Xp',game.xp||0,'0');set('v35Streak',game.streak||0,'0');
  let articles=0;try{articles=typeof v317HistoryCount==='function'?v317HistoryCount():0}catch(e){}set('v35ArticlesRead',articles,'0');
  let tests=0;try{const r=typeof v31GetLocalResults==='function'?v31GetLocalResults():[];tests=Array.isArray(r)?r.length:0}catch(e){}set('v35MockTests',tests,'0');
};
document.addEventListener('DOMContentLoaded',()=>{setTimeout(loadV35DashboardOverview,700);});


/* ======================================================
   v35.2 PROFILE VIEW / EDIT SYNCHRONIZATION
   ====================================================== */
function v352SetText(id,value){
  const el=document.getElementById(id);
  if(el)el.textContent=String(value||'').trim()||'Not provided';
}
function v352SetField(id,value){
  const el=document.getElementById(id);
  if(el && value!==undefined && value!==null)el.value=value;
}
function v352PopulateDistricts(stateName,selectedDistrict){
  const district=document.getElementById('v291District');
  if(!district)return;
  district.innerHTML='<option value="">Select district</option>';
  const rows=(typeof V34_INDIA_STATE_DISTRICTS!=='undefined'&&V34_INDIA_STATE_DISTRICTS[stateName])||[];
  district.disabled=!rows.length;
  rows.forEach(name=>{
    const option=document.createElement('option');
    option.value=name;
    option.textContent=name;
    option.selected=name===selectedDistrict;
    district.appendChild(option);
  });
}
function v352InitStateDistrict(){
  const state=document.getElementById('v291State');
  if(!state||state.dataset.v352Ready==='1')return;
  state.dataset.v352Ready='1';

  if(typeof V34_INDIA_STATE_DISTRICTS!=='undefined'){
    Object.keys(V34_INDIA_STATE_DISTRICTS).sort().forEach(name=>{
      if([...state.options].some(o=>o.value===name))return;
      const option=document.createElement('option');
      option.value=name;
      option.textContent=name;
      state.appendChild(option);
    });
  }
  state.addEventListener('change',()=>v352PopulateDistricts(state.value,''));
}
window.loadV352Profile=async function(){
  v352InitStateDistrict();

  const user=(typeof currentUser==='function'&&currentUser())||{};
  const local=(typeof getV291Profile==='function'&&getV291Profile())||{};
  let registration={};
  let baseProfile={};

  try{
    const r=await api('getRegistrationProfile',{token:token()});
    if(r?.success)registration=r.profile||{};
  }catch(e){}
  try{
    const p=await api('getProfile',{token:token()});
    if(p?.success)baseProfile=p.profile||{};
  }catch(e){}

  const merged={
    name:baseProfile.name||registration.name||user.name||'',
    email:user.email||registration.email||'',
    mobile:baseProfile.mobile||registration.mobile||'',
    qualification:local.qualification||registration.qualification||'',
    targetExam:baseProfile.exam||registration.targetExam||'',
    state:local.state||registration.state||'',
    district:local.district||registration.district||'',
    subject:baseProfile.subject||registration.subject||'',
    dob:local.dob||'',
    gender:local.gender||'',
    occupation:local.occupation||'',
    bio:baseProfile.bio||'',
    photo:local.photo||'logo.jpg'
  };

  // Read-only profile.
  const photo=document.getElementById('v352ViewPhoto');
  if(photo)photo.src=merged.photo;
  v352SetText('v352ViewName',merged.name);
  v352SetText('v352ViewEmail',merged.email);
  v352SetText('v352ViewMobile',merged.mobile);
  v352SetText('v352ViewQualification',merged.qualification);
  v352SetText('v352ViewExam',merged.targetExam);
  v352SetText('v352ViewState',merged.state);
  v352SetText('v352ViewDistrict',merged.district);
  v352SetText('v352ViewSubject',merged.subject);
  v352SetText('v352ViewDob',merged.dob);
  v352SetText('v352ViewGender',merged.gender);
  v352SetText('v352ViewOccupation',merged.occupation);
  v352SetText('v352ViewBio',merged.bio);

  // Editable profile.
  const editPhoto=document.getElementById('v291ProfilePhoto');
  if(editPhoto)editPhoto.src=merged.photo;
  v352SetField('profileName',merged.name);
  v352SetField('profileMobile',merged.mobile);
  v352SetField('v291Qualification',merged.qualification);
  v352SetField('profileExam',merged.targetExam);
  v352SetField('profileSubject',merged.subject);
  v352SetField('v291Dob',merged.dob);
  v352SetField('v291Gender',merged.gender);
  v352SetField('v291Occupation',merged.occupation);
  v352SetField('profileBio',merged.bio);
  v352SetField('v291State',merged.state);
  v352PopulateDistricts(merged.state,merged.district);
};
window.saveV352Profile=async function(){
  const getValue=(id)=>document.getElementById(id)?.value?.trim?.()||'';

  const payload={
    name:getValue('profileName'),
    mobile:getValue('profileMobile'),
    exam:getValue('profileExam'),
    subject:getValue('profileSubject'),
    bio:getValue('profileBio')
  };

  const extended={
    state:getValue('v291State'),
    district:getValue('v291District'),
    dob:getValue('v291Dob'),
    gender:getValue('v291Gender'),
    qualification:getValue('v291Qualification'),
    occupation:getValue('v291Occupation'),
    photo:document.getElementById('v291ProfilePhoto')?.src||''
  };

  if(!payload.name){
    const msg=document.getElementById('profileMsg');
    if(msg)msg.textContent='Full name is required.';
    return;
  }

  if(!extended.state||!extended.district){
    const msg=document.getElementById('profileMsg');
    if(msg)msg.textContent='Please select your State and District.';
    return;
  }

  const button=document.querySelector('#profileEdit .primary-btn');
  if(button){
    button.disabled=true;
    button.dataset.oldText=button.textContent;
    button.textContent='Saving...';
  }

  try{
    // Save main profile directly instead of calling the old saveProfile(),
    // because the old function expects fields removed in v35.2.
    const profileResponse=await api('saveProfile',{
      token:token(),
      name:payload.name,
      mobile:payload.mobile,
      city:extended.district,
      exam:payload.exam,
      subject:payload.subject,
      bio:payload.bio
    });

    if(!profileResponse?.success){
      throw new Error(profileResponse?.message||'Profile could not be saved.');
    }

    // Preserve v29.1 local data and extended profile fields.
    const local=(typeof getV291Profile==='function'&&getV291Profile())||{};
    Object.assign(local,extended);

    try{
      if(typeof saveV291Profile==='function'){
        saveV291Profile(local);
      }else{
        const user=(typeof currentUser==='function'&&currentUser())||{};
        localStorage.setItem(
          'isp_v291_profile_'+(user.email||'guest'),
          JSON.stringify(local)
        );
      }
    }catch(e){}

    // Save extended fields to backend when the route exists.
    try{
      await api('saveV291Profile',{
        token:token(),
        profile:local
      });
    }catch(e){
      // Main profile is already saved; keep extended values locally.
    }

    const msg=document.getElementById('profileMsg');
    if(msg){
      msg.textContent='Profile updated successfully.';
      msg.className='small-msg success';
    }

    if(typeof toast==='function')toast('Profile updated successfully');
    await loadV352Profile();
    openV35ProfileSection('profileView');
  }catch(error){
    const msg=document.getElementById('profileMsg');
    if(msg){
      msg.textContent=error?.message||'Profile could not be saved.';
      msg.className='small-msg error';
    }
  }finally{
    if(button){
      button.disabled=false;
      button.textContent=button.dataset.oldText||'Save Profile';
    }
  }
};

if(typeof openDashSection==='function'){
  const OLD_OPEN_DASH_V352=openDashSection;
  openDashSection=function(id,btn){
    OLD_OPEN_DASH_V352(id,btn);
    if(id==='profileView'||id==='profileEdit')setTimeout(loadV352Profile,70);
  };
}
document.addEventListener('DOMContentLoaded',()=>{
  v352InitStateDistrict();
});


/* ======================================================
   v36 ENTERPRISE CORE STABILITY
   ====================================================== */
window.V36_WAITING_SERVICE_WORKER=null;

window.updateV36ConnectionState=function(state,title,detail){
  const bar=document.getElementById('v36ConnectionBar');
  const text=document.getElementById('v36ConnectionText');
  const info=document.getElementById('v36ConnectionDetail');
  if(!bar)return;
  bar.className='v36-connection-bar '+state;
  if(text)text.textContent=title||'Portal Status';
  if(info)info.textContent=detail||'';
};

window.addEventListener('online',()=>{
  updateV36ConnectionState('online','Connection Restored','Portal services are available.');
});
window.addEventListener('offline',()=>{
  updateV36ConnectionState('offline','You Are Offline','Cached content remains available.');
});

window.runV36SystemCheck=async function(){
  const details=document.getElementById('v36SystemDetails');
  if(details)details.innerHTML='<p class="muted">Running system diagnostics...</p>';

  const network=navigator.onLine;
  const session=Boolean(token()&&currentUser()?.email);
  const standalone=window.matchMedia('(display-mode: standalone)').matches||navigator.standalone===true;

  let apiResult={success:false,message:'Not checked'};
  try{
    apiResult=await api('systemHealth',{token:token()});
  }catch(e){}

  const set=(id,value)=>{const el=document.getElementById(id);if(el)el.textContent=value};
  set('v36NetworkStatus',network?'Online':'Offline');
  set('v36SessionStatus',session?'Active':'Missing');
  set('v36PwaStatus',standalone?'Installed':'Browser Mode');
  set('v36ApiStatus',apiResult.success?'Operational':'Unavailable');

  if(details){
    details.innerHTML=`
      <div class="v36-system-row"><b>Internet Connection</b><span class="${network?'ok':'warn'}">${network?'Online':'Offline'}</span></div>
      <div class="v36-system-row"><b>User Session</b><span class="${session?'ok':'error'}">${session?'Valid':'Missing or expired'}</span></div>
      <div class="v36-system-row"><b>Backend API</b><span class="${apiResult.success?'ok':'error'}">${apiResult.success?'Operational':escapeHtml(apiResult.message||'Unavailable')}</span></div>
      <div class="v36-system-row"><b>Application Mode</b><span class="${standalone?'ok':'warn'}">${standalone?'Installed PWA':'Running in browser'}</span></div>
      <div class="v36-system-row"><b>Portal Version</b><span class="ok">v36 Enterprise Core Stability</span></div>`;
  }

  updateV36ConnectionState(
    !network?'offline':apiResult.success?'online':'error',
    !network?'You Are Offline':apiResult.success?'Portal Connected':'Backend Unavailable',
    !network?'Cached content remains available.':apiResult.success?'All core services are operational.':apiResult.message
  );
};

window.retryV36DashboardData=async function(){
  showLoader('Refreshing dashboard...','Synchronizing profile and learning data');
  try{
    await Promise.allSettled([
      typeof loadLatestArticles==='function'?loadLatestArticles():Promise.resolve(),
      typeof loadV35DashboardOverview==='function'?loadV35DashboardOverview():Promise.resolve(),
      typeof loadV352Profile==='function'?loadV352Profile():Promise.resolve(),
      typeof loadV33UserStats==='function'?loadV33UserStats():Promise.resolve()
    ]);
    toast('Dashboard data refreshed');
    await runV36SystemCheck();
  }finally{
    hideLoader();
  }
};

window.clearV36PortalCache=async function(){
  if(!confirm('Clear cached portal files and reload the latest version?'))return;
  try{
    if('caches' in window){
      const keys=await caches.keys();
      await Promise.all(keys.map(key=>caches.delete(key)));
    }
    if('serviceWorker' in navigator){
      const registrations=await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map(reg=>reg.unregister()));
    }
  }catch(e){}
  location.reload(true);
};

window.applyV36Update=function(){
  if(window.V36_WAITING_SERVICE_WORKER){
    window.V36_WAITING_SERVICE_WORKER.postMessage({type:'SKIP_WAITING'});
  }else{
    location.reload();
  }
};

window.initializeV36ServiceWorkerUpdates=async function(){
  if(!('serviceWorker' in navigator))return;
  try{
    const registration=await navigator.serviceWorker.getRegistration();
    if(!registration)return;

    if(registration.waiting){
      window.V36_WAITING_SERVICE_WORKER=registration.waiting;
      const banner=document.getElementById('v36UpdateBanner');
      if(banner)banner.hidden=false;
    }

    registration.addEventListener('updatefound',()=>{
      const worker=registration.installing;
      if(!worker)return;
      worker.addEventListener('statechange',()=>{
        if(worker.state==='installed'&&navigator.serviceWorker.controller){
          window.V36_WAITING_SERVICE_WORKER=worker;
          const banner=document.getElementById('v36UpdateBanner');
          if(banner)banner.hidden=false;
        }
      });
    });

    navigator.serviceWorker.addEventListener('controllerchange',()=>location.reload());
  }catch(e){}
};

window.guardV36LoadingState=function(containerId,retryFunction,delay=12000){
  setTimeout(()=>{
    const container=document.getElementById(containerId);
    if(!container)return;
    const text=(container.textContent||'').toLowerCase();
    if(text.includes('loading')){
      container.innerHTML=`
        <div class="v32-empty-category">
          <b>Content is taking longer than expected.</b><br>
          Please verify your connection and try again.
          <div style="margin-top:10px">
            <button class="mini-btn" onclick="${retryFunction}()">Retry</button>
          </div>
        </div>`;
    }
  },delay);
};

window.sendV36TestEmail=async function(){
  const button=document.getElementById('v36SendTestEmail');
  if(button){button.disabled=true;button.textContent='Sending...'}
  try{
    const result=await api('sendSystemTestEmail',{token:token()});
    if(result.success){
      toast('Test email sent successfully');
      if(typeof loadV318EmailReport==='function')loadV318EmailReport();
    }else{
      alert(result.message||'Test email could not be sent.');
    }
  }finally{
    if(button){button.disabled=false;button.textContent='Send Test Email'}
  }
};

if(typeof openDashSection==='function'){
  const OLD_OPEN_DASH_V36=openDashSection;
  openDashSection=function(id,btn){
    OLD_OPEN_DASH_V36(id,btn);
    if(id==='systemStatusModule')setTimeout(runV36SystemCheck,60);
    if(id==='mockTestsModule')guardV36LoadingState('v31TestsList','loadV31Tests',12000);
    if(id==='dailyQuizModule')guardV36LoadingState('v33QuizUnavailable','loadV33DailyQuiz',12000);
  };
}

document.addEventListener('DOMContentLoaded',()=>{
  updateV36ConnectionState(
    navigator.onLine?'online':'offline',
    navigator.onLine?'Portal Connected':'You Are Offline',
    navigator.onLine?'Checking core services...':'Cached content remains available.'
  );
  setTimeout(runV36SystemCheck,900);
  setTimeout(initializeV36ServiceWorkerUpdates,1200);
});


/* ======================================================
   v36.1 PHOTO + TICKER + SUPPORT FIX
   ====================================================== */
window.removeV361ProfilePhoto=function(){
  const img=document.getElementById('v291ProfilePhoto');
  if(img)img.src='logo.jpg';

  try{
    const local=(typeof getV291Profile==='function'&&getV291Profile())||{};
    local.photo='';
    if(typeof saveV291Profile==='function'){
      saveV291Profile(local);
    }else{
      const user=(typeof currentUser==='function'&&currentUser())||{};
      localStorage.setItem(
        'isp_v291_profile_'+(user.email||'guest'),
        JSON.stringify(local)
      );
    }
    if(typeof toast==='function')toast('Profile photo removed');
  }catch(e){}
};

window.v361SyncHeaderPhoto=function(){
  const editPhoto=document.getElementById('v291ProfilePhoto');
  if(!editPhoto)return;
  const src=editPhoto.src||'logo.jpg';
  ['v352ViewPhoto','v35HeaderAvatar','v35MenuAvatar'].forEach(id=>{
    const el=document.getElementById(id);
    if(el)el.src=src;
  });
};

document.addEventListener('change',function(event){
  if(event.target?.id==='v361ProfilePhotoInput'){
    setTimeout(v361SyncHeaderPhoto,250);
  }
});

if(typeof openDashSection==='function'){
  const OLD_OPEN_DASH_V361=openDashSection;
  openDashSection=function(id,btn){
    OLD_OPEN_DASH_V361(id,btn);
    if(id==='profileEdit'){
      setTimeout(v361SyncHeaderPhoto,150);
    }
  };
}


/* ======================================================
   v36.2 PROFESSIONAL TICKER + PHOTO EDITOR
   ====================================================== */
window.V362_TICKER_PAUSED=false;

function v362TickerPosts(){
  if(Array.isArray(window.ISP_LATEST_POSTS)&&window.ISP_LATEST_POSTS.length){
    return window.ISP_LATEST_POSTS;
  }
  if(typeof ISP_LATEST_POSTS!=='undefined'&&Array.isArray(ISP_LATEST_POSTS)&&ISP_LATEST_POSTS.length){
    return ISP_LATEST_POSTS;
  }
  if(typeof ISP_LOADED_POSTS!=='undefined'&&Array.isArray(ISP_LOADED_POSTS)){
    return ISP_LOADED_POSTS;
  }
  return [];
}

window.renderV362Ticker=function(){
  const content=document.getElementById('v362NewsContent');
  if(!content)return;

  const rows=v362TickerPosts().slice(0,12);
  if(!rows.length){
    content.innerHTML='<span class="v362-news-title" style="padding:0 12px">Latest articles will appear here automatically.</span>';
    return;
  }

  const cards=rows.map((post,index)=>{
    const title=post.title||'Article';
    const date=post.published||post.date||'';
    const image=post.thumbnail||post.image||'logo.jpg';
    return `<span class="v362-news-card" data-v362-index="${index}">
      <img src="${escapeAttr(image)}" alt="" onerror="this.onerror=null;this.src='logo.jpg'">
      <span class="v362-news-copy">
        <span class="v362-news-pill">LATEST</span>
        <span class="v362-news-date">${escapeHtml(date)}</span>
        <span class="v362-news-title">${escapeHtml(title)}</span>
      </span>
    </span>`;
  }).join('');

  // Duplicate cards for continuous visual movement.
  content.innerHTML=cards+cards;
};

window.toggleV362Ticker=function(){
  const marquee=document.getElementById('v362NewsMarquee');
  const button=document.getElementById('v362TickerToggle');
  if(!marquee||!button)return;

  window.V362_TICKER_PAUSED=!window.V362_TICKER_PAUSED;
  if(window.V362_TICKER_PAUSED){
    marquee.stop();
    button.textContent='▶';
    button.setAttribute('aria-label','Resume news ticker');
  }else{
    marquee.start();
    button.textContent='⏸';
    button.setAttribute('aria-label','Pause news ticker');
  }
};

document.addEventListener('click',function(event){
  const card=event.target.closest('.v362-news-card');
  if(!card)return;

  const index=Number(card.getAttribute('data-v362-index'));
  const posts=v362TickerPosts();
  const post=posts[index];
  if(!post)return;

  const loadedIndex=(typeof ISP_LOADED_POSTS!=='undefined'&&Array.isArray(ISP_LOADED_POSTS))
    ?ISP_LOADED_POSTS.findIndex(item=>item.title===post.title)
    :-1;

  if(loadedIndex>=0&&typeof openPostReader==='function'){
    openPostReader(loadedIndex);
  }else if(post.link){
    window.open(post.link,'_blank','noopener');
  }
});

window.handleV362ProfilePhoto=function(event){
  const file=event.target.files&&event.target.files[0];
  if(!file)return;

  const allowed=['image/jpeg','image/png','image/webp'];
  if(!allowed.includes(file.type)){
    alert('Please select a JPG, PNG or WebP image.');
    event.target.value='';
    return;
  }
  if(file.size>2*1024*1024){
    alert('Please choose an image smaller than 2 MB.');
    event.target.value='';
    return;
  }

  const reader=new FileReader();
  reader.onload=function(){
    const dataUrl=reader.result;
    const local=(typeof getV291Profile==='function'&&getV291Profile())||{};
    local.photo=dataUrl;

    if(typeof saveV291Profile==='function'){
      saveV291Profile(local);
    }else{
      const user=(typeof currentUser==='function'&&currentUser())||{};
      localStorage.setItem('isp_v291_profile_'+(user.email||'guest'),JSON.stringify(local));
    }

    ['v291ProfilePhoto','v352ViewPhoto','v35HeaderAvatar','v35MenuAvatar'].forEach(id=>{
      const img=document.getElementById(id);
      if(img)img.src=dataUrl;
    });

    if(typeof toast==='function')toast('Profile photo selected. Save Profile to confirm.');
  };
  reader.readAsDataURL(file);
};

window.removeV362ProfilePhoto=function(){
  const local=(typeof getV291Profile==='function'&&getV291Profile())||{};
  local.photo='';

  if(typeof saveV291Profile==='function'){
    saveV291Profile(local);
  }

  ['v291ProfilePhoto','v352ViewPhoto','v35HeaderAvatar','v35MenuAvatar'].forEach(id=>{
    const img=document.getElementById(id);
    if(img)img.src='logo.jpg';
  });

  const input=document.getElementById('v362ProfilePhotoInput');
  if(input)input.value='';
  if(typeof toast==='function')toast('Profile photo removed');
};

if(typeof loadLatestArticles==='function'){
  const OLD_LOAD_LATEST_V362=loadLatestArticles;
  loadLatestArticles=async function(){
    const result=await OLD_LOAD_LATEST_V362();
    setTimeout(renderV362Ticker,100);
    return result;
  };
}

if(typeof renderLearningPosts==='function'){
  const OLD_RENDER_LEARNING_V362=renderLearningPosts;
  renderLearningPosts=function(posts,listId){
    OLD_RENDER_LEARNING_V362(posts,listId);
    setTimeout(renderV362Ticker,80);
  };
}

document.addEventListener('DOMContentLoaded',function(){
  setTimeout(renderV362Ticker,700);
});


/* ======================================================
   v37 SMART DASHBOARD + LATEST JOBS HUB
   ====================================================== */
let V37_JOB_ROWS=[];
let V37_JOB_CATEGORY='latest';

function v37Text(id,value){
  const el=document.getElementById(id);
  if(el)el.textContent=value;
}

window.loadV37SmartDashboard=async function(){
  let registration={};
  let game={xp:0,streak:0,level:'Beginner'};
  try{
    const r=await api('getRegistrationProfile',{token:token()});
    if(r?.success)registration=r.profile||{};
  }catch(e){}
  try{
    const g=await api('getMyGamification',{token:token()});
    if(g?.success)game=g;
  }catch(e){}

  const exam=registration.targetExam||'your selected examination';
  v37Text('v37FocusTitle',`Focus on ${exam}`);
  v37Text(
    'v37FocusText',
    `Complete the Daily Quiz, review one learning article and check relevant job or examination alerts for ${exam}.`
  );
  v37Text('v37SmartStreak',`${Number(game.streak||0)} Days`);

  let readCount=0;
  try{
    readCount=typeof v317HistoryCount==='function'?v317HistoryCount():0;
  }catch(e){}
  v37Text('v37TodayReading',`${readCount} Articles`);
};

window.setV37JobCategory=function(category,button){
  V37_JOB_CATEGORY=category;
  document.querySelectorAll('.v37-job-tabs button').forEach(btn=>btn.classList.remove('active'));
  if(button)button.classList.add('active');
  renderV37Jobs();
};

function v37CategoryLabel(category){
  return {
    latest:'Latest Job',
    haryana:'Haryana',
    'admit-card':'Admit Card',
    result:'Result',
    'answer-key':'Answer Key'
  }[category]||'Update';
}

window.renderV37Jobs=function(){
  const list=document.getElementById('v37JobsList');
  const status=document.getElementById('v37JobsStatus');
  if(!list)return;

  const rows=V37_JOB_ROWS.filter(row=>{
    if(V37_JOB_CATEGORY==='latest')return row.category==='latest'||row.category==='job';
    return row.category===V37_JOB_CATEGORY;
  });

  if(status)status.innerHTML=rows.length
    ?`<p class="muted">${rows.length} verified source listings found.</p>`
    :'<p class="muted">No matching alerts are available in the current feed.</p>';

  list.innerHTML=rows.map(row=>`
    <article class="v37-job-card">
      <div class="v37-job-card-head">
        <h4>${escapeHtml(row.title||'Job Update')}</h4>
        <span class="v37-job-type">${escapeHtml(v37CategoryLabel(row.category))}</span>
      </div>
      <div class="v37-job-meta">
        <span>🗓 ${escapeHtml(row.date||'Recently updated')}</span>
        <span>🏛 ${escapeHtml(row.organization||'Government Recruitment')}</span>
      </div>
      <div class="v37-job-actions">
        <span class="v37-job-source">Source: ${escapeHtml(row.source||'FreeJobAlert')}</span>
        <a href="${escapeAttr(row.url)}" target="_blank" rel="noopener noreferrer">View Original ↗</a>
      </div>
    </article>
  `).join('');
};

window.loadV37JobAlerts=async function(forceRefresh=false){
  const status=document.getElementById('v37JobsStatus');
  const list=document.getElementById('v37JobsList');
  if(status)status.innerHTML='<p class="muted">Loading latest source updates...</p>';
  if(list)list.innerHTML='';

  try{
    const result=await api('getExternalJobAlerts',{
      token:token(),
      forceRefresh:Boolean(forceRefresh)
    });

    if(!result?.success){
      throw new Error(result?.message||'Job alerts are temporarily unavailable.');
    }

    V37_JOB_ROWS=Array.isArray(result.rows)?result.rows:[];
    v37Text('v37JobAlertCount',`${V37_JOB_ROWS.length} Updates`);
    renderV37Jobs();
  }catch(error){
    if(status){
      status.innerHTML=`<div class="v37-jobs-error">
        <b>Job alerts could not be updated.</b><br>
        ${escapeHtml(error.message)}
      </div>`;
    }
    v37Text('v37JobAlertCount','Unavailable');
  }
};

if(typeof openDashSection==='function'){
  const OLD_OPEN_DASH_V37=openDashSection;
  openDashSection=function(id,btn){
    OLD_OPEN_DASH_V37(id,btn);
    if(id==='latestJobsModule'&&!V37_JOB_ROWS.length)setTimeout(()=>loadV37JobAlerts(false),60);
  };
}

if(typeof loadDashboard==='function'){
  const OLD_LOAD_DASH_V37=loadDashboard;
  loadDashboard=async function(){
    await OLD_LOAD_DASH_V37();
    setTimeout(loadV37SmartDashboard,500);
    setTimeout(()=>loadV37JobAlerts(false),900);
  };
}


/* ======================================================
   v38 VERSION MANAGER + RELEASE NOTIFICATIONS
   ====================================================== */
let V38_VERSION_HISTORY=[];

function v38Lines(value){
  return String(value||'').split(/\n+/).map(x=>x.trim()).filter(Boolean);
}
function v38ListHtml(title,items){
  if(!items||!items.length)return '';
  return `<section><h4>${escapeHtml(title)}</h4><ul>${items.map(x=>`<li>${escapeHtml(x)}</li>`).join('')}</ul></section>`;
}
function v38VersionCard(version){
  return `<article class="v38-version-card">
    <div class="v38-version-card-head">
      <div><h4>${escapeHtml(version.version||'Version')}</h4><small>${escapeHtml(version.title||'Release')}</small></div>
      <span class="v38-version-chip">${escapeHtml(version.releaseDate||'')}</span>
    </div>
    <div class="v38-version-lists">
      <div>${v38ListHtml("What's New",version.whatsNew||[])}</div>
      <div>${v38ListHtml("Improvements",version.improvements||[])}</div>
      <div>${v38ListHtml("Bug Fixes",version.bugFixes||[])}</div>
    </div>
  </article>`;
}

window.previewV38Release=function(){
  const version=document.getElementById('v38VersionNumber')?.value||'';
  const title=document.getElementById('v38ReleaseTitle')?.value||'';
  const releaseDate=document.getElementById('v38ReleaseDate')?.value||'';
  const preview=document.getElementById('v38VersionPreview');
  if(!preview)return;
  preview.hidden=false;
  preview.innerHTML=v38VersionCard({
    version,title,releaseDate,
    whatsNew:v38Lines(document.getElementById('v38WhatsNew')?.value),
    improvements:v38Lines(document.getElementById('v38Improvements')?.value),
    bugFixes:v38Lines(document.getElementById('v38BugFixes')?.value)
  });
};

window.publishV38Version=async function(){
  const msg=document.getElementById('v38VersionMsg');
  const payload={
    token:token(),
    version:document.getElementById('v38VersionNumber')?.value||'',
    title:document.getElementById('v38ReleaseTitle')?.value||'',
    releaseDate:document.getElementById('v38ReleaseDate')?.value||'',
    whatsNew:v38Lines(document.getElementById('v38WhatsNew')?.value),
    improvements:v38Lines(document.getElementById('v38Improvements')?.value),
    bugFixes:v38Lines(document.getElementById('v38BugFixes')?.value),
    critical:Boolean(document.getElementById('v38CriticalUpdate')?.checked),
    sendEmails:Boolean(document.getElementById('v38SendEmails')?.checked)
  };
  if(!payload.version||!payload.title){
    if(msg)msg.textContent='Version number and release title are required.';
    return;
  }
  showLoader('Publishing version...','Saving release notes and sending notifications');
  try{
    const r=await api('publishVersionRelease',payload);
    if(msg)msg.textContent=r.message||'';
    if(r.success){
      toast('Version published successfully');
      loadV38VersionHistory();
    }
  }finally{hideLoader()}
};

window.loadV38VersionHistory=async function(){
  const adminList=document.getElementById('v38AdminVersionHistory');
  const userList=document.getElementById('v38UserVersionHistory');
  try{
    const r=await api('getVersionHistory',{token:token()});
    if(!r.success)throw new Error(r.message);
    V38_VERSION_HISTORY=r.rows||[];
    const html=V38_VERSION_HISTORY.length
      ?V38_VERSION_HISTORY.map(v38VersionCard).join('')
      :'<p class="muted">No published versions yet.</p>';
    if(adminList)adminList.innerHTML=html;
    if(userList)userList.innerHTML=html;
  }catch(error){
    const html=`<p class="muted">${escapeHtml(error.message)}</p>`;
    if(adminList)adminList.innerHTML=html;
    if(userList)userList.innerHTML=html;
  }
};

window.checkV38LatestVersion=async function(){
  try{
    const r=await api('getLatestVersion',{token:token(),currentVersion:'v43.0.0'});
    if(!r.success||!r.updateAvailable)return;
    const version=r.release;
    const dismissed=localStorage.getItem('isp_v38_dismissed_version');
    if(dismissed===version.version&&!version.critical)return;

    document.getElementById('v38ModalTitle').textContent=`${version.version} is now available`;
    document.getElementById('v38ModalSubtitle').textContent=version.title||'A new version has been released.';
    document.getElementById('v38ModalNotes').innerHTML=
      v38ListHtml("What's New",version.whatsNew||[])+
      v38ListHtml("Improvements",version.improvements||[])+
      v38ListHtml("Bug Fixes",version.bugFixes||[]);
    const later=document.getElementById('v38RemindLaterBtn');
    if(later)later.hidden=Boolean(version.critical);
    document.getElementById('v38ReleaseModal').hidden=false;
    window.V38_LATEST_RELEASE=version;
  }catch(e){}
};

window.applyV38Update=function(){
  localStorage.removeItem('isp_v38_dismissed_version');
  if(typeof clearV36PortalCache==='function'){
    clearV36PortalCache();
  }else{
    location.reload(true);
  }
};
window.remindV38Later=function(){
  const version=window.V38_LATEST_RELEASE?.version||'';
  if(version)localStorage.setItem('isp_v38_dismissed_version',version);
  const modal=document.getElementById('v38ReleaseModal');
  if(modal)modal.hidden=true;
};

if(typeof openDashSection==='function'){
  const OLD_OPEN_DASH_V38=openDashSection;
  openDashSection=function(id,btn){
    OLD_OPEN_DASH_V38(id,btn);
    if(id==='versionHistoryModule')setTimeout(loadV38VersionHistory,50);
  };
}
if(typeof openAdminSection==='function'){
  const OLD_OPEN_ADMIN_V38=openAdminSection;
  openAdminSection=function(id,btn){
    OLD_OPEN_ADMIN_V38(id,btn);
    if(id==='versionManagerModule')setTimeout(loadV38VersionHistory,50);
  };
}
document.addEventListener('DOMContentLoaded',()=>{
  setTimeout(checkV38LatestVersion,1200);
});


/* ======================================================
   v39 STUDENT PRODUCTIVITY SUITE
   ====================================================== */
let V39_TASKS=[];
let V39_NOTES=[];
let V39_TIMER_TOTAL=25*60;
let V39_TIMER_REMAINING=V39_TIMER_TOTAL;
let V39_TIMER_INTERVAL=null;
let V39_TIMER_STARTED_AT=null;
let V39_TIMER_FOCUS_MINUTES=25;
let V39_TIMER_BREAK_MINUTES=5;

function v39Today(){
  return new Date().toISOString().slice(0,10);
}
function v39SetText(id,value){
  const el=document.getElementById(id);
  if(el)el.textContent=value;
}
window.showV39ProductivityTab=function(tab,button){
  document.querySelectorAll('.v39-tab-panel').forEach(el=>el.classList.remove('active'));
  document.querySelectorAll('.v39-productivity-tabs button').forEach(el=>el.classList.remove('active'));
  const panel=document.getElementById('v39Tab'+tab.charAt(0).toUpperCase()+tab.slice(1));
  if(panel)panel.classList.add('active');
  if(button)button.classList.add('active');

  if(tab==='planner')loadV39StudyTasks();
  if(tab==='timer')loadV39FocusSessions();
  if(tab==='notes')loadV39Notes();
  if(tab==='analytics')loadV39ProductivityAnalytics();
  if(tab==='roadmap')loadV39ExamRoadmap();
};

window.createV39StudyTask=async function(){
  const payload={
    token:token(),
    title:document.getElementById('v39TaskTitle')?.value||'',
    category:document.getElementById('v39TaskCategory')?.value||'General Study',
    dueDate:document.getElementById('v39TaskDate')?.value||v39Today(),
    priority:document.getElementById('v39TaskPriority')?.value||'Medium',
    plannedMinutes:Number(document.getElementById('v39TaskMinutes')?.value||30),
    note:document.getElementById('v39TaskNote')?.value||''
  };
  const msg=document.getElementById('v39PlannerMsg');
  if(!payload.title.trim()){
    if(msg)msg.textContent='Task title is required.';
    return;
  }
  const r=await api('createStudyTask',payload);
  if(msg)msg.textContent=r.message||'';
  if(r.success){
    document.getElementById('v39TaskTitle').value='';
    document.getElementById('v39TaskNote').value='';
    loadV39StudyTasks();
  }
};

window.loadV39StudyTasks=async function(){
  const list=document.getElementById('v39TaskList');
  if(list)list.innerHTML='<p class="muted">Loading study tasks...</p>';
  const r=await api('listStudyTasks',{token:token()});
  if(!r.success){
    if(list)list.innerHTML=`<p class="muted">${escapeHtml(r.message)}</p>`;
    return;
  }
  V39_TASKS=r.rows||[];
  const today=V39_TASKS.filter(x=>x.dueDate===v39Today());
  const completed=today.filter(x=>x.status==='Completed').length;
  const planned=today.reduce((sum,x)=>sum+Number(x.plannedMinutes||0),0);
  const summary=document.getElementById('v39PlannerSummary');
  if(summary)summary.innerHTML=`
    <div><b>${today.length}</b><small>TODAY'S TASKS</small></div>
    <div><b>${completed}</b><small>COMPLETED</small></div>
    <div><b>${planned}</b><small>PLANNED MINUTES</small></div>`;

  if(list){
    list.innerHTML=V39_TASKS.length?V39_TASKS.map(task=>`
      <article class="v39-task-card ${task.status==='Completed'?'completed':''}">
        <input class="v39-task-check" type="checkbox" ${task.status==='Completed'?'checked':''}
          onchange="toggleV39StudyTask('${escapeAttr(task.id)}',this.checked)">
        <div>
          <h4>${escapeHtml(task.title)}</h4>
          <p>${escapeHtml(task.category)} · ${escapeHtml(task.dueDate)} · ${task.plannedMinutes||0} min</p>
        </div>
        <div>
          <span class="v39-priority ${escapeAttr(task.priority)}">${escapeHtml(task.priority)}</span>
          <button class="v39-delete-btn" onclick="deleteV39StudyTask('${escapeAttr(task.id)}')">×</button>
        </div>
      </article>`).join(''):'<p class="muted">No study tasks created yet.</p>';
  }
  loadV39ProductivityAnalytics();
};

window.toggleV39StudyTask=async function(id,completed){
  await api('updateStudyTaskStatus',{token:token(),id,status:completed?'Completed':'Pending'});
  loadV39StudyTasks();
};
window.deleteV39StudyTask=async function(id){
  if(!confirm('Delete this study task?'))return;
  await api('deleteStudyTask',{token:token(),id});
  loadV39StudyTasks();
};

function updateV39TimerDisplay(){
  const minutes=Math.floor(V39_TIMER_REMAINING/60);
  const seconds=V39_TIMER_REMAINING%60;
  v39SetText('v39TimerDisplay',`${String(minutes).padStart(2,'0')}:${String(seconds).padStart(2,'0')}`);
}
window.setV39TimerPreset=function(focus,breakMinutes,button){
  pauseV39FocusTimer();
  V39_TIMER_FOCUS_MINUTES=focus;
  V39_TIMER_BREAK_MINUTES=breakMinutes;
  V39_TIMER_TOTAL=focus*60;
  V39_TIMER_REMAINING=V39_TIMER_TOTAL;
  document.querySelectorAll('.v39-timer-presets button').forEach(x=>x.classList.remove('active'));
  if(button)button.classList.add('active');
  updateV39TimerDisplay();
};
window.startV39FocusTimer=function(){
  if(V39_TIMER_INTERVAL)return;
  if(!V39_TIMER_STARTED_AT)V39_TIMER_STARTED_AT=Date.now();
  v39SetText('v39TimerStatus','Focus session in progress.');
  V39_TIMER_INTERVAL=setInterval(async()=>{
    V39_TIMER_REMAINING--;
    updateV39TimerDisplay();
    if(V39_TIMER_REMAINING<=0){
      clearInterval(V39_TIMER_INTERVAL);
      V39_TIMER_INTERVAL=null;
      const subject=document.getElementById('v39TimerSubject')?.value||'Focused Study';
      await api('logStudySession',{
        token:token(),subject,durationMinutes:V39_TIMER_FOCUS_MINUTES,
        sessionType:'Focus',completed:true
      });
      V39_TIMER_STARTED_AT=null;
      alert(`Focus session complete. Take a ${V39_TIMER_BREAK_MINUTES}-minute break.`);
      resetV39FocusTimer();
      loadV39FocusSessions();
    }
  },1000);
};
window.pauseV39FocusTimer=function(){
  if(V39_TIMER_INTERVAL){
    clearInterval(V39_TIMER_INTERVAL);
    V39_TIMER_INTERVAL=null;
    v39SetText('v39TimerStatus','Focus session paused.');
  }
};
window.resetV39FocusTimer=function(){
  pauseV39FocusTimer();
  V39_TIMER_REMAINING=V39_TIMER_TOTAL;
  V39_TIMER_STARTED_AT=null;
  updateV39TimerDisplay();
  v39SetText('v39TimerStatus','Ready for a focused study session.');
};

window.loadV39FocusSessions=async function(){
  const r=await api('listStudySessions',{token:token()});
  const list=document.getElementById('v39SessionList');
  if(!r.success){
    if(list)list.innerHTML=`<p class="muted">${escapeHtml(r.message)}</p>`;
    return;
  }
  const rows=r.rows||[];
  const total=rows.reduce((sum,x)=>sum+Number(x.durationMinutes||0),0);
  const today=rows.filter(x=>String(x.sessionDate||'').slice(0,10)===v39Today());
  const summary=document.getElementById('v39SessionSummary');
  if(summary)summary.innerHTML=`
    <div><b>${rows.length}</b><small>SESSIONS</small></div>
    <div><b>${total}</b><small>TOTAL MINUTES</small></div>
    <div><b>${today.length}</b><small>TODAY</small></div>`;
  if(list)list.innerHTML=rows.length?rows.slice(0,12).map(x=>`
    <article class="v39-session-card">
      <b>${escapeHtml(x.subject||'Focused Study')}</b>
      <p class="muted">${x.durationMinutes||0} minutes · ${escapeHtml(x.sessionDate||'')}</p>
    </article>`).join(''):'<p class="muted">No completed focus sessions yet.</p>';
};

window.saveV39Note=async function(){
  const payload={
    token:token(),
    title:document.getElementById('v39NoteTitle')?.value||'',
    category:document.getElementById('v39NoteCategory')?.value||'General',
    body:document.getElementById('v39NoteBody')?.value||'',
    pinned:Boolean(document.getElementById('v39NotePinned')?.checked)
  };
  const msg=document.getElementById('v39NoteMsg');
  if(!payload.title.trim()||!payload.body.trim()){
    if(msg)msg.textContent='Note title and content are required.';
    return;
  }
  const r=await api('saveProductivityNote',payload);
  if(msg)msg.textContent=r.message||'';
  if(r.success){
    document.getElementById('v39NoteTitle').value='';
    document.getElementById('v39NoteBody').value='';
    document.getElementById('v39NotePinned').checked=false;
    loadV39Notes();
  }
};
window.loadV39Notes=async function(){
  const r=await api('listProductivityNotes',{token:token()});
  const list=document.getElementById('v39NotesList');
  if(!r.success){
    if(list)list.innerHTML=`<p class="muted">${escapeHtml(r.message)}</p>`;
    return;
  }
  V39_NOTES=r.rows||[];
  renderV39Notes();
};
window.renderV39Notes=function(){
  const list=document.getElementById('v39NotesList');
  if(!list)return;
  const q=(document.getElementById('v39NoteSearch')?.value||'').toLowerCase();
  const rows=V39_NOTES.filter(x=>(x.title+' '+x.category+' '+x.body).toLowerCase().includes(q));
  list.innerHTML=rows.length?rows.map(note=>`
    <article class="v39-note-card ${note.pinned?'pinned':''}">
      <div class="v39-note-head">
        <div><h4>${note.pinned?'📌 ':''}${escapeHtml(note.title)}</h4><p>${escapeHtml(note.body)}</p></div>
        <button class="v39-delete-btn" onclick="deleteV39Note('${escapeAttr(note.id)}')">×</button>
      </div>
      <div class="v39-note-meta"><span>${escapeHtml(note.category)}</span><span>${escapeHtml(note.updatedAt||'')}</span></div>
    </article>`).join(''):'<p class="muted">No matching notes found.</p>';
};
window.deleteV39Note=async function(id){
  if(!confirm('Delete this note?'))return;
  await api('deleteProductivityNote',{token:token(),id});
  loadV39Notes();
};

window.loadV39ProductivityAnalytics=async function(){
  const r=await api('getProductivityAnalytics',{token:token()});
  if(!r.success)return;
  v39SetText('v39ProductivityScore',`${r.productivityScore||0}%`);
  const cards=document.getElementById('v39AnalyticsCards');
  if(cards)cards.innerHTML=`
    <article><span>✅</span><b>${r.completedTasks||0}</b><small>COMPLETED TASKS</small></article>
    <article><span>⏱</span><b>${r.studyMinutes||0}</b><small>STUDY MINUTES</small></article>
    <article><span>📝</span><b>${r.notesCount||0}</b><small>SAVED NOTES</small></article>
    <article><span>🔥</span><b>${r.activeDays||0}</b><small>ACTIVE DAYS</small></article>`;
  const chart=document.getElementById('v39WeeklyChart');
  if(chart)chart.innerHTML=(r.weekly||[]).map(day=>`
    <div class="v39-week-day">
      <small>${day.minutes}m</small>
      <div class="v39-week-bar" style="height:${Math.max(4,Math.min(180,day.minutes*2))}px"></div>
      <b>${escapeHtml(day.label)}</b>
    </div>`).join('');
  const insights=document.getElementById('v39Insights');
  if(insights)insights.innerHTML=(r.insights||[]).map(x=>`<div class="v39-insight">${escapeHtml(x)}</div>`).join('');
};

window.loadV39ExamRoadmap=async function(){
  const r=await api('getExamRoadmap',{token:token()});
  const header=document.getElementById('v39RoadmapHeader');
  const list=document.getElementById('v39RoadmapList');
  if(!r.success){
    if(list)list.innerHTML=`<p class="muted">${escapeHtml(r.message)}</p>`;
    return;
  }
  if(header)header.innerHTML=`<h3>${escapeHtml(r.exam)} Preparation Roadmap</h3><p>${escapeHtml(r.summary)}</p>`;
  if(list)list.innerHTML=(r.steps||[]).map(step=>`
    <article class="v39-roadmap-card">
      <span>${step.icon}</span>
      <h4>${escapeHtml(step.title)}</h4>
      <p>${escapeHtml(step.description)}</p>
    </article>`).join('');
};

if(typeof openDashSection==='function'){
  const OLD_OPEN_DASH_V39=openDashSection;
  openDashSection=function(id,btn){
    OLD_OPEN_DASH_V39(id,btn);
    if(id==='productivityHubModule'){
      setTimeout(()=>{
        const date=document.getElementById('v39TaskDate');
        if(date&&!date.value)date.value=v39Today();
        updateV39TimerDisplay();
        loadV39StudyTasks();
      },60);
    }
  };
}
document.addEventListener('DOMContentLoaded',()=>{
  const date=document.getElementById('v39TaskDate');
  if(date)date.value=v39Today();
  updateV39TimerDisplay();
});

let V40_CBT_TEST=null,V40_CBT_QUESTIONS=[],V40_CBT_INDEX=0,V40_CBT_ANSWERS={},V40_CBT_STATUS={},V40_CBT_SECONDS=0,V40_CBT_TIMER=null;
window.loadV40AvailableTests=async function(){const box=document.getElementById('v40AvailableTests');if(box)box.innerHTML='<p class="muted">Loading available tests...</p>';const r=await api('listProfessionalTests',{token:token()});if(!r.success){if(box)box.innerHTML=`<p class="muted">${escapeHtml(r.message)}</p>`;return}if(box)box.innerHTML=(r.rows||[]).length?(r.rows||[]).map(t=>`<article class="v40-test-card"><h4>${escapeHtml(t.title)}</h4><p>${t.questionCount||0} questions · ${t.durationMinutes||0} minutes · ${t.negativeMarks||0} negative marks</p><button onclick="startV40Cbt('${escapeAttr(t.id)}')">Start / Resume Test</button></article>`).join(''):'<p class="muted">No published CBT tests are available.</p>'};
window.startV40Cbt=async function(testId){showLoader('Opening CBT test...','Loading questions and saved progress');try{const r=await api('getProfessionalTest',{token:token(),testId});if(!r.success){alert(r.message);return}V40_CBT_TEST=r.test;V40_CBT_QUESTIONS=r.questions||[];V40_CBT_ANSWERS=r.savedProgress?.answers||{};V40_CBT_STATUS=r.savedProgress?.status||{};V40_CBT_INDEX=Number(r.savedProgress?.currentIndex||0);V40_CBT_SECONDS=Number(r.savedProgress?.secondsRemaining||V40_CBT_TEST.durationMinutes*60);document.getElementById('v40CbtTestTitle').textContent=V40_CBT_TEST.title;const u=(typeof currentUser==='function'&&currentUser())||{};document.getElementById('v40CbtUserName').textContent=u.name||u.email?.split('@')[0]||'Member';document.getElementById('v40CbtShell').hidden=false;document.body.style.overflow='hidden';renderV40CbtQuestion();renderV40Palette();updateV40Timer();clearInterval(V40_CBT_TIMER);V40_CBT_TIMER=setInterval(()=>{V40_CBT_SECONDS--;updateV40Timer();saveV40Progress(false);if(V40_CBT_SECONDS<=0){clearInterval(V40_CBT_TIMER);submitV40Cbt(true)}},1000)}finally{hideLoader()}};
function updateV40Timer(){const m=Math.floor(Math.max(0,V40_CBT_SECONDS)/60),s=Math.max(0,V40_CBT_SECONDS)%60;v39SetText('v40CbtTimer',`${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`)}
function currentV40Question(){return V40_CBT_QUESTIONS[V40_CBT_INDEX]}
function renderV40CbtQuestion(){const q=currentV40Question();if(!q)return;v39SetText('v40CbtQuestionCounter',`${V40_CBT_INDEX+1} / ${V40_CBT_QUESTIONS.length}`);v39SetText('v40CbtSubject',q.topic||q.subject||'General');v39SetText('v40CbtMarks',`+${q.positiveMarks||1} / -${q.negativeMarks||0}`);v39SetText('v40CbtQuestionText',q.question);if(!V40_CBT_STATUS[q.id])V40_CBT_STATUS[q.id]='not-answered';const selected=V40_CBT_ANSWERS[q.id]||'';document.getElementById('v40CbtOptions').innerHTML=['A','B','C','D'].map(k=>`<label class="v40-cbt-option ${selected===k?'selected':''}"><input type="radio" name="v40Option" value="${k}" ${selected===k?'checked':''} onchange="selectV40Answer('${escapeAttr(q.id)}','${k}')"><span><b>${k}.</b> ${escapeHtml(q['option'+k]||'')}</span></label>`).join('');renderV40Palette()}
window.selectV40Answer=function(id,key){V40_CBT_ANSWERS[id]=key;V40_CBT_STATUS[id]='answered';renderV40CbtQuestion();saveV40Progress(false)};
window.clearV40Response=function(){const q=currentV40Question();if(!q)return;delete V40_CBT_ANSWERS[q.id];V40_CBT_STATUS[q.id]='not-answered';renderV40CbtQuestion();saveV40Progress(false)};
window.markV40ForReview=function(){const q=currentV40Question();if(!q)return;V40_CBT_STATUS[q.id]='review';if(V40_CBT_INDEX<V40_CBT_QUESTIONS.length-1)V40_CBT_INDEX++;renderV40CbtQuestion();saveV40Progress(false)};
window.previousV40Question=function(){if(V40_CBT_INDEX>0){V40_CBT_INDEX--;renderV40CbtQuestion();saveV40Progress(false)}};
window.saveAndNextV40Question=function(){const q=currentV40Question();if(q)V40_CBT_STATUS[q.id]=V40_CBT_ANSWERS[q.id]?'answered':'not-answered';if(V40_CBT_INDEX<V40_CBT_QUESTIONS.length-1)V40_CBT_INDEX++;renderV40CbtQuestion();saveV40Progress(false)};
function renderV40Palette(){const p=document.getElementById('v40CbtPalette');if(!p)return;p.innerHTML=V40_CBT_QUESTIONS.map((q,i)=>`<button class="v40-palette-btn ${V40_CBT_STATUS[q.id]||'not-visited'} ${i===V40_CBT_INDEX?'current':''}" onclick="goToV40Question(${i})">${i+1}</button>`).join('')}
window.goToV40Question=function(i){V40_CBT_INDEX=i;renderV40CbtQuestion();saveV40Progress(false)};
async function saveV40Progress(force){if(!V40_CBT_TEST)return;if(!force&&Date.now()-(window.V40_LAST_SAVE||0)<4000)return;window.V40_LAST_SAVE=Date.now();await api('saveProfessionalTestProgress',{token:token(),testId:V40_CBT_TEST.id,answers:V40_CBT_ANSWERS,status:V40_CBT_STATUS,currentIndex:V40_CBT_INDEX,secondsRemaining:V40_CBT_SECONDS})}
window.exitV40Cbt=async function(){await saveV40Progress(true);clearInterval(V40_CBT_TIMER);document.getElementById('v40CbtShell').hidden=true;document.body.style.overflow=''};
window.submitV40Cbt=async function(autoSubmit){if(!autoSubmit&&!confirm('Submit this test?'))return;clearInterval(V40_CBT_TIMER);showLoader('Submitting test...','Calculating score, rank and percentile');try{const r=await api('submitProfessionalTest',{token:token(),testId:V40_CBT_TEST.id,answers:V40_CBT_ANSWERS,timeTaken:Number(V40_CBT_TEST.durationMinutes*60-V40_CBT_SECONDS)});if(!r.success){alert(r.message);return}document.getElementById('v40CbtShell').hidden=true;document.body.style.overflow='';toast('Mock test submitted successfully');openDashSection('v40ResultAnalysisModule');loadV40ResultHistory()}finally{hideLoader()}};
window.loadV40ResultHistory=async function(){const box=document.getElementById('v40ResultHistory');if(box)box.innerHTML='<p class="muted">Loading results...</p>';const r=await api('listProfessionalTestResults',{token:token()});if(!r.success){if(box)box.innerHTML=`<p class="muted">${escapeHtml(r.message)}</p>`;return}if(box)box.innerHTML=(r.rows||[]).length?(r.rows||[]).map(x=>`<article class="v40-result-card"><h3>${escapeHtml(x.testTitle)}</h3><div class="v40-result-summary"><div><b>${x.score}</b><small>SCORE</small></div><div><b>${x.percentage}%</b><small>ACCURACY</small></div><div><b>#${x.rank||'-'}</b><small>RANK</small></div><div><b>${x.percentile||0}</b><small>PERCENTILE</small></div><div><b>${x.timeTakenMinutes||0}m</b><small>TIME</small></div></div><div class="v40-weak-topics">${(x.weakTopics||[]).map(t=>`<span>${escapeHtml(t)}</span>`).join('')}</div><button class="mini-btn" onclick="reviewV40Result('${escapeAttr(x.resultId)}')">Review Answers</button><div id="v40Review_${escapeAttr(x.resultId)}"></div></article>`).join(''):'<p class="muted">No CBT test results found.</p>'};
window.reviewV40Result=async function(resultId){const box=document.getElementById('v40Review_'+resultId);if(!box)return;box.innerHTML='<p class="muted">Loading answer review...</p>';const r=await api('getProfessionalTestReview',{token:token(),resultId});if(!r.success){box.innerHTML=`<p class="muted">${escapeHtml(r.message)}</p>`;return}box.innerHTML=(r.rows||[]).map((q,i)=>`<div class="v39-insight"><b>Q${i+1}. ${escapeHtml(q.question)}</b><br>Your answer: ${escapeHtml(q.userAnswer||'Not answered')} · Correct: ${escapeHtml(q.correctAnswer)}<br>${escapeHtml(q.explanation||'No explanation provided.')}</div>`).join('')};
if(typeof openDashSection==='function'){const OLD_OPEN_DASH_V40=openDashSection;openDashSection=function(id,btn){OLD_OPEN_DASH_V40(id,btn);if(id==='mockTestsModule')setTimeout(loadV40AvailableTests,60);if(id==='v40ResultAnalysisModule')setTimeout(loadV40ResultHistory,60)}}

/* v41 Smart Learning & Professional Communication */
window.loadV41SmartDashboard=async function(){
  const r=await api('getSmartLearningDashboard',{token:token()});
  if(!r.success)return;
  v39SetText('v41StudyStreak',`${r.streak||0} days`);
  v39SetText('v41WelcomeTitle',r.title||'Your personalized preparation dashboard');
  v39SetText('v41WelcomeSubtitle',r.subtitle||'');
  const stats=document.getElementById('v41SmartStats');
  if(stats)stats.innerHTML=`
    <article><span>📚</span><b>${r.articlesRead||0}</b><small>ARTICLES READ</small></article>
    <article><span>📝</span><b>${r.mockTests||0}</b><small>MOCK TESTS</small></article>
    <article><span>🎯</span><b>${r.accuracy||0}%</b><small>ACCURACY</small></article>
    <article><span>⏱</span><b>${r.studyMinutes||0}</b><small>STUDY MINUTES</small></article>`;
  const plan=document.getElementById('v41TodayPlan');
  if(plan)plan.innerHTML=(r.todayPlan||[]).map(x=>`<article class="v41-plan-item"><span>${x.icon}</span><div><h4>${escapeHtml(x.title)}</h4><p>${escapeHtml(x.description)}</p></div></article>`).join('');
  const weak=document.getElementById('v41WeakTopics');
  if(weak)weak.innerHTML=(r.weakTopics||[]).map(x=>`<article class="v41-weak-item"><b>${escapeHtml(x.topic)}</b><p class="muted">${escapeHtml(x.recommendation)}</p></article>`).join('')||'<p class="muted">No weak topic identified yet.</p>';
  const achievements=document.getElementById('v41Achievements');
  if(achievements)achievements.innerHTML=(r.achievements||[]).map(x=>`<article class="v41-achievement-card ${x.unlocked?'':'locked'}"><span>${x.icon}</span><h4>${escapeHtml(x.title)}</h4><p>${escapeHtml(x.description)}</p></article>`).join('');
};
window.loadV41RevisionPlan=async function(){
  const r=await api('getSmartRevisionPlan',{token:token()});
  const box=document.getElementById('v41RevisionPlan');if(!box)return;
  box.innerHTML=r.success?(r.rows||[]).map(x=>`<article class="v41-revision-item"><b>${escapeHtml(x.window)}</b><p class="muted">${escapeHtml(x.topic)} — ${escapeHtml(x.action)}</p></article>`).join(''):`<p class="muted">${escapeHtml(r.message)}</p>`;
};
window.loadV41PerformanceReport=async function(){
  const r=await api('getStudentPerformanceReport',{token:token()});if(!r.success)return;
  const cards=document.getElementById('v41PerformanceCards');
  if(cards)cards.innerHTML=`
    <article><span>📖</span><b>${r.totalLearningActions||0}</b><small>LEARNING ACTIONS</small></article>
    <article><span>📈</span><b>${r.weeklyGrowth||0}%</b><small>WEEKLY GROWTH</small></article>
    <article><span>✅</span><b>${r.completedTasks||0}</b><small>TASKS COMPLETED</small></article>
    <article><span>🏆</span><b>${r.badgesEarned||0}</b><small>BADGES EARNED</small></article>`;
  const chart=document.getElementById('v41PerformanceChart');
  if(chart)chart.innerHTML=(r.weekly||[]).map(d=>`<div class="v41-report-day"><small>${d.value}</small><div class="v41-report-bar" style="height:${Math.max(4,Math.min(170,d.value*3))}px"></div><b>${escapeHtml(d.label)}</b></div>`).join('');
};
window.loadV41Notifications=async function(){
  const r=await api('listUserNotifications',{token:token()});
  const box=document.getElementById('v41NotificationList');if(!box)return;
  if(!r.success){box.innerHTML=`<p class="muted">${escapeHtml(r.message)}</p>`;return}
  v39SetText('v41UnreadBadge',r.unread||0);
  box.innerHTML=(r.rows||[]).length?(r.rows||[]).map(n=>`<article class="v41-notification-card ${n.read?'':'unread'}" onclick="readV41Notification('${escapeAttr(n.id)}')"><div class="v41-notification-head"><h4>${escapeHtml(n.title)}</h4><small>${escapeHtml(n.createdAt||'')}</small></div><p>${escapeHtml(n.message)}</p></article>`).join(''):'<p class="muted">No notifications yet.</p>';
};
window.readV41Notification=async function(id){await api('markNotificationRead',{token:token(),id});loadV41Notifications()};
window.markAllV41NotificationsRead=async function(){await api('markAllNotificationsRead',{token:token()});loadV41Notifications()};
window.loadV41Certificates=async function(){
  const r=await api('listUserCertificates',{token:token()});const box=document.getElementById('v41CertificateList');if(!box)return;
  box.innerHTML=r.success?(r.rows||[]).map(c=>`<article class="v41-certificate-card"><span>${c.icon}</span><h4>${escapeHtml(c.title)}</h4><p>${escapeHtml(c.description)}</p><button class="mini-btn" ${c.unlocked?'':'disabled'}>${c.unlocked?'Available':'Locked'}</button></article>`).join(''):`<p class="muted">${escapeHtml(r.message)}</p>`;
};
window.loadV41EmailDashboard=async function(){
  const r=await api('getCommunicationDashboard',{token:token()});if(!r.success)return;
  const stats=document.getElementById('v41EmailStats');
  if(stats)stats.innerHTML=`<article><b>${r.total||0}</b><small>TOTAL EMAILS</small></article><article><b>${r.sent||0}</b><small>SENT</small></article><article><b>${r.failed||0}</b><small>FAILED</small></article><article><b>${r.today||0}</b><small>TODAY</small></article>`;
  const log=document.getElementById('v41EmailLog');
  if(log)log.innerHTML=(r.logs||[]).map(x=>`<div class="v41-email-row ${String(x.status).toLowerCase()}"><span>${escapeHtml(x.email)}</span><span>${escapeHtml(x.type)}</span><span>${escapeHtml(x.status)}</span><span>${escapeHtml(x.sentAt||'')}</span></div>`).join('');
};
window.sendV41Announcement=async function(){
  const msg=document.getElementById('v41AnnouncementMsg');
  const r=await api('sendCommunicationAnnouncement',{token:token(),title:document.getElementById('v41AnnouncementTitle')?.value||'',message:document.getElementById('v41AnnouncementBody')?.value||'',sendEmail:Boolean(document.getElementById('v41AnnouncementEmail')?.checked)});
  if(msg)msg.textContent=r.message||'';if(r.success)loadV41EmailDashboard();
};
window.previewV41EmailTemplate=async function(){
  const r=await api('previewCommunicationTemplate',{token:token(),type:document.getElementById('v41TemplateType')?.value||'welcome'});
  const box=document.getElementById('v41TemplatePreview');if(box)box.innerHTML=r.success?r.html:`<p>${escapeHtml(r.message)}</p>`;
};
if(typeof openDashSection==='function'){const OLD_OPEN_DASH_V41=openDashSection;openDashSection=function(id,btn){OLD_OPEN_DASH_V41(id,btn);if(id==='v41SmartLearningModule')setTimeout(()=>{loadV41SmartDashboard();loadV41RevisionPlan();loadV41PerformanceReport()},50);if(id==='v41NotificationsModule')setTimeout(loadV41Notifications,50);if(id==='v41CertificatesModule')setTimeout(loadV41Certificates,50)}}
if(typeof openAdminSection==='function'){const OLD_OPEN_ADMIN_V41=openAdminSection;openAdminSection=function(id,btn){OLD_OPEN_ADMIN_V41(id,btn);if(id==='v41CommunicationModule')setTimeout(loadV41EmailDashboard,50)}}
document.addEventListener('DOMContentLoaded',()=>{setTimeout(()=>{loadV41SmartDashboard();loadV41Notifications()},1400)});


/* ======================================================
   v41.1 STABILITY, EMAIL & QUALITY UPDATE
   ====================================================== */
window.sendV411TestEmail = async function() {
  const input = document.getElementById('v411TestEmail');
  const msg = document.getElementById('v411TestEmailMsg');
  const email = (input?.value || '').trim();

  if (!email) {
    if (msg) msg.textContent = 'Please enter the recipient email.';
    return;
  }

  if (msg) msg.textContent = 'Sending test email...';

  try {
    const response = await api('sendV411TestEmail', {
      token: token(),
      email: email
    });

    if (msg) msg.textContent = response.message || '';
    if (response.success) {
      toast('Test email sent successfully');
      if (typeof loadV41EmailDashboard === 'function') {
        loadV41EmailDashboard();
      }
    }
  } catch (error) {
    if (msg) msg.textContent = error.message || 'Unable to send test email.';
  }
};

/* Avoid duplicate v41 dashboard API calls during quick navigation. */
const V411_LOAD_LOCKS = {};

function v411RunOnce(key, delay, callback) {
  const now = Date.now();
  if (V411_LOAD_LOCKS[key] && now - V411_LOAD_LOCKS[key] < delay) return;
  V411_LOAD_LOCKS[key] = now;
  callback();
}

if (typeof loadV41SmartDashboard === 'function') {
  const V411_OLD_SMART = loadV41SmartDashboard;
  loadV41SmartDashboard = function() {
    v411RunOnce('smart-dashboard', 1500, V411_OLD_SMART);
  };
}

if (typeof loadV41Notifications === 'function') {
  const V411_OLD_NOTIFICATIONS = loadV41Notifications;
  loadV41Notifications = function() {
    v411RunOnce('notifications', 1200, V411_OLD_NOTIFICATIONS);
  };
}

window.addEventListener('error', function(event) {
  const target = event.target;
  if (target && target.tagName === 'IMG') {
    target.onerror = null;
    target.src = 'logo.jpg';
  }
}, true);


/* ======================================================
   v43.0.0 SMART LEARNING BUILD
   ====================================================== */
(function() {
  const BUILD_ID = '20260717-4300';
  const VERSION = 'v43.0.0';
  const STORAGE_KEY = 'ias_selection_point_build_id';

  async function clearOldInstallCache() {
    const previousBuild = localStorage.getItem(STORAGE_KEY);
    if (previousBuild === BUILD_ID) return;

    try {
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const registration of registrations) {
          await registration.unregister();
        }
      }

      if ('caches' in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map(key => caches.delete(key)));
      }
    } catch (error) {
      console.warn('Cache cleanup warning:', error);
    }

    localStorage.setItem(STORAGE_KEY, BUILD_ID);
    sessionStorage.setItem('ias_build_refresh_pending', '1');

    const url = new URL(window.location.href);
    url.searchParams.set('v', BUILD_ID);
    window.location.replace(url.toString());
  }

  document.addEventListener('DOMContentLoaded', function() {
    const badge = document.querySelector('.version-badge');
    if (badge) badge.textContent = 'v43 Smart Learning & Revision';

    const refreshPending = sessionStorage.getItem('ias_build_refresh_pending');
    if (refreshPending === '1') {
      sessionStorage.removeItem('ias_build_refresh_pending');
    }

    clearOldInstallCache();
  });
})();


/* ======================================================
   v42 EXAM HUB & SMART PREPARATION
   ====================================================== */
const V42_EXAMS = [
  {id:'hssc',icon:'🏛️',name:'HSSC',desc:'Haryana Staff Selection Commission',labels:['HSSC','Haryana Jobs']},
  {id:'cet-c',icon:'📘',name:'CET Group C',desc:'Group C common eligibility preparation',labels:['CET Group C','Haryana CET']},
  {id:'cet-d',icon:'📗',name:'CET Group D',desc:'Group D syllabus, practice and updates',labels:['CET Group D','Haryana CET']},
  {id:'police',icon:'👮',name:'Haryana Police',desc:'Constable and Sub-Inspector preparation',labels:['Haryana Police']},
  {id:'hpsc',icon:'⚖️',name:'HPSC',desc:'HCS and Haryana civil services',labels:['HPSC','HCS']},
  {id:'htet',icon:'🎓',name:'HTET',desc:'PRT, TGT and PGT teaching eligibility',labels:['HTET']},
  {id:'patwari',icon:'🌾',name:'Patwari',desc:'Revenue and land records examination',labels:['Patwari']},
  {id:'clerk',icon:'📝',name:'Clerk',desc:'Clerical and office recruitment exams',labels:['Clerk']}
];

const V42_RESOURCES = [
  ['hssc','Syllabus','HSSC General Syllabus','Complete subject structure and preparation priorities.','HSSC'],
  ['hssc','Current Affairs','Haryana Current Affairs','Important Haryana events, schemes and appointments.','Haryana Current Affairs'],
  ['cet-c','Syllabus','CET Group C Syllabus','Subject-wise syllabus and exam pattern.','CET Group C'],
  ['cet-c','PYQ','CET Group C Previous Papers','Practice questions from earlier recruitment cycles.','CET Group C'],
  ['cet-c','Mock Test','CET Group C Mock Tests','Timed CBT practice with result analytics.','Mock Tests'],
  ['cet-d','Syllabus','CET Group D Syllabus','Updated topic list and marks distribution.','CET Group D'],
  ['cet-d','PYQ','CET Group D Previous Papers','Year-wise papers and answer keys.','CET Group D'],
  ['police','Notes','Haryana Police Notes','Law, reasoning, Haryana GK and general studies.','Haryana Police'],
  ['police','Mock Test','Police Practice Test','Constable-oriented timed test series.','Mock Tests'],
  ['hpsc','Syllabus','HPSC / HCS Syllabus','Prelims and mains preparation structure.','HPSC'],
  ['hpsc','PYQ','HCS Previous Papers','Previous papers for trend analysis.','HPSC'],
  ['htet','Notes','HTET Pedagogy Notes','Child development and teaching methodology.','HTET'],
  ['htet','PYQ','HTET Previous Papers','Level 1, 2 and 3 practice papers.','HTET'],
  ['patwari','Notes','Patwari Subject Notes','Maths, reasoning, computer and Haryana GK.','Patwari'],
  ['clerk','Mock Test','Clerk Speed Practice','Accuracy and time-management test set.','Mock Tests']
].map((r,i)=>({id:'R'+(i+1),examId:r[0],type:r[1],title:r[2],description:r[3],label:r[4]}));

const V42_CALENDAR = [
  {day:'01',month:'AUG',title:'Monthly Current Affairs Revision',detail:'Revise Haryana and national current affairs.'},
  {day:'05',month:'AUG',title:'CET Practice Test',detail:'Full-length timed practice milestone.'},
  {day:'10',month:'AUG',title:'PYQ Revision Day',detail:'Solve one previous paper from your target exam.'},
  {day:'15',month:'AUG',title:'Performance Review',detail:'Check weak topics and update your study plan.'}
];

let V42_SELECTED_EXAM = 'hssc';

function getV42TargetExam(){
  let target = '';
  try{
    const u = JSON.parse(localStorage.getItem('isp_user') || '{}');
    target = u.targetExam || u.exam || u.TargetExam || '';
  }catch(e){}
  const profileExam = document.getElementById('profileExam');
  if(!target && profileExam) target = profileExam.value || '';
  return target || 'General Haryana Exams';
}

function matchV42Target(target){
  const t=(target||'').toLowerCase();
  const hit=V42_EXAMS.find(e=>t.includes(e.name.toLowerCase()) || e.labels.some(x=>t.includes(x.toLowerCase())));
  return hit ? hit.id : 'hssc';
}

function initV42ExamHub(){
  const target=getV42TargetExam();
  V42_SELECTED_EXAM=matchV42Target(target);
  const el=document.getElementById('v42TargetExam');
  if(el) el.textContent=target;
  renderV42ExamHub();
  renderV42Calendar();
  buildV42StudyPlan();
}

function renderV42ExamHub(){
  const grid=document.getElementById('v42ExamGrid');
  const list=document.getElementById('v42ResourceList');
  if(!grid || !list) return;
  const q=(document.getElementById('v42ExamSearch')?.value||'').trim().toLowerCase();
  const type=document.getElementById('v42ResourceType')?.value||'all';

  grid.innerHTML=V42_EXAMS.map(ex=>`
    <article class="v42-exam-card ${ex.id===V42_SELECTED_EXAM?'active':''}" onclick="selectV42Exam('${ex.id}')">
      <div class="v42-exam-icon">${ex.icon}</div>
      <h4>${ex.name}</h4><p>${ex.desc}</p>
      <small>${V42_RESOURCES.filter(r=>r.examId===ex.id).length} resources →</small>
    </article>`).join('');

  const items=V42_RESOURCES.filter(r=>{
    const examMatch = r.examId===V42_SELECTED_EXAM;
    const typeMatch = type==='all' || r.type===type;
    const searchMatch = !q || [r.title,r.description,r.type,r.label].join(' ').toLowerCase().includes(q);
    return examMatch && typeMatch && searchMatch;
  });

  document.getElementById('v42ResourceCount').textContent=V42_RESOURCES.length;
  const ex=V42_EXAMS.find(x=>x.id===V42_SELECTED_EXAM);
  document.getElementById('v42ResourceSubtitle').textContent=(ex?ex.name:'Selected exam')+' preparation resources';

  list.innerHTML=items.length?items.map(r=>`
    <div class="v42-resource-item">
      <div class="meta"><span class="v42-type">${r.type}</span><div><h4>${r.title}</h4><p>${r.description}</p></div></div>
      <button class="v42-open-btn" onclick="openV42Resource('${r.label}','${r.type}')">Open</button>
    </div>`).join(''):'<div class="v42-empty">No matching resource found. Try another filter.</div>';
}

function selectV42Exam(id){
  V42_SELECTED_EXAM=id;
  renderV42ExamHub();
  buildV42StudyPlan();
}

function resetV42ExamFilters(){
  const q=document.getElementById('v42ExamSearch'); if(q) q.value='';
  const t=document.getElementById('v42ResourceType'); if(t) t.value='all';
  renderV42ExamHub();
}

function openV42Resource(label,type){
  if(type==='Mock Test'){
    openDashSection('mockTestsModule',document.querySelector('[onclick*="mockTestsModule"]'));
    return;
  }
  if(typeof loadModuleCategory==='function'){
    openDashSection('hsscModule',document.querySelector('[onclick*="hsscModule"]'));
    setTimeout(()=>loadModuleCategory(label,'hssc'),120);
    return;
  }
  const url='https://iasselectionpoint.blogspot.com/search/label/'+encodeURIComponent(label);
  window.open(url,'_blank','noopener');
}

function renderV42Calendar(){
  const el=document.getElementById('v42CalendarList'); if(!el) return;
  el.innerHTML=V42_CALENDAR.map(x=>`
    <div class="v42-calendar-item">
      <div class="v42-date-box"><b>${x.day}</b><span>${x.month}</span></div>
      <div><h4>${x.title}</h4><p>${x.detail}</p></div>
    </div>`).join('');
}

function buildV42StudyPlan(){
  const el=document.getElementById('v42StudyPlan'); if(!el) return;
  const ex=V42_EXAMS.find(x=>x.id===V42_SELECTED_EXAM)||V42_EXAMS[0];
  const plans=[
    ['📖','Read Core Notes',`Study one focused ${ex.name} topic for 30 minutes.`],
    ['🧠','Practice Questions',`Solve at least 25 ${ex.name} questions today.`],
    ['📄','Previous Paper',`Review one PYQ section and note repeated topics.`],
    ['📊','Check Performance','Open My Results and revise your weakest subject.']
  ];
  el.innerHTML=plans.map(p=>`<article class="v42-plan-card"><span>${p[0]}</span><h4>${p[1]}</h4><p>${p[2]}</p></article>`).join('');
}

document.addEventListener('DOMContentLoaded',()=>{
  if(document.getElementById('v42ExamHubModule')){
    const count=document.getElementById('v42ResourceCount');
    if(count) count.textContent=V42_RESOURCES.length;
  }
});


/* ======================================================
   v43 SMART LEARNING & REVISION
   ====================================================== */
const V43_KEY='isp_v43_learning';
const V43_DEFAULT_TASKS=[
  {id:'t1',title:'Read one core topic',minutes:30,done:false},
  {id:'t2',title:'Solve 25 practice questions',minutes:35,done:false},
  {id:'t3',title:'Revise current affairs',minutes:20,done:false},
  {id:'t4',title:'Review one weak topic',minutes:25,done:false}
];

function getV43Data(){
  try{
    const saved=JSON.parse(localStorage.getItem(V43_KEY)||'null');
    if(saved) return saved;
  }catch(e){}
  return {tasks:V43_DEFAULT_TASKS.map(x=>({...x})),weakTopics:[],sessions:{},xp:0,lastActive:'',streak:1};
}
function saveV43Data(d){localStorage.setItem(V43_KEY,JSON.stringify(d));}
function todayV43(){return new Date().toISOString().slice(0,10);}

function initV43SmartLearning(){
  const d=getV43Data();
  const today=todayV43();
  if(d.lastActive!==today){
    const yesterday=new Date(Date.now()-86400000).toISOString().slice(0,10);
    d.streak=d.lastActive===yesterday?(d.streak||1)+1:1;
    d.lastActive=today;
    saveV43Data(d);
  }
  renderV43All();
}
function renderV43All(){
  renderV43Tasks(); renderV43WeakTopics(); renderV43Progress(); updateV43Stats();
}
function renderV43Tasks(){
  const el=document.getElementById('v43TaskList'); if(!el)return;
  const d=getV43Data();
  el.innerHTML=d.tasks.length?d.tasks.map(t=>`
    <div class="v43-task ${t.done?'done':''}">
      <input type="checkbox" ${t.done?'checked':''} onchange="toggleV43Task('${t.id}')">
      <div class="v43-task-main"><div class="v43-task-title">${escapeV43(t.title)}</div><small>${t.minutes||20} minute focus task</small></div>
      <button title="Delete" onclick="deleteV43Task('${t.id}')">🗑️</button>
    </div>`).join(''):'<div class="v42-empty">No tasks. Add your first revision task.</div>';
}
function addV43Task(){
  const input=document.getElementById('v43NewTask'); const title=(input?.value||'').trim();
  if(!title)return;
  const d=getV43Data(); d.tasks.push({id:'t'+Date.now(),title,minutes:25,done:false}); saveV43Data(d);
  input.value=''; renderV43All();
}
function toggleV43Task(id){
  const d=getV43Data(); const t=d.tasks.find(x=>x.id===id); if(!t)return;
  t.done=!t.done; d.xp=Math.max(0,(d.xp||0)+(t.done?20:-20)); saveV43Data(d); renderV43All();
}
function deleteV43Task(id){const d=getV43Data(); d.tasks=d.tasks.filter(x=>x.id!==id); saveV43Data(d); renderV43All();}
function resetV43Day(){const d=getV43Data(); d.tasks=V43_DEFAULT_TASKS.map(x=>({...x})); saveV43Data(d); renderV43All();}

function addV43WeakTopic(){
  const input=document.getElementById('v43WeakTopicInput'); const topic=(input?.value||'').trim();
  const priority=document.getElementById('v43WeakPriority')?.value||'Medium'; if(!topic)return;
  const d=getV43Data(); d.weakTopics.push({id:'w'+Date.now(),topic,priority}); saveV43Data(d); input.value=''; renderV43All();
}
function renderV43WeakTopics(){
  const el=document.getElementById('v43WeakTopicList'); if(!el)return;
  const d=getV43Data();
  el.innerHTML=d.weakTopics.length?d.weakTopics.map(x=>`
    <div class="v43-topic"><div><b>${escapeV43(x.topic)}</b><span class="v43-priority">${x.priority}</span></div><button onclick="removeV43WeakTopic('${x.id}')">✕</button></div>`).join(''):'<div class="v42-empty">No weak topic added yet.</div>';
}
function removeV43WeakTopic(id){const d=getV43Data(); d.weakTopics=d.weakTopics.filter(x=>x.id!==id); saveV43Data(d); renderV43All();}

function logV43StudySession(){
  const min=Math.max(5,Number(document.getElementById('v43SessionMinutes')?.value||30));
  const d=getV43Data(); const day=todayV43(); d.sessions[day]=(d.sessions[day]||0)+min; d.xp=(d.xp||0)+Math.round(min/5); saveV43Data(d); renderV43All();
}
function renderV43Progress(){
  const el=document.getElementById('v43ProgressBars'); if(!el)return;
  const d=getV43Data(); const days=['Sun','Mon','Tue','Wed','Thu','Fri','Sat']; let rows=[];
  for(let i=6;i>=0;i--){const dt=new Date(Date.now()-i*86400000);const key=dt.toISOString().slice(0,10);const mins=d.sessions[key]||0;rows.push({day:days[dt.getDay()],mins});}
  const max=Math.max(60,...rows.map(x=>x.mins));
  el.innerHTML=rows.map(x=>`<div class="v43-progress-row"><b>${x.day}</b><div class="v43-progress-track"><div class="v43-progress-fill" style="width:${Math.min(100,Math.round(x.mins/max*100))}%"></div></div><span>${x.mins}m</span></div>`).join('');
}
function updateV43Stats(){
  const d=getV43Data(); const completed=d.tasks.filter(x=>x.done).length; const total=Math.max(1,d.tasks.length);
  const mins=Object.values(d.sessions||{}).reduce((a,b)=>a+Number(b||0),0);
  const readiness=Math.min(100,Math.round((completed/total)*55+Math.min(45,mins/10)));
  const set=(id,val)=>{const e=document.getElementById(id);if(e)e.textContent=val;};
  set('v43CompletedTasks',completed);set('v43StudyMinutes',mins);set('v43WeakCount',d.weakTopics.length);set('v43XP',d.xp||0);set('v43ReadinessScore',readiness+'%');set('v43StreakCount',(d.streak||1)+' day'+((d.streak||1)>1?'s':''));
}
function useV43Prompt(text){const i=document.getElementById('v43AssistantInput');if(i){i.value=text;askV43Assistant();}}
function askV43Assistant(){
  const input=document.getElementById('v43AssistantInput'); const q=(input?.value||'').trim(); if(!q)return;
  const chat=document.getElementById('v43AssistantChat'); chat.insertAdjacentHTML('beforeend',`<div class="v43-message user">${escapeV43(q)}</div>`);
  const a=buildV43Answer(q); setTimeout(()=>{chat.insertAdjacentHTML('beforeend',`<div class="v43-message bot">${escapeV43(a)}</div>`);chat.scrollTop=chat.scrollHeight;},250);
  input.value=''; chat.scrollTop=chat.scrollHeight;
}
function buildV43Answer(q){
  const t=q.toLowerCase(); const target=(document.getElementById('v42TargetExam')?.textContent||'your target exam');
  if(t.includes('2 ghante')||t.includes('2 hour')) return `2-hour plan for ${target}:\n1. 35 min core notes\n2. 35 min practice questions\n3. 10 min break\n4. 25 min weak topic revision\n5. 15 min error review`;
  if(t.includes('haryana gk')) return 'Haryana GK strategy:\n• Districts, history, geography and schemes ko 4 blocks me divide karein.\n• Daily 20 MCQs solve karein.\n• Galat questions ko Weak Topic Tracker me add karein.\n• Sunday ko full revision karein.';
  if(t.includes('math')||t.includes('percentage')) return 'Math improvement plan:\n• Formula sheet banayein.\n• Basic examples se start karein.\n• 15 easy + 10 medium questions daily solve karein.\n• Har galti ka reason note karein: concept, calculation ya speed.';
  if(t.includes('revision')) return 'Revision rule: 1-day, 3-day and 7-day cycle follow karein. Aaj padhe topic ko kal 10 minute, 3 din baad 15 minute aur 7 din baad practice test ke saath revise karein.';
  if(t.includes('mock')||t.includes('test')) return 'Mock test strategy:\n• Exam-like timer use karein.\n• Pehle easy questions complete karein.\n• Test ke baad score se zyada error analysis karein.\n• Weak topics ko tracker me save karein.';
  return `Focused plan for ${target}:\n1. One important topic choose karein.\n2. 30 minutes concept study.\n3. 25 practice questions.\n4. Wrong answers revise karein.\n5. 10-minute summary note banayein.`;
}
function escapeV43(v){return String(v).replace(/[&<>"']/g,s=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[s]));}
document.addEventListener('DOMContentLoaded',()=>{if(document.getElementById('v43SmartLearningModule'))updateV43Stats();});
