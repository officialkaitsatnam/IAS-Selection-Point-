/*
 * v31.5 NEW BACKEND MIGRATION
 * Google Sheet ID: 1GfAvSSfCV2vAuTbe4_Yodjn8Y60SMTNhtog8PTpQvNs
 * Super Admin: iasselection1@gmail.com
 * Existing portal behavior preserved.
 */

const CONFIG = {
  APP_NAME: 'IAS Selection Point',
  ADMIN_EMAIL: "iasselection1@gmail.com",
  SPREADSHEET_ID: "1GfAvSSfCV2vAuTbe4_Yodjn8Y60SMTNhtog8PTpQvNs",
  ADMIN_DEFAULT_PASSWORD: 'Admin@123',
  LOGO_URL: 'https://officialkaitsatnam.github.io/IAS-Selection-Point-/logo.jpg',
  PORTAL_URL: 'https://officialkaitsatnam.github.io/IAS-Selection-Point-/',
  SITE_URL: 'https://iasselectionpoint.blogspot.com/',
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
  NOTES: 'NOTES',
  ADMIN_LOGS: 'ADMIN_LOGS',
  NOTIFICATIONS: 'NOTIFICATIONS',
  TICKETS: 'TICKETS',
  STUDY_PROGRESS: 'STUDY_PROGRESS',
  ACHIEVEMENTS: 'ACHIEVEMENTS',
  READING_HISTORY: 'READING_HISTORY',
  CONTENT_ANALYTICS: 'CONTENT_ANALYTICS',
  REVISION_QUEUE: 'REVISION_QUEUE',
  USER_NOTES: 'USER_NOTES',
  PROFILE_PRO: 'PROFILE_PRO',
  TESTS: 'TESTS',
  QUESTIONS: 'QUESTIONS',
  TEST_ATTEMPTS: 'TEST_ATTEMPTS',
  TEST_RESULTS: 'TEST_RESULTS'
};

function doPost(e) {
  try {
    const req = JSON.parse((e && e.postData && e.postData.contents) ? e.postData.contents : '{}');
    const action = req.action;
    if (action === 'signup') return json(signup(req));
    if (action === 'login') return json(login(req));
    if (action === 'sendResetOtp') return json(sendResetOtp(req));
    if (action === 'resetPassword') return json(resetPassword(req));
    if (action === 'adminStats') return json(adminStats(req));
    if (action === 'adminUpdateUserStatus') return json(adminUpdateUserStatus(req));
    if (action === 'adminDeleteUser') return json(adminDeleteUser(req));
    if (action === 'adminSendBulkEmail') return json(adminSendBulkEmail(req));
    if (action === 'adminSendPortalNotification') return json(adminSendPortalNotification(req));
    if (action === 'getNotifications') return json(getNotifications(req));
    if (action === 'sendDailyGoalCongrats') return json(sendDailyGoalCongrats(req));
    if (action === 'adminEnterpriseStats') return json(adminEnterpriseStats(req));
    if (action === 'adminBulkUpdateUsers') return json(adminBulkUpdateUsers(req));
    if (action === 'adminCommunicationHub') return json(adminCommunicationHub(req));
    if (action === 'createTicket') return json(createTicket(req));
    if (action === 'listMyTickets') return json(listMyTickets(req));
    if (action === 'adminListTickets') return json(adminListTickets(req));
    if (action === 'adminUpdateTicket') return json(adminUpdateTicket(req));
    if (action === 'formatAllSheets') return json(formatAllSheets(req));
    if (action === 'refreshSheetDashboard') return json(refreshSheetDashboard(req));
    if (action === 'runSheetMaintenance') return json(runSheetMaintenance(req));
    if (action === 'syncStudyProgress') return json(syncStudyProgress(req));
    if (action === 'adminPerformanceStats') return json(adminPerformanceStats(req));
    if (action === 'saveV28Note') return json(saveV28Note(req));
    if (action === 'saveV28Revision') return json(saveV28Revision(req));
    if (action === 'saveV291Profile') return json(saveV291Profile(req));
    if (action === 'listPublishedTests') return json(listPublishedTests(req));
    if (action === 'getTestQuestions') return json(getTestQuestions(req));
    if (action === 'submitTestResult') return json(submitTestResult(req));
    if (action === 'adminListTests') return json(adminListTests(req));
    if (action === 'adminCreateTest') return json(adminCreateTest(req));
    if (action === 'adminAddQuestion') return json(adminAddQuestion(req));
    if (action === 'adminUpdateTestStatus') return json(adminUpdateTestStatus(req));
    if (action === 'adminCreateDemoTest') return json(adminCreateDemoTest(req));
    if (action === 'adminEditTest') return json(adminEditTest(req));
    if (action === 'adminDeleteTest') return json(adminDeleteTest(req));
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
  return ContentService.createTextOutput('IAS Selection Point API v31.5 New Backend Migration is running').setMimeType(ContentService.MimeType.TEXT);
}

function json(obj) { return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON); }
function ss() {
  return SpreadsheetApp.openById("1GfAvSSfCV2vAuTbe4_Yodjn8Y60SMTNhtog8PTpQvNs");
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
  sheet(SHEETS.ADMIN_LOGS, ['AdminEmail','Action','TargetEmail','Time','Note']);
  sheet(SHEETS.NOTIFICATIONS, ['NotificationID','TargetEmail','Title','Body','CreatedAt','CreatedBy','Status']);
  sheet(SHEETS.TICKETS, ['TicketID','Email','Category','Subject','Message','Status','CreatedAt','UpdatedAt','AdminReply']);
  sheet(SHEETS.STUDY_PROGRESS, ['Email','TotalReads','CurrentStreak','DaysJSON','LastUpdated']);
  sheet(SHEETS.ACHIEVEMENTS, ['Email','BadgeID','BadgeName','EarnedAt']);
  sheet(SHEETS.READING_HISTORY, ['Email','ArticleTitle','Category','OpenedAt','ProgressPercent']);
  sheet(SHEETS.CONTENT_ANALYTICS, ['ArticleTitle','Category','OpenCount','LastOpenedAt']);
  sheet(SHEETS.REVISION_QUEUE, ['RevisionID','Email','ArticleTitle','Category','DueDate','Status','CreatedAt','CompletedAt']);
  sheet(SHEETS.USER_NOTES, ['NoteID','Email','ArticleTitle','Category','NoteText','CreatedAt']);
  sheet(SHEETS.PROFILE_PRO, ['Email','DOB','Gender','State','District','Qualification','Occupation','Language','Address','Website','UpdatedAt']);
  sheet(SHEETS.TESTS, ['TestID','Title','Category','Description','Duration','PositiveMarks','NegativeMarks','PassingMarks','Status','CreatedAt']);
  sheet(SHEETS.QUESTIONS, ['QuestionID','TestID','Question','OptionA','OptionB','OptionC','OptionD','CorrectOption','Explanation','CreatedAt']);
  sheet(SHEETS.TEST_ATTEMPTS, ['AttemptID','Email','TestID','StartedAt','SubmittedAt','TimeTaken','Status']);
  sheet(SHEETS.TEST_RESULTS, ['ResultID','Email','TestID','TestTitle','Score','MaxScore','Percentage','Correct','Wrong','Unanswered','Passed','SubmittedAt']);
  forceAdminFix();
  const props=PropertiesService.getScriptProperties();
  if(props.getProperty('ISP_SHEET_DESIGN_V23')!=='DONE'){
    applyProfessionalSheetDesign();
    buildDatabaseDashboard();
    props.setProperty('ISP_SHEET_DESIGN_V23','DONE');
  }
}

function forceAdminFix() {
  const sh = sheet(SHEETS.USERS);
  const rows = sh.getDataRange().getValues();
  const email = CONFIG.ADMIN_EMAIL.toLowerCase();
  const correctHash = hashPassword(CONFIG.ADMIN_DEFAULT_PASSWORD);
  for (let i=1;i<rows.length;i++) {
    if (String(rows[i][2]).toLowerCase().trim() === email) {
      sh.getRange(i+1,1).setValue(rows[i][0] || uid('ADM'));
      sh.getRange(i+1,2).setValue(rows[i][1] || 'Satnam Admin');
      sh.getRange(i+1,3).setValue(email);
      sh.getRange(i+1,5).setValue(correctHash);
      sh.getRange(i+1,6).setValue('Admin');
      sh.getRange(i+1,7).setValue('Active');
      return;
    }
  }
  sh.appendRow([uid('ADM'),'Satnam Admin',email,'',correctHash,'Admin','Active',new Date(),'']);
}

