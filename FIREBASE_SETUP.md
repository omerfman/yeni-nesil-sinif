# Firebase Setup Talimatları

## 1. Firebase Console Setup (Manuel)

### a) Firestore Database
1. https://console.firebase.google.com/project/yeni-nesil-sinif-web
2. Build → Firestore Database → Create database
3. Start in **test mode** (geçici)
4. Location: `europe-west1`
5. Enable

### b) Storage
1. Build → Storage → Get started
2. Start in **test mode** (geçici)
3. Location: `europe-west1` (Firestore ile aynı)
4. Done

### c) Authentication
1. Build → Authentication → Get started
2. Sign-in method → Email/Password → Enable
3. Save

## 2. Security Rules Deploy

Console setup tamamlandıktan sonra:

```powershell
cd "d:\islerim\Yeni Nesil Sınıf\YNS-web"
firebase deploy --only firestore:rules,storage:rules
```

## 3. Cloud Functions Deploy

```powershell
cd "d:\islerim\Yeni Nesil Sınıf\YNS-web"
firebase deploy --only functions
```

## 4. Firebase Config

Firebase Console → Project Settings → General → "Your apps" kısmından:
- Web app ekle (eğer yoksa)
- SDK configuration kopyala
- `public/assets/js/lib/firebase-config.js` dosyasına yapıştır

## 5. Service Account (Admin Seed Script için)

Project Settings → Service Accounts → Generate new private key
- JSON dosyasını indir
- `scripts/` klasörüne kaydet
- `.env.local` oluştur:

```env
FIREBASE_SERVICE_ACCOUNT_PATH=./service-account.json
INITIAL_ADMIN_EMAIL=admin@example.com
```

## 6. Seed Data

```powershell
cd scripts
npm install
node seedAdmin.js
node seedSampleData.js
```

## 7. Test

Local server başlat:
```powershell
npx serve public
```

http://localhost:3000 aç ve test et.
