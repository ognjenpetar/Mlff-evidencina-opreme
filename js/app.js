// ===== DATA MANAGEMENT =====
const STORAGE_KEY = 'mlff_equipment_data';

let appData = {
    locations: [],
    lastModified: null
};

let currentLocationId = null;
let currentEquipmentId = null;

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    loadData();
    renderDashboard();
});

// Load data from localStorage
function loadData() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
        try {
            appData = JSON.parse(stored);
        } catch (e) {
            console.error('Error loading data:', e);
            appData = { locations: [], lastModified: null };
        }
    }
}

// Save data to localStorage
function saveData() {
    appData.lastModified = new Date().toISOString();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(appData));
}

// Generate unique ID
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// ===== VIEW MANAGEMENT =====
function showView(viewId) {
    document.querySelectorAll('.view').forEach(view => {
        view.classList.remove('active');
    });
    document.getElementById(viewId).classList.add('active');
}

function showDashboard() {
    showView('dashboardView');
    renderDashboard();
}

function showLocationDetail(locationId) {
    currentLocationId = locationId;
    showView('locationDetailView');
    renderLocationDetail();
}

function showEquipmentDetail(equipmentId) {
    currentEquipmentId = equipmentId;
    showView('equipmentDetailView');
    renderEquipmentDetail();
}

// ===== DASHBOARD RENDERING =====
function renderDashboard() {
    updateStatistics();
    renderEquipmentTypeList();
    renderWarrantyList();
    renderRecentEntries();
    renderLocationsGrid();
}

function updateStatistics() {
    const totalLocations = appData.locations.length;
    let totalEquipment = 0;
    let expiringWarranties = 0;
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    appData.locations.forEach(loc => {
        totalEquipment += (loc.equipment || []).length;
        (loc.equipment || []).forEach(eq => {
            if (eq.warrantyDate) {
                const warranty = new Date(eq.warrantyDate);
                if (warranty <= thirtyDaysFromNow && warranty >= now) {
                    expiringWarranties++;
                }
            }
        });
    });

    document.getElementById('totalLocations').textContent = totalLocations;
    document.getElementById('totalEquipment').textContent = totalEquipment;
    document.getElementById('expiringWarranties').textContent = expiringWarranties;

    // Last entry date
    let lastEntry = '-';
    if (appData.lastModified) {
        const date = new Date(appData.lastModified);
        lastEntry = formatDate(date);
    }
    document.getElementById('lastEntryDate').textContent = lastEntry;
}

function renderEquipmentTypeList() {
    const container = document.getElementById('equipmentTypeList');
    const typeCounts = {};

    appData.locations.forEach(loc => {
        (loc.equipment || []).forEach(eq => {
            const type = eq.type || 'Nepoznato';
            typeCounts[type] = (typeCounts[type] || 0) + 1;
        });
    });

    const types = Object.entries(typeCounts).sort((a, b) => b[1] - a[1]);

    if (types.length === 0) {
        container.innerHTML = '<p class="no-data">Nema unesene opreme</p>';
        return;
    }

    container.innerHTML = types.map(([type, count]) => `
        <div class="type-item">
            <span class="type-name">${type}</span>
            <span class="type-count">${count}</span>
        </div>
    `).join('');
}

function renderWarrantyList() {
    const container = document.getElementById('warrantyList');
    const now = new Date();
    const warranties = [];

    appData.locations.forEach(loc => {
        (loc.equipment || []).forEach(eq => {
            if (eq.warrantyDate) {
                const warranty = new Date(eq.warrantyDate);
                const daysUntil = Math.ceil((warranty - now) / (1000 * 60 * 60 * 24));
                warranties.push({
                    name: `${eq.type} - ${eq.inventoryNumber}`,
                    date: warranty,
                    daysUntil,
                    locationName: loc.name
                });
            }
        });
    });

    // Sort by date and take first 3 that are expiring soon
    warranties.sort((a, b) => a.date - b.date);
    const expiringSoon = warranties.filter(w => w.daysUntil <= 90).slice(0, 3);

    if (expiringSoon.length === 0) {
        container.innerHTML = '<p class="no-data">Nema garancija koje ističu uskoro</p>';
        return;
    }

    container.innerHTML = expiringSoon.map(w => {
        let statusClass = 'ok';
        let statusText = `${w.daysUntil} dana`;
        if (w.daysUntil < 0) {
            statusClass = 'expired';
            statusText = 'Istekla';
        } else if (w.daysUntil <= 30) {
            statusClass = '';
        }

        return `
            <div class="warranty-item">
                <div>
                    <span class="warranty-name">${w.name}</span>
                    <small style="display:block;color:var(--text-muted)">${w.locationName}</small>
                </div>
                <span class="warranty-date ${statusClass}">${statusText}</span>
            </div>
        `;
    }).join('');
}

