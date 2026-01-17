// ===== ANALYTICS SERVICE =====
// Chart.js instances (global za cleanup)
let chartInstances = {
    statusPie: null,
    typeBar: null,
    costTrend: null,
    ageDistribution: null,
    locationBar: null
};

// Analytics map instance
let analyticsMapInstance = null;

// Current filter state
let analyticsFilters = {
    period: 30,
    location: '',
    type: '',
    status: ''
};

// Cached data for drill-down
let cachedAnalyticsData = {
    equipment: [],
    locations: []
};

/**
 * Initialize analytics view
 */
async function initAnalyticsView() {
    // Destroy existing charts
    Object.values(chartInstances).forEach(chart => {
        if (chart) chart.destroy();
    });

    // Populate filter dropdowns
    populateAnalyticsFilters();

    // Load and render data
    await applyAnalyticsFilters();
}

/**
 * Populate filter dropdowns with data
 */
function populateAnalyticsFilters() {
    // Populate locations
    const locationSelect = document.getElementById('analyticsFilterLocation');
    if (locationSelect && appData.locations) {
        locationSelect.innerHTML = '<option value="">Sve lokacije</option>' +
            appData.locations.map(loc => `<option value="${loc.id}">${loc.name}</option>`).join('');
    }

    // Populate equipment types
    const typeSelect = document.getElementById('analyticsFilterType');
    if (typeSelect) {
        const types = new Set();
        appData.locations.forEach(loc => {
            (loc.equipment || []).forEach(eq => types.add(eq.type));
        });
        typeSelect.innerHTML = '<option value="">Svi tipovi</option>' +
            [...types].sort().map(t => `<option value="${t}">${t}</option>`).join('');
    }
}

/**
 * Apply analytics filters and reload data
 */
async function applyAnalyticsFilters() {
    // Get filter values
    analyticsFilters = {
        period: document.getElementById('analyticsFilterPeriod')?.value || 30,
        location: document.getElementById('analyticsFilterLocation')?.value || '',
        type: document.getElementById('analyticsFilterType')?.value || '',
        status: document.getElementById('analyticsFilterStatus')?.value || ''
    };

    // Load data with filters
    const stats = await getEquipmentStatistics(analyticsFilters);
    const maintenanceData = await getMaintenanceTrends(analyticsFilters);
    const costlyEquipment = await getCostlyEquipment(analyticsFilters);
    const locationStats = await getLocationStatistics(analyticsFilters);

    // Check if data loaded successfully
    if (!stats) {
        console.error('❌ Failed to load equipment statistics');
        return;
    }

    // Update KPIs
    updateKPIs(stats);
    updateAdvancedKPIs(stats);

    // Render charts
    renderStatusPieChart(stats.statusCounts);
    renderTypeBarChart(stats.typeCounts);
    renderCostTrendChart(maintenanceData);
    renderAgeDistributionChart(stats.ageCounts);
    renderLocationBarChart(locationStats);
    renderAnalyticsMap(locationStats);

    // Render table
    renderCostlyEquipmentTable(costlyEquipment);

    // Initialize advanced visualizations (v5.1)
    if (typeof initAdvancedVisualizations === 'function') {
        await initAdvancedVisualizations(stats);
    }
}

/**
 * Reset all analytics filters
 */
function resetAnalyticsFilters() {
    document.getElementById('analyticsFilterPeriod').value = '30';
    document.getElementById('analyticsFilterLocation').value = '';
    document.getElementById('analyticsFilterType').value = '';
    document.getElementById('analyticsFilterStatus').value = '';
    applyAnalyticsFilters();
}

/**
 * Get location statistics
 */
async function getLocationStatistics(filters = {}) {
    try {
        const locationStats = [];

        appData.locations.forEach(loc => {
            const equipment = (loc.equipment || []).filter(eq => {
                if (filters.type && eq.type !== filters.type) return false;
                if (filters.status && (eq.status || 'Aktivna') !== filters.status) return false;
                return true;
            });

            const statusBreakdown = {
                active: equipment.filter(e => (e.status || 'Aktivna') === 'Aktivna').length,
                service: equipment.filter(e => e.status === 'Na servisu').length,
                broken: equipment.filter(e => e.status === 'Neispravna').length,
                inactive: equipment.filter(e => e.status === 'Neaktivna').length,
                retired: equipment.filter(e => e.status === 'Povučena').length
            };

            locationStats.push({
                id: loc.id,
                name: loc.name,
                latitude: loc.latitude,
                longitude: loc.longitude,
                total: equipment.length,
                ...statusBreakdown
            });
        });

        // Sort by total equipment count
        return locationStats.sort((a, b) => b.total - a.total);
    } catch (error) {
        console.error('Error getting location statistics:', error);
        return [];
    }
}

