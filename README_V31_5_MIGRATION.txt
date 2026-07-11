IAS Selection Point v31.5 — New Backend Migration

Base:
- User-uploaded v31.4 Full Mock Test Sync Fix
- Existing UI and features preserved

New backend:
- Apps Script Web App:
  https://script.google.com/macros/s/AKfycbw0jIvCnZ2gu1vKGXaJIln0fXEHo4kCBrPPvXNn8gfcKT6dk24aZu-szZAMcE_ISJOB/exec
- Google Sheet ID:
  1GfAvSSfCV2vAuTbe4_Yodjn8Y60SMTNhtog8PTpQvNs
- Super Admin:
  iasselection1@gmail.com

What changed:
- config.js API_URL
- Backend Spreadsheet ID
- Backend Admin Email
- Old admin email and old Web App references removed
- Service-worker/cache version changed to 315

What did NOT change:
- GitHub account/repository
- Portal design
- Dashboard modules
- Premium Reader
- News ticker
- Profile
- Notifications
- Notes and Revision
- Mock Test / Exam Management
- Admin tools
- PWA/mobile features

Setup:
1. Open the NEW Apps Script project using iasselection1@gmail.com.
2. Replace Code.gs with the Code.gs from this ZIP.
3. Save.
4. Run initializeSystem() once.
5. Accept permissions.
6. Deploy > Manage deployments > Edit > New version > Deploy.
7. Confirm the deployed URL remains:
   https://script.google.com/macros/s/AKfycbw0jIvCnZ2gu1vKGXaJIln0fXEHo4kCBrPPvXNn8gfcKT6dk24aZu-szZAMcE_ISJOB/exec
8. Upload/replace the frontend files in the SAME GitHub repository.
9. Open the portal with ?v=315.
10. Create or login with iasselection1@gmail.com. The code recognizes this email as Super Admin.

Important:
- The new Google Sheet will initially have no old users/data unless data is copied separately.
- Do not delete the old Sheet until login, signup, admin panel and mock tests are verified.
