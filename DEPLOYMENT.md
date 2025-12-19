# Deployment Guide - MLFF Equipment Tracking v3.0

**Supabase + GitHub Pages Edition**

Ovaj dokument pruža kompletan vodič za deployment aplikacije na Supabase backend + GitHub Pages hosting.

---

## 📋 Brzi Pregled

**Komponente:**
- ✅ **Backend:** Supabase (PostgreSQL + Storage + Auth)
- ✅ **Hosting:** GitHub Pages (besplatno, unlimited bandwidth)
- ✅ **Deployment vreme:** 20-30 minuta

**Troškovi:**
- ✅ **Supabase Free Tier:** 1GB storage, 2GB bandwidth/mesec - **BESPLATNO**
- ✅ **GitHub Pages:** Unlimited hosting - **BESPLATNO**

---

## 🚀 Korak 1: Kreiranje Supabase Projekta

### 1.1 Registracija

1. Idi na https://supabase.com
2. Klikni **"Start your project"**
3. Sign up sa GitHub account-om (preporučeno)

### 1.2 Kreiranje Projekta

1. Klikni **"New project"**
2. **Organization:** Create new ili izaberi postojeću
3. **Project name:** `mlff-equipment-tracking`
4. **Database Password:** Zapamti negde (biće potreban za direktan DB pristup)
5. **Region:** **Europe West (Ireland)** ← Najbliže Srbiji
6. **Pricing Plan:** Free (Spark) ✅
7. Klikni **"Create new project"**
8. Sačekaj 2-3 minuta dok se projekat kreira

---

## 🗄️ Korak 2: SQL Migracije

### 2.1 Otvori SQL Editor

1. U Supabase Dashboard, klikni **"SQL Editor"** (leva strana)
2. Klikni **"New query"**

### 2.2 Run Migrations (VAŽAN REDOSLED!)

**Migracija 1: Database Schema**
1. Kopiraj **SVE** iz fajla `supabase/migrations/001_initial_schema.sql`
2. Paste u SQL Editor
3. Klikni **"Run"** (ili Ctrl+Enter)
4. ✅ Success: "Success. No rows returned"

**Migracija 2: Security Policies**
1. Kopiraj SVE iz `supabase/migrations/002_rls_policies.sql`
2. Paste u SQL Editor
3. Klikni **"Run"**
4. ✅ Success: "Success. No rows returned"

**Migracija 3: Performance Indexes**
1. Kopiraj SVE iz `supabase/migrations/003_indexes.sql`
2. Paste u SQL Editor
3. Klikni **"Run"**
4. ✅ Success: "Success. No rows returned"

**Migracija 4: Storage Buckets**
1. Kopiraj SVE iz `supabase/migrations/004_storage_setup.sql`
2. Paste u SQL Editor
3. Klikni **"Run"**
4. ✅ Success: "Success. No rows returned"

### 2.3 Verifikacija

1. Klikni **"Database"** → **"Tables"**
2. Trebalo bi da vidiš **6 tabela:**
   - ✅ locations
   - ✅ equipment
   - ✅ documents
   - ✅ maintenance
   - ✅ audit_log
   - ✅ custom_types

3. Klikni **"Storage"**
4. Trebalo bi da vidiš **3 buckets:**
   - ✅ location-photos
   - ✅ equipment-photos
   - ✅ equipment-documents

---

## 🔐 Korak 3: Google OAuth Setup

### 3.1 Google Cloud Console

1. Idi na https://console.cloud.google.com
2. Klikni **"Select a project"** → **"New Project"**
3. **Project name:** `MLFF Equipment Tracking`
4. Klikni **"Create"**
5. Sačekaj ~30 sekundi, klikni **"Select project"**

### 3.2 Enable Google+ API

1. Sidebar → **"APIs & Services"** → **"Library"**
2. Pretraži: `Google+ API`
3. Klikni na **"Google+ API"**
4. Klikni **"Enable"**

### 3.3 OAuth Consent Screen

1. Sidebar → **"OAuth consent screen"**
2. **User Type:** External
3. Klikni **"Create"**
4. **App name:** `MLFF Equipment Tracking`
5. **User support email:** Tvoj email
6. **Developer contact:** Tvoj email
7. Klikni **"Save and Continue"**
8. **Scopes:** Klikni **"Save and Continue"** (koristi defaults)
9. **Test users:** Dodaj svoj email
10. Klikni **"Save and Continue"**
11. Klikni **"Back to Dashboard"**

