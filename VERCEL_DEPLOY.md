# Vercel Deployment Guide

## Quick Deploy (Recommended)

1. **Vercel'e git:** https://vercel.com/new

2. **GitHub repo import:**
   - "Import Git Repository" → `omerfman/yeni-nesil-sinif`
   - Framework Preset: **Other** (vanilla HTML/CSS/JS)
   - Root Directory: **`public`** ← ÖNEMLİ!
   - Build Command: (boş bırak)
   - Output Directory: `.` (default)

3. **Environment Variables ekle:**
   ```
   FIREBASE_API_KEY=<Firebase Console'dan al>
   FIREBASE_AUTH_DOMAIN=yeni-nesil-sinif-web.firebaseapp.com
   FIREBASE_PROJECT_ID=yeni-nesil-sinif-web
   FIREBASE_STORAGE_BUCKET=yeni-nesil-sinif-web.appspot.com
   FIREBASE_MESSAGING_SENDER_ID=<Firebase Console'dan al>
   FIREBASE_APP_ID=<Firebase Console'dan al>
   ```

4. **Deploy!**

## Firebase Config Alma

Firebase Console'dan config değerlerini al:
1. https://console.firebase.google.com/project/yeni-nesil-sinif-web/settings/general
2. "Your apps" → Web app (yoksa ekle)
3. SDK configuration → Config kopyala

Örnek:
```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "yeni-nesil-sinif-web.firebaseapp.com",
  projectId: "yeni-nesil-sinif-web",
  storageBucket: "yeni-nesil-sinif-web.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};
```

Bu değerleri:
1. `public/assets/js/lib/firebase-config.js` dosyasına yapıştır
2. Vercel Environment Variables'a ekle

## CLI ile Deploy (Alternatif)

```powershell
npm install -g vercel
cd "d:\islerim\Yeni Nesil Sınıf\YNS-web\public"
vercel
```

İlk deploy'da:
- Project name: `yeni-nesil-sinif`
- Directory: `.` (public içindesin)
- Override settings: No

## Domain & Production

Vercel'de:
- Production URL: `yeni-nesil-sinif.vercel.app`
- Custom domain ekleyebilirsin (Settings → Domains)

## Post-Deploy

1. **Firebase Functions URL güncelle:**
   - Cloud Functions deploy edildikten sonra URL'leri al
   - `public/assets/js/bookings.js` içinde function URL'lerini güncelle

2. **Test:**
   - Vercel URL'yi aç
   - Register/login test et
   - Öğretmen listesi görüntüle
   - Booking flow test et

## Troubleshooting

**404 hatası:** Vercel.json'da rewrites var mı kontrol et
**Firebase connection error:** Environment variables doğru mu?
**CORS hatası:** Cloud Functions CORS ayarları kontrol et
