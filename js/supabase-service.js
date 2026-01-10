/**
 * Supabase Service
 * Version: 3.0 (Supabase Edition)
 *
 * This service provides all database and storage operations for the MLFF Equipment Tracking app.
 * It abstracts Supabase PostgreSQL and Storage operations into simple async functions.
 *
 * This service mirrors the Firebase Service API (firebase-service.js) to minimize changes in app.js.
 *
 * Key differences from Firebase:
 * - Firestore → PostgreSQL (SQL queries instead of NoSQL)
 * - Firebase Storage → Supabase Storage (similar API)
 * - Firestore subcollections → Foreign key relationships
 * - Auto-generated IDs → UUID primary keys
 */

const SupabaseService = {
    // ===== LOCATIONS =====

    /**
     * Get all locations from PostgreSQL
     * @returns {Promise<Array>} Array of location objects
     */
    async getLocations() {
        try {
            const { data, error } = await supabase
                .from('locations')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            console.log(`✅ Fetched ${data?.length || 0} locations`);
            return data || [];
        } catch (error) {
            console.error('❌ Error getting locations:', error);
            throw error;
        }
    },

    /**
     * Get a single location by ID
     * @param {string} id - Location UUID
     * @returns {Promise<Object>} Location object
     */
    async getLocation(id) {
        try {
            const { data, error } = await supabase
                .from('locations')
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw error;
            if (!data) throw new Error('Location not found');

            console.log('✅ Fetched location:', id);
            return data;
        } catch (error) {
            console.error('❌ Error getting location:', error);
            throw error;
        }
    },

    /**
     * Create a new location
     * @param {Object} data - Location data (name, latitude, longitude, address, description, photo_url)
     * @returns {Promise<string>} New location UUID
     */
    async createLocation(data) {
        try {
            const { data: newLocation, error } = await supabase
                .from('locations')
                .insert([{
                    name: data.name,
                    latitude: parseFloat(data.latitude),
                    longitude: parseFloat(data.longitude),
                    address: data.address || null,
                    description: data.description || null,
                    photo_url: data.photoURL || data.photo_url || null
                }])
                .select()
                .single();

            if (error) throw error;

            console.log('✅ Location created with ID:', newLocation.id);
            return newLocation.id;
        } catch (error) {
            console.error('❌ Error creating location:', error);
            throw error;
        }
    },

    /**
     * Update an existing location
     * @param {string} id - Location UUID
     * @param {Object} data - Updated location data
     */
    async updateLocation(id, data) {
        try {
            // Build update object (exclude undefined values)
            const updateData = {};
            if (data.name !== undefined) updateData.name = data.name;
            if (data.latitude !== undefined) updateData.latitude = parseFloat(data.latitude);
            if (data.longitude !== undefined) updateData.longitude = parseFloat(data.longitude);
            if (data.address !== undefined) updateData.address = data.address;
            if (data.description !== undefined) updateData.description = data.description;
            if (data.photoURL !== undefined || data.photo_url !== undefined) {
                updateData.photo_url = data.photoURL || data.photo_url;
            }

            const { error } = await supabase
                .from('locations')
                .update(updateData)
                .eq('id', id);

            if (error) throw error;

            console.log('✅ Location updated:', id);
        } catch (error) {
            console.error('❌ Error updating location:', error);
            throw error;
        }
    },

    /**
     * Add a new location (alias for createLocation for compatibility)
     * @param {Object} data - Location data
     * @returns {Promise<string>} New location UUID
     */
    async addLocation(data) {
        return await this.createLocation(data);
    },

    /**
     * Delete a location (CASCADE deletes all equipment)
     * @param {string} id - Location UUID
     */
    async deleteLocation(id) {
        try {
            // PostgreSQL CASCADE DELETE handles equipment automatically
            const { error } = await supabase
                .from('locations')
                .delete()
                .eq('id', id);

            if (error) throw error;

            console.log('✅ Location deleted:', id);
        } catch (error) {
            console.error('❌ Error deleting location:', error);
            throw error;
        }
    },

    // ===== EQUIPMENT =====

    /**
     * Get all equipment for a specific location
     * @param {string} locationId - Location UUID
     * @returns {Promise<Array>} Array of equipment objects
     */
    async getEquipment(locationId) {
        try {
            const { data, error } = await supabase
                .from('equipment')
                .select('*')
                .eq('location_id', locationId)
                .order('created_at', { ascending: false });

            if (error) throw error;

            console.log(`✅ Fetched ${data?.length || 0} equipment for location ${locationId}`);
            return data || [];
        } catch (error) {
            console.error('❌ Error getting equipment:', error);
            throw error;
        }
    },

    /**
     * Get all equipment (across all locations)
     * @returns {Promise<Array>} Array of equipment objects
     */
    async getAllEquipment() {
        try {
            const { data, error } = await supabase
                .from('equipment')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            console.log(`✅ Fetched ${data?.length || 0} total equipment`);
            return data || [];
        } catch (error) {
            console.error('❌ Error getting all equipment:', error);
            throw error;
        }
    },

    /**
     * Get a single equipment by ID
     * @param {string} id - Equipment UUID
     * @returns {Promise<Object>} Equipment object
     */
    async getEquipmentById(id) {
        try {
            const { data, error } = await supabase
                .from('equipment')
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw error;
            if (!data) throw new Error('Equipment not found');

            console.log('✅ Fetched equipment:', id);
            return data;
        } catch (error) {
            console.error('❌ Error getting equipment by ID:', error);
            throw error;
        }
    },

    /**
     * Create new equipment
     * @param {Object} data - Equipment data
     * @returns {Promise<string>} New equipment UUID
     */
    async createEquipment(data) {
        try {
            const { data: newEquipment, error } = await supabase
                .from('equipment')
                .insert([{
                    location_id: data.locationId,
                    inventory_number: data.inventoryNumber,
                    type: data.type,
                    status: data.status || 'Aktivna',
                    sub_location: data.subLocation || null,
                    manufacturer: data.manufacturer || null,
                    model: data.model || null,
                    serial_number: data.serialNumber || null,
                    ip_address: data.ipAddress || null,
                    mac_address: data.macAddress || null,
                    x_coord: parseInt(data.xCoord) || 0,
                    y_coord: parseInt(data.yCoord) || 0,
                    z_coord: parseInt(data.zCoord) || 0,
                    installation_date: data.installationDate || null,
                    installer_name: data.installerName || null,
                    tester_name: data.testerName || null,
                    warranty_expiry: data.warrantyExpiry || null,
                    photo_url: data.photoURL || data.photo_url || null,
                    notes: data.notes || null
                }])
                .select()
                .single();

            if (error) throw error;

            console.log('✅ Equipment created with ID:', newEquipment.id);

            // Add audit log entry
            await this.addAuditLog(newEquipment.id, 'Kreirana oprema', `Inventarski broj: ${data.inventoryNumber}`);

            return newEquipment.id;
        } catch (error) {
            console.error('❌ Error creating equipment:', error);
            throw error;
        }
    },

    /**
     * Add new equipment (alias for createEquipment for compatibility)
     * @param {Object} data - Equipment data
     * @returns {Promise<string>} New equipment UUID
     */
    async addEquipment(data) {
        return await this.createEquipment(data);
    },

    /**
     * Update existing equipment
     * @param {string} id - Equipment UUID
     * @param {Object} data - Updated equipment data
     */
    async updateEquipment(id, data) {
        try {
            // Build update object (exclude undefined values)
            const updateData = {};
            if (data.locationId !== undefined) updateData.location_id = data.locationId;
            if (data.inventoryNumber !== undefined) updateData.inventory_number = data.inventoryNumber;
            if (data.type !== undefined) updateData.type = data.type;
            if (data.status !== undefined) updateData.status = data.status;
            if (data.subLocation !== undefined) updateData.sub_location = data.subLocation;
            if (data.manufacturer !== undefined) updateData.manufacturer = data.manufacturer;
            if (data.model !== undefined) updateData.model = data.model;
            if (data.serialNumber !== undefined) updateData.serial_number = data.serialNumber;
            if (data.ipAddress !== undefined) updateData.ip_address = data.ipAddress;
            if (data.macAddress !== undefined) updateData.mac_address = data.macAddress;
            if (data.xCoord !== undefined) updateData.x_coord = parseInt(data.xCoord);
            if (data.yCoord !== undefined) updateData.y_coord = parseInt(data.yCoord);
            if (data.zCoord !== undefined) updateData.z_coord = parseInt(data.zCoord);
            if (data.installationDate !== undefined) updateData.installation_date = data.installationDate;
            if (data.installerName !== undefined) updateData.installer_name = data.installerName;
            if (data.testerName !== undefined) updateData.tester_name = data.testerName;
            if (data.warrantyExpiry !== undefined) updateData.warranty_expiry = data.warrantyExpiry;
            if (data.photoURL !== undefined || data.photo_url !== undefined) {
                updateData.photo_url = data.photoURL || data.photo_url;
            }
            if (data.notes !== undefined) updateData.notes = data.notes;

            const { error } = await supabase
                .from('equipment')
                .update(updateData)
                .eq('id', id);

            if (error) throw error;

            console.log('✅ Equipment updated:', id);

            // Add audit log entry
            await this.addAuditLog(id, 'Ažurirana oprema', 'Izmenjeni podaci opreme');
        } catch (error) {
            console.error('❌ Error updating equipment:', error);
            throw error;
        }
    },

    /**
     * Delete equipment (CASCADE deletes documents, maintenance, audit logs)
     * @param {string} id - Equipment UUID
     */
    async deleteEquipment(id) {
        try {
            // PostgreSQL CASCADE DELETE handles related records automatically
            const { error } = await supabase
                .from('equipment')
                .delete()
                .eq('id', id);

            if (error) throw error;

            console.log('✅ Equipment deleted:', id);
        } catch (error) {
            console.error('❌ Error deleting equipment:', error);
            throw error;
        }
    },

    // ===== DOCUMENTS =====

    /**
     * Get all documents for equipment
     * @param {string} equipmentId - Equipment UUID
     * @returns {Promise<Array>} Array of document objects
     */
    async getDocuments(equipmentId) {
        try {
            const { data, error } = await supabase
                .from('documents')
                .select('*')
                .eq('equipment_id', equipmentId)
                .order('uploaded_at', { ascending: false });

            if (error) throw error;

            console.log(`✅ Fetched ${data?.length || 0} documents for equipment ${equipmentId}`);
            return data || [];
        } catch (error) {
            console.error('❌ Error getting documents:', error);
            throw error;
        }
    },

    /**
     * Upload a document (PDF) to Supabase Storage
     * @param {string} equipmentId - Equipment UUID
     * @param {File} file - File object to upload
     * @param {Function} onProgress - Progress callback (optional)
     * @returns {Promise<string>} Document UUID
     */
    async uploadDocument(equipmentId, file, onProgress) {
        try {
            const timestamp = Date.now();
            const filename = `${timestamp}_${file.name}`;
            const storagePath = `${equipmentId}/${filename}`;

            console.log('📤 Uploading document:', filename);

            // Upload to Supabase Storage
            const { error: uploadError } = await supabase.storage
                .from('equipment-documents')
                .upload(storagePath, file, {
                    cacheControl: '3600',
                    upsert: false
                });

            if (uploadError) throw uploadError;

            // Get public URL
            const { data: urlData } = supabase.storage
                .from('equipment-documents')
                .getPublicUrl(storagePath);

            // Save metadata to PostgreSQL
            const { data: docData, error: dbError } = await supabase
                .from('documents')
                .insert([{
                    equipment_id: equipmentId,
                    name: file.name,
                    file_url: urlData.publicUrl,
                    storage_path: storagePath,
                    file_type: file.type,
                    file_size: file.size
                }])
                .select()
                .single();

            if (dbError) throw dbError;

            console.log('✅ Document uploaded:', docData.id);

            // Add audit log entry
            await this.addAuditLog(equipmentId, 'Dodat dokument', `Fajl: ${file.name}`);

            if (onProgress) onProgress(100);

            return docData.id;
        } catch (error) {
            console.error('❌ Error uploading document:', error);
            throw error;
        }
    },

    /**
     * Delete a document from both Storage and PostgreSQL
     * @param {string} equipmentId - Equipment UUID
     * @param {string} docId - Document UUID
     * @param {string} storagePath - Storage path (e.g., "equipment_id/timestamp_file.pdf")
     */
    async deleteDocument(equipmentId, docId, storagePath) {
        try {
            // Delete from Storage
            if (storagePath) {
                const { error: storageError } = await supabase.storage
                    .from('equipment-documents')
                    .remove([storagePath]);

                if (storageError) {
                    console.warn('⚠️ Storage delete failed (file may not exist):', storageError);
                }
            }

            // Delete from PostgreSQL
            const { error: dbError } = await supabase
                .from('documents')
                .delete()
                .eq('id', docId);

            if (dbError) throw dbError;

            console.log('✅ Document deleted:', docId);

            // Add audit log entry
            await this.addAuditLog(equipmentId, 'Obrisan dokument', `Document ID: ${docId}`);
        } catch (error) {
            console.error('❌ Error deleting document:', error);
            throw error;
        }
    },

    // ===== PHOTOS =====

    /**
     * Upload a photo to Supabase Storage
     * @param {string} entityType - 'location' or 'equipment'
     * @param {string} entityId - Location or Equipment UUID
     * @param {File} file - Image file to upload
     * @returns {Promise<string>} Public URL of uploaded photo
     */
    async uploadPhoto(entityType, entityId, file) {
        try {
            const timestamp = Date.now();
            const extension = file.name.split('.').pop();
            const filename = `${timestamp}_photo.${extension}`;
            const bucket = entityType === 'location' ? 'location-photos' : 'equipment-photos';
            const storagePath = `${entityId}/${filename}`;

            console.log('📸 Uploading photo to', bucket + ':', filename);

            // Upload to Supabase Storage
            const { error: uploadError } = await supabase.storage
                .from(bucket)
                .upload(storagePath, file, {
                    cacheControl: '3600',
                    upsert: false
                });

            if (uploadError) throw uploadError;

            // Get public URL
            const { data: urlData } = supabase.storage
                .from(bucket)
                .getPublicUrl(storagePath);

            console.log('✅ Photo uploaded:', urlData.publicUrl);

            return urlData.publicUrl;
        } catch (error) {
            console.error('❌ Error uploading photo:', error);
            throw error;
        }
    },

    /**
     * Delete a photo from Supabase Storage
     * @param {string} photoURL - Full public URL of the photo
     */
    async deletePhoto(photoURL) {
        try {
            if (!photoURL || !photoURL.includes('supabase')) {
                console.warn('⚠️ Not a Supabase Storage URL, skipping delete');
                return;
            }

            // Parse bucket and path from URL
            // URL format: https://{project}.supabase.co/storage/v1/object/public/{bucket}/{path}
            const url = new URL(photoURL);
            const pathParts = url.pathname.split('/');
            const publicIndex = pathParts.indexOf('public');

            if (publicIndex === -1) {
                console.warn('⚠️ Could not parse storage URL');
                return;
            }

            const bucket = pathParts[publicIndex + 1];
            const storagePath = pathParts.slice(publicIndex + 2).join('/');

            console.log('🗑️ Deleting photo from', bucket + ':', storagePath);

            // Delete from Storage
            const { error } = await supabase.storage
                .from(bucket)
                .remove([storagePath]);

            if (error) {
                console.warn('⚠️ Storage delete failed (file may not exist):', error);
                return;
            }

            console.log('✅ Photo deleted:', storagePath);
        } catch (error) {
            console.error('❌ Error deleting photo:', error);
            // Don't throw - photo might already be deleted
        }
    },

    // ===== MAINTENANCE =====

    /**
     * Get maintenance history for equipment
     * @param {string} equipmentId - Equipment UUID
     * @returns {Promise<Array>} Array of maintenance records
     */
    async getMaintenanceHistory(equipmentId) {
        try {
            const { data, error } = await supabase
                .from('maintenance')
                .select('*')
                .eq('equipment_id', equipmentId)
                .order('date', { ascending: false });

            if (error) throw error;

            console.log(`✅ Fetched ${data?.length || 0} maintenance records for equipment ${equipmentId}`);
            return data || [];
        } catch (error) {
            console.error('❌ Error getting maintenance history:', error);
            throw error;
        }
    },

    /**
     * Add a maintenance record
     * @param {string} equipmentId - Equipment UUID
     * @param {Object} data - Maintenance data
     * @returns {Promise<string>} Maintenance record UUID
     */
    async addMaintenance(equipmentId, data) {
        try {
            const { data: maintenanceData, error } = await supabase
                .from('maintenance')
                .insert([{
                    equipment_id: equipmentId,
                    type: data.type,
                    date: data.date,
                    description: data.description || null,
                    performed_by: data.performedBy || null,
                    cost: data.cost ? parseFloat(data.cost) : null,
                    next_service_date: data.nextServiceDate || null
                }])
                .select()
                .single();

            if (error) throw error;

            console.log('✅ Maintenance record added:', maintenanceData.id);

            // Add audit log entry
            await this.addAuditLog(equipmentId, 'Dodat servis', `Tip: ${data.type}, Datum: ${data.date}`);

            return maintenanceData.id;
        } catch (error) {
            console.error('❌ Error adding maintenance:', error);
            throw error;
        }
    },

    // ===== AUDIT LOG =====

    /**
     * Get audit log for equipment
     * @param {string} equipmentId - Equipment UUID
     * @returns {Promise<Array>} Array of audit log entries
     */
    async getAuditLog(equipmentId) {
        try {
            const { data, error } = await supabase
                .from('audit_log')
                .select('*')
                .eq('equipment_id', equipmentId)
                .order('timestamp', { ascending: false });

            if (error) throw error;

            console.log(`✅ Fetched ${data?.length || 0} audit log entries for equipment ${equipmentId}`);
            return data || [];
        } catch (error) {
            console.error('❌ Error getting audit log:', error);
            throw error;
        }
    },

    /**
     * Add an audit log entry
     * @param {string} equipmentId - Equipment UUID
     * @param {string} action - Action description
     * @param {string} details - Action details (optional)
     * @returns {Promise<string>} Audit log entry UUID
     */
    async addAuditLog(equipmentId, action, details) {
        try {
            // Get current user (if authenticated)
            const { data: { user } } = await supabase.auth.getUser();

            const { data: logData, error } = await supabase
                .from('audit_log')
                .insert([{
                    equipment_id: equipmentId,
                    action: action,
                    details: details || null,
                    user_id: user?.id || null,
                    user_email: user?.email || null
                }])
                .select()
                .single();

            if (error) throw error;

            console.log('✅ Audit log entry added:', logData.id);

            return logData.id;
        } catch (error) {
            console.error('❌ Error adding audit log:', error);
            // Don't throw - audit logging is not critical
            return null;
        }
    },

    // ===== CUSTOM TYPES =====

    /**
     * Get all custom equipment types
     * @returns {Promise<Array>} Array of custom type objects
     */
    async getCustomTypes() {
        try {
            const { data, error } = await supabase
                .from('custom_types')
                .select('*')
                .order('created_at', { ascending: true});

            if (error) throw error;

            console.log(`✅ Fetched ${data?.length || 0} custom types`);
            return data || [];
        } catch (error) {
            console.error('❌ Error getting custom types:', error);
            throw error;
        }
    },

    /**
     * Add a new custom equipment type
     * @param {string} typeName - Name of the new type
     * @returns {Promise<string>} Custom type UUID
     */
    async addCustomType(typeName) {
        try {
            const { data, error } = await supabase
                .from('custom_types')
                .insert([{
                    type_name: typeName
                }])
                .select()
                .single();

            if (error) {
                // Handle duplicate type name
                if (error.code === '23505') { // PostgreSQL unique constraint violation
                    throw new Error('Ovaj tip opreme već postoji');
                }
                throw error;
            }

            console.log('✅ Custom type added:', data.id);

            return data.id;
        } catch (error) {
            console.error('❌ Error adding custom type:', error);
            throw error;
        }
    },

    // ===== UTILITY FUNCTIONS =====

    /**
     * Check if Supabase service is ready
     * @returns {boolean} True if Supabase client is initialized
     */
    isReady() {
        return typeof supabase !== 'undefined' && supabase !== null;
    },

    /**
     * Get current authenticated user
     * @returns {Promise<Object|null>} User object or null
     */
    async getCurrentUser() {
        try {
            const { data: { user }, error } = await supabase.auth.getUser();

            if (error) throw error;

            return user;
        } catch (error) {
            console.error('❌ Error getting current user:', error);
            return null;
        }
    },

    /**
     * Test database connection
     * @returns {Promise<boolean>} True if connection successful
     */
    async testConnection() {
        try {
            const { data, error } = await supabase
                .from('locations')
                .select('count')
                .limit(1);

            if (error) throw error;

            console.log('✅ Database connection successful');
            return true;
        } catch (error) {
            console.error('❌ Database connection failed:', error);
            return false;
        }
    }
};

// Make service available globally
window.SupabaseService = SupabaseService;

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { SupabaseService };
}

console.log('✅ SupabaseService loaded with 22 functions');
