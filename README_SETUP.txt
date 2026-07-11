IAS Selection Point v29.2 - Automatic Image News Ticker Hotfix

Built from stable v29.1.

Ticker improvements:
- Continuous automatic ticker like the Breaking News strip on satnamkait.in
- Seamless, non-stop horizontal movement
- Post thumbnail/image shown with every item
- Latest pill, post date and title
- Hover/touch pauses ticker temporarily
- Smooth mobile layout
- Broken/missing thumbnails fall back to logo.jpg

Important behavior:
- Clicking ticker posts NEVER opens the public Blogger website
- Latest posts are loaded into ISP_LOADED_POSTS
- Selected post opens directly inside the portal Premium Reader
- Premium Reader Back button returns to dashboard

GitHub replace/upload:
dashboard.html
style.css
app.js
config.js
sw.js

For complete version consistency, replace all files from the ZIP.

Apps Script:
Code.gs replacement is optional because backend functionality is unchanged.

After GitHub upload:
1. Open the portal with ?v=292
2. On Android Chrome, clear the old PWA/service-worker cache if the old ticker remains:
   Chrome Settings > Site settings > Storage > officialkaitsatnam.github.io > Clear
3. Reload the portal

Portal:
https://officialkaitsatnam.github.io/IAS-Selection-Point-/?v=292
