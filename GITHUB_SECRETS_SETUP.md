# 🔐 GitHub Secrets Setup - OBAVEZNO!

## 🔴 PROBLEM: Deployment Fails Because GitHub Secrets Are Missing!

GitHub Actions workflow (`deploy.yml`) očekuje da imaš postavljene **GitHub Secrets** za Supabase credentials.

Ako ovi secrets nisu postavljeni, deployment će prođi **BEZ grešaka**, ali aplikacija neće raditi jer će Supabase credentials biti prazni!

---

## ✅ REŠENJE: Dodaj GitHub Secrets

### KORAK 1: Otvori Repository Settings

1. Idi na: https://github.com/ognjenpetar/Mlff-evidencina-opreme
2. Klikni **"Settings"** tab (desno gore)
3. U levom meniju, klikni **"Secrets and variables"** → **"Actions"**

### KORAK 2: Dodaj Prvi Secret - VITE_SUPABASE_URL

1. Klikni **"New repository secret"** (zeleno dugme desno)
2. **Name**: `VITE_SUPABASE_URL`
3. **Value**: `https://xmkkqawodbejrcjlnmqx.supabase.co`
4. Klikni **"Add secret"**

### KORAK 3: Dodaj Drugi Secret - VITE_SUPABASE_ANON_KEY

1. Klikni **"New repository secret"** ponovo
2. **Name**: `VITE_SUPABASE_ANON_KEY`
3. **Value**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhta2txYXdvZGJlanJjamxubXF4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYxMzQ4MTksImV4cCI6MjA4MTcxMDgxOX0.nZSQTc1mqXm4Grv5u2ewolOHhjyvAebfbEnZ65yaZiE`
4. Klikni **"Add secret"**

---

## ✅ KORAK 4: Trigger Redeploy

Nakon što dodaš secrets, moraš ponovo pokrenuti deployment:

### Opcija A: Push Dummy Commit (Brže)

```bash
git commit --allow-empty -m "chore: Trigger redeployment with GitHub Secrets"
git push origin main
```

### Opcija B: Manual Workflow Trigger

1. Idi na: https://github.com/ognjenpetar/Mlff-evidencina-opreme/actions
2. Klikni na **"Deploy to GitHub Pages"** workflow (leva strana)
3. Klikni **"Run workflow"** (desno) → **"Run workflow"** (zeleno dugme)

---

## ✅ KORAK 5: Proveri Deployment

1. **Idi na GitHub Actions**: https://github.com/ognjenpetar/Mlff-evidencina-opreme/actions
2. **Sačekaj da deployment završi** (~2-3 min)
   - Trebao bi da vidiš **zeleni checkmark** ✅
3. **Otvori app u NOVOM Incognito tab-u**:
   - Chrome/Edge: `Ctrl + Shift + N`
   - Firefox: `Ctrl + Shift + P`
   - Brave: `Ctrl + Shift + N`
4. **Otvori**: https://ognjenpetar.github.io/Mlff-evidencina-opreme/
5. **Proveri Console (F12)**:
   - ✅ Trebao bi da vidiš: "✅ Supabase client initialized successfully"
   - ❌ NE bi trebalo da vidiš: "SyntaxError" ili "Identifier 'supabase' has already been declared"

---

## 🔍 Kako Proveriti Da Li Su Secrets Postavljeni?

Nakon što dodaš secrets, proveri:

1. Idi na: https://github.com/ognjenpetar/Mlff-evidencina-opreme/settings/secrets/actions
2. Trebao bi da vidiš:
   ```
   VITE_SUPABASE_URL          Updated X seconds ago
   VITE_SUPABASE_ANON_KEY     Updated X seconds ago
   ```

**VAŽNO**: Ne možeš videti VALUE secrets-a nakon što ih dodaš (GitHub ih skriva). Možeš samo videti da postoje.

---

## 📋 Checklist - Da Li Si Sve Uradio?

- [ ] Otvorio GitHub Repository Settings
- [ ] Dodao `VITE_SUPABASE_URL` secret
- [ ] Dodao `VITE_SUPABASE_ANON_KEY` secret
- [ ] Trigger-ovao redeployment (push commit ili manual workflow)
- [ ] Sačekao da deployment završi (~2-3 min)
- [ ] Otvorio app u NOVOM Incognito tab-u
- [ ] Proverio da nema greške u Console-u
- [ ] Testirao photo upload (dodaj lokaciju sa slikom)

---

## ❓ Zašto Je Ovo Neophodno?

### Problem:
- Lokalni development koristi `.env` fajl (koji NIJE u git-u)
- GitHub Actions NE može pristupiti tvojim lokalnim fajlovima
- Zato mora koristiti GitHub Secrets

### Rešenje:
- GitHub Secrets čuvaju osetljive podatke bezbedno
- Workflow ih ubacuje tokom build procesa
- Rezultat: Built aplikacija ima credentials

### Bez Secrets-a:
```javascript
// ❌ GitHub Actions build bez secrets:
const SUPABASE_URL = '';  // PRAZNO!
const SUPABASE_ANON_KEY = '';  // PRAZNO!
```

### Sa Secrets-ima:
```javascript
// ✅ GitHub Actions build sa secrets:
const SUPABASE_URL = 'https://xmkkqawodbejrcjlnmqx.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1...';
```

---

## 🐛 Common Issues

### Issue 1: "Secrets tab not visible"
**Rešenje**: Moraš biti vlasnik/admin repository-ja. Ako nisi, kontaktiraj vlasnika da doda secrets.

### Issue 2: "Deployment successful but app still broken"
**Rešenje**:
1. Proveri da li si pravilno copy-paste-ovao secret values (bez razmaka na kraju!)
2. Sačekaj 5-10 min za CDN propagation
3. Obriši browser cache i otvori u Incognito mode

### Issue 3: "How do I know if secrets are correct?"
**Rešenje**: Nakon deployment-a, otvori Console (F12) i proveri:
```
✅ Supabase client initialized successfully
🌐 Project URL: https://xmkkqawodbejrcjlnmqx.supabase.co
```
Ako vidiš pravilni URL, secrets su postavljeni!

---

## 📚 Reference Links

- **Repository Settings**: https://github.com/ognjenpetar/Mlff-evidencina-opreme/settings
- **GitHub Actions**: https://github.com/ognjenpetar/Mlff-evidencina-opreme/actions
- **Secrets Page**: https://github.com/ognjenpetar/Mlff-evidencina-opreme/settings/secrets/actions
- **Deployed App**: https://ognjenpetar.github.io/Mlff-evidencina-opreme/

---

## 🎯 TL;DR

1. Idi na: https://github.com/ognjenpetar/Mlff-evidencina-opreme/settings/secrets/actions
2. Dodaj 2 secrets:
   - `VITE_SUPABASE_URL` = `https://xmkkqawodbejrcjlnmqx.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = (long JWT token from .env file)
3. Push empty commit: `git commit --allow-empty -m "chore: Redeploy" && git push`
4. Sačekaj 2-3 min
5. Otvori app u Incognito mode
6. Testiraj!

**Bez ovih secrets-a, aplikacija NIKAD neće raditi na GitHub Pages!**
