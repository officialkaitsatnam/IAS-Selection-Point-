IAS Selection Point v31.5.1 — Stable Backend Migration Fix

Base:
- Original user-uploaded v31.4 Full Mock Test Sync Fix
- No backend helper, login logic, UI, module or feature was redesigned

Changed only:
1. Apps Script Web App URL:
   https://script.google.com/macros/s/AKfycbw0jIvCnZ2gu1vKGXaJIln0fXEHo4kCBrPPvXNn8gfcKT6dk24aZu-szZAMcE_ISJOB/exec

2. Google Sheet ID:
   1GfAvSSfCV2vAuTbe4_Yodjn8Y60SMTNhtog8PTpQvNs

3. Super Admin email:
   iasselection1@gmail.com

Important fix:
- Original working ss() and sheet() helper functions are preserved exactly.
- The previous "Server error: sheet is not defined" migration issue is removed.
- There is exactly one ss() function and one sheet() function.

Apps Script setup:
1. Open the Apps Script project from iasselection1@gmail.com.
2. Delete/replace the current Code.gs with this ZIP's Code.gs.
3. Save.
4. Run initializeSystem() once.
5. Allow permissions.
6. Deploy > Manage deployments > Edit > New version > Deploy.
7. Ensure the deployed /exec URL remains the same as above.

GitHub setup:
1. Upload/replace the frontend files in the same repository.
2. Open the portal with ?v=3151.
3. Clear old GitHub Pages site data/service-worker cache once if needed.

Initial admin:
- Email: iasselection1@gmail.com
- Default password from original code: Admin@123
- initializeSystem() creates/fixes this admin account automatically.

Old setup remains unchanged except the new backend, new Sheet and new Admin email.