/**
 * Update advanced KPIs
 */
function updateAdvancedKPIs(stats) {
    // Availability (Active / Total * 100)
    const availability = stats.total > 0
        ? Math.round((stats.statusCounts['Aktivna'] || 0) / stats.total * 100)
        : 0;
    document.getElementById('kpiAvailability').textContent = `${availability}%`;

    // Warranty Coverage
    document.getElementById('kpiWarrantyCoverage').textContent = `${stats.warrantyCoverage || 0}%`;

    // Cost per Equipment
    const costPerEquipment = stats.total > 0
        ? Math.round(stats.totalMaintenanceCost / stats.total)
        : 0;
    document.getElementById('kpiCostPerEquipment').textContent = `€${costPerEquipment}`;

    // Average Age
    document.getElementById('kpiAverageAge').textContent = `${stats.averageAge || 0}g`;
}

/**
 * Render location bar chart
 */
function renderLocationBarChart(locationStats) {
    const ctx = document.getElementById('locationBarChart');
    if (!ctx) return;

    if (chartInstances.locationBar) {
        chartInstances.locationBar.destroy();
    }

    // Take top 10
    const top10 = locationStats.slice(0, 10);

    chartInstances.locationBar = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: top10.map(l => l.name.length > 15 ? l.name.substring(0, 15) + '...' : l.name),
            datasets: [
                {
                    label: 'Aktivna',
                    data: top10.map(l => l.active),
                    backgroundColor: 'rgba(0, 255, 136, 0.8)',
                    stack: 'stack'
                },
                {
                    label: 'Na servisu',
                    data: top10.map(l => l.service),
                    backgroundColor: 'rgba(255, 187, 0, 0.8)',
                    stack: 'stack'
                },
                {
                    label: 'Neispravna',
                    data: top10.map(l => l.broken),
                    backgroundColor: 'rgba(255, 68, 68, 0.8)',
                    stack: 'stack'
                },
                {
                    label: 'Ostalo',
                    data: top10.map(l => l.inactive + l.retired),
                    backgroundColor: 'rgba(128, 128, 128, 0.8)',
                    stack: 'stack'
                }
            ]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { color: '#e0e0e0', boxWidth: 12, padding: 10 }
                }
            },
            scales: {
                x: {
                    stacked: true,
                    ticks: { color: '#e0e0e0' },
                    grid: { color: 'rgba(255,255,255,0.1)' }
                },
                y: {
                    stacked: true,
                    ticks: { color: '#e0e0e0' },
                    grid: { display: false }
                }
            },
            onClick: (e, elements) => {
                if (elements.length > 0) {
                    const index = elements[0].index;
                    const location = locationStats[index];
                    drillDownLocation(location.id);
                }
            }
        }
    });
}

/**
 * Render analytics map with location markers
 */
function renderAnalyticsMap(locationStats) {
    const mapContainer = document.getElementById('analyticsMap');
    if (!mapContainer) return;

    // Destroy existing map
    if (analyticsMapInstance) {
        analyticsMapInstance.remove();
        analyticsMapInstance = null;
    }

    // Create new map
    analyticsMapInstance = L.map('analyticsMap').setView([44.8, 20.4], 7);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap'
    }).addTo(analyticsMapInstance);

    // Add markers for each location
    const bounds = [];
    locationStats.forEach(loc => {
        if (!loc.latitude || !loc.longitude) return;

        bounds.push([loc.latitude, loc.longitude]);

        // Determine marker color based on status
        let markerColor = 'green';
        if (loc.broken > 0) markerColor = 'red';
        else if (loc.service > 0) markerColor = 'orange';

        const markerHtml = `<div class="analytics-marker ${markerColor}">
            <span>${loc.total}</span>
        </div>`;

        const icon = L.divIcon({
            html: markerHtml,
            className: 'custom-marker',
            iconSize: [30, 30]
        });

        const marker = L.marker([loc.latitude, loc.longitude], { icon })
            .addTo(analyticsMapInstance);

        marker.bindPopup(`
            <strong>${loc.name}</strong><br>
            Ukupno: ${loc.total}<br>
            <span style="color:green">Aktivna: ${loc.active}</span><br>
            <span style="color:orange">Na servisu: ${loc.service}</span><br>
            <span style="color:red">Neispravna: ${loc.broken}</span>
        `);

        marker.on('click', () => {
            drillDownLocation(loc.id);
        });
    });

    // Fit bounds if we have markers
    if (bounds.length > 0) {
        analyticsMapInstance.fitBounds(bounds, { padding: [20, 20] });
    }
}