function signup(data) {
  const name=clean(data.name), email=clean(data.email).toLowerCase(), mobile=clean(data.mobile), pass=String(data.password||'');
  if(!name||!email||!pass) return fail('Please fill all required fields');
  if(findUser(email)) return fail('Email already registered');
  const role = email === CONFIG.ADMIN_EMAIL.toLowerCase() ? 'Admin' : 'Member';
  sheet(SHEETS.USERS).appendRow([uid('USR'),name,email,mobile,hashPassword(pass),role,'Active',new Date(),'']);
  sheet(SHEETS.PROFILES).appendRow([email,name,mobile,'','',new Date()]);
  sendMail(email,'Welcome to IAS Selection Point',welcomeTemplate(name,email));
  return ok('Signup successful. Please login now.');
}

function login(data) {
  const email=clean(data.email).toLowerCase(), pass=String(data.password||'');
  const user=findUser(email);
  if(!user) { logLogin(email,'Failed','User not found'); return fail('Invalid email or password'); }
  if(user.status === 'Blocked') return fail('Your account is blocked. Please contact admin.');
  if(user.status === 'Deactivated') return fail('Your account is deactivated. Please contact admin.');
  if(user.status === 'Deleted') return fail('This account has been deleted.');
  if(user.status !== 'Active') return fail('Account is not active.');
  if(user.passwordHash !== hashPassword(pass)) { logLogin(email,'Failed','Wrong password'); return fail('Invalid email or password'); }
  const token=uid('SESS')+'_'+Utilities.getUuid();
  const exp=new Date(Date.now()+CONFIG.SESSION_DAYS*24*60*60*1000);
  sheet(SHEETS.SESSIONS).appendRow([token,email,new Date(),exp,'Active']);
  updateLastLogin(email);
  logLogin(email,'Success','Login successful');
  return {success:true,message:'Login successful',token,user:{name:user.name,email:user.email,role:user.role,status:user.status}};
}

function adminStats(data) {
  const a=requireAdmin(data.token); if(!a.success) return a;
  const rows=sheet(SHEETS.USERS).getDataRange().getValues();
  const users=[]; let active=0;
  for(let i=1;i<rows.length;i++) {
    if(String(rows[i][6])==='Active') active++;
    users.push({name:rows[i][1],email:rows[i][2],mobile:rows[i][3],role:rows[i][5],status:rows[i][6],lastLogin:rows[i][8] ? String(rows[i][8]) : ''});
  }
  return {success:true,totalUsers:rows.length-1,activeUsers:active,users};
}

function adminUpdateUserStatus(data) {
  const a=requireAdmin(data.token); if(!a.success) return a;
  const email=clean(data.email).toLowerCase();
  const status=clean(data.status);
  if(email === CONFIG.ADMIN_EMAIL.toLowerCase()) return fail('Admin account cannot be modified.');
  if(['Active','Blocked','Pending','Deactivated'].indexOf(status) === -1) return fail('Invalid status.');
  const user=findUser(email); if(!user) return fail('User not found.');
  sheet(SHEETS.USERS).getRange(user.row,7).setValue(status);
  sheet(SHEETS.ADMIN_LOGS).appendRow([a.email,'STATUS_'+status,email,new Date(),'Status updated']);

  const subject = accountStatusSubject(status);
  const body = accountStatusTemplate(user.name || 'Member', status);
  sendMail(email, subject, body);

  return ok('User status updated to '+status+' and email notification sent.');
}

function adminDeleteUser(data) {
  const a=requireAdmin(data.token); if(!a.success) return a;
  const email=clean(data.email).toLowerCase();
  if(email === CONFIG.ADMIN_EMAIL.toLowerCase()) return fail('Admin account cannot be deleted.');
  const user=findUser(email); if(!user) return fail('User not found.');
  sheet(SHEETS.USERS).getRange(user.row,7).setValue('Deleted');
  sheet(SHEETS.ADMIN_LOGS).appendRow([a.email,'DELETE_USER',email,new Date(),'User marked Deleted']);

  const subject = accountStatusSubject('Deleted');
  const body = accountStatusTemplate(user.name || 'Member', 'Deleted');
  sendMail(email, subject, body);

  return ok('User deleted from portal and email notification sent.');
}

function requireAdmin(token) {
  const s=validateSession(token); if(!s.success) return s;
  const u=findUser(s.email);
  if(!u || u.role !== 'Admin') return fail('Admin access required.');
  return {success:true,email:s.email};
}

function getProfile(data) {
  const s=validateSession(data.token); if(!s.success) return s;
  const user=findUser(s.email), p=findProfile(s.email);
  return {success:true,profile:{name:p?p.name:user.name,mobile:p?p.mobile:user.mobile,city:p?p.city:'',exam:p?p.exam:''}};
}

function saveProfile(data) {
  const s=validateSession(data.token); if(!s.success) return s;
  const email=s.email, name=clean(data.name), mobile=clean(data.mobile), city=clean(data.city), exam=clean(data.exam);
  const sh=sheet(SHEETS.PROFILES), rows=sh.getDataRange().getValues();
  for(let i=1;i<rows.length;i++) {
    if(String(rows[i][0]).toLowerCase().trim()===email) {
      sh.getRange(i+1,2,1,5).setValues([[name,mobile,city,exam,new Date()]]);
      updateUserBasic(email,name,mobile); return ok('Profile saved successfully');
    }
  }
  sh.appendRow([email,name,mobile,city,exam,new Date()]);
  updateUserBasic(email,name,mobile);
  return ok('Profile saved successfully');
}

function changePassword(data) {
  const s=validateSession(data.token); if(!s.success) return s;
  const user=findUser(s.email); if(!user) return fail('User not found');
  if(user.passwordHash !== hashPassword(String(data.oldPassword||''))) return fail('Old password is incorrect');
  const np=String(data.newPassword||''); if(np.length<6) return fail('New password must be at least 6 characters');
  sheet(SHEETS.USERS).getRange(user.row,5).setValue(hashPassword(np));
  return ok('Password changed successfully');
}

function addNote(data) {
  const s=validateSession(data.token); if(!s.success) return s;
  const title=clean(data.title), body=clean(data.body);
  if(!title||!body) return fail('Note title and body required');
  sheet(SHEETS.NOTES).appendRow([uid('NOTE'),s.email,title,body,new Date(),'Active']);
  return ok('Note added successfully');
}

function listNotes(data) {
  const s=validateSession(data.token); if(!s.success) return s;
  const rows=sheet(SHEETS.NOTES).getDataRange().getValues(), notes=[];
  for(let i=rows.length-1;i>=1;i--) {
    if(String(rows[i][1]).toLowerCase().trim()===s.email && rows[i][5]==='Active') notes.push({id:rows[i][0],title:rows[i][2],body:rows[i][3],createdAt:rows[i][4]});
  }
  return {success:true,notes};
}

function deleteNote(data) {
  const s=validateSession(data.token); if(!s.success) return s;
  const sh=sheet(SHEETS.NOTES), rows=sh.getDataRange().getValues(), id=clean(data.id);
  for(let i=1;i<rows.length;i++) {
    if(rows[i][0]===id && String(rows[i][1]).toLowerCase().trim()===s.email) {
      sh.getRange(i+1,6).setValue('Deleted'); return ok('Note deleted');
    }
  }
  return fail('Note not found');
}

function sendResetOtp(data) {
  const email=clean(data.email).toLowerCase(), user=findUser(email);
  if(!user) return fail('Email not registered');
  const otp=String(Math.floor(100000+Math.random()*900000));
  const exp=new Date(Date.now()+CONFIG.OTP_EXPIRY_MINUTES*60*1000);
  sheet(SHEETS.OTP).appendRow([email,otp,'RESET',new Date(),exp,'No']);
  sendMail(email,'Password Reset OTP - IAS Selection Point',otpTemplate(user.name,otp));
  return ok('OTP sent to your email');
}

function resetPassword(data) {
  const email=clean(data.email).toLowerCase(), otp=clean(data.otp), pass=String(data.password||'');
  const otpOk=verifyOtp(email,otp,'RESET'); if(!otpOk.success) return otpOk;
  const user=findUser(email); if(!user) return fail('User not found');
  sheet(SHEETS.USERS).getRange(user.row,5).setValue(hashPassword(pass));
  return ok('Password reset successful. Please login.');
}

function verifyOtp(email,otp,type) {
  const sh=sheet(SHEETS.OTP), rows=sh.getDataRange().getValues();
  for(let i=rows.length-1;i>=1;i--) {
    if(String(rows[i][0]).toLowerCase().trim()===email && String(rows[i][1])===otp && rows[i][2]===type && rows[i][5]!=='Yes') {
      if(new Date(rows[i][4]).getTime()<Date.now()) return fail('OTP expired');
      sh.getRange(i+1,6).setValue('Yes'); return ok('OTP verified');
    }
  }
  return fail('Invalid OTP');
}

