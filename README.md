# 📋 Evidencija MLFF Opreme - Orion E-mobility

**Verzija 2.0** - Backend Architecture Edition

Sistem za evidenciju i praćenje opreme na MLFF (Multi-Lane Free-Flow) naplatnim portalima sa neograničenim cloud storage-om.

---

## 🌟 Glavne Karakteristike

### ✅ Neograničeni Storage
- **Firebase Cloud Storage** - bez LocalStorage ograničenja
- **Upload dokumenata do 50MB** - umesto prethodnih 10MB
- **Neograničen broj slika i PDF-ova**
- **Automatski backup na cloud-u**

### 🔗 QR Kodovi Vode Direktno do Izveštaja
- **Skeniranjem QR koda** odmah se otvara kompletan izveštaj opreme
- **Sve informacije dostupne** bez dodatnih klikova
- **Javno dostupni izveštaji** - ne zahtevaju login

### 🔐 Sigurnost i Autentifikacija
- **Google OAuth login** za administratore
- **Javni pristup QR kodovima** i izveštajima
- **Zaštićene admin operacije** (dodavanje, izmena, brisanje)
- **Firestore security rules** - public read, auth write

### 📱 Responsivni Dizajn
- **Desktop, tablet, mobilni** uređaji podržani
- **Interaktivna mapa** sa OpenStreetMap podlogom
- **In-app prikaz izveštaja** bez downloada
- **Dark theme** optimizovan za čitljivost

---

## 🏗️ Arhitektura

### Frontend
- **HTML5 + CSS3 + Vanilla JavaScript**
- **SPA (Single Page Application)** sa hash routing-om
- **Firebase SDK** za komunikaciju sa backend-om
- **Hosted na Firebase Hosting**

### Backend
- **Firebase Firestore** - NoSQL baza podataka
- **Firebase Storage** - Cloud file storage
- **Firebase Auth** - Google OAuth autentifikacija
- **Firebase Hosting** - Static site hosting

```
┌─────────────────────────────────────────┐
│         Frontend (SPA)                  │
│  ┌─────────────────────────────────┐   │
│  │  index.html                     │   │
│  │  js/app.js                      │   │
│  │  js/router.js                   │   │
│  │  js/firebase-service.js         │   │
│  │  css/styles.css                 │   │
│  └─────────────────────────────────┘   │
└──────────────┬──────────────────────────┘
               │ Firebase SDK
               ▼
┌─────────────────────────────────────────┐
│         Firebase Backend                │
│  ┌─────────────────────────────────┐   │
│  │  Firestore Database             │   │
│  │    - locations/                 │   │
│  │    - equipment/                 │   │
│  │    - equipment/{id}/documents/  │   │
│  │    - equipment/{id}/maintenance/│   │
│  │    - equipment/{id}/auditLog/   │   │
│  │    - customTypes/               │   │
│  └─────────────────────────────────┘   │
│  ┌─────────────────────────────────┐   │
│  │  Firebase Storage               │   │
│  │    - /locations/{id}/photo/     │   │
│  │    - /equipment/{id}/photo/     │   │
│  │    - /equipment/{id}/documents/ │   │
│  └─────────────────────────────────┘   │
│  ┌─────────────────────────────────┐   │
│  │  Firebase Auth                  │   │
│  │    - Google OAuth               │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

---

## 🚀 Brzi Start

### Preduslov
- Node.js instaliran (za Firebase CLI)
- Google nalog (za Firebase Console)
- Git instaliran

### 1. Firebase Project Setup

1. **Kreirajte Firebase projekt:**
   - Idite na [Firebase Console](https://console.firebase.google.com)
   - Kliknite "Add project"
   - Unesite naziv: `mlff-equipment-tracking`
   - Kreirajte projekat

2. **Dobijte Firebase konfiguraciju:**
   - U Firebase Console, idite na Project Settings (⚙️)
   - Scroll do "Your apps" sekcije
   - Kliknite web ikonu `</>`
   - Kopirajte `firebaseConfig` objekat

3. **Ažurirajte konfiguraciju:**
   - Otvorite `js/firebase-config.js`
   - Zamenite placeholder vrednosti sa vašim Firebase config-om

### 2. Firebase CLI Setup

```bash
# Instalirajte Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Inicijalizujte projekat
cd "c:\Users\ognjen.petar\OPT APPS\Mlff-evidencina-opreme"
firebase init