/**
 * Drill down into chart data
 */
function drillDownChart(chartType) {
    let title = '';
    let content = '';

    if (chartType === 'status') {
        title = 'Oprema po Statusu';
        content = generateStatusDrillDown();
    } else if (chartType === 'type') {
        title = 'Oprema po Tipu';
        content = generateTypeDrillDown();
    }

    document.getElementById('drillDownTitle').innerHTML = `<i class="fas fa-list"></i> ${title}`;
    document.getElementById('drillDownContent').innerHTML = content;
    openModal('drillDownModal');
}

/**
 * Drill down into location
 */
function drillDownLocation(locationId) {
    const location = appData.locations.find(l => l.id === locationId);
    if (!location) return;

    const equipment = location.equipment || [];

    let content = `
        <h4 style="margin-bottom:15px; color: var(--primary-green);">
            <i class="fas fa-map-marker-alt"></i> ${location.name}
        </h4>
        <table class="drilldown-table">
            <thead>
                <tr>
                    <th>Inv. Broj</th>
                    <th>Tip</th>
                    <th>Status</th>
                    <th>Proizvođač</th>
                    <th>Instalacija</th>
                </tr>
            </thead>
            <tbody>
    `;

    equipment.forEach(eq => {
        const status = eq.status || 'Aktivna';
        const statusColor = status === 'Aktivna' ? '#00ff88' :
            status === 'Na servisu' ? '#ffbb00' :
            status === 'Neispravna' ? '#ff4444' : '#888';

        content += `
            <tr onclick="closeModal('drillDownModal'); showEquipmentDetail('${eq.id}');" style="cursor:pointer">
                <td>${eq.inventoryNumber}</td>
                <td>${eq.type}</td>
                <td><span class="status-dot" style="background:${statusColor}"></span>${status}</td>
                <td>${eq.manufacturer || '-'}</td>
                <td>${eq.installDate || eq.installation_date ? formatDate(new Date(eq.installDate || eq.installation_date)) : '-'}</td>
            </tr>
        `;
    });

    content += '</tbody></table>';

    document.getElementById('drillDownTitle').innerHTML = `<i class="fas fa-map-marker-alt"></i> Detalji Lokacije`;
    document.getElementById('drillDownContent').innerHTML = content;
    openModal('drillDownModal');
}

/**
 * Generate status drill-down table
 */
function generateStatusDrillDown() {
    const statuses = ['Aktivna', 'Na servisu', 'Neispravna', 'Neaktivna', 'Povučena'];
    let content = '';

    statuses.forEach(status => {
        const equipment = [];
        appData.locations.forEach(loc => {
            (loc.equipment || []).forEach(eq => {
                if ((eq.status || 'Aktivna') === status) {
                    equipment.push({ ...eq, locationName: loc.name });
                }
            });
        });

        if (equipment.length === 0) return;

        const statusColor = status === 'Aktivna' ? '#00ff88' :
            status === 'Na servisu' ? '#ffbb00' :
            status === 'Neispravna' ? '#ff4444' : '#888';

        content += `
            <h4 style="margin: 20px 0 10px; color: ${statusColor};">
                <span class="status-dot" style="background:${statusColor}"></span>
                ${status} (${equipment.length})
            </h4>
            <table class="drilldown-table">
                <thead>
                    <tr>
                        <th>Inv. Broj</th>
                        <th>Tip</th>
                        <th>Lokacija</th>
                        <th>Proizvođač</th>
                    </tr>
                </thead>
                <tbody>
        `;

        equipment.slice(0, 20).forEach(eq => {
            content += `
                <tr onclick="closeModal('drillDownModal'); currentLocationId='${eq.location_id}'; showEquipmentDetail('${eq.id}');" style="cursor:pointer">
                    <td>${eq.inventoryNumber}</td>
                    <td>${eq.type}</td>
                    <td>${eq.locationName}</td>
                    <td>${eq.manufacturer || '-'}</td>
                </tr>
            `;
        });

        if (equipment.length > 20) {
            content += `<tr><td colspan="4" style="text-align:center; color: var(--text-secondary)">... i još ${equipment.length - 20} uređaja</td></tr>`;
        }

        content += '</tbody></table>';
    });

    return content || '<p class="no-data">Nema podataka</p>';
}

