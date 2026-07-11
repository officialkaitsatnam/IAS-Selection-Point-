IAS Selection Point v31.3 - Mock Test Opening + Loader Hotfix

Main fix:
- Test questions now open reliably.
- Loading overlay is always closed using try/finally.
- Question request has a 15-second timeout.
- An 18-second loader safety timer prevents endless loading.
- Duplicate Start Test clicks are blocked.
- Clear retry message is shown when loading fails.
- Questions are cached locally for 30 minutes.
- Backend questions are cached per test for 5 minutes.
- Backend reads only actual used question rows, not the entire formatted sheet.
- Tests with zero questions have a disabled Start button.
- Old startV31Test references now point to the fixed function.

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
1. Replace Code.gs.
2. Save.
3. Deploy > Manage deployments > Edit > New version > Deploy.
4. No need to run initializeSystem() again if sheets already exist.
5. Open portal with ?v=313.

Testing:
1. Admin > Exam Management.
2. Confirm test has more than 0 questions.
3. Publish the test.
4. Member > Mock Tests > Start Test.
5. Questions should open and loader should close automatically.

If old code remains, clear GitHub Pages site data/service-worker cache.
