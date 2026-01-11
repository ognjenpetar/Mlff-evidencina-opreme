# MLFF Equipment Tracking System

**Version 5.0 - Enhanced Analytics Edition** | [Orion E-mobility](https://github.com/ognjenpetar/Mlff-evidencina-opreme)

Moderna web aplikacija za evidenciju i praćenje MLFF (Multi-Lane Free-Flow) opreme na naplatnim portalima. Uključuje GPS lokacije, QR kodove sa logom, istoriju održavanja, upravljanje dokumentima, naprednu analitiku i interaktivne dashboarde.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Version](https://img.shields.io/badge/version-5.0-green.svg)
![Status](https://img.shields.io/badge/status-production-brightgreen.svg)

---

## Funkcionalnosti

### Osnovno
- **Upravljanje Lokacijama** - Praćenje lokacija sa GPS koordinatama i interaktivnim mapama
- **Evidencija Opreme** - Kompletan inventar sa tehničkim specifikacijama, fotografijama i statusom
- **QR Kodovi sa Logom** - Brendirani QR kodovi sa MLFF logom za brzi pristup opremi
- **Sub-Lokacije** - Organizacija opreme po tipu kabineta (Gentri/Ormar)
- **Upravljanje Dokumentima** - Upload PDF dokumenata (priručnici, sertifikati) do 50MB
- **Istorija Održavanja** - Praćenje servisa, troškova i planiranih održavanja
- **Audit Log** - Detaljna evidencija promena sa starim/novim vrednostima

### Napredne Funkcionalnosti (v5.0)
- **Bulk Operacije** - Masovna promena statusa i brisanje više komada opreme odjednom
- **Napredna Pretraga** - Filtriranje po 8+ kriterijuma uključujući datumske opsege
- **Notifikacije** - Upozorenja za istek garancije, planirano održavanje i opremu na servisu
- **Status "Neaktivna"** - Novi status za privremeno neaktivnu opremu
- **Interaktivni Dashboard** - Filteri po periodu, lokaciji, tipu i statusu
- **Lokacijska Analitika** - Stacked bar chart i interaktivna mapa sa markerima
- **Napredni KPI-jevi** - Dostupnost, garancijska pokrivenost, prosečna starost, trošak po opremi
- **Drill-Down Analitika** - Klik na chart za detaljan pregled podataka
- **Export** - Izvoz analitike u PDF i Excel format

### Tehničke Karakteristike
- **Cloud Database** - Supabase PostgreSQL (neograničen kapacitet)
- **Cloud Storage** - Supabase Storage (1GB besplatno, do 50MB po fajlu)
- **Autentifikacija** - Google OAuth putem Supabase Auth
- **Javni QR Pristup** - Izveštaji opreme dostupni bez prijave
- **GitHub Pages Hosting** - Besplatno, neograničen bandwidth
- **Responsive Dizajn** - Radi na desktop, tablet i mobilnim uređajima
- **Interaktivne Mape** - OpenStreetMap integracija sa Leaflet.js
- **Full-Text Pretraga** - PostgreSQL GIN indeksi za instant pretragu

---

## Brzi Početak

### 1. Preduslovi
- [Supabase nalog](https://supabase.com) (besplatan)
- [GitHub nalog](https://github.com) (za hosting)
- [Google Cloud nalog](https://console.cloud.google.com) (za OAuth)

### 2. Supabase Setup

```bash
# 1. Kreiraj Supabase projekat na https://supabase.com
# 2. Pokreni SQL migracije u SQL Editor-u (redom):
supabase/migrations/001_initial_schema.sql
supabase/migrations/002_rls_policies.sql
supabase/migrations/003_indexes.sql
supabase/migrations/004_storage_setup.sql
# ... i ostale migracije (vidi SUPABASE_SETUP.md)
```

### 3. Lokalni Development

```bash
# Kloniraj repo
git clone https://github.com/ognjenpetar/Mlff-evidencina-opreme.git
cd Mlff-evidencina-opreme

# Instaliraj dependencies
npm install

# Kreiraj .env fajl
cp .env.example .env
# Popuni VITE_SUPABASE_URL i VITE_SUPABASE_ANON_KEY

# Pokreni dev server
npm run dev
```

### 4. Production Build

```bash
npm run build
# Output: dist/ folder
```

---

## Dokumentacija

| Dokument | Opis |
|----------|------|
| [SUPABASE_SETUP.md](SUPABASE_SETUP.md) | Kompletno uputstvo za Supabase (migracije, storage, OAuth) |
| [DEPLOYMENT.md](DEPLOYMENT.md) | Deployment na GitHub Pages, Netlify, Vercel |
| [BACKEND_GUIDE.md](BACKEND_GUIDE.md) | Tehnička dokumentacija (schema, API, security) |
| [UPUTSTVO_ZA_KORISCENJE.md](UPUTSTVO_ZA_KORISCENJE.md) | Korisničko uputstvo na srpskom |

---

## Arhitektura

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (SPA)                           │
│  index.html + CSS + JavaScript (Hash-based routing)         │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ HTTPS
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   GITHUB PAGES                              │
│  Static files (HTML, CSS, JS) - Besplatan hosting           │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ Supabase JS SDK
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    SUPABASE BACKEND                         │
│  ┌────────────────┐  ┌────────────────┐  ┌───────────────┐ │
│  │   PostgreSQL   │  │    Storage     │  │     Auth      │ │
│  │   (Database)   │  │   (Fajlovi)    │  │  (Google)     │ │
│  │                │  │                │  │               │ │
│  │ - locations    │  │ - Photos       │  │ - OAuth       │ │
│  │ - equipment    │  │ - Documents    │  │ - Sessions    │ │
│  │ - documents    │  │ (50MB max)     │  │ - JWT tokens  │ │
│  │ - maintenance  │  │                │  │               │ │
│  │ - audit_log    │  │ Public URLs    │  │               │ │
│  └────────────────┘  └────────────────┘  └───────────────┘ │
│                                                             │
│  Row Level Security (RLS):                                 │
│  ✅ Public READ (QR kodovi rade bez login-a)               │
│  🔒 Authenticated WRITE (samo admin)                       │
└─────────────────────────────────────────────────────────────┘
```

---

## Database Schema

```sql
-- 6 PostgreSQL tabela

locations (
    id, name, latitude, longitude, address, photo_url,
    created_at, updated_at
)

equipment (
    id, location_id, inventory_number, type, status, sub_location,
    manufacturer, model, serial_number, ip_address, mac_address,
    installation_date, warranty_expiry, photo_url, notes,
    created_at, updated_at
)
-- Status: Aktivna, Na servisu, Neispravna, Neaktivna, Povučena

documents (
    id, equipment_id, name, file_url, storage_path,
    file_type, file_size, uploaded_at
)

maintenance (
    id, equipment_id, type, date, description,
    performed_by, cost, next_service_date
)

audit_log (
    id, equipment_id, action, details, old_value, new_value,
    field_name, user_id, user_email, timestamp
)

custom_types (
    id, type_name
)
```

---

## Troškovi

### Supabase Free Tier
- ✅ Database: 500 MB (dovoljno za 1000+ opreme)
- ✅ Storage: 1 GB
- ✅ Bandwidth: 2 GB/mesec
- ✅ Auth: Neograničeno korisnika

### GitHub Pages
- ✅ Hosting: Besplatno
- ✅ Bandwidth: Neograničeno
- ✅ SSL: Besplatno

**Zaključak: Potpuno besplatno za većinu use case-ova!**

---

## Tehnologije

### Frontend
- HTML5, CSS3, JavaScript (ES6+)
- [Leaflet.js](https://leafletjs.com/) - Interaktivne mape
- [Chart.js](https://www.chartjs.org/) - Grafikoni
- [QRCode.js](https://davidshimjs.github.io/qrcodejs/) - QR kodovi
- [Font Awesome](https://fontawesome.com/) - Ikone

### Backend
- [Supabase](https://supabase.com/) - PostgreSQL + Storage + Auth

### Build Tools
- [Vite](https://vitejs.dev/) - Build tool

---

## Verzije

### v5.0 - Enhanced Analytics Edition (Januar 2026)
- Bulk operacije (masovna promena statusa, brisanje)
- Napredna pretraga sa 8+ filtera
- Notifikacije (garancija, održavanje)
- Status "Neaktivna"
- Interaktivni dashboard sa filterima
- Lokacijska analitika sa mapom
- Napredni KPI-jevi
- Drill-down analitika
- Export u PDF/Excel

### v4.0 - Enhanced Edition (Decembar 2025)
- Sub-lokacije (Gentri/Ormar)
- QR kodovi sa logom
- Proširena polja opreme
- Enhanced audit log

### v3.0 - Supabase Edition
- Migracija sa Firebase na Supabase
- PostgreSQL database
- GitHub Pages hosting

---

## Licenca

MIT License - vidi LICENSE fajl.

---

## Podrška

- **GitHub Issues:** [Prijavi problem](https://github.com/ognjenpetar/Mlff-evidencina-opreme/issues)
- **Dokumentacija:** Vidi linkove iznad

---

**Verzija:** 5.0 - Enhanced Analytics Edition
**Poslednje Ažuriranje:** Januar 2026

