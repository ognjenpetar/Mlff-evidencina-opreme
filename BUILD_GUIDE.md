# Build & Development Guide

## 🔐 Environment Variables Setup

Credentials are stored in `.env` file (NOT committed to Git) for security.

### Quick Start

1. **Copy template:**
   ```bash
   cp .env.example .env
   ```

2. **Edit `.env`** with your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=https://xmkkqawodbejrcjlnmqx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGci...
   ```

3. **Install dependencies:**
   ```bash
   npm install
   ```

4. **Run development server:**
   ```bash
   npm run dev
   ```

   Opens at: http://localhost:5500

---

## 🛠️ Available Scripts

### `npm run dev`
Start local development server with hot reload.
- Port: 5500
- Auto-opens browser
- Uses `.env` file for credentials

### `npm run build`
Build production version.
- Output: `dist/` folder
- Optimized & minified
- Environment variables injected from `.env`

### `npm run preview`
Preview production build locally.
- Serves `dist/` folder
- Test before deployment

---

## 🚀 Deployment Options

### Option A: Manual Deployment

```bash
# Build
npm run build

# Commit dist/ folder
git add dist/
git commit -m "Build production version"
git push origin 3.supabase
```

**GitHub Pages Settings:**
- Branch: `3.supabase`
- Folder: `/dist`

---

### Option B: GitHub Actions (Recommended) ✅

**Automatic deployment on every push!**

#### Setup (One-time):

1. **Add GitHub Secrets:**
   - Go to: https://github.com/ognjenpetar/Mlff-evidencina-opreme/settings/secrets/actions
   - Add two secrets:

   **VITE_SUPABASE_URL**
   ```
   https://xmkkqawodbejrcjlnmqx.supabase.co
   ```

   **VITE_SUPABASE_ANON_KEY**
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhta2txYXdvZGJlanJjamxubXF4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYxMzQ4MTksImV4cCI6MjA4MTcxMDgxOX0.nZSQTc1mqXm4Grv5u2ewolOHhjyvAebfbEnZ65yaZiE
   ```

2. **Configure GitHub Pages:**
   - Go to: https://github.com/ognjenpetar/Mlff-evidencina-opreme/settings/pages
   - **Source:** Deploy from a branch
   - **Branch:** `gh-pages` (GitHub Actions creates this automatically)
   - **Folder:** `/ (root)`
   - **Save**

#### Usage:

Every push to `3.supabase` branch triggers:
1. Install dependencies
2. Build with secrets (environment variables)
3. Deploy to `gh-pages` branch
4. GitHub Pages serves from `gh-pages` branch

**Check deployment status:**
- https://github.com/ognjenpetar/Mlff-evidencina-opreme/actions

---

## 📁 Project Structure

```
Mlff-evidencina-opreme/
├── .env                      # ❌ NOT committed (gitignored)
├── .env.example              # ✅ Template (committed)
├── .gitignore                # Ignores .env, node_modules, dist
├── package.json              # Dependencies & scripts
├── vite.config.js            # Vite build configuration
├── .github/
│   └── workflows/
│       └── deploy.yml        # GitHub Actions auto-deployment
├── index.html                # Main app
├── migration.html            # Migration tool
├── js/
│   ├── supabase-config.js    # Reads import.meta.env.VITE_*
│   ├── supabase-service.js
│   ├── router.js
│   └── app.js
├── css/
├── images/
└── dist/                     # ❌ Build output (gitignored if using GitHub Actions)
```

---

## 🔒 Security

### Why Environment Variables?

**Before (❌ Insecure for public repo):**
```javascript
const SUPABASE_URL = 'https://xmkkqawodbejrcjlnmqx.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGci...'; // Hardcoded in Git!
```

**After (✅ Secure):**
```javascript
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
```

### What's Safe to Commit?

✅ **SAFE (committed to Git):**
- `.env.example` - Template with placeholder values
- `package.json` - No sensitive data
- `vite.config.js` - Configuration only
- `.gitignore` - Prevents `.env` from being committed
- `.github/workflows/deploy.yml` - Deployment automation

❌ **NOT SAFE (gitignored):**
- `.env` - Contains real credentials
- `node_modules/` - Dependencies (install with `npm install`)
- `dist/` - Build output (regenerated with `npm run build`)

### Is `SUPABASE_ANON_KEY` really safe?

**YES!** The "anon/public" key is designed to be exposed in frontend code.

**Security is enforced by:**
1. Row Level Security (RLS) policies in Supabase
2. The anon key has limited permissions (defined by RLS)
3. Service role key (not used here) would be dangerous to expose

**But why use `.env` then?**
- Best practice for credential management
- Makes it easy to switch between dev/prod environments
- Prevents accidental commits of wrong credentials
- Allows contributors to use their own Supabase projects

---

## 🐛 Troubleshooting

### Error: "Missing Supabase credentials"

**Console shows:**
```
❌ ERROR: Supabase credentials not found!
```

**Fix:**
1. Make sure `.env` file exists: `ls -la .env`
2. Check `.env` has both variables:
   ```bash
   cat .env
   ```
3. Restart dev server: `npm run dev`

---

### Error: "npm: command not found"

**Fix:**
1. Install Node.js: https://nodejs.org (v20 or higher)
2. Verify: `node --version` and `npm --version`

---

### GitHub Actions failing?

**Check:**
1. GitHub Secrets are set: https://github.com/ognjenpetar/Mlff-evidencina-opreme/settings/secrets/actions
2. Workflow syntax: `.github/workflows/deploy.yml`
3. Logs: https://github.com/ognjenpetar/Mlff-evidencina-opreme/actions

---

## 📚 Learn More

- **Vite:** https://vitejs.dev
- **Supabase:** https://supabase.com/docs
- **GitHub Actions:** https://docs.github.com/en/actions
- **Environment Variables:** https://vitejs.dev/guide/env-and-mode.html

---

**Ready to deploy? Follow [DEPLOYMENT.md](DEPLOYMENT.md) for complete setup!**