/**
 * Generate type drill-down table
 */
function generateTypeDrillDown() {
    const typeMap = {};
    appData.locations.forEach(loc => {
        (loc.equipment || []).forEach(eq => {
            if (!typeMap[eq.type]) typeMap[eq.type] = [];
            typeMap[eq.type].push({ ...eq, locationName: loc.name });
        });
    });

    let content = '';
    Object.keys(typeMap).sort().forEach(type => {
        const equipment = typeMap[type];

        content += `
            <h4 style="margin: 20px 0 10px; color: var(--primary-green);">
                <i class="fas fa-microchip"></i> ${type} (${equipment.length})
            </h4>
            <table class="drilldown-table">
                <thead>
                    <tr>
                        <th>Inv. Broj</th>
                        <th>Status</th>
                        <th>Lokacija</th>
                        <th>Proizvođač</th>
                    </tr>
                </thead>
                <tbody>
        `;

        equipment.slice(0, 15).forEach(eq => {
            const status = eq.status || 'Aktivna';
            const statusColor = status === 'Aktivna' ? '#00ff88' :
                status === 'Na servisu' ? '#ffbb00' :
                status === 'Neispravna' ? '#ff4444' : '#888';

            content += `
                <tr onclick="closeModal('drillDownModal'); currentLocationId='${eq.location_id}'; showEquipmentDetail('${eq.id}');" style="cursor:pointer">
                    <td>${eq.inventoryNumber}</td>
                    <td><span class="status-dot" style="background:${statusColor}"></span>${status}</td>
                    <td>${eq.locationName}</td>
                    <td>${eq.manufacturer || '-'}</td>
                </tr>
            `;
        });

        if (equipment.length > 15) {
            content += `<tr><td colspan="4" style="text-align:center; color: var(--text-secondary)">... i još ${equipment.length - 15} uređaja</td></tr>`;
        }

        content += '</tbody></table>';
    });

    return content || '<p class="no-data">Nema podataka</p>';
}

/**
 * Export analytics to PDF
 */
async function exportAnalyticsToPDF() {
    showToast('Generisanje PDF izveštaja...', 'info');

    try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        // Title
        doc.setFontSize(18);
        doc.setTextColor(0, 255, 136);
        doc.text('MLFF Oprema - Analitički Izveštaj', 20, 20);

        // Date
        doc.setFontSize(10);
        doc.setTextColor(150);
        doc.text(`Generisano: ${new Date().toLocaleString('sr-RS')}`, 20, 28);

        // KPIs
        doc.setFontSize(12);
        doc.setTextColor(0);
        doc.text('Ključni Indikatori:', 20, 40);

        doc.setFontSize(10);
        doc.text(`Ukupno opreme: ${document.getElementById('kpiTotalEquipment').textContent}`, 25, 48);
        doc.text(`Aktivna: ${document.getElementById('kpiActiveEquipment').textContent}`, 25, 55);
        doc.text(`Na servisu: ${document.getElementById('kpiServiceEquipment').textContent}`, 25, 62);
        doc.text(`Troškovi održavanja: ${document.getElementById('kpiMaintenanceCost').textContent}`, 25, 69);
        doc.text(`Dostupnost: ${document.getElementById('kpiAvailability').textContent}`, 120, 48);
        doc.text(`Pod garancijom: ${document.getElementById('kpiWarrantyCoverage').textContent}`, 120, 55);
        doc.text(`Trošak po uređaju: ${document.getElementById('kpiCostPerEquipment').textContent}`, 120, 62);
        doc.text(`Prosečna starost: ${document.getElementById('kpiAverageAge').textContent}`, 120, 69);

        // Charts as images
        let yPos = 85;
        const charts = ['statusPieChart', 'typeBarChart'];

        for (const chartId of charts) {
            const canvas = document.getElementById(chartId);
            if (canvas) {
                const imgData = canvas.toDataURL('image/png');
                doc.addImage(imgData, 'PNG', 20, yPos, 80, 60);
                yPos += 65;
            }
        }

        doc.save('MLFF_Analitika_' + new Date().toISOString().split('T')[0] + '.pdf');
        showToast('PDF izveštaj uspešno generisan!', 'success');
    } catch (error) {
        console.error('Error exporting PDF:', error);
        showToast('Greška pri generisanju PDF-a', 'error');
    }
}

