# MLFF Equipment Tracking System

**Version 4.0 - Enhanced Edition** | [Orion E-mobility](https://github.com/ognjenpetar/mlff-equipment-tracking)

A modern web application for tracking and managing MLFF (Medium-Large Fiber Facility) equipment installations with GPS coordinates, QR codes with logo, maintenance history, and document management.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Version](https://img.shields.io/badge/version-4.0-green.svg)
![Status](https://img.shields.io/badge/status-production-brightgreen.svg)

---

## 🎯 Features

### Core Functionality
- ✅ **Location Management** - Track installation sites with GPS coordinates and interactive maps
- ✅ **Equipment Tracking** - Complete inventory with technical specs, photos, and status
- ✅ **QR Code with Logo** - Branded QR codes with MLFF logo overlay for instant equipment access
- ✅ **Sub-Location Categorization** - Organize equipment by cabinet type (Gentri/Ormar)
- ✅ **Extended Equipment Fields** - Track manufacturer, model, and serial number
- ✅ **Document Management** - Upload and store PDFs (manuals, certificates, specs) up to 50MB
- ✅ **Maintenance History** - Track service records, costs, and upcoming maintenance
- ✅ **Enhanced Audit Logging** - Detailed change tracking with old/new value comparison
- ✅ **Custom Equipment Types** - Add your own equipment categories
- ✅ **Search & Filter** - Fast search by inventory number, type, status, or location

### Technical Features
- 🌐 **Cloud Database** - Supabase PostgreSQL (unlimited capacity vs LocalStorage 5-10MB)
- 📦 **Cloud Storage** - Supabase Storage (1GB free, up to 50MB per file)
- 🔐 **Authentication** - Google OAuth via Supabase Auth
- 🌍 **Public QR Access** - Equipment reports visible without login
- 🚀 **GitHub Pages Hosting** - Free unlimited bandwidth
- 📱 **Responsive Design** - Works on desktop, tablet, and mobile
- 🗺️ **Interactive Maps** - OpenStreetMap integration with location markers
- 🔍 **Full-Text Search** - PostgreSQL GIN indexes for instant search

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    USER INTERFACE (SPA)                     │
│  index.html + CSS + JavaScript (Hash-based routing)         │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ HTTPS
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   GITHUB PAGES HOSTING                      │
│  Static files (HTML, CSS, JS) - Free unlimited bandwidth     │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ Supabase JS SDK
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    SUPABASE BACKEND                         │
│  ┌────────────────┐  ┌────────────────┐  ┌───────────────┐ │
│  │   PostgreSQL   │  │    Storage     │  │     Auth      │ │
│  │   (Database)   │  │   (Files)      │  │  (Google)     │ │
│  │                │  │                │  │               │ │
│  │ - locations    │  │ - Photos       │  │ - User mgmt   │ │
│  │ - equipment    │  │ - Documents    │  │ - OAuth       │ │
│  │ - documents    │  │ (50MB max)     │  │ - Sessions    │ │
│  │ - maintenance  │  │                │  │               │ │
│  │ - audit_log    │  │ Public URLs    │  │ JWT tokens    │ │
│  └────────────────┘  └────────────────┘  └───────────────┘ │
│                                                             │
│  Row Level Security (RLS):                                 │
│  ✅ Public READ (QR codes work without login)              │
│  🔒 Authenticated WRITE (admin only)                       │
└─────────────────────────────────────────────────────────────┘
```

**Data Flow:**
1. User opens `https://ognjenpetar.github.io/mlff-equipment-tracking/`
2. GitHub Pages serves static HTML/CSS/JS files
3. Browser loads Supabase SDK and connects to database
4. User can view data (public) or login to modify (authenticated)
5. QR codes link directly to equipment reports (public access)

---

## 🚀 Quick Start

### 1. Prerequisites
- [Supabase account](https://supabase.com) (free tier)
- [GitHub account](https://github.com) (for hosting)
- [Google Cloud account](https://console.cloud.google.com) (for OAuth)

### 2. Setup Supabase

```bash
# 1. Create Supabase project
# Go to https://supabase.com → Create project: "mlff-equipment-tracking"
# Region: Europe West (closest to Serbia)

# 2. Run SQL migrations
# Supabase Dashboard → SQL Editor → Run these files in order:
supabase/migrations/001_initial_schema.sql
supabase/migrations/002_rls_policies.sql
supabase/migrations/003_indexes.sql
supabase/migrations/004_storage_setup.sql
# Version 4.0 enhancements:
supabase/migrations/005_sub_location_field.sql
supabase/migrations/006_shared_documents.sql
supabase/migrations/007_enhanced_audit_log.sql

# 3. Get API credentials
# Settings → API → Copy:
#   - Project URL
#   - anon/public key
```

### 3. Configure Application

```bash
# Clone repository
git clone https://github.com/ognjenpetar/mlff-equipment-tracking.git
cd mlff-equipment-tracking

# Checkout Supabase branch
git checkout 3.supabase

# Edit js/supabase-config.js
# Replace:
#   SUPABASE_URL = 'https://YOUR-PROJECT-ID.supabase.co'
#   SUPABASE_ANON_KEY = 'your-anon-key-here'
```

### 4. Setup Google OAuth

See detailed instructions in [DEPLOYMENT.md](DEPLOYMENT.md#google-oauth-setup).

### 5. Deploy to GitHub Pages

```bash
# Push to GitHub
git push origin 3.supabase

# Enable GitHub Pages
# GitHub repo → Settings → Pages
# Source: 3.supabase branch, / (root) folder
# Save

# Your app will be live at:
# https://ognjenpetar.github.io/mlff-equipment-tracking/
```

### 6. Migrate Data (Optional)

If you have data from previous version (v1.3 LocalStorage or v2.0 Firebase):

```bash
# Open migration.html in browser
# Login with Google OAuth
# Click "Start Migration"
# Wait for completion (5-30 minutes)
```

---

## 📚 Documentation

- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Complete deployment guide (Supabase setup, GitHub Pages, OAuth)
- **[BACKEND_GUIDE.md](BACKEND_GUIDE.md)** - Technical documentation (database schema, API reference, security)
- **[UPUTSTVO_ZA_KORISCENJE.md](UPUTSTVO_ZA_KORISCENJE.md)** - User guide in Serbian (step-by-step instructions)

---

## 🛠️ Technology Stack

### Frontend
- **HTML5** - Semantic markup
- **CSS3** - Modern styling with gradients, flexbox, grid
- **JavaScript (ES6+)** - Async/await, modules, arrow functions
- **[Leaflet.js](https://leafletjs.com/)** - Interactive maps (OpenStreetMap)
- **[QRCode.js](https://davidshimjs.github.io/qrcodejs/)** - QR code generation
- **[Font Awesome](https://fontawesome.com/)** - Icons

### Backend
- **[Supabase](https://supabase.com/)** - Backend-as-a-Service
  - **PostgreSQL** - Relational database with full-text search
  - **Storage** - File storage with CDN (photos, PDFs)
  - **Auth** - Google OAuth authentication
  - **Row Level Security** - Fine-grained access control

### Hosting
- **[GitHub Pages](https://pages.github.com/)** - Static site hosting (free unlimited)

### Development
- **Git** - Version control
- **GitHub** - Repository hosting
- **VSCode** - Code editor (recommended)

---

## 💾 Database Schema

```sql
-- 6 PostgreSQL tables with foreign key relationships

locations (
    id UUID PRIMARY KEY,
    name TEXT,
    latitude NUMERIC(10,7),
    longitude NUMERIC(10,7),
    address TEXT,
    photo_url TEXT,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
)

equipment (
    id UUID PRIMARY KEY,
    location_id UUID → locations(id) CASCADE,
    inventory_number TEXT UNIQUE,
    type TEXT,
    status TEXT, -- Aktivna, Na servisu, Neispravna, Povučena
    manufacturer TEXT,
    model TEXT,
    serial_number TEXT,
    ip_address INET,
    mac_address MACADDR,
    installation_date DATE,
    warranty_expiry DATE,
    photo_url TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
)

documents (
    id UUID PRIMARY KEY,
    equipment_id UUID → equipment(id) CASCADE,
    name TEXT,
    file_url TEXT,
    storage_path TEXT,
    file_type TEXT,
    file_size BIGINT,
    uploaded_at TIMESTAMPTZ
)

maintenance (
    id UUID PRIMARY KEY,
    equipment_id UUID → equipment(id) CASCADE,
    type TEXT, -- Preventivni, Korektivni, Inspekcija, etc.
    date DATE,
    description TEXT,
    performed_by TEXT,
    cost NUMERIC(10,2),
    next_service_date DATE
)

audit_log (
    id UUID PRIMARY KEY,
    equipment_id UUID → equipment(id) CASCADE,
    action TEXT,
    details TEXT,
    user_id UUID,
    user_email TEXT,
    timestamp TIMESTAMPTZ
)

custom_types (
    id UUID PRIMARY KEY,
    type_name TEXT UNIQUE
)
```

See [BACKEND_GUIDE.md](BACKEND_GUIDE.md) for detailed schema documentation.

---

## 💰 Cost Analysis

### Supabase Free Tier (Spark Plan)

**Database:**
- ✅ 500 MB storage (enough for 1000+ equipment)
- ✅ Unlimited API requests
- ✅ 50,000 database rows

**Storage:**
- ✅ 1 GB file storage
- ✅ 2 GB bandwidth/month
- ✅ 50 MB max file size

**Authentication:**
- ✅ Unlimited users
- ✅ Google OAuth included

**Hosting (GitHub Pages):**
- ✅ Unlimited bandwidth (soft limit: 100 GB/month)
- ✅ Unlimited page views
- ✅ Free SSL certificate

### Estimated Usage

**Typical deployment:**
- 100 locations × 5 KB = 500 KB
- 1000 equipment × 10 KB = 10 MB
- 5000 documents (200 KB avg) = 1 GB
- **Total storage:** ~1 GB (within free tier)

**Bandwidth:**
- QR code scans: 1000/month × 100 KB = 100 MB
- Admin access: 100 sessions × 5 MB = 500 MB
- **Total bandwidth:** ~600 MB/month (within 2 GB free tier)

### Upgrade Costs (if needed)

**Supabase Pro Plan: $25/month**
- 8 GB database
- 100 GB file storage
- 50 GB bandwidth

**Conclusion: Free tier is sufficient for most use cases! 🎉**

---

## 🔐 Security

### Data Protection
- ✅ **Row Level Security (RLS)** - PostgreSQL policies prevent unauthorized access
- ✅ **Public READ** - QR codes work without login (equipment reports only)
- ✅ **Authenticated WRITE** - Only logged-in admins can create/update/delete
- ✅ **Google OAuth** - No passwords stored, secure authentication
- ✅ **File Validation** - Max 50MB, only images and PDFs allowed
- ✅ **SQL Injection Protection** - Supabase parameterized queries
- ✅ **XSS Protection** - Input sanitization in frontend

### Best Practices
1. **Never commit Supabase credentials to public repo** - Use environment variables
2. **Rotate API keys regularly** - Supabase Dashboard → Settings → API
3. **Monitor usage** - Check Supabase Dashboard for unusual activity
4. **Backup data regularly** - Use Supabase export features
5. **Use HTTPS only** - GitHub Pages enforces SSL automatically

---

## 🐛 Troubleshooting

### Common Issues

**1. "Supabase credentials not configured"**
- **Solution:** Edit `js/supabase-config.js` with your project URL and anon key

**2. "No data found in LocalStorage" (migration)**
- **Solution:** Open migration.html in same browser where v1.3 was used

**3. "Permission denied" when creating location**
- **Solution:** Login with Google OAuth first (click Login button)

**4. "Failed to upload photo"**
- **Solution:** Check file size (max 50MB) and type (JPEG, PNG only)

**5. QR code doesn't load equipment report**
- **Solution:** Verify equipment exists in Supabase Dashboard → Database → equipment table

### Debug Mode

Open browser console (F12) to see detailed logs:
```javascript
// Check Supabase connection
await supabase.from('locations').select('count')

// Check authentication status
const user = await getCurrentUser()
console.log(user)

// Test database query
const { data, error } = await supabase.from('equipment').select('*').limit(5)
console.log(data, error)
```

---

## 📦 Project Structure

```
mlff-equipment-tracking/
├── index.html                  # Main application (SPA)
├── migration.html              # Migration tool (LocalStorage → Supabase)
├── css/
│   └── styles.css              # Application styles
├── js/
│   ├── supabase-config.js      # Supabase initialization
│   ├── supabase-service.js     # Database & storage operations (22 functions)
│   ├── router.js               # Hash-based routing
│   └── app.js                  # Application logic
├── supabase/
│   └── migrations/
│       ├── 001_initial_schema.sql      # Database tables
│       ├── 002_rls_policies.sql        # Security policies
│       ├── 003_indexes.sql             # Performance indexes
│       └── 004_storage_setup.sql       # Storage buckets
├── firebase-version/           # Archived Firebase v2.0 implementation
│   ├── js/
│   │   ├── firebase-config.js
│   │   └── firebase-service.js
│   ├── firestore.rules
│   ├── storage.rules
│   ├── firebase.json
│   └── ... (all v2.0 files preserved)
├── README.md                   # This file
├── DEPLOYMENT.md               # Deployment guide
├── BACKEND_GUIDE.md            # Technical documentation
└── UPUTSTVO_ZA_KORISCENJE.md   # User guide (Serbian)
```

---

## 🔄 Version History

### Version 3.0 - Supabase Edition (Current)
- ✅ Migrated from Firebase to Supabase + GitHub Pages
- ✅ PostgreSQL database (vs NoSQL Firestore)
- ✅ Better free tier (1GB storage, 2GB bandwidth)
- ✅ No regional restrictions
- ✅ Unlimited hosting (GitHub Pages)

### Version 2.0 - Firebase Backend
- ✅ Cloud database (Firestore)
- ✅ Cloud storage (Firebase Storage)
- ✅ Authentication (Firebase Auth)
- ❌ Regional restrictions (Europe storage issues)
- ❌ Limited bandwidth (360MB/day)
- 📦 Archived in `firebase-version/` folder

### Version 1.3 - LocalStorage
- ✅ Offline-first design
- ❌ Limited capacity (5-10MB)
- ❌ No cloud sync
- ❌ Browser-dependent data

---

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see LICENSE file for details.

---

## 🙏 Acknowledgments

- **[Supabase](https://supabase.com/)** - Open source Firebase alternative
- **[GitHub Pages](https://pages.github.com/)** - Free static site hosting
- **[Leaflet](https://leafletjs.com/)** - Open source mapping library
- **[OpenStreetMap](https://www.openstreetmap.org/)** - Free map data
- **[QRCode.js](https://davidshimjs.github.io/qrcodejs/)** - QR code generation
- **[Font Awesome](https://fontawesome.com/)** - Icon library

---

## 📞 Support

- **GitHub Issues:** [Report a bug](https://github.com/ognjenpetar/mlff-equipment-tracking/issues)
- **Documentation:** See [DEPLOYMENT.md](DEPLOYMENT.md) and [BACKEND_GUIDE.md](BACKEND_GUIDE.md)
- **Email:** [your-email@example.com](mailto:your-email@example.com)

---

## 🌟 Star This Repo

If you find this project useful, please give it a star! ⭐

It helps others discover this project and motivates continued development.

---

**Built with ❤️ using [Claude Code](https://claude.com/claude-code)**

**Version:** 3.0 - Supabase Edition
**Last Updated:** December 2025
