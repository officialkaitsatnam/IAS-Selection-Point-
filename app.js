function qs(id){return document.getElementById(id)}
function currentUser(){return JSON.parse(localStorage.getItem('isp_user')||'{}')}
function token(){return localStorage.getItem('isp_session')||''}

function showLoader(title='Please wait...', text='Processing your request'){
  const overlay=qs('loaderOverlay');
  if(overlay){
    qs('loaderTitle').textContent=title;
    qs('loaderText').textContent=text;
    overlay.classList.add('active');
  }
}
function hideLoader(){const overlay=qs('loaderOverlay'); if(overlay) overlay.classList.remove('active')}
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
  if(qs(map[name]))qs(map[name]).classList.add('active');
  showMsg('');
}
async function api(action,data={}){
  if(!API_URL||API_URL.includes('PASTE_'))return{success:false,message:'API URL config.js me set nahi hai'};
  try{
    const res=await fetch(API_URL,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({action,...data}),redirect:'follow'});
    const text=await res.text();
    try{return JSON.parse(text)}catch(e){return{success:false,message:'Backend JSON response nahi de raha: '+text.substring(0,160)}}
  }catch(err){return{success:false,message:'Network/API error: '+err.message}}
}
async function signupUser(e){
  e.preventDefault();
  const btn=e.submitter;
  setButtonLoading(btn,true,'Creating account');
  showLoader('Creating account...','Please wait while we set up your member account');
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
    qs('loaderTitle').textContent='Login successful';
    qs('loaderText').textContent='Opening dashboard';
    setTimeout(()=>{location.href=r.user.role==='Admin'?'admin.html':'dashboard.html'},700);
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

function openDashSection(id,btn){
  document.querySelectorAll('.dash-section').forEach(s=>s.classList.remove('active'));
  document.querySelectorAll('.dash-btn').forEach(b=>b.classList.remove('active'));
  if(qs(id)) qs(id).classList.add('active');
  if(btn) btn.classList.add('active');
  if(id==='notes') loadNotes();
  if(id==='bookmarks') loadBookmarks();
}

async function loadDashboard(){
  showLoader('Opening dashboard...','Loading member details');
  const u=currentUser();
  if(!u.email){location.href='index.html';return}
  qs('memberName').textContent=u.name||'Member';
  qs('memberEmail').textContent=u.email||'';
  qs('memberStatus').textContent=u.status||'Active';

  const r=await api('getProfile',{token:token()});
  if(r.success){
    qs('profileName').value=r.profile.name||u.name||'';
    qs('profileMobile').value=r.profile.mobile||'';
    qs('profileCity').value=r.profile.city||'';
    qs('profileExam').value=r.profile.exam||'';
  }
  loadBookmarks();
  loadNotes();
  setTimeout(hideLoader,350);
}
async function saveProfile(){
  showLoader('Saving profile...','Please wait');
  const data={
    token:token(),
    name:qs('profileName').value,
    mobile:qs('profileMobile').value,
    city:qs('profileCity').value,
    exam:qs('profileExam').value
  };
  const r=await api('saveProfile',data);
  hideLoader();
  showSmall('profileMsg',r.message,r.success);
  if(r.success){
    const u=currentUser();
    u.name=data.name;
    localStorage.setItem('isp_user',JSON.stringify(u));
    qs('memberName').textContent=data.name;
  }
}
async function changePassword(){
  showLoader('Changing password...','Please wait');
  const r=await api('changePassword',{token:token(),oldPassword:qs('oldPassword').value,newPassword:qs('newPassword').value});
  hideLoader();
  showSmall('securityMsg',r.message,r.success);
  if(r.success){qs('oldPassword').value='';qs('newPassword').value=''}
}
async function addNote(){
  const title=qs('noteTitle').value.trim();
  const body=qs('noteBody').value.trim();
  if(!title || !body){alert('Note title aur body dono likho');return}
  showLoader('Saving note...','Please wait');
  const r=await api('addNote',{token:token(),title,body});
  hideLoader();
  if(r.success){qs('noteTitle').value='';qs('noteBody').value='';loadNotes()} else alert(r.message);
}
async function loadNotes(){
  const box=qs('notesList'); if(!box)return;
  box.innerHTML='<p>Loading notes...</p>';
  const r=await api('listNotes',{token:token()});
  if(!r.success){box.innerHTML='<p>'+r.message+'</p>';return}
  if(!r.notes.length){box.innerHTML='<p>No notes yet.</p>';return}
  box.innerHTML=r.notes.map(n=>`<div class="note-card"><h4>${escapeHtml(n.title)}</h4><p>${escapeHtml(n.body)}</p><button class="mini-btn danger-btn" onclick="deleteNote('${n.id}')">Delete</button></div>`).join('');
}
async function deleteNote(id){
  if(!confirm('Delete this note?'))return;
  showLoader('Deleting note...','Please wait');
  const r=await api('deleteNote',{token:token(),id});
  hideLoader();
  if(r.success)loadNotes(); else alert(r.message);
}
function addBookmark(){
  const title=qs('bookmarkTitle').value.trim();
  const url=qs('bookmarkUrl').value.trim();
  if(!title || !url){alert('Bookmark title aur URL dono likho');return}
  const u=currentUser().email;
  const key='isp_bookmarks_'+u;
  const arr=JSON.parse(localStorage.getItem(key)||'[]');
  arr.unshift({id:Date.now(),title,url});
  localStorage.setItem(key,JSON.stringify(arr));
  qs('bookmarkTitle').value='';qs('bookmarkUrl').value='';
  loadBookmarks();
}
function loadBookmarks(){
  const box=qs('bookmarksList'); if(!box)return;
  const u=currentUser().email;
  const arr=JSON.parse(localStorage.getItem('isp_bookmarks_'+u)||'[]');
  if(!arr.length){box.innerHTML='<p>No bookmarks yet.</p>';return}
  box.innerHTML=arr.map(b=>`<div class="bookmark-card"><h4>${escapeHtml(b.title)}</h4><p>${escapeHtml(b.url)}</p><a class="mini-btn" target="_blank" href="${escapeAttr(b.url)}">Open</a> <button class="mini-btn danger-btn" onclick="deleteBookmark(${b.id})">Delete</button></div>`).join('');
}
function deleteBookmark(id){
  const u=currentUser().email,key='isp_bookmarks_'+u;
  const arr=JSON.parse(localStorage.getItem(key)||'[]').filter(x=>x.id!==id);
  localStorage.setItem(key,JSON.stringify(arr));
  loadBookmarks();
}
async function loadAdmin(){
  showLoader('Opening admin panel...','Loading users and stats');
  const u=currentUser();
  if(!u.email||u.role!=='Admin'){location.href='index.html';return}
  const r=await api('adminStats',{token:token()});
  hideLoader();
  if(r.success){
    qs('totalUsers').textContent=r.totalUsers;qs('activeUsers').textContent=r.activeUsers;
    qs('usersList').innerHTML=r.users.map(x=>`<div class="user-row"><b>${x.name}</b><br>${x.email} · ${x.role} · ${x.status}</div>`).join('');
  }else alert(r.message);
}
function logout(){showLoader('Logging out...','Please wait');localStorage.removeItem('isp_session');localStorage.removeItem('isp_user');setTimeout(()=>location.href='index.html',300)}
function escapeHtml(s){return String(s||'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]))}
function escapeAttr(s){return String(s||'').replace(/"/g,'%22').replace(/javascript:/gi,'')}


/* ===== v7 Pro Admin/Member UI Helpers ===== */
let ISP_ADMIN_USERS = [];

function openAdminSection(id, btn){
  document.querySelectorAll('.admin-section').forEach(s=>s.classList.remove('active'));
  document.querySelectorAll('.side-nav button').forEach(b=>b.classList.remove('active'));
  if(qs(id)) qs(id).classList.add('active');
  if(btn) btn.classList.add('active');
}

async function loadAdmin(){
  showLoader('Opening admin panel...','Loading users and stats');
  const u=currentUser();
  if(!u.email||u.role!=='Admin'){location.href='index.html';return}
  if(qs('adminEmail')) qs('adminEmail').textContent=u.email;

  const r=await api('adminStats',{token:token()});
  hideLoader();
  if(r.success){
    ISP_ADMIN_USERS = r.users || [];
    if(qs('totalUsers')) qs('totalUsers').textContent=r.totalUsers;
    if(qs('activeUsers')) qs('activeUsers').textContent=r.activeUsers;
    if(qs('adminCount')) qs('adminCount').textContent=ISP_ADMIN_USERS.filter(x=>x.role==='Admin').length || 1;
    if(qs('todayLogins')) qs('todayLogins').textContent=r.todayLogins || 0;
    renderUsersTable(ISP_ADMIN_USERS);
    renderRecentUsers(ISP_ADMIN_USERS);
  }else alert(r.message);
}

function renderUsersTable(users){
  const tbody = qs('usersTable');
  if(!tbody) return;
  tbody.innerHTML = users.map(x=>`
    <tr>
      <td><b>${escapeHtml(x.name)}</b></td>
      <td>${escapeHtml(x.email)}</td>
      <td><span class="role-pill">${escapeHtml(x.role)}</span></td>
      <td><span class="status-pill">${escapeHtml(x.status)}</span></td>
    </tr>
  `).join('');
}

function renderRecentUsers(users){
  const box = qs('recentUsers');
  if(!box) return;
  const list = users.slice(-5).reverse();
  box.innerHTML = list.map(x=>`
    <div class="user-row">
      <b>${escapeHtml(x.name)}</b><br>
      ${escapeHtml(x.email)} · ${escapeHtml(x.role)} · ${escapeHtml(x.status)}
    </div>
  `).join('');
}

function filterUsers(){
  const q = (qs('userSearch')?.value || '').toLowerCase();
  const filtered = ISP_ADMIN_USERS.filter(x =>
    String(x.name).toLowerCase().includes(q) || String(x.email).toLowerCase().includes(q)
  );
  renderUsersTable(filtered);
}

function downloadUsersCSV(){
  if(!ISP_ADMIN_USERS.length){alert('No users found');return}
  const rows = [['Name','Email','Role','Status'], ...ISP_ADMIN_USERS.map(u=>[u.name,u.email,u.role,u.status])];
  const csv = rows.map(r=>r.map(v=>`"${String(v||'').replace(/"/g,'""')}"`).join(',')).join('\n');
  const blob = new Blob([csv], {type:'text/csv'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'ias-selection-point-users.csv';
  a.click();
}

function saveLocalNotice(){
  const title = qs('noticeTitle')?.value.trim();
  const body = qs('noticeBody')?.value.trim();
  if(!title || !body){showSmall('noticeMsg','Title aur notice body likho',false);return}
  const notice = {title, body, date:new Date().toLocaleString()};
  localStorage.setItem('isp_latest_notice', JSON.stringify(notice));
  showSmall('noticeMsg','Notice saved successfully',true);
  renderNoticePreview();
}

function renderNoticePreview(){
  const box = qs('noticePreview');
  if(!box) return;
  const n = JSON.parse(localStorage.getItem('isp_latest_notice') || 'null');
  if(!n){box.innerHTML='<p class="muted">No notice saved.</p>';return}
  box.innerHTML = `<h4>${escapeHtml(n.title)}</h4><p>${escapeHtml(n.body)}</p><small>${escapeHtml(n.date)}</small>`;
}

function loadMemberNotice(){
  const box = qs('memberNotice');
  if(!box) return;
  const n = JSON.parse(localStorage.getItem('isp_latest_notice') || 'null');
  if(!n){box.innerHTML='No notice available.';return}
  box.innerHTML = `<b>${escapeHtml(n.title)}</b><p>${escapeHtml(n.body)}</p><small>${escapeHtml(n.date)}</small>`;
}

/* enhance existing dashboard loaders */
const ISP_OLD_LOAD_DASHBOARD = typeof loadDashboard === 'function' ? loadDashboard : null;
loadDashboard = async function(){
  showLoader('Opening dashboard...','Loading member details');
  const u=currentUser();
  if(!u.email){location.href='index.html';return}
  if(qs('memberName')) qs('memberName').textContent=u.name||'Member';
  if(qs('memberEmail')) qs('memberEmail').textContent=u.email||'';
  if(qs('memberStatus')) qs('memberStatus').textContent=u.status||'Active';

  const r=await api('getProfile',{token:token()});
  if(r.success){
    if(qs('profileName')) qs('profileName').value=r.profile.name||u.name||'';
    if(qs('profileMobile')) qs('profileMobile').value=r.profile.mobile||'';
    if(qs('profileCity')) qs('profileCity').value=r.profile.city||'';
    if(qs('profileExam')) qs('profileExam').value=r.profile.exam||'';
  }
  await loadNotes();
  loadBookmarks();
  loadMemberNotice();
  const notesBox = qs('notesList');
  if(qs('bookmarkCount')){
    const arr=JSON.parse(localStorage.getItem('isp_bookmarks_'+u.email)||'[]');
    qs('bookmarkCount').textContent=arr.length;
  }
  setTimeout(hideLoader,350);
}

const ISP_OLD_LOAD_BOOKMARKS = typeof loadBookmarks === 'function' ? loadBookmarks : null;
loadBookmarks = function(){
  const box=qs('bookmarksList');
  const u=currentUser().email;
  const arr=JSON.parse(localStorage.getItem('isp_bookmarks_'+u)||'[]');
  if(qs('bookmarkCount')) qs('bookmarkCount').textContent=arr.length;
  if(!box)return;
  if(!arr.length){box.innerHTML='<p>No bookmarks yet.</p>';return}
  box.innerHTML=arr.map(b=>`<div class="bookmark-card"><h4>${escapeHtml(b.title)}</h4><p>${escapeHtml(b.url)}</p><a class="mini-btn" target="_blank" href="${escapeAttr(b.url)}">Open</a> <button class="mini-btn danger-btn" onclick="deleteBookmark(${b.id})">Delete</button></div>`).join('');
}


/* ===== v9 Private Category Reader ===== */
const ISP_BLOG = "https://iasselectionpoint.blogspot.com";
const ISP_CATEGORIES = [
  {title:"Comparative Politics", label:"Comparative politics", icon:"🌍"},
  {title:"Indian Govt & Politics", label:"Indian Govt and Politics", icon:"🏛️"},
  {title:"India's Foreign Policy", label:"India's Foreign Policy", icon:"🇮🇳"},
  {title:"International Relations", label:"International Relations", icon:"🌐"},
  {title:"Indian Political Thought", label:"Indian political thought", icon:"🧠"},
  {title:"International Law", label:"International Law", icon:"⚖️"},
  {title:"International Organisations", label:"International organisations", icon:"🏢"},
  {title:"News Article", label:"news article", icon:"📰"},
  {title:"News Cutting", label:"News cuting", icon:"✂️"},
  {title:"Current Affairs", label:"Current Affairs", icon:"🗞️"},
  {title:"Paper-1", label:"Paper-1", icon:"📘"},
  {title:"Paper-2", label:"Paper-2", icon:"📗"},
  {title:"GS Paper-1,2,3,4", label:"Gs paper-1, 2,3,4", icon:"📚"}
];

let ISP_LOADED_POSTS = [];
let ISP_CURRENT_CATEGORY = "";

function initCategories(){
  const html = ISP_CATEGORIES.map(c => `
    <div class="private-cat-card" onclick="loadCategoryPosts('${escapeAttr(c.label)}','${escapeAttr(c.title)}')">
      <span>${c.icon}</span>
      <b>${escapeHtml(c.title)}</b>
      <small>Dashboard ke andar read karein</small>
    </div>
  `).join('');
  if(qs('categoryGrid')) qs('categoryGrid').innerHTML = html;
  if(qs('categoryGrid2')) qs('categoryGrid2').innerHTML = html;
}

function bloggerFeedJsonp(label, max=25){
  return new Promise((resolve, reject) => {
    const cb = "ispFeed_" + Date.now() + "_" + Math.floor(Math.random()*9999);
    const script = document.createElement("script");
    const cleanLabel = encodeURIComponent(label);
    const timer = setTimeout(() => {
      cleanup();
      reject(new Error("Posts load hone me time lag raha hai. Category label check karo."));
    }, 9000);

    window[cb] = function(data){
      clearTimeout(timer);
      cleanup();
      resolve(data);
    };

    function cleanup(){
      try{ delete window[cb]; }catch(e){ window[cb] = undefined; }
      if(script.parentNode) script.parentNode.removeChild(script);
    }

    script.onerror = function(){
      clearTimeout(timer);
      cleanup();
      reject(new Error("Blogger feed load nahi hua."));
    };

    script.src = `${ISP_BLOG}/feeds/posts/default/-/${cleanLabel}?alt=json-in-script&max-results=${max}&callback=${cb}`;
    document.body.appendChild(script);
  });
}

function entryToPost(entry){
  const title = entry.title?.$t || "Untitled Post";
  const content = entry.content?.$t || entry.summary?.$t || "";
  const published = entry.published?.$t ? new Date(entry.published.$t).toLocaleDateString() : "";
  let link = "";
  if(entry.link){
    const alt = entry.link.find(l => l.rel === "alternate");
    if(alt) link = alt.href;
  }
  const plain = stripHtml(content).slice(0, 180);
  return {title, content, published, link, plain};
}

async function loadCategoryPosts(label, title){
  ISP_CURRENT_CATEGORY = title;
  showLoader("Loading posts...", title);
  if(qs('postListTitle')) qs('postListTitle').textContent = title;
  if(qs('readerPostListTitle')) qs('readerPostListTitle').textContent = title;
  setPostListHtml("<p class='muted'>Posts loading...</p>");

  try{
    const data = await bloggerFeedJsonp(label, 30);
    const entries = data.feed?.entry || [];
    ISP_LOADED_POSTS = entries.map(entryToPost);

    if(!ISP_LOADED_POSTS.length){
      setPostListHtml(`<p class="muted">Is category me abhi post nahi mili. Blogger label spelling check karna: <b>${escapeHtml(label)}</b></p>`);
    }else{
      renderLoadedPosts(ISP_LOADED_POSTS);
    }
  }catch(err){
    setPostListHtml(`<p class="muted">${escapeHtml(err.message)}</p>`);
  }
  hideLoader();
}

function setPostListHtml(html){
  if(qs('postList')) qs('postList').innerHTML = html;
  if(qs('readerPostList')) qs('readerPostList').innerHTML = html;
}

function renderLoadedPosts(posts){
  const html = posts.map((p, i) => `
    <div class="post-item" onclick="openPostReader(${i})">
      <h4>${escapeHtml(p.title)}</h4>
      <p>${escapeHtml(p.plain)}...</p>
      <span class="post-meta">${escapeHtml(p.published)} · Click to read full post</span>
    </div>
  `).join('');
  setPostListHtml(html);
}

function filterLoadedPosts(){
  const q = (qs('postSearch')?.value || '').toLowerCase();
  const filtered = ISP_LOADED_POSTS.filter(p => p.title.toLowerCase().includes(q) || p.plain.toLowerCase().includes(q));
  renderLoadedPosts(filtered);
}

function openPostReader(index){
  const p = ISP_LOADED_POSTS[index];
  if(!p) return;
  qs('readerTitle').textContent = p.title;
  qs('readerBody').innerHTML = `
    <h1>${escapeHtml(p.title)}</h1>
    <p class="muted">${escapeHtml(ISP_CURRENT_CATEGORY)} ${p.published ? " · " + escapeHtml(p.published) : ""}</p>
    <hr>
    ${sanitizePostHtml(p.content)}
  `;
  qs('readerModal').classList.add('active');
}

function closeReader(){
  qs('readerModal').classList.remove('active');
}

function readerFullScreen(){
  const modal = qs('readerModal');
  if(modal.requestFullscreen) modal.requestFullscreen();
}

function stripHtml(html){
  const d = document.createElement('div');
  d.innerHTML = html || "";
  return (d.textContent || d.innerText || "").replace(/\s+/g,' ').trim();
}

function sanitizePostHtml(html){
  const d = document.createElement('div');
  d.innerHTML = html || "";
  d.querySelectorAll('script, iframe, object, embed').forEach(x => x.remove());
  d.querySelectorAll('a').forEach(a => {
    a.setAttribute('target','_blank');
    a.setAttribute('rel','noopener');
  });
  return d.innerHTML;
}

/* v9 fast dashboard loader override */
loadDashboard = async function(){
  showLoader('Opening dashboard...','Fast loading enabled');
  const u=currentUser();
  if(!u.email){location.href='index.html';return}

  if(qs('memberName')) qs('memberName').textContent=u.name||'Member';
  if(qs('memberEmail')) qs('memberEmail').textContent=u.email||'';
  if(qs('memberStatus')) qs('memberStatus').textContent=u.status||'Active';

  initCategories();
  loadBookmarks();
  loadMemberNotice?.();

  // Dashboard ko fast open karne ke liye API data background me load hoga.
  setTimeout(hideLoader, 900);

  Promise.race([
    api('getProfile',{token:token()}),
    new Promise(resolve => setTimeout(() => resolve({success:false, timeout:true}), 3000))
  ]).then(r => {
    if(r && r.success){
      if(qs('profileName')) qs('profileName').value=r.profile.name||u.name||'';
      if(qs('profileMobile')) qs('profileMobile').value=r.profile.mobile||'';
      if(qs('profileCity')) qs('profileCity').value=r.profile.city||'';
      if(qs('profileExam')) qs('profileExam').value=r.profile.exam||'';
    }
  });

  setTimeout(() => { try{ loadNotes(); }catch(e){} }, 300);
}


/* ===== v10 Professional Learning Portal Logic ===== */
const ISP_UPSC_CATEGORIES = [
  {title:"Current Affairs", label:"CURRENT AFFAIRS", icon:"🗞️", module:"UPSC General Studies"},
  {title:"Current Content", label:"CURRENT CONTENT", icon:"⚡", module:"UPSC General Studies"},
  {title:"Essay", label:"ESSAY", icon:"✍️", module:"UPSC General Studies"},
  {title:"General Knowledge", label:"GENERAL KNOWLEDGE", icon:"🧠", module:"UPSC General Studies"},
  {title:"General Knowledge (GK)", label:"GENERAL KNOWLEDGE(GK)", icon:"📚", module:"UPSC General Studies"},
  {title:"GS Paper-I", label:"GS PAPER-I", icon:"📘", module:"UPSC General Studies"},
  {title:"GS Paper-II", label:"GS PAPER-II", icon:"📗", module:"UPSC General Studies"},
  {title:"GS Paper-III", label:"GS PAPER-III", icon:"📙", module:"UPSC General Studies"},
  {title:"GS Paper-IV", label:"GS PAPER-IV", icon:"📕", module:"UPSC General Studies"},
  {title:"News Article", label:"NEWS ARTICLE", icon:"📰", module:"UPSC General Studies"},
  {title:"News Cutting", label:"NEWS CUTTING", icon:"✂️", module:"UPSC General Studies"}
];

const ISP_PSIR_CATEGORIES = [
  {title:"Comparative Politics", label:"COMPARATIVE POLITICS", icon:"🌍", module:"Political Science"},
  {title:"Political Science", label:"POLITICAL SCIENCE", icon:"🏛️", module:"Political Science"},
  {title:"Political Theory", label:"POLITICAL THEORY", icon:"📖", module:"Political Science"},
  {title:"Indian Govt & Politics", label:"INDIAN GOVT & POLITICS", icon:"🇮🇳", module:"Political Science"},
  {title:"Indian Political Thought", label:"INDIAN POLITICAL THOUGHT", icon:"🧠", module:"Political Science"},
  {title:"India's Foreign Policy", label:"INDIA'S FOREIGN POLICY", icon:"🌐", module:"Political Science"},
  {title:"International Relations", label:"INTERNATIONAL RELATIONS", icon:"🤝", module:"Political Science"},
  {title:"International Law", label:"INTERNATIONAL LAW", icon:"⚖️", module:"Political Science"},
  {title:"International Organisations & Global Order", label:"INTERNATIONAL ORGANISATIONS & GLOBAL ORDER", icon:"🏢", module:"Political Science"},
  {title:"Public Administration", label:"PUBLIC ADMINISTRATION", icon:"📋", module:"Political Science"},
  {title:"Research Methodology", label:"RESEARCH METHODOLOGY", icon:"🔬", module:"Political Science"},
  {title:"Paper-I (Optional)", label:"PAPER-I(OPT.)", icon:"📘", module:"Political Science"},
  {title:"Paper-II (Optional)", label:"PAPER-II(OPT.)", icon:"📗", module:"Political Science"}
];

let ISP_ACTIVE_MODULE = "";
let ISP_READER_FONT = 18;

function renderLearningCategories(){
  renderCategoryGrid('upscGrid', ISP_UPSC_CATEGORIES, 'upsc');
  renderCategoryGrid('psirGrid', ISP_PSIR_CATEGORIES, 'psir');
}

function renderCategoryGrid(id, cats, moduleKey){
  const box = qs(id);
  if(!box) return;
  box.innerHTML = cats.map(c => `
    <div class="private-cat-card" onclick="loadLearningCategory('${moduleKey}','${escapeAttr(c.label)}','${escapeAttr(c.title)}','${escapeAttr(c.module)}')">
      <span>${c.icon}</span>
      <b>${escapeHtml(c.title)}</b>
      <small>${escapeHtml(c.module)} · Read inside portal</small>
    </div>
  `).join('');
}

async function loadLearningCategory(moduleKey, label, title, moduleName){
  ISP_CURRENT_CATEGORY = title;
  ISP_ACTIVE_MODULE = moduleKey;
  showLoader("Loading articles...", title);
  const titleId = moduleKey === 'upsc' ? 'upscPostTitle' : 'psirPostTitle';
  if(qs(titleId)) qs(titleId).textContent = title;
  const listId = moduleKey === 'upsc' ? 'upscPostList' : 'psirPostList';
  setLearningListHtml(listId, "<p class='muted'>Articles loading...</p>");

  try{
    const data = await bloggerFeedJsonp(label, 35);
    const entries = data.feed?.entry || [];
    ISP_LOADED_POSTS = entries.map(entryToPost).map(p => ({...p, moduleName, categoryTitle:title}));
    if(!ISP_LOADED_POSTS.length){
      setLearningListHtml(listId, `<p class="muted">No articles found for this exact Blogger label: <b>${escapeHtml(label)}</b></p>`);
    }else{
      renderLearningPosts(ISP_LOADED_POSTS, listId);
    }
  }catch(err){
    setLearningListHtml(listId, `<p class="muted">${escapeHtml(err.message)}</p>`);
  }
  hideLoader();
}

function setLearningListHtml(listId, html){ if(qs(listId)) qs(listId).innerHTML = html; }

function renderLearningPosts(posts, listId){
  const html = posts.map((p, i) => `
    <div class="post-item" onclick="openPostReader(${i})">
      <span class="module-tag">${escapeHtml(p.moduleName || '')}</span>
      <h4>${escapeHtml(p.title)}</h4>
      <p>${escapeHtml(p.plain)}...</p>
      <span class="post-meta">${escapeHtml(p.categoryTitle || ISP_CURRENT_CATEGORY)} ${p.published ? "· " + escapeHtml(p.published) : ""} · Read Article</span>
    </div>
  `).join('');
  setLearningListHtml(listId, html);
}

function filterLoadedPosts(){
  const q1 = qs('upscSearch')?.value || '';
  const q2 = qs('psirSearch')?.value || '';
  const q = (q1 || q2).toLowerCase();
  const filtered = ISP_LOADED_POSTS.filter(p => p.title.toLowerCase().includes(q) || p.plain.toLowerCase().includes(q));
  const listId = ISP_ACTIVE_MODULE === 'psir' ? 'psirPostList' : 'upscPostList';
  renderLearningPosts(filtered, listId);
}

function openPostReader(index){
  const p = ISP_LOADED_POSTS[index];
  if(!p) return;
  qs('readerTitle').textContent = p.title;
  qs('readerBody').style.fontSize = ISP_READER_FONT + "px";
  qs('readerBody').innerHTML = `
    <h1>${escapeHtml(p.title)}</h1>
    <p class="muted">${escapeHtml(p.moduleName || '')} · ${escapeHtml(p.categoryTitle || ISP_CURRENT_CATEGORY)} ${p.published ? " · " + escapeHtml(p.published) : ""}</p>
    <p class="muted">Estimated reading time: ${estimateReadTime(p.content)} min</p>
    <hr>
    ${sanitizePostHtml(p.content)}
  `;
  qs('readerModal').classList.add('active');
  saveReadingHistory(p);
  renderContinueReading();
  setTimeout(updateReadingProgress, 200);
}

function changeReaderFont(delta){
  ISP_READER_FONT = Math.max(14, Math.min(24, ISP_READER_FONT + delta));
  if(qs('readerBody')) qs('readerBody').style.fontSize = ISP_READER_FONT + "px";
}
function toggleReaderDark(){ qs('readerModal').classList.toggle('dark-reader'); }
function estimateReadTime(html){ const words = stripHtml(html).split(/\s+/).filter(Boolean).length; return Math.max(1, Math.ceil(words / 180)); }
function updateReadingProgress(){
  const body = qs('readerBody'), bar = qs('readingProgress');
  if(!body || !bar) return;
  const total = body.scrollHeight - body.clientHeight;
  const pct = total <= 0 ? 100 : Math.min(100, Math.round((body.scrollTop / total) * 100));
  bar.style.width = pct + "%";
}
document.addEventListener('scroll', updateReadingProgress, true);

function saveReadingHistory(post){
  const u = currentUser().email || "guest";
  const key = "isp_reading_history_" + u;
  let arr = JSON.parse(localStorage.getItem(key) || "[]");
  arr = arr.filter(x => x.link !== post.link);
  arr.unshift({title: post.title, categoryTitle: post.categoryTitle || ISP_CURRENT_CATEGORY, moduleName: post.moduleName || '', date: new Date().toLocaleString(), link: post.link, plain: post.plain});
  arr = arr.slice(0, 20);
  localStorage.setItem(key, JSON.stringify(arr));
}

function renderContinueReading(){
  const u = currentUser().email || "guest";
  const arr = JSON.parse(localStorage.getItem("isp_reading_history_" + u) || "[]");
  const box = qs('continueReading');
  if(box){
    if(!arr.length) box.innerHTML = "No article opened yet.";
    else box.innerHTML = `<b>${escapeHtml(arr[0].title)}</b><br><small>${escapeHtml(arr[0].moduleName)} · ${escapeHtml(arr[0].categoryTitle)} · ${escapeHtml(arr[0].date)}</small>`;
  }
  const hist = qs('readingHistory');
  if(hist){
    if(!arr.length) hist.innerHTML = "<p class='muted'>No reading history yet.</p>";
    else hist.innerHTML = arr.map(x => `<div class="post-item"><span class="module-tag">${escapeHtml(x.moduleName)}</span><h4>${escapeHtml(x.title)}</h4><p>${escapeHtml(x.plain || '')}...</p><span class="post-meta">${escapeHtml(x.categoryTitle)} · ${escapeHtml(x.date)}</span></div>`).join('');
  }
}

/* v10 fast dashboard loader */
loadDashboard = async function(){
  showLoader('Opening dashboard...','Fast loading enabled');
  const u=currentUser();
  if(!u.email){location.href='index.html';return}
  if(qs('memberName')) qs('memberName').textContent=u.name||'Member';
  if(qs('memberEmail')) qs('memberEmail').textContent=u.email||'';
  if(qs('memberStatus')) qs('memberStatus').textContent=u.status||'Active';
  renderLearningCategories();
  loadBookmarks();
  renderContinueReading();
  setTimeout(hideLoader, 750);
  Promise.race([api('getProfile',{token:token()}), new Promise(resolve => setTimeout(() => resolve({success:false, timeout:true}), 3000))]).then(r => {
    if(r && r.success){
      if(qs('profileName')) qs('profileName').value=r.profile.name||u.name||'';
      if(qs('profileMobile')) qs('profileMobile').value=r.profile.mobile||'';
      if(qs('profileCity')) qs('profileCity').value=r.profile.city||'';
      if(qs('profileExam')) qs('profileExam').value=r.profile.exam||'';
    }
  });
  setTimeout(() => { try{ loadNotes(); }catch(e){} }, 300);
}

function openDashSection(id,btn){
  document.querySelectorAll('.dash-section').forEach(s=>s.classList.remove('active'));
  document.querySelectorAll('.side-nav button').forEach(b=>b.classList.remove('active'));
  if(qs(id)) qs(id).classList.add('active');
  if(btn) btn.classList.add('active');
  if(id==='library') renderContinueReading();
  if(id==='notes') loadNotes();
  if(id==='bookmarks') loadBookmarks();
}


/* ===== v11 Blogger Feed Fix: exact + fallback + case-insensitive matching ===== */

const ISP_LABEL_ALIASES = {
  "CURRENT AFFAIRS": ["CURRENT AFFAIRS", "Current Affairs", "current affairs"],
  "CURRENT CONTENT": ["CURRENT CONTENT", "Current Content", "current content"],
  "ESSAY": ["ESSAY", "Essay", "essay"],
  "GENERAL KNOWLEDGE": ["GENERAL KNOWLEDGE", "General Knowledge", "general knowledge"],
  "GENERAL KNOWLEDGE(GK)": ["GENERAL KNOWLEDGE(GK)", "GENERAL KNOWLEDGE (GK)", "General Knowledge(GK)", "General Knowledge (GK)", "GK", "G K"],
  "GS PAPER-I": ["GS PAPER-I", "GS PAPER I", "GS PAPER-1", "GS PAPER 1", "Gs Paper-I", "GS Paper-I"],
  "GS PAPER-II": ["GS PAPER-II", "GS PAPER II", "GS PAPER-2", "GS PAPER 2", "Gs Paper-II", "GS Paper-II"],
  "GS PAPER-III": ["GS PAPER-III", "GS PAPER III", "GS PAPER-3", "GS PAPER 3", "Gs Paper-III", "GS Paper-III"],
  "GS PAPER-IV": ["GS PAPER-IV", "GS PAPER IV", "GS PAPER-4", "GS PAPER 4", "Gs Paper-IV", "GS Paper-IV"],
  "NEWS ARTICLE": ["NEWS ARTICLE", "News Article", "news article"],
  "NEWS CUTTING": ["NEWS CUTTING", "NEWS CUTING", "News Cutting", "News cuting", "news cutting", "news cuting"],
  "COMPARATIVE POLITICS": ["COMPARATIVE POLITICS", "Comparative Politics", "Comparative politics"],
  "POLITICAL SCIENCE": ["POLITICAL SCIENCE", "Political Science", "political science"],
  "POLITICAL THEORY": ["POLITICAL THEORY", "Political Theory", "political theory"],
  "INDIAN GOVT & POLITICS": ["INDIAN GOVT & POLITICS", "Indian Govt & Politics", "Indian Govt and Politics", "INDIAN GOVT AND POLITICS", "Indian Government and Politics"],
  "INDIAN POLITICAL THOUGHT": ["INDIAN POLITICAL THOUGHT", "Indian Political Thought", "Indian political thought"],
  "INDIA'S FOREIGN POLICY": ["INDIA'S FOREIGN POLICY", "India's Foreign Policy", "INDIAS FOREIGN POLICY", "Indias Foreign Policy"],
  "INTERNATIONAL RELATIONS": ["INTERNATIONAL RELATIONS", "International Relations", "international relations"],
  "INTERNATIONAL LAW": ["INTERNATIONAL LAW", "International Law", "international law"],
  "INTERNATIONAL ORGANISATIONS & GLOBAL ORDER": ["INTERNATIONAL ORGANISATIONS & GLOBAL ORDER", "International Organisations & Global Order", "International Organizations & Global Order", "INTERNATIONAL ORGANISATIONS AND GLOBAL ORDER", "International Organisations and Global Order"],
  "PUBLIC ADMINISTRATION": ["PUBLIC ADMINISTRATION", "Public Administration", "public administration"],
  "RESEARCH METHODOLOGY": ["RESEARCH METHODOLOGY", "Research Methodology", "research methodology"],
  "PAPER-I(OPT.)": ["PAPER-I(OPT.)", "PAPER-I (OPT.)", "PAPER-I(OPTIONAL)", "Paper-I(Opt.)", "Paper-I (Optional)", "PAPER-I"],
  "PAPER-II(OPT.)": ["PAPER-II(OPT.)", "PAPER-II (OPT.)", "PAPER-II(OPTIONAL)", "Paper-II(Opt.)", "Paper-II (Optional)", "PAPER-II"]
};

function normalizeLabelValue(v){
  return String(v || "")
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/\(opt\.\)/g, "optional")
    .replace(/\(opt\)/g, "optional")
    .replace(/\./g, "")
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function aliasesFor(label){
  const arr = ISP_LABEL_ALIASES[label] || [label];
  return [...new Set([...arr, label])];
}

function entryLabels(entry){
  return (entry.category || []).map(c => c.term || "").filter(Boolean);
}

function entryMatchesLabel(entry, targetLabel){
  const labels = entryLabels(entry);
  const normalizedEntryLabels = labels.map(normalizeLabelValue);
  const aliasList = aliasesFor(targetLabel).map(normalizeLabelValue);

  return aliasList.some(alias => normalizedEntryLabels.includes(alias));
}

function bloggerAllPostsJsonp(max=200){
  return new Promise((resolve, reject) => {
    const cb = "ispAllFeed_" + Date.now() + "_" + Math.floor(Math.random()*9999);
    const script = document.createElement("script");
    const timer = setTimeout(() => {
      cleanup();
      reject(new Error("All posts feed timeout. Try again."));
    }, 12000);

    window[cb] = function(data){
      clearTimeout(timer);
      cleanup();
      resolve(data);
    };

    function cleanup(){
      try{ delete window[cb]; }catch(e){ window[cb] = undefined; }
      if(script.parentNode) script.parentNode.removeChild(script);
    }

    script.onerror = function(){
      clearTimeout(timer);
      cleanup();
      reject(new Error("All posts feed not loaded."));
    };

    script.src = `${ISP_BLOG}/feeds/posts/default?alt=json-in-script&max-results=${max}&callback=${cb}`;
    document.body.appendChild(script);
  });
}

function allFeedLabels(entries){
  const set = new Set();
  entries.forEach(e => entryLabels(e).forEach(l => set.add(l)));
  return Array.from(set).sort();
}

async function fetchPostsForLabel(label, max=35){
  // First try exact label feed, then fallback to all-posts filtering.
  let exactEntries = [];
  try{
    const exact = await bloggerFeedJsonp(label, max);
    exactEntries = exact.feed?.entry || [];
    if(exactEntries.length){
      return {entries: exactEntries, source: "exact", allLabels: []};
    }
  }catch(e){}

  // Try aliases as exact feeds
  for(const alias of aliasesFor(label)){
    if(alias === label) continue;
    try{
      const data = await bloggerFeedJsonp(alias, max);
      const entries = data.feed?.entry || [];
      if(entries.length){
        return {entries, source: "alias: " + alias, allLabels: []};
      }
    }catch(e){}
  }

  // Fallback: load all posts and filter by category labels case-insensitively
  const all = await bloggerAllPostsJsonp(200);
  const allEntries = all.feed?.entry || [];
  const filtered = allEntries.filter(e => entryMatchesLabel(e, label)).slice(0, max);
  return {entries: filtered, source: "all-filter", allLabels: allFeedLabels(allEntries)};
}

/* Override v10 category loader with robust v11 loader */
loadLearningCategory = async function(moduleKey, label, title, moduleName){
  ISP_CURRENT_CATEGORY = title;
  ISP_ACTIVE_MODULE = moduleKey;
  showLoader("Loading articles...", title);

  const titleId = moduleKey === 'upsc' ? 'upscPostTitle' : 'psirPostTitle';
  if(qs(titleId)) qs(titleId).textContent = title;

  const listId = moduleKey === 'upsc' ? 'upscPostList' : 'psirPostList';
  setLearningListHtml(listId, "<p class='muted'>Articles loading...</p>");

  try{
    const result = await fetchPostsForLabel(label, 35);
    ISP_LOADED_POSTS = result.entries.map(entryToPost).map(p => ({...p, moduleName, categoryTitle:title}));

    if(!ISP_LOADED_POSTS.length){
      const labelPreview = result.allLabels && result.allLabels.length
        ? `<div class="feed-debug"><b>No exact posts found.</b><br>Available labels found on website:<br>${result.allLabels.slice(0,60).map(escapeHtml).join(", ")}</div>`
        : "";
      setLearningListHtml(listId, `<p class="muted">No articles found for: <b>${escapeHtml(title)}</b></p>${labelPreview}`);
    }else{
      renderLearningPosts(ISP_LOADED_POSTS, listId);
    }
  }catch(err){
    setLearningListHtml(listId, `<p class="muted">Unable to load articles.</p><div class="feed-debug">${escapeHtml(err.message)}</div>`);
  }

  hideLoader();
};

/* Override v10 post render to show feed source safe */
renderLearningPosts = function(posts, listId){
  const html = posts.map((p, i) => `
    <div class="post-item" onclick="openPostReader(${i})">
      <span class="module-tag">${escapeHtml(p.moduleName || '')}</span>
      <h4>${escapeHtml(p.title)}</h4>
      <p>${escapeHtml(p.plain)}...</p>
      <span class="post-meta">${escapeHtml(p.categoryTitle || ISP_CURRENT_CATEGORY)} ${p.published ? "· " + escapeHtml(p.published) : ""} · Read Article</span>
    </div>
  `).join('');
  setLearningListHtml(listId, html);
};


/* ===== v12 Learning Experience Upgrade ===== */
let ISP_CURRENT_READER_POST = null;
let ISP_LATEST_POSTS = [];

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

function ensureFullBrand(){
  document.querySelectorAll('.side-brand h2').forEach(el => {
    el.textContent = 'IAS Selection Point';
  });
}

async function loadLatestArticles(){
  const box = qs('latestArticles');
  if(!box) return;
  box.innerHTML = "<p class='muted'>Loading latest articles...</p>";
  try{
    const data = await bloggerAllPostsJsonp(20);
    const entries = data.feed?.entry || [];
    ISP_LATEST_POSTS = entries.map(entryToPost).map(p => ({...p, moduleName:'Latest Articles', categoryTitle:'Latest'}));
    if(!ISP_LATEST_POSTS.length){
      box.innerHTML = "<p class='muted'>No latest articles found.</p>";
      return;
    }
    box.innerHTML = ISP_LATEST_POSTS.slice(0,8).map((p,i)=>`
      <div class="post-item" onclick="openLatestReader(${i})">
        <span class="latest-badge">Latest</span>
        <h4>${escapeHtml(p.title)}</h4>
        <p>${escapeHtml(p.plain)}...</p>
        <span class="post-meta">${escapeHtml(p.published || '')} · Read Article</span>
        <div class="article-actions" onclick="event.stopPropagation()">
          <button onclick="quickSavePost('latest', ${i})">🔖 Save</button>
          <button onclick="quickSharePost('latest', ${i})">📤 Share</button>
        </div>
      </div>
    `).join('');
  }catch(err){
    box.innerHTML = `<p class="muted">Latest articles could not be loaded.</p><div class="feed-debug">${escapeHtml(err.message)}</div>`;
  }
}

function openLatestReader(index){
  ISP_LOADED_POSTS = ISP_LATEST_POSTS;
  openPostReader(index);
}

const ISP_ORIGINAL_OPEN_POST_READER_V12 = openPostReader;
openPostReader = function(index){
  const p = ISP_LOADED_POSTS[index];
  ISP_CURRENT_READER_POST = p || null;
  ISP_ORIGINAL_OPEN_POST_READER_V12(index);
}

function saveCurrentArticle(){
  if(!ISP_CURRENT_READER_POST){toast('No article selected');return}
  saveArticleToBookmarks(ISP_CURRENT_READER_POST);
}

function saveArticleToBookmarks(post){
  const u=currentUser().email || 'guest';
  const key='isp_bookmarks_'+u;
  const arr=JSON.parse(localStorage.getItem(key)||'[]');
  const exists = arr.some(x => x.url === post.link || x.title === post.title);
  if(!exists){
    arr.unshift({id:Date.now(), title:post.title, url:post.link || post.title});
    localStorage.setItem(key,JSON.stringify(arr));
  }
  loadBookmarks();
  toast('Saved to bookmarks');
}

function quickSavePost(source, index){
  const post = source === 'latest' ? ISP_LATEST_POSTS[index] : ISP_LOADED_POSTS[index];
  if(post) saveArticleToBookmarks(post);
}

async function shareCurrentArticle(){
  if(!ISP_CURRENT_READER_POST){toast('No article selected');return}
  await sharePost(ISP_CURRENT_READER_POST);
}

async function quickSharePost(source, index){
  const post = source === 'latest' ? ISP_LATEST_POSTS[index] : ISP_LOADED_POSTS[index];
  if(post) await sharePost(post);
}

async function sharePost(post){
  const data = {title:post.title, text:post.plain || post.title, url:post.link || location.href};
  if(navigator.share){
    try{ await navigator.share(data); }catch(e){}
  }else{
    await navigator.clipboard.writeText(`${post.title}\n${post.link || location.href}`);
    toast('Article link copied');
  }
}

async function copyCurrentArticleLink(){
  if(!ISP_CURRENT_READER_POST){toast('No article selected');return}
  await navigator.clipboard.writeText(ISP_CURRENT_READER_POST.link || location.href);
  toast('Article link copied');
}

function runGlobalSearch(){
  const q = (qs('globalSearch')?.value || '').trim().toLowerCase();
  const panel = qs('searchResultsPanel');
  const box = qs('globalSearchResults');
  if(!panel || !box) return;
  if(q.length < 2){
    panel.style.display='none';
    return;
  }
  panel.style.display='block';
  const pool = [...ISP_LATEST_POSTS, ...ISP_LOADED_POSTS];
  const seen = new Set();
  const results = pool.filter(p => {
    const key = p.link || p.title;
    if(seen.has(key)) return false;
    seen.add(key);
    return p.title.toLowerCase().includes(q) || p.plain.toLowerCase().includes(q);
  }).slice(0,12);
  if(!results.length){
    box.innerHTML = "<p class='muted'>No matching article loaded yet. Open a module/category or refresh latest articles.</p>";
    return;
  }
  box.innerHTML = results.map((p,i)=>`
    <div class="post-item" onclick="openSearchReader(${i})">
      <span class="module-tag">${escapeHtml(p.moduleName || 'Article')}</span>
      <h4>${escapeHtml(p.title)}</h4>
      <p>${escapeHtml(p.plain)}...</p>
      <span class="post-meta">${escapeHtml(p.categoryTitle || '')} · Read Article</span>
    </div>
  `).join('');
  window.ISP_SEARCH_RESULTS = results;
}

function openSearchReader(index){
  ISP_LOADED_POSTS = window.ISP_SEARCH_RESULTS || [];
  openPostReader(index);
}

function clearGlobalSearch(){
  if(qs('globalSearch')) qs('globalSearch').value='';
  if(qs('searchResultsPanel')) qs('searchResultsPanel').style.display='none';
}

const ISP_OLD_LOAD_DASHBOARD_V12 = loadDashboard;
loadDashboard = async function(){
  ensureFullBrand();
  await ISP_OLD_LOAD_DASHBOARD_V12();
  setTimeout(()=> {
    ensureFullBrand();
    loadLatestArticles();
    renderContinueReading();
  }, 500);
}


/* ===== v13 Three Module Structure + Faster Article Cache ===== */
const ISP_KNOWLEDGE_CATEGORIES = [
  {title:"Current Affairs", label:"CURRENT AFFAIRS", icon:"🗞️", module:"Knowledge Center"},
  {title:"News Article", label:"NEWS ARTICLE", icon:"📰", module:"Knowledge Center"},
  {title:"Current Content", label:"CURRENT CONTENT", icon:"⚡", module:"Knowledge Center"},
  {title:"News Cutting", label:"NEWS CUTTING", icon:"✂️", module:"Knowledge Center"},
  {title:"General Knowledge (GK)", label:"GENERAL KNOWLEDGE(GK)", icon:"🧠", module:"Knowledge Center"}
];

const ISP_UPSC_GS_CATEGORIES = [
  {title:"GS Paper-I", label:"GS PAPER-I", icon:"📘", module:"UPSC"},
  {title:"GS Paper-II", label:"GS PAPER-II", icon:"📗", module:"UPSC"},
  {title:"GS Paper-III", label:"GS PAPER-III", icon:"📙", module:"UPSC"},
  {title:"GS Paper-IV", label:"GS PAPER-IV", icon:"📕", module:"UPSC"},
  {title:"Essay", label:"ESSAY", icon:"✍️", module:"UPSC"},
  {title:"Interview", label:"INTERVIEW", icon:"🎙️", module:"UPSC"}
];

const ISP_OPTIONAL_CATEGORIES = [
  {title:"Paper-I (Optional)", label:"PAPER-I(OPT.)", icon:"📘", module:"UPSC Optional Subject"},
  {title:"Paper-II (Optional)", label:"PAPER-II(OPT.)", icon:"📗", module:"UPSC Optional Subject"}
];

const ISP_UGC_POLITICAL_SCIENCE = [
  {title:"Indian Political Thought", label:"INDIAN POLITICAL THOUGHT", icon:"🧠", module:"UGC · Political Science"},
  {title:"Western Political Thought", label:"WESTERN POLITICAL THOUGHT", icon:"📖", module:"UGC · Political Science"},
  {title:"Indian Govt & Politics", label:"INDIAN GOVT & POLITICS", icon:"🏛️", module:"UGC · Political Science"},
  {title:"International Relations", label:"INTERNATIONAL RELATIONS", icon:"🤝", module:"UGC · Political Science"},
  {title:"Public Administration", label:"PUBLIC ADMINISTRATION", icon:"📋", module:"UGC · Political Science"},
  {title:"Research Methodology", label:"RESEARCH METHODOLOGY", icon:"🔬", module:"UGC · Political Science"},
  {title:"India's Foreign Policy", label:"INDIA'S FOREIGN POLICY", icon:"🇮🇳", module:"UGC · Political Science"},
  {title:"Political Theory", label:"POLITICAL THEORY", icon:"⚖️", module:"UGC · Political Science"},
  {title:"Comparative Politics", label:"COMPARATIVE POLITICS", icon:"🌍", module:"UGC · Political Science"},
  {title:"International Law", label:"INTERNATIONAL LAW", icon:"🌐", module:"UGC · Political Science"}
];

const ISP_FEED_CACHE = {};
const ISP_FEED_CACHE_TIME = {};
const ISP_CACHE_TTL = 10 * 60 * 1000;

function renderV13Categories(){
  renderCategoryGridV13('knowledgeGrid', ISP_KNOWLEDGE_CATEGORIES, 'knowledge');
  renderCategoryGridV13('upscGrid', ISP_UPSC_GS_CATEGORIES, 'upsc');
  renderCategoryGridV13('optionalGrid', ISP_OPTIONAL_CATEGORIES, 'upsc');
  renderCategoryGridV13('politicalScienceGrid', ISP_UGC_POLITICAL_SCIENCE, 'ugc');
}

function renderCategoryGridV13(id, cats, moduleKey){
  const box = qs(id);
  if(!box) return;
  box.innerHTML = cats.map(c => `
    <div class="private-cat-card" onclick="loadV13Category('${moduleKey}','${escapeAttr(c.label)}','${escapeAttr(c.title)}','${escapeAttr(c.module)}')">
      <span>${c.icon}</span>
      <b>${escapeHtml(c.title)}</b>
      <small>${escapeHtml(c.module)} · Read inside portal</small>
      ${ISP_FEED_CACHE[c.label] ? '<span class="cache-note">Cached</span>' : ''}
    </div>
  `).join('');
}

function listIdForModule(moduleKey){
  if(moduleKey === 'knowledge') return 'knowledgePostList';
  if(moduleKey === 'ugc') return 'ugcPostList';
  return 'upscPostList';
}

function titleIdForModule(moduleKey){
  if(moduleKey === 'knowledge') return 'knowledgePostTitle';
  if(moduleKey === 'ugc') return 'ugcPostTitle';
  return 'upscPostTitle';
}

function showSkeleton(listId){
  const html = '<div class="skeleton-card"></div><div class="skeleton-card"></div><div class="skeleton-card"></div>';
  if(qs(listId)) qs(listId).innerHTML = html;
}

async function getCachedPosts(label, title, moduleName){
  const now = Date.now();
  if(ISP_FEED_CACHE[label] && (now - (ISP_FEED_CACHE_TIME[label] || 0)) < ISP_CACHE_TTL){
    return ISP_FEED_CACHE[label];
  }
  const result = await fetchPostsForLabel(label, 35);
  const posts = result.entries.map(entryToPost).map(p => ({...p, moduleName, categoryTitle:title}));
  ISP_FEED_CACHE[label] = posts;
  ISP_FEED_CACHE_TIME[label] = now;
  return posts;
}

async function loadV13Category(moduleKey, label, title, moduleName){
  ISP_CURRENT_CATEGORY = title;
  ISP_ACTIVE_MODULE = moduleKey;

  const listId = listIdForModule(moduleKey);
  const titleId = titleIdForModule(moduleKey);
  if(qs(titleId)) qs(titleId).textContent = title;

  if(ISP_FEED_CACHE[label]){
    ISP_LOADED_POSTS = ISP_FEED_CACHE[label];
    renderLearningPosts(ISP_LOADED_POSTS, listId);
  }else{
    showSkeleton(listId);
  }

  try{
    const posts = await getCachedPosts(label, title, moduleName);
    ISP_LOADED_POSTS = posts;
    if(!posts.length){
      setLearningListHtml(listId, `<p class="muted">No articles found for: <b>${escapeHtml(title)}</b></p>`);
    }else{
      renderLearningPosts(posts, listId);
    }
    renderV13Categories();
  }catch(err){
    setLearningListHtml(listId, `<p class="muted">Unable to load articles.</p><div class="feed-debug">${escapeHtml(err.message)}</div>`);
  }
}

function preloadImportantFeeds(){
  const firstLoad = [
    ...ISP_KNOWLEDGE_CATEGORIES.slice(0,2),
    ...ISP_UPSC_GS_CATEGORIES.slice(0,2),
    ...ISP_UGC_POLITICAL_SCIENCE.slice(0,2)
  ];
  firstLoad.forEach((c, i) => {
    setTimeout(() => {
      getCachedPosts(c.label, c.title, c.module).catch(()=>{});
    }, 800 + i * 900);
  });
}

/* Override old category grid render */
renderLearningCategories = renderV13Categories;

/* Override dashboard load for v13 speed */
loadDashboard = async function(){
  showLoader('Opening dashboard...','Fast cached portal loading');
  const u=currentUser();
  if(!u.email){location.href='index.html';return}

  if(qs('memberName')) qs('memberName').textContent=u.name||'Member';
  if(qs('memberEmail')) qs('memberEmail').textContent=u.email||'';
  if(qs('memberStatus')) qs('memberStatus').textContent=u.status||'Active';

  renderV13Categories();
  loadBookmarks();
  renderContinueReading?.();

  setTimeout(hideLoader, 650);
  setTimeout(() => { try{ loadLatestArticles(); }catch(e){} }, 500);
  setTimeout(() => { try{ preloadImportantFeeds(); }catch(e){} }, 1200);

  Promise.race([
    api('getProfile',{token:token()}),
    new Promise(resolve => setTimeout(() => resolve({success:false, timeout:true}), 2500))
  ]).then(r => {
    if(r && r.success){
      if(qs('profileName')) qs('profileName').value=r.profile.name||u.name||'';
      if(qs('profileMobile')) qs('profileMobile').value=r.profile.mobile||'';
      if(qs('profileCity')) qs('profileCity').value=r.profile.city||'';
      if(qs('profileExam')) qs('profileExam').value=r.profile.exam||'';
    }
  });

  setTimeout(() => { try{ loadNotes(); }catch(e){} }, 300);
}

function openDashSection(id,btn){
  document.querySelectorAll('.dash-section').forEach(s=>s.classList.remove('active'));
  document.querySelectorAll('.side-nav button').forEach(b=>b.classList.remove('active'));
  if(qs(id)) qs(id).classList.add('active');
  if(btn) btn.classList.add('active');
  if(id==='library') renderContinueReading?.();
  if(id==='notes') loadNotes();
  if(id==='bookmarks') loadBookmarks();
}


/* ===== v14 Admin User Control + Enterprise Features ===== */
let ISP_ADMIN_USERS = [];

async function loadAdmin(){
  showLoader('Opening admin panel...','Loading users and controls');
  const u=currentUser();
  if(!u.email||u.role!=='Admin'){location.href='index.html';return}
  if(qs('adminEmail')) qs('adminEmail').textContent=u.email;

  const r=await api('adminStats',{token:token()});
  hideLoader();

  if(r.success){
    ISP_ADMIN_USERS = r.users || [];
    if(qs('totalUsers')) qs('totalUsers').textContent=r.totalUsers || 0;
    if(qs('activeUsers')) qs('activeUsers').textContent=r.activeUsers || 0;
    if(qs('blockedUsers')) qs('blockedUsers').textContent=ISP_ADMIN_USERS.filter(x => String(x.status).toLowerCase()==='blocked').length;
    if(qs('adminCount')) qs('adminCount').textContent=ISP_ADMIN_USERS.filter(x => x.role==='Admin').length || 1;
    renderUsersTable(ISP_ADMIN_USERS);
    renderRecentUsersV14(ISP_ADMIN_USERS);
    renderAdminLogsLocal();
  }else alert(r.message);
}

function renderUsersTable(users){
  const tbody = qs('usersTable');
  if(!tbody) return;
  tbody.innerHTML = users.map(x=>{
    const isAdmin = String(x.role).toLowerCase() === 'admin';
    const status = String(x.status || 'Active');
    const sc = status.toLowerCase()==='blocked' ? 'blocked' : status.toLowerCase()==='deleted' ? 'deleted' : status.toLowerCase()==='pending' ? 'pending' : '';
    const rc = isAdmin ? 'admin' : 'member';
    return `
      <tr>
        <td><b>${escapeHtml(x.name || '')}</b></td>
        <td>${escapeHtml(x.email || '')}</td>
        <td><span class="role-pill ${rc}">${escapeHtml(x.role || '')}</span></td>
        <td><span class="status-pill ${sc}">${escapeHtml(status)}</span></td>
        <td>${escapeHtml(x.lastLogin || '')}</td>
        <td>
          <div class="action-btns">
            <button class="action-btn activate-btn" onclick="adminUpdateUser('${escapeAttr(x.email)}','Active')" ${isAdmin?'disabled':''}>Activate</button>
            <button class="action-btn block-btn" onclick="adminUpdateUser('${escapeAttr(x.email)}','Blocked')" ${isAdmin?'disabled':''}>Block</button>
            <button class="action-btn delete-btn" onclick="adminDeleteUser('${escapeAttr(x.email)}')" ${isAdmin?'disabled':''}>Delete</button>
          </div>
        </td>
      </tr>`;
  }).join('');
}

function renderRecentUsersV14(users){
  const box=qs('recentUsers'); if(!box)return;
  box.innerHTML = users.slice(-5).reverse().map(x=>`<div class="user-row"><b>${escapeHtml(x.name)}</b><br>${escapeHtml(x.email)} · ${escapeHtml(x.role)} · ${escapeHtml(x.status)}</div>`).join('');
}

function filterUsers(){
  const q=(qs('userSearch')?.value||'').toLowerCase();
  renderUsersTable(ISP_ADMIN_USERS.filter(x =>
    String(x.name||'').toLowerCase().includes(q) ||
    String(x.email||'').toLowerCase().includes(q) ||
    String(x.status||'').toLowerCase().includes(q)
  ));
}

async function adminUpdateUser(email,status){
  if(!confirm(`Set ${email} as ${status}?`)) return;
  showLoader('Updating user...','Please wait');
  const r=await api('adminUpdateUserStatus',{token:token(),email,status});
  hideLoader();
  if(r.success){
    saveAdminLogLocal(`User ${email} set as ${status}`);
    toast ? toast(r.message) : alert(r.message);
    await loadAdmin();
  }else alert(r.message);
}

async function adminDeleteUser(email){
  if(!confirm(`Delete ${email}? This will mark the account as Deleted.`)) return;
  showLoader('Deleting user...','Please wait');
  const r=await api('adminDeleteUser',{token:token(),email});
  hideLoader();
  if(r.success){
    saveAdminLogLocal(`User ${email} deleted`);
    toast ? toast(r.message) : alert(r.message);
    await loadAdmin();
  }else alert(r.message);
}

function saveAdminLogLocal(text){
  const key='isp_admin_logs';
  const arr=JSON.parse(localStorage.getItem(key)||'[]');
  arr.unshift({text,date:new Date().toLocaleString()});
  localStorage.setItem(key,JSON.stringify(arr.slice(0,20)));
}

function renderAdminLogsLocal(){
  const box=qs('adminLogsList'); if(!box)return;
  const arr=JSON.parse(localStorage.getItem('isp_admin_logs')||'[]');
  if(!arr.length){box.innerHTML='<p class="muted">No admin action yet.</p>';return}
  box.innerHTML=arr.map(x=>`<div class="post-item"><h4>${escapeHtml(x.text)}</h4><span class="post-meta">${escapeHtml(x.date)}</span></div>`).join('');
}

function downloadUsersCSV(){
  if(!ISP_ADMIN_USERS.length){alert('No users found');return}
  const rows=[['Name','Email','Role','Status','Last Login'],...ISP_ADMIN_USERS.map(u=>[u.name,u.email,u.role,u.status,u.lastLogin||''])];
  const csv=rows.map(r=>r.map(v=>`"${String(v||'').replace(/"/g,'""')}"`).join(',')).join('\n');
  const blob=new Blob([csv],{type:'text/csv'});
  const a=document.createElement('a');
  a.href=URL.createObjectURL(blob);
  a.download='ias-selection-point-users.csv';
  a.click();
}

function openAdminSection(id,btn){
  document.querySelectorAll('.admin-section').forEach(s=>s.classList.remove('active'));
  document.querySelectorAll('.side-nav button').forEach(b=>b.classList.remove('active'));
  if(qs(id)) qs(id).classList.add('active');
  if(btn) btn.classList.add('active');
  if(id==='adminLogs') renderAdminLogsLocal();
}

function setStudyGoal(){
  const current = localStorage.getItem('isp_study_goal') || 'Read 2 articles today and revise your notes.';
  const goal = prompt('Set your study goal:', current);
  if(goal){
    localStorage.setItem('isp_study_goal', goal);
    if(qs('studyGoalBox')) qs('studyGoalBox').textContent = goal;
    toast ? toast('Study goal saved') : alert('Study goal saved');
  }
}

const ISP_V14_OLD_LOAD_DASHBOARD = typeof loadDashboard === 'function' ? loadDashboard : null;
if(ISP_V14_OLD_LOAD_DASHBOARD){
  loadDashboard = async function(){
    await ISP_V14_OLD_LOAD_DASHBOARD();
    if(qs('studyGoalBox')) qs('studyGoalBox').textContent = localStorage.getItem('isp_study_goal') || 'Read 2 articles today and revise your notes.';
  }
}