function validateSession(token) {
  const rows=sheet(SHEETS.SESSIONS).getDataRange().getValues();
  for(let i=1;i<rows.length;i++) {
    if(rows[i][0]===token && rows[i][4]==='Active') {
      if(new Date(rows[i][3]).getTime()<Date.now()) return fail('Session expired');
      return {success:true,email:String(rows[i][1]).toLowerCase().trim()};
    }
  }
  return fail('Invalid session');
}

function findUser(email) {
  const rows=sheet(SHEETS.USERS).getDataRange().getValues();
  email=String(email).toLowerCase().trim();
  for(let i=1;i<rows.length;i++) {
    if(String(rows[i][2]).toLowerCase().trim()===email) {
      return {row:i+1,id:rows[i][0],name:rows[i][1],email:String(rows[i][2]).toLowerCase().trim(),mobile:rows[i][3],passwordHash:String(rows[i][4]),role:String(rows[i][5]).trim(),status:String(rows[i][6]).trim()};
    }
  }
  return null;
}

function findProfile(email) {
  const rows=sheet(SHEETS.PROFILES).getDataRange().getValues();
  email=String(email).toLowerCase().trim();
  for(let i=1;i<rows.length;i++) {
    if(String(rows[i][0]).toLowerCase().trim()===email) return {name:rows[i][1],mobile:rows[i][2],city:rows[i][3],exam:rows[i][4]};
  }
  return null;
}

function updateUserBasic(email,name,mobile) {
  const user=findUser(email); if(!user) return;
  const sh=sheet(SHEETS.USERS);
  sh.getRange(user.row,2).setValue(name);
  sh.getRange(user.row,4).setValue(mobile);
}

function updateLastLogin(email) {
  const user=findUser(email); if(user) sheet(SHEETS.USERS).getRange(user.row,9).setValue(new Date());
}

function logLogin(email,status,note) { sheet(SHEETS.LOGIN_LOGS).appendRow([email,status,new Date(),note]); }

function sendMail(to,subject,body) {
  try {
    MailApp.sendEmail({to,subject,htmlBody:body,name:CONFIG.APP_NAME});
    sheet(SHEETS.EMAIL_LOGS).appendRow([to,subject,new Date(),'Sent']);
  } catch(e) {
    sheet(SHEETS.EMAIL_LOGS).appendRow([to,subject,new Date(),'Failed: '+e.message]);
  }
}


function baseEmailTemplate(params) {
  const title = params.title || 'IAS Selection Point';
  const subtitle = params.subtitle || '';
  const body = params.body || '';
  const badge = params.badge || '';
  const badgeColor = params.badgeColor || '#0b5ed7';
  const buttonText = params.buttonText || 'Open Learning Portal';
  const buttonUrl = params.buttonUrl || CONFIG.PORTAL_URL;
  return `
  <div style="margin:0;padding:0;background:#eef4fb;font-family:Arial,Helvetica,sans-serif;color:#10233f;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#eef4fb;padding:24px 10px;">
      <tr><td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:620px;background:#ffffff;border-radius:22px;overflow:hidden;box-shadow:0 14px 42px rgba(16,35,63,.12);">
          <tr><td style="background:linear-gradient(135deg,#0b5ed7,#092a55);padding:28px;text-align:center;color:#ffffff;">
            <img src="${CONFIG.LOGO_URL}" alt="IAS Selection Point" style="width:96px;height:96px;object-fit:contain;border-radius:20px;background:#ffffff;padding:6px;margin-bottom:12px;">
            <h1 style="margin:0;font-size:26px;line-height:1.2;">IAS Selection Point</h1>
            <p style="margin:6px 0 0;font-size:14px;opacity:.9;">Professional Learning Portal</p>
          </td></tr>
          <tr><td style="padding:28px;">
            ${badge ? `<div style="display:inline-block;background:${badgeColor};color:#ffffff;padding:8px 12px;border-radius:999px;font-size:12px;font-weight:bold;margin-bottom:16px;">${badge}</div>` : ''}
            <h2 style="margin:0 0 8px;font-size:24px;color:#10233f;">${title}</h2>
            ${subtitle ? `<p style="margin:0 0 18px;color:#5a6b82;font-size:15px;">${subtitle}</p>` : ''}
            <div style="font-size:15px;line-height:1.7;color:#24364f;">${body}</div>
            <div style="text-align:center;margin:28px 0 12px;">
              <a href="${buttonUrl}" style="background:#0b5ed7;color:#ffffff;text-decoration:none;padding:13px 22px;border-radius:12px;font-weight:bold;display:inline-block;">${buttonText}</a>
            </div>
            <div style="background:#f8fbff;border:1px solid #e2eefc;border-radius:14px;padding:14px;margin-top:22px;color:#5a6b82;font-size:13px;">
              This is an automated email from IAS Selection Point. If you did not request this action, please contact the administrator.
            </div>
          </td></tr>
          <tr><td style="background:#f8fbff;padding:18px;text-align:center;color:#5a6b82;font-size:12px;">
            <b>IAS Selection Point</b><br>Learning Portal · Study Resources · Current Affairs<br>
            <a href="${CONFIG.SITE_URL}" style="color:#0b5ed7;text-decoration:none;">Main Website</a> ·
            <a href="${CONFIG.PORTAL_URL}" style="color:#0b5ed7;text-decoration:none;">Member Portal</a>
          </td></tr>
        </table>
      </td></tr>
    </table>
  </div>`;
}

function welcomeTemplate(name,email) {
  return baseEmailTemplate({
    badge:'WELCOME',
    badgeColor:'#159947',
    title:'Welcome to IAS Selection Point',
    subtitle:'Your member account has been created successfully.',
    body:`<p>Dear <b>${name}</b>,</p>
      <p>Welcome to IAS Selection Point Learning Portal. Your account is now ready.</p>
      <p><b>Registered Email:</b> ${email || ''}</p>
      <p>You can access study modules, categories, articles, bookmarks and notes from your member dashboard.</p>`,
    buttonText:'Login to Portal'
  });
}

function otpTemplate(name,otp) {
  return baseEmailTemplate({
    badge:'PASSWORD RESET OTP',
    badgeColor:'#ff9800',
    title:'Your Password Reset OTP',
    subtitle:'Use this OTP to reset your IAS Selection Point password.',
    body:`<p>Dear <b>${name}</b>,</p>
      <p>Your password reset OTP is:</p>
      <div style="font-size:34px;letter-spacing:8px;text-align:center;font-weight:bold;background:#eef6ff;border:1px dashed #0b5ed7;border-radius:16px;padding:18px;margin:18px 0;color:#0b5ed7;">${otp}</div>
      <p>This OTP is valid for <b>${CONFIG.OTP_EXPIRY_MINUTES} minutes</b>.</p>
      <p>If you did not request this, please ignore this email.</p>`,
    buttonText:'Open Password Reset'
  });
}

function passwordChangedTemplate(name) {
  return baseEmailTemplate({
    badge:'SECURITY ALERT',
    badgeColor:'#6f42c1',
    title:'Password Changed Successfully',
    subtitle:'Your IAS Selection Point password has been updated.',
    body:`<p>Dear <b>${name}</b>,</p>
      <p>Your password was changed successfully.</p>
      <p><b>Time:</b> ${new Date()}</p>
      <p>If this was not done by you, please contact admin immediately.</p>`,
    buttonText:'Open Portal'
  });
}

function accountStatusSubject(status) {
  if (status === 'Active') return 'Your IAS Selection Point account has been activated';
  if (status === 'Deactivated') return 'Your IAS Selection Point account has been deactivated';
  if (status === 'Blocked') return 'Your IAS Selection Point account has been blocked';
  if (status === 'Deleted') return 'Your IAS Selection Point account has been deleted';
  if (status === 'Pending') return 'Your IAS Selection Point account is pending';
  return 'IAS Selection Point account status update';
}

function accountStatusTemplate(name,status) {
  let title='Account Status Updated', badge='STATUS UPDATE', color='#0b5ed7', message='Your account status has been updated.';
  if(status==='Active'){ title='Account Activated'; badge='ACTIVATED'; color='#159947'; message='Your account has been activated. You can now login and access the learning portal.'; }
  if(status==='Deactivated'){ title='Account Deactivated'; badge='DEACTIVATED'; color='#4338ca'; message='Your account has been deactivated. You will not be able to login until admin activates it again.'; }
  if(status==='Blocked'){ title='Account Blocked'; badge='BLOCKED'; color='#d97706'; message='Your account has been blocked by admin. Please contact admin for more information.'; }
  if(status==='Deleted'){ title='Account Deleted'; badge='DELETED'; color='#b00020'; message='Your account has been removed from the portal by admin.'; }
  if(status==='Pending'){ title='Account Pending'; badge='PENDING'; color='#ff9800'; message='Your account is currently pending approval.'; }
  return baseEmailTemplate({
    badge:badge,
    badgeColor:color,
    title:title,
    subtitle:'IAS Selection Point account notification',
    body:`<p>Dear <b>${name}</b>,</p><p>${message}</p><p><b>Current Status:</b> ${status}</p><p>If you think this is a mistake, please contact IAS Selection Point admin.</p>`,
    buttonText: status==='Active' ? 'Login to Portal' : 'Visit Website'
  });
}

