const CONFIG = {
  APP_NAME: 'IAS Selection Point',
  ADMIN_EMAIL: 'iasselection1@gmail.com',
  SPREADSHEET_ID: '1GfAvSSfCV2vAuTbe4_Yodjn8Y60SMTNhtog8PTpQvNs',
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
  TEST_RESULTS: 'TEST_RESULTS',
  REWARD_ACHIEVEMENTS: 'REWARD_ACHIEVEMENTS',
  SYSTEM_EMAILS: 'SYSTEM_EMAILS',
  DAILY_QUIZ_RESULTS: 'DAILY_QUIZ_RESULTS',
  USER_XP: 'USER_XP',
  REGISTRATION_PROFILES: 'REGISTRATION_PROFILES',
  VERSION_RELEASES: 'VERSION_RELEASES',
  VERSION_EMAIL_LOGS: 'VERSION_EMAIL_LOGS',
  STUDY_PLANNER: 'STUDY_PLANNER',
  STUDY_SESSIONS: 'STUDY_SESSIONS',
  PRODUCTIVITY_NOTES: 'PRODUCTIVITY_NOTES',
  CBT_TESTS: 'CBT_TESTS',
  CBT_PROGRESS: 'CBT_PROGRESS',
  CBT_RESULTS: 'CBT_RESULTS',
  USER_NOTIFICATIONS: 'USER_NOTIFICATIONS',
  USER_ACHIEVEMENTS: 'USER_ACHIEVEMENTS',
  USER_CERTIFICATES: 'USER_CERTIFICATES',
  COMMUNICATION_LOGS: 'COMMUNICATION_LOGS',
  EXAM_CATALOG: 'EXAM_CATALOG',
  EXAM_RESOURCES: 'EXAM_RESOURCES',
  EXAM_CALENDAR: 'EXAM_CALENDAR'
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
    if (action === 'unlockAchievement') return json(unlockAchievement(req));
    if (action === 'getMyAchievements') return json(getMyAchievements(req));
    if (action === 'adminAchievementReport') return json(adminAchievementReport(req));
    if (action === 'adminEmailDeliveryReport') return json(adminEmailDeliveryReport(req));
    if (action === 'emailSystemHealth') return json(emailSystemHealth(req));
    if (action === 'systemHealth') return json(systemHealth(req));
    if (action === 'getExternalJobAlerts') return json(getExternalJobAlerts(req));
    if (action === 'publishVersionRelease') return json(publishVersionRelease(req));
    if (action === 'getVersionHistory') return json(getVersionHistory(req));
    if (action === 'getLatestVersion') return json(getLatestVersion(req));
    if (action === 'createStudyTask') return json(createStudyTask(req));
    if (action === 'listStudyTasks') return json(listStudyTasks(req));
    if (action === 'updateStudyTaskStatus') return json(updateStudyTaskStatus(req));
    if (action === 'deleteStudyTask') return json(deleteStudyTask(req));
    if (action === 'logStudySession') return json(logStudySession(req));
    if (action === 'listStudySessions') return json(listStudySessions(req));
    if (action === 'saveProductivityNote') return json(saveProductivityNote(req));
    if (action === 'listProductivityNotes') return json(listProductivityNotes(req));
    if (action === 'deleteProductivityNote') return json(deleteProductivityNote(req));
    if (action === 'getProductivityAnalytics') return json(getProductivityAnalytics(req));
    if (action === 'getExamRoadmap') return json(getExamRoadmap(req));
    if (action === 'listProfessionalTests') return json(listProfessionalTests(req));
    if (action === 'getProfessionalTest') return json(getProfessionalTest(req));
    if (action === 'saveProfessionalTestProgress') return json(saveProfessionalTestProgress(req));
    if (action === 'submitProfessionalTest') return json(submitProfessionalTest(req));
    if (action === 'listProfessionalTestResults') return json(listProfessionalTestResults(req));
    if (action === 'getProfessionalTestReview') return json(getProfessionalTestReview(req));
    if (action === 'getSmartLearningDashboard') return json(getSmartLearningDashboard(req));
    if (action === 'getSmartRevisionPlan') return json(getSmartRevisionPlan(req));
    if (action === 'getStudentPerformanceReport') return json(getStudentPerformanceReport(req));
    if (action === 'listUserNotifications') return json(listUserNotifications(req));
    if (action === 'markNotificationRead') return json(markNotificationRead(req));
    if (action === 'markAllNotificationsRead') return json(markAllNotificationsRead(req));
    if (action === 'listUserCertificates') return json(listUserCertificates(req));
    if (action === 'getCommunicationDashboard') return json(getCommunicationDashboard(req));
    if (action === 'sendCommunicationAnnouncement') return json(sendCommunicationAnnouncement(req));
    if (action === 'previewCommunicationTemplate') return json(previewCommunicationTemplate(req));
    if (action === 'sendV411TestEmail') return json(sendV411TestEmail(req));
    if (action === 'sendSystemTestEmail') return json(sendSystemTestEmail(req));
    if (action === 'syncRegistrationProfile') return json(syncRegistrationProfile(req));
    if (action === 'getDailyQuiz') return json(getDailyQuiz(req));
    if (action === 'submitDailyQuiz') return json(submitDailyQuiz(req));
    if (action === 'getXpLeaderboard') return json(getXpLeaderboard(req));
    if (action === 'getMyGamification') return json(getMyGamification(req));
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
  return ContentService.createTextOutput('IAS Selection Point API v43.0.0 is running').setMimeType(ContentService.MimeType.TEXT);
}

function json(obj) { return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON); }
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
  sheet(SHEETS.PROFILES, ['Email','Name','Mobile','City','Exam','UpdatedAt','Subject','Bio']);
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
  sheet(SHEETS.REWARD_ACHIEVEMENTS, ['AchievementID','Email','Key','Title','Icon','Description','MetaJSON','UnlockedAt']);
  sheet(SHEETS.SYSTEM_EMAILS, ['EmailLogID','To','Type','Subject','Status','SentAt','Error','ReferenceKey']);
  sheet(SHEETS.DAILY_QUIZ_RESULTS, ['ResultID','Email','QuizDate','Correct','Wrong','Unanswered','Percentage','XPEarned','TimeTaken','SubmittedAt']);
  sheet(SHEETS.USER_XP, ['Email','Name','XP','Level','Streak','LastQuizDate','UpdatedAt']);
  sheet(SHEETS.REGISTRATION_PROFILES, ['Email','Name','Mobile','Qualification','TargetExam','State','District','Subject','CreatedAt','UpdatedAt']);
  sheet(SHEETS.VERSION_RELEASES, ['ReleaseID','Version','Title','ReleaseDate','WhatsNewJSON','ImprovementsJSON','BugFixesJSON','Critical','PublishedAt','PublishedBy']);
  sheet(SHEETS.VERSION_EMAIL_LOGS, ['LogID','ReleaseID','Email','Status','Error','SentAt']);
  sheet(SHEETS.STUDY_PLANNER, ['TaskID','Email','Title','Category','DueDate','Priority','PlannedMinutes','Note','Status','CreatedAt','CompletedAt']);
  sheet(SHEETS.STUDY_SESSIONS, ['SessionID','Email','Subject','DurationMinutes','SessionType','Completed','SessionDate','CreatedAt']);
  sheet(SHEETS.PRODUCTIVITY_NOTES, ['NoteID','Email','Title','Category','Body','Pinned','CreatedAt','UpdatedAt']);
  sheet(SHEETS.CBT_TESTS, ['TestID','Title','Subject','DurationMinutes','PositiveMarks','NegativeMarks','QuestionIDsJSON','Status','CreatedAt','UpdatedAt']);
  sheet(SHEETS.CBT_PROGRESS, ['ProgressID','Email','TestID','AnswersJSON','StatusJSON','CurrentIndex','SecondsRemaining','UpdatedAt']);
  sheet(SHEETS.CBT_RESULTS, ['ResultID','Email','TestID','TestTitle','Score','MaxScore','Percentage','Correct','Wrong','Unanswered','Rank','Percentile','TimeTakenSeconds','WeakTopicsJSON','AnswersJSON','SubmittedAt']);
  sheet(SHEETS.USER_NOTIFICATIONS, ['NotificationID','Email','Type','Title','Message','Read','CreatedAt']);
  sheet(SHEETS.USER_ACHIEVEMENTS, ['AchievementID','Email','Code','Title','UnlockedAt']);
  sheet(SHEETS.USER_CERTIFICATES, ['CertificateID','Email','Code','Title','IssuedAt','Status']);
  sheet(SHEETS.COMMUNICATION_LOGS, ['LogID','Email','Type','Subject','Status','Error','SentAt']);
  sheet(SHEETS.EXAM_CATALOG, ['ExamID','ExamName','Category','Description','Icon','Status','SortOrder','CreatedAt','UpdatedAt']);
  sheet(SHEETS.EXAM_RESOURCES, ['ResourceID','ExamID','Type','Title','Description','URL','BloggerLabel','Status','CreatedAt','UpdatedAt']);
  sheet(SHEETS.EXAM_CALENDAR, ['EventID','ExamID','EventType','Title','EventDate','Description','URL','Status','CreatedAt','UpdatedAt']);
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
  const name=clean(data.name);
  const email=clean(data.email).toLowerCase();
  const mobile=clean(data.mobile);
  const qualification=clean(data.qualification);
  const targetExam=clean(data.targetExam);
  const state=clean(data.state);
  const district=clean(data.district);
  const subject=clean(data.subject);
  const pass=String(data.password||'');
  const confirmPass=String(data.confirmPassword||'');

  if(!name||!email||!mobile||!qualification||!targetExam||!state||!district||!pass){
    return fail('Please complete all required registration fields.');
  }
  if(confirmPass && pass!==confirmPass) return fail('Passwords do not match');
  if(pass.length<6) return fail('Password must contain at least 6 characters');
  if(findUser(email)) return fail('Email already registered');

  const role=email===CONFIG.ADMIN_EMAIL.toLowerCase()?'Admin':'Member';
  const userId=uid('USR');
  const createdAt=new Date();

  sheet(SHEETS.USERS).appendRow([userId,name,email,mobile,hashPassword(pass),role,'Active',createdAt,'']);
  sheet(SHEETS.PROFILES).appendRow([email,name,mobile,district,targetExam,createdAt]);
  sheet(SHEETS.REGISTRATION_PROFILES).appendRow([email,name,mobile,qualification,targetExam,state,district,subject,createdAt,createdAt]);

  const welcomeResult=sendMail(email,'Welcome to IAS Selection Point',welcomeTemplate(name,email),{type:'Welcome',referenceKey:userId});
  const adminResult=sendMail(CONFIG.ADMIN_EMAIL,'New Member Signup - '+name,adminNewSignupTemplate({
    id:userId,name:name,email:email,mobile:mobile,role:role,qualification:qualification,
    targetExam:targetExam,state:state,district:district,createdAt:createdAt.toLocaleString()
  }),{type:'Admin Signup Alert',referenceKey:userId});

  const warning=!welcomeResult.sent||!adminResult.sent;
  return {
    success:true,
    message:warning?'Signup successful. Account created, but one or more emails could not be delivered.':'Signup successful. Welcome email sent. Please login now.',
    emailWarning:warning,welcomeEmailSent:welcomeResult.sent,adminEmailSent:adminResult.sent
  };
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
  const user=findUser(s.email);
  const sh=sheet(SHEETS.PROFILES);
  const rows=sh.getDataRange().getValues();

  for(let i=1;i<rows.length;i++){
    if(String(rows[i][0]).toLowerCase().trim()===s.email){
      return {
        success:true,
        profile:{
          name:rows[i][1]||user.name||'',
          mobile:rows[i][2]||user.mobile||'',
          city:rows[i][3]||'',
          exam:rows[i][4]||'',
          subject:rows[i][6]||'',
          bio:rows[i][7]||''
        }
      };
    }
  }

  return {
    success:true,
    profile:{
      name:user.name||'',
      mobile:user.mobile||'',
      city:'',
      exam:'',
      subject:'',
      bio:''
    }
  };
}

