// ===== ANALYTICS SERVICE =====
// Chart.js instances (global za cleanup)
let chartInstances = {
    statusPie: null,
    typeBar: null,
    costTrend: null,
    ageDistribution: null
};

/**
 * Initialize analytics view
 */
async function initAnalyticsView() {
    // Destroy existing charts
    Object.values(chartInstances).forEach(chart => {
        if (chart) chart.destroy();
    });

    // Load data
    const stats = await getEquipmentStatistics();
    const maintenanceData = await getMaintenanceTrends();
    const costlyEquipment = await getCostlyEquipment();

    // Update KPIs
    updateKPIs(stats);

    // Render charts
    renderStatusPieChart(stats.statusCounts);
    renderTypeBarChart(stats.typeCounts);
    renderCostTrendChart(maintenanceData);
    renderAgeDistributionChart(stats.ageCounts);

    // Render table
    renderCostlyEquipmentTable(costlyEquipment);
}

/**
 * Get equipment statistics from Supabase
 */
async function getEquipmentStatistics() {
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

        // Calculate statistics
        const stats = {
            total: equipment.length,
            statusCounts: {},
            typeCounts: {},
            ageCounts: {
                '0-1 godina': 0,
                '1-3 godine': 0,
                '3-5 godina': 0,
                '5+ godina': 0
            },
            totalMaintenanceCost: 0
        };

        equipment.forEach(eq => {
            // Status counts
            const status = eq.status || 'Aktivna';
            stats.statusCounts[status] = (stats.statusCounts[status] || 0) + 1;

            // Type counts
            stats.typeCounts[eq.type] = (stats.typeCounts[eq.type] || 0) + 1;

            // Age distribution
            if (eq.installation_date) {
                const ageYears = (new Date() - new Date(eq.installation_date)) / (1000 * 60 * 60 * 24 * 365);
                if (ageYears <= 1) stats.ageCounts['0-1 godina']++;
                else if (ageYears <= 3) stats.ageCounts['1-3 godine']++;
                else if (ageYears <= 5) stats.ageCounts['3-5 godina']++;
                else stats.ageCounts['5+ godina']++;
            }

            // Total maintenance cost (only from current year)
            if (eq.maintenance) {
                const currentYear = new Date().getFullYear();
                eq.maintenance.forEach(m => {
                    const maintenanceYear = new Date(m.date).getFullYear();
                    if (maintenanceYear === currentYear) {
                        stats.totalMaintenanceCost += parseFloat(m.cost) || 0;
                    }
                });
            }
        });

        return stats;
    } catch (error) {
        console.error('Error fetching equipment statistics:', error);
        return null;
    }
}

/**
 * Get maintenance trends (12 months)
 */
async function getMaintenanceTrends() {
    try {
        const { data, error } = await supabase
            .from('maintenance')
            .select('cost, date')
            .gte('date', new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString())
            .order('date', { ascending: true });

        if (error) throw error;

        // Group by month
        const monthlyData = {};
        data.forEach(m => {
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
 * Get top 10 costly equipment
 */
async function getCostlyEquipment() {
    try {
        const { data, error } = await supabase
            .from('equipment')
            .select(`
                id,
                inventory_number,
                type,
                locations(name),
                maintenance(cost)
            `);

        if (error) throw error;

        // Calculate total cost per equipment
        const equipmentCosts = data.map(eq => ({
            inventory_number: eq.inventory_number,
            type: eq.type,
            location: eq.locations?.name || 'N/A',
            serviceCount: eq.maintenance?.length || 0,
            totalCost: eq.maintenance?.reduce((sum, m) => sum + (parseFloat(m.cost) || 0), 0) || 0
        }));

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
                    'rgba(136, 136, 136, 0.8)' // Povučena - gray
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