function renderRecentEntries() {
    const container = document.getElementById('recentEntries');
    const entries = [];

    appData.locations.forEach(loc => {
        entries.push({
            type: 'Lokacija',
            name: loc.name,
            date: new Date(loc.createdAt || loc.id)
        });
        (loc.equipment || []).forEach(eq => {
            entries.push({
                type: eq.type,
                name: eq.inventoryNumber,
                date: new Date(eq.createdAt || eq.id)
            });
        });
    });

    // Sort by date descending and take last 5
    entries.sort((a, b) => b.date - a.date);
    const recent = entries.slice(0, 5);

    if (recent.length === 0) {
        container.innerHTML = '<p class="no-data">Nema nedavnih unosa</p>';
        return;
    }

    container.innerHTML = recent.map(e => `
        <div class="entry-item">
            <div>
                <span class="entry-name">${e.name}</span>
                <small style="display:block;color:var(--text-muted)">${e.type}</small>
            </div>
            <span class="entry-date">${formatDate(e.date)}</span>
        </div>
    `).join('');
}

function renderLocationsGrid() {
    const container = document.getElementById('locationsGrid');

    if (appData.locations.length === 0) {
        container.innerHTML = '<p class="no-data">Nema unesenih lokacija. Kliknite "Dodaj Lokaciju" za početak.</p>';
        return;
    }

    container.innerHTML = appData.locations.map(loc => {
        const equipmentCount = (loc.equipment || []).length;
        const imageHtml = loc.photo
            ? `<img src="${loc.photo}" alt="${loc.name}">`
            : `<div class="no-image"><i class="fas fa-image"></i><span>Nema fotografije</span></div>`;

        return `
            <div class="location-card" onclick="showLocationDetail('${loc.id}')">
                <div class="location-card-image">
                    ${imageHtml}
                </div>
                <div class="location-card-content">
                    <h3 class="location-card-title">${loc.name}</h3>
                    <div class="location-card-coords">
                        <i class="fas fa-map-pin"></i>
                        ${loc.latitude}, ${loc.longitude}
                    </div>
                    <p class="location-card-description">${loc.description || 'Nema opisa'}</p>
                    <div class="location-card-footer">
                        <span class="equipment-count">
                            <i class="fas fa-microchip"></i>
                            ${equipmentCount} oprema
                        </span>
                        <div class="location-card-actions" onclick="event.stopPropagation()">
                            <button class="btn btn-icon" onclick="editLocation('${loc.id}')" title="Izmeni">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-icon" onclick="confirmDeleteLocation('${loc.id}')" title="Obriši">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// ===== LOCATION DETAIL RENDERING =====
function renderLocationDetail() {
    const location = appData.locations.find(l => l.id === currentLocationId);
    if (!location) {
        showDashboard();
        return;
    }

    document.getElementById('locationTitle').textContent = location.name;
    document.getElementById('locationCoords').textContent = `${location.latitude}, ${location.longitude}`;
    document.getElementById('locationDescription').textContent = location.description || 'Nema opisa';
    document.getElementById('locationEquipmentCount').textContent = (location.equipment || []).length;

    // Image
    const imgContainer = document.getElementById('locationImage');
    const noImgDiv = document.getElementById('noLocationImage');
    if (location.photo) {
        imgContainer.src = location.photo;
        imgContainer.style.display = 'block';
        noImgDiv.style.display = 'none';
    } else {
        imgContainer.style.display = 'none';
        noImgDiv.style.display = 'flex';
    }

    // Equipment grid
    renderEquipmentGrid(location);
}

function renderEquipmentGrid(location) {
    const container = document.getElementById('equipmentGrid');
    const equipment = location.equipment || [];

    if (equipment.length === 0) {
        container.innerHTML = '<p class="no-data">Nema opreme na ovoj lokaciji. Kliknite "Dodaj Opremu" za početak.</p>';
        return;
    }

    container.innerHTML = equipment.map(eq => {
        const imageHtml = eq.photo
            ? `<img src="${eq.photo}" alt="${eq.type}">`
            : `<div class="no-image"><i class="fas fa-microchip"></i></div>`;

        return `
            <div class="equipment-card" onclick="showEquipmentDetail('${eq.id}')">
                <div class="equipment-card-image">
                    ${imageHtml}
                </div>
                <div class="equipment-card-content">
                    <span class="equipment-card-type">${eq.type}</span>
                    <h4 class="equipment-card-inventory">${eq.inventoryNumber}</h4>
                    <div class="equipment-card-info">
                        ${eq.ip ? `<span><i class="fas fa-network-wired"></i> ${eq.ip}</span>` : ''}
                        ${eq.installDate ? `<span><i class="fas fa-calendar"></i> ${formatDate(new Date(eq.installDate))}</span>` : ''}
                        ${eq.installer ? `<span><i class="fas fa-user"></i> ${eq.installer}</span>` : ''}
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// ===== EQUIPMENT DETAIL RENDERING =====
function renderEquipmentDetail() {
    const location = appData.locations.find(l => l.id === currentLocationId);
    if (!location) {
        showDashboard();
        return;
    }

    const equipment = (location.equipment || []).find(e => e.id === currentEquipmentId);
    if (!equipment) {
        showLocationDetail(currentLocationId);
        return;
    }

    document.getElementById('equipmentTitle').textContent = `${equipment.type} - ${equipment.inventoryNumber}`;

    // Location image
    const locImgContainer = document.getElementById('equipmentLocationImage');
    if (location.photo) {
        locImgContainer.innerHTML = `<img src="${location.photo}" alt="${location.name}">`;
    } else {
        locImgContainer.innerHTML = '<div class="no-image"><i class="fas fa-image"></i></div>';
    }

    // Equipment image
    const eqImgContainer = document.getElementById('equipmentImage');
    if (equipment.photo) {
        eqImgContainer.innerHTML = `<img src="${equipment.photo}" alt="${equipment.type}">`;
    } else {
        eqImgContainer.innerHTML = '<div class="no-image"><i class="fas fa-image"></i></div>';
    }

    // Info fields
    document.getElementById('eqLocation').textContent = location.name;
    document.getElementById('eqInventory').textContent = equipment.inventoryNumber || '-';
    document.getElementById('eqType').textContent = equipment.type || '-';
    document.getElementById('eqIP').textContent = equipment.ip || '-';
    document.getElementById('eqMAC').textContent = equipment.mac || '-';
    document.getElementById('eqX').textContent = equipment.x !== undefined ? `${equipment.x} cm` : '-';
    document.getElementById('eqY').textContent = equipment.y !== undefined ? `${equipment.y} cm` : '-';
    document.getElementById('eqZ').textContent = equipment.z !== undefined ? `${equipment.z} cm` : '-';
    document.getElementById('eqInstallDate').textContent = equipment.installDate ? formatDate(new Date(equipment.installDate)) : '-';
    document.getElementById('eqInstaller').textContent = equipment.installer || '-';
    document.getElementById('eqTester').textContent = equipment.tester || '-';

    // Warranty
    if (equipment.warrantyDate) {
        const warranty = new Date(equipment.warrantyDate);
        const now = new Date();
        const daysUntil = Math.ceil((warranty - now) / (1000 * 60 * 60 * 24));

        document.getElementById('eqWarranty').textContent = formatDate(warranty);

        let statusText, statusColor;
        if (daysUntil < 0) {
            statusText = 'Istekla';
            statusColor = 'var(--danger)';
        } else if (daysUntil <= 30) {
            statusText = `Ističe za ${daysUntil} dana`;
            statusColor = 'var(--warning)';
        } else {
            statusText = `Aktivna (${daysUntil} dana)`;
            statusColor = 'var(--success)';
        }
        document.getElementById('eqWarrantyStatus').textContent = statusText;
        document.getElementById('eqWarrantyStatus').style.color = statusColor;
    } else {
        document.getElementById('eqWarranty').textContent = '-';
        document.getElementById('eqWarrantyStatus').textContent = '-';
        document.getElementById('eqWarrantyStatus').style.color = '';
    }

    // Documents
    renderDocumentsList(equipment);
}

function renderDocumentsList(equipment) {
    const container = document.getElementById('documentsList');
    const documents = equipment.documents || [];

    if (documents.length === 0) {
        container.innerHTML = '<p class="no-data">Nema dodatne dokumentacije</p>';
        return;
    }

    container.innerHTML = documents.map((doc, index) => `
        <div class="document-item">
            <span class="document-name">
                <i class="fas fa-file"></i>
                ${doc.name}
            </span>
            <div class="document-actions">
                <button class="btn btn-icon btn-small" onclick="downloadDocument(${index})" title="Preuzmi">
                    <i class="fas fa-download"></i>
                </button>
                <button class="btn btn-icon btn-small" onclick="deleteDocument(${index})" title="Obriši">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
}

// ===== LOCATION CRUD =====
function showAddLocationModal() {
    document.getElementById('locationModalTitle').textContent = 'Dodaj Lokaciju';
    document.getElementById('locationForm').reset();
    document.getElementById('locationId').value = '';
    document.getElementById('locPhotoPreview').innerHTML = '';
    openModal('locationModal');
}

function editLocation(locationId) {
    const location = appData.locations.find(l => l.id === locationId);
    if (!location) return;

    document.getElementById('locationModalTitle').textContent = 'Izmeni Lokaciju';
    document.getElementById('locationId').value = location.id;
    document.getElementById('locName').value = location.name;
    document.getElementById('locLat').value = location.latitude;
    document.getElementById('locLng').value = location.longitude;
    document.getElementById('locDescription').value = location.description || '';

    const preview = document.getElementById('locPhotoPreview');
    if (location.photo) {
        preview.innerHTML = `<img src="${location.photo}" alt="Preview">`;
    } else {
        preview.innerHTML = '';
    }

    openModal('locationModal');
}

function editCurrentLocation() {
    editLocation(currentLocationId);
}

function saveLocation(event) {
    event.preventDefault();

    const id = document.getElementById('locationId').value;
    const name = document.getElementById('locName').value.trim();
    const latitude = document.getElementById('locLat').value.trim();
    const longitude = document.getElementById('locLng').value.trim();
    const description = document.getElementById('locDescription').value.trim();

    const photoInput = document.getElementById('locPhoto');
    let photoPromise = Promise.resolve(null);

    if (photoInput.files.length > 0) {
        photoPromise = fileToBase64(photoInput.files[0]);
    }

    photoPromise.then(photo => {
        if (id) {
            // Edit existing
            const location = appData.locations.find(l => l.id === id);
            if (location) {
                location.name = name;
                location.latitude = latitude;
                location.longitude = longitude;
                location.description = description;
                if (photo) location.photo = photo;
            }
        } else {
            // Add new
            const newLocation = {
                id: generateId(),
                name,
                latitude,
                longitude,
                description,
                photo,
                equipment: [],
                createdAt: new Date().toISOString()
            };
            appData.locations.push(newLocation);
        }

        saveData();
        closeModal('locationModal');
        renderDashboard();

        if (currentLocationId && document.getElementById('locationDetailView').classList.contains('active')) {
            renderLocationDetail();
        }
    });
}

function confirmDeleteLocation(locationId) {
    const location = appData.locations.find(l => l.id === locationId);
    if (!location) return;

    showConfirm(
        'Brisanje Lokacije',
        `Da li ste sigurni da želite da obrišete lokaciju "${location.name}" i svu opremu na njoj?`,
        () => deleteLocation(locationId)
    );
}

function deleteLocation(locationId) {
    appData.locations = appData.locations.filter(l => l.id !== locationId);
    saveData();
    closeModal('confirmModal');
    showDashboard();
}

function deleteCurrentLocation() {
    confirmDeleteLocation(currentLocationId);
}

// ===== EQUIPMENT CRUD =====
function showAddEquipmentModal() {
    document.getElementById('equipmentModalTitle').textContent = 'Dodaj Opremu';
    document.getElementById('equipmentForm').reset();
    document.getElementById('equipmentId').value = '';
    document.getElementById('equipmentLocationId').value = currentLocationId;
    document.getElementById('eqFormInstallDate').value = new Date().toISOString().split('T')[0];
    document.getElementById('eqPhotoPreview').innerHTML = '';
    openModal('equipmentModal');
}

function editEquipment(equipmentId) {
    const location = appData.locations.find(l => l.id === currentLocationId);
    if (!location) return;

    const equipment = (location.equipment || []).find(e => e.id === equipmentId);
    if (!equipment) return;

    document.getElementById('equipmentModalTitle').textContent = 'Izmeni Opremu';
    document.getElementById('equipmentId').value = equipment.id;
    document.getElementById('equipmentLocationId').value = currentLocationId;
    document.getElementById('eqFormType').value = equipment.type || '';
    document.getElementById('eqFormInventory').value = equipment.inventoryNumber || '';
    document.getElementById('eqFormIP').value = equipment.ip || '';
    document.getElementById('eqFormMAC').value = equipment.mac || '';
    document.getElementById('eqFormX').value = equipment.x || '';
    document.getElementById('eqFormY').value = equipment.y || '';
    document.getElementById('eqFormZ').value = equipment.z || '';
    document.getElementById('eqFormInstallDate').value = equipment.installDate || '';
    document.getElementById('eqFormWarranty').value = equipment.warrantyDate || '';
    document.getElementById('eqFormInstaller').value = equipment.installer || '';
    document.getElementById('eqFormTester').value = equipment.tester || '';
    document.getElementById('eqFormNotes').value = equipment.notes || '';

    const preview = document.getElementById('eqPhotoPreview');
    if (equipment.photo) {
        preview.innerHTML = `<img src="${equipment.photo}" alt="Preview">`;
    } else {
        preview.innerHTML = '';
    }

    openModal('equipmentModal');
}

function editCurrentEquipment() {
    editEquipment(currentEquipmentId);
}

function saveEquipment(event) {
    event.preventDefault();

    const id = document.getElementById('equipmentId').value;
    const locationId = document.getElementById('equipmentLocationId').value;
    const location = appData.locations.find(l => l.id === locationId);
    if (!location) return;

    if (!location.equipment) location.equipment = [];

    const type = document.getElementById('eqFormType').value;
    const inventoryNumber = document.getElementById('eqFormInventory').value.trim();
    const ip = document.getElementById('eqFormIP').value.trim();
    const mac = document.getElementById('eqFormMAC').value.trim();
    const x = document.getElementById('eqFormX').value ? parseInt(document.getElementById('eqFormX').value) : null;
    const y = document.getElementById('eqFormY').value ? parseInt(document.getElementById('eqFormY').value) : null;
    const z = document.getElementById('eqFormZ').value ? parseInt(document.getElementById('eqFormZ').value) : null;
    const installDate = document.getElementById('eqFormInstallDate').value;
    const warrantyDate = document.getElementById('eqFormWarranty').value;
    const installer = document.getElementById('eqFormInstaller').value.trim();
    const tester = document.getElementById('eqFormTester').value.trim();
    const notes = document.getElementById('eqFormNotes').value.trim();

    const photoInput = document.getElementById('eqFormPhoto');
    let photoPromise = Promise.resolve(null);

    if (photoInput.files.length > 0) {
        photoPromise = fileToBase64(photoInput.files[0]);
    }

    photoPromise.then(photo => {
        if (id) {
            // Edit existing
            const equipment = location.equipment.find(e => e.id === id);
            if (equipment) {
                equipment.type = type;
                equipment.inventoryNumber = inventoryNumber;
                equipment.ip = ip;
                equipment.mac = mac;
                equipment.x = x;
                equipment.y = y;
                equipment.z = z;
                equipment.installDate = installDate;
                equipment.warrantyDate = warrantyDate;
                equipment.installer = installer;
                equipment.tester = tester;
                equipment.notes = notes;
                if (photo) equipment.photo = photo;
            }
        } else {
            // Add new
            const newEquipment = {
                id: generateId(),
                type,
                inventoryNumber,
                ip,
                mac,
                x,
                y,
                z,
                installDate,
                warrantyDate,
                installer,
                tester,
                notes,
                photo,
                documents: [],
                createdAt: new Date().toISOString()
            };
            location.equipment.push(newEquipment);
        }

        saveData();
        closeModal('equipmentModal');
        renderLocationDetail();

        if (currentEquipmentId && document.getElementById('equipmentDetailView').classList.contains('active')) {
            renderEquipmentDetail();
        }
    });
}

function confirmDeleteEquipment(equipmentId) {
    const location = appData.locations.find(l => l.id === currentLocationId);
    if (!location) return;

    const equipment = (location.equipment || []).find(e => e.id === equipmentId);
    if (!equipment) return;

    showConfirm(
        'Brisanje Opreme',
        `Da li ste sigurni da želite da obrišete opremu "${equipment.type} - ${equipment.inventoryNumber}"?`,
        () => deleteEquipment(equipmentId)
    );
}

function deleteEquipment(equipmentId) {
    const location = appData.locations.find(l => l.id === currentLocationId);
    if (!location) return;

    location.equipment = (location.equipment || []).filter(e => e.id !== equipmentId);
    saveData();
    closeModal('confirmModal');
    showLocationDetail(currentLocationId);
}

function deleteCurrentEquipment() {
    confirmDeleteEquipment(currentEquipmentId);
}

// ===== DOCUMENT MANAGEMENT =====
function uploadDocuments(event) {
    const files = event.target.files;
    if (!files.length) return;

    const location = appData.locations.find(l => l.id === currentLocationId);
    if (!location) return;

    const equipment = (location.equipment || []).find(e => e.id === currentEquipmentId);
    if (!equipment) return;

    if (!equipment.documents) equipment.documents = [];

    const promises = Array.from(files).map(file => {
        return fileToBase64(file).then(data => ({
            name: file.name,
            type: file.type,
            data
        }));
    });

    Promise.all(promises).then(docs => {
        equipment.documents.push(...docs);
        saveData();
        renderDocumentsList(equipment);
    });

    event.target.value = '';
}

function downloadDocument(index) {
    const location = appData.locations.find(l => l.id === currentLocationId);
    if (!location) return;

    const equipment = (location.equipment || []).find(e => e.id === currentEquipmentId);
    if (!equipment || !equipment.documents[index]) return;

    const doc = equipment.documents[index];
    const link = document.createElement('a');
    link.href = doc.data;
    link.download = doc.name;
    link.click();
}

function deleteDocument(index) {
    const location = appData.locations.find(l => l.id === currentLocationId);
    if (!location) return;

    const equipment = (location.equipment || []).find(e => e.id === currentEquipmentId);
    if (!equipment) return;

    equipment.documents.splice(index, 1);
    saveData();
    renderDocumentsList(equipment);
}

// ===== CALENDAR =====
function addToCalendar() {
    const location = appData.locations.find(l => l.id === currentLocationId);
    if (!location) return;

    const equipment = (location.equipment || []).find(e => e.id === currentEquipmentId);
    if (!equipment || !equipment.warrantyDate) {
        alert('Nema podatka o garanciji za ovu opremu.');
        return;
    }

    const warranty = new Date(equipment.warrantyDate);
    const title = encodeURIComponent(`Garancija ističe: ${equipment.type} - ${equipment.inventoryNumber}`);
    const details = encodeURIComponent(`Lokacija: ${location.name}\nInventarski broj: ${equipment.inventoryNumber}`);
    const dateStr = warranty.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

    // Google Calendar URL
    const calendarUrl = `https://www.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dateStr}/${dateStr}&details=${details}`;
    window.open(calendarUrl, '_blank');
}

// ===== PRINT REPORTS =====
function printEquipmentReport() {
    const location = appData.locations.find(l => l.id === currentLocationId);
    if (!location) return;

    const equipment = (location.equipment || []).find(e => e.id === currentEquipmentId);
    if (!equipment) return;

    const content = generateEquipmentReportHTML(location, equipment);
    showPrintModal(content);
}

function printLocationReport() {
    const location = appData.locations.find(l => l.id === currentLocationId);
    if (!location) return;

    const content = generateLocationReportHTML(location);
    showPrintModal(content);
}

function generateEquipmentReportHTML(location, equipment) {
    const now = new Date();
    let warrantyStatus = '-';
    if (equipment.warrantyDate) {
        const warranty = new Date(equipment.warrantyDate);
        const daysUntil = Math.ceil((warranty - now) / (1000 * 60 * 60 * 24));
        if (daysUntil < 0) warrantyStatus = 'Istekla';
        else if (daysUntil <= 30) warrantyStatus = `Ističe za ${daysUntil} dana`;
        else warrantyStatus = `Aktivna (${daysUntil} dana)`;
    }

    return `
        <div class="print-header">
            <div class="print-logo">Orion <span>E-mobility</span></div>
            <h1 class="print-title">Izveštaj Opreme</h1>
            <div class="print-date">${formatDate(now)}</div>
        </div>

        <div class="print-section">
            <h3>Osnovne Informacije</h3>
            <div class="print-info-grid">
                <div class="print-info-item">
                    <span class="print-info-label">Lokacija</span>
                    <span class="print-info-value">${location.name}</span>
                </div>
                <div class="print-info-item">
                    <span class="print-info-label">Tip Opreme</span>
                    <span class="print-info-value">${equipment.type}</span>
                </div>
                <div class="print-info-item">
                    <span class="print-info-label">Inventarski Broj</span>
                    <span class="print-info-value">${equipment.inventoryNumber}</span>
                </div>
                <div class="print-info-item">
                    <span class="print-info-label">Datum Postavljanja</span>
                    <span class="print-info-value">${equipment.installDate ? formatDate(new Date(equipment.installDate)) : '-'}</span>
                </div>
            </div>
        </div>

        <div class="print-section">
            <h3>Mrežne Informacije</h3>
            <div class="print-info-grid">
                <div class="print-info-item">
                    <span class="print-info-label">IP Adresa</span>
                    <span class="print-info-value">${equipment.ip || '-'}</span>
                </div>
                <div class="print-info-item">
                    <span class="print-info-label">MAC Adresa</span>
                    <span class="print-info-value">${equipment.mac || '-'}</span>
                </div>
            </div>
        </div>

        <div class="print-section">
            <h3>Pozicija (cm)</h3>
            <div class="print-info-grid">
                <div class="print-info-item">
                    <span class="print-info-label">X koordinata</span>
                    <span class="print-info-value">${equipment.x !== null ? equipment.x : '-'}</span>
                </div>
                <div class="print-info-item">
                    <span class="print-info-label">Y koordinata</span>
                    <span class="print-info-value">${equipment.y !== null ? equipment.y : '-'}</span>
                </div>
                <div class="print-info-item">
                    <span class="print-info-label">Z koordinata</span>
                    <span class="print-info-value">${equipment.z !== null ? equipment.z : '-'}</span>
                </div>
            </div>
        </div>

        <div class="print-section">
            <h3>Instalacija i Testiranje</h3>
            <div class="print-info-grid">
                <div class="print-info-item">
                    <span class="print-info-label">Instalirao</span>
                    <span class="print-info-value">${equipment.installer || '-'}</span>
                </div>
                <div class="print-info-item">
                    <span class="print-info-label">Testirao</span>
                    <span class="print-info-value">${equipment.tester || '-'}</span>
                </div>
            </div>
        </div>

        <div class="print-section">
            <h3>Garancija</h3>
            <div class="print-info-grid">
                <div class="print-info-item">
                    <span class="print-info-label">Garancija Do</span>
                    <span class="print-info-value">${equipment.warrantyDate ? formatDate(new Date(equipment.warrantyDate)) : '-'}</span>
                </div>
                <div class="print-info-item">
                    <span class="print-info-label">Status</span>
                    <span class="print-info-value">${warrantyStatus}</span>
                </div>
            </div>
        </div>

        ${equipment.notes ? `
        <div class="print-section">
            <h3>Napomene</h3>
            <p>${equipment.notes}</p>
        </div>
        ` : ''}

        ${equipment.photo ? `
        <div class="print-section">
            <h3>Fotografija Opreme</h3>
            <img src="${equipment.photo}" class="print-image" alt="Oprema">
        </div>
        ` : ''}
    `;
}

function generateLocationReportHTML(location) {
    const now = new Date();
    const equipment = location.equipment || [];

    let equipmentRows = '';
    if (equipment.length > 0) {
        equipmentRows = equipment.map(eq => `
            <tr>
                <td>${eq.type}</td>
                <td>${eq.inventoryNumber}</td>
                <td>${eq.ip || '-'}</td>
                <td>${eq.mac || '-'}</td>
                <td>${eq.installDate ? formatDate(new Date(eq.installDate)) : '-'}</td>
                <td>${eq.installer || '-'}</td>
                <td>${eq.warrantyDate ? formatDate(new Date(eq.warrantyDate)) : '-'}</td>
            </tr>
        `).join('');
    }

    // Equipment details
    let detailedReports = equipment.map(eq => {
        let warrantyStatus = '-';
        if (eq.warrantyDate) {
            const warranty = new Date(eq.warrantyDate);
            const daysUntil = Math.ceil((warranty - now) / (1000 * 60 * 60 * 24));
            if (daysUntil < 0) warrantyStatus = 'Istekla';
            else if (daysUntil <= 30) warrantyStatus = `Ističe za ${daysUntil} dana`;
            else warrantyStatus = `Aktivna (${daysUntil} dana)`;
        }

        return `
            <div class="print-section" style="page-break-inside: avoid;">
                <h3>${eq.type} - ${eq.inventoryNumber}</h3>
                <div class="print-info-grid">
                    <div class="print-info-item">
                        <span class="print-info-label">IP Adresa</span>
                        <span class="print-info-value">${eq.ip || '-'}</span>
                    </div>
                    <div class="print-info-item">
                        <span class="print-info-label">MAC Adresa</span>
                        <span class="print-info-value">${eq.mac || '-'}</span>
                    </div>
                    <div class="print-info-item">
                        <span class="print-info-label">Pozicija (X, Y, Z)</span>
                        <span class="print-info-value">${eq.x || '-'}, ${eq.y || '-'}, ${eq.z || '-'} cm</span>
                    </div>
                    <div class="print-info-item">
                        <span class="print-info-label">Instalirao</span>
                        <span class="print-info-value">${eq.installer || '-'}</span>
                    </div>
                    <div class="print-info-item">
                        <span class="print-info-label">Testirao</span>
                        <span class="print-info-value">${eq.tester || '-'}</span>
                    </div>
                    <div class="print-info-item">
                        <span class="print-info-label">Garancija</span>
                        <span class="print-info-value">${eq.warrantyDate ? formatDate(new Date(eq.warrantyDate)) : '-'} (${warrantyStatus})</span>
                    </div>
                </div>
                ${eq.notes ? `<p style="margin-top: 10px;"><strong>Napomene:</strong> ${eq.notes}</p>` : ''}
            </div>
        `;
    }).join('');

    return `
        <div class="print-header">
            <div class="print-logo">Orion <span>E-mobility</span></div>
            <h1 class="print-title">Izveštaj Lokacije</h1>
            <div class="print-date">${formatDate(now)}</div>
        </div>

        <div class="print-section">
            <h3>Informacije o Lokaciji</h3>
            <div class="print-info-grid">
                <div class="print-info-item">
                    <span class="print-info-label">Naziv</span>
                    <span class="print-info-value">${location.name}</span>
                </div>
                <div class="print-info-item">
                    <span class="print-info-label">Koordinate</span>
                    <span class="print-info-value">${location.latitude}, ${location.longitude}</span>
                </div>
                <div class="print-info-item">
                    <span class="print-info-label">Ukupno Opreme</span>
                    <span class="print-info-value">${equipment.length}</span>
                </div>
            </div>
            ${location.description ? `<p style="margin-top: 15px;"><strong>Opis:</strong> ${location.description}</p>` : ''}
        </div>

        ${location.photo ? `
        <div class="print-section">
            <h3>Fotografija Lokacije</h3>
            <img src="${location.photo}" class="print-image" alt="Lokacija">
        </div>
        ` : ''}

        <div class="print-section">
            <h3>Pregled Opreme</h3>
            ${equipment.length > 0 ? `
                <table class="print-equipment-list">
                    <thead>
                        <tr>
                            <th>Tip</th>
                            <th>Inv. Broj</th>
                            <th>IP</th>
                            <th>MAC</th>
                            <th>Datum Post.</th>
                            <th>Instalirao</th>
                            <th>Garancija Do</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${equipmentRows}
                    </tbody>
                </table>
            ` : '<p>Nema opreme na ovoj lokaciji.</p>'}
        </div>

        <h2 style="margin-top: 40px; padding-top: 20px; border-top: 2px solid #00cc6a;">Detaljni Izveštaji Opreme</h2>
        ${detailedReports || '<p>Nema opreme za detaljan izveštaj.</p>'}
    `;
}

function showPrintModal(content) {
    document.getElementById('printContent').innerHTML = content;
    openModal('printModal');
}

// ===== EXPORT/IMPORT =====
function exportData() {
    const dataStr = JSON.stringify(appData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `mlff_equipment_backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
}

function importData(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const imported = JSON.parse(e.target.result);
            if (imported.locations && Array.isArray(imported.locations)) {
                showConfirm(
                    'Import Podataka',
                    'Da li želite da zamenite sve trenutne podatke sa importovanim? Ova akcija se ne može poništiti.',
                    () => {
                        appData = imported;
                        saveData();
                        closeModal('confirmModal');
                        renderDashboard();
                        alert('Podaci su uspešno importovani!');
                    }
                );
            } else {
                alert('Neispravan format fajla!');
            }
        } catch (error) {
            alert('Greška pri učitavanju fajla: ' + error.message);
        }
    };
    reader.readAsText(file);
    event.target.value = '';
}

// ===== UTILITY FUNCTIONS =====
function openModal(modalId) {
    document.getElementById(modalId).classList.add('active');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

function showConfirm(title, message, onConfirm) {
    document.getElementById('confirmTitle').textContent = title;
    document.getElementById('confirmMessage').textContent = message;
    document.getElementById('confirmBtn').onclick = onConfirm;
    openModal('confirmModal');
}

function previewImage(event, previewId) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        document.getElementById(previewId).innerHTML = `<img src="${e.target.result}" alt="Preview">`;
    };
    reader.readAsDataURL(file);
}

function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

function formatDate(date) {
    if (!date || isNaN(date.getTime())) return '-';
    return date.toLocaleDateString('sr-RS', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

// Close modals when clicking outside
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
        e.target.classList.remove('active');
    }
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        document.querySelectorAll('.modal.active').forEach(modal => {
            modal.classList.remove('active');
        });
    }
});
