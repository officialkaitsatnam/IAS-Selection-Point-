IAS Selection Point v31.8 — Enterprise Email + Confirm Password

Base:
- v31.7 Achievement Email Rewards
- Existing new Google Sheet, Apps Script URL and Super Admin remain unchanged

Signup improvements:
- Repeat/Confirm Password field
- Show/Hide icons remain active on both password fields
- Live password match/mismatch indicator
- Frontend and backend password-match validation
- Minimum 6-character password validation

Professional email system:
- Welcome email to every new member
- Instant new-signup alert to iasselection1@gmail.com
- Admin email includes Member ID, name, email, mobile, role and registration time
- Achievement/task completion congratulations emails
- 10, 20, 30, 50 and 100 article milestone emails
- Existing OTP, account-status, notification and bulk emails retained
- Detailed delivery logging with exact failure reason
- Account creation remains successful even if an email temporarily fails

Important bug fix:
- v31.7 reused the old ACHIEVEMENTS sheet with an incompatible schema.
- v31.8 uses a new stable REWARD_ACHIEVEMENTS sheet.
- v31.8 uses SYSTEM_EMAILS for all detailed delivery reports.
- Duplicate achievement emails are still blocked by Email + Achievement Key.

New Google Sheet tabs:
- REWARD_ACHIEVEMENTS
- SYSTEM_EMAILS

Apps Script:
1. Replace Code.gs.
2. Save.
3. Run initializeSystem() once.
4. Accept MailApp permission if prompted.
5. Deploy > Manage deployments > Edit > New version > Deploy.
6. Do not use the old deployment version.

GitHub:
1. Replace/upload all frontend files from this ZIP.
2. Open portal with ?v=318.
3. Clear GitHub Pages site data/service-worker cache once if old UI appears.

Testing:
1. Create a new member account.
2. Confirm the user receives a Welcome email.
3. Confirm iasselection1@gmail.com receives New Member Signup email.
4. Open Admin > Email Center and verify Sent/Failed logs.
5. Unlock an achievement and verify the congratulations email.
