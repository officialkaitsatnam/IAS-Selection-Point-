IAS Selection Point v23.1 - Sheet Center Stable Hotfix

Fixed:
- Alternating background color / banding conflict
- Format All Sheets now removes old banding safely before applying new design
- Refresh Dashboard safely rebuilds the DASHBOARD sheet
- Run Maintenance safely refreshes filters, rows and formatting
- Existing Google Sheet data is preserved
- All v23 admin, communication, ticket and profile features are retained

GitHub replace:
index.html
dashboard.html
admin.html
style.css
app.js
config.js
logo.jpg

Apps Script required:
1. Replace Code.gs
2. Save
3. Run initializeSystem once
4. Deploy > Manage deployments > Edit
5. Select New version and Deploy
6. Refresh Google Sheet and portal

Open:
https://officialkaitsatnam.github.io/IAS-Selection-Point-/?v=231

This v23.1 version should be used as the stable base for the next development version.
