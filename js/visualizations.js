// ===== ADVANCED VISUALIZATIONS v5.1 =====

// Chart instances for cleanup
let gaugeCharts = {
    systemHealth: null,
    warranty: null,
    uptime: null,
    capacity: null
};

let timelineInstance = null;
let currentHeatmapYear = new Date().getFullYear();
let treemapCurrentLevel = 'root';
let treemapCurrentData = null;

// ==========================================
// 1. GAUGE INDICATORS
// ==========================================

/**
 * Initialize all gauge charts
 */
function initGauges(stats) {
    const systemHealth = calculateSystemHealth(stats);
    const warrantyPercent = stats.warrantyCoverage || 0;
    const uptimePercent = calculateUptime(stats);
    const capacityPercent = calculateServiceCapacity(stats);

    renderGauge('gaugeSystemHealth', systemHealth, 'gaugeSystemHealthValue');
    renderGauge('gaugeWarranty', warrantyPercent, 'gaugeWarrantyValue');
    renderGauge('gaugeUptime', uptimePercent, 'gaugeUptimeValue');
    renderGauge('gaugeCapacity', capacityPercent, 'gaugeCapacityValue');
}

/**
 * Calculate system health based on equipment status
 */
function calculateSystemHealth(stats) {
    if (!stats || stats.total === 0) return 0;
    const activeCount = stats.statusCounts['Aktivna'] || 0;
    const serviceCount = stats.statusCounts['Na servisu'] || 0;
    const brokenCount = stats.statusCounts['Neispravna'] || 0;

    // Weight: Active=100%, Service=50%, Broken=0%
    const healthScore = ((activeCount * 100) + (serviceCount * 50)) / stats.total;
    return Math.round(healthScore);
}

/**
 * Calculate uptime percentage
 */
function calculateUptime(stats) {
    if (!stats || stats.total === 0) return 0;
    const activeCount = stats.statusCounts['Aktivna'] || 0;
    return Math.round((activeCount / stats.total) * 100);
}

/**
 * Calculate service capacity (inverse of service load)
 */
function calculateServiceCapacity(stats) {
    if (!stats || stats.total === 0) return 100;
    const serviceCount = stats.statusCounts['Na servisu'] || 0;
    const brokenCount = stats.statusCounts['Neispravna'] || 0;
    // Assume max 20% can be in service at once
    const maxServiceCapacity = Math.ceil(stats.total * 0.2);
    const currentLoad = serviceCount + brokenCount;
    const capacity = Math.max(0, 100 - ((currentLoad / maxServiceCapacity) * 100));
    return Math.round(Math.min(100, capacity));
}

/**
 * Render a single gauge chart
 */