/**
 * Export analytics to Excel
 */
function exportAnalyticsToExcel() {
    showToast('Generisanje Excel izveštaja...', 'info');

    try {
        let csvContent = 'data:text/csv;charset=utf-8,';

        // Header
        csvContent += 'MLFF Oprema - Analitički Izveštaj\n';
        csvContent += `Generisano: ${new Date().toLocaleString('sr-RS')}\n\n`;

        // KPIs
        csvContent += 'Ključni Indikatori\n';
        csvContent += `Ukupno opreme,${document.getElementById('kpiTotalEquipment').textContent}\n`;
        csvContent += `Aktivna,${document.getElementById('kpiActiveEquipment').textContent}\n`;
        csvContent += `Na servisu,${document.getElementById('kpiServiceEquipment').textContent}\n`;
        csvContent += `Troškovi održavanja,${document.getElementById('kpiMaintenanceCost').textContent}\n`;
        csvContent += `Dostupnost,${document.getElementById('kpiAvailability').textContent}\n`;
        csvContent += `Pod garancijom,${document.getElementById('kpiWarrantyCoverage').textContent}\n\n`;

        // Equipment list
        csvContent += 'Lista Opreme\n';
        csvContent += 'Inv. Broj,Tip,Status,Lokacija,Proizvođač,Model\n';

        appData.locations.forEach(loc => {
            (loc.equipment || []).forEach(eq => {
                csvContent += `"${eq.inventoryNumber}","${eq.type}","${eq.status || 'Aktivna'}","${loc.name}","${eq.manufacturer || ''}","${eq.model || ''}"\n`;
            });
        });

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', 'MLFF_Analitika_' + new Date().toISOString().split('T')[0] + '.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        showToast('Excel izveštaj uspešno generisan!', 'success');
    } catch (error) {
        console.error('Error exporting Excel:', error);
        showToast('Greška pri generisanju Excel-a', 'error');
    }
}

/**
 * Get equipment statistics from Supabase with optional filters
 */
async function getEquipmentStatistics(filters = {}) {
    try {
        // Fetch all equipment with maintenance data
        const { data: equipment, error } = await supabase
            .from('equipment')
            .select(`
                *,
                locations(name),
                maintenance(cost, date)
            `);

        if (error) throw error;

        // Apply filters
        let filteredEquipment = equipment;

        if (filters.location) {
            filteredEquipment = filteredEquipment.filter(eq =>
                eq.location_id === filters.location || eq.location_id === parseInt(filters.location)
            );
        }

        if (filters.type) {
            filteredEquipment = filteredEquipment.filter(eq => eq.type === filters.type);
        }

        if (filters.status) {
            filteredEquipment = filteredEquipment.filter(eq =>
                (eq.status || 'Aktivna') === filters.status
            );
        }

        // Period filter for maintenance costs
        const periodDays = parseInt(filters.period) || 365;
        const periodStart = new Date(Date.now() - periodDays * 24 * 60 * 60 * 1000);

        // Calculate statistics
        const stats = {
            total: filteredEquipment.length,
            statusCounts: {},
            typeCounts: {},
            ageCounts: {
                '0-1 godina': 0,
                '1-3 godine': 0,
                '3-5 godina': 0,
                '5+ godina': 0
            },
            totalMaintenanceCost: 0,
            warrantyCoverage: 0,
            averageAge: 0
        };

        let totalAge = 0;
        let equipmentWithAge = 0;
        let underWarranty = 0;

        filteredEquipment.forEach(eq => {
            // Status counts
            const status = eq.status || 'Aktivna';
            stats.statusCounts[status] = (stats.statusCounts[status] || 0) + 1;

            // Type counts
            stats.typeCounts[eq.type] = (stats.typeCounts[eq.type] || 0) + 1;

            // Age distribution and average age
            if (eq.installation_date) {
                const ageYears = (new Date() - new Date(eq.installation_date)) / (1000 * 60 * 60 * 24 * 365);
                totalAge += ageYears;
                equipmentWithAge++;

                if (ageYears <= 1) stats.ageCounts['0-1 godina']++;
                else if (ageYears <= 3) stats.ageCounts['1-3 godine']++;
                else if (ageYears <= 5) stats.ageCounts['3-5 godina']++;
                else stats.ageCounts['5+ godina']++;
            }

            // Warranty coverage check
            if (eq.warranty_expiry) {
                const warrantyDate = new Date(eq.warranty_expiry);
                if (warrantyDate > new Date()) {
                    underWarranty++;
                }
            }

            // Total maintenance cost (within selected period)
            if (eq.maintenance) {
                eq.maintenance.forEach(m => {
                    const maintenanceDate = new Date(m.date);
                    if (maintenanceDate >= periodStart) {
                        stats.totalMaintenanceCost += parseFloat(m.cost) || 0;
                    }
                });
            }
        });

        // Calculate warranty coverage percentage
        stats.warrantyCoverage = filteredEquipment.length > 0
            ? Math.round((underWarranty / filteredEquipment.length) * 100)
            : 0;

        // Calculate average age
        stats.averageAge = equipmentWithAge > 0
            ? Math.round(totalAge / equipmentWithAge * 10) / 10
            : 0;

        // Cache equipment data for drill-down
        cachedAnalyticsData.equipment = filteredEquipment;

        return stats;
    } catch (error) {
        console.error('Error fetching equipment statistics:', error);
        return null;
    }
}

