// ===== DATA MANAGEMENT =====
const STORAGE_KEY = 'mlff_equipment_data';
const SETTINGS_KEY = 'mlff_settings';
const CUSTOM_TYPES_KEY = 'mlff_custom_types';
const BACKUP_REMINDER_DAYS = 7;

// Predefined equipment types
const DEFAULT_EQUIPMENT_TYPES = ['VDX', 'VRX', 'Antena', 'Switch', 'TRC', 'TRM', 'intel', 'jetson', 'Wi-FI'];

// Sub-location equipment type mapping
const SUB_LOCATION_EQUIPMENT_TYPES = {
    'Gentri': ['Antena', 'VDX', 'VRX', 'IUX', 'IUV'],
    'Ormar': ['TRC', 'TCM', 'Switch', 'Router', 'Jetson', 'Intel', 'Napajanje']
};

const ALL_EQUIPMENT_TYPES = [
    ...SUB_LOCATION_EQUIPMENT_TYPES['Gentri'],
    ...SUB_LOCATION_EQUIPMENT_TYPES['Ormar']
];

// File upload validation constants
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_FILE_TYPES = ['application/pdf'];
const ALLOWED_FILE_EXTENSIONS = ['.pdf'];

let appData = {
    locations: [],
    lastModified: null,
    lastBackup: null
};

let appSettings = {
    dontShowWelcome: false,
    sidebarOpen: false
};

let customEquipmentTypes = [];

let currentLocationId = null;
let currentEquipmentId = null;
let qrCodeInstance = null;
let qrCodeSmallInstance = null;
let mapInstance = null;
let mapMarkers = [];

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    loadData();
    loadSettings();
    loadCustomTypes();
    populateEquipmentTypes();
    updateBreadcrumb();
    updateDataStatus();
    updateLocationFilter();
    checkBackupReminder();
    checkShowWelcome();

    // Initialize router routes
    initializeRouter();
});

function initializeRouter() {
    // Dashboard route
    router.addRoute('dashboard', () => {
        showView('dashboardView');
        renderDashboard();
        renderStructureTree();
        updateBreadcrumb();
    });

    // Location detail route
    router.addRoute('location', (id) => {
        const location = appData.locations.find(l => l.id === id);
        if (location) {
            currentLocationId = id;
            showView('locationDetailView');
            renderLocationDetail();
            renderStructureTree();
            updateBreadcrumb();
        } else {
            alert('Lokacija nije pronađena');
            router.navigate('/');
        }
    });

    // Equipment detail route
    router.addRoute('equipment', (id) => {
        // Find equipment across all locations
        let foundLocation = null;
        let foundEquipment = null;

        for (const location of appData.locations) {
            const equipment = (location.equipment || []).find(e => e.id === id);
            if (equipment) {
                foundLocation = location;
                foundEquipment = equipment;
                break;
            }
        }

        if (foundLocation && foundEquipment) {
            currentLocationId = foundLocation.id;
            currentEquipmentId = id;
            showView('equipmentDetailView');
            renderEquipmentDetail();
            renderStructureTree();
            updateBreadcrumb();
            generateEquipmentQR();
        } else {
            alert('Oprema nije pronađena');
            router.navigate('/');
        }
    });

    // Location report route
    router.addRoute('locationReport', (id) => {
        showLocationReportView(id);
    });

    // Equipment report route
    router.addRoute('equipmentReport', (id) => {
        showEquipmentReportView(id);
    });
}

// Load data from localStorage
function loadData() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
        try {
            appData = JSON.parse(stored);
        } catch (e) {
            console.error('Error loading data:', e);
            appData = { locations: [], lastModified: null, lastBackup: null };
        }
    }
}

// Save data to localStorage
function saveData() {
    appData.lastModified = new Date().toISOString();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(appData));
    updateDataStatus();
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
    router.navigate('/');
}

function showLocationDetail(locationId) {
    router.navigate(`/location/${locationId}`);
}

function showEquipmentDetail(equipmentId) {
    router.navigate(`/equipment/${equipmentId}`);
}

/**
 * Switch between Gentri and Ormar sub-location tabs
 */
function showSubLocationTab(subLocation, event) {
    // Remove active class from all tabs
    document.querySelectorAll('.sub-location-tabs .tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelectorAll('.sub-location-section').forEach(section => {
        section.classList.remove('active');
    });

    // Add active class to selected tab
    if (event && event.target) {
        event.target.closest('.tab-btn').classList.add('active');
    }
    document.getElementById(`${subLocation.toLowerCase()}Section`).classList.add('active');
}

// Report view functions
function showLocationReportView(locationId) {
    const location = appData.locations.find(l => l.id === locationId);
    if (!location) {
        alert('Lokacija nije pronađena');
        router.navigate('/');
        return;
    }

    currentLocationId = locationId;
    showView('locationReportView');

    // Generate and display report
    const reportHtml = generateLocationReportHTML(location);
    document.getElementById('locationReportContent').innerHTML = reportHtml;

    updateBreadcrumb();
}

function showEquipmentReportView(equipmentId) {
    // Find equipment across all locations
    let foundLocation = null;
    let foundEquipment = null;

    for (const location of appData.locations) {
        const equipment = (location.equipment || []).find(e => e.id === equipmentId);
        if (equipment) {
            foundLocation = location;
            foundEquipment = equipment;
            break;
        }
    }

    if (!foundLocation || !foundEquipment) {
        alert('Oprema nije pronađena');
        router.navigate('/');
        return;
    }

    currentLocationId = foundLocation.id;
    currentEquipmentId = equipmentId;
    showView('equipmentReportView');

    // Generate and display report
    const reportHtml = generateEquipmentReportHTML(foundLocation, foundEquipment);
    document.getElementById('equipmentReportContent').innerHTML = reportHtml;

    updateBreadcrumb();
}

// ===== BREADCRUMB =====
function updateBreadcrumb() {
    const breadcrumb = document.getElementById('breadcrumb');
    let html = `<a href="#" onclick="showDashboard(); return false;" class="breadcrumb-item">
        <i class="fas fa-home"></i> Dashboard
    </a>`;

    if (currentLocationId) {
        const location = appData.locations.find(l => l.id === currentLocationId);
        if (location) {
            html += `<span class="breadcrumb-separator"><i class="fas fa-chevron-right"></i></span>`;
            if (currentEquipmentId) {
                html += `<a href="#" onclick="showLocationDetail('${location.id}'); return false;" class="breadcrumb-item">
                    <i class="fas fa-map-marker-alt"></i> ${location.name}
                </a>`;
            } else {
                html += `<span class="breadcrumb-item active">
                    <i class="fas fa-map-marker-alt"></i> ${location.name}
                </span>`;
            }
        }
    }

    if (currentEquipmentId) {
        const location = appData.locations.find(l => l.id === currentLocationId);
        if (location) {
            const equipment = (location.equipment || []).find(e => e.id === currentEquipmentId);
            if (equipment) {
                html += `<span class="breadcrumb-separator"><i class="fas fa-chevron-right"></i></span>`;
                html += `<span class="breadcrumb-item active">
                    <i class="fas fa-microchip"></i> ${equipment.type} - ${equipment.inventoryNumber}
                </span>`;
            }
        }
    }

    breadcrumb.innerHTML = html;
}

// ===== STRUCTURE TREE =====
function toggleStructurePanel() {
    const sidebar = document.getElementById('structureSidebar');
    sidebar.classList.toggle('active');
    appSettings.sidebarOpen = sidebar.classList.contains('active');
    saveSettings();
}