function renderGauge(canvasId, value, valueElementId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const chartKey = canvasId.replace('gauge', '').toLowerCase();

    // Destroy existing chart
    if (gaugeCharts[chartKey]) {
        gaugeCharts[chartKey].destroy();
    }

    // Determine color based on value
    let color = '#00ff88'; // Green
    let containerClass = '';
    if (value < 50) {
        color = '#ff4444'; // Red
        containerClass = 'danger';
    } else if (value < 80) {
        color = '#ffbb00'; // Yellow
        containerClass = 'warning';
    }

    // Update container class
    const container = canvas.closest('.gauge-container');
    if (container) {
        container.classList.remove('warning', 'danger');
        if (containerClass) container.classList.add(containerClass);
    }

    // Create doughnut chart as gauge
    gaugeCharts[chartKey] = new Chart(ctx, {
        type: 'doughnut',
        data: {
            datasets: [{
                data: [value, 100 - value],
                backgroundColor: [color, 'rgba(255,255,255,0.1)'],
                borderWidth: 0,
                circumference: 270,
                rotation: 225
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            cutout: '75%',
            plugins: {
                legend: { display: false },
                tooltip: { enabled: false }
            },
            animation: {
                animateRotate: true,
                duration: 1000
            }
        }
    });

    // Update value display
    const valueElement = document.getElementById(valueElementId);
    if (valueElement) {
        animateValue(valueElement, 0, value, 1000);
    }
}

/**
 * Animate numeric value change
 */
function animateValue(element, start, end, duration) {
    const range = end - start;
    const startTime = performance.now();

    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeProgress = 1 - Math.pow(1 - progress, 3); // Ease out cubic
        const currentValue = Math.round(start + (range * easeProgress));
        element.textContent = currentValue + '%';

        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }

    requestAnimationFrame(update);
}

// ==========================================
// 2. HEATMAP CALENDAR
// ==========================================

/**
 * Initialize maintenance heatmap
 */
async function initMaintenanceHeatmap(maintenanceData) {
    document.getElementById('heatmapYear').textContent = currentHeatmapYear;
    await renderHeatmap(maintenanceData);
}

/**
 * Change heatmap year
 */
async function changeHeatmapYear(delta) {
    currentHeatmapYear += delta;
    document.getElementById('heatmapYear').textContent = currentHeatmapYear;

    // Fetch maintenance data for new year
    try {
        const { data, error } = await supabase
            .from('maintenance')
            .select('date, cost')
            .gte('date', `${currentHeatmapYear}-01-01`)
            .lte('date', `${currentHeatmapYear}-12-31`);

        if (!error) {
            await renderHeatmap(processMaintenanceForHeatmap(data));
        }
    } catch (e) {
        console.error('Error fetching heatmap data:', e);
    }
}

/**
 * Process maintenance data for heatmap
 */
function processMaintenanceForHeatmap(data) {
    const counts = {};
    (data || []).forEach(m => {
        const date = m.date.split('T')[0];
        counts[date] = (counts[date] || 0) + 1;
    });
    return counts;
}

/**
 * Render heatmap calendar
 */
async function renderHeatmap(maintenanceData) {
    const container = document.getElementById('maintenanceHeatmap');
    if (!container) return;

    const data = maintenanceData || {};
    const year = currentHeatmapYear;

    // Create grid HTML
    let html = '<div class="heatmap-grid">';

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Maj', 'Jun', 'Jul', 'Avg', 'Sep', 'Okt', 'Nov', 'Dec'];

    for (let month = 0; month < 12; month++) {
        html += `<div class="heatmap-month">
            <div class="heatmap-month-label">${months[month]}</div>
            <div class="heatmap-weeks">`;

        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);

        let currentWeek = [];
        let weeks = [];

        // Fill empty days at start
        const startDayOfWeek = firstDay.getDay() || 7; // Monday = 1
        for (let i = 1; i < startDayOfWeek; i++) {
            currentWeek.push(null);
        }

        // Fill days
        for (let day = 1; day <= lastDay.getDate(); day++) {
            const date = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const count = data[date] || 0;
            currentWeek.push({ date, count, day });

            if (currentWeek.length === 7) {
                weeks.push(currentWeek);
                currentWeek = [];
            }
        }

        // Fill remaining days
        if (currentWeek.length > 0) {
            while (currentWeek.length < 7) {
                currentWeek.push(null);
            }
            weeks.push(currentWeek);
        }

        // Render weeks
        weeks.forEach(week => {
            html += '<div class="heatmap-week">';
            week.forEach(dayData => {
                if (dayData === null) {
                    html += '<div class="heatmap-day level-0" style="opacity:0.3"></div>';
                } else {
                    const level = getHeatmapLevel(dayData.count);
                    html += `<div class="heatmap-day level-${level}"
                        data-date="${dayData.date}"
                        data-count="${dayData.count}"
                        onmouseenter="showHeatmapTooltip(event, '${dayData.date}', ${dayData.count})"
                        onmouseleave="hideHeatmapTooltip()"></div>`;
                }
            });
            html += '</div>';
        });

        html += '</div></div>';
    }

    html += '</div>';
    container.innerHTML = html;
}

/**
 * Get heatmap level based on count
 */
function getHeatmapLevel(count) {
    if (count === 0) return 0;
    if (count <= 1) return 1;
    if (count <= 3) return 2;
    if (count <= 5) return 3;
    return 4;
}

/**
 * Show heatmap tooltip
 */