function bulkEmailTemplate(name,subject,message) {
  return baseEmailTemplate({
    badge:'ANNOUNCEMENT',
    badgeColor:'#0b5ed7',
    title:subject,
    subtitle:'Message from IAS Selection Point admin',
    body:`<p>Dear <b>${name}</b>,</p><div>${String(message).replace(/\n/g,'<br>')}</div>`,
    buttonText:'Open Learning Portal'
  });
}

function adminSendBulkEmail(data) {
  const a=requireAdmin(data.token); if(!a.success) return a;
  const subject = clean(data.subject);
  const body = clean(data.body);
  if(!subject || !body) return fail('Subject and message are required.');
  const rows=sheet(SHEETS.USERS).getDataRange().getValues();
  let sent=0;
  for(let i=1;i<rows.length;i++) {
    const email=String(rows[i][2]).toLowerCase().trim();
    const name=String(rows[i][1] || 'Member');
    const status=String(rows[i][6] || '');
    if(email && status === 'Active') {
      sendMail(email, subject, bulkEmailTemplate(name, subject, body));
      sent++;
    }
  }
  sheet(SHEETS.ADMIN_LOGS).appendRow([a.email,'BULK_EMAIL','ACTIVE_USERS',new Date(),'Sent: '+sent]);
  return ok('Bulk email sent to '+sent+' active members.');
}



function adminSendPortalNotification(data) {
  const a=requireAdmin(data.token); if(!a.success) return a;
  const target = clean(data.target || 'all');
  const email = clean(data.email).toLowerCase();
  const title = clean(data.title);
  const body = clean(data.body);
  if(!title || !body) return fail('Title and message are required.');
  const sh = sheet(SHEETS.NOTIFICATIONS);
  let sent = 0;

  if(target === 'single') {
    const user = findUser(email);
    if(!user) return fail('User not found.');
    sh.appendRow([uid('NOTI'), email, title, body, new Date(), a.email, 'Active']);
    sendMail(email, 'Notification - IAS Selection Point', notificationEmailTemplate(user.name || 'Member', title, body));
    sent = 1;
  } else {
    const rows = sheet(SHEETS.USERS).getDataRange().getValues();
    for(let i=1;i<rows.length;i++) {
      const userEmail = String(rows[i][2]).toLowerCase().trim();
      const name = String(rows[i][1] || 'Member');
      const status = String(rows[i][6] || '');
      if(userEmail && status === 'Active') {
        sh.appendRow([uid('NOTI'), userEmail, title, body, new Date(), a.email, 'Active']);
        sendMail(userEmail, 'Notification - IAS Selection Point', notificationEmailTemplate(name, title, body));
        sent++;
      }
    }
  }
  sheet(SHEETS.ADMIN_LOGS).appendRow([a.email,'PORTAL_NOTIFICATION',target === 'single' ? email : 'ALL_ACTIVE',new Date(),'Sent: '+sent]);
  return ok('Notification sent to '+sent+' user(s).');
}

function getNotifications(data) {
  const s=validateSession(data.token); if(!s.success) return s;
  const email = s.email;
  const rows = sheet(SHEETS.NOTIFICATIONS).getDataRange().getValues();
  const notifications = [];
  for(let i=rows.length-1;i>=1;i--) {
    if(String(rows[i][1]).toLowerCase().trim() === email && String(rows[i][6]) === 'Active') {
      notifications.push({
        id: rows[i][0],
        title: rows[i][2],
        body: rows[i][3],
        date: rows[i][4] ? String(rows[i][4]) : '',
        read: false
      });
    }
    if(notifications.length >= 50) break;
  }
  return {success:true, notifications};
}

function sendDailyGoalCongrats(data) {
  const s=validateSession(data.token); if(!s.success) return s;
  const user = findUser(s.email); if(!user) return fail('User not found.');
  const count = Number(data.count || 5);
  sendMail(user.email, 'Congratulations - Daily Study Goal Completed', dailyGoalEmailTemplate(user.name || 'Member', count));
  return ok('Congratulations email sent.');
}

function notificationEmailTemplate(name,title,message) {
  return baseEmailTemplate({
    badge:'NOTIFICATION',
    badgeColor:'#0b5ed7',
    title:title,
    subtitle:'New message from IAS Selection Point',
    body:`<p>Dear <b>${name}</b>,</p><div>${String(message).replace(/\n/g,'<br>')}</div>`,
    buttonText:'Open Dashboard'
  });
}

function dailyGoalEmailTemplate(name,count) {
  return baseEmailTemplate({
    badge:'GOAL COMPLETED',
    badgeColor:'#159947',
    title:'Congratulations! Daily Study Goal Completed',
    subtitle:'You completed your study target today.',
    body:`<p>Dear <b>${name}</b>,</p>
      <p>Great work! You have completed your daily study goal by reading <b>${count} articles</b> today.</p>
      <p>Keep learning consistently. Small daily efforts create big results.</p>`,
    buttonText:'Continue Learning'
  });
}



function dateOnlyKey(value) {
  const d = value instanceof Date ? value : new Date(value);
  if (isNaN(d.getTime())) return '';
  return Utilities.formatDate(d, Session.getScriptTimeZone(), 'yyyy-MM-dd');
}

function adminEnterpriseStats(data) {
  const a=requireAdmin(data.token); if(!a.success) return a;
  const today=dateOnlyKey(new Date());
  const userRows=sheet(SHEETS.USERS).getDataRange().getValues();
  const loginRows=sheet(SHEETS.LOGIN_LOGS).getDataRange().getValues();
  const emailRows=sheet(SHEETS.EMAIL_LOGS).getDataRange().getValues();
  const ticketRows=sheet(SHEETS.TICKETS).getDataRange().getValues();
  let newUsersToday=0, loginsToday=0, emailsSent=0, openTickets=0;
  for(let i=1;i<userRows.length;i++) if(dateOnlyKey(userRows[i][7])===today) newUsersToday++;
  for(let i=1;i<loginRows.length;i++) if(dateOnlyKey(loginRows[i][2])===today && String(loginRows[i][1])==='Success') loginsToday++;
  for(let i=1;i<emailRows.length;i++) if(String(emailRows[i][3]).indexOf('Sent')===0) emailsSent++;
  for(let i=1;i<ticketRows.length;i++) if(String(ticketRows[i][5])!=='Resolved') openTickets++;
  return {success:true,newUsersToday,loginsToday,emailsSent,openTickets};
}

function adminBulkUpdateUsers(data) {
  const a=requireAdmin(data.token); if(!a.success) return a;
  const emails=Array.isArray(data.emails)?data.emails:[];
  const status=clean(data.status);
  if(['Active','Blocked','Pending','Deactivated'].indexOf(status)===-1) return fail('Invalid status.');
  let updated=0;
  emails.forEach(function(rawEmail){
    const email=clean(rawEmail).toLowerCase();
    if(!email || email===CONFIG.ADMIN_EMAIL.toLowerCase()) return;
    const user=findUser(email);
    if(user){
      sheet(SHEETS.USERS).getRange(user.row,7).setValue(status);
      sendMail(email,accountStatusSubject(status),accountStatusTemplate(user.name||'Member',status));
      updated++;
    }
  });
  sheet(SHEETS.ADMIN_LOGS).appendRow([a.email,'BULK_STATUS_'+status,emails.join(','),new Date(),'Updated: '+updated]);
  return ok(updated+' user(s) updated to '+status+'.');
}

function adminCommunicationHub(data) {
  const a=requireAdmin(data.token); if(!a.success) return a;
  const audience=clean(data.audience||'all');
  const title=clean(data.title), body=clean(data.body);
  const sendEmailFlag=data.sendEmail!==false;
  const sendDashboardFlag=data.sendDashboard!==false;
  if(!title||!body) return fail('Subject and message are required.');
  let targets=[];
  if(audience==='single'){
    const email=clean(data.email).toLowerCase();
    const user=findUser(email); if(!user) return fail('User not found.');
    targets=[user];
  }else if(audience==='selected'){
    const emails=Array.isArray(data.emails)?data.emails:[];
    targets=emails.map(function(e){return findUser(clean(e).toLowerCase());}).filter(function(u){return !!u;});
  }else{
    const rows=sheet(SHEETS.USERS).getDataRange().getValues();
    for(let i=1;i<rows.length;i++){
      if(String(rows[i][6])==='Active'){
        targets.push({name:rows[i][1],email:String(rows[i][2]).toLowerCase().trim()});
      }
    }
  }
  let count=0;
  const nsh=sheet(SHEETS.NOTIFICATIONS);
  targets.forEach(function(user){
    if(sendDashboardFlag) nsh.appendRow([uid('NOTI'),user.email,title,body,new Date(),a.email,'Active']);
    if(sendEmailFlag) sendMail(user.email,title,notificationEmailTemplate(user.name||'Member',title,body));
    count++;
  });
  sheet(SHEETS.ADMIN_LOGS).appendRow([a.email,'COMMUNICATION_HUB',audience,new Date(),'Sent: '+count]);
  return ok('Communication sent to '+count+' user(s).');
}

