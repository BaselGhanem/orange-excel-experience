CODERZ × Orange — Assessment System
===================================

Participant URLs
----------------
Pre:  assessment/?mode=pre
Post: assessment/?mode=post

Trainer Admin
-------------
Admin: assessment/admin/
PIN: 2505

Admin capabilities
------------------
- View all participants and Pre/Post results.
- Search participants.
- Export CSV.
- Edit participant first/last name and score/subscores.
- Delete one Pre or Post attempt.
- Delete both attempts for one participant.
- Delete all results (requires PIN confirmation again).

Firebase
--------
Project: mobilehub-4eb1d
Collection: orangeExcelAssessments
Deploy the included firestore.rules before using delete/admin controls.

Security note
-------------
This is a lightweight static workshop setup. The admin PIN is checked in the browser,
so it is suitable as a casual access gate, not strong backend security. Firestore rules
are permissive to allow admin deletion without Firebase Authentication. For a permanent
production system, use Firebase Authentication and restrict Firestore operations to the
trainer account.
