// Debug flag
const DEBUG_MODE = false; // Set to true during development, false in production

// Timer variables
let timerInterval;
let startTime;

// Test name mapping function
function getDisplayName(testPath) {
    const testNameMap = {
        'basic.spec.js': {
            name: 'Basic Suite',
            description: 'This test suite verifies the API functionality by checking status codes, response times, handling invalid HTTP methods, and ensuring proper refusal of HTTP connections.'
        },
        'basic-phi.spec.js': {
            name: 'Basic PHI Suite',
            description: 'This test suite verifies the API functionality by checking status codes, response times, handling invalid HTTP methods, and ensuring proper refusal of HTTP connections.'
        },
        'headers.spec.js': {
            name: 'Headers Suite',
            description: 'This test suite validates the handling of API response headers, ensuring proper configuration for security, caching, CORS, and AWS Gateway headers, while also checking error responses for missing or invalid headers.'
        },
        'headers-attachments.spec.js': {
            name: 'Headers Attachments Suite',
            description: 'This test suite validates the handling of API response headers, ensuring proper configuration for security, caching, and AWS Gateway headers, while also checking error responses for missing or invalid headers.'
        },
        'headers-phi.spec.js': {
            name: 'Headers PHI Suite',
            description: 'This test suite validates the handling of API response headers, ensuring proper configuration for security, caching, and AWS Gateway headers, while also checking error responses for missing or invalid headers.'
        },
        'headers-pd.spec.js': {
            name: 'Headers PD Suite',
            description: 'This test suite validates the handling of API response headers, ensuring proper configuration for security, caching, and AWS Gateway headers, while also checking error responses for missing or invalid headers.'
        },  
        'headers-va.spec.js': {
            name: 'Headers VA Suite',
            description: 'This test suite validates the handling of API response headers, ensuring proper configuration for security, caching, and AWS Gateway headers, while also checking error responses for missing or invalid headers.'
        },
        'query-params.spec.js': {
            name: 'Query Params Suite',
            description: 'This suite tests API query parameter handling, ensuring correct responses for missing, invalid, empty, or unexpected parameters to enforce security and validation.'
        },
        'response-structure.spec.js': {
            name: 'Response Structure Suite',
            description: 'This test suite verifies the structural integrity of API responses, ensuring they are well-formed, correctly formatted, and adhere to expected schema and size constraints.'
        },
        'response-comparison.spec.js': {
            name: 'Response Comparison Suite',
            description: 'This suite performs in-depth comparisons of API response values, ensuring accuracy, consistency, and adherence to expected formats across different scenarios.'
        },
        'validation.spec.js': {
            name: 'Validation',
            description: 'Negative, invalid inputs and edge cases to assist with tests validation. - <span style="color: red;">Only Run for New PAPI Versions.</span>'
        },
        'upload-attachments.spec.js': {
            name: 'Upload Attachments Suite',
            description: 'This suite verifies file upload functionality by testing S3 object retrieval, upload request execution with proper headers, and validating successful uploads via expected status codes.'
        }
    };
    
    // Get the filename from the path
    const fileName = testPath.split('/').pop();
    // Return the mapped info or a default object if no mapping exists
    return testNameMap[fileName] || { name: fileName, description: '' };
}

function startTimer() {
    const timerContainer = document.getElementById('timerContainer');
    const timerElement = document.getElementById('timer');
    timerContainer.classList.remove('d-none');
    startTime = Date.now();
    
    timerInterval = setInterval(() => {
        const elapsedTime = Date.now() - startTime;
        const hours = Math.floor(elapsedTime / 3600000);
        const minutes = Math.floor((elapsedTime % 3600000) / 60000);
        const seconds = Math.floor((elapsedTime % 60000) / 1000);
        
        timerElement.textContent = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }, 1000);
}

function stopTimer() {
    clearInterval(timerInterval);
}

function setupSelectAll(selectAllId, checkboxClass, defaultChecked = true) {
    const selectAllCheckbox = document.getElementById(selectAllId);
    const checkboxes = document.getElementsByClassName(checkboxClass);

    // Set initial state based on actual checkbox states
    const allChecked = Array.from(checkboxes).every(checkbox => checkbox.checked);
    selectAllCheckbox.checked = allChecked;
    
    // Don't override existing checkbox states
    Array.from(checkboxes).forEach(checkbox => {
        if (!checkbox.hasAttribute('checked')) {
            // Don't check validation tests by default
            const isValidationTest = checkbox.value === 'validation.spec.js';
            checkbox.checked = isValidationTest ? false : defaultChecked;
        }
    });

    selectAllCheckbox.addEventListener('change', function() {
        Array.from(checkboxes).forEach(checkbox => {
            checkbox.checked = this.checked;
        });
        updateButtonState();
    });

    // Update select all when individual checkboxes change
    Array.from(checkboxes).forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const allChecked = Array.from(checkboxes).every(c => c.checked);
            selectAllCheckbox.checked = allChecked;
            updateButtonState();
        });
    });
}

function setupRunTests() {
    const runButton = document.getElementById('runTestsBtn');
    runButton.addEventListener('click', sendSelectionToServer);
    updateButtonState();
}

function updateButtonState() {
    const selectedEndpoints = getSelectedValues('.endpoint-checkbox:checked');
    const selectedTests = getSelectedValues('.test-checkbox:checked');
    const runButton = document.getElementById('runTestsBtn');
    runButton.disabled = selectedEndpoints.length === 0 || selectedTests.length === 0;
}