function createTicket(data) {
  const s=validateSession(data.token); if(!s.success) return s;
  const category=clean(data.category), subject=clean(data.subject), message=clean(data.message);
  if(!subject||!message) return fail('Subject and message are required.');
  const id=uid('TKT');
  sheet(SHEETS.TICKETS).appendRow([id,s.email,category,subject,message,'Open',new Date(),new Date(),'']);
  const user=findUser(s.email);
  sendMail(CONFIG.ADMIN_EMAIL,'New Support Ticket - '+subject,notificationEmailTemplate('Admin','New Support Ticket',`From: ${s.email}<br>Category: ${category}<br><br>${message}`));
  return ok('Support ticket submitted successfully.');
}

function listMyTickets(data) {
  const s=validateSession(data.token); if(!s.success) return s;
  const rows=sheet(SHEETS.TICKETS).getDataRange().getValues(), tickets=[];
  for(let i=rows.length-1;i>=1;i--){
    if(String(rows[i][1]).toLowerCase().trim()===s.email){
      tickets.push({id:rows[i][0],email:rows[i][1],category:rows[i][2],subject:rows[i][3],message:rows[i][4],status:rows[i][5],createdAt:String(rows[i][6]||''),updatedAt:String(rows[i][7]||''),adminReply:rows[i][8]||''});
    }
  }
  return {success:true,tickets};
}

function adminListTickets(data) {
  const a=requireAdmin(data.token); if(!a.success) return a;
  const rows=sheet(SHEETS.TICKETS).getDataRange().getValues(), tickets=[];
  for(let i=rows.length-1;i>=1;i--){
    tickets.push({id:rows[i][0],email:rows[i][1],category:rows[i][2],subject:rows[i][3],message:rows[i][4],status:rows[i][5],createdAt:String(rows[i][6]||''),updatedAt:String(rows[i][7]||''),adminReply:rows[i][8]||''});
  }
  return {success:true,tickets};
}

function adminUpdateTicket(data) {
  const a=requireAdmin(data.token); if(!a.success) return a;
  const id=clean(data.ticketId), reply=clean(data.reply), status=clean(data.status||'Pending');
  const sh=sheet(SHEETS.TICKETS), rows=sh.getDataRange().getValues();
  for(let i=1;i<rows.length;i++){
    if(String(rows[i][0])===id){
      sh.getRange(i+1,6).setValue(status);
      sh.getRange(i+1,8).setValue(new Date());
      sh.getRange(i+1,9).setValue(reply);
      const email=String(rows[i][1]).toLowerCase().trim();
      const user=findUser(email);
      if(reply) sendMail(email,'Support Ticket Update - '+rows[i][3],notificationEmailTemplate(user?user.name:'Member','Support Ticket Updated',`Status: ${status}<br><br>${reply}`));
      sheet(SHEETS.NOTIFICATIONS).appendRow([uid('NOTI'),email,'Support Ticket Updated',reply||('Ticket status changed to '+status),new Date(),a.email,'Active']);
      return ok('Ticket updated successfully.');
    }
  }
  return fail('Ticket not found.');
}



/* ======================================================
 * v23 PROFESSIONAL GOOGLE SHEET DESIGN
 * ====================================================== */

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('IAS Selection Point Admin')
    .addItem('Initialize System', 'initializeSystem')
    .addSeparator()
    .addItem('Format All Sheets', 'formatAllSheetsFromMenu')
    .addItem('Refresh Dashboard Summary', 'refreshSheetDashboardFromMenu')
    .addItem('Run Sheet Maintenance', 'runSheetMaintenanceFromMenu')
    .addToUi();
}

function formatAllSheetsFromMenu() {
  initializeSystem();
  applyProfessionalSheetDesign();
  SpreadsheetApp.getUi().alert('All IAS Selection Point sheets formatted successfully.');
}

function refreshSheetDashboardFromMenu() {
  initializeSystem();
  buildDatabaseDashboard();
  SpreadsheetApp.getUi().alert('Database dashboard refreshed successfully.');
}

function runSheetMaintenanceFromMenu() {
  initializeSystem();
  performSheetMaintenance();
  SpreadsheetApp.getUi().alert('Sheet maintenance completed successfully.');
}

function formatAllSheets(data) {
  const a=requireAdmin(data.token); if(!a.success) return a;
  applyProfessionalSheetDesign();
  buildDatabaseDashboard();
  return ok('All Google Sheets formatted successfully. Existing alternating colors were refreshed safely.');
}

function refreshSheetDashboard(data) {
  const a=requireAdmin(data.token); if(!a.success) return a;
  buildDatabaseDashboard();
  return ok('Google Sheet dashboard summary refreshed.');
}

function runSheetMaintenance(data) {
  const a=requireAdmin(data.token); if(!a.success) return a;
  performSheetMaintenance();
  applyProfessionalSheetDesign();
  return ok('Sheet maintenance and professional formatting completed successfully.');
}


function removeAllBandingsSafe(sh) {
  try {
    const bandings = sh.getBandings();
    bandings.forEach(function(banding) {
      try { banding.remove(); } catch (e) {}
    });
  } catch (e) {}
}

function applyProfessionalSheetDesign() {
  const book=ss();
  const palette={
    navy:'#0B2A55',
    blue:'#0B5ED7',
    lightBlue:'#EAF3FF',
    green:'#159947',
    lightGreen:'#E9F8EF',
    orange:'#F59E0B',
    lightOrange:'#FFF5DD',
    red:'#DC2626',
    lightRed:'#FDECEC',
    purple:'#6F42C1',
    lightPurple:'#F3ECFF',
    gray:'#F7F9FC',
    border:'#DCE6F2',
    text:'#10233F',
    muted:'#5A6B82',
    white:'#FFFFFF'
  };

  const sheetStyles={
    USERS:{tab:palette.blue, header:palette.navy, widths:[18,24,30,16,22,12,14,20,20]},
    PROFILES:{tab:palette.purple, header:palette.purple, widths:[30,24,16,18,20,20]},
    OTP:{tab:palette.orange, header:'#B66A00', widths:[30,12,14,20,20,10]},
    SESSIONS:{tab:'#64748B', header:'#334155', widths:[34,30,20,20,12]},
    LOGIN_LOGS:{tab:palette.green, header:'#116B36', widths:[30,14,20,36]},
    EMAIL_LOGS:{tab:'#0EA5E9', header:'#0369A1', widths:[30,34,20,38]},
    SETTINGS:{tab:'#8B5CF6', header:'#5B21B6', widths:[24,40]},
    NOTES:{tab:'#14B8A6', header:'#0F766E', widths:[20,30,28,52,20,14]},
    ADMIN_LOGS:{tab:'#E11D48', header:'#9F1239', widths:[30,24,34,20,42]},
    NOTIFICATIONS:{tab:'#F97316', header:'#C2410C', widths:[20,30,32,52,20,30,14]},
    TICKETS:{tab:'#EF4444', header:'#B91C1C', widths:[20,30,20,30,52,14,20,20,48]},
    STUDY_PROGRESS:{tab:'#22C55E', header:'#15803D', widths:[30,16,16,70,20]},
    ACHIEVEMENTS:{tab:'#F59E0B', header:'#B66A00', widths:[30,20,28,20]},
    READING_HISTORY:{tab:'#0EA5E9', header:'#0369A1', widths:[30,48,26,20,18]},
    CONTENT_ANALYTICS:{tab:'#8B5CF6', header:'#5B21B6', widths:[48,26,16,20]},
    REVISION_QUEUE:{tab:'#EF4444', header:'#B91C1C', widths:[20,30,48,24,20,14,20,20]},
    USER_NOTES:{tab:'#14B8A6', header:'#0F766E', widths:[20,30,48,24,60,20]},
    PROFILE_PRO:{tab:'#0B5ED7', header:'#0B2A55', widths:[30,16,14,20,20,24,24,20,34,34,20]},
    TESTS:{tab:'#7C3AED', header:'#5B21B6', widths:[20,36,24,48,14,16,16,16,14,20]},
    QUESTIONS:{tab:'#2563EB', header:'#1D4ED8', widths:[20,20,60,32,32,32,32,16,48,20]},
    TEST_ATTEMPTS:{tab:'#F59E0B', header:'#B66A00', widths:[20,30,20,20,20,16,14]},
    TEST_RESULTS:{tab:'#159947', header:'#116B36', widths:[20,30,20,36,14,14,14,14,14,14,12,20]}
  };

  book.getSheets().forEach(function(sh){
    const name=sh.getName();
    if(name==='DASHBOARD') return;
    const spec=sheetStyles[name]||{tab:'#64748B',header:palette.navy,widths:[]};
    sh.setTabColor(spec.tab);
    sh.setFrozenRows(1);
    sh.setFrozenColumns(1);
    sh.setHiddenGridlines(true);
    removeAllBandingsSafe(sh);

    const lastRow=Math.max(sh.getLastRow(),1);
    const lastCol=Math.max(sh.getLastColumn(),1);
    const header=sh.getRange(1,1,1,lastCol);
    header
      .setBackground(spec.header)
      .setFontColor(palette.white)
      .setFontWeight('bold')
      .setFontSize(10)
      .setHorizontalAlignment('center')
      .setVerticalAlignment('middle')
      .setWrap(true);
    sh.setRowHeight(1,32);

    if(lastRow>1){
      const dataRange=sh.getRange(2,1,lastRow-1,lastCol);
      dataRange
        .setFontColor(palette.text)
        .setFontSize(10)
        .setVerticalAlignment('middle')
        .setBorder(true,true,true,true,true,true,palette.border,SpreadsheetApp.BorderStyle.SOLID);
      try {
        dataRange.applyRowBanding(SpreadsheetApp.BandingTheme.LIGHT_GREY,false,false);
      } catch (bandingError) {
        removeAllBandingsSafe(sh);
        dataRange.applyRowBanding(SpreadsheetApp.BandingTheme.LIGHT_GREY,false,false);
      }
      sh.setRowHeights(2,lastRow-1,24);
    }

    spec.widths.forEach(function(w,index){
      if(index<lastCol) sh.setColumnWidth(index+1,w*7);
    });
    for(let c=spec.widths.length+1;c<=lastCol;c++){
      sh.autoResizeColumn(c);
      if(sh.getColumnWidth(c)>280) sh.setColumnWidth(c,280);
      if(sh.getColumnWidth(c)<90) sh.setColumnWidth(c,90);
    }

    const existingFilter=sh.getFilter();
    if(existingFilter) existingFilter.remove();
    if(lastRow>=1&&lastCol>=1) sh.getRange(1,1,lastRow,lastCol).createFilter();

    applySheetSpecificFormatting(sh,name,lastRow,lastCol,palette);
  });
}

