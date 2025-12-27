# Firebase Version Archive - v2.0

This folder contains the **archived Firebase backend implementation** (Version 2.0) of the MLFF Equipment Tracking application.

## Why This Archive Exists

Version 3.0 migrated the application from Firebase to **Supabase + GitHub Pages** architecture due to:
- 🚫 Firebase Storage regional restrictions (Europe regions don't support free tier)
- ✅ Better free tier with Supabase (1GB storage, 2GB bandwidth/month)
- ✅ PostgreSQL power (vs NoSQL Firestore)
- ✅ Unlimited hosting with GitHub Pages

**This archive preserves the complete Firebase v2.0 implementation** for reference, rollback, or future use.

---

## Archived Files

### Backend Configuration
- **`js/firebase-config.js`** - Firebase SDK initialization
- **`js/firebase-service.js`** - Complete Firebase service layer (600+ lines)
  - Locations CRUD
  - Equipment CRUD
  - Documents upload/download (Firebase Storage)
  - Maintenance history
  - Audit log
  - Custom types

### Security & Rules
- **`firestore.rules`** - Firestore security rules (public read, auth write)
- **`storage.rules`** - Firebase Storage rules (max 50MB, file validation)

### Configuration
- **`firebase.json`** - Firebase Hosting configuration
- **`.firebaserc`** - Firebase project configuration
- **`firestore.indexes.json`** - Firestore composite indexes

### Migration & Tools
- **`migration-firebase.html`** - LocalStorage → Firebase migration tool

### Documentation
- **`README-FIREBASE.md`** - Firebase version project overview
- **`DEPLOYMENT-FIREBASE.md`** - Firebase deployment guide (800+ lines)
- **`BACKEND_GUIDE-FIREBASE.md`** - Firebase technical documentation (600+ lines)
- **`UPUTSTVO-FIREBASE.md`** - User guide in Serbian (700+ lines)

---

## How to Use This Archive

### Option 1: Rollback to Firebase (if needed)

If you need to revert to the Firebase version:

```bash
# Switch to Firebase branch
git checkout 2.web

# Deploy to Firebase
firebase deploy
```

### Option 2: Reference Implementation

Use these files as reference when:
- Understanding the original Firebase architecture
- Comparing Supabase vs Firebase implementations
- Troubleshooting migration issues

### Option 3: Restore Files

If you want to restore specific Firebase files:

```bash
# Copy files from archive back to project root
cp firebase-version/js/firebase-config.js js/
cp firebase-version/js/firebase-service.js js/

# Update index.html to load Firebase SDK instead of Supabase
```

---

## Version Information

- **Version:** 2.0 - Backend Architecture Edition
- **Branch:** `2.web`
- **Last Commit:** [Phase 2-8] Version 2.0 - Complete Backend Architecture Implementation
- **Archived On:** December 2025
- **Reason for Archive:** Migration to Supabase + GitHub Pages (v3.0)

---

## Firebase Features (Preserved)

✅ **Cloud Storage** - Firebase Storage (up to 5GB per file, free tier: 1GB)
✅ **NoSQL Database** - Firestore (free tier: 1GB)
✅ **Authentication** - Firebase Auth with Google OAuth
✅ **QR Code Public Access** - Direct equipment reports without login
✅ **Security Rules** - Public read, authenticated write
✅ **File Uploads** - Up to 50MB per file
✅ **Hosting** - Firebase Hosting with CDN

---

## Migration to v3.0 (Supabase)

The current version (v3.0) uses:
- **Database:** PostgreSQL (Supabase) instead of Firestore
- **Storage:** Supabase Storage instead of Firebase Storage
- **Hosting:** GitHub Pages instead of Firebase Hosting
- **Auth:** Supabase Auth (Google OAuth) instead of Firebase Auth

See the root `README.md` and `DEPLOYMENT.md` for Supabase documentation.

---

## Firebase Project Credentials (If Still Active)

If your Firebase project is still active, credentials are in:
- **Project ID:** `mlff-equipment-tracking` (or your custom project)
- **Config:** See `firebase-version/js/firebase-config.js`
- **Firebase Console:** https://console.firebase.google.com

**Note:** If you've fully migrated to Supabase, you may want to delete the Firebase project to avoid accidental billing (if you upgraded to Blaze plan).

---

## Questions or Issues?

- **Firebase v2.0 Documentation:** See files in this folder
- **Supabase v3.0 Documentation:** See root folder `README.md` and `DEPLOYMENT.md`
- **Rollback Instructions:** See "Option 1" above

---

**Archive created:** December 2025
**Archived by:** [Claude Code](https://claude.com/claude-code) 🤖
