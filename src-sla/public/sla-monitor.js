// Endpoint display name mapping
const endpointDisplayNames = {
    '@/mobile/init': 'GoEyes Mobile Init',
    '@/go-eyes/weakEyeRelaxed': 'GoEyes WeakEyeRelaxed',
    '@/go-eyes/save-station': 'GoEyes Save Station',
    '@/face-distance-calibration/ffc-calculation': 'FFC Calculation',
    'attachments': 'GoEyes Attachments',
    'questionnaire_stage': 'PHI Questionnaire',
    '@/websdk/init': 'PD WebSDK Init',
    '@/webcompanion/init': 'Lenses WebCompanion Init',
    '@/go-va/bino/increase': 'VA Bino Increase',
};

// Define endpoints by region
const regionEndpoints = {
    US: [
        // '/a',
        // '/b',
        // '/c',
        '@/mobile/init',
        '@/go-eyes/weakEyeRelaxed',
        '@/go-eyes/save-station',
        '@/face-distance-calibration/ffc-calculation',
        'attachments',
        // 'questionnaire_stage',
        '@/websdk/init',       
        '@/webcompanion/init',
        '@/go-va/bino/increase',
    ],
    EU: [
        '@/mobile/init',
        '@/go-eyes/weakEyeRelaxed',
        '@/go-eyes/save-station',
        '@/face-distance-calibration/ffc-calculation',
        'attachments',
        // 'questionnaire_stage',
        '@/websdk/init',   
        '@/webcompanion/init',
        '@/go-va/bino/increase',
    ]
};

function fetchStatus() {
    fetch('/api/status')
        .then(response => response.json())
        .then(data => {
            updateStatusGrid(data);
            updateRunInfo(data.currentRun);
        })
        .catch(error => console.error('Error fetching status:', error));
}