# Izaberite:
# - Firestore
# - Storage
# - Hosting

# Deploy
firebase deploy
```

### 3. Migracija Podataka (Opciono)

Ako imate postojeće podatke u LocalStorage:

1. Otvorite `migration.html` u browser-u
2. Kliknite "Pokreni Migraciju"
3. Sačekajte da se migracija završi
4. Proverite podatke u Firebase Console
5. Obrišite LocalStorage podatke (opciono)

---

## 📚 Dokumentacija

- **[UPUTSTVO_ZA_KORISCENJE.md](UPUTSTVO_ZA_KORISCENJE.md)** - Detaljno uputstvo za korišćenje aplikacije
- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Korak-po-korak deployment guide
- **[BACKEND_GUIDE.md](BACKEND_GUIDE.md)** - Tehnička dokumentacija backend arhitekture
- **[OPIS_APLIKACIJE.txt](OPIS_APLIKACIJE.txt)** - Kompletan opis funkcionalnosti

---

## 💡 Kako Radi?

### Dodavanje Lokacije

1. Na dashboard-u kliknite "Dodaj Lokaciju"
2. Unesite naziv, GPS koordinate, opis
3. Opciono: dodajte fotografiju
4. Kliknite "Sačuvaj"
5. **Podaci se čuvaju u Firestore**, fotografija u Firebase Storage

### Dodavanje Opreme

1. Otvorite lokaciju
2. Kliknite "Dodaj Opremu"
3. Unesite inventarski broj i tip opreme (obavezno)
4. Opciono: dodajte ostale podatke, fotografiju, PDF dokumente
5. Kliknite "Sačuvaj"
6. **Metapodaci u Firestore**, fajlovi u Firebase Storage

### QR Kod Skeniranje

1. Otvorite detalje opreme
2. Kliknite "QR Kod"
3. Štampajte ili preuzmite QR kod
4. **Skeniranjem QR koda** odmah se otvara kompletan izveštaj:
   - URL format: `https://your-app.web.app/#/report/equipment/{id}`
   - Prikazuje sve informacije o opremi
   - Dostupno bez login-a

### Upload Dokumenata

1. Otvorite opremu
2. Kliknite "Dodaj Dokumentaciju (PDF)"
3. Izaberite jedan ili više PDF fajlova (do 50MB svaki)
4. **Fajlovi se uploaduju na Firebase Storage**
5. **Metadata se čuva u Firestore subcollection**

---

## 🔧 Tehnologije

### Frontend
- HTML5
- CSS3 (Custom Properties, Grid, Flexbox)
- JavaScript ES6+ (Vanilla, bez framework-a)
- QRCode.js - QR kod generisanje
- Leaflet.js - OpenStreetMap integracija
- Font Awesome - Ikone

### Backend
- Firebase Firestore - NoSQL baza
- Firebase Storage - File storage
- Firebase Auth - OAuth autentifikacija
- Firebase Hosting - Static hosting

### Development Tools
- Git & GitHub
- Firebase CLI
- VSCode

---

## 📊 Struktura Fajlova

```
Mlff-evidencina-opreme/
├── index.html                    # Glavna HTML stranica
├── migration.html                # Migration tool (LocalStorage → Firebase)
│
├── css/
│   └── styles.css               # Svi stilovi
│
├── js/
│   ├── app.js                   # Glavna aplikaciona logika
│   ├── router.js                # SPA routing
│   ├── firebase-config.js       # Firebase konfiguracija
│   └── firebase-service.js      # Firebase operacije
│
├── firestore.rules              # Firestore security rules
├── storage.rules                # Storage security rules
├── firebase.json                # Firebase hosting config
├── .firebaserc                  # Firebase project config
├── firestore.indexes.json       # Firestore indexes
│
├── README.md                    # Ovaj fajl
├── UPUTSTVO_ZA_KORISCENJE.md   # Detaljno uputstvo
├── DEPLOYMENT.md                # Deployment guide
├── BACKEND_GUIDE.md             # Backend dokumentacija
└── OPIS_APLIKACIJE.txt          # Kompletan opis
```

---

## 🎯 Funkcionalnosti

### ✅ Implementirano (v2.0)