/**
 * Get maintenance trends with optional filters
 */
async function getMaintenanceTrends(filters = {}) {
    try {
        // Determine period
        const periodDays = parseInt(filters.period) || 365;
        const periodStart = new Date(Date.now() - periodDays * 24 * 60 * 60 * 1000);

        // Build query
        let query = supabase
            .from('maintenance')
            .select('cost, date, equipment_id, equipment(location_id, type, status)')
            .gte('date', periodStart.toISOString())
            .order('date', { ascending: true });

        const { data, error } = await query;

        if (error) throw error;

        // Apply equipment-level filters
        let filteredData = data;

        if (filters.location) {
            filteredData = filteredData.filter(m =>
                m.equipment?.location_id === filters.location ||
                m.equipment?.location_id === parseInt(filters.location)
            );
        }

        if (filters.type) {
            filteredData = filteredData.filter(m => m.equipment?.type === filters.type);
        }

        if (filters.status) {
            filteredData = filteredData.filter(m =>
                (m.equipment?.status || 'Aktivna') === filters.status
            );
        }

        // Group by month
        const monthlyData = {};
        filteredData.forEach(m => {
            const month = new Date(m.date).toLocaleDateString('sr-RS', { year: 'numeric', month: 'short' });
            monthlyData[month] = (monthlyData[month] || 0) + (parseFloat(m.cost) || 0);
        });

        return monthlyData;
    } catch (error) {
        console.error('Error fetching maintenance trends:', error);
        return {};
    }
}

/**
 * Get top 10 costly equipment with optional filters
 */
async function getCostlyEquipment(filters = {}) {
    try {
        const { data, error } = await supabase
            .from('equipment')
            .select(`
                id,
                inventory_number,
                type,
                status,
                location_id,
                locations(name),
                maintenance(cost, date)
            `);

        if (error) throw error;

        // Apply filters
        let filteredData = data;

        if (filters.location) {
            filteredData = filteredData.filter(eq =>
                eq.location_id === filters.location || eq.location_id === parseInt(filters.location)
            );
        }

        if (filters.type) {
            filteredData = filteredData.filter(eq => eq.type === filters.type);
        }

        if (filters.status) {
            filteredData = filteredData.filter(eq =>
                (eq.status || 'Aktivna') === filters.status
            );
        }

        // Period filter for maintenance costs
        const periodDays = parseInt(filters.period) || 365;
        const periodStart = new Date(Date.now() - periodDays * 24 * 60 * 60 * 1000);

        // Calculate total cost per equipment (within period)
        const equipmentCosts = filteredData.map(eq => {
            const maintenanceInPeriod = (eq.maintenance || []).filter(m =>
                new Date(m.date) >= periodStart
            );
            return {
                inventory_number: eq.inventory_number,
                type: eq.type,
                location: eq.locations?.name || 'N/A',
                serviceCount: maintenanceInPeriod.length,
                totalCost: maintenanceInPeriod.reduce((sum, m) => sum + (parseFloat(m.cost) || 0), 0)
            };
        });

        // Sort by cost descending, take top 10
        return equipmentCosts
            .sort((a, b) => b.totalCost - a.totalCost)
            .slice(0, 10);
    } catch (error) {
        console.error('Error fetching costly equipment:', error);
        return [];
    }
}

