# Backend Technical Guide - MLFF Equipment Tracking v5.0

Tehnička dokumentacija za Supabase PostgreSQL backend.

---

## Database Schema

### Tabele (6)

| Tabela | Opis | Ključne Kolone |
|--------|------|----------------|
| `locations` | Fizičke lokacije (portali) | id, name, latitude, longitude, address, photo_url |
| `equipment` | Inventar opreme | id, location_id, inventory_number, type, status, sub_location |
| `documents` | PDF dokumentacija | id, equipment_id, name, file_url, storage_path |
| `maintenance` | Servisna istorija | id, equipment_id, type, date, cost, next_service_date |
| `audit_log` | Evidencija promena | id, equipment_id, action, old_value, new_value |
| `custom_types` | Korisnički tipovi opreme | id, type_name |

### Relationships

```
locations (1) ──< equipment (M)
equipment (1) ──< documents (M)
equipment (1) ──< maintenance (M)
equipment (1) ──< audit_log (M)
```

### Equipment Status Values

```sql
CHECK (status IN ('Aktivna', 'Na servisu', 'Neispravna', 'Neaktivna', 'Povučena'))
```

---

## API Reference (SupabaseService)

### Locations

```javascript
// Get all locations with equipment
await SupabaseService.getLocations()  // → Array<Location>

// Get single location
await SupabaseService.getLocation(id)  // → Location

// Create location
await SupabaseService.createLocation({
    name: 'Portal XYZ',
    latitude: 44.8125,
    longitude: 20.4612,
    address: 'Adresa...',
    photo_url: 'https://...'
})  // → UUID

// Update location
await SupabaseService.updateLocation(id, data)  // → void

// Delete location (CASCADE - briše svu opremu)
await SupabaseService.deleteLocation(id)  // → void
```

### Equipment

```javascript
// Get equipment for location
await SupabaseService.getEquipment(locationId)  // → Array<Equipment>

// Get all equipment
await SupabaseService.getAllEquipment()  // → Array<Equipment>

// Get single equipment
await SupabaseService.getEquipmentById(id)  // → Equipment

// Create equipment
await SupabaseService.createEquipment({
    location_id: 'uuid',
    inventory_number: 'VDX-001',
    type: 'VDX',
    status: 'Aktivna',
    sub_location: 'Gentri',
    manufacturer: 'Siemens',
    model: 'VDX-2000',
    serial_number: 'SN123456',
    ip_address: '192.168.1.100',
    mac_address: 'AA:BB:CC:DD:EE:FF',
    installation_date: '2024-01-15',
    warranty_expiry: '2026-01-15',
    photo_url: 'https://...',
    notes: 'Napomene...'
})  // → UUID

// Update equipment
await SupabaseService.updateEquipment(id, data)  // → void

// Delete equipment (CASCADE - briše dokumente i maintenance)
await SupabaseService.deleteEquipment(id)  // → void
```

### Documents

```javascript
// Get documents for equipment
await SupabaseService.getDocuments(equipmentId)  // → Array<Document>

// Upload document
await SupabaseService.uploadDocument(equipmentId, file, progressCallback)  // → UUID

// Delete document
await SupabaseService.deleteDocument(equipmentId, documentId, storagePath)  // → void
```

### Photos

```javascript
// Upload photo (location or equipment)
await SupabaseService.uploadPhoto('location' | 'equipment', entityId, file)  // → URL

// Delete photo
await SupabaseService.deletePhoto(photoURL)  // → void
```

### Maintenance

```javascript
// Get maintenance history
await SupabaseService.getMaintenanceHistory(equipmentId)  // → Array<Maintenance>

// Add maintenance record
await SupabaseService.addMaintenance(equipmentId, {
    type: 'Preventivni',  // Preventivni, Korektivni, Inspekcija, Zamena dela, Kalibracija
    date: '2024-06-15',
    description: 'Opis radova...',
    performed_by: 'Ime Servisera',
    cost: 150.00,
    next_service_date: '2024-12-15'
})  // → UUID
```

### Audit Log

```javascript
// Get audit log for equipment
await SupabaseService.getAuditLog(equipmentId)  // → Array<AuditEntry>

// Log entry (automatski se kreira)
// Struktura: { action, details, old_value, new_value, field_name, user_email, timestamp }
```

---

## Security (RLS Policies)

### Pattern: Public READ + Authenticated WRITE

```sql
-- Sve tabele imaju isti pattern:

-- Javni pristup za čitanje (QR kodovi rade bez login-a)
CREATE POLICY "public_read" ON {table}
    FOR SELECT TO anon, authenticated USING (true);

-- Samo autentifikovani korisnici mogu pisati
CREATE POLICY "authenticated_insert" ON {table}
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "authenticated_update" ON {table}
    FOR UPDATE TO authenticated USING (true);

CREATE POLICY "authenticated_delete" ON {table}
    FOR DELETE TO authenticated USING (true);
```

### Storage Policies

```sql
-- Svi bucket-i su PUBLIC za čitanje
-- Upload/Delete zahteva autentifikaciju (ili anon u nekim slučajevima)
```

---

## Storage Buckets

| Bucket | Namena | Max Size | MIME Types |
|--------|--------|----------|------------|
| `location-photos` | Fotografije lokacija | 50 MB | image/* |
| `equipment-photos` | Fotografije opreme | 50 MB | image/* |
| `equipment-documents` | PDF dokumentacija | 50 MB | application/pdf, image/* |

### Path Structure

```
{bucket}/{entity_id}/{timestamp}_{filename}

Primeri:
- location-photos/abc123/1704067200000_portal.jpg
- equipment-documents/xyz789/1704067200000_manual.pdf
```

---

## Performance Indexes

### Kreirana u 003_indexes.sql

- **Primary Keys** - UUID za sve tabele
- **Foreign Keys** - location_id, equipment_id sa CASCADE
- **Unique Constraints** - inventory_number
- **Search Indexes** - GIN indeksi za full-text pretragu
- **Composite Indexes** - Za česte kombinacije filtera

### Query Performance

| Operacija | Target |
|-----------|--------|
| Equipment by location | < 10ms |
| Text search | < 50ms |
| Dashboard stats | < 20ms |
| Analytics aggregation | < 100ms |

---

## PostgreSQL Functions

### get_upcoming_maintenance(days INTEGER)

```sql
-- Vraća opremu sa zakazanim servisom u narednih N dana
SELECT * FROM get_upcoming_maintenance(7);
```

### get_warranty_expiring(days INTEGER)

```sql
-- Vraća opremu kojoj ističe garancija u narednih N dana
SELECT * FROM get_warranty_expiring(30);
```

---

## Monitoring

### Supabase Dashboard

- **Settings → Usage** - Database, storage, bandwidth
- **Table Editor** - Browse i edit podataka
- **Storage** - File management
- **Authentication → Users** - User management
- **Logs** - API i database logs

### Free Tier Limits

| Resource | Limit |
|----------|-------|
| Database | 500 MB |
| Storage | 1 GB |
| Bandwidth | 2 GB/month |
| API Requests | Unlimited |

---

## Migration Files

Sve migracije su u `supabase/migrations/` folderu.

Vidi [SUPABASE_SETUP.md](SUPABASE_SETUP.md) za kompletan redosled pokretanja.

---

**Verzija:** 5.0 - Enhanced Analytics Edition
**Poslednje Ažuriranje:** Januar 2026

