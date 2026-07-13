IAS Selection Point v36.1 — UI Corrections

Corrections:
1. Restored Profile Photo Upload in Edit Profile.
   - Upload Photo
   - Remove Photo
   - Header and View Profile photo sync

2. Redesigned Breaking News Ticker:
   - Compact 46px height
   - Full-width single-line layout
   - Similar visual height to the Portal Connected status bar
   - Smaller thumbnail, date and title text
   - Better mobile fit

3. Moved Help & Support:
   - Removed from the left sidebar
   - Added to the Profile dropdown

GitHub:
Replace/upload all frontend files.
Open the portal with ?v=361.

Apps Script:
Code.gs replacement is optional because backend logic is unchanged.

If the previous design remains:
Clear Portal Cache from Profile > System Status and reload.
