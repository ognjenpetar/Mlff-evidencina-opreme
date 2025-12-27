/**
 * Firebase Service
 *
 * This service provides all database and storage operations for the MLFF Equipment Tracking app.
 * It abstracts Firestore and Firebase Storage operations into simple async functions.
 */

const FirebaseService = {
    // ===== LOCATIONS =====

    /**
     * Get all locations from Firestore
     * @returns {Promise<Array>} Array of location objects
     */
    async getLocations() {
        try {
            const snapshot = await db.collection('locations').orderBy('createdAt', 'desc').get();
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.error('Error getting locations:', error);
            throw error;
        }
    },

    /**
     * Get a single location by ID
     * @param {string} id - Location ID
     * @returns {Promise<Object>} Location object
     */
    async getLocation(id) {
        try {
            const doc = await db.collection('locations').doc(id).get();
            if (!doc.exists) {
                throw new Error('Location not found');
            }
            return { id: doc.id, ...doc.data() };
        } catch (error) {
            console.error('Error getting location:', error);
            throw error;
        }
    },

    /**
     * Create a new location
     * @param {Object} data - Location data
     * @returns {Promise<string>} New location ID
     */
    async createLocation(data) {
        try {
            const docRef = await db.collection('locations').add({
                ...data,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            console.log('Location created with ID:', docRef.id);
            return docRef.id;
        } catch (error) {
            console.error('Error creating location:', error);
            throw error;
        }
    },

    /**
     * Update an existing location
     * @param {string} id - Location ID
     * @param {Object} data - Updated location data
     */
    async updateLocation(id, data) {
        try {
            await db.collection('locations').doc(id).update({
                ...data,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            console.log('Location updated:', id);
        } catch (error) {
            console.error('Error updating location:', error);
            throw error;
        }
    },

    /**
     * Delete a location
     * @param {string} id - Location ID
     */
    async deleteLocation(id) {
        try {
            // Delete all equipment for this location first
            const equipmentSnapshot = await db.collection('equipment')
                .where('locationId', '==', id)
                .get();

            const batch = db.batch();
            equipmentSnapshot.docs.forEach(doc => {
                batch.delete(doc.ref);
            });
            await batch.commit();

            // Delete the location
            await db.collection('locations').doc(id).delete();
            console.log('Location deleted:', id);
        } catch (error) {
            console.error('Error deleting location:', error);
            throw error;
        }
    },

    // ===== EQUIPMENT =====

    /**
     * Get all equipment for a specific location
     * @param {string} locationId - Location ID
     * @returns {Promise<Array>} Array of equipment objects
     */
    async getEquipment(locationId) {
        try {
            const snapshot = await db.collection('equipment')
                .where('locationId', '==', locationId)
                .orderBy('createdAt', 'desc')
                .get();
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.error('Error getting equipment:', error);
            throw error;
        }
    },

    /**
     * Get all equipment across all locations
     * @returns {Promise<Array>} Array of equipment objects
     */
    async getAllEquipment() {
        try {
            const snapshot = await db.collection('equipment').orderBy('createdAt', 'desc').get();
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.error('Error getting all equipment:', error);
            throw error;
        }
    },

    /**
     * Get a single equipment item by ID
     * @param {string} id - Equipment ID
     * @returns {Promise<Object>} Equipment object
     */
    async getEquipmentById(id) {
        try {
            const doc = await db.collection('equipment').doc(id).get();
            if (!doc.exists) {
                throw new Error('Equipment not found');
            }
            return { id: doc.id, ...doc.data() };
        } catch (error) {
            console.error('Error getting equipment:', error);
            throw error;
        }
    },

    /**
     * Create a new equipment item
     * @param {Object} data - Equipment data
     * @returns {Promise<string>} New equipment ID
     */
    async createEquipment(data) {
        try {
            const docRef = await db.collection('equipment').add({
                ...data,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            console.log('Equipment created with ID:', docRef.id);
            return docRef.id;
        } catch (error) {
            console.error('Error creating equipment:', error);
            throw error;
        }
    },

    /**
     * Update an existing equipment item
     * @param {string} id - Equipment ID
     * @param {Object} data - Updated equipment data
     */
    async updateEquipment(id, data) {
        try {
            await db.collection('equipment').doc(id).update({
                ...data,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            console.log('Equipment updated:', id);
        } catch (error) {
            console.error('Error updating equipment:', error);
            throw error;
        }
    },

    /**
     * Delete an equipment item
     * @param {string} id - Equipment ID
     */
    async deleteEquipment(id) {
        try {
            // Delete all documents subcollection
            const docsSnapshot = await db.collection('equipment').doc(id)
                .collection('documents').get();

            const batch = db.batch();
            docsSnapshot.docs.forEach(doc => {
                batch.delete(doc.ref);
            });
            await batch.commit();

            // Delete the equipment
            await db.collection('equipment').doc(id).delete();
            console.log('Equipment deleted:', id);
        } catch (error) {
            console.error('Error deleting equipment:', error);
            throw error;
        }
    },

    // ===== DOCUMENTS (SUBCOLLECTION) =====

    /**
     * Get all documents for a specific equipment
     * @param {string} equipmentId - Equipment ID
     * @returns {Promise<Array>} Array of document objects
     */
    async getDocuments(equipmentId) {
        try {
            const snapshot = await db.collection('equipment').doc(equipmentId)
                .collection('documents')
                .orderBy('uploadedAt', 'desc')
                .get();
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.error('Error getting documents:', error);
            throw error;
        }
    },

    /**
     * Upload a document to Firebase Storage and save metadata to Firestore
     * @param {string} equipmentId - Equipment ID
     * @param {File} file - File object to upload
     * @param {Function} onProgress - Optional progress callback
     * @returns {Promise<string>} Document ID
     */
    async uploadDocument(equipmentId, file, onProgress) {
        try {
            // Create a unique filename to avoid conflicts
            const timestamp = Date.now();
            const filename = `${timestamp}_${file.name}`;
            const storageRef = storage.ref(`equipment/${equipmentId}/documents/${filename}`);

            // Upload file to Storage
            const uploadTask = storageRef.put(file);

            // Listen to progress if callback provided
            if (onProgress) {
                uploadTask.on('state_changed', (snapshot) => {
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    onProgress(progress);
                });
            }

            // Wait for upload to complete
            await uploadTask;

            // Get download URL
            const downloadURL = await storageRef.getDownloadURL();

            // Save metadata to Firestore
            const docRef = await db.collection('equipment').doc(equipmentId)
                .collection('documents').add({
                    name: file.name,
                    url: downloadURL,
                    storagePath: `equipment/${equipmentId}/documents/${filename}`,
                    type: file.type,
                    size: file.size,
                    uploadedAt: firebase.firestore.FieldValue.serverTimestamp()
                });

            console.log('Document uploaded:', docRef.id);
            return docRef.id;
        } catch (error) {
            console.error('Error uploading document:', error);
            throw error;
        }
    },

    /**
     * Delete a document from both Storage and Firestore
     * @param {string} equipmentId - Equipment ID
     * @param {string} docId - Document ID
     * @param {string} storagePath - Storage path of the file
     */
    async deleteDocument(equipmentId, docId, storagePath) {
        try {
            // Delete from Storage
            const storageRef = storage.ref(storagePath);
            await storageRef.delete();

            // Delete from Firestore
            await db.collection('equipment').doc(equipmentId)
                .collection('documents').doc(docId).delete();

            console.log('Document deleted:', docId);
        } catch (error) {
            console.error('Error deleting document:', error);
            throw error;
        }
    },

    // ===== PHOTOS =====

    /**
     * Upload a photo to Firebase Storage
     * @param {string} entityType - Type of entity ('location' or 'equipment')
     * @param {string} entityId - Entity ID
     * @param {File} file - File object to upload
     * @returns {Promise<string>} Download URL
     */
    async uploadPhoto(entityType, entityId, file) {
        try {
            const timestamp = Date.now();
            const filename = `${timestamp}_${file.name}`;
            const storageRef = storage.ref(`${entityType}/${entityId}/photo/${filename}`);

            await storageRef.put(file);
            const downloadURL = await storageRef.getDownloadURL();

            console.log('Photo uploaded:', downloadURL);
            return downloadURL;
        } catch (error) {
            console.error('Error uploading photo:', error);
            throw error;
        }
    },

    /**
     * Delete a photo from Storage
     * @param {string} photoURL - Full URL of the photo
     */
    async deletePhoto(photoURL) {
        try {
            if (!photoURL || !photoURL.includes('firebasestorage')) {
                return; // Not a Firebase Storage URL
            }
            const storageRef = storage.refFromURL(photoURL);
            await storageRef.delete();
            console.log('Photo deleted:', photoURL);
        } catch (error) {
            console.error('Error deleting photo:', error);
            // Don't throw - photo might already be deleted
        }
    },

    // ===== MAINTENANCE (SUBCOLLECTION) =====

    /**
     * Get maintenance history for a specific equipment
     * @param {string} equipmentId - Equipment ID
     * @returns {Promise<Array>} Array of maintenance records
     */
    async getMaintenanceHistory(equipmentId) {
        try {
            const snapshot = await db.collection('equipment').doc(equipmentId)
                .collection('maintenance')
                .orderBy('date', 'desc')
                .get();
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.error('Error getting maintenance history:', error);
            throw error;
        }
    },

    /**
     * Add a maintenance record
     * @param {string} equipmentId - Equipment ID
     * @param {Object} data - Maintenance data
     * @returns {Promise<string>} Maintenance record ID
     */
    async addMaintenance(equipmentId, data) {
        try {
            const docRef = await db.collection('equipment').doc(equipmentId)
                .collection('maintenance').add({
                    ...data,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });
            console.log('Maintenance record added:', docRef.id);
            return docRef.id;
        } catch (error) {
            console.error('Error adding maintenance:', error);
            throw error;
        }
    },

    // ===== AUDIT LOG (SUBCOLLECTION) =====

    /**
     * Get audit log for a specific equipment
     * @param {string} equipmentId - Equipment ID
     * @returns {Promise<Array>} Array of audit log entries
     */
    async getAuditLog(equipmentId) {
        try {
            const snapshot = await db.collection('equipment').doc(equipmentId)
                .collection('auditLog')
                .orderBy('timestamp', 'desc')
                .get();
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.error('Error getting audit log:', error);
            throw error;
        }
    },

    /**
     * Add an audit log entry
     * @param {string} equipmentId - Equipment ID
     * @param {string} action - Action type
     * @param {string} details - Action details
     */
    async addAuditLog(equipmentId, action, details) {
        try {
            await db.collection('equipment').doc(equipmentId)
                .collection('auditLog').add({
                    action,
                    details,
                    timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                    userId: auth.currentUser?.email || 'anonymous'
                });
            console.log('Audit log entry added');
        } catch (error) {
            console.error('Error adding audit log:', error);
            // Don't throw - audit logging failure shouldn't break the app
        }
    },

    // ===== CUSTOM EQUIPMENT TYPES =====

    /**
     * Get all custom equipment types
     * @returns {Promise<Array>} Array of custom types
     */
    async getCustomTypes() {
        try {
            const snapshot = await db.collection('customTypes').orderBy('createdAt', 'asc').get();
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.error('Error getting custom types:', error);
            throw error;
        }
    },

    /**
     * Add a new custom equipment type
     * @param {string} typeName - Type name
     * @returns {Promise<string>} Custom type ID
     */
    async addCustomType(typeName) {
        try {
            // Check if already exists
            const existing = await db.collection('customTypes')
                .where('name', '==', typeName)
                .get();

            if (!existing.empty) {
                return existing.docs[0].id; // Already exists
            }

            const docRef = await db.collection('customTypes').add({
                name: typeName,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            console.log('Custom type added:', typeName);
            return docRef.id;
        } catch (error) {
            console.error('Error adding custom type:', error);
            throw error;
        }
    },

    // ===== UTILITY FUNCTIONS =====

    /**
     * Check if Firebase is initialized and ready
     * @returns {boolean} True if Firebase is ready
     */
    isReady() {
        return firebase.apps.length > 0;
    },

    /**
     * Get current user
     * @returns {Object|null} Current user or null
     */
    getCurrentUser() {
        return auth.currentUser;
    }
};

// Make service available globally
window.FirebaseService = FirebaseService;