/**
 * Update KPI cards
 */
function updateKPIs(stats) {
    document.getElementById('kpiTotalEquipment').textContent = stats.total;
    document.getElementById('kpiActiveEquipment').textContent = stats.statusCounts['Aktivna'] || 0;
    document.getElementById('kpiServiceEquipment').textContent = stats.statusCounts['Na servisu'] || 0;
    document.getElementById('kpiMaintenanceCost').textContent =
        `€${stats.totalMaintenanceCost.toLocaleString('sr-RS', { minimumFractionDigits: 2 })}`;
}

/**
 * Render status pie chart
 */
function renderStatusPieChart(statusCounts) {
    const ctx = document.getElementById('statusPieChart').getContext('2d');

    chartInstances.statusPie = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: Object.keys(statusCounts),
            datasets: [{
                data: Object.values(statusCounts),
                backgroundColor: [
                    'rgba(0, 255, 136, 0.8)',  // Aktivna - green
                    'rgba(255, 187, 0, 0.8)',  // Na servisu - yellow
                    'rgba(255, 68, 68, 0.8)',  // Neispravna - red
                    'rgba(128, 128, 128, 0.8)', // Neaktivna - gray
                    'rgba(136, 136, 136, 0.8)' // Povučena - dark gray
                ],
                borderColor: '#1a1a2e',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { color: '#e0e0e0' }
                },
                tooltip: {
                    backgroundColor: '#2d2d44',
                    titleColor: '#00ff88',
                    bodyColor: '#e0e0e0'
                }
            }
        }
    });
}

/**
 * Render type bar chart
 */
function renderTypeBarChart(typeCounts) {
    const ctx = document.getElementById('typeBarChart').getContext('2d');

    chartInstances.typeBar = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: Object.keys(typeCounts),
            datasets: [{
                label: 'Broj Opreme',
                data: Object.values(typeCounts),
                backgroundColor: 'rgba(0, 255, 136, 0.6)',
                borderColor: 'rgba(0, 255, 136, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { color: '#e0e0e0', stepSize: 1 },
                    grid: { color: '#2d2d44' }
                },
                x: {
                    ticks: { color: '#e0e0e0' },
                    grid: { display: false }
                }
            },
            plugins: {
                legend: { display: false }
            }
        }
    });
}

/**
 * Render cost trend line chart
 */
function renderCostTrendChart(monthlyData) {
    const ctx = document.getElementById('costTrendChart').getContext('2d');

    chartInstances.costTrend = new Chart(ctx, {
        type: 'line',
        data: {
            labels: Object.keys(monthlyData),
            datasets: [{
                label: 'Troškovi (€)',
                data: Object.values(monthlyData),
                borderColor: 'rgba(0, 255, 136, 1)',
                backgroundColor: 'rgba(0, 255, 136, 0.1)',
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: '#e0e0e0',
                        callback: value => `€${value}`
                    },
                    grid: { color: '#2d2d44' }
                },
                x: {
                    ticks: { color: '#e0e0e0' },
                    grid: { display: false }
                }
            },
            plugins: {
                legend: { labels: { color: '#e0e0e0' } }
            }
        }
    });
}

/**
 * Render age distribution bar chart
 */
function renderAgeDistributionChart(ageCounts) {
    const ctx = document.getElementById('ageDistributionChart').getContext('2d');

    chartInstances.ageDistribution = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: Object.keys(ageCounts),
            datasets: [{
                label: 'Broj Opreme',
                data: Object.values(ageCounts),
                backgroundColor: [
                    'rgba(0, 255, 136, 0.8)',
                    'rgba(0, 200, 100, 0.8)',
                    'rgba(255, 187, 0, 0.8)',
                    'rgba(255, 100, 0, 0.8)'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { color: '#e0e0e0', stepSize: 1 },
                    grid: { color: '#2d2d44' }
                },
                x: {
                    ticks: { color: '#e0e0e0' },
                    grid: { display: false }
                }
            },
            plugins: {
                legend: { display: false }
            }
        }
    });
}

