# Deployment Guide - MLFF Equipment Tracking App

## Pregled

Ova aplikacija je statička SPA (Single Page Application) koja može biti hostovana na bilo kom besplatnom static hosting servisu. Podaci se čuvaju lokalno u browser-u putem LocalStorage API-ja.

**Verzija:** 1.3 - Web Deployment Edition

---

## Deployment Opcije

### 1. **GitHub Pages** (PREPORUKA)

**Prednosti:** Besplatno, jednostavno, SSL, custom domain podrška

**Koraci:**

1. Push kod na GitHub repository:
   ```bash
   git add .
   git commit -m "Deploy web version"
   git push origin 2.web
   ```

2. Idi na Settings > Pages u GitHub repo-u

3. Izaberi branch: `2.web` (ili `main` ako je mergovan)

4. Izaberi folder: `/` (root)

5. Klikni Save

6. Aplikacija će biti dostupna na: `https://[username].github.io/[repo-name]/`

**Konfigurisanje Custom Domain:**
- Dodaj `CNAME` fajl u root sa domenom
- U GitHub Settings > Pages postavi custom domain
- Konfiguriši DNS A record ili CNAME kod registrara

**NAPOMENA:** GitHub Pages može imati keširanje. Nakon deployment-a, sačekaj 1-2 minuta i radi hard refresh (Ctrl+Shift+R).

---

### 2. **Netlify**

**Prednosti:** Automatski deployment, continuous deployment, serverless functions

**Koraci putem Web UI:**

