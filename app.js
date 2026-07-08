function qs(id){return document.getElementById(id)}
function showMsg(t, ok=true){const m=qs('msg'); if(m){m.textContent=t; m.style.color=ok?'#137333':'#b00020'}}
function showForm(name){
  document.querySelectorAll('.form').forEach(f=>f.classList.remove('active'));
  document.querySelectorAll('.tab').forEach(t=>t.classList.remove('active'));
  const map={login:'loginForm',signup:'signupForm',forgot:'forgotForm',reset:'resetForm'};
  qs(map[name]).classList.add('active');
}
async function api(action,data={}){
  const res=await fetch(API_URL,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({action,...data})});
  return await res.json();
}
async function signupUser(e){
  e.preventDefault();
  const r=await api('signup',{name:qs('signupName').value,email:qs('signupEmail').value,mobile:qs('signupMobile').value,password:qs('signupPassword').value});
  showMsg(r.message,r.success);
  if(r.success) showForm('login');
}
async function loginUser(e){
  e.preventDefault();
  const r=await api('login',{email:qs('loginEmail').value,password:qs('loginPassword').value});
  showMsg(r.message,r.success);
  if(r.success){localStorage.setItem('isp_session',r.token);localStorage.setItem('isp_user',JSON.stringify(r.user));location.href=r.user.role==='Admin'?'admin.html':'dashboard.html'}
}
async function sendResetOtp(e){
  e.preventDefault();
  const email=qs('forgotEmail').value;
  const r=await api('sendResetOtp',{email});
  showMsg(r.message,r.success);
  if(r.success){qs('resetEmail').value=email;showForm('reset')}
}
async function resetPassword(e){
  e.preventDefault();
  const r=await api('resetPassword',{email:qs('resetEmail').value,otp:qs('resetOtp').value,password:qs('resetPassword').value});
  showMsg(r.message,r.success);
  if(r.success) showForm('login');
}
function loadDashboard(){
  const u=JSON.parse(localStorage.getItem('isp_user')||'{}');
  if(!u.email){location.href='index.html';return}
  qs('memberName').textContent=u.name||'Member'; qs('memberEmail').textContent=u.email||''; qs('memberStatus').textContent=u.status||'Active';
}
async function loadAdmin(){
  const u=JSON.parse(localStorage.getItem('isp_user')||'{}');
  if(!u.email || u.role!=='Admin'){location.href='index.html';return}
  const r=await api('adminStats',{token:localStorage.getItem('isp_session')});
  if(r.success){qs('totalUsers').textContent=r.totalUsers;qs('activeUsers').textContent=r.activeUsers;qs('usersList').innerHTML=r.users.map(x=>`<div class="user-row"><b>${x.name}</b><br>${x.email} · ${x.status}</div>`).join('')}
}
function logout(){localStorage.removeItem('isp_session');localStorage.removeItem('isp_user');location.href='index.html'}