function applySheetSpecificFormatting(sh,name,lastRow,lastCol,palette) {
  if(lastRow<2) return;

  const headers=sh.getRange(1,1,1,lastCol).getValues()[0].map(function(v){return String(v);});
  headers.forEach(function(header,index){
    const col=index+1;
    if(/Date|Time|CreatedAt|UpdatedAt|LastLogin|ExpiresAt/i.test(header)){
      sh.getRange(2,col,lastRow-1,1).setNumberFormat('dd-mmm-yyyy hh:mm');
    }
    if(/Email/i.test(header)){
      sh.getRange(2,col,lastRow-1,1).setFontColor('#0B5ED7');
    }
    if(/Mobile/i.test(header)){
      sh.getRange(2,col,lastRow-1,1).setNumberFormat('@');
    }
  });

  if(name==='USERS'){
    const statusCol=headers.indexOf('Status')+1;
    const roleCol=headers.indexOf('Role')+1;
    if(statusCol>0){
      const range=sh.getRange(2,statusCol,lastRow-1,1);
      const rules=[
        SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo('Active').setBackground(palette.lightGreen).setFontColor('#116B36').setRanges([range]).build(),
        SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo('Blocked').setBackground(palette.lightRed).setFontColor('#B91C1C').setRanges([range]).build(),
        SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo('Deactivated').setBackground(palette.lightOrange).setFontColor('#9A5A00').setRanges([range]).build(),
        SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo('Pending').setBackground(palette.lightPurple).setFontColor('#5B21B6').setRanges([range]).build(),
        SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo('Deleted').setBackground('#E5E7EB').setFontColor('#475569').setRanges([range]).build()
      ];
      sh.setConditionalFormatRules((sh.getConditionalFormatRules()||[]).filter(function(r){return false;}).concat(rules));
      range.setDataValidation(SpreadsheetApp.newDataValidation().requireValueInList(['Active','Deactivated','Blocked','Pending','Deleted'],true).build());
    }
    if(roleCol>0){
      sh.getRange(2,roleCol,lastRow-1,1).setDataValidation(
        SpreadsheetApp.newDataValidation().requireValueInList(['Admin','Member'],true).build()
      );
    }
  }

  if(name==='TICKETS'){
    const statusCol=headers.indexOf('Status')+1;
    if(statusCol>0){
      const range=sh.getRange(2,statusCol,lastRow-1,1);
      sh.setConditionalFormatRules([
        SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo('Open').setBackground(palette.lightRed).setFontColor('#B91C1C').setRanges([range]).build(),
        SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo('Pending').setBackground(palette.lightOrange).setFontColor('#9A5A00').setRanges([range]).build(),
        SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo('Resolved').setBackground(palette.lightGreen).setFontColor('#116B36').setRanges([range]).build()
      ]);
      range.setDataValidation(SpreadsheetApp.newDataValidation().requireValueInList(['Open','Pending','Resolved'],true).build());
    }
  }

  if(name==='EMAIL_LOGS'||name==='LOGIN_LOGS'){
    const statusCol=headers.indexOf('Status')+1;
    if(statusCol>0){
      sh.getRange(2,statusCol,lastRow-1,1).setHorizontalAlignment('center');
    }
  }
}

function buildDatabaseDashboard() {
  const book=ss();
  let sh=book.getSheetByName('DASHBOARD');
  if(!sh) sh=book.insertSheet('DASHBOARD',0);
  removeAllBandingsSafe(sh);
  sh.clear();
  sh.clearConditionalFormatRules();
  sh.setHiddenGridlines(true);
  sh.setTabColor('#0B5ED7');

  sh.setColumnWidths(1,8,120);
  sh.setRowHeights(1,30,26);

  sh.getRange('A1:H2').merge()
    .setValue('IAS Selection Point — Database Dashboard')
    .setBackground('#0B2A55')
    .setFontColor('#FFFFFF')
    .setFontSize(18)
    .setFontWeight('bold')
    .setHorizontalAlignment('center')
    .setVerticalAlignment('middle');

  sh.getRange('A3:H3').merge()
    .setValue('Professional Google Sheet Control & Summary')
    .setBackground('#EAF3FF')
    .setFontColor('#0B5ED7')
    .setFontWeight('bold')
    .setHorizontalAlignment('center');

  const metrics=[
    ['Total Users',countDataRows('USERS'),'#0B5ED7'],
    ['Active Users',countByColumnValue('USERS','Status','Active'),'#159947'],
    ['Blocked Users',countByColumnValue('USERS','Status','Blocked'),'#DC2626'],
    ['Deactivated',countByColumnValue('USERS','Status','Deactivated'),'#F59E0B'],
    ['Emails Logged',countDataRows('EMAIL_LOGS'),'#0EA5E9'],
    ['Notifications',countDataRows('NOTIFICATIONS'),'#F97316'],
    ['Open Tickets',countByColumnValue('TICKETS','Status','Open'),'#EF4444'],
    ['Resolved Tickets',countByColumnValue('TICKETS','Status','Resolved'),'#6F42C1'],
    ['Total Study Reads',sumColumnByHeader('STUDY_PROGRESS','TotalReads'),'#159947'],
    ['Achievements',countDataRows('ACHIEVEMENTS'),'#F59E0B']
  ];

  metrics.forEach(function(m,i){
    const row=5+Math.floor(i/4)*3;
    const col=1+(i%4)*2;
    sh.getRange(row,col,1,2).merge()
      .setValue(m[0])
      .setBackground('#F7F9FC')
      .setFontColor('#5A6B82')
      .setFontWeight('bold')
      .setHorizontalAlignment('center');
    sh.getRange(row+1,col,1,2).merge()
      .setValue(m[1])
      .setBackground(m[2])
      .setFontColor('#FFFFFF')
      .setFontSize(18)
      .setFontWeight('bold')
      .setHorizontalAlignment('center');
  });

  sh.getRange('A12:H12').merge()
    .setValue('Sheet Directory')
    .setBackground('#0B2A55')
    .setFontColor('#FFFFFF')
    .setFontWeight('bold')
    .setHorizontalAlignment('center');

  const names=book.getSheets().map(function(s){return s.getName();}).filter(function(n){return n!=='DASHBOARD';});
  const directory=[['Sheet Name','Rows','Columns','Last Updated']];
  names.forEach(function(name){
    const s=book.getSheetByName(name);
    directory.push([name,Math.max(0,s.getLastRow()-1),s.getLastColumn(),new Date()]);
  });
  sh.getRange(13,1,directory.length,4).setValues(directory);
  sh.getRange(13,1,1,4)
    .setBackground('#0B5ED7')
    .setFontColor('#FFFFFF')
    .setFontWeight('bold');
  if(directory.length>1){
    sh.getRange(14,4,directory.length-1,1).setNumberFormat('dd-mmm-yyyy hh:mm');
    try {
      sh.getRange(14,1,directory.length-1,4).applyRowBanding(SpreadsheetApp.BandingTheme.LIGHT_GREY,false,false);
    } catch (bandingError) {
      removeAllBandingsSafe(sh);
      sh.getRange(14,1,directory.length-1,4).applyRowBanding(SpreadsheetApp.BandingTheme.LIGHT_GREY,false,false);
    }
  }
  sh.autoResizeColumns(1,4);
  sh.setFrozenRows(3);
  sh.activate();
}

