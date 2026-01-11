# Supabase Setup - Kompletno Uputstvo

**MLFF Equipment Tracking v5.0** | Orion E-mobility

Ovaj dokument sadrži detaljna uputstva za podešavanje Supabase backend-a, uključujući sve SQL migracije, storage bucket-e, autentifikaciju i deployment.

---

## Sadržaj

1. [Kreiranje Supabase Projekta](#1-kreiranje-supabase-projekta)
2. [SQL Migracije - Redosled](#2-sql-migracije---redosled)
3. [Storage Buckets](#3-storage-buckets)
4. [Google OAuth Autentifikacija](#4-google-oauth-autentifikacija)
5. [Environment Variables](#5-environment-variables)
6. [Lokalni Development](#6-lokalni-development)
7. [Production Deployment](#7-production-deployment)
8. [Verifikacija Setup-a](#8-verifikacija-setup-a)
9. [Troubleshooting](#9-troubleshooting)

---

## 1. Kreiranje Supabase Projekta

### 1.1 Registracija

1. Idi na **https://supabase.com**
2. Klikni **"Start your project"**
3. Sign up sa **GitHub** account-om (preporučeno) ili email-om

### 1.2 Kreiranje Novog Projekta

1. U Dashboard-u klikni **"New project"**
2. Popuni podatke:
   - **Organization:** Izaberi postojeću ili kreiraj novu
   - **Project name:** `mlff-equipment-tracking`
   - **Database Password:** Generiši siguran password i **SAČUVAJ GA** (potreban za direktan DB pristup)
   - **Region:** `Europe West (Ireland)` ← Najbliže Srbiji
   - **Pricing Plan:** `Free` (besplatno)
3. Klikni **"Create new project"**
4. Sačekaj 2-3 minuta dok se projekat kreira

### 1.3 Preuzmi API Credentials

1. Idi u **Settings** → **API**
2. Kopiraj i sačuvaj:
   - **Project URL** (npr. `https://xmkkqawodbejrcjlnmqx.supabase.co`)
   - **anon/public key** (dugačak JWT token koji počinje sa `eyJ...`)

> ⚠️ **VAŽNO:** Čuvaj ove vrednosti na sigurnom mestu!

---

## 2. SQL Migracije - Redosled

SQL migracije moraju biti pokrenute u **TAČNOM REDOSLEDU**. Svaka migracija zavisi od prethodne.

### Kako pokrenuti migraciju:

1. Idi u Supabase Dashboard → **SQL Editor**
2. Klikni **"New query"**
3. Kopiraj sadržaj SQL fajla
4. Klikni **"Run"** (ili Ctrl+Enter)
5. Proveri da piše: `Success. No rows returned`

### Obavezne Migracije (Osnovne)

| Redosled | Fajl | Opis |
|----------|------|------|
| 1 | `001_initial_schema.sql` | Osnovne tabele (locations, equipment, documents, maintenance, audit_log, custom_types) |
| 2 | `002_rls_policies.sql` | Row Level Security politike (public read, authenticated write) |
| 3 | `003_indexes.sql` | Performance indeksi za brze pretrage |
| 4 | `004_storage_setup.sql` | Storage bucket-i za fotografije i dokumente |

### Dodatne Migracije (Funkcionalnosti)

| Redosled | Fajl | Opis |
|----------|------|------|
| 5a | `005_sub_location_field.sql` | Dodaje `sub_location` polje u equipment tabelu |
| 5b | `005_allow_anonymous_upload.sql` | Omogućava anonimni upload fajlova |
| 6a | `006_shared_documents.sql` | Tabela za deljene dokumente |
| 6b | `006_create_maintenance_functions.sql` | PostgreSQL funkcije za maintenance statistike |
| 7a | `007_enhanced_audit_log.sql` | Prošireni audit log sa old/new vrednostima |
| 7b | `007_allow_anonymous_database_access.sql` | Omogućava javni pristup bez login-a (QR kodovi) |
| 8a | `008_sub_location_required.sql` | Sub-location validacija |
| 8b | `008_fix_maintenance_function.sql` | Ispravka maintenance funkcije |
| 9 | `009_type_shared_documents.sql` | Tipovi deljenih dokumenata |
| 10 | `010_upcoming_maintenance_function.sql` | Funkcija za predstojeće održavanje |
| 11 | `011_add_neaktivna_status.sql` | Dodaje "Neaktivna" status za opremu |

### Preporučeni Redosled Pokretanja

```
001_initial_schema.sql
002_rls_policies.sql
003_indexes.sql
004_storage_setup.sql
005_sub_location_field.sql
005_allow_anonymous_upload.sql
006_shared_documents.sql
006_create_maintenance_functions.sql
007_enhanced_audit_log.sql
007_allow_anonymous_database_access.sql
008_fix_maintenance_function.sql
009_type_shared_documents.sql
010_upcoming_maintenance_function.sql
011_add_neaktivna_status.sql
```

> **NAPOMENA:** Ako dobijete grešku "already exists", to znači da je migracija već pokrenuta - možete je preskočiti.

---

## 3. Storage Buckets

Nakon pokretanja `004_storage_setup.sql`, trebalo bi da imate 3 bucket-a:

| Bucket | Namena | Max Size | Tipovi |
|--------|--------|----------|--------|
| `location-photos` | Fotografije lokacija | 50 MB | JPEG, PNG, WebP, GIF |
| `equipment-photos` | Fotografije opreme | 50 MB | JPEG, PNG, WebP, GIF |
| `equipment-documents` | PDF dokumentacija | 50 MB | PDF, JPEG, PNG |

### Verifikacija Storage-a

1. Idi u **Storage** u Supabase Dashboard
2. Trebalo bi da vidiš sva 3 bucket-a
3. Svaki bucket treba da ima zeleni indikator "Public"

### Ručno Kreiranje (ako migracija nije uspela)

Ako bucket-i nisu kreirani, možeš ih ručno dodati:

1. **Storage** → **New bucket**
2. Naziv: `location-photos`
3. **Public bucket:** ✅ (uključeno)
4. **File size limit:** 52428800 (50 MB)
5. **Allowed MIME types:** `image/jpeg, image/png, image/webp, image/gif`
6. Ponovi za ostala 2 bucket-a

---

## 4. Google OAuth Autentifikacija

### 4.1 Google Cloud Console Setup

1. Idi na **https://console.cloud.google.com**
2. Klikni **"Select a project"** → **"New Project"**
3. **Project name:** `MLFF Equipment Tracking`
4. Klikni **"Create"** i sačekaj 30 sekundi
5. Izaberi novi projekat

### 4.2 Enable Google+ API

1. Sidebar → **"APIs & Services"** → **"Library"**
2. Pretraži: `Google+ API`
3. Klikni na rezultat i zatim **"Enable"**

### 4.3 OAuth Consent Screen

1. Sidebar → **"OAuth consent screen"**
2. **User Type:** `External`
3. Klikni **"Create"**
4. Popuni:
   - **App name:** `MLFF Equipment Tracking`
   - **User support email:** Tvoj email
   - **Developer contact:** Tvoj email
5. Klikni **"Save and Continue"** kroz sve korake
6. U **"Test users"** dodaj svoj email

### 4.4 Create OAuth Client ID

1. Sidebar → **"Credentials"**
2. **"Create Credentials"** → **"OAuth client ID"**
3. **Application type:** `Web application`
4. **Name:** `MLFF Web Client`
5. **Authorized redirect URIs** - dodaj:
   ```
   https://YOUR-SUPABASE-PROJECT-ID.supabase.co/auth/v1/callback
   ```
   (zameni `YOUR-SUPABASE-PROJECT-ID` sa pravim ID-jem)
6. Klikni **"Create"**
7. **KOPIRAJ** `Client ID` i `Client Secret`

### 4.5 Configure Supabase Auth

1. U Supabase Dashboard → **Authentication** → **Providers**
2. Pronađi **"Google"** i klikni
3. **Enable Google provider:** ON
4. **Client ID:** Paste iz Google Cloud
5. **Client Secret:** Paste iz Google Cloud
6. Klikni **"Save"**

### 4.6 Configure Redirect URLs

1. **Authentication** → **URL Configuration**
2. **Site URL:** `https://ognjenpetar.github.io/Mlff-evidencina-opreme/`
3. **Redirect URLs** - dodaj:
   ```
   https://ognjenpetar.github.io/Mlff-evidencina-opreme/
   http://localhost:5173/
   http://localhost:3000/
   http://127.0.0.1:5500/
   ```
4. Klikni **"Save"**

---

## 5. Environment Variables

### 5.1 Lokalni Development

1. Kopiraj `.env.example` u `.env`:
   ```bash
   cp .env.example .env
   ```

2. Otvori `.env` i popuni:
   ```env
   # Supabase Configuration
   VITE_SUPABASE_URL=https://xmkkqawodbejrcjlnmqx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

> ⚠️ **NIKADA** ne commit-uj `.env` fajl na Git! On je već u `.gitignore`.

### 5.2 GitHub Actions Secrets (za automatski deployment)

1. GitHub repo → **Settings** → **Secrets and variables** → **Actions**
2. Klikni **"New repository secret"**
3. Dodaj:
   - Name: `VITE_SUPABASE_URL`
   - Value: `https://xmkkqawodbejrcjlnmqx.supabase.co`
4. Ponovi za `VITE_SUPABASE_ANON_KEY`

---

## 6. Lokalni Development

### 6.1 Instalacija

```bash
# Kloniraj repo
git clone https://github.com/ognjenpetar/Mlff-evidencina-opreme.git
cd Mlff-evidencina-opreme

# Instaliraj dependencies
npm install

# Kreiraj .env fajl
cp .env.example .env
# Popuni .env sa tvojim Supabase credentials
```

### 6.2 Pokretanje Dev Servera

```bash
npm run dev
```

Aplikacija će biti dostupna na `http://localhost:5173`

### 6.3 Build za Production

```bash
npm run build
```

Generiše optimizovane fajlove u `dist/` folder.

---

## 7. Production Deployment

### Opcija A: GitHub Pages (Preporučeno)

1. Push kod na GitHub
2. **Settings** → **Pages**
3. **Source:** Deploy from a branch
4. **Branch:** `gh-pages` (ako koristiš GitHub Actions) ili `main`
5. **Folder:** `/ (root)` ili `/dist`

### Opcija B: Netlify

1. Poveži GitHub repo sa Netlify
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Environment variables: dodaj `VITE_SUPABASE_URL` i `VITE_SUPABASE_ANON_KEY`

### Opcija C: Vercel

1. Import projekat sa GitHub
2. Framework: Vite
3. Environment variables: dodaj oba Supabase ključa

---

## 8. Verifikacija Setup-a

### 8.1 Provera Database-a

U Supabase Dashboard → **Table Editor** trebalo bi da vidiš:

- ✅ `locations` - sa kolonama: id, name, latitude, longitude, address, photo_url, created_at, updated_at
- ✅ `equipment` - sa kolonama: id, location_id, inventory_number, type, status, sub_location, manufacturer, model, serial_number, ip_address, mac_address, installation_date, warranty_expiry, photo_url, notes, created_at, updated_at
- ✅ `documents` - sa kolonama: id, equipment_id, name, file_url, storage_path, file_type, file_size, uploaded_at
- ✅ `maintenance` - sa kolonama: id, equipment_id, type, date, description, performed_by, cost, next_service_date
- ✅ `audit_log` - sa kolonama: id, equipment_id, action, details, old_value, new_value, field_name, user_id, user_email, timestamp
- ✅ `custom_types` - sa kolonama: id, type_name

### 8.2 Provera Storage-a

U **Storage** trebalo bi da vidiš:

- ✅ `location-photos` (Public)
- ✅ `equipment-photos` (Public)
- ✅ `equipment-documents` (Public)

### 8.3 Provera Auth-a

U **Authentication** → **Providers**:

- ✅ Google provider: Enabled

### 8.4 Test u Browseru

1. Otvori aplikaciju
2. Otvori Browser Console (F12)
3. Trebalo bi da vidiš:
   ```
   ✅ Supabase connection successful!
   ```

4. Probaj login sa Google
5. Probaj kreirati lokaciju i opremu
6. Probaj upload fotografije i dokumenta

---

## 9. Troubleshooting

### Problem: "Supabase credentials not configured"

**Rešenje:**
1. Proveri da `.env` fajl postoji
2. Proveri da `VITE_SUPABASE_URL` i `VITE_SUPABASE_ANON_KEY` imaju ispravne vrednosti
3. Restartuj dev server (`npm run dev`)

### Problem: "relation does not exist"

**Rešenje:**
- SQL migracije nisu pokrenute
- Pokreni sve migracije redom (sekcija 2)

### Problem: "Permission denied" pri upload-u

**Rešenje:**
1. Proveri da je `004_storage_setup.sql` pokrenut
2. Proveri da je `005_allow_anonymous_upload.sql` pokrenut
3. Proveri da su bucket-i Public u Storage settings

### Problem: "Invalid login credentials"

**Rešenje:**
1. Proveri Google OAuth konfiguraciju (sekcija 4)
2. Proveri Redirect URLs u Supabase Auth settings
3. Proveri da je Google provider enabled

### Problem: QR kod ne prikazuje opremu

**Rešenje:**
1. Proveri da je `007_allow_anonymous_database_access.sql` pokrenut
2. Proveri RLS politike u Database → Policies
3. Trebalo bi da `locations` i `equipment` imaju `public_read` policy

### Problem: Fotografije se ne prikazuju

**Rešenje:**
1. Proveri Storage → bucket → Policies
2. Svaki bucket treba da ima `SELECT` policy za `anon`
3. Bucket mora biti "Public" (ne Private)

---

## Dodatni Resursi

- **Supabase Dokumentacija:** https://supabase.com/docs
- **GitHub Issues:** https://github.com/ognjenpetar/Mlff-evidencina-opreme/issues
- **Supabase Discord:** https://discord.supabase.com

---

**Verzija:** 5.0 - Enhanced Analytics Edition
**Poslednje Ažuriranje:** Januar 2026

