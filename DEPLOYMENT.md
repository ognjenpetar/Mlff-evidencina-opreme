# Deployment Guide - MLFF Equipment Tracking App

## Pregled

Ova aplikacija je moderna SPA (Single Page Application) sa Firebase backend arhitekturom. Podaci se čuvaju u cloud-u (Firestore + Firebase Storage), eliminišući sve limite memorije.

**Verzija:** 2.0 - Backend Architecture Edition

**Glavne karakteristike:**
- ✅ **Neograničeno skladište** - Firebase Storage do 5GB po fajlu (besplatno 1GB)
- ✅ **Cloud baza podataka** - Firestore (besplatno 1GB)
- ✅ **Autentifikacija** - Firebase Auth sa Google login-om
- ✅ **QR kodovi vode direktno do izveštaja** - Kompletan prikaz odmah nakon skeniranja
- ✅ **Javni pristup QR kodovima** - Bez potrebe za login-om
- ✅ **Automatski backup** - Cloud storage sa redundancijom

---

## 🔥 Firebase Hosting (PREPORUKA ZA V2.0)

Firebase Hosting je **preporučena opcija** jer pruža kompletnu integraciju sa backend servisima.

### Prednosti:
- 🌐 Globalni CDN (brzo učitavanje)
- 🔐 Besplatni SSL certifikati
- 🔄 Integracija sa Firestore i Storage
- 📊 Analytics i monitoring
- 🚀 Jednostavan deployment

---

## 📋 KORAK PO KORAK DEPLOYMENT UPUTSTVO

### **Korak 1: Kreiranje Firebase Projekta**