function countDataRows(sheetName) {
  const sh=ss().getSheetByName(sheetName);
  return sh?Math.max(0,sh.getLastRow()-1):0;
}

function countByColumnValue(sheetName,headerName,value) {
  const sh=ss().getSheetByName(sheetName);
  if(!sh||sh.getLastRow()<2) return 0;
  const headers=sh.getRange(1,1,1,sh.getLastColumn()).getValues()[0].map(String);
  const idx=headers.indexOf(headerName);
  if(idx<0) return 0;
  const vals=sh.getRange(2,idx+1,sh.getLastRow()-1,1).getValues();
  return vals.filter(function(r){return String(r[0])===value;}).length;
}


function sumColumnByHeader(sheetName,headerName) {
  const sh=ss().getSheetByName(sheetName);
  if(!sh||sh.getLastRow()<2) return 0;
  const headers=sh.getRange(1,1,1,sh.getLastColumn()).getValues()[0].map(String);
  const idx=headers.indexOf(headerName);
  if(idx<0) return 0;
  return sh.getRange(2,idx+1,sh.getLastRow()-1,1).getValues().reduce(function(sum,r){
    return sum+Number(r[0]||0);
  },0);
}

function performSheetMaintenance() {
  const book=ss();
  book.getSheets().forEach(function(sh){
    if(sh.getName()==='DASHBOARD') return;
    removeAllBandingsSafe(sh);
    const lastRow=sh.getLastRow();
    const maxRows=sh.getMaxRows();
    if(maxRows>lastRow+100){
      sh.deleteRows(lastRow+101,maxRows-lastRow-100);
    }
    const lastCol=sh.getLastColumn();
    const maxCols=sh.getMaxColumns();
    if(maxCols>lastCol+5){
      sh.deleteColumns(lastCol+6,maxCols-lastCol-5);
    }
    const filter=sh.getFilter();
    if(filter) filter.remove();
    if(lastRow>=1&&lastCol>=1) sh.getRange(1,1,lastRow,lastCol).createFilter();
  });
}



/* ======================================================
 * v24 STUDENT PERFORMANCE & ACHIEVEMENTS
 * ====================================================== */

function syncStudyProgress(data) {
  const s=validateSession(data.token); if(!s.success) return s;
  const email=s.email;
  const totalReads=Number(data.totalReads||0);
  const streak=Number(data.streak||0);
  const daysJSON=JSON.stringify(data.days||{});
  const badges=Array.isArray(data.badges)?data.badges:[];
  const sh=sheet(SHEETS.STUDY_PROGRESS);
  const rows=sh.getDataRange().getValues();
  let row=0;
  for(let i=1;i<rows.length;i++){
    if(String(rows[i][0]).toLowerCase().trim()===email){row=i+1;break}
  }
  if(row){
    sh.getRange(row,2,1,4).setValues([[totalReads,streak,daysJSON,new Date()]]);
  }else{
    sh.appendRow([email,totalReads,streak,daysJSON,new Date()]);
  }

  const badgeMap={
    first_read:'First Step',
    five_reads:'Focused Learner',
    twenty_reads:'Consistent Reader',
    fifty_reads:'Knowledge Seeker',
    streak_3:'3-Day Streak',
    streak_7:'7-Day Champion'
  };
  const ash=sheet(SHEETS.ACHIEVEMENTS);
  const existing=ash.getDataRange().getValues();
  badges.forEach(function(id){
    const found=existing.some(function(r,index){return index>0&&String(r[0]).toLowerCase().trim()===email&&String(r[1])===id});
    if(!found) ash.appendRow([email,id,badgeMap[id]||id,new Date()]);
  });
  return ok('Study progress synced.');
}

function adminPerformanceStats(data) {
  const a=requireAdmin(data.token); if(!a.success) return a;
  const rows=sheet(SHEETS.STUDY_PROGRESS).getDataRange().getValues();
  const users=sheet(SHEETS.USERS).getDataRange().getValues();
  const badges=sheet(SHEETS.ACHIEVEMENTS).getDataRange().getValues();
  const nameMap={};
  for(let i=1;i<users.length;i++) nameMap[String(users[i][2]).toLowerCase().trim()]=users[i][1];

  let totalReads=0,activeStreaks=0,topScore=0;
  const leaderboard=[];
  for(let i=1;i<rows.length;i++){
    const email=String(rows[i][0]).toLowerCase().trim();
    const reads=Number(rows[i][1]||0);
    const streak=Number(rows[i][2]||0);
    totalReads+=reads;
    if(streak>0) activeStreaks++;
    if(reads>topScore) topScore=reads;
    leaderboard.push({email:email,name:nameMap[email]||email,totalReads:reads,streak:streak});
  }
  leaderboard.sort(function(x,y){
    if(y.totalReads!==x.totalReads) return y.totalReads-x.totalReads;
    return y.streak-x.streak;
  });
  return {
    success:true,
    totalReads:totalReads,
    activeStreaks:activeStreaks,
    badgesAwarded:Math.max(0,badges.length-1),
    topScore:topScore,
    leaderboard:leaderboard.slice(0,10)
  };
}



/* ===== v28 Notes + Revision backend sync ===== */
function saveV28Note(data) {
  const s=validateSession(data.token); if(!s.success) return s;
  const n=data.note||{};
  if(!n.text) return fail('Note text is required.');
  sheet(SHEETS.USER_NOTES).appendRow([
    n.id||uid('NOTE'),s.email,n.title||'',n.category||'',n.text,new Date()
  ]);
  return ok('Note synced.');
}

function saveV28Revision(data) {
  const s=validateSession(data.token); if(!s.success) return s;
  const r=data.revision||{};
  if(!r.title||!r.dueDate) return fail('Revision details are required.');
  sheet(SHEETS.REVISION_QUEUE).appendRow([
    r.id||uid('REV'),s.email,r.title,r.category||'',new Date(r.dueDate),'Pending',new Date(),''
  ]);
  return ok('Revision synced.');
}



/* ===== v29.1 Professional Profile Backend ===== */
function saveV291Profile(data) {
  const s=validateSession(data.token); if(!s.success) return s;
  const p=data.profile||{};
  const sh=sheet(SHEETS.PROFILE_PRO);
  const rows=sh.getDataRange().getValues();
  let row=0;
  for(let i=1;i<rows.length;i++){
    if(String(rows[i][0]).toLowerCase().trim()===s.email){row=i+1;break;}
  }
  const values=[
    s.email,p.dob||'',p.gender||'',p.state||'',p.district||'',
    p.qualification||'',p.occupation||'',p.language||'',p.address||'',
    p.website||'',new Date()
  ];
  if(row)sh.getRange(row,1,1,values.length).setValues([values]);
  else sh.appendRow(values);
  return ok('Professional profile synced.');
}


/* ======================================================
 * v31 MOCK TEST ENGINE BACKEND
 * ====================================================== */

/* ======================================================
 * v31.2 FAST EXAM HELPERS
 * ====================================================== */

function invalidateV313QuestionCache(testId) {
  try {
    if(testId) CacheService.getScriptCache().remove('v313_questions_'+String(testId));
  } catch(e) {}
}

function invalidateV312TestCache() {
  try {
    const cache=CacheService.getScriptCache();
    cache.remove('v312_admin_tests');
    cache.remove('v312_published_tests');
  } catch(e) {}
}

