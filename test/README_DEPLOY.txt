CODERZ × Orange Jordan — Advanced Excel Training Hub
=======================================================

GitHub Pages-ready static site.

PUBLIC ENTRY
------------
/index.html

HIDDEN ADMIN ENTRY
------------------
Click the CODERZ logo 5 times quickly on the public page or assessment page.
Admin PIN: 2505

COURSE CONTROL
--------------
The admin can control:
- Current course day: Before Course / Day 1 / Day 2 / Day 3 / Closed
- Active module shown as NOW
- Live room title + message
- Previous-day recap visibility
- Every learner download toggle individually
- Day ZIP pack toggle
- Assessment phase: PRE / POST / CLOSED
- Assessment submissions on/off
- Public site live / maintenance
- Announcement bar
- Pre/Post results: view / edit / delete / export

DOWNLOADS
---------
/downloads/day1/
/downloads/day2/
/downloads/day3/
/downloads/packs/

IMPORTANT ABOUT GITHUB PAGES
----------------------------
The download toggles control what learners can see and click in the site UI.
They are not true file authorization if the GitHub repository is public.
Anyone who already knows a direct raw file URL may still reach it.
For strict access control, host learner files in Firebase Storage with authenticated or signed access instead of GitHub Pages.

FIRESTORE
---------
Use assessment/firestore.rules from this package.
The site uses orangeExcelConfig/site and orangeExcelAssessments.

SAFE FIRST LAUNCH
-----------------
1. Publish Firestore rules.
2. Open hidden admin.
3. Choose Before Course.
4. Keep all files OFF.
5. Set Assessment = PRE and submissions ON.
6. On Day 1, switch Current Day to Day 1 and open only the first file.