1. Registruj se na [netlify.com](https://netlify.com)

2. Klikni "New site from Git"

3. Poveži GitHub repo

4. Build settings:
   - Build command: (leave empty)
   - Publish directory: `/`

5. Deploy!

**Netlify Drop (Brži način):**
- Jednostavno prevuci ceo folder na [netlify.com/drop](https://netlify.com/drop)
- Odmah dobijaš URL

**Netlify CLI:**
```bash
npm i -g netlify-cli
netlify init
netlify deploy --prod
```

---

### 3. **Vercel**

**Prednosti:** Fast CDN, automatski SSL, analytics

**Koraci putem CLI:**

1. Instaliraj Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. U root folderu aplikacije:
   ```bash
   vercel
   ```

3. Prati on-screen instrukcije

4. Deployment URL će biti prikazan

**Vercel Web Dashboard:**
- Idi na [vercel.com](https://vercel.com)
- "New Project" > Import Git Repository
- Deploy

---

### 4. **Cloudflare Pages**

**Prednosti:** Globalni CDN, unlimited bandwidth, analytics

**Koraci:**

1. Idi na [pages.cloudflare.com](https://pages.cloudflare.com)

2. Poveži GitHub repo

3. Build settings: leave empty (static site)

4. Deploy

**Custom Domain:**
- Dodaj domen u Cloudflare Pages settings
- Konfiguriši DNS automatski kroz Cloudflare

---

### 5. **Firebase Hosting**

**Prednosti:** Google infrastruktura, analytics, custom domains

**Koraci:**

1. Instaliraj Firebase CLI:
   ```bash
   npm install -g firebase-tools
   ```

2. Login:
   ```bash
   firebase login
   ```

3. Inicijalizuj projekt:
   ```bash
   firebase init hosting
   ```
   - Public directory: `.` (current directory)
   - Single-page app: **Yes**
   - Automatic builds: No

4. Deploy:
   ```bash
   firebase deploy
   ```

---

## Lokalno Korišćenje

### Metoda 1: Live Server (Preporuka za development)

**VSCode Extension:**
1. Instaliraj "Live Server" extension u VSCode
2. Right-click na `index.html` > "Open with Live Server"
3. Otvori: `http://localhost:5500`

**Python HTTP Server:**
```bash
cd "c:\Users\ognjen.petar\OPT APPS\Mlff-evidencina-opreme"
python -m http.server 8000
```
Otvori: `http://localhost:8000`

**Node.js http-server:**
```bash
npx http-server -p 8000
```
Otvori: `http://localhost:8000`

### Metoda 2: Direktno Otvaranje

Samo dupli-klik na `index.html` fajl.

**NAPOMENA:** Neke funkcionalnosti mogu biti ograničene zbog CORS politike browsera. Preporučuje se korišćenje Live Server-a.

---

## Sub-Page Arhitektura

Aplikacija koristi hash-based routing za sub-page navigaciju:

### URL Struktura:

- `/#/` - Dashboard
- `/#/location/:id` - Detalji lokacije
- `/#/equipment/:id` - Detalji opreme
- `/#/report/location/:id` - Izveštaj lokacije
- `/#/report/equipment/:id` - Izveštaj opreme

### QR Kodovi:

QR kodovi generišu direktne URL-ove ka opremi:
```
https://[your-domain].com/#/equipment/[equipment-id]
```

Skeniranjem QR koda, otvaraju se kompletni podaci opreme uključujući:
- Lokacija i GPS koordinate
- Sve tehničke specifikacije
- Dokumentacija
- Servisna istorija
- Audit log

---

## Podaci i Backup

### LocalStorage Lokacija

Podaci se čuvaju u browser-u na:

**Chrome/Edge:**
```
C:\Users\[User]\AppData\Local\Google\Chrome\User Data\Default\Local Storage
```

**Firefox:**
```
C:\Users\[User]\AppData\Roaming\Mozilla\Firefox\Profiles\[profile]\storage\default
```

### Backup Strategy

1. **Ručni Backup:**
   - Koristi "Export Data" dugme u app header-u
   - Sačuvaj JSON fajl na sigurno mesto

2. **Automatski Podsetnik:**
   - Aplikacija podseća svakih 7 dana
   - Sačuvaj backup fajl format: `mlff-backup-YYYY-MM-DD.json`

3. **Cloud Backup:**
   - Upload JSON fajl na Google Drive, Dropbox, ili OneDrive
   - Email sebi JSON kao attachment

### Multi-Device Sync

Budući da je LocalStorage lokalan, za sinhronizaciju između uređaja:

1. Export podataka sa uređaja A
2. Import podataka na uređaj B

**Alternativa:** Implementirati cloud sync (future feature)

---

## Environment Specifics

### Produkcija (Web Hosting)

- URL routing putem hash (#) radi out-of-the-box
- Nema potrebe za server-side konfiguracija
- SSL certificate automatski sa većinom hosting providera
- PWA features mogu biti dodate u budućnosti

### Development (Lokalno)

- Koristi Live Server da izbegneš CORS probleme
- Testiranje QR kodova: koristi localhost URL ili ngrok

---

## Troubleshooting

### Problem: Podaci se gube nakon refresha

**Uzrok:** Browser mode (Incognito) ili cleared cache

**Rešenje:**
- Koristi normalni browser mode
- Proveri da li je LocalStorage omogućen
- Redovno pravi backup

### Problem: QR kod ne radi sa telefona

**Uzrok:** Localhost URL ne može biti skeniran sa telefona

**Rešenje:**
- Hostuj na web (GitHub Pages, Netlify, itd.)
- Koristi ngrok za lokalni tunnel:
  ```bash
  ngrok http 8000
  ```
  Koristi ngrok URL za testiranje

### Problem: Dokumenta ne učitavaju

**Uzrok:** CORS restrictions ili LocalStorage limit (5-10MB)

**Rešenje:**
- Koristi Live Server umesto direktnog otvaranja fajla
- Smanji veličinu PDF-ova (max 10MB po fajlu)
- Kompresuj PDF-ove pre upload-a
- Implementiraj external storage (future)

### Problem: Aplikacija spora sa puno dokumenata

**Uzrok:** Base64 encoding povećava veličinu za ~33%

**Rešenje:**
- Brisi nepotrebne dokumente
- Koristi kompreovane PDF-ove
- Monitor storage usage:
  ```javascript
  console.log(JSON.stringify(localStorage).length, "bytes")
  ```

### Problem: Upload dokumenta ne radi

**Uzrok:** Fajl prevelik (>10MB) ili pogrešan tip

**Rešenje:**
- Proveri veličinu fajla (max 10MB)
- Samo PDF fajlovi su podržani
- Kompresuj PDF pre upload-a

---

## Performance Optimization

### LocalStorage Limits

- **Max:** ~5-10MB zavisi od browser-a
- **Monitor:** `JSON.stringify(localStorage).length`
- **Cleanup:** Obriši stare dokumente ako se približavaš limitu

### CDN Resources

Eksterni resources učitavaju sa CDN-a:
- Leaflet (OpenStreetMap): unpkg.com
- Font Awesome: cdnjs.cloudflare.com
- QRCode.js: cdnjs.cloudflare.com

**Offline korišćenje:**
Za potpuno offline rešenje, download i host lokalno:
1. Download biblioteke
2. Dodaj u `/libs` folder
3. Update `<script>` tagove u `index.html`

### Browser Compatibility

**Podržani browseri:**
- Chrome 90+
- Firefox 88+
- Edge 90+
- Safari 14+

**Mobilni browseri:**
- Chrome Android
- Safari iOS

---

## Security Notes

### Data Privacy

- **Svi podaci se čuvaju lokalno** - ništa se ne šalje na server
- **Nema tracking-a** - potpuna privatnost
- **Backup JSON** može sadržati osetljive podatke - čuvati bezbedno

### Best Practices

1. **Backup Encryption:**
   - Enkriptuj backup JSON fajl pre uploada na cloud
   - Koristi password-protected ZIP

2. **Access Control:**
   - Za deployment na javnom URL-u, razmotri dodavanje autentifikacije
   - Firebase Auth, Netlify Identity, ili custom solution

3. **XSS Protection:**
   - User input se escape-uje pre prikazivanja
   - No eval() usage
   - Sanitizacija file uploads

---

## Future Enhancements

Planirane feature-e:

1. **Progressive Web App (PWA)**
   - Offline support
   - Install to homescreen
   - Background sync

2. **Cloud Sync opcija**
   - Firebase Realtime Database
   - Supabase
   - Custom backend

3. **Multi-user Collaboration**
   - Role-based access control
   - Real-time updates
   - Conflict resolution

4. **External Document Storage**
   - AWS S3
   - Firebase Storage
   - Cloudflare R2

5. **Advanced Reporting**
   - PDF generation
   - Excel export
   - Custom templates

---

## Performance Benchmarks

### Load Times (typical):

- **Initial load:** < 1s
- **Dashboard render:** < 100ms
- **Location detail:** < 50ms
- **Equipment detail:** < 50ms

### Storage Usage:

- **Base app:** ~500 KB (HTML + CSS + JS)
- **Per location:** ~2 KB
- **Per equipment:** ~5 KB (bez dokumenata)
- **Per PDF document (1MB):** ~1.3 MB (base64 encoded)

### Recommendations:

- **Max 50 lokacija**
- **Max 500 opreme**
- **Max 100 dokumenata** (zavisno od veličine)

---

## Kontakt i Podrška

### Reportovanje Problema:

- GitHub Issues: [link-to-repo]
- Email: [contact-email]

### Verzija:

- **Trenutna verzija:** 1.3 - Web Deployment Edition
- **Branch:** 2.web
- **Datum:** Decembar 2025

---

## Dodatne Napomene

### Migracija sa Lokalne Verzije:

1. Export podataka iz lokalne verzije
2. Deploy web verziju
3. Otvori web verziju u browser-u
4. Import podataka

### Browser LocalStorage Backup:

Pre čišćenja browser-a, uvek eksportuj podatke!

**Chrome DevTools Backup:**
1. F12 > Application > Local Storage
2. Right-click > Copy
3. Sačuvaj u text fajl

---

## Quick Start za Production Deployment

```bash
# 1. Clone repo
git clone [repo-url]
cd Mlff-evidencina-opreme

# 2. Checkout 2.web branch
git checkout 2.web

# 3. Deploy na GitHub Pages (najbrže)
# Samo push i enable Pages u Settings

# ILI deploy na Netlify Drop
# Prevuci folder na netlify.com/drop

# ILI deploy sa Vercel CLI
npx vercel --prod
```

**To je to! Aplikacija je live!** 🎉

---

## Licenses

- **QRCode.js:** MIT License
- **Leaflet:** BSD 2-Clause License
- **Font Awesome:** Icons - CC BY 4.0, Fonts - SIL OFL 1.1, Code - MIT

---

**Napravljeno sa [Claude Code](https://claude.com/claude-code) 🤖**
