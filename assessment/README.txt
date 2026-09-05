CODERZ × Orange Jordan — Assessment System
===========================================

PUBLIC FLOW
- Main training portal: ../index.html
- Participant assessment URL: assessment/
- The participant URL does NOT need to change between Day 1 and Day 3.
- Admin chooses PRE or POST from assessment/admin/ and the public assessment follows the active phase automatically.
- Participant name is saved locally on the participant device and reused for the Post-Assessment.

HIDDEN ADMIN ENTRY
- On the main website, click the CODERZ logo 5 times quickly.
- The same 5-click shortcut also works on the CODERZ logo inside the assessment page.
- Admin PIN: 2505

ADMIN CONTROL CENTER
- Switch assessment phase: PRE / POST / CLOSED
- Enable / disable assessment submissions
- Put the full site into maintenance mode
- Show / hide a participant announcement
- View Pre/Post results and gains
- Search participants
- Edit scores / participant names
- Delete one attempt, one participant, or all results
- Export CSV
- Copy public / Pre / Post / Admin links

POST-ASSESSMENT ON THE LAST DAY
1. Open the hidden Admin page.
2. Go to "التحكم بالموقع".
3. Select POST • Last Day.
4. Keep "Allow Assessment Submissions" ON.
5. Click "حفظ الإعدادات".
6. Ask participants to open the SAME website they used on Day 1.
7. The site and assessment automatically show Post-Assessment.
8. Their saved first/last name should already be filled on the same device.

FIREBASE
- Project: mobilehub-4eb1d
- Collections:
  orangeExcelAssessments
  orangeExcelConfig / site

IMPORTANT
Deploy assessment/firestore.rules to Cloud Firestore before use.
The current rules are intentionally permissive for the workshop. The 2505 PIN only protects the UI; it is not Firebase Authentication.
