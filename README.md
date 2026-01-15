# MLFF Equipment Tracking System

**Verzija 5.0 - Authentication Edition** | [Live Demo](https://ognjenpetar.github.io/Mlff-evidencina-opreme/)

Web aplikacija za evidenciju i praćenje MLFF (Multi-Lane Free-Flow) opreme na naplatnim portalima. Omogućava kompletno upravljanje lokacijama i opremom sa GPS koordinatama, QR kodovima, servisnom istorijom i dokumentacijom.

**Administrator:** Ognjen Todorovic
**Kompanija:** Orion E-mobility

![Version](https://img.shields.io/badge/version-5.0-green.svg)
![Status](https://img.shields.io/badge/status-production-brightgreen.svg)
![Database](https://img.shields.io/badge/database-Supabase-3ECF8E.svg)
![Auth](https://img.shields.io/badge/auth-Google_OAuth-4285F4.svg)

---

## Autentifikacija

Aplikacija koristi Google OAuth za prijavu. Pristup je ograničen na autorizovane korisnike.

### Uloge (Roles)

| Uloga | Pregled | Dodavanje | Izmena | Brisanje | Admin Panel |
|-------|---------|-----------|--------|----------|-------------|
| **Super Admin** | Da | Da | Da | Da | Da |
| **Editor** | Da | Da | Da | Ne | Ne |
| **Viewer** | Da | Ne | Ne | Ne | Ne |

### Super Admin
- Email: `ognjenpetar@gmail.com`
- Ima potpunu kontrolu nad aplikacijom
- Može upravljati korisnicima kroz Admin Panel

### Pristup
1. Otvorite aplikaciju
2. Kliknite "Prijavi se sa Google"
3. Izaberite Google nalog
4. Ako je nalog odobren, pristupate aplikaciji

---

## Funkcionalnosti

### Upravljanje Lokacijama
- Dodavanje lokacija sa GPS koordinatama
- Upload fotografija lokacija
- Interaktivna mapa sa markerima i preview fotografijom
- Opis i adresa lokacije

### Evidencija Opreme
- **Tipovi**: VDX, VRX, Antena, Switch, TRC, TRM, Intel, Jetson, Wi-Fi + custom tipovi
- **Sub-lokacija**: Gentri ili Ormar
- **Status**: Aktivna, Neaktivna, Na servisu, Neispravna, Povučena
- **Tehnički podaci**: IP adresa, MAC adresa, X/Y/Z koordinate
- **Instalacija**: Datum, instalater, tester, garancija
- **Dokumentacija**: Upload PDF dokumenata (do 50MB)
- **Fotografije**: Upload slika opreme

### QR Kod Sistem
- Automatski generisan QR kod za svaki komad opreme
- QR kod sa Orion E-mobility logom
- Skeniranje vodi direktno na detalje opreme
- Download QR koda kao PNG
- Print nalepnica

### Servisna Istorija
- Evidencija servisnih intervencija
- Tipovi: Preventivni, Korektivni, Inspekcija, Zamena dela, Kalibracija
- Praćenje troškova
- Zakazivanje sledećeg servisa
- Obaveštenja o predstojećem održavanju

### Pretraga i Filtriranje
- Globalna pretraga po svim poljima
- Filter po tipu opreme
- Filter po statusu
- Filter po lokaciji

### Dashboard
- Statistika: ukupno lokacija, opreme, aktivne, na servisu
- Garancije koje ističu u narednih 30 dana
- Widget za predstojeće održavanje
- Nedavne aktivnosti

### Izveštaji
- Print izveštaj opreme sa svim detaljima
- Print izveštaj lokacije sa listom opreme
- Preview fotografija i QR koda u izveštaju

---

## Arhitektura

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (SPA)                           │
│  HTML + CSS + JavaScript (Hash-based routing)               │
│  Hosting: GitHub Pages                                      │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ Supabase JS SDK
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    SUPABASE BACKEND                         │
│  ┌────────────────────────────┐  ┌───────────────────────┐ │
│  │      PostgreSQL            │  │       Storage         │ │
│  │                            │  │                       │ │
│  │ - locations                │  │ - Fotografije lokacija│ │
│  │ - equipment                │  │ - Fotografije opreme  │ │
│  │ - documents                │  │ - PDF dokumenti       │ │
│  │ - maintenance              │  │                       │ │
│  │ - audit_log                │  │ Max: 50MB po fajlu    │ │
│  │ - custom_types             │  │                       │ │
│  └────────────────────────────┘  └───────────────────────┘ │
│                                                             │
│  Pristup: Anonymous Mode (bez autentifikacije)              │
│  Svi korisnici imaju READ & WRITE pristup                   │
└─────────────────────────────────────────────────────────────┘
```

**Način rada:**
1. Korisnik otvara https://ognjenpetar.github.io/Mlff-evidencina-opreme/
2. GitHub Pages servira statičke fajlove
3. Browser učitava Supabase SDK i konektuje se na bazu
4. Korisnik može odmah da pregleda i menja podatke (bez logovanja)
5. Sve promene se sinhronizuju sa Supabase PostgreSQL bazom

---

## Tehnologije

### Frontend
- **HTML5** - Semantička struktura
- **CSS3** - Responsive dizajn, dark tema
- **JavaScript (ES6+)** - Async/await, moduli
- **Vite** - Build tool za ES modules
- **Leaflet.js** - Interaktivne mape (OpenStreetMap)
- **QRCode.js** - Generisanje QR kodova
- **Font Awesome** - Ikone

### Backend
- **Supabase** - Backend-as-a-Service
  - PostgreSQL baza podataka
  - Storage za fajlove (fotografije, PDF)
  - Row Level Security (RLS)
  - Anonymous pristup

### Hosting
- **GitHub Pages** - Besplatan static hosting

---

## Baza Podataka

### Tabele

```sql
locations (
    id UUID PRIMARY KEY,
    name TEXT,
    latitude NUMERIC(10,7),
    longitude NUMERIC(10,7),
    address TEXT,
    description TEXT,
    photo_url TEXT,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
)

equipment (
    id UUID PRIMARY KEY,
    location_id UUID REFERENCES locations(id) ON DELETE CASCADE,
    inventory_number TEXT,
    type TEXT,
    status TEXT,  -- Aktivna, Neaktivna, Na servisu, Neispravna, Povučena
    sub_location TEXT CHECK (sub_location IN ('Gentri', 'Ormar')),
    manufacturer TEXT,
    model TEXT,
    serial_number TEXT,
    ip_address INET,
    mac_address MACADDR,
    x_coord INTEGER,
    y_coord INTEGER,
    z_coord INTEGER,
    installation_date DATE,
    installer_name TEXT,
    tester_name TEXT,
    warranty_expiry DATE,
    photo_url TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
)

documents (
    id UUID PRIMARY KEY,
    equipment_id UUID REFERENCES equipment(id) ON DELETE CASCADE,
    name TEXT,
    file_url TEXT,
    storage_path TEXT,
    file_type TEXT,
    file_size BIGINT,
    uploaded_at TIMESTAMPTZ
)

maintenance (
    id UUID PRIMARY KEY,
    equipment_id UUID REFERENCES equipment(id) ON DELETE CASCADE,
    type TEXT,
    date DATE,
    description TEXT,
    performed_by TEXT,
    cost NUMERIC(10,2),
    next_service_date DATE,
    created_at TIMESTAMPTZ
)

audit_log (
    id UUID PRIMARY KEY,
    equipment_id UUID REFERENCES equipment(id) ON DELETE CASCADE,
    action TEXT,
    details TEXT,
    timestamp TIMESTAMPTZ
)

custom_types (
    id UUID PRIMARY KEY,
    type_name TEXT UNIQUE,
    created_at TIMESTAMPTZ
)
```

---

## Instalacija

### 1. Kloniraj repozitorijum

```bash
git clone https://github.com/ognjenpetar/Mlff-evidencina-opreme.git
cd Mlff-evidencina-opreme
```

### 2. Podesi Supabase

1. Kreiraj projekat na [supabase.com](https://supabase.com)
2. Pokreni SQL migracije iz `supabase/` foldera:
   - `001_initial_schema.sql` - Kreiranje tabela
   - `002_rls_policies.sql` - Row Level Security
   - `003_indexes.sql` - Indeksi za performanse
   - `004_storage_setup.sql` - Storage bucket-i
   - `005_sub_location_field.sql` - Sub-lokacija polje
   - `ADD_NEAKTIVNA_STATUS.sql` - Neaktivna status

3. Kopiraj kredencijale:
   - Project URL
   - Anon/Public key

### 3. Konfiguriši aplikaciju

Izmeni `src/supabase-init.js`:
```javascript
const SUPABASE_URL = 'https://YOUR-PROJECT.supabase.co';
const SUPABASE_ANON_KEY = 'your-anon-key';
```

### 4. Build i Deploy

```bash
# Instaliraj dependencies
npm install

# Build za produkciju
npm run build

# Deploy na GitHub Pages
git add .
git commit -m "Deploy"
git push origin main
```

GitHub Pages će automatski servirati fajlove iz `dist/` foldera.

---

## Struktura Projekta

```
Mlff-evidencina-opreme/
├── index.html              # Glavna HTML stranica
├── css/
│   └── styles.css          # Svi stilovi (dark tema)
├── js/
│   ├── app.js              # Glavna aplikaciona logika
│   ├── router.js           # SPA routing
│   └── supabase-service.js # Supabase operacije
├── src/
│   ├── main.js             # Entry point za Vite
│   └── supabase-init.js    # Supabase konfiguracija
├── supabase/
│   ├── 001_initial_schema.sql
│   ├── 002_rls_policies.sql
│   ├── 003_indexes.sql
│   ├── 004_storage_setup.sql
│   ├── 005_sub_location_field.sql
│   └── ADD_NEAKTIVNA_STATUS.sql
├── public/
│   └── mlff-logo.svg       # Logo za QR kodove
├── dist/                   # Build output
├── .github/
│   └── workflows/          # GitHub Actions
├── package.json
├── vite.config.js
└── README.md
```

---

## Korišćenje

### Dodavanje Lokacije
1. Klikni "Dodaj Lokaciju" na dashboard-u
2. Unesi naziv i GPS koordinate
3. Opciono dodaj fotografiju i opis
4. Sačuvaj

### Dodavanje Opreme
1. Otvori lokaciju
2. Klikni "Dodaj Opremu"
3. Popuni obavezna polja: Inventarski broj, Tip, Sub-lokacija
4. Dodaj tehničke podatke, fotografiju, dokumentaciju
5. Sačuvaj

### QR Kodovi
1. Otvori detalje opreme
2. Klikni "QR Kod" dugme
3. Preuzmi PNG ili štampaj nalepnicu

### Pretraga
- Koristi search bar na vrhu dashboard-a
- Filtriraj po tipu, statusu ili lokaciji

### Mapa
1. Klikni "Prikaži Mapu" na dashboard-u
2. Vidi sve lokacije na OpenStreetMap-u
3. Klikni marker za preview sa fotografijom
4. "Otvori Detalje" vodi na lokaciju

---

## Troškovi

### Supabase Free Tier
- 500 MB baza podataka
- 1 GB storage
- 2 GB bandwidth/mesečno
- 50,000 redova u bazi

### GitHub Pages
- Besplatno
- Neograničen bandwidth (soft limit 100GB/mesec)
- Automatski SSL

**Procena:** Besplatan tier je dovoljan za 100+ lokacija i 1000+ komada opreme.

---

## Verzije

### v5.0 - Authentication Edition (Januar 2025)
- Google OAuth autentifikacija
- Role-based access control (Super Admin, Editor, Viewer)
- Admin panel za upravljanje korisnicima
- Cyber security themed login ekran
- Svi pristupi zahtevaju autentifikaciju

### v4.0 - Supabase Edition (Januar 2025)
- Anonymous mode (bez autentifikacije)
- Snake_case to camelCase konverzija
- Preview fotografija na mapi
- Predstojeće održavanje widget
- Ispravke za QR kod routing

### v3.0 - Supabase Migration
- Migracija sa Firebase na Supabase
- PostgreSQL baza umesto Firestore
- GitHub Pages hosting

### v2.0 - Firebase Edition
- Cloud baza (Firestore)
- Google OAuth autentifikacija
- Arhivirano u `archive/old-versions` branch

### v1.x - LocalStorage Edition
- Lokalno čuvanje podataka
- Offline rad

---

## Podrška

- **GitHub Issues:** [Prijavi problem](https://github.com/ognjenpetar/Mlff-evidencina-opreme/issues)
- **Administrator:** Ognjen Todorovic

---

## Licenca

MIT License - slobodno za korišćenje i modifikaciju.
