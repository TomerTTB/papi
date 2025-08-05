const { expect } = require('@playwright/test');
const path = require('path');
const fs = require('fs');

// Initialize environment and get selected endpoints
function initializeTestEnvironment() {
    const selectedEndpoints = process.env.TEST_ENDPOINTS ? JSON.parse(process.env.TEST_ENDPOINTS) : [];
    
    if (!process.env.BASE_URL) {
        console.warn('BASE_URL environment variable is not set. Using default: http://localhost:3000');
        process.env.BASE_URL = 'http://localhost:3000';
    }

    return selectedEndpoints;
}

// Get endpoints to test based on selected endpoints
function getEndpointsToTest(endpoints, selectedEndpoints) {
    return endpoints.filter(endpoint => 
        selectedEndpoints.some(selected => 
            selected.path === endpoint.path && 
            selected.product === endpoint.product
        )
    );
}

// Get test cases for an endpoint
function getTestCases(endpoint) {
    if (endpoint.testCases && endpoint.testCases.length > 0) {
        return endpoint.testCases;
    }
    // For backward compatibility, create a default test case from endpoint config
    return [{
        name: 'Default',
        config: endpoint.config
    }];
}

// Function to get test title with tag
function getTestTitle(testName, endpoint, testCase) {
    // If path already starts with @, don't add another one
    const path = endpoint.path.startsWith('@') ? endpoint.path : `@${endpoint.path}`;
    const testCaseName = testCase ? ` [${testCase.name}]` : '';
    return `${endpoint.product} › ${testName}${testCaseName} ${path}`;
}

// Build request configuration
async function buildRequestConfig(endpoint, testCase, headers = null) {
    const method = (endpoint.method || 'GET').toLowerCase();
    const config = testCase ? testCase.config : endpoint.config;
    
    // Set base headers
    const requestHeaders = {
        ...(headers || {})
    };

    // Add query params to URL if any
    const params = config.queryParams || {};

    if (method === 'post' && endpoint.product === 'PD' && endpoint.path === '@/pd/verify') {
        // Create multipart form data
        const boundary = '----WebKitFormBoundary' + Math.random().toString(36).substring(2);
        const formParts = [];

        // Add form fields
        if (config.formData) {
            for (const [key, value] of Object.entries(config.formData)) {
                formParts.push(
                    `--${boundary}\r\n` +
                    `Content-Disposition: form-data; name="${key}"\r\n\r\n` +
                    `${value}\r\n`
                );
            }
        }

        // Handle file upload
        if (config.fileParams) {
            for (const [fieldName, fileInfo] of Object.entries(config.fileParams)) {
                const fileBuffer = fs.readFileSync(fileInfo.path);
                formParts.push(
                    `--${boundary}\r\n` +
                    `Content-Disposition: form-data; name="${fieldName}"; filename="${path.basename(fileInfo.path)}"\r\n` +
                    `Content-Type: ${fileInfo.type}\r\n\r\n`
                );
                formParts.push(fileBuffer);
                formParts.push('\r\n');
            }
        }

        // Add final boundary
        formParts.push(`--${boundary}--\r\n`);

        // Combine all parts into a single buffer
        const body = Buffer.concat(
            formParts.map(part => Buffer.isBuffer(part) ? part : Buffer.from(part))
        );

        return {
            method,
            headers: {
                ...requestHeaders,
                'Content-Type': `multipart/form-data; boundary=${boundary}`,
                'Content-Length': body.length.toString()
            },
            data: body,
            params
        };
    }

    // Handle other requests
    if (method === 'post' && config.requestBody) {
        return {
            method,
            headers: {
                ...requestHeaders,
                'Content-Type': 'application/json'
            },
            data: config.requestBody,
            params
        };
    }

    return {
        method,
        headers: requestHeaders,
        params
    };
}

// Execute request and handle response
async function executeRequest(test, request, endpoint, headers = null, testCase = null) {
    const baseUrl = endpoint.product === 'PHI' ? process.env.BASE_URL_PHI : process.env.BASE_URL;
    const fullUrl = `${baseUrl}${endpoint.path}`;
    const requestConfig = await buildRequestConfig(endpoint, testCase, headers);

    const config = testCase ? testCase.config : endpoint.config;
    await logRequestDetails(test, fullUrl, requestConfig.method, endpoint, requestConfig.headers, config);
    await logMakingRequest(test, requestConfig.method, fullUrl, requestConfig);

    if (config.delay) {
        await test.step('Simulating Delay', async () => {
            await new Promise(resolve => setTimeout(resolve, config.delay));
        });
    }

    const response = await request[requestConfig.method](fullUrl, requestConfig);
    await logResponseDetails(test, response);

    return response;
}

// Log request details
async function logRequestDetails(test, fullUrl, method, endpoint, headers, config) {
    await test.step('Request Details', async () => {
        console.log('Full URL:', fullUrl);
        console.log('Method:', method.toUpperCase());
        console.log('Query Params:', config.queryParams);
        console.log('Headers:', headers);
        if (method === 'post' && config.requestBody) {
            console.log('Request Body:', JSON.stringify(config.requestBody, null, 2));
        }
    });
}

// Log making request
async function logMakingRequest(test, method, fullUrl, requestConfig) {
    await test.step('Making Request', async () => {
        console.log(`Sending ${method.toUpperCase()} request to ${fullUrl}`);
        
        // Create a clean version of the config for logging
        const cleanConfig = {
            ...requestConfig,
            data: requestConfig.data instanceof Buffer 
                ? '<Binary Data Buffer>' 
                : requestConfig.data
        };
        
        console.log('Request Config:', JSON.stringify(cleanConfig, null, 2));
    });
}

// Log response details
async function logResponseDetails(test, response) {
    await test.step('Response Details', async () => {
        console.log('Status:', response.status());
        console.log('Headers:', response.headers());
        
        try {
            const responseData = await response.json();
            console.log('Response:', JSON.stringify(responseData, null, 2));
        } catch (error) {
            const text = await response.text();
            console.log('Response (non-JSON):', text);
        }
    });
}

module.exports = {
    initializeTestEnvironment,
    getEndpointsToTest,
    executeRequest,
    getTestTitle,
    getTestCases
}; 