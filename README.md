# Yeni Nesil Sınıf

Modern online education platform with teacher booking, assignments, and notifications.

## Tech Stack
- **Frontend**: Vanilla HTML/CSS/JavaScript (separate pages)
- **Backend**: Firebase (Auth, Firestore, Storage, Cloud Functions)
- **Deployment**: Vercel (static hosting)

## Setup

1. **Firebase Setup**
   - Create Firebase project at https://console.firebase.google.com
   - Enable Authentication (Email/Password)
   - Enable Firestore Database
   - Enable Cloud Storage
   - Download service account key for Functions

2. **Local Development**
   ```bash
   # Install dependencies for Cloud Functions
   cd functions
   npm install
   
   # Copy env example and fill values
   cp .env.local.example .env.local
   ```

3. **Environment Variables**
   Add these to `.env.local`:
   - `NEXT_PUBLIC_FIREBASE_API_KEY`
   - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
   - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
   - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
   - `NEXT_PUBLIC_FIREBASE_APP_ID`
   - `FIREBASE_SERVICE_ACCOUNT` (path to service account JSON)
   - `INITIAL_ADMIN_EMAIL`

4. **Vercel Deployment**
   - Connect repo to Vercel
   - Add all environment variables in Vercel dashboard
   - Deploy will serve `public/` folder as root

## Project Structure
```
public/              # Static files (served as root)
├── index.html       # Homepage
├── auth/            # Login/Register pages
├── admin/           # Admin panel pages
├── teachers/        # Teacher list & detail
├── students/        # Student management
├── bookings/        # Booking details
├── assignments/     # Assignment management
├── notifications.html
└── assets/          # CSS, JS, images
functions/           # Firebase Cloud Functions
scripts/             # Utility scripts (seed data, admin setup)
```

## Development
```bash
# Serve public folder locally
npx serve public

# Run Firebase emulators
firebase emulators:start
```

## License
MIT
