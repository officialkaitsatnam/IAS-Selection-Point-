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

async function api(action,data={}){
  if(!API_URL||API_URL.includes('PASTE_'))return{success:false,message:'API URL config.js is not set'};
  try{
    const res=await fetch(API_URL,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({action,...data}),redirect:'follow'});
    const text=await res.text();
    try{return JSON.parse(text)}catch(e){return{success:false,message:'Backend JSON response error: '+text.substring(0,160)}}
  }catch(err){return{success:false,message:'Network/API error: '+err.message}}
}

/* Auth */
async function signupUser(e){
  e.preventDefault();
  const btn=e.submitter;
  setButtonLoading(btn,true,'Creating account');
  showLoader('Creating account...','Please wait');
  const r=await api('signup',{name:qs('signupName').value,email:qs('signupEmail').value,mobile:qs('signupMobile').value,password:qs('signupPassword').value});
  hideLoader();setButtonLoading(btn,false);showMsg(r.message,r.success);
  if(r.success)showForm('login');
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
  return{title,content,published,link,plain};
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
