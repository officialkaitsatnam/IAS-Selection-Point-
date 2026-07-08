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
