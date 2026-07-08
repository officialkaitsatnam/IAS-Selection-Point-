const CONFIG = {
  APP_NAME: 'IAS Selection Point',
  ADMIN_EMAIL: 'kaitsatnam@gmail.com',
  SPREADSHEET_ID: '1c4DN25D_RSyJfmr011h268OicU1xB2Ka-T-VFEuQtGw',
  ADMIN_DEFAULT_PASSWORD: 'Admin@123',
  OTP_EXPIRY_MINUTES: 10,
  SESSION_DAYS: 7
};

const SHEETS = {
  USERS: 'USERS',
  OTP: 'OTP',
  SESSIONS: 'SESSIONS',
  LOGIN_LOGS: 'LOGIN_LOGS',
  EMAIL_LOGS: 'EMAIL_LOGS',
  SETTINGS: 'SETTINGS',
  PROFILES: 'PROFILES',
  NOTES: 'NOTES'
};

function doPost(e) {
  try {
    initializeSystem();
    const req = JSON.parse((e && e.postData && e.postData.contents) ? e.postData.contents : '{}');
    const action = req.action;
    if (action === 'testApi') return json({success:true,message:'API working', admin: CONFIG.ADMIN_EMAIL});
    if (action === 'signup') return json(signup(req));
    if (action === 'login') return json(login(req));
    if (action === 'sendResetOtp') return json(sendResetOtp(req));
    if (action === 'resetPassword') return json(resetPassword(req));
    if (action === 'adminStats') return json(adminStats(req));
    if (action === 'getProfile') return json(getProfile(req));
    if (action === 'saveProfile') return json(saveProfile(req));
    if (action === 'changePassword') return json(changePassword(req));
    if (action === 'addNote') return json(addNote(req));
    if (action === 'listNotes') return json(listNotes(req));
    if (action === 'deleteNote') return json(deleteNote(req));
    return json({success:false,message:'Invalid action: '+action});
  } catch (err) {
    return json({success:false,message:'Server error: '+err.message});
  }
}

function doGet() {
  initializeSystem();
  return ContentService.createTextOutput('IAS Selection Point API v6 is running').setMimeType(ContentService.MimeType.TEXT);
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function ss() { return SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID); }

function sheet(name, headers) {
  const book = ss();
  let sh = book.getSheetByName(name);
  if (!sh) sh = book.insertSheet(name);
  if (sh.getLastRow() === 0 && headers) sh.appendRow(headers);
  return sh;
}

function initializeSystem() {
  sheet(SHEETS.USERS, ['UserID','Name','Email','Mobile','PasswordHash','Role','Status','CreatedAt','LastLogin']);
  sheet(SHEETS.OTP, ['Email','OTP','Type','CreatedAt','ExpiresAt','Used']);
  sheet(SHEETS.SESSIONS, ['Token','Email','CreatedAt','ExpiresAt','Status']);
  sheet(SHEETS.LOGIN_LOGS, ['Email','Status','Time','Note']);
  sheet(SHEETS.EMAIL_LOGS, ['Email','Subject','Time','Status']);
  sheet(SHEETS.SETTINGS, ['Key','Value']);
  sheet(SHEETS.PROFILES, ['Email','Name','Mobile','City','Exam','UpdatedAt']);
  sheet(SHEETS.NOTES, ['NoteID','Email','Title','Body','CreatedAt','Status']);
  forceAdminFix();
}

function forceAdminFix() {
  const sh = sheet(SHEETS.USERS);
  const rows = sh.getDataRange().getValues();
  const email = CONFIG.ADMIN_EMAIL.toLowerCase();
  const correctHash = hashPassword(CONFIG.ADMIN_DEFAULT_PASSWORD);
  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][2]).toLowerCase().trim() === email) {
      sh.getRange(i+1, 1).setValue(rows[i][0] || uid('ADM'));
      sh.getRange(i+1, 2).setValue(rows[i][1] || 'Satnam Admin');
      sh.getRange(i+1, 3).setValue(email);
      sh.getRange(i+1, 5).setValue(correctHash);
      sh.getRange(i+1, 6).setValue('Admin');
      sh.getRange(i+1, 7).setValue('Active');
      return;
    }
  }
  sh.appendRow([uid('ADM'), 'Satnam Admin', email, '', correctHash, 'Admin', 'Active', new Date(), '']);
}

function signup(data) {
  const name = clean(data.name), email = clean(data.email).toLowerCase(), mobile = clean(data.mobile), pass = String(data.password || '');
  if (!name || !email || !pass) return fail('Please fill all required fields');
  if (findUser(email)) return fail('Email already registered');
  const role = email === CONFIG.ADMIN_EMAIL.toLowerCase() ? 'Admin' : 'Member';
  sheet(SHEETS.USERS).appendRow([uid('USR'), name, email, mobile, hashPassword(pass), role, 'Active', new Date(), '']);
  sheet(SHEETS.PROFILES).appendRow([email, name, mobile, '', '', new Date()]);
  sendMail(email, 'Welcome to IAS Selection Point', welcomeTemplate(name));
  return ok('Signup successful. Please login now.');
}