function renderStructureTree() {
    const container = document.getElementById('structureTree');

    if (appData.locations.length === 0) {
        container.innerHTML = '<p class="no-data">Nema lokacija</p>';
        return;
    }

    let html = '<div class="tree-root"><div class="tree-item">';

    appData.locations.forEach(loc => {
        const isLocationActive = currentLocationId === loc.id && !currentEquipmentId;
        const equipmentCount = (loc.equipment || []).length;

        html += `
            <div class="tree-location ${isLocationActive ? 'active' : ''}" onclick="showLocationDetail('${loc.id}')">
                <i class="fas fa-map-marker-alt"></i>
                <span>${loc.name}</span>
                <span class="count">${equipmentCount}</span>
            </div>
        `;

        if (loc.equipment && loc.equipment.length > 0) {
            html += '<div class="tree-equipment-list">';
            loc.equipment.forEach(eq => {
                const isActive = currentEquipmentId === eq.id;
                const statusClass = getStatusDotClass(eq.status);
                html += `
                    <div class="tree-equipment ${isActive ? 'active' : ''}" onclick="event.stopPropagation(); currentLocationId='${loc.id}'; showEquipmentDetail('${eq.id}')">
                        <i class="fas fa-microchip"></i>
                        <span>${eq.inventoryNumber}</span>
                        <span class="status-dot ${statusClass}"></span>
                    </div>
                `;
            });
            html += '</div>';
        }
    });

    html += '</div></div>';
    container.innerHTML = html;
}

function getStatusDotClass(status) {
    switch(status) {
        case 'Na servisu': return 'service';
        case 'Neispravna': return 'broken';
        case 'Povučena': return 'retired';
        default: return 'active';
    }
}

// ===== SEARCH & FILTER =====
function performSearch(query) {
    const clearBtn = document.getElementById('clearSearchBtn');
    const resultsDiv = document.getElementById('searchResults');
    const resultsList = document.getElementById('searchResultsList');

    if (!query || query.length < 2) {
        clearBtn.style.display = 'none';
        resultsDiv.style.display = 'none';
        return;
    }

    clearBtn.style.display = 'block';
    const q = query.toLowerCase();
    const results = [];

    // Search locations
    appData.locations.forEach(loc => {
        if (loc.name.toLowerCase().includes(q) ||
            (loc.description && loc.description.toLowerCase().includes(q))) {
            results.push({
                type: 'location',
                id: loc.id,
                title: loc.name,
                subtitle: `Koordinate: ${loc.latitude}, ${loc.longitude}`,
                icon: 'fa-map-marker-alt'
            });
        }

        // Search equipment - partial matching on all fields
        (loc.equipment || []).forEach(eq => {
            if (eq.inventoryNumber.toLowerCase().includes(q) ||
                eq.type.toLowerCase().includes(q) ||
                (eq.ip && eq.ip.toLowerCase().includes(q)) ||
                (eq.mac && eq.mac.toLowerCase().includes(q)) ||
                (eq.installer && eq.installer.toLowerCase().includes(q)) ||
                (eq.manufacturer && eq.manufacturer.toLowerCase().includes(q)) ||
                (eq.model && eq.model.toLowerCase().includes(q)) ||
                (eq.serial_number && eq.serial_number.toLowerCase().includes(q)) ||
                (eq.sub_location && eq.sub_location.toLowerCase().includes(q)) ||
                (eq.notes && eq.notes.toLowerCase().includes(q))) {
                results.push({
                    type: 'equipment',
                    id: eq.id,
                    locationId: loc.id,
                    title: `${eq.type} - ${eq.inventoryNumber}`,
                    subtitle: `Lokacija: ${loc.name}`,
                    icon: 'fa-microchip',
                    status: eq.status || 'Aktivna'
                });
            }
        });
    });

    if (results.length === 0) {
        resultsList.innerHTML = '<p class="no-data">Nema rezultata pretrage</p>';
    } else {
        resultsList.innerHTML = results.map(r => `
            <div class="search-result-item" onclick="${r.type === 'location' ?
                `showLocationDetail('${r.id}')` :
                `currentLocationId='${r.locationId}'; showEquipmentDetail('${r.id}')`}; clearSearch();">
                <div class="search-result-icon">
                    <i class="fas ${r.icon}"></i>
                </div>
                <div class="search-result-info">
                    <div class="search-result-title">${r.title}</div>
                    <div class="search-result-subtitle">${r.subtitle}</div>
                </div>
                ${r.status ? `<span class="status-badge" data-status="${r.status}">${r.status}</span>` : ''}
            </div>
        `).join('');
    }

    resultsDiv.style.display = 'block';
}

function clearSearch() {
    document.getElementById('globalSearch').value = '';
    document.getElementById('clearSearchBtn').style.display = 'none';
    document.getElementById('searchResults').style.display = 'none';
}

function applyFilters() {
    const typeFilter = document.getElementById('filterType').value;
    const statusFilter = document.getElementById('filterStatus').value;
    const locationFilter = document.getElementById('filterLocation').value;

    if (!typeFilter && !statusFilter && !locationFilter) {
        clearSearch();
        return;
    }

    const results = [];

    appData.locations.forEach(loc => {
        if (locationFilter && loc.id !== locationFilter) return;

        (loc.equipment || []).forEach(eq => {
            if (typeFilter && eq.type !== typeFilter) return;
            if (statusFilter && (eq.status || 'Aktivna') !== statusFilter) return;

            results.push({
                type: 'equipment',
                id: eq.id,
                locationId: loc.id,
                title: `${eq.type} - ${eq.inventoryNumber}`,
                subtitle: `Lokacija: ${loc.name}`,
                icon: 'fa-microchip',
                status: eq.status || 'Aktivna'
            });
        });
    });

    const resultsList = document.getElementById('searchResultsList');
    const resultsDiv = document.getElementById('searchResults');

    if (results.length === 0) {
        resultsList.innerHTML = '<p class="no-data">Nema rezultata sa izabranim filterima</p>';
    } else {
        resultsList.innerHTML = results.map(r => `
            <div class="search-result-item" onclick="currentLocationId='${r.locationId}'; showEquipmentDetail('${r.id}'); clearFilters();">
                <div class="search-result-icon">
                    <i class="fas ${r.icon}"></i>
                </div>
                <div class="search-result-info">
                    <div class="search-result-title">${r.title}</div>
                    <div class="search-result-subtitle">${r.subtitle}</div>
                </div>
                <span class="status-badge" data-status="${r.status}">${r.status}</span>
            </div>
        `).join('');
    }

    resultsDiv.style.display = 'block';
}

function clearFilters() {
    document.getElementById('filterType').value = '';
    document.getElementById('filterStatus').value = '';
    document.getElementById('filterLocation').value = '';
    document.getElementById('searchResults').style.display = 'none';
}

function updateLocationFilter() {
    const select = document.getElementById('filterLocation');
    select.innerHTML = '<option value="">Sve lokacije</option>';
    appData.locations.forEach(loc => {
        select.innerHTML += `<option value="${loc.id}">${loc.name}</option>`;
    });
}

function filterLocationEquipment(query) {
    const statusFilter = document.getElementById('locationEquipmentStatus').value;
    renderEquipmentGrid(appData.locations.find(l => l.id === currentLocationId), query, statusFilter);
}

// ===== DASHBOARD RENDERING =====
function renderDashboard() {
    updateStatistics();
    renderEquipmentTypeList();
    renderWarrantyList();
    renderRecentEntries();
    renderLocationsGrid();
    updateLocationFilter();
}

