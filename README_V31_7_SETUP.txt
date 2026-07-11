IAS Selection Point v31.7 — Achievement & Congratulations Email Rewards

New milestone emails:
- 10 articles: Bronze Reader
- 20 articles: Silver Reader
- 30 articles: Gold Reader
- 50 articles: Platinum Reader
- 100 articles: Diamond Reader

Other badge emails:
- First article
- First note
- First bookmark
- First mock test
- 90%+ mock-test score
- First completed revision

Important:
- Each achievement is saved once.
- Duplicate congratulations emails are blocked.
- Backend checks Email + Achievement Key before sending.
- Professional HTML congratulations email is sent to the user.
- Dashboard includes Achievements section, progress and badge timeline.
- Admin includes Achievement Center and email delivery report.

New Google Sheet tabs:
- ACHIEVEMENTS
- ACHIEVEMENT_EMAILS

Apps Script:
1. Replace Code.gs.
2. Save.
3. Run initializeSystem() once to create new sheets.
4. Deploy > Manage deployments > Edit > New version > Deploy.
5. Test MailApp permission when prompted.

GitHub:
Replace/upload all frontend files.
Open portal with ?v=317.

Testing:
- Read 10 unique articles using a member account.
- The Bronze Reader badge should unlock.
- One congratulations email should arrive.
- Reading the same article repeatedly does not count as unique new articles.