function showHeatmapTooltip(event, date, count) {
    let tooltip = document.querySelector('.heatmap-tooltip');
    if (!tooltip) {
        tooltip = document.createElement('div');
        tooltip.className = 'heatmap-tooltip';
        document.body.appendChild(tooltip);
    }

    const formattedDate = new Date(date).toLocaleDateString('sr-RS', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    tooltip.innerHTML = `<strong>${formattedDate}</strong><br>${count} servis${count === 1 ? '' : 'a'}`;
    tooltip.style.display = 'block';
    tooltip.style.left = (event.pageX + 10) + 'px';
    tooltip.style.top = (event.pageY - 30) + 'px';
}

/**
 * Hide heatmap tooltip
 */
function hideHeatmapTooltip() {
    const tooltip = document.querySelector('.heatmap-tooltip');
    if (tooltip) tooltip.style.display = 'none';
}

// ==========================================
// 3. EQUIPMENT TIMELINE
// ==========================================

/**
 * Initialize equipment timeline
 */
async function initEquipmentTimeline() {
    const container = document.getElementById('equipmentTimeline');
    if (!container || typeof vis === 'undefined') {
        console.warn('Timeline container not found or vis-timeline not loaded');
        return;
    }

    try {
        // Fetch equipment with maintenance
        const { data: equipment, error } = await supabase
            .from('equipment')
            .select(`
                id, inventory_number, type, installation_date, warranty_expiry, status,
                maintenance(date, type, description)
            `)
            .limit(50);

        if (error) throw error;

        // Populate filter dropdown
        populateTimelineFilter(equipment);

        // Build timeline items
        const items = buildTimelineItems(equipment);
        const groups = buildTimelineGroups(equipment);

        // Create timeline
        const options = {
            stack: true,
            showCurrentTime: true,
            orientation: 'top',
            zoomMin: 1000 * 60 * 60 * 24 * 7, // 1 week
            zoomMax: 1000 * 60 * 60 * 24 * 365 * 5, // 5 years
            margin: { item: 10 },
            locale: 'sr'
        };

        if (timelineInstance) {
            timelineInstance.destroy();
        }

        timelineInstance = new vis.Timeline(container, items, groups, options);

    } catch (e) {
        console.error('Error initializing timeline:', e);
        container.innerHTML = '<p style="padding:20px;text-align:center;color:var(--text-secondary)">Greška pri učitavanju timeline-a</p>';
    }
}

/**
 * Build timeline items from equipment data
 */
function buildTimelineItems(equipment) {
    const items = [];
    let itemId = 1;

    equipment.forEach(eq => {
        const groupId = eq.id;

        // Installation event
        if (eq.installation_date) {
            items.push({
                id: itemId++,
                group: groupId,
                content: 'Instalacija',
                start: eq.installation_date,
                type: 'point',
                className: 'installation'
            });
        }

        // Warranty period
        if (eq.installation_date && eq.warranty_expiry) {
            items.push({
                id: itemId++,
                group: groupId,
                content: 'Garancija',
                start: eq.installation_date,
                end: eq.warranty_expiry,
                type: 'range',
                className: 'warranty'
            });
        }

        // Maintenance events
        (eq.maintenance || []).forEach(m => {
            const isFailure = m.type === 'Korektivni' || m.description?.toLowerCase().includes('kvar');
            items.push({
                id: itemId++,
                group: groupId,
                content: m.type || 'Servis',
                start: m.date,
                type: 'point',
                className: isFailure ? 'failure' : 'maintenance',
                title: m.description || ''
            });
        });
    });

    return new vis.DataSet(items);
}

/**
 * Build timeline groups from equipment
 */
function buildTimelineGroups(equipment) {
    return new vis.DataSet(
        equipment.map(eq => ({
            id: eq.id,
            content: `<strong>${eq.inventory_number}</strong><br><small>${eq.type}</small>`
        }))
    );
}

/**
 * Populate timeline filter dropdown
 */
function populateTimelineFilter(equipment) {
    const select = document.getElementById('timelineEquipmentFilter');
    if (!select) return;

    select.innerHTML = '<option value="">Sva oprema (prvih 50)</option>';
    equipment.forEach(eq => {
        select.innerHTML += `<option value="${eq.id}">${eq.inventory_number} - ${eq.type}</option>`;
    });
}

/**
 * Filter timeline by equipment
 */
function filterTimeline() {
    const select = document.getElementById('timelineEquipmentFilter');
    if (!select || !timelineInstance) return;

    const selectedId = select.value;
    if (selectedId) {
        timelineInstance.setGroups(new vis.DataSet([{
            id: selectedId,
            content: select.options[select.selectedIndex].text
        }]));
    } else {
        initEquipmentTimeline();
    }
}

/**
 * Zoom timeline
 */
function zoomTimeline(action) {
    if (!timelineInstance) return;

    switch (action) {
        case 'in':
            timelineInstance.zoomIn(0.5);
            break;
        case 'out':
            timelineInstance.zoomOut(0.5);
            break;
        case 'fit':
            timelineInstance.fit();
            break;
    }
}

// ==========================================
// 4. INVENTORY TREEMAP
// ==========================================

/**
 * Initialize inventory treemap
 */
async function initInventoryTreemap() {
    const container = document.getElementById('inventoryTreemap');
    if (!container || typeof d3 === 'undefined') {
        console.warn('Treemap container not found or D3 not loaded');
        return;
    }

    try {
        // Build hierarchical data
        const hierarchyData = await buildTreemapHierarchy();
        treemapCurrentData = hierarchyData;
        treemapCurrentLevel = 'root';

        updateTreemapBreadcrumb([{ name: 'Sve Lokacije', level: 'root' }]);
        renderTreemap(hierarchyData);

    } catch (e) {
        console.error('Error initializing treemap:', e);
    }
}

/**
 * Build treemap hierarchy from data
 */
async function buildTreemapHierarchy() {
    const hierarchy = {
        name: 'Sve Lokacije',
        children: []
    };

    appData.locations.forEach(loc => {
        const locNode = {
            name: loc.name,
            id: loc.id,
            children: []
        };

        // Group equipment by type
        const typeGroups = {};
        (loc.equipment || []).forEach(eq => {
            if (!typeGroups[eq.type]) {
                typeGroups[eq.type] = {
                    name: eq.type,
                    children: []
                };
            }
            typeGroups[eq.type].children.push({
                name: eq.inventory_number,
                value: 1,
                status: eq.status || 'Aktivna',
                id: eq.id
            });
        });

        locNode.children = Object.values(typeGroups);
        if (locNode.children.length > 0) {
            hierarchy.children.push(locNode);
        }
    });

    return hierarchy;
}

/**
 * Render treemap
 */
function renderTreemap(data) {
    const container = document.getElementById('inventoryTreemap');
    if (!container) return;

    container.innerHTML = '';

    const width = container.clientWidth;
    const height = container.clientHeight || 400;

    const svg = d3.select(container)
        .append('svg')
        .attr('width', width)
        .attr('height', height);

    const root = d3.hierarchy(data)
        .sum(d => d.value || 0)
        .sort((a, b) => b.value - a.value);

    d3.treemap()
        .size([width, height])
        .padding(2)
        .round(true)(root);

    const colorScale = {
        'Aktivna': '#00ff88',
        'Na servisu': '#ffbb00',
        'Neispravna': '#ff4444',
        'Neaktivna': '#888888',
        'Povučena': '#555555'
    };

    // Calculate dominant color for parent nodes
    function getDominantColor(d) {
        if (d.data.status) {
            return colorScale[d.data.status] || '#666';
        }
        if (d.children) {
            const statusCounts = {};
            d.leaves().forEach(leaf => {
                const status = leaf.data.status || 'Aktivna';
                statusCounts[status] = (statusCounts[status] || 0) + 1;
            });
            let maxStatus = 'Aktivna';
            let maxCount = 0;
            Object.entries(statusCounts).forEach(([status, count]) => {
                if (count > maxCount) {
                    maxCount = count;
                    maxStatus = status;
                }
            });
            return colorScale[maxStatus];
        }
        return '#666';
    }

    const cells = svg.selectAll('g')
        .data(root.leaves())
        .enter()
        .append('g')
        .attr('class', 'treemap-cell')
        .attr('transform', d => `translate(${d.x0},${d.y0})`);

    cells.append('rect')
        .attr('width', d => Math.max(0, d.x1 - d.x0))
        .attr('height', d => Math.max(0, d.y1 - d.y0))
        .attr('fill', d => getDominantColor(d))
        .on('mouseover', function(event, d) {
            showTreemapTooltip(event, d);
        })
        .on('mouseout', hideTreemapTooltip)
        .on('click', function(event, d) {
            if (d.data.id) {
                // Navigate to equipment
                showEquipmentDetails(d.data.id);
            }
        });

    // Add labels
    cells.append('text')
        .attr('x', 5)
        .attr('y', 15)
        .text(d => {
            const width = d.x1 - d.x0;
            if (width < 40) return '';
            const name = d.data.name || '';
            return width < 80 ? name.substring(0, 6) + '...' : name;
        })
        .attr('class', d => (d.x1 - d.x0) < 80 ? 'small' : '');
}

/**
 * Update treemap breadcrumb
 */
function updateTreemapBreadcrumb(path) {
    const container = document.getElementById('treemapBreadcrumb');
    if (!container) return;

    container.innerHTML = path.map((item, index) => `
        <span class="breadcrumb-item ${index === path.length - 1 ? 'active' : ''}"
            data-level="${item.level}"
            onclick="navigateTreemap('${item.level}')">
            ${item.name}
        </span>
    `).join('');
}

/**
 * Navigate treemap level
 */
function navigateTreemap(level) {
    if (level === 'root' && treemapCurrentData) {
        treemapCurrentLevel = 'root';
        updateTreemapBreadcrumb([{ name: 'Sve Lokacije', level: 'root' }]);
        renderTreemap(treemapCurrentData);
    }
}

/**
 * Show treemap tooltip
 */
function showTreemapTooltip(event, d) {
    let tooltip = document.querySelector('.treemap-tooltip');
    if (!tooltip) {
        tooltip = document.createElement('div');
        tooltip.className = 'treemap-tooltip';
        document.body.appendChild(tooltip);
    }

    const status = d.data.status || 'N/A';
    tooltip.innerHTML = `
        <h4>${d.data.name}</h4>
        <p>Status: ${status}</p>
        <p>Klikni za detalje</p>
    `;
    tooltip.style.display = 'block';
    tooltip.style.left = (event.pageX + 10) + 'px';
    tooltip.style.top = (event.pageY - 10) + 'px';
}

/**
 * Hide treemap tooltip
 */
function hideTreemapTooltip() {
    const tooltip = document.querySelector('.treemap-tooltip');
    if (tooltip) tooltip.style.display = 'none';
}

// ==========================================
// 5. SANKEY DIAGRAM
// ==========================================

/**
 * Initialize Sankey diagram
 */
async function initSankeyDiagram() {
    const container = document.getElementById('sankeyDiagram');
    if (!container || typeof d3 === 'undefined') {
        console.warn('Sankey container not found or D3 not loaded');
        return;
    }

    try {
        const sankeyData = buildSankeyData();
        renderSankey(sankeyData);
    } catch (e) {
        console.error('Error initializing Sankey:', e);
    }
}

/**
 * Build Sankey data from app data
 */
function buildSankeyData() {
    const nodes = [];
    const links = [];
    const nodeMap = {};
    let nodeIndex = 0;

    // Status nodes
    const statuses = ['Aktivna', 'Na servisu', 'Neispravna', 'Neaktivna', 'Povučena'];
    statuses.forEach(status => {
        nodeMap[`status_${status}`] = nodeIndex;
        nodes.push({ name: status, type: 'status' });
        nodeIndex++;
    });

    // Location nodes
    appData.locations.forEach(loc => {
        nodeMap[`loc_${loc.id}`] = nodeIndex;
        nodes.push({ name: loc.name, type: 'location' });
        nodeIndex++;
    });

    // Type nodes
    const types = new Set();
    appData.locations.forEach(loc => {
        (loc.equipment || []).forEach(eq => types.add(eq.type));
    });
    types.forEach(type => {
        nodeMap[`type_${type}`] = nodeIndex;
        nodes.push({ name: type, type: 'type' });
        nodeIndex++;
    });

    // Build links: Status -> Type -> Location
    const statusTypeLinks = {};
    const typeLocationLinks = {};

    appData.locations.forEach(loc => {
        (loc.equipment || []).forEach(eq => {
            const status = eq.status || 'Aktivna';
            const type = eq.type;

            // Status -> Type
            const stKey = `status_${status}|type_${type}`;
            statusTypeLinks[stKey] = (statusTypeLinks[stKey] || 0) + 1;

            // Type -> Location
            const tlKey = `type_${type}|loc_${loc.id}`;
            typeLocationLinks[tlKey] = (typeLocationLinks[tlKey] || 0) + 1;
        });
    });

    // Convert to links array
    Object.entries(statusTypeLinks).forEach(([key, value]) => {
        const [source, target] = key.split('|');
        if (nodeMap[source] !== undefined && nodeMap[target] !== undefined) {
            links.push({
                source: nodeMap[source],
                target: nodeMap[target],
                value: value
            });
        }
    });

    Object.entries(typeLocationLinks).forEach(([key, value]) => {
        const [source, target] = key.split('|');
        if (nodeMap[source] !== undefined && nodeMap[target] !== undefined) {
            links.push({
                source: nodeMap[source],
                target: nodeMap[target],
                value: value
            });
        }
    });

    return { nodes, links };
}

/**
 * Render Sankey diagram
 */
function renderSankey(data) {
    const container = document.getElementById('sankeyDiagram');
    if (!container) return;

    container.innerHTML = '';

    const width = container.clientWidth;
    const height = container.clientHeight || 400;
    const margin = { top: 10, right: 10, bottom: 10, left: 10 };

    const svg = d3.select(container)
        .append('svg')
        .attr('width', width)
        .attr('height', height);

    // Check if d3.sankey is available
    if (typeof d3.sankey === 'undefined') {
        container.innerHTML = '<p style="padding:40px;text-align:center;color:var(--text-secondary)">Sankey biblioteka nije učitana</p>';
        return;
    }

    const sankey = d3.sankey()
        .nodeWidth(20)
        .nodePadding(15)
        .extent([[margin.left, margin.top], [width - margin.right, height - margin.bottom]]);

    const { nodes, links } = sankey({
        nodes: data.nodes.map(d => Object.assign({}, d)),
        links: data.links.map(d => Object.assign({}, d))
    });

    // Color scale
    const colorScale = {
        'Aktivna': '#00ff88',
        'Na servisu': '#ffbb00',
        'Neispravna': '#ff4444',
        'Neaktivna': '#888888',
        'Povučena': '#555555'
    };

    function getNodeColor(d) {
        if (d.type === 'status') {
            return colorScale[d.name] || '#666';
        }
        return '#4dabf7';
    }

    // Links
    svg.append('g')
        .selectAll('path')
        .data(links)
        .enter()
        .append('path')
        .attr('class', 'sankey-link')
        .attr('d', d3.sankeyLinkHorizontal())
        .attr('stroke', d => getNodeColor(d.source))
        .attr('stroke-width', d => Math.max(1, d.width))
        .on('mouseover', function(event, d) {
            showSankeyTooltip(event, `${d.source.name} → ${d.target.name}: ${d.value}`);
        })
        .on('mouseout', hideSankeyTooltip);

    // Nodes
    const node = svg.append('g')
        .selectAll('g')
        .data(nodes)
        .enter()
        .append('g')
        .attr('class', 'sankey-node');

    node.append('rect')
        .attr('x', d => d.x0)
        .attr('y', d => d.y0)
        .attr('height', d => Math.max(1, d.y1 - d.y0))
        .attr('width', d => d.x1 - d.x0)
        .attr('fill', d => getNodeColor(d));

    // Node labels
    node.append('text')
        .attr('x', d => d.x0 < width / 2 ? d.x1 + 6 : d.x0 - 6)
        .attr('y', d => (d.y1 + d.y0) / 2)
        .attr('dy', '0.35em')
        .attr('text-anchor', d => d.x0 < width / 2 ? 'start' : 'end')
        .text(d => d.name.length > 15 ? d.name.substring(0, 15) + '...' : d.name);
}

/**
 * Show Sankey tooltip
 */
function showSankeyTooltip(event, text) {
    let tooltip = document.querySelector('.sankey-tooltip');
    if (!tooltip) {
        tooltip = document.createElement('div');
        tooltip.className = 'sankey-tooltip';
        document.body.appendChild(tooltip);
    }
    tooltip.innerHTML = text;
    tooltip.style.display = 'block';
    tooltip.style.left = (event.pageX + 10) + 'px';
    tooltip.style.top = (event.pageY - 10) + 'px';
}

/**
 * Hide Sankey tooltip
 */
function hideSankeyTooltip() {
    const tooltip = document.querySelector('.sankey-tooltip');
    if (tooltip) tooltip.style.display = 'none';
}

// ==========================================
// INITIALIZATION
// ==========================================

/**
 * Initialize all advanced visualizations
 */
async function initAdvancedVisualizations(stats) {
    console.log('Initializing advanced visualizations...');

    // Initialize gauges with stats
    if (stats) {
        initGauges(stats);
    }

    // Initialize heatmap
    try {
        const { data: maintenanceData } = await supabase
            .from('maintenance')
            .select('date, cost')
            .gte('date', `${currentHeatmapYear}-01-01`)
            .lte('date', `${currentHeatmapYear}-12-31`);

        await initMaintenanceHeatmap(processMaintenanceForHeatmap(maintenanceData));
    } catch (e) {
        console.warn('Could not load heatmap data:', e);
    }

    // Initialize timeline
    await initEquipmentTimeline();

    // Initialize treemap
    await initInventoryTreemap();

    // Initialize Sankey
    await initSankeyDiagram();

    console.log('Advanced visualizations initialized');
}

// Make functions globally available
window.initAdvancedVisualizations = initAdvancedVisualizations;
window.initGauges = initGauges;
window.changeHeatmapYear = changeHeatmapYear;
window.filterTimeline = filterTimeline;
window.zoomTimeline = zoomTimeline;
window.navigateTreemap = navigateTreemap;
window.showHeatmapTooltip = showHeatmapTooltip;
window.hideHeatmapTooltip = hideHeatmapTooltip;
