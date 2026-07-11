IAS Selection Point v29.3 - Continuous Ticker Hotfix

Fixed:
- News ticker now continuously moves from right to left.
- Uses requestAnimationFrame JavaScript engine instead of unreliable CSS animation.
- Seamless loop with no visible jump.
- Automatically starts after images and layout finish loading.
- Re-measures after screen resize/orientation change.
- Pauses on hover/touch and resumes automatically.
- Post image, date, LATEST badge and title remain visible.
- Clicking a ticker post opens it inside the portal Premium Reader.

GitHub minimum replacement:
- app.js
- style.css
- dashboard.html
- config.js
- sw.js

For complete consistency, upload every file from the ZIP.

After upload:
1. Open portal with ?v=293
2. Clear old GitHub Pages site data/service-worker cache if necessary.
3. Reload once.

Apps Script:
Code.gs replacement is optional because backend behavior is unchanged.