function updateStatistics() {
    const totalLocations = appData.locations.length;
    let totalEquipment = 0;
    let activeEquipment = 0;
    let expiringWarranties = 0;
    let onServiceCount = 0;
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    appData.locations.forEach(loc => {
        (loc.equipment || []).forEach(eq => {
            totalEquipment++;
            const status = eq.status || 'Aktivna';
            if (status === 'Aktivna') activeEquipment++;
            if (status === 'Na servisu') onServiceCount++;

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
    document.getElementById('activeEquipment').textContent = activeEquipment;
    document.getElementById('expiringWarranties').textContent = expiringWarranties;
    document.getElementById('onServiceCount').textContent = onServiceCount;

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
                    locationName: loc.name,
                    equipmentId: eq.id,
                    locationId: loc.id
                });
            }
        });
    });

    warranties.sort((a, b) => a.date - b.date);
    const expiringSoon = warranties.filter(w => w.daysUntil <= 90).slice(0, 5);

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
            <div class="warranty-item" onclick="currentLocationId='${w.locationId}'; showEquipmentDetail('${w.equipmentId}')" style="cursor:pointer">
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
        // Location entries
        if (loc.createdAt) {
            entries.push({
                type: 'Lokacija dodana',
                name: loc.name,
                date: new Date(loc.createdAt),
                icon: 'fa-map-marker-alt',
                action: `showLocationDetail('${loc.id}')`
            });
        }

        // Equipment entries
        (loc.equipment || []).forEach(eq => {
            if (eq.createdAt) {
                entries.push({
                    type: 'Oprema dodana',
                    name: `${eq.type} - ${eq.inventoryNumber}`,
                    date: new Date(eq.createdAt),
                    icon: 'fa-plus-circle',
                    action: `currentLocationId='${loc.id}'; showEquipmentDetail('${eq.id}')`
                });
            }

            // History entries
            (eq.history || []).forEach(h => {
                entries.push({
                    type: h.action,
                    name: `${eq.type} - ${eq.inventoryNumber}`,
                    date: new Date(h.date),
                    icon: h.action.includes('Status') ? 'fa-exchange-alt' : 'fa-wrench',
                    action: `currentLocationId='${loc.id}'; showEquipmentDetail('${eq.id}')`
                });
            });
        });
    });

    entries.sort((a, b) => b.date - a.date);
    const recent = entries.slice(0, 5);

    if (recent.length === 0) {
        container.innerHTML = '<p class="no-data">Nema nedavnih aktivnosti</p>';
        return;
    }

    container.innerHTML = recent.map(e => `
        <div class="entry-item" onclick="${e.action}" style="cursor:pointer">
            <div>
                <span class="entry-name"><i class="fas ${e.icon}" style="color:var(--primary-green);margin-right:6px"></i>${e.name}</span>
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

    // Group equipment by sub-location
    const gentriEquipment = (location.equipment || []).filter(eq => eq.sub_location === 'Gentri');
    const ormarEquipment = (location.equipment || []).filter(eq => eq.sub_location === 'Ormar');

    // Update counts
    const gentriCountEl = document.getElementById('gentriCount');
    const ormarCountEl = document.getElementById('ormarCount');
    if (gentriCountEl) gentriCountEl.textContent = gentriEquipment.length;
    if (ormarCountEl) ormarCountEl.textContent = ormarEquipment.length;

    // Render equipment grids for each sub-location
    renderEquipmentGrid(location, '', '', 'equipmentGentriGrid', gentriEquipment);
    renderEquipmentGrid(location, '', '', 'equipmentOrmarGrid', ormarEquipment);
}

function renderEquipmentGrid(location, searchQuery = '', statusFilter = '', containerId = 'equipmentGrid', equipmentArray = null) {
    const container = document.getElementById(containerId);
    let equipment = equipmentArray !== null ? equipmentArray : (location.equipment || []);

    // Apply filters
    if (searchQuery) {
        const q = searchQuery.toLowerCase();
        equipment = equipment.filter(eq =>
            eq.inventoryNumber.toLowerCase().includes(q) ||
            eq.type.toLowerCase().includes(q) ||
            (eq.ip && eq.ip.includes(q))
        );
    }

    if (statusFilter) {
        equipment = equipment.filter(eq => (eq.status || 'Aktivna') === statusFilter);
    }

    if (equipment.length === 0) {
        container.innerHTML = '<p class="no-data">Nema opreme koja odgovara kriterijumima.</p>';
        return;
    }

    container.innerHTML = equipment.map(eq => {
        const imageHtml = eq.photo
            ? `<img src="${eq.photo}" alt="${eq.type}">`
            : `<div class="no-image"><i class="fas fa-microchip"></i></div>`;

        const status = eq.status || 'Aktivna';
        const statusClass = getStatusDotClass(status);

        return `
            <div class="equipment-card" onclick="showEquipmentDetail('${eq.id}')" style="position:relative">
                <div class="status-indicator-dot" style="background:var(--${statusClass === 'active' ? 'success' : statusClass === 'service' ? 'warning' : statusClass === 'broken' ? 'danger' : 'text-muted'})"></div>
                <div class="equipment-card-image">
                    ${imageHtml}
                </div>
                <div class="equipment-card-content">
                    <span class="equipment-card-type">${eq.type}</span>
                    <h4 class="equipment-card-inventory">${eq.inventoryNumber}</h4>
                    <div class="equipment-card-info">
                        ${eq.ip ? `<span><i class="fas fa-network-wired"></i> ${eq.ip}</span>` : ''}
                        ${eq.installDate ? `<span><i class="fas fa-calendar"></i> ${formatDate(new Date(eq.installDate))}</span>` : ''}
                        <span><i class="fas fa-circle" style="color:var(--${statusClass === 'active' ? 'success' : statusClass === 'service' ? 'warning' : statusClass === 'broken' ? 'danger' : 'text-muted'});font-size:8px"></i> ${status}</span>
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

    const status = equipment.status || 'Aktivna';

    document.getElementById('equipmentTitle').textContent = `${equipment.type} - ${equipment.inventoryNumber}`;

    // Status badge
    const statusBadge = document.getElementById('eqStatusBadge');
    statusBadge.textContent = status;
    statusBadge.setAttribute('data-status', status);

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
    document.getElementById('eqStatus').textContent = status;
    document.getElementById('eqSubLocation').textContent = equipment.sub_location || '-';
    document.getElementById('eqManufacturer').textContent = equipment.manufacturer || '-';
    document.getElementById('eqModel').textContent = equipment.model || '-';
    document.getElementById('eqSerialNumber').textContent = equipment.serial_number || '-';
    document.getElementById('eqIP').textContent = equipment.ip || '-';
    document.getElementById('eqMAC').textContent = equipment.mac || '-';
    document.getElementById('eqX').textContent = equipment.x !== undefined && equipment.x !== null ? `${equipment.x} cm` : '-';
    document.getElementById('eqY').textContent = equipment.y !== undefined && equipment.y !== null ? `${equipment.y} cm` : '-';
    document.getElementById('eqZ').textContent = equipment.z !== undefined && equipment.z !== null ? `${equipment.z} cm` : '-';
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

    // Maintenance
    renderMaintenanceInfo(equipment);

    // Documents
    renderDocumentsList(equipment);

    // History
    renderHistoryLog(equipment);
}

function renderMaintenanceInfo(equipment) {
    const container = document.getElementById('maintenanceInfo');
    const maintenance = equipment.maintenance || [];

    if (maintenance.length === 0) {
        container.innerHTML = '<p class="no-data">Nema servisnih zapisa</p>';
        return;
    }

    // Sort by date descending
    const sorted = [...maintenance].sort((a, b) => new Date(b.date) - new Date(a.date));

    container.innerHTML = sorted.slice(0, 3).map(m => `
        <div class="maintenance-item">
            <div class="maintenance-header">
                <span class="maintenance-type">${m.type}</span>
                <span class="maintenance-date">${formatDate(new Date(m.date))}</span>
            </div>
            <div class="maintenance-description">${m.description || '-'}</div>
            <div class="maintenance-tech"><i class="fas fa-user"></i> ${m.technician || 'Nepoznato'}</div>
        </div>
    `).join('');
}