function login(data) {
  const email = clean(data.email).toLowerCase();
  const pass = String(data.password || '');
  const user = findUser(email);
  if (!user) { logLogin(email,'Failed','User not found'); return fail('Invalid email or password'); }
  if (user.status !== 'Active') return fail('Account is not active');
  if (user.passwordHash !== hashPassword(pass)) { logLogin(email,'Failed','Wrong password'); return fail('Invalid email or password'); }
  const token = uid('SESS') + '_' + Utilities.getUuid();
  const exp = new Date(Date.now() + CONFIG.SESSION_DAYS*24*60*60*1000);
  sheet(SHEETS.SESSIONS).appendRow([token,email,new Date(),exp,'Active']);
  updateLastLogin(email);
  logLogin(email,'Success','Login successful');
  return {success:true,message:'Login successful',token:token,user:{name:user.name,email:user.email,role:user.role,status:user.status}};
}

function getProfile(data) {
  const s = validateSession(data.token);
  if (!s.success) return s;
  const user = findUser(s.email);
  const p = findProfile(s.email);
  return {success:true, profile: {
    name: p ? p.name : user.name,
    mobile: p ? p.mobile : user.mobile,
    city: p ? p.city : '',
    exam: p ? p.exam : ''
  }};
}

function saveProfile(data) {
  const s = validateSession(data.token);
  if (!s.success) return s;
  const email = s.email;
  const name = clean(data.name);
  const mobile = clean(data.mobile);
  const city = clean(data.city);
  const exam = clean(data.exam);

  const sh = sheet(SHEETS.PROFILES);
  const rows = sh.getDataRange().getValues();
  for (let i=1;i<rows.length;i++) {
    if (String(rows[i][0]).toLowerCase().trim() === email) {
      sh.getRange(i+1,2,1,5).setValues([[name,mobile,city,exam,new Date()]]);
      updateUserBasic(email,name,mobile);
      return ok('Profile saved successfully');
    }
  }
  sh.appendRow([email,name,mobile,city,exam,new Date()]);
  updateUserBasic(email,name,mobile);
  return ok('Profile saved successfully');
}

function changePassword(data) {
  const s = validateSession(data.token);
  if (!s.success) return s;
  const user = findUser(s.email);
  if (!user) return fail('User not found');
  if (user.passwordHash !== hashPassword(String(data.oldPassword || ''))) return fail('Old password is incorrect');
  const np = String(data.newPassword || '');
  if (np.length < 6) return fail('New password must be at least 6 characters');
  const sh = sheet(SHEETS.USERS);
  sh.getRange(user.row,5).setValue(hashPassword(np));
  sendMail(user.email, 'Password Changed - IAS Selection Point', 'Your password has been changed successfully.');
  return ok('Password changed successfully');
}

function addNote(data) {
  const s = validateSession(data.token);
  if (!s.success) return s;
  const title = clean(data.title);
  const body = clean(data.body);
  if (!title || !body) return fail('Note title and body required');
  sheet(SHEETS.NOTES).appendRow([uid('NOTE'), s.email, title, body, new Date(), 'Active']);
  return ok('Note added successfully');
}

function listNotes(data) {
  const s = validateSession(data.token);
  if (!s.success) return s;
  const rows = sheet(SHEETS.NOTES).getDataRange().getValues();
  const notes = [];
  for (let i=rows.length-1;i>=1;i--) {
    if (String(rows[i][1]).toLowerCase().trim() === s.email && rows[i][5] === 'Active') {
      notes.push({id:rows[i][0], title:rows[i][2], body:rows[i][3], createdAt:rows[i][4]});
    }
  }
  return {success:true, notes:notes};
}

function deleteNote(data) {
  const s = validateSession(data.token);
  if (!s.success) return s;
  const id = clean(data.id);
  const sh = sheet(SHEETS.NOTES);
  const rows = sh.getDataRange().getValues();
  for (let i=1;i<rows.length;i++) {
    if (rows[i][0] === id && String(rows[i][1]).toLowerCase().trim() === s.email) {
      sh.getRange(i+1,6).setValue('Deleted');
      return ok('Note deleted');
    }
  }
  return fail('Note not found');
}

function sendResetOtp(data) {
  const email = clean(data.email).toLowerCase();
  const user = findUser(email);
  if (!user) return fail('Email not registered');
  const otp = String(Math.floor(100000 + Math.random()*900000));
  const exp = new Date(Date.now() + CONFIG.OTP_EXPIRY_MINUTES*60*1000);
  sheet(SHEETS.OTP).appendRow([email,otp,'RESET',new Date(),exp,'No']);
  sendMail(email, 'Password Reset OTP - IAS Selection Point', otpTemplate(user.name, otp));
  return ok('OTP sent to your email');
}

