# 🔧 Backend Architecture Guide - MLFF Equipment Tracking

**Verzija 2.0** - Tehnička Dokumentacija

Ovaj dokument opisuje backend arhitekturu, Firebase konfiguraciju, database schema, security rules, i deployment procedure.

---

## 📋 Sadržaj

1. [Pregled Arhitekture](#pregled-arhitekture)
2. [Firebase Services](#firebase-services)
3. [Database Schema](#database-schema)
4. [API Reference](#api-reference)
5. [Security Rules](#security-rules)
6. [File Storage Structure](#file-storage-structure)
7. [Authentication](#authentication)
8. [Deployment](#deployment)
9. [Monitoring & Analytics](#monitoring--analytics)
10. [Troubleshooting](#troubleshooting)

---

## Pregled Arhitekture

### Technology Stack

**Frontend:**
- HTML5, CSS3, Vanilla JavaScript
- SPA with hash-based routing
- Firebase SDK (v9 compat mode)

**Backend:**
- Firebase Firestore (NoSQL database)
- Firebase Storage (Cloud file storage)
- Firebase Auth (Google OAuth)
- Firebase Hosting (Static site hosting)

### Architecture Diagram

```
┌──────────────────────────────────────────────┐
│            Client Browser                    │
│  ┌────────────────────────────────────────┐  │
│  │  index.html + SPA                      │  │
│  │  ├── js/app.js (UI logic)              │  │
│  │  ├── js/router.js (routing)            │  │
│  │  ├── js/firebase-service.js (API)      │  │
│  │  └── js/firebase-config.js (config)    │  │
│  └────────────────────────────────────────┘  │
│                    ▼ Firebase SDK             │
└────────────────────┼──────────────────────────┘
                     ▼
┌──────────────────────────────────────────────┐
│           Firebase Platform                  │
│  ┌────────────────────────────────────────┐  │
│  │  Firestore (Database)                  │  │
│  │  Collections:                          │  │
│  │  ├── locations/                        │  │
│  │  ├── equipment/                        │  │
│  │  │   ├── {id}/documents/               │  │
│  │  │   ├── {id}/maintenance/             │  │
│  │  │   └── {id}/auditLog/                │  │
│  │  └── customTypes/                      │  │
│  └────────────────────────────────────────┘  │
│  ┌────────────────────────────────────────┐  │
│  │  Storage (Files)                       │  │
│  │  ├── /locations/{id}/photo/            │  │
│  │  ├── /equipment/{id}/photo/            │  │
│  │  └── /equipment/{id}/documents/        │  │
│  └────────────────────────────────────────┘  │
│  ┌────────────────────────────────────────┐  │
│  │  Auth (Authentication)                 │  │
│  │  └── Google OAuth Provider             │  │
│  └────────────────────────────────────────┘  │
│  ┌────────────────────────────────────────┐  │
│  │  Hosting (Static Site)                 │  │
│  │  └── CDN Distribution                  │  │
│  └────────────────────────────────────────┘  │
└──────────────────────────────────────────────┘
```

---

## Firebase Services

### 1. Firestore Database

**Type:** NoSQL Document Database
**Purpose:** Store all metadata (locations, equipment, documents metadata)

**Features:**
- Real-time synchronization
- Offline persistence (optional)
- Automatic indexing
- Querying and filtering
- Subcollections for hierarchical data

**Limits (Free Tier):**
- Storage: 1 GB
- Reads: 50,000/day
- Writes: 20,000/day
- Deletes: 20,000/day

### 2. Firebase Storage

**Type:** Cloud Object Storage
**Purpose:** Store files (images, PDFs)

**Features:**
- Scalable storage
- CDN delivery
- Resumable uploads
- File metadata

**Limits (Free Tier):**
- Storage: 5 GB
- Bandwidth: 1 GB/day
- Uploads: 20,000/day

### 3. Firebase Auth

**Type:** Authentication Service
**Purpose:** User authentication and authorization

**Features:**
- Google OAuth login
- User management
- Session handling
- Token-based auth

**Limits (Free Tier):**
- Unlimited users
- Email/password: Free
- Phone auth: Limited

### 4. Firebase Hosting

**Type:** Static Site Hosting
**Purpose:** Host the SPA application

**Features:**
- Global CDN
- SSL certificate (auto)
- Custom domains
- Atomic deploys

**Limits (Free Tier):**
- Storage: 10 GB
- Bandwidth: 360 MB/day

---

## Database Schema

### Collections Overview

```
firestore/
├── locations/              (Root collection)
│   └── {locationId}        (Document)
│
├── equipment/              (Root collection)
│   └── {equipmentId}       (Document)
│       ├── documents/      (Subcollection)
│       │   └── {docId}
│       ├── maintenance/    (Subcollection)
│       │   └── {maintId}
│       └── auditLog/       (Subcollection)
│           └── {logId}
│
└── customTypes/            (Root collection)
    └── {typeId}            (Document)
```

### 1. locations/ Collection

```javascript
{
  id: "auto-generated",       // Document ID
  name: "Portal Beograd-Niš KM 12",  // string
  latitude: 44.8125,          // number
  longitude: 20.4612,         // number
  description: "...",         // string
  photoURL: "https://...",    // string (Firebase Storage URL)
  createdAt: Timestamp,       // Firestore Timestamp
  updatedAt: Timestamp        // Firestore Timestamp
}
```

**Indexes:**
- `createdAt` DESC (auto)

### 2. equipment/ Collection

```javascript
{
  id: "auto-generated",       // Document ID
  locationId: "loc_id",       // string (reference to location)
  inventoryNumber: "VDX-001", // string
  type: "VDX",                // string
  status: "Aktivna",          // string (Aktivna | Na servisu | Neispravna | Povučena)
  ipAddress: "192.168.1.10",  // string
  macAddress: "00:1B:44:...", // string
  xCoord: 150,                // number (cm)
  yCoord: 200,                // number (cm)
  zCoord: 300,                // number (cm)
  installDate: Timestamp,     // Firestore Timestamp
  warrantyExpiry: Timestamp,  // Firestore Timestamp
  installerName: "...",       // string
  testerName: "...",          // string
  photoURL: "https://...",    // string (Firebase Storage URL)
  notes: "...",               // string
  createdAt: Timestamp,       // Firestore Timestamp
  updatedAt: Timestamp        // Firestore Timestamp
}
```

**Indexes:**
- `locationId` ASC, `createdAt` DESC (composite)
- `createdAt` DESC (auto)

### 3. equipment/{id}/documents/ Subcollection

```javascript
{
  id: "auto-generated",       // Document ID
  name: "manual.pdf",         // string
  url: "https://...",         // string (Firebase Storage URL)
  storagePath: "equipment/...", // string (Storage path for deletion)
  type: "application/pdf",    // string (MIME type)
  size: 1024000,              // number (bytes)
  uploadedAt: Timestamp       // Firestore Timestamp
}
```

### 4. equipment/{id}/maintenance/ Subcollection

```javascript
{
  id: "auto-generated",       // Document ID
  type: "Preventivni",        // string (Preventivni | Korektivni | Inspekcija | Zamena dela | Kalibracija)
  date: Timestamp,            // Firestore Timestamp
  servicerName: "...",        // string
  description: "...",         // string
  cost: 5000,                 // number (RSD)
  nextServiceDate: Timestamp, // Firestore Timestamp
  createdAt: Timestamp        // Firestore Timestamp
}
```

**Indexes:**
- `date` DESC

### 5. equipment/{id}/auditLog/ Subcollection

```javascript
{
  id: "auto-generated",       // Document ID
  action: "status_change",    // string (created | updated | status_change | service_added, etc.)
  details: "...",             // string
  timestamp: Timestamp,       // Firestore Timestamp
  userId: "user@example.com"  // string (email or 'anonymous')
}
```

**Indexes:**
- `timestamp` DESC

### 6. customTypes/ Collection

```javascript
{
  id: "auto-generated",       // Document ID
  name: "Custom Type Name",   // string
  createdAt: Timestamp        // Firestore Timestamp
}
```

---

## API Reference

### FirebaseService API

All database operations are abstracted in `js/firebase-service.js`.

#### Locations

```javascript
// Get all locations
await FirebaseService.getLocations()
// Returns: Array<Location>

// Get single location
await FirebaseService.getLocation(id)
// Returns: Location

// Create location
await FirebaseService.createLocation(data)
// Returns: string (locationId)

// Update location
await FirebaseService.updateLocation(id, data)
// Returns: void

// Delete location
await FirebaseService.deleteLocation(id)
// Returns: void (also deletes all equipment)
```

#### Equipment

```javascript
// Get equipment for location
await FirebaseService.getEquipment(locationId)
// Returns: Array<Equipment>

// Get all equipment
await FirebaseService.getAllEquipment()
// Returns: Array<Equipment>

// Get single equipment
await FirebaseService.getEquipmentById(id)
// Returns: Equipment

// Create equipment
await FirebaseService.createEquipment(data)
// Returns: string (equipmentId)

// Update equipment
await FirebaseService.updateEquipment(id, data)
// Returns: void

// Delete equipment
await FirebaseService.deleteEquipment(id)
// Returns: void (also deletes subcollections)
```

#### Documents

```javascript
// Get documents for equipment
await FirebaseService.getDocuments(equipmentId)
// Returns: Array<Document>

// Upload document
await FirebaseService.uploadDocument(equipmentId, file, onProgress)
// file: File object
// onProgress: (progress: number) => void
// Returns: string (documentId)

// Delete document
await FirebaseService.deleteDocument(equipmentId, docId, storagePath)
// Returns: void
```

#### Photos

```javascript
// Upload photo
await FirebaseService.uploadPhoto(entityType, entityId, file)
// entityType: 'location' | 'equipment'
// Returns: string (downloadURL)

// Delete photo
await FirebaseService.deletePhoto(photoURL)
// Returns: void
```

#### Maintenance

```javascript
// Get maintenance history
await FirebaseService.getMaintenanceHistory(equipmentId)
// Returns: Array<Maintenance>

// Add maintenance record
await FirebaseService.addMaintenance(equipmentId, data)
// Returns: string (maintenanceId)
```

#### Audit Log

```javascript
// Get audit log
await FirebaseService.getAuditLog(equipmentId)
// Returns: Array<AuditLog>

// Add audit log entry
await FirebaseService.addAuditLog(equipmentId, action, details)
// Returns: void
```

#### Custom Types

```javascript
// Get custom types
await FirebaseService.getCustomTypes()
// Returns: Array<CustomType>

// Add custom type
await FirebaseService.addCustomType(typeName)
// Returns: string (typeId)
```

---

## Security Rules

### Firestore Rules (`firestore.rules`)

**Philosophy:** Public read, authenticated write

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    function isAuthenticated() {
      return request.auth != null;
    }

    // All collections: Public read, Auth write
    match /locations/{locationId} {
      allow read: if true;
      allow write: if isAuthenticated();
    }

    match /equipment/{equipmentId} {
      allow read: if true;
      allow write: if isAuthenticated();

      match /documents/{docId} {
        allow read: if true;
        allow write: if isAuthenticated();
      }

      match /maintenance/{maintId} {
        allow read: if true;
        allow write: if isAuthenticated();
      }

      match /auditLog/{logId} {
        allow read: if true;
        allow write: if isAuthenticated();
      }
    }

    match /customTypes/{typeId} {
      allow read: if true;
      allow write: if isAuthenticated();
    }
  }
}
```

**Key Points:**
- ✅ Anyone can read data (for QR codes)
- 🔐 Only authenticated users can modify data
- 📝 Audit logs track who made changes

### Storage Rules (`storage.rules`)

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {

    function isAuthenticated() {
      return request.auth != null;
    }

    function validFileSize() {
      return request.resource.size <= 50 * 1024 * 1024; // 50MB
    }

    function validFileType() {
      return request.resource.contentType.matches('image/.*') ||
             request.resource.contentType == 'application/pdf';
    }

    // Public read, Auth write, with validation
    match /{allPaths=**} {
      allow read: if true;
      allow write: if isAuthenticated() && validFileSize() && validFileType();
    }
  }
}
```

**Key Points:**
- ✅ Anyone can download files (for QR codes)
- 🔐 Only authenticated users can upload/delete
- 📏 Max file size: 50MB
- 📄 Only images and PDFs allowed

---

## File Storage Structure

```
firebase-storage/
├── locations/
│   └── {locationId}/
│       └── photo/
│           └── {timestamp}_{filename}.jpg
│
└── equipment/
    └── {equipmentId}/
        ├── photo/
        │   └── {timestamp}_{filename}.jpg
        └── documents/
            ├── {timestamp}_{filename1}.pdf
            ├── {timestamp}_{filename2}.pdf
            └── ...
```

**Naming Convention:**
- `{timestamp}_{filename}` - prevents conflicts
- `timestamp` - milliseconds since epoch
- Original filename preserved for user reference

---

## Authentication

### Google OAuth Flow

```
1. User clicks "Login" button
   ↓
2. Firebase Auth popup opens
   ↓
3. User selects Google account
   ↓
4. User grants permissions
   ↓
5. Firebase Auth returns user token
   ↓
6. App stores auth state
   ↓
7. User email displayed in header
   ↓
8. Admin controls become visible
```

### Implementation

```javascript
// Auth state observer
firebase.auth().onAuthStateChanged((user) => {
  if (user) {
    // User signed in
    console.log('User:', user.email);
    // Show admin controls
  } else {
    // User signed out
    // Hide admin controls
  }
});

// Login
async function loginWithGoogle() {
  const provider = new firebase.auth.GoogleAuthProvider();
  await firebase.auth().signInWithPopup(provider);
}

// Logout
async function logout() {
  await firebase.auth().signOut();
}
```

### Authorization

**Public Operations (No Auth Required):**
- Read locations
- Read equipment
- View reports (QR codes)
- Search
- View map

**Protected Operations (Auth Required):**
- Create/Update/Delete locations
- Create/Update/Delete equipment
- Upload/Delete files
- Add maintenance records
- Change status

---

## Deployment

### Prerequisites

```bash
# Install Node.js (v14+)
# Install Firebase CLI
npm install -g firebase-tools
```

### Step-by-Step Deployment

#### 1. Firebase Project Setup

```bash
# Login
firebase login

# Initialize project
cd "path/to/Mlff-evidencina-opreme"
firebase init

# Select services:
# - Firestore
# - Storage
# - Hosting

# Configuration:
# Firestore rules: firestore.rules
# Firestore indexes: firestore.indexes.json
# Storage rules: storage.rules
# Hosting public directory: . (current)
# Single-page app: Yes
# Overwrite index.html: No
```

#### 2. Configure Firebase

Edit `js/firebase-config.js`:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef..."
};
```

#### 3. Deploy

```bash
# Deploy everything
firebase deploy

# Or deploy specific services
firebase deploy --only firestore:rules
firebase deploy --only storage:rules
firebase deploy --only hosting
```

#### 4. Verify Deployment

```bash
# Open deployed site
firebase open hosting:site

# Check logs
firebase functions:log
```

### Environment-Specific Configs

**Local Development:**
```bash
# Use emulators
firebase emulators:start
```

**Staging:**
```bash
# Deploy to staging channel
firebase hosting:channel:deploy staging
```

**Production:**
```bash
# Deploy to default (production)
firebase deploy --only hosting
```

---

## Monitoring & Analytics

### Firebase Console

**Access:** https://console.firebase.google.com

**Metrics to Monitor:**

1. **Firestore Usage:**
   - Document reads/writes/deletes per day
   - Storage size
   - Index usage

2. **Storage Usage:**
   - Total storage size
   - Bandwidth usage
   - File count

3. **Auth:**
   - Active users
   - Sign-in methods
   - Failed login attempts

4. **Hosting:**
   - Request count
   - Bandwidth
   - Cache hit ratio

### Cost Monitoring

```bash
# Check current usage
firebase projects:list

# Check Blaze plan billing
# Go to: Firebase Console > Usage and billing
```

**Free Tier Limits:**
- Firestore: 1GB storage, 50K reads/day
- Storage: 5GB, 1GB/day bandwidth
- If exceeded → automatic upgrade to Blaze (pay-as-you-go)

---

## Troubleshooting

### Common Issues

#### 1. "Permission Denied" in Firestore

**Cause:** Security rules not deployed or misconfigured

**Solution:**
```bash
firebase deploy --only firestore:rules
```

#### 2. "Firebase not initialized"

**Cause:** firebase-config.js not configured

**Solution:**
- Check if `firebase-config.js` has correct credentials
- Verify Firebase SDK loaded before `firebase-config.js`

#### 3. File upload fails

**Cause:** Storage rules, file size, or file type

**Solution:**
- Check browser console for errors
- Verify file size < 50MB
- Verify file type (image or PDF)
- Check storage rules deployed

#### 4. QR code shows 404

**Cause:** Equipment not found or URL incorrect

**Solution:**
- Verify equipment ID in URL
- Check Firestore for equipment document
- Verify router.js handles `/report/equipment/:id` route

### Debug Mode

```javascript
// Enable Firestore debug logging
firebase.firestore.setLogLevel('debug');

// Check auth state
console.log('Current user:', firebase.auth().currentUser);

// Test Firestore connection
db.collection('locations').limit(1).get()
  .then(() => console.log('Firestore connected'))
  .catch(err => console.error('Firestore error:', err));
```

---

## Performance Optimization

### Best Practices

1. **Firestore:**
   - Use `.limit()` on queries
   - Create composite indexes for multi-field queries
   - Avoid deep nesting (max 1-2 levels)

2. **Storage:**
   - Compress images before upload
   - Use progressive JPEGs
   - Set cache headers

3. **Frontend:**
   - Lazy load images
   - Paginate large lists
   - Cache frequently accessed data

4. **Hosting:**
   - Enable gzip compression
   - Set appropriate cache headers
   - Use CDN (automatic with Firebase)

---

**Verzija:** 2.0 - Backend Architecture Edition
**Datum:** Decembar 2025
**© 2025 Orion E-mobility**

🤖 Generated with [Claude Code](https://claude.com/claude-code)