function renderHistoryLog(equipment) {
    const container = document.getElementById('historyLog');
    const history = equipment.history || [];

    if (history.length === 0) {
        container.innerHTML = '<p class="no-data">Nema zabeleženih promena</p>';
        return;
    }

    // Sort by date descending
    const sorted = [...history].sort((a, b) => new Date(b.date) - new Date(a.date));

    container.innerHTML = sorted.map(h => {
        let iconClass = 'fa-edit';
        let itemClass = '';

        if (h.action.includes('Status')) {
            iconClass = 'fa-exchange-alt';
            itemClass = 'status-change';
        } else if (h.action.includes('Servis')) {
            iconClass = 'fa-wrench';
            itemClass = 'maintenance';
        } else if (h.action.includes('Kreiran')) {
            iconClass = 'fa-plus-circle';
        }

        return `
            <div class="history-item ${itemClass}">
                <div class="history-icon">
                    <i class="fas ${iconClass}"></i>
                </div>
                <div class="history-content">
                    <div class="history-title">${h.action}</div>
                    ${h.details ? `<div class="history-details">${h.details}</div>` : ''}
                    <div class="history-date">${formatDateTime(new Date(h.date))}</div>
                </div>
            </div>
        `;
    }).join('');
}

async function renderDocumentsList(equipment) {
    const container = document.getElementById('documentsList');

    // Specific documents (from equipment.documents)
    const specificDocs = equipment.documents || [];

    // Shared documents (from type_shared_documents table) - fetch from Supabase
    let sharedDocs = [];
    try {
        if (typeof supabase !== 'undefined' && equipment.type) {
            const { data, error } = await supabase
                .from('type_shared_documents')
                .select('*')
                .eq('equipment_type', equipment.type)
                .order('uploaded_at', { ascending: false });

            if (!error && data) {
                sharedDocs = data;
            }
        }
    } catch (e) {
        console.warn('Could not fetch shared documents:', e);
    }

    let html = '';

    // Specific documents section
    html += `
        <div class="docs-section">
            <h5><i class="fas fa-file-alt"></i> Specifična Dokumentacija</h5>
            ${specificDocs.length === 0
                ? '<p class="no-data">Nema specifične dokumentacije</p>'
                : specificDocs.map((doc, index) => renderSpecificDocumentItem(doc, index)).join('')
            }
        </div>
    `;

    // Shared documents section
    html += `
        <div class="docs-section shared-docs">
            <h5><i class="fas fa-share-alt"></i> Opšta Dokumentacija (${equipment.type})</h5>
            ${sharedDocs.length === 0
                ? '<p class="no-data">Nema opšte dokumentacije</p>'
                : sharedDocs.map((doc) => renderSharedDocumentItem(doc)).join('')
            }
        </div>
    `;

    container.innerHTML = html;
}

function renderSpecificDocumentItem(doc, index) {
    // Determine icon based on file type
    let icon = 'fa-file';
    const isPDF = doc.type === 'application/pdf' || doc.name.toLowerCase().endsWith('.pdf');
    const isImage = doc.type && doc.type.startsWith('image/');

    if (isPDF) {
        icon = 'fa-file-pdf';
    } else if (isImage) {
        icon = 'fa-file-image';
    }

    // Create preview content based on file type
    let previewContent = '';
    if (isPDF) {
        previewContent = `<embed src="${doc.data}" type="application/pdf" class="preview-pdf-embed">`;
    } else if (isImage) {
        previewContent = `<img src="${doc.data}" alt="${doc.name}" class="preview-image-embed">`;
    } else {
        previewContent = `<p class="no-preview">Pregled nije dostupan za ovaj tip fajla</p>`;
    }

    return `
        <div class="document-item specific">
            <span class="document-name">
                <i class="fas ${icon}"></i>
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

            <!-- Hover Preview -->
            <div class="document-hover-preview">
                <div class="preview-header">
                    <div>
                        <h4>${doc.name}</h4>
                        <span class="file-size">${formatFileSize(doc.data)}</span>
                    </div>
                    <button class="btn-icon-tiny" onclick="event.stopPropagation()" title="Zatvori se na klik van pregleda">
                        <i class="fas fa-info-circle"></i>
                    </button>
                </div>
                <div class="preview-content">
                    ${previewContent}
                </div>
            </div>
        </div>
    `;
}

function renderSharedDocumentItem(doc) {
    return `
        <div class="document-item shared">
            <span class="document-name">
                <i class="fas fa-file-pdf"></i>
                ${doc.name}
                <span class="badge-shared">Opšta</span>
            </span>
            <div class="document-actions">
                <a href="${doc.file_url}" target="_blank" class="btn btn-icon btn-small" title="Otvori">
                    <i class="fas fa-external-link-alt"></i>
                </a>
            </div>
        </div>
    `;
}

// ===== QR CODE =====
function generateEquipmentQR() {
    const location = appData.locations.find(l => l.id === currentLocationId);
    if (!location) return;

    const equipment = (location.equipment || []).find(e => e.id === currentEquipmentId);
    if (!equipment) return;

    // Small QR preview
    const smallContainer = document.getElementById('equipmentQRSmall');
    smallContainer.innerHTML = '';

    // Generate URL that opens equipment report using new router format
    const baseUrl = window.location.origin + window.location.pathname;
    const qrUrl = `${baseUrl}#/report/equipment/${equipment.id}`;

    qrCodeSmallInstance = new QRCode(smallContainer, {
        text: qrUrl,
        width: 100,
        height: 100,
        colorDark: '#000000',
        colorLight: '#ffffff',
        logo: 'images/mlff-logo.svg',
        logoWidth: 30,
        logoHeight: 30,
        logoBackgroundColor: '#ffffff',
        logoBackgroundTransparent: false,
        correctLevel: QRCode.CorrectLevel.H // High error correction for logo overlay
    });
}

function showQRModal() {
    const location = appData.locations.find(l => l.id === currentLocationId);
    if (!location) return;

    const equipment = (location.equipment || []).find(e => e.id === currentEquipmentId);
    if (!equipment) return;

    // Update label info
    document.getElementById('qrInvNumber').textContent = equipment.inventoryNumber;
    document.getElementById('qrType').textContent = equipment.type;
    document.getElementById('qrLocation').textContent = location.name;
    document.getElementById('qrGPS').textContent = `${location.latitude}, ${location.longitude}`;

    // Generate large QR with URL
    const largeContainer = document.getElementById('qrCodeLarge');
    largeContainer.innerHTML = '';

    // Generate URL that opens equipment report using new router format
    const baseUrl = window.location.origin + window.location.pathname;
    const qrUrl = `${baseUrl}#/report/equipment/${equipment.id}`;

    qrCodeInstance = new QRCode(largeContainer, {
        text: qrUrl,
        width: 150,
        height: 150,
        colorDark: '#000000',
        colorLight: '#ffffff',
        logo: 'images/mlff-logo.svg',
        logoWidth: 45,
        logoHeight: 45,
        logoBackgroundColor: '#ffffff',
        logoBackgroundTransparent: false,
        correctLevel: QRCode.CorrectLevel.H // High error correction for logo overlay
    });

    openModal('qrModal');
}

