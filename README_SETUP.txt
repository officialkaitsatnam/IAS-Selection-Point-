IAS Selection Point v28 - PWA App + Notes + Revision Center

New:
- Install portal as mobile/desktop app
- Service Worker and offline fallback
- Faster repeat loading using cached core files
- Install App button
- Reader: Add Note button
- Reader: Schedule Revision button
- My Notes section
- Notes search, copy and delete
- Revision Center
- 1 / 7 / 30 day revision scheduling
- Due / Upcoming / Completed filters
- Complete, reschedule and delete revision
- New Google Sheet tabs:
  USER_NOTES
  REVISION_QUEUE

GitHub upload/replace:
index.html
dashboard.html
admin.html
style.css
app.js
config.js
logo.jpg
manifest.webmanifest
sw.js
offline.html

Apps Script:
1. Replace Code.gs
2. Save
3. Run initializeSystem once
4. Deploy > Manage deployments > Edit > New version > Deploy
5. Refresh Google Sheet and portal

Important:
GitHub Pages must be enabled and portal must use HTTPS for PWA install/service worker.

Open:
https://officialkaitsatnam.github.io/IAS-Selection-Point-/?v=28