function getSelectedValues(selector) {
    if (selector.includes('endpoint-checkbox')) {
        return Array.from(document.querySelectorAll(selector)).map(checkbox => ({
            path: checkbox.value,
            product: checkbox.dataset.product
        }));
    }
    return Array.from(document.querySelectorAll(selector)).map(checkbox => checkbox.value);
}

async function sendSelectionToServer() {
    const selectedEndpoints = getSelectedValues('.endpoint-checkbox:checked');
    const selectedTests = getSelectedValues('.test-checkbox:checked');
    
    if (selectedEndpoints.length === 0 || selectedTests.length === 0) {
        return;
    }
    
    const statusMessage = document.getElementById('statusMessage');
    const responseContainer = document.getElementById('responseContainer');
    const responseContent = document.getElementById('responseContent');
    const runButton = document.getElementById('runTestsBtn');
    
    // Start the timer when tests begin
    startTimer();
    
    // Disable button and show sending status
    runButton.disabled = true;
    statusMessage.textContent = 'Sending selection to server...';
    responseContainer.style.display = 'none';
    
    try {
        // Send the selections to the server
        const response = await fetch('http://localhost:3000/runTests', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                selection: {
                    endpoints: selectedEndpoints.map(endpoint => ({
                        path: endpoint.path,
                        product: endpoint.product
                    })),
                    tests: selectedTests
                }
            })
        });
        
        // Parse and display the response
        const data = await response.json();
        
        // Stop the timer when tests finish
        stopTimer();
        
        // Only show response container in debug mode
        if (DEBUG_MODE) {
            responseContent.textContent = JSON.stringify(data, null, 2);
            responseContainer.style.display = 'block';
        } else {
            responseContainer.style.display = 'none';
        }
        
        if (response.ok) {
            statusMessage.textContent = 'Tests have finished running. Report is now open for your review.';
            
            // Generate timestamp for report file name
            const now = new Date();
            const timestamp = now.toISOString().split(':').slice(0, 2).join('-').replace('T', '-');
            const reportFilename = `report-${timestamp}.html`;
            
            // Trigger report download
            const downloadUrl = `http://localhost:3000/report/${reportFilename}`;
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = reportFilename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } else {
            statusMessage.textContent = `Error: ${data.error || 'Unknown error'}`;
            if (DEBUG_MODE) {
                console.error('Server error:', data);
            }
        }
    } catch (error) {
        // Handle errors
        stopTimer();
        statusMessage.textContent = `Error: ${error.message}`;
        if (DEBUG_MODE) {
            responseContent.textContent = error.toString();
            responseContainer.style.display = 'block';
            console.error('Request error:', error);
        }
    } finally {
        // Re-enable the button and update state
        runButton.disabled = false;
        updateButtonState();
    }
}

function showError(message) {
    const errorHtml = `<div class="alert alert-danger">Error: ${message}</div>`;
    document.getElementById('endpointsList').innerHTML = errorHtml;
    document.getElementById('testsList').innerHTML = errorHtml;
}

// Initialize page when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const productName = urlParams.get('name');
    
    if (!productName) {
        window.location.href = '/';
        return;
    }

    document.getElementById('productName').textContent = productName;
    document.getElementById('product-breadcrumb').textContent = productName;
    
    try {
        const response = await fetch('http://localhost:3000/productDetails');
        const data = await response.json();
        
        const product = data.find(p => p.name === productName);
        
        if (!product) {
            showError('Product not found');
            return;
        }

        // Set base URL
        document.getElementById('baseUrl').textContent = product.baseURL;

        // Set product-specific base URLs
        if (productName === 'Attachments' && product.baseURL_ATTACHMENTS) {
            document.getElementById('attachmentUrl').textContent = `${product.baseURL_ATTACHMENTS}`;
        } else if (productName === 'PHI' && product.baseURL_PHI) {
            document.getElementById('attachmentUrl').textContent = `${product.baseURL_PHI}`;
        }

        // Set endpoints
        document.getElementById('endpointsList').innerHTML = product.paths.map(path => `
            <div class="path-item">
                <div class="d-flex align-items-center">
                    <div class="form-check mb-0 d-flex align-items-center">
                        <input class="form-check-input endpoint-checkbox" type="checkbox" 
                               value="${path}" 
                               data-product="${product.name}"
                               id="endpoint-${path}" checked>
                        <label class="form-check-label" for="endpoint-${path}">
                            ${path}
                        </label>
                    </div>
                </div>
            </div>
        `).join('');

        // Set tests with display names and descriptions
        document.getElementById('testsList').innerHTML = product.tests && product.tests.length > 0 
            ? product.tests.map(test => {
                const testInfo = getDisplayName(test);
                const isValidationTest = test === 'validation.spec.js';
                return `
                    <div class="path-item">
                        <div class="d-flex align-items-start">
                            <div class="form-check mb-0">
                                <input class="form-check-input test-checkbox" type="checkbox" value="${test}" id="test-${test}" ${isValidationTest ? '' : 'checked'}>
                                <label class="form-check-label" for="test-${test}">
                                    <div class="test-name">${testInfo.name}</div>
                                    <div class="test-description">${testInfo.description}</div>
                                </label>
                            </div>
                        </div>
                    </div>
                `;
            }).join('')
            : '<p class="text-muted">No tests available</p>';

        // Setup select all functionality after a short delay to ensure DOM is ready
        setTimeout(() => {
            setupSelectAll('selectAllEndpoints', 'endpoint-checkbox', true);
            setupSelectAll('selectAllTests', 'test-checkbox', true);
        }, 0);

        // Setup run tests button
        setupRunTests();

    } catch (error) {
        showError(error.message);
    }
}); 