function printQRLabel() {
    const labelContent = document.getElementById('qrLabelPreview').outerHTML;
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <html>
        <head>
            <title>QR Naljepnica</title>
            <style>
                body { font-family: Arial, sans-serif; padding: 20px; }
                .qr-label-preview { max-width: 350px; margin: 0 auto; border: 1px solid #ddd; }
                .qr-label-header { background: linear-gradient(135deg, #00cc6a 0%, #00ff88 100%); color: #000; padding: 10px; font-weight: 700; text-align: center; }
                .qr-label-body { display: flex; gap: 20px; padding: 15px; align-items: center; }
                .qr-label-info { text-align: left; font-size: 14px; }
                .qr-info-row { margin-bottom: 6px; }
                .qr-info-row strong { color: #00aa55; }
                .qr-label-footer { background: #f0f0f0; padding: 8px; text-align: center; font-size: 11px; color: #666; }
            </style>
        </head>
        <body>${labelContent}</body>
        </html>
    `);
    printWindow.document.close();
    printWindow.print();
}

function downloadQRImage() {
    const canvas = document.querySelector('#qrCodeLarge canvas');
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = `qr_${currentEquipmentId}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
}

// ===== LOCATION CRUD =====
function showAddLocationModal() {
    document.getElementById('locationModalTitle').textContent = 'Dodaj Lokaciju';
    document.getElementById('locationForm').reset();
    document.getElementById('locationId').value = '';
    document.getElementById('locPhotoPreview').innerHTML = '';
    document.getElementById('locName').placeholder = 'Npr. Naplatni portal 01';
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
            const location = appData.locations.find(l => l.id === id);
            if (location) {
                location.name = name;
                location.latitude = latitude;
                location.longitude = longitude;
                location.description = description;
                if (photo) location.photo = photo;
            }
        } else {
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
        renderStructureTree();
        updateLocationFilter();

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
    document.getElementById('eqFormStatus').value = 'Aktivna';
    document.getElementById('eqPhotoPreview').innerHTML = '';
    document.getElementById('eqDocsPreview').innerHTML = '';
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
    document.getElementById('eqFormStatus').value = equipment.status || 'Aktivna';
    document.getElementById('eqFormSubLocation').value = equipment.sub_location || '';
    document.getElementById('eqFormManufacturer').value = equipment.manufacturer || '';
    document.getElementById('eqFormModel').value = equipment.model || '';
    document.getElementById('eqFormSerialNumber').value = equipment.serial_number || '';
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

    // Display existing documents in preview
    const docsPreview = document.getElementById('eqDocsPreview');
    const existingDocs = equipment.documents || [];
    if (existingDocs.length > 0) {
        const docsPreviewHtml = existingDocs.map((doc, index) => `
            <div class="doc-preview-item existing-doc" data-doc-index="${index}">
                <i class="fas fa-file-pdf"></i>
                <span>${doc.name}</span>
                <span class="file-size">${formatFileSize(doc.data)}</span>
                <button type="button" class="btn-icon-tiny" onclick="removeExistingDoc(event, ${index})" title="Ukloni">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `).join('');
        docsPreview.innerHTML = `<div class="docs-preview-list existing-docs">${docsPreviewHtml}</div>`;
    } else {
        docsPreview.innerHTML = '';
    }

    openModal('equipmentModal');
}

function editCurrentEquipment() {
    editEquipment(currentEquipmentId);
}

function removeExistingDoc(event, index) {
    event.preventDefault();
    const docItem = event.target.closest('.doc-preview-item');
    if (docItem) {
        docItem.classList.add('marked-for-removal');
        docItem.style.opacity = '0.5';
        docItem.style.textDecoration = 'line-through';
    }
}

function removeNewDoc(event, index) {
    event.preventDefault();
    const docsInput = document.getElementById('eqFormDocs');
    if (docsInput && docsInput.files.length > 0) {
        // Create a new FileList without the removed file
        const dt = new DataTransfer();
        Array.from(docsInput.files).forEach((file, i) => {
            if (i !== index) {
                dt.items.add(file);
            }
        });
        docsInput.files = dt.files;

        // Re-trigger preview update
        previewDocuments({ target: docsInput });
    }
}

function saveEquipment(event) {
    event.preventDefault();

    const id = document.getElementById('equipmentId').value;
    const locationId = document.getElementById('equipmentLocationId').value;
    const location = appData.locations.find(l => l.id === locationId);
    if (!location) return;

    if (!location.equipment) location.equipment = [];

    const type = document.getElementById('eqFormType').value.trim();

    // Save custom type if it's new
    if (type && !DEFAULT_EQUIPMENT_TYPES.includes(type)) {
        saveCustomType(type);
    }

    const inventoryNumber = document.getElementById('eqFormInventory').value.trim();
    const status = document.getElementById('eqFormStatus').value;
    const subLocation = document.getElementById('eqFormSubLocation').value || null;
    const manufacturer = document.getElementById('eqFormManufacturer').value.trim() || null;
    const model = document.getElementById('eqFormModel').value.trim() || null;
    const serialNumber = document.getElementById('eqFormSerialNumber').value.trim() || null;
    const ip = document.getElementById('eqFormIP').value.trim();
    const mac = document.getElementById('eqFormMAC').value.trim();

    // Validate that type matches sub-location
    if (subLocation) {
        const validTypes = SUB_LOCATION_EQUIPMENT_TYPES[subLocation];
        if (!validTypes || !validTypes.includes(type)) {
            alert(`Tip opreme "${type}" nije dozvoljen za pod-lokaciju "${subLocation}".\n\nDozvoljeni tipovi za ${subLocation}: ${validTypes ? validTypes.join(', ') : 'nepoznato'}`);
            return;
        }
    }
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

    // Collect existing documents that should be kept (not marked for removal)
    const existingDocsToKeep = [];
    if (id) {
        const location = appData.locations.find(l => l.id === locationId);
        const equipment = (location?.equipment || []).find(e => e.id === id);
        if (equipment && equipment.documents) {
            document.querySelectorAll('.existing-doc').forEach(el => {
                if (!el.classList.contains('marked-for-removal')) {
                    const index = parseInt(el.dataset.docIndex);
                    if (equipment.documents[index]) {
                        existingDocsToKeep.push(equipment.documents[index]);
                    }
                }
            });
        }
    }

    // Handle document uploads
    const docsInput = document.getElementById('eqFormDocs');
    let docsPromise = Promise.resolve([]);

    if (docsInput && docsInput.files.length > 0) {
        // Validate files before processing
        const validationErrors = validateFiles(docsInput.files);
        if (validationErrors.length > 0) {
            alert('Greške pri upload-u:\n' + validationErrors.join('\n'));
            return;
        }

        const docPromises = Array.from(docsInput.files).map(file => {
            return fileToBase64(file).then(data => ({
                name: file.name,
                type: file.type,
                data
            }));
        });
        docsPromise = Promise.all(docPromises);
    }

    Promise.all([photoPromise, docsPromise]).then(([photo, newDocs]) => {
        if (id) {
            const equipment = location.equipment.find(e => e.id === id);
            if (equipment) {
                // Track changes with old/new values for enhanced audit
                const changes = [];
                const fieldChanges = []; // Store detailed change tracking

                if (equipment.status !== status) {
                    changes.push(`Status: ${equipment.status || 'Aktivna'} → ${status}`);
                    fieldChanges.push({
                        field_name: 'status',
                        old_value: equipment.status || 'Aktivna',
                        new_value: status
                    });
                }

                // Track other important field changes
                if (equipment.type !== type) {
                    fieldChanges.push({ field_name: 'type', old_value: equipment.type, new_value: type });
                }
                if (equipment.ip !== ip) {
                    fieldChanges.push({ field_name: 'ip_address', old_value: equipment.ip, new_value: ip });
                }
                if (equipment.sub_location !== subLocation) {
                    fieldChanges.push({ field_name: 'sub_location', old_value: equipment.sub_location, new_value: subLocation });
                }

                equipment.type = type;
                equipment.inventoryNumber = inventoryNumber;
                equipment.status = status;
                equipment.sub_location = subLocation;
                equipment.manufacturer = manufacturer;
                equipment.model = model;
                equipment.serial_number = serialNumber;
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

                // Update documents: combine kept existing + new documents
                equipment.documents = [...existingDocsToKeep, ...newDocs];

                // Track document changes
                const oldDocCount = equipment.documents?.length || 0;
                const newDocCount = equipment.documents.length;
                if (oldDocCount !== newDocCount) {
                    changes.push(`Dokumenta: ${oldDocCount} → ${newDocCount}`);
                }

                // Add to history with enhanced tracking
                if (changes.length > 0 || fieldChanges.length > 0) {
                    if (!equipment.history) equipment.history = [];
                    equipment.history.push({
                        date: new Date().toISOString(),
                        action: 'Izmena podataka',
                        details: changes.join(', '),
                        // Enhanced audit trail fields
                        field_changes: fieldChanges.length > 0 ? fieldChanges : undefined
                    });
                }
            }
        } else {
            const newEquipment = {
                id: generateId(),
                type,
                inventoryNumber,
                status,
                sub_location: subLocation,
                manufacturer,
                model,
                serial_number: serialNumber,
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
                documents: newDocs.length > 0 ? newDocs : [],
                maintenance: [],
                history: [{
                    date: new Date().toISOString(),
                    action: 'Oprema kreirana',
                    details: `${type} - ${inventoryNumber}`
                }],
                createdAt: new Date().toISOString()
            };
            location.equipment.push(newEquipment);
        }

        saveData();
        closeModal('equipmentModal');
        renderLocationDetail();
        renderStructureTree();

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

// ===== STATUS CHANGE =====
function showChangeStatusModal() {
    const location = appData.locations.find(l => l.id === currentLocationId);
    if (!location) return;

    const equipment = (location.equipment || []).find(e => e.id === currentEquipmentId);
    if (!equipment) return;

    document.getElementById('newStatus').value = equipment.status || 'Aktivna';
    document.getElementById('statusReason').value = '';
    openModal('statusModal');
}

function changeEquipmentStatus(event) {
    event.preventDefault();

    const location = appData.locations.find(l => l.id === currentLocationId);
    if (!location) return;

    const equipment = (location.equipment || []).find(e => e.id === currentEquipmentId);
    if (!equipment) return;

    const newStatus = document.getElementById('newStatus').value;
    const reason = document.getElementById('statusReason').value.trim();
    const oldStatus = equipment.status || 'Aktivna';

    if (newStatus !== oldStatus) {
        equipment.status = newStatus;

        if (!equipment.history) equipment.history = [];
        equipment.history.push({
            date: new Date().toISOString(),
            action: `Status promenjen: ${oldStatus} → ${newStatus}`,
            details: reason || 'Bez dodatnog objašnjenja'
        });

        saveData();
    }

    closeModal('statusModal');
    renderEquipmentDetail();
    renderStructureTree();
}

// ===== MAINTENANCE =====
function showAddMaintenanceModal() {
    document.getElementById('maintenanceForm').reset();
    document.getElementById('maintDate').value = new Date().toISOString().split('T')[0];
    openModal('maintenanceModal');
}

function addMaintenanceRecord(event) {
    event.preventDefault();

    const location = appData.locations.find(l => l.id === currentLocationId);
    if (!location) return;

    const equipment = (location.equipment || []).find(e => e.id === currentEquipmentId);
    if (!equipment) return;

    if (!equipment.maintenance) equipment.maintenance = [];
    if (!equipment.history) equipment.history = [];

    const record = {
        id: generateId(),
        type: document.getElementById('maintType').value,
        date: document.getElementById('maintDate').value,
        technician: document.getElementById('maintTechnician').value.trim(),
        description: document.getElementById('maintDescription').value.trim(),
        cost: document.getElementById('maintCost').value ? parseFloat(document.getElementById('maintCost').value) : null,
        nextDate: document.getElementById('maintNextDate').value || null
    };

    equipment.maintenance.push(record);

    equipment.history.push({
        date: new Date().toISOString(),
        action: `Servis: ${record.type}`,
        details: record.description || `Serviser: ${record.technician || 'Nepoznato'}`
    });

    saveData();
    closeModal('maintenanceModal');
    renderEquipmentDetail();
}

// ===== DOCUMENT MANAGEMENT =====
function uploadDocuments(event) {
    const files = event.target.files;
    if (!files.length) return;

    const location = appData.locations.find(l => l.id === currentLocationId);
    if (!location) {
        alert('Greška: Lokacija nije pronađena');
        event.target.value = '';
        return;
    }

    const equipment = (location.equipment || []).find(e => e.id === currentEquipmentId);
    if (!equipment) {
        alert('Greška: Oprema nije pronađena');
        event.target.value = '';
        return;
    }

    // Validate files before upload
    const validationErrors = validateFiles(files);
    if (validationErrors.length > 0) {
        alert('Greške pri odabiru fajlova:\n' + validationErrors.join('\n'));
        event.target.value = '';
        return;
    }

    if (!equipment.documents) equipment.documents = [];

    const fileCount = files.length;
    const isBulkUpload = fileCount > 3;

    // Show progress for bulk uploads
    if (isBulkUpload) {
        showUploadProgress(fileCount);
    }

    let uploadedCount = 0;

    const promises = Array.from(files).map((file, index) => {
        return fileToBase64(file).then(data => {
            uploadedCount++;
            if (isBulkUpload) {
                updateUploadProgress(uploadedCount, fileCount);
            }
            return {
                name: file.name,
                type: file.type,
                data
            };
        }).catch(error => {
            console.error(`Error uploading ${file.name}:`, error);
            return null; // Return null for failed uploads
        });
    });

    Promise.all(promises).then(docs => {
        // Filter out failed uploads
        const successfulDocs = docs.filter(doc => doc !== null);
        const failedCount = fileCount - successfulDocs.length;

        equipment.documents.push(...successfulDocs);

        // Add to history
        if (!equipment.history) equipment.history = [];
        equipment.history.push({
            date: new Date().toISOString(),
            action: 'Dodati dokumenti',
            details: `${successfulDocs.length} dokumenata uploadovano${failedCount > 0 ? ` (${failedCount} neuspešno)` : ''}`
        });

        saveData();
        renderDocumentsList(equipment);

        if (isBulkUpload) {
            hideUploadProgress();
        }

        // Show success/error message
        if (failedCount > 0) {
            alert(`Upload završen: ${successfulDocs.length} uspešno, ${failedCount} neuspešno`);
        } else if (successfulDocs.length > 1) {
            alert(`Uspešno uploadovano ${successfulDocs.length} dokumenata!`);
        }
    }).catch(error => {
        console.error('Upload error:', error);
        alert('Greška pri upload-u dokumenata: ' + error.message);
        if (isBulkUpload) {
            hideUploadProgress();
        }
    });

    event.target.value = '';
}

function downloadDocument(index) {
    const location = appData.locations.find(l => l.id === currentLocationId);
    if (!location) {
        alert('Greška: Lokacija nije pronađena');
        return;
    }

    const equipment = (location.equipment || []).find(e => e.id === currentEquipmentId);
    if (!equipment) {
        alert('Greška: Oprema nije pronađena');
        return;
    }

    if (!equipment.documents || !equipment.documents[index]) {
        alert('Greška: Dokument nije pronađen');
        return;
    }

    const doc = equipment.documents[index];

    try {
        const link = document.createElement('a');
        link.href = doc.data;
        link.download = doc.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } catch (error) {
        console.error('Download error:', error);
        alert('Greška pri preuzimanju dokumenta: ' + error.message);
    }
}

function deleteDocument(index) {
    const location = appData.locations.find(l => l.id === currentLocationId);
    if (!location) {
        alert('Greška: Lokacija nije pronađena');
        return;
    }

    const equipment = (location.equipment || []).find(e => e.id === currentEquipmentId);
    if (!equipment) {
        alert('Greška: Oprema nije pronađena');
        return;
    }

    if (!equipment.documents || !equipment.documents[index]) {
        alert('Greška: Dokument nije pronađen');
        return;
    }

    const docName = equipment.documents[index].name;

    showConfirm(
        'Brisanje Dokumenta',
        `Da li ste sigurni da želite da obrišete dokument "${docName}"?`,
        () => {
            equipment.documents.splice(index, 1);

            // Add to history
            if (!equipment.history) equipment.history = [];
            equipment.history.push({
                date: new Date().toISOString(),
                action: 'Dokument obrisan',
                details: docName
            });

            saveData();
            renderDocumentsList(equipment);
        }
    );
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
    const status = equipment.status || 'Aktivna';
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
            <div class="print-logo"><span style="color:#a855f7;">Orion</span> <span>E-mobility</span></div>
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
                    <span class="print-info-label">Status</span>
                    <span class="print-info-value">${status}</span>
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
                <td>${eq.status || 'Aktivna'}</td>
                <td>${eq.ip || '-'}</td>
                <td>${eq.installDate ? formatDate(new Date(eq.installDate)) : '-'}</td>
                <td>${eq.installer || '-'}</td>
                <td>${eq.warrantyDate ? formatDate(new Date(eq.warrantyDate)) : '-'}</td>
            </tr>
        `).join('');
    }

    return `
        <div class="print-header">
            <div class="print-logo"><span style="color:#a855f7;">Orion</span> <span>E-mobility</span></div>
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
                            <th>Status</th>
                            <th>IP</th>
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
    `;
}

function showPrintModal(content) {
    document.getElementById('printContent').innerHTML = content;
    openModal('printModal');
}

// ===== EXPORT/IMPORT =====
function exportData() {
    appData.lastBackup = new Date().toISOString();
    saveData();

    const dataStr = JSON.stringify(appData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `mlff_equipment_backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);

    updateDataStatus();
    hideBackupToast();
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
                        renderStructureTree();
                        updateLocationFilter();
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

function previewDocuments(event) {
    const files = event.target.files;
    const preview = document.getElementById('eqDocsPreview');

    // Preserve existing documents HTML
    const existingDocsHtml = preview.querySelector('.existing-docs')?.outerHTML || '';

    if (!files.length) {
        // Keep existing docs if no new files selected
        preview.innerHTML = existingDocsHtml;
        return;
    }

    // Validate files before preview
    const validationErrors = validateFiles(files);
    if (validationErrors.length > 0) {
        alert('Greške pri odabiru fajlova:\n' + validationErrors.join('\n'));
        event.target.value = ''; // Clear invalid files
        preview.innerHTML = existingDocsHtml;
        return;
    }

    // Preview new files
    const newFileList = Array.from(files).map((file, index) => `
        <div class="doc-preview-item new-doc" data-file-index="${index}">
            <i class="fas fa-file-pdf"></i>
            <span>${file.name}</span>
            <span class="file-size">${formatFileSize(file.size)}</span>
            <button type="button" class="btn-icon-tiny" onclick="removeNewDoc(event, ${index})" title="Ukloni">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `).join('');

    // Combine existing + new documents
    preview.innerHTML = existingDocsHtml +
        (newFileList ? `<div class="docs-preview-list new-docs">${newFileList}</div>` : '');
}

function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// File validation functions
function validateFile(file) {
    const errors = [];

    // Check file type
    const isValidType = ALLOWED_FILE_TYPES.includes(file.type) ||
                       ALLOWED_FILE_EXTENSIONS.some(ext => file.name.toLowerCase().endsWith(ext));

    if (!isValidType) {
        errors.push(`${file.name}: Samo PDF fajlovi su dozvoljeni`);
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
        const maxSizeMB = (MAX_FILE_SIZE / (1024 * 1024)).toFixed(0);
        errors.push(`${file.name}: Fajl prevelik (max ${maxSizeMB}MB)`);
    }

    // Check if file is not empty
    if (file.size === 0) {
        errors.push(`${file.name}: Fajl je prazan`);
    }

    return errors;
}

function validateFiles(files) {
    const allErrors = [];
    Array.from(files).forEach(file => {
        const errors = validateFile(file);
        allErrors.push(...errors);
    });
    return allErrors;
}

function formatFileSize(sizeInBytes) {
    if (typeof sizeInBytes === 'string') {
        // Estimate size from base64 string
        sizeInBytes = sizeInBytes.length * 0.75;
    }

    if (sizeInBytes < 1024) {
        return sizeInBytes.toFixed(0) + ' B';
    } else if (sizeInBytes < 1024 * 1024) {
        return (sizeInBytes / 1024).toFixed(1) + ' KB';
    } else {
        return (sizeInBytes / (1024 * 1024)).toFixed(1) + ' MB';
    }
}

// Upload progress modal functions
function showUploadProgress(totalFiles) {
    const progressHtml = `
        <div id="uploadProgressModal" class="upload-progress-modal">
            <div class="progress-content">
                <h3><i class="fas fa-cloud-upload-alt"></i> Upload u toku...</h3>
                <div class="progress-bar-container">
                    <div id="uploadProgressBar" class="progress-bar" style="width: 0%"></div>
                </div>
                <p id="uploadProgressText">Uploadujem 0 / ${totalFiles} dokumenata</p>
            </div>
        </div>
    `;

    // Remove existing progress modal if any
    const existing = document.getElementById('uploadProgressModal');
    if (existing) existing.remove();

    document.body.insertAdjacentHTML('beforeend', progressHtml);
}

function updateUploadProgress(current, total) {
    const progressBar = document.getElementById('uploadProgressBar');
    const progressText = document.getElementById('uploadProgressText');

    if (progressBar && progressText) {
        const percentage = Math.round((current / total) * 100);
        progressBar.style.width = percentage + '%';
        progressText.textContent = `Uploadujem ${current} / ${total} dokumenata`;
    }
}

function hideUploadProgress() {
    const modal = document.getElementById('uploadProgressModal');
    if (modal) {
        setTimeout(() => modal.remove(), 500);
    }
}

function formatDate(date) {
    if (!date || isNaN(date.getTime())) return '-';
    return date.toLocaleDateString('sr-RS', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

function formatDateTime(date) {
    if (!date || isNaN(date.getTime())) return '-';
    return date.toLocaleDateString('sr-RS', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
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

// ===== SETTINGS MANAGEMENT =====
function loadSettings() {
    const stored = localStorage.getItem(SETTINGS_KEY);
    if (stored) {
        try {
            appSettings = JSON.parse(stored);
        } catch (e) {
            console.error('Error loading settings:', e);
            appSettings = { dontShowWelcome: false, sidebarOpen: false };
        }
    }

    // Apply sidebar state
    if (appSettings.sidebarOpen) {
        document.getElementById('structureSidebar').classList.add('active');
    }
}

function saveSettings() {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(appSettings));
}

// ===== CUSTOM EQUIPMENT TYPES =====
function loadCustomTypes() {
    const stored = localStorage.getItem(CUSTOM_TYPES_KEY);
    if (stored) {
        try {
            customEquipmentTypes = JSON.parse(stored);
        } catch (e) {
            console.error('Error loading custom types:', e);
            customEquipmentTypes = [];
        }
    }
}

function saveCustomType(type) {
    if (!type || type.trim() === '') return;
    const trimmedType = type.trim();

    // Don't save if it's a default type or already in custom types
    if (DEFAULT_EQUIPMENT_TYPES.includes(trimmedType) || customEquipmentTypes.includes(trimmedType)) {
        return;
    }

    customEquipmentTypes.push(trimmedType);
    localStorage.setItem(CUSTOM_TYPES_KEY, JSON.stringify(customEquipmentTypes));
    populateEquipmentTypes();
}

function populateEquipmentTypes() {
    // Populate datalist
    const datalist = document.getElementById('equipmentTypesList');
    if (datalist) {
        const allTypes = [...DEFAULT_EQUIPMENT_TYPES, ...customEquipmentTypes].sort();
        datalist.innerHTML = allTypes.map(type => `<option value="${type}">`).join('');
    }

    // Populate filter dropdown
    const filterSelect = document.getElementById('filterType');
    if (filterSelect) {
        const allTypes = [...new Set([...DEFAULT_EQUIPMENT_TYPES, ...customEquipmentTypes])].sort();

        // Get all types currently in use
        const usedTypes = new Set();
        appData.locations.forEach(loc => {
            (loc.equipment || []).forEach(eq => {
                if (eq.type) usedTypes.add(eq.type);
            });
        });

        // Combine and sort all types
        const combinedTypes = [...new Set([...allTypes, ...usedTypes])].sort();

        filterSelect.innerHTML = '<option value="">Svi tipovi</option>' +
            combinedTypes.map(type => `<option value="${type}">${type}</option>`).join('');
    }
}

/**
 * Update equipment type dropdown based on selected sub-location
 */
function updateEquipmentTypeOptions() {
    const subLocationSelect = document.getElementById('eqFormSubLocation');
    const typeSelect = document.getElementById('eqFormType');
    const selectedSubLocation = subLocationSelect.value;

    typeSelect.innerHTML = '';

    if (!selectedSubLocation) {
        typeSelect.innerHTML = '<option value="">-- Prvo izaberite pod-lokaciju --</option>';
        typeSelect.disabled = true;
        return;
    }

    const validTypes = SUB_LOCATION_EQUIPMENT_TYPES[selectedSubLocation] || [];
    typeSelect.innerHTML = '<option value="">-- Izaberite tip opreme --</option>';
    validTypes.forEach(type => {
        typeSelect.innerHTML += `<option value="${type}">${type}</option>`;
    });

    typeSelect.disabled = false;
}

function setDontShowWelcome(value) {
    appSettings.dontShowWelcome = value;
    saveSettings();
}

// ===== HELP & WELCOME =====
function showHelpModal() {
    document.getElementById('dontShowAgain').checked = appSettings.dontShowWelcome;
    openModal('helpModal');
}

function checkShowWelcome() {
    if (!appSettings.dontShowWelcome && appData.locations.length === 0) {
        setTimeout(() => {
            showHelpModal();
        }, 500);
    }
}

// ===== DATA STATUS =====
function updateDataStatus() {
    const statusEl = document.getElementById('dataStatus');
    const statusTextEl = document.getElementById('dataStatusText');

    if (!appData.lastBackup) {
        statusEl.classList.add('warning');
        statusTextEl.textContent = 'Backup preporučen';
        return;
    }

    const lastBackup = new Date(appData.lastBackup);
    const now = new Date();
    const daysSinceBackup = Math.floor((now - lastBackup) / (1000 * 60 * 60 * 24));

    if (daysSinceBackup >= BACKUP_REMINDER_DAYS) {
        statusEl.classList.add('warning');
        statusTextEl.textContent = `Backup: pre ${daysSinceBackup} dana`;
    } else {
        statusEl.classList.remove('warning');
        statusTextEl.textContent = 'Podaci sačuvani';
    }
}

// ===== BACKUP REMINDER =====
function checkBackupReminder() {
    if (appData.locations.length === 0) return;

    if (!appData.lastBackup) {
        showBackupToast();
        return;
    }

    const lastBackup = new Date(appData.lastBackup);
    const now = new Date();
    const daysSinceBackup = Math.floor((now - lastBackup) / (1000 * 60 * 60 * 24));

    if (daysSinceBackup >= BACKUP_REMINDER_DAYS) {
        showBackupToast();
    }
}

function showBackupToast() {
    document.getElementById('backupToast').classList.add('active');
}

function hideBackupToast() {
    document.getElementById('backupToast').classList.remove('active');
}

// Placeholder functions for stat card clicks
function showStatusBreakdown() {
    document.getElementById('filterStatus').value = 'Aktivna';
    applyFilters();
}

function showExpiringWarranties() {
    // Scroll to warranty list
    document.getElementById('warrantyList').scrollIntoView({ behavior: 'smooth' });
}

// ===== MAP FUNCTIONALITY =====
function toggleMapView() {
    const mapView = document.getElementById('mapView');
    const mapToggleText = document.getElementById('mapToggleText');
    const locationsSection = document.querySelector('.locations-section');

    if (mapView.style.display === 'none') {
        mapView.style.display = 'block';
        mapToggleText.textContent = 'Sakrij Mapu';
        if (locationsSection) locationsSection.style.display = 'none';
        initializeMap();
    } else {
        mapView.style.display = 'none';
        mapToggleText.textContent = 'Prikaži Mapu';
        if (locationsSection) locationsSection.style.display = 'block';
    }
}

function initializeMap() {
    const mapContainer = document.getElementById('locationsMap');

    // If map already exists, destroy it
    if (mapInstance) {
        mapInstance.remove();
        mapInstance = null;
    }

    // Create new map
    if (appData.locations.length === 0) {
        mapContainer.innerHTML = '<div class="map-no-data"><i class="fas fa-map-marked-alt"></i><p>Nema lokacija za prikaz na mapi</p></div>';
        return;
    }

    mapContainer.innerHTML = '';

    // Calculate center and zoom based on locations
    const bounds = appData.locations.map(loc => [parseFloat(loc.latitude), parseFloat(loc.longitude)]);

    // Default center (Serbia)
    let centerLat = 44.8125;
    let centerLng = 20.4612;
    let zoom = 7;

    if (bounds.length > 0) {
        centerLat = bounds.reduce((sum, coord) => sum + coord[0], 0) / bounds.length;
        centerLng = bounds.reduce((sum, coord) => sum + coord[1], 0) / bounds.length;
        zoom = bounds.length === 1 ? 13 : 7;
    }

    // Initialize Leaflet map
    mapInstance = L.map('locationsMap').setView([centerLat, centerLng], zoom);

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
    }).addTo(mapInstance);

    // Clear existing markers
    mapMarkers.forEach(marker => marker.remove());
    mapMarkers = [];

    // Add markers for each location
    appData.locations.forEach(loc => {
        const lat = parseFloat(loc.latitude);
        const lng = parseFloat(loc.longitude);

        if (isNaN(lat) || isNaN(lng)) return;

        const equipmentCount = (loc.equipment || []).length;

        // Create custom icon
        const markerIcon = L.divIcon({
            className: 'custom-marker',
            html: `<div class="marker-pin">
                <i class="fas fa-map-marker-alt"></i>
                <span class="marker-count">${equipmentCount}</span>
            </div>`,
            iconSize: [40, 40],
            iconAnchor: [20, 40],
            popupAnchor: [0, -40]
        });

        const marker = L.marker([lat, lng], { icon: markerIcon }).addTo(mapInstance);

        // Create popup content
        const popupContent = `
            <div class="map-popup">
                <h4>${loc.name}</h4>
                <p><i class="fas fa-map-pin"></i> ${lat}, ${lng}</p>
                ${loc.description ? `<p class="popup-desc">${loc.description}</p>` : ''}
                <p><i class="fas fa-microchip"></i> ${equipmentCount} oprema</p>
                <button class="btn btn-small btn-primary" onclick="showLocationDetail('${loc.id}'); closeModal('mapView')">Otvori Detalje</button>
            </div>
        `;

        marker.bindPopup(popupContent);
        mapMarkers.push(marker);
    });

    // Fit bounds if multiple locations
    if (bounds.length > 1) {
        mapInstance.fitBounds(bounds, { padding: [50, 50] });
    }

    // Force map to recalculate size
    setTimeout(() => {
        mapInstance.invalidateSize();
    }, 100);
}
