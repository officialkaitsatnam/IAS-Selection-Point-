IAS Selection Point v33 — Daily Quiz + XP + Leaderboard + Install App

New Daily Quiz:
- 10 questions automatically selected every day
- Questions come from existing Admin Exam Management Question Bank
- Same daily set for all users on the same date
- 10-minute timer
- Previous / Next navigation
- Instant result
- One submission per user per day

XP:
- Quiz completion: +20 XP
- Every correct answer: +10 XP
- Levels:
  Beginner: 0+
  Learner: 200+
  Advanced: 500+
  Expert: 1000+
  Master: 2000+

Leaderboard:
- Top 50 users
- XP, level and quiz streak
- User's own rank card

Phone application:
- Persistent Install App button in sidebar
- Install card on dashboard
- Android Chrome install prompt
- Fallback instructions for Add to Home Screen
- Updated manifest and service worker

New Google Sheet tabs:
- DAILY_QUIZ_RESULTS
- USER_XP

Apps Script:
1. Replace Code.gs.
2. Save.
3. Run initializeSystem() once to create new sheets.
4. Deploy > Manage deployments > Edit > New version > Deploy.

GitHub:
1. Replace/upload all frontend files.
2. Open portal with ?v=33.
3. Clear old site data/service-worker cache once if needed.

Daily Quiz requirement:
Admin Question Bank must contain at least one question.
For a complete daily challenge, add at least 10 questions.
