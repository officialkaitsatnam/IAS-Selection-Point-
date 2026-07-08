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