function saveProfile(data) {
  const s=validateSession(data.token); if(!s.success) return s;

  const source=data.profile||data||{};
  const email=s.email;
  const name=clean(source.name);
  const mobile=clean(source.mobile);
  const city=clean(source.city);
  const exam=clean(source.exam);
  const subject=clean(source.subject);
  const bio=clean(source.bio);

  if(!name) return fail('Full name is required.');

  const sh=sheet(SHEETS.PROFILES);
  const rows=sh.getDataRange().getValues();

  // Ensure Subject and Bio columns exist for older sheets.
  if(sh.getLastColumn()<8){
    sh.getRange(1,7,1,2).setValues([['Subject','Bio']]);
  }

  for(let i=1;i<rows.length;i++){
    if(String(rows[i][0]).toLowerCase().trim()===email){
      sh.getRange(i+1,2,1,7).setValues([[
        name,mobile,city,exam,new Date(),subject,bio
      ]]);
      updateUserBasic(email,name,mobile);
      return ok('Profile saved successfully');
    }
  }

  sh.appendRow([
    email,name,mobile,city,exam,new Date(),subject,bio
  ]);
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

function logSystemEmail(to,type,subject,status,errorText,referenceKey) {
  try {
    sheet(SHEETS.SYSTEM_EMAILS).appendRow([
      uid('EML'),to,type||'System',subject,status,new Date(),errorText||'',referenceKey||''
    ]);
  } catch(ignore) {}
}


/* ======================================================
 * v41.1 EMAIL STABILITY & QUALITY HELPERS
 * ====================================================== */
function v411EscapeHtml(value) {
  return String(value == null ? '' : value)
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;')
    .replace(/'/g,'&#39;');
}

function v411GetRecipientProfile(email) {
  const normalized = String(email || '').toLowerCase().trim();
  const fallback = {
    name: normalized ? normalized.split('@')[0] : 'Member',
    email: normalized,
    userId: '',
    registrationDate: '',
    qualification: '',
    targetExam: '',
    state: '',
    district: ''
  };

  try {
    const user = findUser(normalized);
    if (user) {
      fallback.name = user.name || fallback.name;
      fallback.userId = user.id || '';
      fallback.registrationDate = user.createdAt
        ? new Date(user.createdAt).toLocaleString()
        : '';
    }
  } catch (ignore) {}

  try {
    const sh = sheet(SHEETS.REGISTRATION_PROFILES);
    if (sh.getLastRow() >= 2) {
      const rows = sh.getRange(2, 1, sh.getLastRow() - 1, 10).getValues();
      for (let i = 0; i < rows.length; i++) {
        if (String(rows[i][0] || '').toLowerCase().trim() === normalized) {
          fallback.name = rows[i][1] || fallback.name;
          fallback.qualification = rows[i][3] || '';
          fallback.targetExam = rows[i][4] || '';
          fallback.state = rows[i][5] || '';
          fallback.district = rows[i][6] || '';
          fallback.registrationDate = rows[i][8]
            ? new Date(rows[i][8]).toLocaleString()
            : fallback.registrationDate;
          break;
        }
      }
    }
  } catch (ignore) {}

  return fallback;
}

function v411EmailFooterHtml() {
  const year = new Date().getFullYear();
  const website = CONFIG.SITE_URL || 'https://iasselectionpoint.blogspot.com/';
  const portal = CONFIG.PORTAL_URL || '';
  const privacy = website.replace(/\/?$/, '/') + 'p/privacy-policy.html';
  const terms = website.replace(/\/?$/, '/') + 'p/terms-conditions.html';
  const contact = website.replace(/\/?$/, '/') + 'p/contact-us.html';

  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
      style="margin-top:24px;border-top:1px solid #dbe7f4;">
      <tr>
        <td style="padding:20px 8px 4px;text-align:center;color:#5a6b82;font-family:Arial,Helvetica,sans-serif;">
          <div style="margin-bottom:12px;">
            <a href="${website}" style="display:inline-block;margin:4px;padding:9px 14px;border-radius:9px;background:#eef6ff;color:#0b5ed7;text-decoration:none;font-size:12px;font-weight:bold;">
              🌐 Main Website
            </a>
            <a href="${portal}" style="display:inline-block;margin:4px;padding:9px 14px;border-radius:9px;background:#eef6ff;color:#0b5ed7;text-decoration:none;font-size:12px;font-weight:bold;">
              👨‍🎓 Member Portal
            </a>
          </div>

          <p style="margin:8px 0;font-size:11px;line-height:1.7;">
            <a href="${privacy}" style="color:#475569;text-decoration:none;">Privacy Policy</a>
            &nbsp;|&nbsp;
            <a href="${terms}" style="color:#475569;text-decoration:none;">Terms &amp; Conditions</a>
            &nbsp;|&nbsp;
            <a href="${contact}" style="color:#475569;text-decoration:none;">Contact Us</a>
          </p>

          <p style="margin:8px 0 2px;font-size:12px;font-weight:bold;color:#334155;">
            © ${year} IAS Selection Point. All Rights Reserved.
          </p>
          <p style="margin:2px 0;font-size:11px;">
            Designed &amp; Developed by Satnam Kait
          </p>
          <p style="margin:10px 0 0;font-size:10px;line-height:1.6;color:#7b8798;">
            This is an automated email from IAS Selection Point.
            Please do not reply directly to this email.
          </p>
        </td>
      </tr>
    </table>`;
}

function v411PersonalizeEmail(to, htmlBody) {
  const profile = v411GetRecipientProfile(to);
  const safeName = v411EscapeHtml(profile.name || 'Member');
  const safeEmail = v411EscapeHtml(profile.email || '');

  let html = String(htmlBody || '');

  html = html
    .replace(/\{\{\s*UserName\s*\}\}/gi, safeName)
    .replace(/\{\{\s*Name\s*\}\}/gi, safeName)
    .replace(/\{\{\s*UserEmail\s*\}\}/gi, safeEmail)
    .replace(/Dear\s+Student\s*,/gi, 'Dear <b>' + safeName + '</b>,')
    .replace(/Dear\s+Member\s*,/gi, 'Dear <b>' + safeName + '</b>,')
    .replace(/Dear\s+User\s*,/gi, 'Dear <b>' + safeName + '</b>,');

  const alreadyHasGreeting =
    /Dear\s+(?:<b>)?[^,<]+(?:<\/b>)?,/i.test(html);

  if (!alreadyHasGreeting) {
    const greeting = `<p style="margin:0 0 14px;">Dear <b>${safeName}</b>,</p>`;
    const contentMarker = '<div style="font-size:15px;line-height:1.7;color:#24364f;">';
    if (html.indexOf(contentMarker) !== -1) {
      html = html.replace(contentMarker, contentMarker + greeting);
    }
  }

  const hasFinalFooter =
    html.indexOf('All Rights Reserved') !== -1 &&
    html.indexOf('Designed &amp; Developed by Satnam Kait') !== -1;

  if (!hasFinalFooter) {
    const footer = v411EmailFooterHtml();
    if (html.indexOf('</body>') !== -1) {
      html = html.replace('</body>', footer + '</body>');
    } else {
      html += footer;
    }
  }

  return html;
}

function sendMail(to,subject,body,options) {
  const opts = options || {};
  const recipient = String(to || '').toLowerCase().trim();
  const personalizedBody = v411PersonalizeEmail(recipient, body);

  try {
    MailApp.sendEmail({
      to: recipient,
      subject: subject,
      htmlBody: personalizedBody,
      name: CONFIG.APP_NAME,
      replyTo: CONFIG.ADMIN_EMAIL
    });

    try {
      sheet(SHEETS.EMAIL_LOGS).appendRow([
        recipient, subject, new Date(), 'Sent'
      ]);
    } catch (ignore) {}

    try {
      sheet(SHEETS.COMMUNICATION_LOGS).appendRow([
        uid('CML'), recipient, opts.type || 'System',
        subject, 'Sent', '', new Date()
      ]);
    } catch (ignore) {}

    logSystemEmail(
      recipient,
      opts.type || 'System',
      subject,
      'Sent',
      '',
      opts.referenceKey || ''
    );

    return {sent:true,error:''};

  } catch(e) {
    const errorText = String(e && e.message || e);

    try {
      sheet(SHEETS.EMAIL_LOGS).appendRow([
        recipient, subject, new Date(), 'Failed: ' + errorText
      ]);
    } catch (ignore) {}

    try {
      sheet(SHEETS.COMMUNICATION_LOGS).appendRow([
        uid('CML'), recipient, opts.type || 'System',
        subject, 'Failed', errorText, new Date()
      ]);
    } catch (ignore) {}

    logSystemEmail(
      recipient,
      opts.type || 'System',
      subject,
      'Failed',
      errorText,
      opts.referenceKey || ''
    );

    return {sent:false,error:errorText};
  }
}


function baseEmailTemplate(params) {
  params = params || {};

  const title = params.title || 'IAS Selection Point';
  const subtitle = params.subtitle || '';
  const body = params.body || '';
  const badge = params.badge || '';
  const badgeColor = params.badgeColor || '#0b5ed7';
  const buttonText = params.buttonText || 'Open Learning Portal';
  const buttonUrl = params.buttonUrl || CONFIG.PORTAL_URL;
  const showButton = params.showButton !== false;

  return `<!doctype html>
  <html>
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
  </head>
  <body style="margin:0;padding:0;background:#eef4fb;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
      style="width:100%;background:#eef4fb;padding:24px 10px;font-family:Arial,Helvetica,sans-serif;color:#10233f;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
            style="width:100%;max-width:620px;background:#ffffff;border:1px solid #dbe7f4;border-radius:20px;overflow:hidden;">
            <tr>
              <td style="background:#0b5ed7;padding:26px 20px;text-align:center;color:#ffffff;">
                <img src="${CONFIG.LOGO_URL}" alt="IAS Selection Point"
                  style="display:block;width:86px;height:86px;object-fit:contain;border-radius:18px;background:#ffffff;padding:6px;margin:0 auto 12px;">
                <h1 style="margin:0;font-size:25px;line-height:1.25;">IAS Selection Point</h1>
                <p style="margin:6px 0 0;font-size:13px;color:#dbeafe;">Professional Learning Portal</p>
              </td>
            </tr>

            <tr>
              <td style="padding:26px 22px;">
                ${badge ? `<div style="display:inline-block;background:${badgeColor};color:#ffffff;padding:7px 11px;border-radius:999px;font-size:11px;font-weight:bold;margin-bottom:14px;">${badge}</div>` : ''}

                <h2 style="margin:0 0 8px;font-size:23px;line-height:1.35;color:#10233f;">${title}</h2>
                ${subtitle ? `<p style="margin:0 0 18px;color:#5a6b82;font-size:14px;line-height:1.55;">${subtitle}</p>` : ''}

                <div style="font-size:14px;line-height:1.75;color:#24364f;">
                  ${body}
                </div>

                ${showButton ? `
                <div style="text-align:center;margin:26px 0 8px;">
                  <a href="${buttonUrl}"
                    style="display:inline-block;background:#0b5ed7;color:#ffffff;text-decoration:none;padding:12px 20px;border-radius:10px;font-weight:bold;font-size:13px;">
                    ${buttonText}
                  </a>
                </div>` : ''}

                ${v411EmailFooterHtml()}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>`;
}

function welcomeTemplate(name,email) {
  const profile = v411GetRecipientProfile(email);
  const displayName = name || profile.name || 'Member';

  return baseEmailTemplate({
    badge:'WELCOME',
    badgeColor:'#159947',
    title:'Welcome to IAS Selection Point',
    subtitle:'Your member account has been created successfully.',
    body:`<p>Dear <b>${v411EscapeHtml(displayName)}</b>,</p>
      <p>Welcome to IAS Selection Point Learning Portal. Your account is now active and ready to use.</p>

      <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
        style="margin:16px 0;background:#f8fbff;border:1px solid #e2eefc;border-radius:12px;">
        <tr><td style="padding:14px;">
          <p style="margin:4px 0;"><b>Registered Email:</b> ${v411EscapeHtml(email || '')}</p>
          ${profile.userId ? `<p style="margin:4px 0;"><b>User ID:</b> ${v411EscapeHtml(profile.userId)}</p>` : ''}
          ${profile.targetExam ? `<p style="margin:4px 0;"><b>Target Exam:</b> ${v411EscapeHtml(profile.targetExam)}</p>` : ''}
          ${profile.qualification ? `<p style="margin:4px 0;"><b>Qualification:</b> ${v411EscapeHtml(profile.qualification)}</p>` : ''}
          ${profile.state ? `<p style="margin:4px 0;"><b>State:</b> ${v411EscapeHtml(profile.state)}</p>` : ''}
          ${profile.district ? `<p style="margin:4px 0;"><b>District:</b> ${v411EscapeHtml(profile.district)}</p>` : ''}
        </td></tr>
      </table>

      <p>You can now access study modules, current affairs, notes, mock tests, jobs, notifications and your personalized learning dashboard.</p>`,
    buttonText:'Login to Member Portal',
    buttonUrl:CONFIG.PORTAL_URL + 'index.html'
  });
}


function adminNewSignupTemplate(user) {
  return baseEmailTemplate({
    badge:'NEW MEMBER SIGNUP',
    badgeColor:'#7c3aed',
    title:'A New Member Joined IAS Selection Point',
    subtitle:'A new account has been created on the member portal.',
    body:`<p>Dear Admin,</p>
      <p>A new user has registered successfully.</p>
      <div style="background:#f8fbff;border:1px solid #e2eefc;border-radius:14px;padding:16px;margin:16px 0;">
        <p style="margin:4px 0;"><b>Member ID:</b> ${user.id||''}</p>
        <p style="margin:4px 0;"><b>Name:</b> ${user.name||''}</p>
        <p style="margin:4px 0;"><b>Email:</b> ${user.email||''}</p>
        <p style="margin:4px 0;"><b>Mobile:</b> ${user.mobile||''}</p>
        <p style="margin:4px 0;"><b>Role:</b> ${user.role||'Member'}</p>
        <p style="margin:4px 0;"><b>Registration Time:</b> ${user.createdAt||''}</p>
      </div>
      <p>Please review the member from the Admin Panel if required.</p>`,
    buttonText:'Open Admin Panel',
    buttonUrl:CONFIG.PORTAL_URL+'admin.html'
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
    TEST_RESULTS:{tab:'#159947', header:'#116B36', widths:[20,30,20,36,14,14,14,14,14,14,12,20]},
    ACHIEVEMENTS:{tab:'#F59E0B', header:'#B66A00', widths:[20,30,20,30,12,44,40,20]},
    ACHIEVEMENT_EMAILS:{tab:'#EC4899', header:'#BE185D', widths:[20,30,22,48,14,20,50]},
    DAILY_QUIZ_RESULTS:{tab:'#7C3AED', header:'#5B21B6', widths:[20,30,18,12,12,14,14,14,14,20]},
    USER_XP:{tab:'#F59E0B', header:'#B66A00', widths:[30,26,14,18,14,18,20]}
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


/* ======================================================
 * v31.7 ACHIEVEMENT + EMAIL REWARD BACKEND
 * ====================================================== */
function achievementEmailTemplate(user, achievement, nextMilestone) {
  const portalUrl='https://officialkaitsatnam.github.io/IAS-Selection-Point-/';
  const title=achievement.title||'Achievement Unlocked';
  const icon=achievement.icon||'🏆';
  const description=achievement.description||'You completed an important learning milestone.';
  const articlesRead=achievement.meta&&achievement.meta.articlesRead?Number(achievement.meta.articlesRead):0;
  const nextText=nextMilestone
    ? 'Only '+Math.max(0,nextMilestone-articlesRead)+' more articles to reach your next milestone.'
    : 'You have completed the highest configured reading milestone.';

  return `
  <div style="margin:0;background:#eef4fb;padding:28px;font-family:Arial,sans-serif;color:#10233f">
    <div style="max-width:620px;margin:auto;background:#ffffff;border-radius:22px;overflow:hidden;box-shadow:0 18px 55px rgba(15,35,65,.15)">
      <div style="background:linear-gradient(135deg,#0B2A55,#0B5ED7);padding:24px;text-align:center;color:#fff">
        <div style="font-size:14px;font-weight:700;letter-spacing:1px">IAS SELECTION POINT</div>
        <h1 style="margin:10px 0 0;font-size:30px">Congratulations!</h1>
      </div>
      <div style="padding:30px;text-align:center">
        <div style="font-size:72px">${icon}</div>
        <h2 style="margin:10px 0 6px;color:#10233f">${title}</h2>
        <p style="margin:0 0 20px;color:#5a6b82;font-size:16px;line-height:1.6">
          Dear ${user.name||'Member'}, ${description}
        </p>
        ${articlesRead?`<div style="display:inline-block;padding:11px 18px;border-radius:999px;background:#eef6ff;color:#0B5ED7;font-weight:800">${articlesRead} Articles Read</div>`:''}
        <p style="margin:22px 0;color:#475569;line-height:1.6">${nextText}</p>
        <a href="${portalUrl}" style="display:inline-block;padding:13px 22px;border-radius:12px;background:#0B5ED7;color:#fff;text-decoration:none;font-weight:800">Continue Learning</a>
      </div>
      <div style="padding:18px;text-align:center;background:#f8fbff;color:#64748b;font-size:12px">
        Keep learning, keep growing.<br>IAS Selection Point
      </div>
    </div>
  </div>`;
}

function nextAchievementMilestone(key) {
  const order=['READ_10','READ_20','READ_30','READ_50','READ_100'];
  const counts=[10,20,30,50,100];
  const index=order.indexOf(String(key||''));
  return index>=0&&index<counts.length-1?counts[index+1]:null;
}


function unlockAchievement(data) {
  const s=validateSession(data.token); if(!s.success) return s;
  const achievement=data.achievement||{};
  const key=clean(achievement.key);
  if(!key) return fail('Achievement key is required.');

  const sh=sheet(SHEETS.REWARD_ACHIEVEMENTS);
  const lastRow=sh.getLastRow();

  if(lastRow>=2){
    const rows=sh.getRange(2,1,lastRow-1,8).getValues();
    for(let i=0;i<rows.length;i++){
      if(String(rows[i][1]).toLowerCase()===s.email && String(rows[i][2])===key){
        return {success:true,message:'Achievement already unlocked.',duplicate:true,emailSent:false};
      }
    }
  }

  const id=uid('ACH');
  sh.appendRow([
    id,s.email,key,achievement.title||key,achievement.icon||'🏆',
    achievement.description||'',JSON.stringify(achievement.meta||{}),new Date()
  ]);

  const user=findUser(s.email)||{name:s.email.split('@')[0],email:s.email};
  const subject='Congratulations! '+(achievement.title||'Achievement Unlocked')+' - IAS Selection Point';

  const emailResult=sendMail(
    s.email,
    subject,
    achievementEmailTemplate(
      {name:user.name||'Member'},
      achievement,
      nextAchievementMilestone(key)
    ),
    {type:'Achievement',referenceKey:key}
  );

  return {
    success:true,
    message:emailResult.sent
      ?'Achievement unlocked and congratulations email sent.'
      :'Achievement unlocked, but email delivery failed.',
    emailSent:emailResult.sent,
    emailError:emailResult.error||''
  };
}

function getMyAchievements(data) {
  const s=validateSession(data.token); if(!s.success) return s;
  const sh=sheet(SHEETS.REWARD_ACHIEVEMENTS);
  const lastRow=sh.getLastRow();
  if(lastRow<2) return {success:true,achievements:[]};

  const rows=sh.getRange(2,1,lastRow-1,8).getValues();
  const out=[];
  for(let i=rows.length-1;i>=0;i--){
    if(String(rows[i][1]).toLowerCase()===s.email){
      let meta={};
      try{meta=JSON.parse(rows[i][6]||'{}')}catch(e){}
      out.push({
        id:rows[i][0],key:rows[i][2],title:rows[i][3],icon:rows[i][4],
        description:rows[i][5],meta:meta,
        unlockedAt:new Date(rows[i][7]).toISOString()
      });
    }
  }
  return {success:true,achievements:out};
}

function adminAchievementReport(data) {
  const a=requireAdmin(data.token); if(!a.success) return a;
  const achievementSheet=sheet(SHEETS.REWARD_ACHIEVEMENTS);
  const emailSheet=sheet(SHEETS.SYSTEM_EMAILS);

  const aRows=achievementSheet.getLastRow()>=2
    ?achievementSheet.getRange(2,1,achievementSheet.getLastRow()-1,8).getValues():[];
  const eRows=emailSheet.getLastRow()>=2
    ?emailSheet.getRange(2,1,emailSheet.getLastRow()-1,8).getValues():[];

  const emailStatus={};
  let sent=0;
  eRows.forEach(r=>{
    const type=String(r[2]||'');
    const reference=String(r[7]||'');
    if(type==='Achievement'){
      emailStatus[String(r[1]).toLowerCase()+'|'+reference]=String(r[4]);
      if(String(r[4])==='Sent')sent++;
    }
  });

  const users={};
  const rows=aRows.slice().reverse().slice(0,200).map(r=>{
    users[String(r[1]).toLowerCase()]=true;
    return {
      email:r[1],key:r[2],title:r[3],icon:r[4],
      unlockedAt:new Date(r[7]).toLocaleString(),
      emailStatus:emailStatus[String(r[1]).toLowerCase()+'|'+String(r[2])]||'Unknown'
    };
  });

  return {
    success:true,total:aRows.length,emailsSent:sent,
    users:Object.keys(users).length,rows:rows
  };
}

function adminEmailDeliveryReport(data) {
  const a=requireAdmin(data.token); if(!a.success) return a;
  const sh=sheet(SHEETS.SYSTEM_EMAILS);
  const lastRow=sh.getLastRow();
  if(lastRow<2){
    return {success:true,total:0,sent:0,failed:0,welcome:0,rows:[]};
  }

  const values=sh.getRange(2,1,lastRow-1,8).getValues();
  let sent=0,failed=0,welcome=0;

  values.forEach(r=>{
    const status=String(r[4]||'');
    const type=String(r[2]||'');
    if(status==='Sent')sent++;
    if(status==='Failed')failed++;
    if(type==='Welcome')welcome++;
  });

  const rows=values.slice().reverse().slice(0,150).map(r=>({
    to:String(r[1]||''),
    type:String(r[2]||'System'),
    subject:String(r[3]||''),
    status:String(r[4]||'Unknown'),
    sentAt:r[5]?new Date(r[5]).toLocaleString():'',
    error:String(r[6]||'')
  }));

  return {
    success:true,total:values.length,sent:sent,failed:failed,
    welcome:welcome,rows:rows
  };
}



function emailSystemHealth(data) {
  const a=requireAdmin(data.token); if(!a.success) return a;
  let remaining=0,ready=true,note='MailApp authorization and quota appear available.';
  try { remaining=MailApp.getRemainingDailyQuota(); if(remaining<=0){ready=false;note='Daily email quota is exhausted.';} } catch(e){ready=false;note='MailApp permission missing: '+String(e&&e.message||e);}
  let recentFailed=0; try{const sh=sheet(SHEETS.SYSTEM_EMAILS),last=sh.getLastRow();if(last>=2){const start=Math.max(2,last-49),rows=sh.getRange(start,1,last-start+1,8).getValues();recentFailed=rows.filter(r=>String(r[4])==='Failed').length;}}catch(e){}
  return {success:true,ready:ready,remainingQuota:remaining,recentFailed:recentFailed,note:note};
}


/* ======================================================
 * v33 DAILY QUIZ + XP + LEADERBOARD BACKEND
 * ====================================================== */
function v33TodayKey() {
  return Utilities.formatDate(new Date(), Session.getScriptTimeZone()||'Asia/Kolkata', 'yyyy-MM-dd');
}
function v33Level(xp) {
  xp=Number(xp||0);
  if(xp>=2000) return 'Master';
  if(xp>=1000) return 'Expert';
  if(xp>=500) return 'Advanced';
  if(xp>=200) return 'Learner';
  return 'Beginner';
}
function v33UserXp(email) {
  const sh=sheet(SHEETS.USER_XP);
  const last=sh.getLastRow();
  if(last>=2){
    const rows=sh.getRange(2,1,last-1,7).getValues();
    for(let i=0;i<rows.length;i++){
      if(String(rows[i][0]).toLowerCase()===String(email).toLowerCase()){
        return {row:i+2,email:rows[i][0],name:rows[i][1],xp:Number(rows[i][2]||0),level:rows[i][3]||'Beginner',streak:Number(rows[i][4]||0),lastQuizDate:String(rows[i][5]||'')};
      }
    }
  }
  return null;
}
function v33SaveUserXp(email,name,xp,streak,lastQuizDate) {
  const sh=sheet(SHEETS.USER_XP);
  const existing=v33UserXp(email);
  const row=[email,name||email.split('@')[0],xp,v33Level(xp),streak,lastQuizDate,new Date()];
  if(existing) sh.getRange(existing.row,1,1,7).setValues([row]);
  else sh.appendRow(row);
}
function v33DeterministicShuffle(rows,seed) {
  const copy=rows.slice();
  let value=0;
  for(let i=0;i<seed.length;i++) value=(value*31+seed.charCodeAt(i))>>>0;
  for(let i=copy.length-1;i>0;i--){
    value=(value*1664525+1013904223)>>>0;
    const j=value%(i+1);
    const temp=copy[i];copy[i]=copy[j];copy[j]=temp;
  }
  return copy;
}
function getDailyQuiz(data) {
  const s=validateSession(data.token); if(!s.success) return s;
  const sh=sheet(SHEETS.QUESTIONS);
  const last=sh.getLastRow();
  if(last<2) return {success:true,quizDate:v33TodayKey(),questions:[]};

  const rows=sh.getRange(2,1,last-1,9).getValues().filter(r=>String(r[2]||'').trim());
  const selected=v33DeterministicShuffle(rows,v33TodayKey()).slice(0,10);
  const questions=selected.map(r=>({
    id:String(r[0]),question:String(r[2]),optionA:String(r[3]),optionB:String(r[4]),
    optionC:String(r[5]),optionD:String(r[6])
  }));
  return {success:true,quizDate:v33TodayKey(),questions:questions};
}
function submitDailyQuiz(data) {
  const s=validateSession(data.token); if(!s.success) return s;
  const quizDate=String(data.quizDate||v33TodayKey());
  const resultSheet=sheet(SHEETS.DAILY_QUIZ_RESULTS);

  const last=resultSheet.getLastRow();
  if(last>=2){
    const rows=resultSheet.getRange(2,1,last-1,10).getValues();
    for(let i=0;i<rows.length;i++){
      if(String(rows[i][1]).toLowerCase()===s.email && String(rows[i][2])===quizDate){
        return fail('Today’s Daily Quiz has already been submitted.');
      }
    }
  }

  const questionSheet=sheet(SHEETS.QUESTIONS);
  const qLast=questionSheet.getLastRow();
  const all=qLast>=2?questionSheet.getRange(2,1,qLast-1,9).getValues().filter(r=>String(r[2]||'').trim()):[];
  const selected=v33DeterministicShuffle(all,quizDate).slice(0,10);
  const answers=data.answers||{};
  let correct=0,wrong=0,unanswered=0;

  selected.forEach(r=>{
    const id=String(r[0]);
    const answer=String(answers[id]||'').toUpperCase();
    const correctOption=String(r[7]||'A').toUpperCase();
    if(!answer)unanswered++;
    else if(answer===correctOption)correct++;
    else wrong++;
  });

  const total=selected.length||1;
  const percentage=Math.round(correct/total*100);
  const xpEarned=20+(correct*10);
  const user=findUser(s.email)||{name:s.email.split('@')[0]};
  const current=v33UserXp(s.email)||{xp:0,streak:0,lastQuizDate:''};

  let streak=1;
  if(current.lastQuizDate){
    const previous=new Date(current.lastQuizDate+'T00:00:00');
    const today=new Date(quizDate+'T00:00:00');
    const diff=Math.round((today-previous)/86400000);
    if(diff===1)streak=Number(current.streak||0)+1;
    else if(diff===0)streak=Number(current.streak||1);
  }

  const totalXp=Number(current.xp||0)+xpEarned;
  v33SaveUserXp(s.email,user.name,totalXp,streak,quizDate);

  resultSheet.appendRow([
    uid('DQR'),s.email,quizDate,correct,wrong,unanswered,percentage,xpEarned,
    Number(data.timeTaken||0),new Date()
  ]);

  return {
    success:true,message:'Daily Quiz submitted successfully.',
    correct:correct,wrong:wrong,unanswered:unanswered,percentage:percentage,
    xpEarned:xpEarned,totalXp:totalXp,streak:streak,level:v33Level(totalXp)
  };
}
function getMyGamification(data) {
  const s=validateSession(data.token); if(!s.success) return s;
  const current=v33UserXp(s.email)||{xp:0,streak:0};
  return {success:true,xp:current.xp||0,streak:current.streak||0,level:v33Level(current.xp||0)};
}
function getXpLeaderboard(data) {
  const s=validateSession(data.token); if(!s.success) return s;
  const sh=sheet(SHEETS.USER_XP);
  const last=sh.getLastRow();
  const rows=last>=2?sh.getRange(2,1,last-1,7).getValues():[];
  const sorted=rows.map(r=>({
    email:String(r[0]),name:String(r[1]),xp:Number(r[2]||0),
    level:String(r[3]||v33Level(r[2])),streak:Number(r[4]||0)
  })).sort((a,b)=>b.xp-a.xp||b.streak-a.streak);

  const myIndex=sorted.findIndex(x=>x.email.toLowerCase()===s.email);
  const mine=myIndex>=0?sorted[myIndex]:{xp:0,streak:0,level:'Beginner'};
  return {
    success:true,
    leaderboard:sorted.slice(0,50),
    myRank:myIndex>=0?myIndex+1:0,
    myXp:mine.xp,myStreak:mine.streak,myLevel:mine.level
  };
}


/* ======================================================
 * v36 ENTERPRISE CORE STABILITY BACKEND
 * ====================================================== */
function systemHealth(data) {
  const s=validateSession(data.token);
  if(!s.success) return s;

  let spreadsheetReady=false;
  let profileReady=false;
  let emailQuota=0;

  try {
    spreadsheetReady=Boolean(SpreadsheetApp.getActiveSpreadsheet());
  } catch(e) {}

  try {
    profileReady=Boolean(findUser(s.email));
  } catch(e) {}

  try {
    emailQuota=MailApp.getRemainingDailyQuota();
  } catch(e) {}

  return {
    success:true,
    status:'Operational',
    version:'v36',
    spreadsheetReady:spreadsheetReady,
    profileReady:profileReady,
    emailQuota:emailQuota,
    checkedAt:new Date().toISOString()
  };
}

function sendSystemTestEmail(data) {
  const a=requireAdmin(data.token); if(!a.success) return a;

  const subject='IAS Selection Point — Email System Test';
  const body=baseEmailTemplate({
    badge:'SYSTEM TEST',
    badgeColor:'#0B5ED7',
    title:'Email Delivery Is Working',
    subtitle:'The IAS Selection Point enterprise email system completed a successful test.',
    body:`<p>Dear Administrator,</p>
      <p>This message confirms that the portal can send professional system emails successfully.</p>
      <p><b>Test Time:</b> ${new Date().toLocaleString()}</p>`,
    buttonText:'Open Admin Panel',
    buttonUrl:CONFIG.PORTAL_URL+'admin.html'
  });

  const result=sendMail(
    CONFIG.ADMIN_EMAIL,
    subject,
    body,
    {type:'System Test',referenceKey:uid('TEST')}
  );

  if(!result.sent){
    return fail('Test email failed: '+(result.error||'Unknown error'));
  }

  return ok('Test email sent successfully.');
}

function syncRegistrationProfile(data) {
  const s=validateSession(data.token); if(!s.success) return s;

  const registrationSheet=sheet(SHEETS.REGISTRATION_PROFILES);
  const profileSheet=sheet(SHEETS.PROFILES);
  const registrationRows=registrationSheet.getDataRange().getValues();
  const profileRows=profileSheet.getDataRange().getValues();

  let registration=null;
  for(let i=1;i<registrationRows.length;i++){
    if(String(registrationRows[i][0]).toLowerCase().trim()===s.email){
      registration=registrationRows[i];
      break;
    }
  }
  if(!registration) return {success:true,message:'No registration profile found.',synced:false};

  let profileRow=0;
  for(let i=1;i<profileRows.length;i++){
    if(String(profileRows[i][0]).toLowerCase().trim()===s.email){
      profileRow=i+1;
      break;
    }
  }

  const regName=registration[1]||'';
  const regMobile=registration[2]||'';
  const regExam=registration[4]||'';
  const regDistrict=registration[6]||'';
  const regSubject=registration[7]||'';

  if(profileSheet.getLastColumn()<8){
    profileSheet.getRange(1,7,1,2).setValues([['Subject','Bio']]);
  }

  if(profileRow){
    const current=profileSheet.getRange(profileRow,1,1,8).getValues()[0];
    const merged=[
      s.email,
      current[1]||regName,
      current[2]||regMobile,
      current[3]||regDistrict,
      current[4]||regExam,
      new Date(),
      current[6]||regSubject,
      current[7]||''
    ];
    profileSheet.getRange(profileRow,1,1,8).setValues([merged]);
  }else{
    profileSheet.appendRow([
      s.email,regName,regMobile,regDistrict,regExam,new Date(),regSubject,''
    ]);
  }

  return {success:true,message:'Registration profile synchronized.',synced:true};
}


/* ======================================================
 * v37 EXTERNAL JOB ALERT AGGREGATOR
 * ====================================================== */
function v37CleanHtmlText(value) {
  return String(value||'')
    .replace(/<[^>]+>/g,' ')
    .replace(/&nbsp;/gi,' ')
    .replace(/&amp;/gi,'&')
    .replace(/&#8211;|&ndash;/gi,'-')
    .replace(/&#8217;|&rsquo;/gi,"'")
    .replace(/&quot;/gi,'"')
    .replace(/\s+/g,' ')
    .trim();
}

function v37AbsoluteUrl(url,base) {
  const value=String(url||'').trim();
  if(/^https?:\/\//i.test(value)) return value;
  if(value.indexOf('//')===0) return 'https:'+value;
  if(value.indexOf('/')===0) return base.replace(/\/$/,'')+value;
  return base.replace(/\/$/,'')+'/'+value.replace(/^\//,'');
}

function v37ClassifyJob(title,url) {
  const text=(String(title||'')+' '+String(url||'')).toLowerCase();
  if(/answer key|response sheet/.test(text)) return 'answer-key';
  if(/result|merit list|cut.?off|written marks/.test(text)) return 'result';
  if(/admit card|hall ticket|call letter|application status/.test(text)) return 'admit-card';
  if(/haryana|hssc|hpsc|gurugram|hisar|rohtak|panipat|karnal|ambala/.test(text)) return 'haryana';
  return 'latest';
}

function v37ExtractOrganization(title) {
  const clean=v37CleanHtmlText(title);
  const match=clean.match(/^([A-Z][A-Z0-9\-\.]{1,18}|[A-Za-z]+(?:\s+[A-Za-z]+){0,2})\s+/);
  return match?match[1]:'Government Recruitment';
}

function v37FetchFreeJobAlertRows() {
  const sourceUrl='https://www.freejobalert.com/';
  const response=UrlFetchApp.fetch(sourceUrl,{
    muteHttpExceptions:true,
    followRedirects:true,
    headers:{
      'User-Agent':'Mozilla/5.0 (compatible; IASSelectionPoint/1.0; +https://officialkaitsatnam.github.io/IAS-Selection-Point-/)'
    }
  });

  const status=response.getResponseCode();
  if(status<200||status>=400){
    throw new Error('Source returned HTTP '+status);
  }

  const html=response.getContentText();
  const anchorRegex=/<a\b[^>]*href=["']([^"'#]+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  const rows=[];
  const seen={};
  let match;

  while((match=anchorRegex.exec(html))!==null && rows.length<120){
    const url=v37AbsoluteUrl(match[1],sourceUrl);
    const title=v37CleanHtmlText(match[2]);

    if(!title||title.length<12||title.length>180) continue;
    if(!/^https:\/\/(www\.)?freejobalert\.com\//i.test(url)) continue;
    if(/^(home|view all|education|games|search jobs|contact us|policy)$/i.test(title)) continue;
    if(!/(online form|offline form|recruitment|vacan|admit card|result|answer key|application status|merit list|notification|walkin|exam date|syllabus)/i.test(title)) continue;

    const key=url.toLowerCase();
    if(seen[key]) continue;
    seen[key]=true;

    rows.push({
      title:title,
      url:url,
      category:v37ClassifyJob(title,url),
      organization:v37ExtractOrganization(title),
      source:'FreeJobAlert',
      date:'Latest update'
    });
  }

  return rows.slice(0,60);
}


/* ======================================================
 * v37.1 EXTERNAL JOB FETCH AUTHORIZATION FIX
 * Run authorizeExternalJobFetch() once from Apps Script.
 * ====================================================== */
function authorizeExternalJobFetch() {
  try {
    const response = UrlFetchApp.fetch('https://www.freejobalert.com/', {
      muteHttpExceptions: true,
      followRedirects: true,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; IASSelectionPoint/1.0; +https://officialkaitsatnam.github.io/IAS-Selection-Point-/)'
      }
    });

    const statusCode = response.getResponseCode();
    Logger.log('HTTP Status: ' + statusCode);
    Logger.log('External request permission granted successfully.');

    return {
      success: statusCode >= 200 && statusCode < 400,
      statusCode: statusCode,
      message: statusCode >= 200 && statusCode < 400
        ? 'External request permission granted successfully.'
        : 'The source returned HTTP ' + statusCode + '.'
    };
  } catch (error) {
    Logger.log('Authorization error: ' + String(error && error.message || error));
    throw error;
  }
}

function getExternalJobAlerts(data) {
  data = data || {};

  /*
   * When this function is run directly from the Apps Script editor,
   * there is no portal token. In that situation, perform only the
   * external-request authorization test instead of reading data.token.
   */
  if (!data.token) {
    try {
      const test = authorizeExternalJobFetch();

      return {
        success: Boolean(test.success),
        authorizationTest: true,
        message: test.message,
        statusCode: test.statusCode,
        rows: []
      };
    } catch (error) {
      return fail(
        'External request authorization failed: ' +
        String(error && error.message ? error.message : error)
      );
    }
  }

  // Normal portal request: validate the logged-in session.
  const session = validateSession(data.token);
  if (!session.success) return session;

  const cache = CacheService.getScriptCache();
  const cacheKey = 'v37_freejobalert_rows';
  const forceRefresh = Boolean(data.forceRefresh);

  if (!forceRefresh) {
    const cached = cache.get(cacheKey);

    if (cached) {
      try {
        return {
          success: true,
          rows: JSON.parse(cached),
          cached: true,
          source: 'FreeJobAlert',
          fetchedAt: new Date().toISOString()
        };
      } catch (ignore) {}
    }
  }

  try {
    const rows = v37FetchFreeJobAlertRows();

    if (!rows || !rows.length) {
      return fail(
        'The source website is available, but no compatible job listings were found.'
      );
    }

    cache.put(cacheKey, JSON.stringify(rows), 900);

    return {
      success: true,
      rows: rows,
      cached: false,
      source: 'FreeJobAlert',
      fetchedAt: new Date().toISOString()
    };

  } catch (error) {
    const cached = cache.get(cacheKey);

    if (cached) {
      try {
        return {
          success: true,
          rows: JSON.parse(cached),
          cached: true,
          stale: true,
          source: 'FreeJobAlert',
          message: 'Live refresh failed. Showing previously cached listings.'
        };
      } catch (ignore) {}
    }

    return fail(
      'External job source is temporarily unavailable: ' +
      String(error && error.message ? error.message : error)
    );
  }
}


/* ======================================================
 * v38 VERSION MANAGEMENT BACKEND
 * ====================================================== */
function v38Json(value, fallback) {
  try { return JSON.parse(value||''); } catch(e) { return fallback||[]; }
}
function v38ReleaseEmailTemplate(release) {
  const sections=[];
  function list(title,items){
    if(!items||!items.length)return '';
    return `<div style="margin:14px 0;padding:14px;border:1px solid #e2eefc;border-radius:14px;background:#f8fbff;">
      <h3 style="margin:0 0 8px;color:#10233f;font-size:16px;">${title}</h3>
      <ul style="margin:0;padding-left:20px;color:#475569;">${items.map(x=>`<li style="margin:5px 0;">${x}</li>`).join('')}</ul>
    </div>`;
  }
  return baseEmailTemplate({
    badge:'NEW VERSION',
    badgeColor:'#7c3aed',
    title:release.version+' Is Now Available',
    subtitle:release.title,
    body:`<p>Dear Member,</p>
      <p>A new version of IAS Selection Point has been released.</p>
      <p><b>Release Date:</b> ${release.releaseDate||''}</p>
      ${list("What's New",release.whatsNew)}
      ${list("Improvements",release.improvements)}
      ${list("Bug Fixes",release.bugFixes)}
      <p>Please open the portal and refresh the application to use the latest version.</p>`,
    buttonText:'Open IAS Selection Point',
    buttonUrl:CONFIG.PORTAL_URL+'index.html'
  });
}
function publishVersionRelease(data) {
  const a=requireAdmin(data.token); if(!a.success) return a;

  const version=clean(data.version);
  const title=clean(data.title);
  if(!version||!title) return fail('Version number and release title are required.');

  const releaseId=uid('REL');
  const release={
    id:releaseId,
    version:version,
    title:title,
    releaseDate:clean(data.releaseDate)||Utilities.formatDate(new Date(),Session.getScriptTimeZone(),'yyyy-MM-dd'),
    whatsNew:Array.isArray(data.whatsNew)?data.whatsNew:[],
    improvements:Array.isArray(data.improvements)?data.improvements:[],
    bugFixes:Array.isArray(data.bugFixes)?data.bugFixes:[],
    critical:Boolean(data.critical),
    publishedAt:new Date(),
    publishedBy:a.email
  };

  sheet(SHEETS.VERSION_RELEASES).appendRow([
    releaseId,release.version,release.title,release.releaseDate,
    JSON.stringify(release.whatsNew),JSON.stringify(release.improvements),
    JSON.stringify(release.bugFixes),release.critical?'Yes':'No',
    release.publishedAt,release.publishedBy
  ]);

  let sent=0,failed=0;
  if(Boolean(data.sendEmails)){
    const usersSheet=sheet(SHEETS.USERS);
    const rows=usersSheet.getLastRow()>=2
      ?usersSheet.getRange(2,1,usersSheet.getLastRow()-1,9).getValues():[];
    const unique={};
    rows.forEach(r=>{
      const email=String(r[2]||'').toLowerCase().trim();
      const status=String(r[6]||'Active');
      if(email&&status!=='Blocked')unique[email]=true;
    });

    const subject='IAS Selection Point '+release.version+' Is Now Available';
    const html=v38ReleaseEmailTemplate(release);

    Object.keys(unique).forEach(email=>{
      const result=sendMail(email,subject,html,{type:'Version Release',referenceKey:releaseId});
      sheet(SHEETS.VERSION_EMAIL_LOGS).appendRow([
        uid('VEL'),releaseId,email,result.sent?'Sent':'Failed',result.error||'',new Date()
      ]);
      if(result.sent)sent++; else failed++;
    });

    const adminHtml=baseEmailTemplate({
      badge:'RELEASE REPORT',
      badgeColor:'#0B5ED7',
      title:'Version Publication Completed',
      subtitle:release.version+' — '+release.title,
      body:`<p><b>Total Sent:</b> ${sent}</p><p><b>Failed:</b> ${failed}</p><p><b>Published At:</b> ${new Date().toLocaleString()}</p>`,
      buttonText:'Open Admin Panel',
      buttonUrl:CONFIG.PORTAL_URL+'admin.html'
    });
    sendMail(CONFIG.ADMIN_EMAIL,'Release Report — '+release.version,adminHtml,{type:'Version Admin Report',referenceKey:releaseId});
  }

  return {
    success:true,
    message:'Version published successfully. Emails sent: '+sent+', failed: '+failed+'.',
    releaseId:releaseId,
    sent:sent,
    failed:failed
  };
}
function getVersionHistory(data) {
  const s=validateSession(data.token); if(!s.success) return s;
  const sh=sheet(SHEETS.VERSION_RELEASES);
  const last=sh.getLastRow();
  if(last<2)return {success:true,rows:[]};
  const rows=sh.getRange(2,1,last-1,10).getValues().slice().reverse().map(r=>({
    id:r[0],version:r[1],title:r[2],releaseDate:r[3],
    whatsNew:v38Json(r[4],[]),improvements:v38Json(r[5],[]),bugFixes:v38Json(r[6],[]),
    critical:String(r[7])==='Yes',publishedAt:r[8],publishedBy:r[9]
  }));
  return {success:true,rows:rows};
}
function getLatestVersion(data) {
  const s=validateSession(data.token); if(!s.success) return s;
  const history=getVersionHistory(data);
  if(!history.success||!history.rows.length)return {success:true,updateAvailable:false};
  const latest=history.rows[0];
  const current=String(data.currentVersion||'');
  return {
    success:true,
    updateAvailable:latest.version!==current,
    release:latest
  };
}


/* ======================================================
 * v39 STUDENT PRODUCTIVITY SUITE BACKEND
 * ====================================================== */
function v39DateKey(value) {
  if(!value) return '';
  if(value instanceof Date) return Utilities.formatDate(value,Session.getScriptTimeZone()||'Asia/Kolkata','yyyy-MM-dd');
  return String(value).slice(0,10);
}
function createStudyTask(data) {
  const s=validateSession(data.token); if(!s.success) return s;
  const title=clean(data.title);
  if(!title) return fail('Task title is required.');
  sheet(SHEETS.STUDY_PLANNER).appendRow([
    uid('TSK'),s.email,title,clean(data.category)||'General Study',
    clean(data.dueDate)||Utilities.formatDate(new Date(),Session.getScriptTimeZone(),'yyyy-MM-dd'),
    clean(data.priority)||'Medium',Number(data.plannedMinutes||30),
    clean(data.note),'Pending',new Date(),''
  ]);
  return ok('Study task added successfully.');
}
function listStudyTasks(data) {
  const s=validateSession(data.token); if(!s.success) return s;
  const sh=sheet(SHEETS.STUDY_PLANNER);
  const rows=sh.getLastRow()>=2?sh.getRange(2,1,sh.getLastRow()-1,11).getValues():[];
  const out=rows.filter(r=>String(r[1]).toLowerCase()===s.email).map(r=>({
    id:r[0],title:r[2],category:r[3],dueDate:v39DateKey(r[4]),priority:r[5],
    plannedMinutes:Number(r[6]||0),note:r[7],status:r[8],
    createdAt:r[9]?new Date(r[9]).toLocaleString():''
  })).sort((a,b)=>String(a.dueDate).localeCompare(String(b.dueDate)));
  return {success:true,rows:out};
}
function updateStudyTaskStatus(data) {
  const s=validateSession(data.token); if(!s.success) return s;
  const sh=sheet(SHEETS.STUDY_PLANNER);
  const rows=sh.getLastRow()>=2?sh.getRange(2,1,sh.getLastRow()-1,11).getValues():[];
  for(let i=0;i<rows.length;i++){
    if(String(rows[i][0])===String(data.id)&&String(rows[i][1]).toLowerCase()===s.email){
      const status=clean(data.status)==='Completed'?'Completed':'Pending';
      sh.getRange(i+2,9).setValue(status);
      sh.getRange(i+2,11).setValue(status==='Completed'?new Date():'');
      return ok('Task status updated.');
    }
  }
  return fail('Study task not found.');
}
function deleteStudyTask(data) {
  const s=validateSession(data.token); if(!s.success) return s;
  const sh=sheet(SHEETS.STUDY_PLANNER);
  const rows=sh.getLastRow()>=2?sh.getRange(2,1,sh.getLastRow()-1,11).getValues():[];
  for(let i=rows.length-1;i>=0;i--){
    if(String(rows[i][0])===String(data.id)&&String(rows[i][1]).toLowerCase()===s.email){
      sh.deleteRow(i+2);
      return ok('Study task deleted.');
    }
  }
  return fail('Study task not found.');
}
function logStudySession(data) {
  const s=validateSession(data.token); if(!s.success) return s;
  sheet(SHEETS.STUDY_SESSIONS).appendRow([
    uid('SES'),s.email,clean(data.subject)||'Focused Study',
    Number(data.durationMinutes||0),clean(data.sessionType)||'Focus',
    Boolean(data.completed)?'Yes':'No',
    Utilities.formatDate(new Date(),Session.getScriptTimeZone(),'yyyy-MM-dd'),
    new Date()
  ]);
  return ok('Study session recorded.');
}
function listStudySessions(data) {
  const s=validateSession(data.token); if(!s.success) return s;
  const sh=sheet(SHEETS.STUDY_SESSIONS);
  const rows=sh.getLastRow()>=2?sh.getRange(2,1,sh.getLastRow()-1,8).getValues():[];
  const out=rows.filter(r=>String(r[1]).toLowerCase()===s.email).map(r=>({
    id:r[0],subject:r[2],durationMinutes:Number(r[3]||0),sessionType:r[4],
    completed:String(r[5])==='Yes',sessionDate:v39DateKey(r[6]),
    createdAt:r[7]?new Date(r[7]).toLocaleString():''
  })).reverse();
  return {success:true,rows:out};
}
function saveProductivityNote(data) {
  const s=validateSession(data.token); if(!s.success) return s;
  const title=clean(data.title), body=clean(data.body);
  if(!title||!body) return fail('Note title and content are required.');
  sheet(SHEETS.PRODUCTIVITY_NOTES).appendRow([
    uid('PNT'),s.email,title,clean(data.category)||'General',body,
    Boolean(data.pinned)?'Yes':'No',new Date(),new Date()
  ]);
  return ok('Note saved successfully.');
}
function listProductivityNotes(data) {
  const s=validateSession(data.token); if(!s.success) return s;
  const sh=sheet(SHEETS.PRODUCTIVITY_NOTES);
  const rows=sh.getLastRow()>=2?sh.getRange(2,1,sh.getLastRow()-1,8).getValues():[];
  const out=rows.filter(r=>String(r[1]).toLowerCase()===s.email).map(r=>({
    id:r[0],title:r[2],category:r[3],body:r[4],pinned:String(r[5])==='Yes',
    createdAt:r[6]?new Date(r[6]).toLocaleString():'',
    updatedAt:r[7]?new Date(r[7]).toLocaleString():''
  })).sort((a,b)=>Number(b.pinned)-Number(a.pinned));
  return {success:true,rows:out};
}
function deleteProductivityNote(data) {
  const s=validateSession(data.token); if(!s.success) return s;
  const sh=sheet(SHEETS.PRODUCTIVITY_NOTES);
  const rows=sh.getLastRow()>=2?sh.getRange(2,1,sh.getLastRow()-1,8).getValues():[];
  for(let i=rows.length-1;i>=0;i--){
    if(String(rows[i][0])===String(data.id)&&String(rows[i][1]).toLowerCase()===s.email){
      sh.deleteRow(i+2);
      return ok('Note deleted.');
    }
  }
  return fail('Note not found.');
}
function getProductivityAnalytics(data) {
  const s=validateSession(data.token); if(!s.success) return s;
  const tasks=listStudyTasks(data).rows||[];
  const sessions=listStudySessions(data).rows||[];
  const notes=listProductivityNotes(data).rows||[];

  const completedTasks=tasks.filter(x=>x.status==='Completed').length;
  const studyMinutes=sessions.reduce((sum,x)=>sum+Number(x.durationMinutes||0),0);
  const today=new Date();
  const weekly=[];
  const active={};

  for(let offset=6;offset>=0;offset--){
    const d=new Date(today);
    d.setDate(today.getDate()-offset);
    const key=Utilities.formatDate(d,Session.getScriptTimeZone(),'yyyy-MM-dd');
    const minutes=sessions.filter(x=>x.sessionDate===key).reduce((sum,x)=>sum+Number(x.durationMinutes||0),0);
    weekly.push({label:Utilities.formatDate(d,Session.getScriptTimeZone(),'EEE'),date:key,minutes:minutes});
    if(minutes>0)active[key]=true;
  }

  tasks.filter(x=>x.status==='Completed').forEach(x=>{ if(x.dueDate)active[x.dueDate]=true; });
  const completionRate=tasks.length?Math.round(completedTasks/tasks.length*100):0;
  const consistency=Math.min(100,Object.keys(active).length*14);
  const productivityScore=Math.round((completionRate+Math.min(100,studyMinutes/3)+consistency)/3);

  const insights=[];
  if(!tasks.length)insights.push('Create your first study task to begin structured preparation.');
  else if(completionRate<50)insights.push('Complete more planned tasks to improve your task completion rate.');
  else insights.push('Your task completion rate is strong. Continue maintaining this routine.');
  if(studyMinutes<120)insights.push('Aim for at least 120 focused study minutes this week.');
  else insights.push('You have completed a meaningful amount of focused study time.');
  if(!notes.length)insights.push('Create revision notes after each important topic.');
  else insights.push('Review your saved notes regularly to improve retention.');

  return {
    success:true,completedTasks:completedTasks,studyMinutes:studyMinutes,
    notesCount:notes.length,activeDays:Object.keys(active).length,
    productivityScore:productivityScore,weekly:weekly,insights:insights
  };
}
function getExamRoadmap(data) {
  const s=validateSession(data.token); if(!s.success) return s;
  const profile=getRegistrationProfile(data);
  const exam=(profile.success&&profile.profile&&profile.profile.targetExam)||'General Competitive Exams';
  const lower=String(exam).toLowerCase();

  let steps=[
    {icon:'📘',title:'Build Foundation',description:'Complete the official syllabus and strengthen core concepts subject by subject.'},
    {icon:'📰',title:'Current Affairs',description:'Review daily current affairs and connect important events with the examination syllabus.'},
    {icon:'📝',title:'Practice Questions',description:'Solve topic-wise questions and maintain an error notebook for weak areas.'},
    {icon:'⏱',title:'Mock Tests',description:'Attempt timed mock tests and review every incorrect or skipped question.'},
    {icon:'🔁',title:'Scheduled Revision',description:'Revise completed topics through short notes and spaced repetition.'},
    {icon:'📊',title:'Performance Review',description:'Track accuracy, speed, study time and task completion every week.'}
  ];
  let summary='A balanced plan covering concepts, current affairs, practice, mock tests and revision.';

  if(lower.includes('haryana')||lower.includes('hssc')||lower.includes('hpsc')){
    steps[0]={icon:'🟢',title:'Haryana General Knowledge',description:'Prioritize Haryana history, geography, polity, culture, economy and current affairs.'};
    steps[1]={icon:'📋',title:'CET Syllabus Coverage',description:'Complete the relevant Group C or Group D syllabus with topic-wise practice.'};
    summary='A Haryana-focused roadmap combining state knowledge, CET practice, current affairs and mock tests.';
  }else if(lower.includes('upsc')){
    steps[0]={icon:'🏛️',title:'NCERT and GS Foundation',description:'Build conceptual clarity through NCERTs and the complete General Studies syllabus.'};
    steps[1]={icon:'📰',title:'News and Editorial Analysis',description:'Connect current developments with Prelims and Mains syllabus topics.'};
    summary='A UPSC-focused roadmap covering foundation, current affairs, answer writing and test practice.';
  }else if(lower.includes('ugc')){
    steps[0]={icon:'🎓',title:'Subject Syllabus Mastery',description:'Cover every unit of the UGC NET subject syllabus with structured notes.'};
    steps[1]={icon:'📚',title:'Paper 1 Preparation',description:'Practice teaching aptitude, research aptitude, reasoning and communication.'};
    summary='A UGC NET roadmap combining subject mastery, Paper 1 practice and previous-year questions.';
  }

  return {success:true,exam:exam,summary:summary,steps:steps};
}


function v40Parse(value,fallback){try{return JSON.parse(value||'')}catch(e){return fallback||{}}}
function v40QuestionMap(){
  const sh=sheet(SHEETS.QUESTIONS),cols=Math.max(13,sh.getLastColumn());
  const rows=sh.getLastRow()>=2?sh.getRange(2,1,sh.getLastRow()-1,cols).getValues():[],map={};
  rows.forEach(r=>{map[String(r[0])]={id:String(r[0]),testId:String(r[1]),question:String(r[2]),optionA:String(r[3]),optionB:String(r[4]),optionC:String(r[5]),optionD:String(r[6]),correctAnswer:String(r[7]||'A').toUpperCase(),explanation:String(r[8]||''),topic:String(r[9]||r[1]||'General'),difficulty:String(r[10]||'Medium'),positiveMarks:Number(r[11]||1),negativeMarks:Number(r[12]||0.25)}});return map;
}
function listProfessionalTests(data){
  const s=validateSession(data.token);if(!s.success)return s;const sh=sheet(SHEETS.CBT_TESTS),rows=sh.getLastRow()>=2?sh.getRange(2,1,sh.getLastRow()-1,10).getValues():[];
  return{success:true,rows:rows.filter(r=>String(r[7])==='Published').map(r=>({id:r[0],title:r[1],subject:r[2],durationMinutes:Number(r[3]||30),positiveMarks:Number(r[4]||1),negativeMarks:Number(r[5]||0.25),questionCount:v40Parse(r[6],[]).length}))};
}
function getProfessionalTest(data){
  const s=validateSession(data.token);if(!s.success)return s;const sh=sheet(SHEETS.CBT_TESTS),rows=sh.getLastRow()>=2?sh.getRange(2,1,sh.getLastRow()-1,10).getValues():[];
  const row=rows.find(r=>String(r[0])===String(data.testId)&&String(r[7])==='Published');if(!row)return fail('CBT test not found.');
  const ids=v40Parse(row[6],[]),map=v40QuestionMap(),questions=ids.map(id=>map[String(id)]).filter(Boolean).map(q=>({id:q.id,question:q.question,optionA:q.optionA,optionB:q.optionB,optionC:q.optionC,optionD:q.optionD,topic:q.topic,difficulty:q.difficulty,positiveMarks:q.positiveMarks,negativeMarks:q.negativeMarks}));
  let savedProgress=null;const psh=sheet(SHEETS.CBT_PROGRESS),prows=psh.getLastRow()>=2?psh.getRange(2,1,psh.getLastRow()-1,8).getValues():[];const p=prows.find(r=>String(r[1]).toLowerCase()===s.email&&String(r[2])===String(data.testId));if(p)savedProgress={answers:v40Parse(p[3],{}),status:v40Parse(p[4],{}),currentIndex:Number(p[5]||0),secondsRemaining:Number(p[6]||0)};
  return{success:true,test:{id:row[0],title:row[1],subject:row[2],durationMinutes:Number(row[3]||30),positiveMarks:Number(row[4]||1),negativeMarks:Number(row[5]||0.25)},questions,savedProgress};
}
function saveProfessionalTestProgress(data){
  const s=validateSession(data.token);if(!s.success)return s;const sh=sheet(SHEETS.CBT_PROGRESS),rows=sh.getLastRow()>=2?sh.getRange(2,1,sh.getLastRow()-1,8).getValues():[];
  for(let i=0;i<rows.length;i++)if(String(rows[i][1]).toLowerCase()===s.email&&String(rows[i][2])===String(data.testId)){sh.getRange(i+2,4,1,5).setValues([[JSON.stringify(data.answers||{}),JSON.stringify(data.status||{}),Number(data.currentIndex||0),Number(data.secondsRemaining||0),new Date()]]);return ok('Progress saved.')}
  sh.appendRow([uid('CBTP'),s.email,data.testId,JSON.stringify(data.answers||{}),JSON.stringify(data.status||{}),Number(data.currentIndex||0),Number(data.secondsRemaining||0),new Date()]);return ok('Progress saved.');
}
function submitProfessionalTest(data){
  const s=validateSession(data.token);if(!s.success)return s;const test=getProfessionalTest({token:data.token,testId:data.testId});if(!test.success)return test;const map=v40QuestionMap(),answers=data.answers||{};let score=0,maxScore=0,correct=0,wrong=0,unanswered=0;const topicStats={};
  test.questions.forEach(q=>{const full=map[q.id];maxScore+=Number(full.positiveMarks||1);if(!topicStats[full.topic])topicStats[full.topic]={correct:0,total:0};topicStats[full.topic].total++;const user=String(answers[q.id]||'').toUpperCase();if(!user)unanswered++;else if(user===full.correctAnswer){correct++;score+=Number(full.positiveMarks||1);topicStats[full.topic].correct++}else{wrong++;score-=Number(full.negativeMarks||0)}});
  score=Math.round(score*100)/100;const percentage=maxScore?Math.max(0,Math.round(score/maxScore*10000)/100):0,weakTopics=Object.keys(topicStats).filter(k=>topicStats[k].correct/topicStats[k].total<0.5),resultId=uid('CBTR'),rsh=sheet(SHEETS.CBT_RESULTS);
  rsh.appendRow([resultId,s.email,test.test.id,test.test.title,score,maxScore,percentage,correct,wrong,unanswered,'','',Number(data.timeTaken||0),JSON.stringify(weakTopics),JSON.stringify(answers),new Date()]);
  const rows=rsh.getLastRow()>=2?rsh.getRange(2,1,rsh.getLastRow()-1,16).getValues().filter(r=>String(r[2])===String(test.test.id)):[];rows.sort((a,b)=>Number(b[4])-Number(a[4]));const rank=rows.findIndex(r=>String(r[0])===resultId)+1,percentile=rows.length?Math.round((rows.length-rank)/rows.length*10000)/100:100;rsh.getRange(rsh.getLastRow(),11,1,2).setValues([[rank,percentile]]);
  return{success:true,resultId,score,maxScore,percentage,correct,wrong,unanswered,rank,percentile,weakTopics};
}
function listProfessionalTestResults(data){
  const s=validateSession(data.token);if(!s.success)return s;const sh=sheet(SHEETS.CBT_RESULTS),rows=sh.getLastRow()>=2?sh.getRange(2,1,sh.getLastRow()-1,16).getValues():[];
  return{success:true,rows:rows.filter(r=>String(r[1]).toLowerCase()===s.email).reverse().map(r=>({resultId:r[0],testId:r[2],testTitle:r[3],score:r[4],maxScore:r[5],percentage:r[6],correct:r[7],wrong:r[8],unanswered:r[9],rank:r[10],percentile:r[11],timeTakenMinutes:Math.round(Number(r[12]||0)/60),weakTopics:v40Parse(r[13],[]),submittedAt:r[15]}))};
}
function getProfessionalTestReview(data){
  const s=validateSession(data.token);if(!s.success)return s;const sh=sheet(SHEETS.CBT_RESULTS),rows=sh.getLastRow()>=2?sh.getRange(2,1,sh.getLastRow()-1,16).getValues():[],row=rows.find(r=>String(r[0])===String(data.resultId)&&String(r[1]).toLowerCase()===s.email);if(!row)return fail('Result not found.');
  const test=getProfessionalTest({token:data.token,testId:row[2]}),map=v40QuestionMap(),answers=v40Parse(row[14],{});return{success:true,rows:test.questions.map(q=>({question:q.question,userAnswer:answers[q.id]||'',correctAnswer:map[q.id].correctAnswer,explanation:map[q.id].explanation,topic:map[q.id].topic}))};
}


/* ======================================================
 * v41 SMART LEARNING & PROFESSIONAL COMMUNICATION
 * ====================================================== */
function v41AddNotification(email,type,title,message){
  sheet(SHEETS.USER_NOTIFICATIONS).appendRow([uid('NTF'),String(email||'').toLowerCase(),type,title,message,'No',new Date()]);
}
function v41EmailFooter(){
  return `
    <div style="margin-top:28px;padding-top:20px;border-top:1px solid #e2e8f0;text-align:center;color:#64748b;font-size:12px;line-height:1.7;">
      <p style="margin:0 0 8px;">
        <a href="https://iasselectionpoint.blogspot.com" style="color:#0B5ED7;text-decoration:none;font-weight:600;">Main Website</a>
        &nbsp;•&nbsp;
        <a href="${CONFIG.PORTAL_URL}index.html" style="color:#0B5ED7;text-decoration:none;font-weight:600;">Member Portal</a>
      </p>
      <p style="margin:0 0 8px;">
        <a href="https://iasselectionpoint.blogspot.com/p/privacy-policy.html" style="color:#475569;text-decoration:none;">Privacy Policy</a>
        &nbsp;|&nbsp;
        <a href="https://iasselectionpoint.blogspot.com/p/terms-conditions.html" style="color:#475569;text-decoration:none;">Terms & Conditions</a>
        &nbsp;|&nbsp;
        <a href="https://iasselectionpoint.blogspot.com/p/contact-us.html" style="color:#475569;text-decoration:none;">Contact Us</a>
      </p>
      <p style="margin:0;">© ${new Date().getFullYear()} IAS Selection Point. All Rights Reserved.</p>
      <p style="margin:2px 0 0;">Designed & Developed by Satnam Kait</p>
      <p style="margin:8px 0 0;font-size:10px;">This is an automated email from IAS Selection Point. Please do not reply directly to this email.</p>
    </div>`;
}
function v41ProfessionalEmailTemplate(options){
  options=options||{};
  return `<!doctype html><html><body style="margin:0;background:#f4f7fb;font-family:Arial,sans-serif;">
    <div style="max-width:640px;margin:0 auto;padding:24px 14px;">
      <div style="background:#ffffff;border:1px solid #e2e8f0;border-radius:18px;overflow:hidden;">
        <div style="padding:24px;background:linear-gradient(135deg,#0f172a,#0B5ED7);color:#fff;text-align:center;">
          <div style="font-size:12px;letter-spacing:1px;color:#bfdbfe;">IAS SELECTION POINT</div>
          <h1 style="margin:8px 0 0;font-size:26px;">${options.title||'IAS Selection Point'}</h1>
          <p style="margin:8px 0 0;color:#dbeafe;">${options.subtitle||''}</p>
        </div>
        <div style="padding:24px;color:#334155;font-size:14px;line-height:1.65;">
          ${options.body||''}
          ${options.buttonUrl?`<p style="text-align:center;margin:24px 0;"><a href="${options.buttonUrl}" style="display:inline-block;padding:12px 20px;border-radius:10px;background:#0B5ED7;color:#fff;text-decoration:none;font-weight:700;">${options.buttonText||'Open Portal'}</a></p>`:''}
          ${v41EmailFooter()}
        </div>
      </div>
    </div></body></html>`;
}
function getSmartLearningDashboard(data){
  const s=validateSession(data.token);if(!s.success)return s;
  const tasks=listStudyTasks(data).rows||[],sessions=listStudySessions(data).rows||[],notes=listProductivityNotes(data).rows||[];
  const results=listProfessionalTestResults(data).rows||[];
  const completed=tasks.filter(x=>x.status==='Completed').length;
  const studyMinutes=sessions.reduce((a,x)=>a+Number(x.durationMinutes||0),0);
  const accuracy=results.length?Math.round(results.reduce((a,x)=>a+Number(x.percentage||0),0)/results.length):0;
  const weak={};results.forEach(r=>(r.weakTopics||[]).forEach(t=>weak[t]=(weak[t]||0)+1));
  const weakTopics=Object.keys(weak).sort((a,b)=>weak[b]-weak[a]).slice(0,5).map(t=>({topic:t,recommendation:'Revise this topic and attempt a focused practice test.'}));
  const streak=Math.min(30,new Set(sessions.map(x=>x.sessionDate).filter(Boolean)).size);
  const achievements=[
    {icon:'🌱',title:'Beginner',description:'Create your first study task.',unlocked:tasks.length>0},
    {icon:'🔥',title:'Daily Warrior',description:'Complete 5 focused study sessions.',unlocked:sessions.length>=5},
    {icon:'📝',title:'Mock Test Master',description:'Complete 10 mock tests.',unlocked:results.length>=10},
    {icon:'📚',title:'Revision Champion',description:'Save 20 revision notes.',unlocked:notes.length>=20},
    {icon:'🏆',title:'Top Performer',description:'Maintain 80% or higher test accuracy.',unlocked:accuracy>=80},
    {icon:'⭐',title:'Consistent Learner',description:'Complete 25 planned tasks.',unlocked:completed>=25}
  ];
  const todayPlan=[
    {icon:'📘',title:'Complete one planned topic',description:'Use Study Planner to finish your highest-priority task.'},
    {icon:'⏱',title:'Start a focus session',description:'Complete at least one 25-minute focused study session.'},
    {icon:'📝',title:'Attempt practice questions',description:weakTopics.length?'Practice '+weakTopics[0].topic+'.':'Attempt one CBT mock test.'},
    {icon:'🔁',title:'Revision',description:'Review one saved note before ending today’s study.'}
  ];
  return{success:true,title:'Your personalized preparation dashboard',subtitle:'Smart recommendations based on your activity and target examination.',streak,articlesRead:0,mockTests:results.length,accuracy,studyMinutes,todayPlan,weakTopics,achievements};
}
function getSmartRevisionPlan(data){
  const s=validateSession(data.token);if(!s.success)return s;
  const notes=listProductivityNotes(data).rows||[];
  const topics=notes.slice(0,4).map(x=>x.title);
  const defaults=['Core Concepts','Current Affairs','Weak Mock-Test Topic','Previous-Year Questions'];
  const t=[...topics,...defaults].slice(0,4);
  return{success:true,rows:[
    {window:'Today',topic:t[0],action:'Quick 15-minute revision'},
    {window:'Tomorrow',topic:t[1],action:'Active recall and 10 practice questions'},
    {window:'After 7 Days',topic:t[2],action:'Full revision with short notes'},
    {window:'After 30 Days',topic:t[3],action:'Mixed test and performance review'}
  ]};
}
function getStudentPerformanceReport(data){
  const s=validateSession(data.token);if(!s.success)return s;
  const tasks=listStudyTasks(data).rows||[],sessions=listStudySessions(data).rows||[],results=listProfessionalTestResults(data).rows||[];
  const completedTasks=tasks.filter(x=>x.status==='Completed').length;
  const weekly=[];
  for(let i=6;i>=0;i--){
    const d=new Date();d.setDate(d.getDate()-i);
    const key=Utilities.formatDate(d,Session.getScriptTimeZone(),'yyyy-MM-dd');
    const minutes=sessions.filter(x=>x.sessionDate===key).reduce((a,x)=>a+Number(x.durationMinutes||0),0);
    weekly.push({label:Utilities.formatDate(d,Session.getScriptTimeZone(),'EEE'),value:Math.round(minutes/10)});
  }
  return{success:true,totalLearningActions:tasks.length+sessions.length+results.length,weeklyGrowth:Math.min(100,Math.round((completedTasks+sessions.length)*4)),completedTasks,badgesEarned:[tasks.length>0,sessions.length>=5,results.length>=10,completedTasks>=25].filter(Boolean).length,weekly};
}
function listUserNotifications(data){
  const s=validateSession(data.token);if(!s.success)return s;
  const sh=sheet(SHEETS.USER_NOTIFICATIONS),rows=sh.getLastRow()>=2?sh.getRange(2,1,sh.getLastRow()-1,7).getValues():[];
  const out=rows.filter(r=>String(r[1]).toLowerCase()===s.email).reverse().map(r=>({id:r[0],type:r[2],title:r[3],message:r[4],read:String(r[5])==='Yes',createdAt:r[6]?new Date(r[6]).toLocaleString():''}));
  return{success:true,rows:out,unread:out.filter(x=>!x.read).length};
}
function markNotificationRead(data){
  const s=validateSession(data.token);if(!s.success)return s;const sh=sheet(SHEETS.USER_NOTIFICATIONS),rows=sh.getLastRow()>=2?sh.getRange(2,1,sh.getLastRow()-1,7).getValues():[];
  for(let i=0;i<rows.length;i++)if(String(rows[i][0])===String(data.id)&&String(rows[i][1]).toLowerCase()===s.email){sh.getRange(i+2,6).setValue('Yes');return ok('Notification marked as read.')}
  return fail('Notification not found.');
}
function markAllNotificationsRead(data){
  const s=validateSession(data.token);if(!s.success)return s;const sh=sheet(SHEETS.USER_NOTIFICATIONS),rows=sh.getLastRow()>=2?sh.getRange(2,1,sh.getLastRow()-1,7).getValues():[];
  rows.forEach((r,i)=>{if(String(r[1]).toLowerCase()===s.email)sh.getRange(i+2,6).setValue('Yes')});return ok('All notifications marked as read.');
}
function listUserCertificates(data){
  const s=validateSession(data.token);if(!s.success)return s;
  const tasks=listStudyTasks(data).rows||[],sessions=listStudySessions(data).rows||[],results=listProfessionalTestResults(data).rows||[];
  return{success:true,rows:[
    {icon:'📘',title:'Focused Learner',description:'Complete 10 focused study sessions.',unlocked:sessions.length>=10},
    {icon:'📝',title:'Mock Test Achiever',description:'Complete 10 CBT mock tests.',unlocked:results.length>=10},
    {icon:'✅',title:'Planning Champion',description:'Complete 25 study tasks.',unlocked:tasks.filter(x=>x.status==='Completed').length>=25},
    {icon:'🏆',title:'High Accuracy Performer',description:'Achieve 80% or higher average test accuracy.',unlocked:results.length&&results.reduce((a,x)=>a+Number(x.percentage||0),0)/results.length>=80}
  ]};
}
function getCommunicationDashboard(data){
  const a=requireAdmin(data.token);if(!a.success)return a;const sh=sheet(SHEETS.COMMUNICATION_LOGS),rows=sh.getLastRow()>=2?sh.getRange(2,1,sh.getLastRow()-1,7).getValues():[];
  const today=Utilities.formatDate(new Date(),Session.getScriptTimeZone(),'yyyy-MM-dd');
  return{success:true,total:rows.length,sent:rows.filter(r=>String(r[4])==='Sent').length,failed:rows.filter(r=>String(r[4])==='Failed').length,today:rows.filter(r=>v39DateKey(r[6])===today).length,logs:rows.slice().reverse().slice(0,100).map(r=>({email:r[1],type:r[2],subject:r[3],status:r[4],error:r[5],sentAt:r[6]?new Date(r[6]).toLocaleString():''}))};
}
function sendCommunicationAnnouncement(data){
  const a=requireAdmin(data.token);if(!a.success)return a;const title=clean(data.title),message=clean(data.message);if(!title||!message)return fail('Title and message are required.');
  const users=sheet(SHEETS.USERS),rows=users.getLastRow()>=2?users.getRange(2,1,users.getLastRow()-1,9).getValues():[],emails={};
  rows.forEach(r=>{const e=String(r[2]||'').toLowerCase().trim();if(e&&String(r[6]||'Active')!=='Blocked')emails[e]=true});
  let sent=0,failed=0;
  Object.keys(emails).forEach(email=>{
    v41AddNotification(email,'Announcement',title,message);
    if(Boolean(data.sendEmail)){
      const html=v41ProfessionalEmailTemplate({title:title,subtitle:'Important announcement from IAS Selection Point',body:`<p>Dear Member,</p><p>${message}</p>`,buttonText:'Open Member Portal',buttonUrl:CONFIG.PORTAL_URL+'index.html'});
      const result=sendMail(email,title,html,{type:'Announcement'});
      sheet(SHEETS.COMMUNICATION_LOGS).appendRow([uid('CML'),email,'Announcement',title,result.sent?'Sent':'Failed',result.error||'',new Date()]);
      result.sent?sent++:failed++;
    }
  });
  return{success:true,message:'Announcement sent. Emails sent: '+sent+', failed: '+failed+'.'};
}
function previewCommunicationTemplate(data){
  const a=requireAdmin(data.token);if(!a.success)return a;const type=clean(data.type)||'welcome';
  const samples={
    welcome:['Welcome to IAS Selection Point','Your learning journey starts here.','<p>Dear {{UserName}},</p><p>Your IAS Selection Point account has been created successfully.</p>'],
    badge:['Congratulations! Badge Earned','A new achievement has been unlocked.','<p>Excellent work! You have earned the <b>Daily Warrior</b> badge.</p>'],
    mock:['Mock Test Completed','Your performance report is ready.','<p>Your mock test has been submitted successfully.</p><p><b>Score:</b> 82% &nbsp; <b>Rank:</b> #12</p>'],
    weekly:['Your Weekly Progress Report','Review your learning growth.','<p>You completed 6 study tasks, 4 focus sessions and 2 mock tests this week.</p>'],
    version:['IAS Selection Point v41 Is Available','Smart Learning & Professional Communication Suite','<p>A new portal version has been released with smart learning, notifications, reports and professional email templates.</p>'],
    certificate:['Certificate Earned','Your achievement certificate is available.','<p>Congratulations! You have unlocked the Focused Learner certificate.</p>']
  };
  const s=samples[type]||samples.welcome;
  return{success:true,html:v41ProfessionalEmailTemplate({title:s[0],subtitle:s[1],body:s[2],buttonText:'Open Member Portal',buttonUrl:CONFIG.PORTAL_URL+'index.html'})};
}


function sendV411TestEmail(data) {
  const a = requireAdmin(data.token);
  if (!a.success) return a;

  const recipient = clean(data.email || a.email).toLowerCase();
  if (!recipient) return fail('Recipient email is required.');

  const profile = v411GetRecipientProfile(recipient);
  const html = baseEmailTemplate({
    badge:'EMAIL SYSTEM TEST',
    badgeColor:'#7c3aed',
    title:'IAS Selection Point Email System Is Working',
    subtitle:'v41.1 personalized email and footer verification.',
    body:`<p>Dear <b>${v411EscapeHtml(profile.name || 'Member')}</b>,</p>
      <p>This test email confirms that the following items are working:</p>
      <ul>
        <li>Dynamic user name</li>
        <li>Main Website link</li>
        <li>Member Portal link</li>
        <li>Privacy, Terms and Contact links</li>
        <li>Copyright and developer credit</li>
        <li>Central email logging</li>
      </ul>`,
    buttonText:'Open Member Portal',
    buttonUrl:CONFIG.PORTAL_URL + 'index.html'
  });

  const result = sendMail(
    recipient,
    'IAS Selection Point v41.1 Email System Test',
    html,
    {type:'Email System Test',referenceKey:'V43.0.0'}
  );

  return {
    success: result.sent,
    message: result.sent
      ? 'Test email sent successfully to ' + recipient + '.'
      : 'Test email failed: ' + result.error,
    error: result.error || ''
  };
}

function hashPassword(password) { const raw=Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256,String(password)); return raw.map(function(b){return ('0'+(b&0xFF).toString(16)).slice(-2);}).join(''); }
function uid(prefix) { return prefix+'_'+new Date().getTime()+'_'+Math.floor(Math.random()*9999); }
function clean(v) { return String(v||'').trim(); }
function ok(message) { return {success:true,message}; }
function fail(message) { return {success:false,message}; }
