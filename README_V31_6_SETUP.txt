IAS Selection Point v31.6 — Password Visibility + Account UX

Base:
- v31.5.1 Stable Backend Migration Fix
- New Google Sheet, new Apps Script URL and iasselection1@gmail.com admin remain unchanged

New:
- Eye icon on Login password
- Eye icon on Signup password
- Eye icon on Confirm password
- Eye icon on Forgot/Reset password fields
- Dynamic form support: icons are added even when forms switch without page reload
- Cursor position preserved while showing/hiding password
- Mobile touch-friendly toggle
- Signup password strength indicator
- Confirm-password match indicator

GitHub:
Replace/upload all frontend files from this ZIP.
Open portal with ?v=316.

Apps Script:
Code.gs replacement is optional because backend functionality is unchanged.
Replace it only for v31.6 backend version display.

If old UI remains:
Clear site data/service-worker cache for officialkaitsatnam.github.io and reload.
