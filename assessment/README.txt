CODERZ × ORANGE — ADVANCED EXCEL PRE / POST ASSESSMENT
======================================================

One codebase, three useful URLs after deployment:

1) PRE-ASSESSMENT
   /assessment/?mode=pre

2) POST-ASSESSMENT
   /assessment/?mode=post

3) TRAINER RESULTS DASHBOARD
   /assessment/?view=results

How participant matching works
------------------------------
- Participant enters First Name + Last Name.
- The name is saved in browser LocalStorage.
- On the post-assessment, the same device pre-fills the name automatically.
- Firebase pairs Pre and Post using a normalized name key.
- One document per participant per mode is stored, so repeating the same mode updates the existing result rather than creating duplicates.

Firestore
---------
Firebase project config is already included in index.html.
You still need to publish Firestore rules in Firebase Console.
A workshop-ready rules file is included as firestore.rules.

IMPORTANT SECURITY NOTE
-----------------------
The supplied workshop rules allow the static trainer dashboard to read results without Firebase Authentication.
That means the collection is not private at the database-rule level.
For stricter privacy, add Firebase Authentication for the trainer and restrict read access to the trainer account.

Questions
---------
15 questions / 15 points:
Q1–5 Foundation
Q6–10 Applied
Q11–15 Advanced

Score bands:
0–5 Beginner
6–10 Intermediate
11–15 Advanced

The participant sees the final score and section subscores, but correct answers are not revealed during the assessment.
