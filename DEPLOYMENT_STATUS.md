# Deployment Summary

## ✅ Tamamlanan

1. **GitHub:** https://github.com/omerfman/yeni-nesil-sinif
2. **Firebase Config:** Eklendi ve commit edildi
3. **Firestore Database:** Test mode'da aktif
4. **Firebase Authentication:** Email/Password enabled

## ⚠️ Manuel Adımlar

### 1. Firestore Security Rules (Manuel)
https://console.firebase.google.com/project/yeni-nesil-sinif-adm/firestore/rules

`firestore.rules` dosyasındaki kuralları kopyala-yapıştır ve "Publish" tıkla.

### 2. Firebase Functions (Opsiyonel - Ücretli)
Cloud Functions için Blaze Plan gerekli:
- https://console.firebase.google.com/project/yeni-nesil-sinif-adm/usage
- "Upgrade to Blaze" → Ödeme bilgisi ekle
- Sonra: `firebase deploy --only functions`

**Functions olmadan:** Booking overlap kontrolü client-side yapılacak (güvenlik riski var ama basit demo için yeterli).

## 🚀 Vercel Deployment

### Otomatik Deploy (Önerilen)

1. https://vercel.com/new
2. GitHub repo seç: `omerfman/yeni-nesil-sinif`
3. **Configure Project:**
   - Framework Preset: **Other**
   - Root Directory: **`public`** ⬅️ ÖNEMLİ
   - Build Command: (boş)
   - Output Directory: `.`

4. **Environment Variables:**
   ```
   FIREBASE_API_KEY=AIzaSyAe51HzG6O-xyv6ZlgP9Z9MQWUq4-aQ_kg
   FIREBASE_AUTH_DOMAIN=yeni-nesil-sinif-adm.firebaseapp.com
   FIREBASE_PROJECT_ID=yeni-nesil-sinif-adm
   FIREBASE_STORAGE_BUCKET=yeni-nesil-sinif-adm.firebasestorage.app
   FIREBASE_MESSAGING_SENDER_ID=50832277016
   FIREBASE_APP_ID=1:50832277016:web:d8b6114a2c99d6ab31cd6d
   FIREBASE_MEASUREMENT_ID=G-QWF8L7WEKT
   ```

5. **Deploy!**

### CLI Deploy (Alternatif)

```powershell
npm install -g vercel
cd "d:\islerim\Yeni Nesil Sınıf\YNS-web\public"
vercel --prod
```

## 📝 Post-Deploy Checklist

- [ ] Firestore rules yayınlandı mı?
- [ ] Vercel deploy başarılı mı?
- [ ] Authentication çalışıyor mu? (Register/Login test et)
- [ ] Öğretmen listesi görünüyor mu?
- [ ] (Opsiyonel) Cloud Functions deploy edildi mi?

## 🎯 Production URL

Deploy sonrası: `https://yeni-nesil-sinif.vercel.app` (veya custom domain)

## 🔧 Seed Data (İlk Kullanıcı Oluşturma)

1. Service Account key indir:
   - https://console.firebase.google.com/project/yeni-nesil-sinif-adm/settings/serviceaccounts
   - "Generate new private key"
   - `scripts/` klasörüne kaydet

2. `.env.local` oluştur:
   ```env
   FIREBASE_SERVICE_ACCOUNT_PATH=./service-account.json
   INITIAL_ADMIN_EMAIL=admin@example.com
   ```

3. Seed scripts çalıştır:
   ```powershell
   cd scripts
   npm install
   node seedAdmin.js
   node seedSampleData.js
   ```