function createEndpointCard(path, info, region) {
    const displayName = endpointDisplayNames[path] || path.replace(/^@\//, '');
    const statusClass = info.status.success ? 'success' : 'failure';
    const statusText = info.status.success ? '✅ Success' : '❌ Failed';
    const lastChecked = new Date(info.lastChecked).toLocaleString();
    const responseTime = info.status.responseTime ? `${info.status.responseTime.toFixed(2)}ms` : 'N/A';
    const compliance = info.compliance !== undefined ? `${info.compliance.toFixed(1)}%` : 'N/A';
    
    const col = document.createElement('div');
    col.className = 'col-md-4 mb-4';
    
    col.innerHTML = `
        <div class="product-card h-100 p-3">
            <h3 class="mb-2">
                <span class="text-dark">
                    ${displayName}
                </span>
            </h3>
            <div class="mb-2">
                <p class="mb-1 ${statusClass} fw-bold">${statusText}</p>
                <p class="mb-0 font-monospace text-muted small">Attempts: ${info.status.attempts}</p>
                <p class="mb-0 font-monospace text-muted small">Response Time: ${responseTime}</p>
                <p class="mb-0 font-monospace text-muted small">Compliance: ${compliance}</p>
            </div>
            <p class="mb-0 text-muted small">Last Checked: ${lastChecked}</p>
        </div>
    `;
    
    return col;
}

function createSSLCard(domain, info, threshold) {
    let statusClass;
    let statusText;
    
    if (!info.valid) {
        statusClass = 'failure';
        statusText = '❌ Invalid';
    } else if (info.daysUntilExpiry <= threshold) {
        statusClass = 'in-progress';
        statusText = '⚠️ Expiring Soon';
    } else {
        statusClass = 'success';
        statusText = '✅ Valid';
    }
    
    const lastChecked = new Date(info.lastChecked).toLocaleString();
    const expiryDate = info.expiryDate ? new Date(info.expiryDate).toLocaleDateString() : 'N/A';
    
    const col = document.createElement('div');
    col.className = 'col-md-6 mb-4';
    
    col.innerHTML = `
        <div class="product-card h-100 p-3">
            <h3 class="h5 mb-2">
                <span class="text-dark">
                    ${domain}
                </span>
            </h3>
            <div class="mb-2">
                <p class="mb-1 ${statusClass} fw-bold">${statusText}</p>
                ${info.valid ? `
                    <p class="mb-0 font-monospace text-muted small">Days until expiry: <span class="${info.daysUntilExpiry <= threshold ? 'text-warning fw-bold' : ''}">${info.daysUntilExpiry}</span></p>
                    <p class="mb-0 font-monospace text-muted small">Expires on: ${expiryDate}</p>
                ` : `
                    <p class="mb-0 font-monospace text-muted small text-danger">Error: ${info.error || 'Unknown error'}</p>
                `}
            </div>
            <p class="mb-0 text-muted small">Last Checked: ${lastChecked}</p>
        </div>
    `;
    
    return col;
}

function updateStatusGrid(data) {
    const grid = document.getElementById('status-grid');
    grid.innerHTML = '';
    
    const container = document.createElement('div');
    
    // Process each region independently
    Object.entries(regionEndpoints).forEach(([region, endpoints]) => {
        const regionSection = document.createElement('div');
        regionSection.className = 'mb-5';
        regionSection.innerHTML = `<h2 class="mb-4">Region ${region}</h2>`;
        
        // Add SSL certificates section
        if (data.ssl && data.ssl.certificates && data.ssl.certificates[region]) {
            const sslGrid = document.createElement('div');
            sslGrid.className = 'row g-4 mb-4';
            
            Object.entries(data.ssl.certificates[region]).forEach(([domain, info]) => {
                sslGrid.appendChild(createSSLCard(domain, info, data.ssl.threshold));
            });
            
            regionSection.appendChild(sslGrid);
        }
        
        // Add endpoints section
        const endpointsGrid = document.createElement('div');
        endpointsGrid.className = 'row g-4';
        
        // Only display endpoints that have been tested
        endpoints.forEach(path => {
            if (data.endpoints[region] && data.endpoints[region][path]) {
                endpointsGrid.appendChild(createEndpointCard(path, data.endpoints[region][path], region));
            }
        });
        
        // Only add the endpoints section if it has any endpoints to display
        if (endpointsGrid.children.length > 0) {
            regionSection.appendChild(endpointsGrid);
        }
        
        container.appendChild(regionSection);
    });
    
    // Add any endpoints that aren't categorized (only if they have been tested)
    const uncategorizedEndpoints = Object.keys(data.endpoints).filter(region => 
        region !== 'US' && region !== 'EU'
    ).flatMap(region => 
        Object.keys(data.endpoints[region]).filter(path => 
            !regionEndpoints.US.includes(path) && !regionEndpoints.EU.includes(path)
        )
    );
    
    if (uncategorizedEndpoints.length > 0) {
        const otherSection = document.createElement('div');
        otherSection.className = 'mb-5';
        otherSection.innerHTML = '<h2 class="mb-4">Other Endpoints</h2>';
        
        const otherGrid = document.createElement('div');
        otherGrid.className = 'row g-4';
        
        uncategorizedEndpoints.forEach(path => {
            // Find the region that contains this endpoint
            const region = Object.keys(data.endpoints).find(r => data.endpoints[r][path]);
            if (region && data.endpoints[region][path]) {
                otherGrid.appendChild(createEndpointCard(path, data.endpoints[region][path], region));
            }
        });
        
        // Only add the other section if it has any endpoints to display
        if (otherGrid.children.length > 0) {
            otherSection.appendChild(otherGrid);
            container.appendChild(otherSection);
        }
    }
    
    grid.appendChild(container);
}

function updateRunInfo(runInfo) {
    const runInfoDiv = document.getElementById('run-info');
    const status = runInfo.inProgress ? 
        '<span class="in-progress">⚡ In Progress</span>' : 
        '<span class="success">✓ Completed</span>';
    
    runInfoDiv.innerHTML = `
        <p class="mb-2">Status: ${status}</p>
        <p class="mb-2">Start Time: ${runInfo.startTime ? new Date(runInfo.startTime).toLocaleString() : 'N/A'}</p>
        <p class="mb-0">End Time: ${runInfo.endTime ? new Date(runInfo.endTime).toLocaleString() : 'N/A'}</p>
    `;
}

// Initial fetch
document.addEventListener('DOMContentLoaded', () => {
    fetchStatus();
    // Auto-refresh every 30 seconds
    setInterval(fetchStatus, 30000);
}); 