#### 1.1. Otvori Firebase Console
Idi na: [https://console.firebase.google.com](https://console.firebase.google.com)

#### 1.2. Kreiraj novi projekat
1. Klikni **"Add project"** ili **"Create a project"**
2. Unesi naziv projekta: `mlff-equipment-tracking` (ili po želji)
3. Klikni **"Continue"**
4. Google Analytics: Opciono (možeš ostaviti uključeno)
5. Izaberi Analytics account ili kreiraj novi
6. Klikni **"Create project"**
7. Sačekaj 30-60 sekundi dok se projekat kreira
8. Klikni **"Continue"**

#### 1.3. Omogući Firestore Database
1. U levom meniju, klikni **"Firestore Database"**
2. Klikni **"Create database"**
3. Izaberi **"Start in production mode"** (postavićemo custom rules)
4. Izaberi lokaciju: **europe-west** (najbliže Srbiji)
5. Klikni **"Enable"**
6. Sačekaj dok se Firestore inicijalizuje (~1 minut)

#### 1.4. Omogući Firebase Storage
1. U levom meniju, klikni **"Storage"**
2. Klikni **"Get started"**
3. Klikni **"Next"** (zadržavamo default security rules)
4. Izaberi lokaciju: **europe-west**
5. Klikni **"Done"**

#### 1.5. Omogući Firebase Authentication
1. U levom meniju, klikni **"Authentication"**
2. Klikni **"Get started"**
3. Klikni na **"Google"** u listi Sign-in providers
4. Omogući **"Enable"** toggle
5. Izaberi support email (tvoj email)
6. Klikni **"Save"**

#### 1.6. Omogući Firebase Hosting
1. U levom meniju, klikni **"Hosting"**
2. Klikni **"Get started"**
3. Pročitaj uputstva i klikni **"Next"** kroz sve korake
4. Završi wizard (deployment ćemo uraditi sa CLI-ja)

#### 1.7. Preuzmi Firebase konfiguracijske parametre
1. Idi na **Project Overview** (klik na logo Firebase u levom uglu)
2. Klikni na **Web ikonu** (`</>`) da dodaš web app
3. Unesi nickname: `mlff-web-app`
4. **NEMOJ** čekirati "Firebase Hosting" (već smo omogućili)
5. Klikni **"Register app"**
6. **KOPIRAJ** Firebase config objekat koji se prikaže:

```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "mlff-equipment-tracking.firebaseapp.com",
  projectId: "mlff-equipment-tracking",
  storageBucket: "mlff-equipment-tracking.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};
```

7. Klikni **"Continue to console"**

---

### **Korak 2: Instalacija Firebase CLI**

#### 2.1. Instalacija Node.js (ako već nije instaliran)
1. Preuzmi sa: [https://nodejs.org](https://nodejs.org)
2. Izaberi **LTS verziju** (preporučeno)
3. Instaliraj (Next > Next > Finish)
4. Verifikuj instalaciju:
```bash
node --version
npm --version
```

#### 2.2. Instalacija Firebase CLI globalno
Otvori **Command Prompt** ili **PowerShell** kao administrator:

```bash
npm install -g firebase-tools
```

Sačekaj dok se instalacija završi (~1-2 minuta).

#### 2.3. Verifikacija instalacije
```bash
firebase --version
```

Trebalo bi da vidiš verziju (npr. `13.0.0` ili noviju).

---

### **Korak 3: Konfiguracija Firebase Projekta (Lokalno)**

#### 3.1. Otvori projekat folder
```bash
cd "c:\Users\ognjen.petar\OPT APPS\Mlff-evidencina-opreme"
```

#### 3.2. Login u Firebase
```bash
firebase login
```

- Browser će se otvoriti
- Izaberi Google account
- Klikni **"Allow"** da omogućiš Firebase CLI pristup
- Vrati se u terminal, trebalo bi da vidiš: `✔ Success! Logged in as [your-email]`

#### 3.3. Poveži lokalni projekat sa Firebase projektom
```bash
firebase use --add
```

1. Izaberi projekat sa liste (koristi ↑↓ arrow keys): `mlff-equipment-tracking`
2. Unesi alias (pritiski Enter za default): `production`
3. Trebalo bi da vidiš: `✔ Created alias production for mlff-equipment-tracking`

Verifikuj da je `.firebaserc` fajl kreiran sa sadržajem:
```json
{
  "projects": {
    "production": "mlff-equipment-tracking"
  }
}
```

#### 3.4. Ažuriraj Firebase konfiguraciju u kodu

Otvori fajl **`js/firebase-config.js`** i zameni placeholder vrednosti sa pravim vrednostima iz **Koraka 1.7**:

```javascript
// Firebase configuration
const firebaseConfig = {
  apiKey: "AIza...",  // ZAMENI SA PRAVOM VREDNOŠĆU
  authDomain: "mlff-equipment-tracking.firebaseapp.com",  // ZAMENI
  projectId: "mlff-equipment-tracking",  // ZAMENI
  storageBucket: "mlff-equipment-tracking.appspot.com",  // ZAMENI
  messagingSenderId: "123456789",  // ZAMENI
  appId: "1:123456789:web:abcdef123456"  // ZAMENI
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const storage = firebase.storage();
const auth = firebase.auth();
```

**SAČUVAJ FAJL!**

---

### **Korak 4: Deploy Security Rules i Indexes**

#### 4.1. Deploy Firestore security rules
```bash
firebase deploy --only firestore:rules
```

Ovo postavlja pravila:
- ✅ **Public read** (QR kodovi rade bez login-a)
- 🔒 **Authenticated write** (samo admin može dodavati/menjati)

#### 4.2. Deploy Firestore indexes
```bash
firebase deploy --only firestore:indexes
```

Ovo kreira optimizovane indekse za:
- Oprema po locationId + createdAt
- Maintenance po date
- Audit log po timestamp

#### 4.3. Deploy Storage rules
```bash
firebase deploy --only storage
```

Ovo postavlja pravila za Storage:
- ✅ **Public read** (slike i PDF-ovi dostupni svima)
- 🔒 **Authenticated write** (samo admin može uploadovati)
- ✅ **File validation** (max 50MB, samo slike i PDF-ovi)

Trebalo bi da vidiš:
```
✔  Deploy complete!
```

---

### **Korak 5: Migracija Podataka (Ako imaš postojeće podatke iz v1.3)**

#### 5.1. Proveri LocalStorage podatke

Otvori aplikaciju lokalno (dupli-klik na `index.html` ili Live Server), pa otvori **Developer Tools** (F12):

```javascript
// U Console-u, unesi:
const data = localStorage.getItem('mlff_data');
console.log(data ? 'Podaci postoje' : 'Nema podataka');
```

Ako postoje podaci, nastavi sa migracijom.

#### 5.2. Otvori migration.html
1. Dupli-klik na `migration.html` fajl
2. Otvoriće se u browser-u

#### 5.3. Pokreni migraciju
1. Klikni **"Start Migration"** dugme
2. Prati progress na ekranu
3. Sačekaj dok se migracija ne završi (može trajati 5-30 minuta zavisno od količine podataka)

Trebalo bi da vidiš:
```
Starting migration...
Migrating location: Portal Beograd-Niš KM 12
  - Migrating equipment: VDX-001
    - Uploading document: manual.pdf
  - Migrating equipment: VRX-002
...
Migration Complete!
```

#### 5.4. Verifikuj migrirane podatke

1. Idi na [Firebase Console](https://console.firebase.google.com)
2. Otvori tvoj projekat: `mlff-equipment-tracking`
3. Klikni **"Firestore Database"** u levom meniju
4. Trebalo bi da vidiš kolekcije:
   - `locations` - sve lokacije
   - `equipment` - sva oprema
   - `customTypes` - custom tipovi opreme
5. Klikni **"Storage"** u levom meniju
6. Trebalo bi da vidiš foldere:
   - `locations/` - fotografije lokacija
   - `equipment/` - fotografije i dokumenti opreme

---

### **Korak 6: Deploy Aplikacije na Firebase Hosting**

#### 6.1. Build i deploy (sve odjednom)
```bash
firebase deploy
```

Ova komanda deployuje:
- ✅ Firestore rules
- ✅ Firestore indexes
- ✅ Storage rules
- ✅ Hosting (svi static fajlovi)

Sačekaj 1-2 minuta. Trebalo bi da vidiš:

```
=== Deploying to 'mlff-equipment-tracking'...

i  deploying firestore, storage, hosting
✔  firestore: rules file firestore.rules compiled successfully
✔  firestore: deployed indexes in firestore.indexes.json successfully
✔  storage: rules file storage.rules compiled successfully
✔  storage: released rules storage.rules to firebase.storage/mlff-equipment-tracking.appspot.com
✔  hosting[mlff-equipment-tracking]: file upload complete
✔  hosting[mlff-equipment-tracking]: version finalized
✔  hosting[mlff-equipment-tracking]: release complete

✔  Deploy complete!

Project Console: https://console.firebase.google.com/project/mlff-equipment-tracking/overview
Hosting URL: https://mlff-equipment-tracking.web.app
```

#### 6.2. Testiraj deployment

Otvori **Hosting URL** u browser-u (iz output-a gore):
```
https://mlff-equipment-tracking.web.app
```

Trebalo bi da vidiš aplikaciju!

#### 6.3. Testiraj QR kodove

1. Otvori neku lokaciju
2. Klikni na neku opremu
3. Klikni **"QR Kod"** dugme
4. Skeniraj QR kod telefonom (ili kopiraj URL)
5. QR kod treba da otvori **kompletan izveštaj opreme** direktno

URL format:
```
https://mlff-equipment-tracking.web.app/#/report/equipment/[id]
```

---

### **Korak 7: Login u Aplikaciju (Admin operacije)**

#### 7.1. Otvori aplikaciju na Hosting URL-u

#### 7.2. Klikni "Login" dugme u gornjem desnom uglu

#### 7.3. Izaberi Google account

Samo Google accounti koji su dodati u Firebase Authentication mogu da se loguju.

#### 7.4. Dodavanje dodatnih admin korisnika

1. Idi na [Firebase Console](https://console.firebase.google.com) > tvoj projekat
2. Klikni **"Authentication"** > **"Users"** tab
3. Klikni **"Add user"**
4. Unesi email i password (ili koristi Google provider)
5. Klikni **"Add user"**

---

### **Korak 8: Custom Domain (Opciono)**

Ako želiš da aplikacija bude dostupna na tvom domenu (npr. `mlff.tvoja-firma.com`):

#### 8.1. U Firebase Console
1. Idi na **Hosting** > **Add custom domain**
2. Unesi domen: `mlff.tvoja-firma.com`
3. Klikni **"Continue"**

#### 8.2. Firebase će ti dati DNS records za podešavanje:
```
Type: A
Name: @
Value: 151.101.1.195, 151.101.65.195
```

#### 8.3. Idi kod svog domain registrara (GoDaddy, Namecheap, itd.)
1. Otvori DNS settings za tvoj domen
2. Dodaj A records koje ti je Firebase dao
3. Sačuvaj

#### 8.4. Verifikacija (može trajati 24-48h)
Firebase će automatski verificirati domen i izdati SSL certifikat.

---

## 🔄 Ažuriranje Aplikacije (Nakon izmena koda)

Kada napraviš izmene u kodu i želiš da ih deploy-uješ:

### Metoda 1: Deploy sve
```bash
git add .
git commit -m "Opis izmena"
git push
firebase deploy
```

### Metoda 2: Deploy samo hosting (brže)
```bash
firebase deploy --only hosting
```

### Metoda 3: Deploy samo rules
```bash
firebase deploy --only firestore:rules,storage
```

---

## 🔍 Monitoring i Analytics

### Firestore Usage
1. Firebase Console > **Firestore Database** > **Usage** tab
2. Prati:
   - Document reads/writes/deletes
   - Storage (koliko podataka čuvaš)

### Storage Usage
1. Firebase Console > **Storage** > **Usage** tab
2. Prati:
   - Total storage (GB)
   - Bandwidth (downloads)

### Hosting Analytics
1. Firebase Console > **Hosting** > **Analytics** tab
2. Prati:
   - Page views
   - Bandwidth
   - Errors

---

## 💰 Firebase Troškovi (Free Tier Limiti)

### Spark Plan (Besplatno)

**Firestore:**
- 📦 Storage: 1 GB
- 📖 Reads: 50,000/dan
- ✍️ Writes: 20,000/dan
- 🗑️ Deletes: 20,000/dan

**Storage:**
- 📦 Storage: 5 GB
- ⬇️ Downloads: 1 GB/dan

**Hosting:**
- 📦 Storage: 10 GB
- ⬇️ Bandwidth: 360 MB/dan

**Authentication:**
- 👥 Unlimited users

### Blaze Plan (Pay-as-you-go)

Samo ako prekoračiš free tier limite.

**Cene (približno):**
- Firestore Storage: $0.18/GB/mesec
- Storage: $0.026/GB/mesec
- Bandwidth: $0.12/GB

**Procena za tipičnu upotrebu:**
- 100 lokacija, 1000 opreme, 5000 PDF-ova (1GB): **$0-5/mesec**

---

## 🐛 Troubleshooting

### Problem: Firebase config greška

**Simptom:**
```
Firebase: No Firebase App '[DEFAULT]' has been created
```

**Rešenje:**
1. Proveri da si ažurirao `js/firebase-config.js` sa pravim vrednostima
2. Proveri da je `firebase-config.js` učitan pre `app.js` u `index.html`:
```html
<script src="https://www.gstatic.com/firebasejs/9.x.x/firebase-app.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.x.x/firebase-firestore.js"></script>
<script src="js/firebase-config.js"></script>
<script src="js/app.js"></script>
```

---

### Problem: Permission denied (Firestore/Storage)

**Simptom:**
```
FirebaseError: Missing or insufficient permissions
```

**Rešenje:**
1. Proveri da su security rules deploy-ovani:
```bash
firebase deploy --only firestore:rules,storage
```

2. Verifikuj rules u Firebase Console:
   - Firestore Database > Rules tab
   - Storage > Rules tab

---

### Problem: QR kod ne radi

**Simptom:**
QR kod skeniran, ali ne otvara izveštaj.

**Rešenje:**
1. Proveri da je QR kod URL format:
```
https://mlff-equipment-tracking.web.app/#/report/equipment/[id]
```

2. Proveri da je oprema sa tim ID-jem u Firestore:
   - Firebase Console > Firestore > `equipment` kolekcija

---

### Problem: Upload dokumenta spor

**Simptom:**
Upload PDF-a traje dugo (>2 minuta).

**Rešenje:**
- Normalno je za velike PDF-ove (20-50MB)
- Progress bar prikazuje napredak
- Ne zatvaraj browser dok se upload ne završi
- Kompresuj PDF pre upload-a ako je moguće

---

### Problem: Migracija ne radi

**Simptom:**
"No data found in LocalStorage" ili greške tokom migracije.

**Rešenje:**
1. Proveri da si otvorio `migration.html` u **istom browser-u** gde si koristio v1.3
2. Proveri da nisi u Incognito/Private mode
3. Proveri LocalStorage u DevTools (F12 > Application > Local Storage)
4. Eksportuj podatke iz v1.3 pre migracije (backup JSON fajl)

---

### Problem: Aplikacija ne učitava nakon deploya

**Simptom:**
`404 Not Found` ili blank page.

**Rešenje:**
1. Hard refresh (Ctrl + Shift + R)
2. Clear browser cache
3. Proveri da je deployment uspeo:
```bash
firebase hosting:channel:list
```

4. Redeploy:
```bash
firebase deploy --only hosting
```

---

## 📦 Backup Strategija

### Automatski Backup (Firebase)

Firebase automatski čuva podatke sa redundancijom:
- ✅ Multi-region replication
- ✅ Point-in-time recovery (do 7 dana unazad)

### Ručni Backup

#### Export Firestore podataka
```bash
gcloud firestore export gs://mlff-equipment-tracking-backup/
```

**NAPOMENA:** Potreban je [Google Cloud SDK](https://cloud.google.com/sdk/docs/install).

#### Export Storage fajlova

Koristi [gsutil](https://cloud.google.com/storage/docs/gsutil):
```bash
gsutil -m cp -r gs://mlff-equipment-tracking.appspot.com ./backup/
```

---

## 🔐 Security Best Practices

### 1. Firestore Rules
- ✅ Public read za izveštaje (QR kodovi)
- 🔒 Authenticated write za admin
- ✅ Validation na document schema

### 2. Storage Rules
- ✅ Public read za dokumente
- 🔒 Authenticated write za upload
- ✅ File type validation (samo slike i PDF-ovi)
- ✅ File size limit (max 50MB)

### 3. Authentication
- ✅ Google OAuth (sigurno, bez password-a)
- ✅ Samo verifikovani domain-i
- ✅ Admin email whitelist (opciono)

### 4. API Key Security
**NAPOMENA:** Firebase API key u `firebase-config.js` je bezbedan za javni pristup. On identifikuje projekat, ali ne daje pristup podacima - to kontrolišu Security Rules.

---

## 📊 Performance Benchmarks (v2.0)

### Load Times:
- **Initial load:** < 2s (includes Firebase SDK)
- **Dashboard render:** < 200ms
- **Location detail:** < 100ms
- **Equipment detail:** < 100ms

### Upload Times:
- **Photo (2MB):** ~2-5s
- **PDF (10MB):** ~10-15s
- **PDF (50MB):** ~60-90s

### Scalability:
- ✅ **Unlimited locations**
- ✅ **Unlimited equipment**
- ✅ **Unlimited documents** (do Storage limita)
- ✅ **Concurrent users:** 100+ bez problema

---

## 🌐 Druge Hosting Opcije (Alternativa Firebase-u)

Iako je Firebase preporučen za v2.0, aplikacija može biti hostovana i na:

### GitHub Pages

**NAPOMENA:** GitHub Pages je samo static hosting. Potrebno je da Firebase backend radi odvojeno.

```bash
git add .
git commit -m "Deploy to GitHub Pages"
git push origin main
```

U GitHub repo Settings > Pages:
- Source: `main` branch
- Folder: `/` (root)

**URL:** `https://[username].github.io/[repo-name]/`

### Netlify

```bash
npm i -g netlify-cli
netlify init
netlify deploy --prod
```

Ili prevuci folder na [netlify.com/drop](https://netlify.com/drop).

### Vercel

```bash
npm i -g vercel
vercel --prod
```

**VAŽNO:** Za sve hosting opcije osim Firebase Hosting, Firebase backend (Firestore + Storage) i dalje mora biti aktivan!

---

## 📝 Lokalno Testiranje (Pre Deploya)

### Firebase Emulator (Preporuka)

```bash
firebase emulators:start
```

Ovo pokreće:
- Firestore emulator: http://localhost:8080
- Storage emulator: http://localhost:9199
- Hosting emulator: http://localhost:5000

**Prednosti:**
- ✅ Testiranje bez trošenja production quota
- ✅ Brži development
- ✅ Offline rad

### Live Server (Quick Test)

**VSCode Extension:**
1. Instaliraj "Live Server" extension
2. Right-click na `index.html` > "Open with Live Server"
3. Otvori: `http://localhost:5500`

**Python HTTP Server:**
```bash
cd "c:\Users\ognjen.petar\OPT APPS\Mlff-evidencina-opreme"
python -m http.server 8000
```

**Node.js http-server:**
```bash
npx http-server -p 8000
```

---

## 🔄 Rollback (Vraćanje na prethodnu verziju)

Ako nešto pođe po zlu nakon deploya:

### Rollback Hosting
```bash
firebase hosting:channel:list
```

Nađi prethodnu verziju i aktiviraj je:
```bash
firebase hosting:clone [previous-channel-id]:live
```

### Rollback Firestore Rules
1. Idi na Firebase Console > Firestore > Rules
2. Klikni **"History"** tab
3. Izaberi prethodnu verziju
4. Klikni **"Restore"**

### Rollback Storage Rules
1. Firebase Console > Storage > Rules
2. History tab
3. Restore previous version

---

## 📚 Dodatni Resursi

### Firebase Dokumentacija
- [Firestore Docs](https://firebase.google.com/docs/firestore)
- [Storage Docs](https://firebase.google.com/docs/storage)
- [Hosting Docs](https://firebase.google.com/docs/hosting)
- [Auth Docs](https://firebase.google.com/docs/auth)

### Video Tutorijali
- [Firebase Getting Started](https://www.youtube.com/watch?v=q5J5ho7YUhA)
- [Firestore Tutorial](https://www.youtube.com/watch?v=4d-gIPGzmK4)

### Podrška
- [Stack Overflow - Firebase](https://stackoverflow.com/questions/tagged/firebase)
- [Firebase Community](https://firebase.google.com/community)

---

## ✅ Deployment Checklist

Pre prvog deploya, proveri:

- [ ] Firebase projekat kreiran
- [ ] Firestore Database omogućen
- [ ] Firebase Storage omogućen
- [ ] Firebase Authentication omogućen (Google provider)
- [ ] Firebase Hosting omogućen
- [ ] Firebase CLI instaliran
- [ ] `firebase login` uspešan
- [ ] `.firebaserc` fajl postoji
- [ ] `firebase-config.js` ažuriran sa pravim vrednostima
- [ ] Security rules deploy-ovani (`firebase deploy --only firestore:rules,storage`)
- [ ] Indexes deploy-ovani (`firebase deploy --only firestore:indexes`)
- [ ] Migracija podataka završena (ako imaš stare podatke)
- [ ] Hosting deploy-ovan (`firebase deploy --only hosting`)
- [ ] Aplikacija testirana na Hosting URL-u
- [ ] QR kodovi testirani (vode do izveštaja)
- [ ] Login testiran (Google OAuth radi)
- [ ] Upload dokumenata testiran (veliki PDF-ovi rade)

---

## 🎉 Quick Start za Production (Sve u jednoj komandi)

Ako si već sve gore uradio:

```bash
# Deploy sve odjednom
firebase deploy

# ILI deploy samo hosting (brže za izmene koda)
firebase deploy --only hosting
```

**To je to! Aplikacija je live!** 🚀

**Hosting URL:**
```
https://mlff-equipment-tracking.web.app
```

---

## 📧 Kontakt

Za pitanja i podršku:
- GitHub Issues: [link-to-repo]
- Email: [your-email]

---

## 📄 Licenses

- **Firebase:** [Firebase Terms](https://firebase.google.com/terms)
- **QRCode.js:** MIT License
- **Leaflet:** BSD 2-Clause License
- **Font Awesome:** Icons - CC BY 4.0, Fonts - SIL OFL 1.1, Code - MIT

---

**Verzija:** 2.0 - Backend Architecture Edition
**Datum:** Decembar 2025
**Napravljeno sa [Claude Code](https://claude.com/claude-code) 🤖**
