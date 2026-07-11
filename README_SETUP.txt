IAS Selection Point v29.1 - Stable Dashboard + Ticker + Profile Hotfix

Important:
- Built again from stable v28 base.
- Broken v29 HTML is not used.

Fixed:
- All dashboard modules and buttons work again.
- HTML closing tags restored and verified.
- Notification sidebar button removed safely.
- Notification preview card removed safely.
- Notifications open only from bell icon.
- Bell dropdown includes unread messages and Mark all read.

Breaking News ticker:
- Design inspired by the Breaking News strip on satnamkait.in.
- Latest IAS Selection Point posts display in the ticker.
- Previous / Next controls included.
- Clicking a loaded post opens inside the portal.

Professional Profile:
- Profile photo
- State and District
- Date of Birth and Gender
- Qualification and Occupation
- Preferred Language
- Address and Website/Social Profile
- Profile Completion percentage
- New PROFILE_PRO Google Sheet tab

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
5. Refresh portal using ?v=291

Open:
https://officialkaitsatnam.github.io/IAS-Selection-Point-/?v=291
