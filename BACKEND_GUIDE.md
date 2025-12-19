# Backend Technical Guide - MLFF Equipment Tracking v3.0

Complete technical documentation for the Supabase PostgreSQL backend.

## Database Schema Overview

### Tables (6 total)
- **locations** - Physical installation sites
- **equipment** - Equipment inventory
- **documents** - PDF attachments
- **maintenance** - Service history
- **audit_log** - Change tracking
- **custom_types** - User-defined categories

### Relationships
```
locations (1) ──< equipment (M)
equipment (1) ──< documents (M)
equipment (1) ──< maintenance (M)
equipment (1) ──< audit_log (M)
```

## API Reference (SupabaseService)

### Locations API
```javascript
await SupabaseService.getLocations()           // → Array<Location>
await SupabaseService.getLocation(id)          // → Location
await SupabaseService.createLocation(data)     // → UUID
await SupabaseService.updateLocation(id, data) // → void
await SupabaseService.deleteLocation(id)       // → void (CASCADE)
```

### Equipment API
```javascript
await SupabaseService.getEquipment(locationId)   // → Array<Equipment>
await SupabaseService.getAllEquipment()          // → Array<Equipment>
await SupabaseService.getEquipmentById(id)       // → Equipment
await SupabaseService.createEquipment(data)      // → UUID
await SupabaseService.updateEquipment(id, data)  // → void
await SupabaseService.deleteEquipment(id)        // → void (CASCADE)
```

### Documents API
```javascript
await SupabaseService.getDocuments(equipmentId)              // → Array<Document>
await SupabaseService.uploadDocument(equipmentId, file, cb)  // → UUID
await SupabaseService.deleteDocument(eqId, docId, path)      // → void
```

### Photos API
```javascript
await SupabaseService.uploadPhoto(type, id, file)  // → URL
await SupabaseService.deletePhoto(photoURL)        // → void
```

### Maintenance API
```javascript
await SupabaseService.getMaintenanceHistory(equipmentId)  // → Array<Maintenance>
await SupabaseService.addMaintenance(equipmentId, data)   // → UUID
```

## Security (RLS Policies)

**Pattern: Public READ + Authenticated WRITE**

```sql
-- All tables have same pattern:
CREATE POLICY "public_read" ON {table}
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "authenticated_write" ON {table}
  FOR INSERT/UPDATE/DELETE TO authenticated USING (true);
```

## Storage Buckets

- **location-photos** (public, 50MB, images only)
- **equipment-photos** (public, 50MB, images only)
- **equipment-documents** (public, 50MB, PDFs + images)

**Path structure:** `{bucket}/{entity_id}/{timestamp}_{filename}`

## Performance Indexes

- 45+ indexes for fast queries
- Full-text search (GIN indexes)
- Composite indexes (multi-column)
- Partial indexes (filtered subsets)

**Query Performance:**
- Equipment by location: < 10ms
- Text search: < 50ms
- Dashboard stats: < 20ms

## Monitoring

**Supabase Dashboard:**
- Settings → Usage (database, storage, bandwidth)
- Database → Tables (browse data)
- Storage → Files (browse uploads)
- Authentication → Users (manage access)

**Free Tier Limits:**
- Database: 500 MB
- Storage: 1 GB
- Bandwidth: 2 GB/month

---
**For detailed schema, see SQL files in `supabase/migrations/`**