/**
 * Render costly equipment table
 */
function renderCostlyEquipmentTable(equipment) {
    const tbody = document.getElementById('costlyEquipmentTableBody');

    tbody.innerHTML = equipment.map(eq => `
        <tr>
            <td>${eq.inventory_number}</td>
            <td>${eq.type}</td>
            <td>${eq.location}</td>
            <td>${eq.serviceCount}</td>
            <td>€${eq.totalCost.toLocaleString('sr-RS', { minimumFractionDigits: 2 })}</td>
        </tr>
    `).join('');
}

/**
 * Export to PDF
 */
async function exportToPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Add title
    doc.setFontSize(20);
    doc.text('MLFF Equipment Analytics Report', 20, 20);

    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleDateString('sr-RS')}`, 20, 28);

    // Add KPIs
    doc.setFontSize(14);
    doc.text('Pregled:', 20, 45);
    doc.setFontSize(10);
    doc.text(`Ukupno opreme: ${document.getElementById('kpiTotalEquipment').textContent}`, 20, 55);
    doc.text(`Aktivna: ${document.getElementById('kpiActiveEquipment').textContent}`, 20, 62);
    doc.text(`Na servisu: ${document.getElementById('kpiServiceEquipment').textContent}`, 20, 69);
    doc.text(`Troškovi: ${document.getElementById('kpiMaintenanceCost').textContent}`, 20, 76);

    // Add charts as images
    const statusChart = document.getElementById('statusPieChart');
    const statusImage = statusChart.toDataURL('image/png');
    doc.addImage(statusImage, 'PNG', 20, 85, 80, 60);

    const typeChart = document.getElementById('typeBarChart');
    const typeImage = typeChart.toDataURL('image/png');
    doc.addImage(typeImage, 'PNG', 110, 85, 80, 60);

    // Add table (new page)
    doc.addPage();
    doc.setFontSize(14);
    doc.text('Top 10 Najskupljih Opreme', 20, 20);

    const tableData = [];
    document.querySelectorAll('#costlyEquipmentTableBody tr').forEach(row => {
        const cells = row.querySelectorAll('td');
        tableData.push([
            cells[0].textContent,
            cells[1].textContent,
            cells[2].textContent,
            cells[3].textContent,
            cells[4].textContent
        ]);
    });

    doc.autoTable({
        startY: 30,
        head: [['Inv. Broj', 'Tip', 'Lokacija', 'Servisi', 'Troškovi']],
        body: tableData,
        theme: 'grid',
        headStyles: { fillColor: [0, 255, 136] }
    });

    doc.save('mlff-analytics-report.pdf');
}

/**
 * Export to Excel
 */
function exportToExcel() {
    const XLSX = window.XLSX;
    const workbook = XLSX.utils.book_new();

    // Sheet 1: Summary
    const summaryData = [{
        'Ukupno Opreme': document.getElementById('kpiTotalEquipment').textContent,
        'Aktivna': document.getElementById('kpiActiveEquipment').textContent,
        'Na Servisu': document.getElementById('kpiServiceEquipment').textContent,
        'Troškovi Održavanja': document.getElementById('kpiMaintenanceCost').textContent
    }];
    const summarySheet = XLSX.utils.json_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Pregled');

    // Sheet 2: Costly Equipment
    const tableRows = [];
    document.querySelectorAll('#costlyEquipmentTableBody tr').forEach(row => {
        const cells = row.querySelectorAll('td');
        tableRows.push({
            'Inventarski Broj': cells[0].textContent,
            'Tip': cells[1].textContent,
            'Lokacija': cells[2].textContent,
            'Broj Servisa': cells[3].textContent,
            'Ukupni Troškovi': cells[4].textContent
        });
    });
    const costlySheet = XLSX.utils.json_to_sheet(tableRows);
    XLSX.utils.book_append_sheet(workbook, costlySheet, 'Najskuplji');

    // Download
    XLSX.writeFile(workbook, 'mlff-analytics-data.xlsx');
}

/**
 * Show analytics view (called from sidebar)
 */
function showAnalyticsView() {
    showView('analyticsView');
    initAnalyticsView();
    updateBreadcrumb();
}