- [x] Firebase Firestore baza podataka
- [x] Firebase Storage za dokumente i slike
- [x] Firebase Auth sa Google OAuth
- [x] QR kodovi vode direktno do izveštaja
- [x] Neograničen upload dokumenata (do 50MB po fajlu)
- [x] Javno dostupni QR kod izveštaji
- [x] Admin autentifikacija za izmene
- [x] Migration script (LocalStorage → Firebase)
- [x] In-app prikaz izveštaja
- [x] Interaktivna mapa lokacija
- [x] Hover preview dokumenata sa scroll-om
- [x] Responsive dizajn
- [x] Dark theme
- [x] Audit log automatsko beleženje
- [x] Maintenance tracking
- [x] Status praćenje opreme
- [x] Pretraga i filtriranje
- [x] Export/Import podataka (JSON)

### 🔄 Planirano (v2.1+)

- [ ] Offline mode (PWA)
- [ ] Real-time sync između uređaja
- [ ] PDF generisanje na serveru (Firebase Functions)
- [ ] Notifikacije za garancije koje ističu
- [ ] Bulk operations (import CSV, Excel)
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] Custom report templates

---

## 💰 Troškovi (Firebase)

### Free Tier (Spark Plan)
- **Firestore:** 1GB storage, 50K reads/day, 20K writes/day
- **Storage:** 1GB storage, 10GB bandwidth/month
- **Hosting:** 10GB storage, 360MB/day bandwidth
- **Auth:** Unlimited users

**Estimated capacity:**
- 100 lokacija
- 1000 opreme
- 5000 dokumenata (avg 200KB each)
- **UKUPNO:** Dovoljno za većinu use case-ova

### Blaze Plan (Pay-as-you-go)
Ako prekoračite besplatni limit:
- **Storage:** $0.026/GB/month
- **Bandwidth:** $0.12/GB
- **Firestore reads:** $0.06/100K
- **Firestore writes:** $0.18/100K

**Procena troškova za prosečan projekat:** $0-10/mesec

---

## 🔒 Sigurnost

### Firestore Rules
- **Public read:** Svi mogu da čitaju podatke (za QR kodove)
- **Auth write:** Samo ulogovani korisnici mogu da menjaju podatke

### Storage Rules
- **Public read:** Svi mogu da preuzmu fajlove (za QR kodove)
- **Auth write:** Samo ulogovani korisnici mogu da uploaduju/brišu fajlove
- **File validation:** Max 50MB, samo slike i PDF-ovi

### Best Practices
- 🔐 Ne delite Firebase config sa sensitive podacima
- 🔄 Redovno pravite backup podataka
- 👥 Dodajte samo poverljive korisnike kao Firebase admins
- 📊 Monitorirajte Firebase usage u Console-u

---

## 🐛 Troubleshooting

### Problem: "Firebase not initialized"
**Rešenje:** Proverite da li ste ažurirali `js/firebase-config.js` sa vašim Firebase credentials.

### Problem: "Permission denied" u Firestore
**Rešenje:**
1. Proverite da li su `firestore.rules` i `storage.rules` deploy-ovani
2. Pokrenite `firebase deploy --only firestore:rules,storage`

### Problem: QR kod ne radi sa telefona
**Rešenje:**
1. Aplikacija mora biti deploy-ovana na web (ne localhost)
2. Koristite Firebase Hosting URL

### Problem: Migracija ne radi
**Rešenje:**
1. Otvorite browser console (F12)
2. Proverite da li postoje greške
3. Proverite Firebase config u `firebase-config.js`
4. Proverite da li ste ulogovani u Firebase

---

## 📞 Podrška

Za pitanja, probleme ili sugestije:
- **GitHub Issues:** [Link to repo issues]
- **Email:** [your-email@example.com]
- **Dokumentacija:** Pogledajte ostale .md fajlove u projektu

---

## 📝 License

© 2025 Orion E-mobility. All rights reserved.

---

## 🤖 Generated with Claude Code

Ovaj projekat je razvijen uz pomoć [Claude Code](https://claude.com/claude-code) - AI asistenta za programiranje.

**Co-Authored-By:** Claude Sonnet 4.5 <noreply@anthropic.com>

---

**Verzija:** 2.0 - Backend Architecture Edition
**Datum:** Decembar 2025
**Status:** 🟢 Production Ready