### 3.4 Create OAuth Credentials

1. Sidebar → **"Credentials"**
2. Klikni **"Create Credentials"** → **"OAuth client ID"**
3. **Application type:** Web application
4. **Name:** `MLFF Web Client`
5. **Authorized redirect URIs:** Klikni **"Add URI"**
   - Dodaj: `https://ognjenpetar.github.io/mlff-equipment-tracking/`
   - Dodaj: `https://<YOUR-SUPABASE-PROJECT>.supabase.co/auth/v1/callback`
     (Zameni `<YOUR-SUPABASE-PROJECT>` sa pravim project ID-jem)
6. Klikni **"Create"**
7. **KOPIRAJ** `Client ID` i `Client secret` negde bezbedno!

### 3.5 Configure Supabase Auth

1. Vrati se u Supabase Dashboard
2. Klikni **"Authentication"** → **"Providers"**
3. Pronađi **"Google"** i klikni na njega
4. **Enable Google provider:** ON (toggle)
5. **Client ID:** Paste iz Google Cloud Console
6. **Client Secret:** Paste iz Google Cloud Console
7. Klikni **"Save"**

---

## ⚙️ Korak 4: Konfiguracija Aplikacije

### 4.1 Preuzmi API Credentials

1. U Supabase Dashboard, klikni **"Settings"** → **"API"**
2. Kopiraj:
   - **Project URL** (npr. `https://abcxyz123.supabase.co`)
   - **anon/public key** (dugačak JWT token)

### 4.2 Update `js/supabase-config.js`

Otvori fajl `js/supabase-config.js` u editoru i zameni:

```javascript
// BEFORE:
const SUPABASE_URL = 'https://YOUR-PROJECT-ID.supabase.co';
const SUPABASE_ANON_KEY = 'YOUR-ANON-PUBLIC-KEY-HERE';

// AFTER (tvoje vrednosti):
const SUPABASE_URL = 'https://abcxyz123.supabase.co';  // ← PASTE PROJECT URL
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';  // ← PASTE ANON KEY
```

**Sačuvaj fajl!**

### 4.3 Update Supabase Auth Redirect URLs

1. U Supabase Dashboard, **"Authentication"** → **"URL Configuration"**
2. **Site URL:** `https://ognjenpetar.github.io/mlff-equipment-tracking/`
3. **Redirect URLs:** Dodaj:
   - `https://ognjenpetar.github.io/mlff-equipment-tracking/`
   - `http://localhost:5500/` (za local development)
4. Klikni **"Save"**

---

## 🌐 Korak 5: GitHub Repository Setup

### 5.1 Create GitHub Repository

1. Idi na https://github.com/new
2. **Repository name:** `mlff-equipment-tracking`
3. **Visibility:** Public (required za GitHub Pages)
4. **NEMOJ** čekirati "Initialize with README"
5. Klikni **"Create repository"**

### 5.2 Push Local Code

```bash
cd "c:\Users\ognjen.petar\OPT APPS\Mlff-evidencina-opreme"

# Commit config changes
git add js/supabase-config.js
git commit -m "Configure Supabase credentials"

# Add remote (ako već ne postoji)
git remote add origin https://github.com/ognjenpetar/mlff-equipment-tracking.git

# Push 3.supabase branch
git push -u origin 3.supabase
```

---

## 📄 Korak 6: Enable GitHub Pages

### 6.1 Repository Settings

1. Idi na GitHub repo: https://github.com/ognjenpetar/mlff-equipment-tracking
2. Klikni **"Settings"** tab
3. Sidebar → **"Pages"**

### 6.2 Configure Source

1. **Source:** Deploy from a branch
2. **Branch:** `3.supabase` (dropdown)
3. **Folder:** `/ (root)` (dropdown)
4. Klikni **"Save"**

### 6.3 Wait for Deployment

1. Refresh stranicu nakon 2-3 minuta
2. Videćeš: **"Your site is live at https://ognjenpetar.github.io/mlff-equipment-tracking/"**
3. Klikni na URL da testiraj!

---

## ✅ Korak 7: Testing & Verification

### 7.1 Test Database Connection

1. Otvori: https://ognjenpetar.github.io/mlff-equipment-tracking/
2. Otvori Browser Console (F12)
3. Trebalo bi da vidiš: `✅ Supabase connection successful!`
4. Ako vidiš warning: `⚠️ Supabase connected, but database tables not found` → SQL migracije nisu run-ovane!