function resetPassword(data) {
  const email = clean(data.email).toLowerCase();
  const otp = clean(data.otp);
  const pass = String(data.password || '');
  const otpOk = verifyOtp(email, otp, 'RESET');
  if (!otpOk.success) return otpOk;
  const user = findUser(email);
  if (!user) return fail('User not found');
  sheet(SHEETS.USERS).getRange(user.row,5).setValue(hashPassword(pass));
  sendMail(email, 'Password Changed - IAS Selection Point', 'Your password has been changed successfully.');
  return ok('Password reset successful. Please login.');
}

function verifyOtp(email, otp, type) {
  const sh = sheet(SHEETS.OTP);
  const rows = sh.getDataRange().getValues();
  for (let i=rows.length-1;i>=1;i--) {
    if (String(rows[i][0]).toLowerCase().trim()===email && String(rows[i][1])===otp && rows[i][2]===type && rows[i][5] !== 'Yes') {
      if (new Date(rows[i][4]).getTime() < Date.now()) return fail('OTP expired');
      sh.getRange(i+1,6).setValue('Yes');
      return ok('OTP verified');
    }
  }
  return fail('Invalid OTP');
}

function adminStats(data) {
  const session = validateSession(data.token);
  if (!session.success) return session;
  const admin = findUser(session.email);
  if (!admin || admin.role !== 'Admin') return fail('Admin access required');
  const rows = sheet(SHEETS.USERS).getDataRange().getValues();
  const users = [];
  let active = 0;
  for (let i=1;i<rows.length;i++) {
    if (rows[i][6] === 'Active') active++;
    users.push({name:rows[i][1],email:rows[i][2],role:rows[i][5],status:rows[i][6]});
  }
  return {success:true,totalUsers:rows.length-1,activeUsers:active,users:users};
}

function validateSession(token) {
  const rows = sheet(SHEETS.SESSIONS).getDataRange().getValues();
  for (let i=1;i<rows.length;i++) {
    if (rows[i][0] === token && rows[i][4] === 'Active') {
      if (new Date(rows[i][3]).getTime() < Date.now()) return fail('Session expired');
      return {success:true,email:String(rows[i][1]).toLowerCase().trim()};
    }
  }
  return fail('Invalid session');
}

function findUser(email) {
  const rows = sheet(SHEETS.USERS).getDataRange().getValues();
  email = String(email).toLowerCase().trim();
  for (let i=1;i<rows.length;i++) {
    if (String(rows[i][2]).toLowerCase().trim() === email) {
      return {row:i+1,id:rows[i][0],name:rows[i][1],email:String(rows[i][2]).toLowerCase().trim(),mobile:rows[i][3],passwordHash:String(rows[i][4]),role:String(rows[i][5]).trim(),status:String(rows[i][6]).trim()};
    }
  }
  return null;
}

function findProfile(email) {
  const rows = sheet(SHEETS.PROFILES).getDataRange().getValues();
  email = String(email).toLowerCase().trim();
  for (let i=1;i<rows.length;i++) {
    if (String(rows[i][0]).toLowerCase().trim() === email) {
      return {name:rows[i][1],mobile:rows[i][2],city:rows[i][3],exam:rows[i][4]};
    }
  }
  return null;
}

function updateUserBasic(email,name,mobile) {
  const user = findUser(email);
  if (!user) return;
  const sh = sheet(SHEETS.USERS);
  sh.getRange(user.row,2).setValue(name);
  sh.getRange(user.row,4).setValue(mobile);
}

function updateLastLogin(email) {
  const user = findUser(email);
  if (user) sheet(SHEETS.USERS).getRange(user.row,9).setValue(new Date());
}

function logLogin(email,status,note) { sheet(SHEETS.LOGIN_LOGS).appendRow([email,status,new Date(),note]); }

function sendMail(to, subject, body) {
  try {
    MailApp.sendEmail({to:to, subject:subject, htmlBody:body, name: CONFIG.APP_NAME});
    sheet(SHEETS.EMAIL_LOGS).appendRow([to,subject,new Date(),'Sent']);
  } catch(e) {
    sheet(SHEETS.EMAIL_LOGS).appendRow([to,subject,new Date(),'Failed: '+e.message]);
  }
}

function welcomeTemplate(name) {
  return '<h2>Welcome to IAS Selection Point</h2><p>Dear '+name+',</p><p>Your member account has been created successfully.</p><p>Regards,<br>IAS Selection Point</p>';
}

function otpTemplate(name, otp) {
  return '<h2>Password Reset OTP</h2><p>Dear '+name+',</p><p>Your OTP is:</p><h1>'+otp+'</h1><p>This OTP is valid for '+CONFIG.OTP_EXPIRY_MINUTES+' minutes.</p>';
}

function hashPassword(password) {
  const raw = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, String(password));
  return raw.map(function(b) { return ('0' + (b & 0xFF).toString(16)).slice(-2); }).join('');
}

function uid(prefix) { return prefix + '_' + new Date().getTime() + '_' + Math.floor(Math.random()*9999); }
function clean(v) { return String(v || '').trim(); }
function ok(message) { return {success:true,message:message}; }
function fail(message) { return {success:false,message:message}; }