function buildV312TestList(includeDrafts) {
  const testSheet=sheet(SHEETS.TESTS);
  const questionSheet=sheet(SHEETS.QUESTIONS);
  const testLast=testSheet.getLastRow();
  const questionLast=questionSheet.getLastRow();
  const tests=testLast>1?testSheet.getRange(2,1,testLast-1,10).getValues():[];
  const questions=questionLast>1?questionSheet.getRange(2,1,questionLast-1,2).getValues():[];
  const counts={};
  for(let i=0;i<questions.length;i++){
    const id=String(questions[i][1]||'').trim();
    if(id)counts[id]=(counts[id]||0)+1;
  }
  const out=[];
  for(let i=0;i<tests.length;i++){
    const status=String(tests[i][8]||'Draft').trim();
    if(includeDrafts || status==='Published'){
      const id=String(tests[i][0]||'').trim();
      out.push({
        id:id,title:String(tests[i][1]||''),category:String(tests[i][2]||''),
        description:String(tests[i][3]||''),duration:Number(tests[i][4]||10),
        positiveMarks:Number(tests[i][5]||1),negativeMarks:Number(tests[i][6]||0),
        passingMarks:Number(tests[i][7]||0),status:status,questionCount:counts[id]||0
      });
    }
  }
  return out;
}

function listPublishedTests(data) {
  const s=validateSession(data.token); if(!s.success) return s;
  const cache=CacheService.getScriptCache();
  const cached=cache.get('v312_published_tests');
  if(cached) return {success:true,tests:JSON.parse(cached)};
  const tests=buildV312TestList(false);
  cache.put('v312_published_tests',JSON.stringify(tests),120);
  return {success:true,tests:tests};
}
function getTestQuestions(data) {
  const s=validateSession(data.token); if(!s.success) return s;
  const testId=String(clean(data.testId)||'').trim();
  if(!testId) return fail('Test ID is required.');

  const cache=CacheService.getScriptCache();
  const cacheKey='v313_questions_'+testId;
  const cached=cache.get(cacheKey);
  if(cached){
    return {success:true,questions:JSON.parse(cached),cached:true};
  }

  const sh=sheet(SHEETS.QUESTIONS);
  const lastRow=sh.getLastRow();
  if(lastRow<2){
    return {success:true,questions:[]};
  }

  const rows=sh.getRange(2,1,lastRow-1,9).getValues();
  const questions=[];

  for(let i=0;i<rows.length;i++){
    if(String(rows[i][1]||'').trim()===testId){
      questions.push({
        id:String(rows[i][0]||''),
        question:String(rows[i][2]||''),
        optionA:String(rows[i][3]||''),
        optionB:String(rows[i][4]||''),
        optionC:String(rows[i][5]||''),
        optionD:String(rows[i][6]||''),
        correctOption:String(rows[i][7]||'A').trim().toUpperCase(),
        explanation:String(rows[i][8]||'')
      });
    }
  }

  cache.put(cacheKey,JSON.stringify(questions),300);
  return {success:true,questions:questions,cached:false};
}
function submitTestResult(data) {
  const s=validateSession(data.token); if(!s.success) return s;
  const r=data.result||{};
  sheet(SHEETS.TEST_RESULTS).appendRow([
    r.id||uid('RES'),s.email,r.testId||'',r.testTitle||'',r.score||0,r.maxScore||0,
    r.percentage||0,r.correct||0,r.wrong||0,r.unanswered||0,r.passed?'Yes':'No',new Date()
  ]);
  return ok('Test result saved.');
}
function adminListTests(data) {
  const a=requireAdmin(data.token); if(!a.success) return a;
  const cache=CacheService.getScriptCache();
  const cached=cache.get('v312_admin_tests');
  if(cached) return {success:true,tests:JSON.parse(cached)};
  const tests=buildV312TestList(true);
  cache.put('v312_admin_tests',JSON.stringify(tests),60);
  return {success:true,tests:tests};
}
function adminCreateTest(data) {
  const a=requireAdmin(data.token); if(!a.success) return a;
  const title=clean(data.title); if(!title) return fail('Test title required.');
  const id=uid('TEST');
  sheet(SHEETS.TESTS).appendRow([
    id,title,clean(data.category),clean(data.description),Number(data.duration||10),
    Number(data.positiveMarks||1),Number(data.negativeMarks||0),
    Number(data.passingMarks||0),'Draft',new Date()
  ]);
  invalidateV312TestCache();
  return ok('Mock test created successfully.');
}
function adminAddQuestion(data) {
  const a=requireAdmin(data.token); if(!a.success) return a;
  if(!data.testId||!data.question||!data.optionA||!data.optionB) return fail('Required question details missing.');
  sheet(SHEETS.QUESTIONS).appendRow([
    uid('Q'),clean(data.testId),clean(data.question),clean(data.optionA),clean(data.optionB),
    clean(data.optionC),clean(data.optionD),clean(data.correctOption||'A'),
    clean(data.explanation),new Date()
  ]);
  invalidateV312TestCache();
  invalidateV313QuestionCache(data.testId);
  return ok('Question added successfully.');
}
function adminUpdateTestStatus(data) {
  const a=requireAdmin(data.token); if(!a.success) return a;
  const rows=sheet(SHEETS.TESTS).getDataRange().getValues();
  for(let i=1;i<rows.length;i++){
    if(String(rows[i][0])===String(data.testId)){
      sheet(SHEETS.TESTS).getRange(i+1,9).setValue(clean(data.status||'Draft'));
      invalidateV312TestCache();
  return ok('Test status updated.');
    }
  }
  return fail('Test not found.');
}


/* ======================================================
 * v31.1 EXAM MANAGEMENT HOTFIX BACKEND
 * ====================================================== */
function adminCreateDemoTest(data) {
  const a=requireAdmin(data.token); if(!a.success) return a;
  const testId=uid('TEST');
  const testSheet=sheet(SHEETS.TESTS);
  testSheet.appendRow([
    testId,
    'Current Affairs Demo Test',
    'Current Affairs',
    'A sample test created automatically to verify the mock-test system.',
    5,1,0.25,3,'Published',new Date()
  ]);

  const qSheet=sheet(SHEETS.QUESTIONS);
  const demo=[
    ['Which institution publishes the World Economic Outlook?','World Bank','IMF','WTO','UNDP','B','The IMF publishes the World Economic Outlook.'],
    ['The Constitution of India came into force on:','15 August 1947','26 January 1950','26 November 1949','2 October 1950','B','The Constitution came into force on 26 January 1950.'],
    ['Which Article deals with equality before law?','Article 14','Article 19','Article 21','Article 32','A','Article 14 guarantees equality before law.'],
    ['The headquarters of the United Nations is located in:','Geneva','Paris','New York','Vienna','C','The UN headquarters is in New York.'],
    ['Who is known as the father of the Indian Constitution?','Mahatma Gandhi','Jawaharlal Nehru','B. R. Ambedkar','Rajendra Prasad','C','Dr. B. R. Ambedkar chaired the Drafting Committee.']
  ];
  demo.forEach(function(q){
    qSheet.appendRow([uid('Q'),testId,q[0],q[1],q[2],q[3],q[4],q[5],q[6],new Date()]);
  });
  invalidateV312TestCache();
  invalidateV313QuestionCache(testId);
  return ok('Demo test created and published successfully.');
}

function adminEditTest(data) {
  const a=requireAdmin(data.token); if(!a.success) return a;
  const sh=sheet(SHEETS.TESTS);
  const rows=sh.getDataRange().getValues();
  for(let i=1;i<rows.length;i++){
    if(String(rows[i][0])===String(data.testId)){
      if(data.title!==undefined) sh.getRange(i+1,2).setValue(clean(data.title));
      if(data.category!==undefined) sh.getRange(i+1,3).setValue(clean(data.category));
      if(data.duration!==undefined) sh.getRange(i+1,5).setValue(Number(data.duration||10));
      invalidateV312TestCache();
  return ok('Test updated successfully.');
    }
  }
  return fail('Test not found.');
}

function adminDeleteTest(data) {
  const a=requireAdmin(data.token); if(!a.success) return a;
  const testId=String(data.testId||'');
  if(!testId) return fail('Test ID required.');

  const testSheet=sheet(SHEETS.TESTS);
  const testRows=testSheet.getDataRange().getValues();
  let deleted=false;
  for(let i=testRows.length-1;i>=1;i--){
    if(String(testRows[i][0])===testId){
      testSheet.deleteRow(i+1);
      deleted=true;
    }
  }

  const questionSheet=sheet(SHEETS.QUESTIONS);
  const questionRows=questionSheet.getDataRange().getValues();
  for(let i=questionRows.length-1;i>=1;i--){
    if(String(questionRows[i][1])===testId){
      questionSheet.deleteRow(i+1);
    }
  }

  invalidateV313QuestionCache(testId);
  return deleted?ok('Test and its questions deleted.'):fail('Test not found.');
}

function hashPassword(password) { const raw=Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256,String(password)); return raw.map(function(b){return ('0'+(b&0xFF).toString(16)).slice(-2);}).join(''); }
function uid(prefix) { return prefix+'_'+new Date().getTime()+'_'+Math.floor(Math.random()*9999); }
function clean(v) { return String(v||'').trim(); }
function ok(message) { return {success:true,message}; }
function fail(message) { return {success:false,message}; }