### 7.2 Test Authentication

1. Klikni **Login** dugme (Google ikona)
2. Izaberi Google account
3. Treba da te redirectuje nazad na app
4. Treba da vidiš tvoj email u gornjem desnom uglu

### 7.3 Test CRUD Operations

1. **Create Location:**
   - Klikni **"Dodaj lokaciju"**
   - Popuni formu (name, GPS, address)
   - Upload fotku (opciono)
   - Klikni **"Sačuvaj"**
   - ✅ Trebalo bi da se pojavi na listi

2. **Create Equipment:**
   - Klikni na lokaciju
   - Klikni **"Dodaj opremu"**
   - Popuni formu
   - Klikni **"Sačuvaj"**
   - ✅ Trebalo bi da se pojavi na listi

3. **Upload Document:**
   - Klikni na opremu
   - Scroll do **"Dokumentacija"** sekcije
   - Klikni **"Dodaj dokument"**
   - Izaberi PDF fajl (max 50MB)
   - ✅ Trebalo bi da se upload-uje i pojavi na listi

4. **Generate QR Code:**
   - Klikni **"QR Kod"** dugme
   - ✅ Trebalo bi da se prikaže QR kod
   - Skeniraj sa telefonom ili kopiraj URL
   - ✅ Otvara kompletan izveštaj opreme

### 7.4 Test Public Access (QR Codes)

1. Kopiraj QR kod URL (npr. `https://ognjenpetar.github.io/mlff-equipment-tracking/#/report/equipment/{id}`)
2. Otvori u **Incognito mode** (bez login-a)
3. ✅ Trebalo bi da vidiš kompletan izveštaj opreme
4. ✅ Trebalo bi da vidiš fotke, dokumente, maintenance history

---

## 🔧 Troubleshooting

### Problem: "Supabase credentials not configured"

**Rešenje:** Edit `js/supabase-config.js` sa pravim vrednostima, commit, push.

### Problem: "Permission denied" pri kreiranju lokacije

**Rešenje:**
1. Login sa Google OAuth
2. Proveri da su RLS policies run-ovane (`002_rls_policies.sql`)

### Problem: Upload fotke ne radi

**Rešenje:**
1. Proveri da je storage setup run-ovan (`004_storage_setup.sql`)
2. Proveri file size (max 50MB)
3. Proveri file type (samo JPEG, PNG)

### Problem: QR kod ne otvara izveštaj

**Rešenje:**
1. Proveri URL format: `.../#/report/equipment/{id}`
2. Proveri da equipment postoji u Supabase Database → equipment table
3. Proveri RLS policies (javni READ mora biti enabled)

---

## 📊 Monitoring & Maintenance

### Supabase Dashboard

**Database Usage:**
- Settings → Usage → Database tab
- Prati storage i broj row-eva

**Storage Usage:**
- Storage → Check total size
- Free tier: 1GB
- Cleanup: Delete nepotrebne fotke/dokumenta

**Authentication:**
- Authentication → Users tab
- Vidi sve logged-in users
- Možeš manuelno dodati/ukloniti users

### GitHub Pages

**Deployment Status:**
- Repo → Actions tab
- Vidi deployment history
- Svaki push na `3.supabase` branch auto-deploy-uje

---

## 🔄 Update Workflow

**Kada napraviš izmene u kodu:**

```bash
# 1. Edit fajlove lokalno
# 2. Commit changes
git add .
git commit -m "Description of changes"

# 3. Push to GitHub
git push origin 3.supabase

# 4. GitHub Pages auto-deploy (2-3 minuta)
# 5. Proveri: https://ognjenpetar.github.io/mlff-equipment-tracking/
```

---

## 🎉 Deployment Complete!

**Tvoja aplikacija je live na:**
```
https://ognjenpetar.github.io/mlff-equipment-tracking/
```

**Backend API:**
- Supabase Project: `mlff-equipment-tracking`
- PostgreSQL Database sa 6 tabela
- Storage sa 3 buckets
- Google OAuth authentication

**Sledeći koraci:**
1. ✅ Test all features
2. ✅ Dodaj prvu lokaciju
3. ✅ Dodaj prvu opremu
4. ✅ Generiši QR kod i test-iraj
5. ✅ Share URL sa team-om!

---

**🤖 Generated with [Claude Code](https://claude.com/claude-code)**
