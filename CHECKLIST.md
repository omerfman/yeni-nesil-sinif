# CHECKLIST - Yeni Nesil Sınıf (Vanilla HTML/CSS/JS, ayrı sayfalar)

Her satır başlangıçta [o] olacak. Tamamlandığında [x] ile değiştirilecek.
`run:` sonrası komut veya açık adımlar terminalde çalıştırılacaktır. Idempotency gereği var ise skip et.

---

[o] 1. Repo & temel klasör yapısı oluştur — run: git init -b main && mkdir -p public/auth public/admin public/teachers public/students public/bookings public/assignments public/assets/css public/assets/js/lib public/assets/img functions/utils scripts public/components && touch README.md PROGRESS.log .env.local.example vercel.json .gitignore

[o] 2. .gitignore, .env.local.example, vercel.json hazırla — run: write .gitignore (node_modules, functions/node_modules, .env.local, .firebase, .vercel) ; write .env.local.example with NEXT_PUBLIC_FIREBASE_* placeholders ; create vercel.json to serve /public as root

[o] 3. public/index.html (modern homepage) oluştur — run: create public/index.html with hero, 3-step how it works, CTA buttons (Login / Register), sample teacher cards placeholder linking to /teachers/index.html

[o] 4. Global CSS styles (assets/css/styles.css) ve design vars oluştur — run: create assets/css/styles.css with CSS variables (--color-primary: #EF4444), responsive base styles, utility classes and layout

[o] 5. App scaffolding JS (assets/js/app.js) ve common header/footer loader — run: create assets/js/app.js that loads header/footer components and initializes page-specific scripts

[o] 6. Firebase client lib (assets/js/lib/firebase.js) oluştur — run: add Firebase SDK init via CDN; export firebase auth, firestore, storage helpers; config from firebase-config.js

[o] 7. Auth sayfaları: public/auth/register.html & public/auth/login.html — run: create both pages and assets/js/auth.js to handle register/login via firebase auth; on register create users/{uid} doc role: "student"

[o] 8. Admin seed script (scripts/seedAdmin.js) — run: create scripts/seedAdmin.js using firebase-admin (node) to mark INITIAL_ADMIN_EMAIL as admin (requires service account env); if missing, add @TODO

[o] 9. Admin panel sayfaları (public/admin/index.html, public/admin/create-teacher.html) — run: create admin UI with auth guard; create-teacher form writes to users collection with role: "teacher"

[o] 10. Firestore schema dokümanı ve seed örnek (firestore-structure.md & scripts/seedSampleData.js) — run: write firestore-structure.md and a node seed script

[o] 11. Öğretmen listesi sayfası (public/teachers/index.html) + assets/js/teachers.js — run: fetch teachers from firestore, render modern cards with image, name, subjects, price, CTA to teachers/detail.html?id=<id>

[o] 12. Öğretmen detay sayfası (public/teachers/detail.html) + assets/js/teacherDetail.js — run: show profile, availability preview, "Randevu Al" button opens booking widget

[o] 13. Booking client flow (assets/js/bookings.js) — run: implement client booking form that calls Cloud Function /createBooking via fetch and shows success/error

[o] 14. Cloud Function: createBooking (functions/index.js) — run: init functions folder (npm init), install firebase-admin & firebase-functions, implement HTTPS function createBooking that runs a Firestore transaction to prevent overlap and writes bookings/{id}

[o] 15. Booking detail page (public/bookings/detail.html) — run: show booking info, meetingLink if present, status; teacher/admin can edit meetingLink

[o] 16. Notifications: Firestore notifications collection + UI (public/notifications.html & assets/js/notifications.js) — run: implement listener for user's notifications, unread counter in header

[o] 17. Cloud Function: scheduleNotifications (functions/index.js) — run: implement scheduled function or Cloud Scheduler integration that finds bookings starting ~30min and writes notification docs for teacher & student

[o] 18. Assignments module: public/assignments/index.html + assets/js/assignments.js + Firebase Storage logic — run: create teacher assignment creation form, student view & upload submission; store files in storage and meta in assignments collection

[o] 19. Students pages: public/students/index.html (admin view all, teacher view only own students) — run: implement queries + UI with auth guard

[o] 20. Auth guard & role checks (assets/js/authGuard.js) — run: implement client-side guard helpers; sensitive ops to double-check server-side in functions where needed

[o] 21. Common header/footer components (public/components/) — run: create public/components/header.html, footer.html and client code to include them

[o] 22. Accessibility & responsive fixes, focus states, aria labels — run: run quick audit and add fixes in CSS/HTML

[o] 23. .env.local.example finalize, README run & deploy instructions update — run: ensure example env names and write README steps: firebase setup, functions deploy, Vercel deploy

[o] 24. Firebase functions local emulator & smoke test scripts (scripts/smokeBookingTest.js) — run: add emulator scripts and a test that tries concurrent bookings

[o] 25. Vercel deploy config (vercel.json) + instructions for adding env vars in Vercel — run: create vercel.json and README Vercel section

[o] 26. Prettier setup and optional husky pre-commit for formatting — run: add prettier config and pre-commit hook to run prettier --check on staged files

[o] 27. Minimal E2E smoke test (tests/smokeTest.js or Playwright) — run: add test that registers student (client), seed teacher (script), student books lesson, verify booking exists & notification created

[o] 28. Final check: npm run lint/build (if relevant), local serve of public folder, update CHECKLIST.md status and commit all — run: run smoke scripts, serve public folder and verify homepage loads

---

**STATUS LEGEND:**
- [o] = Not started
- [x] = Completed
- @TODO(reason) = Blocked, needs attention
