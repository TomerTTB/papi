const { test, expect } = require('@playwright/test');
const { endpoints, commonHeaders } = require('../config/endpoints');
const { initializeTestEnvironment, getEndpointsToTest, executeRequest, getTestTitle } = require('./helpers/testUtils');
const { getNewPhiSid } = require('./helpers/phiSidUpdater');

const selectedEndpoints = initializeTestEnvironment();

// Ensure BASE_URL_PHI is set
if (!process.env.BASE_URL_PHI) {
    console.warn('BASE_URL_PHI environment variable is not set. Using default: http://localhost:3000');
    process.env.BASE_URL_PHI = 'http://localhost:3000';
}

// Whats in this file?
// 1. Test to verify the API returns a 200 status code for valid requests
// 2. Test to verify the API response time is within the 3.5 second limit
// 3. Test to verify the API returns a 500 status code when using invalid HTTP methods
// 4. Test to verify the server refuses HTTP connections with ECONNREFUSED error

test.describe('Basic Validation', () => {
    const endpointsToTest = getEndpointsToTest(endpoints, selectedEndpoints);

    for (const endpoint of endpointsToTest) {
        /**
         * Test to verify the API returns a 200 status code for valid requests
         * Verifies that:
         * - Response status is 200
         * - Response is successful (ok)
         */
        test(getTestTitle('Status code 200', endpoint), async ({ request }) => {
            // Get new PHI SID if testing go_eyes or user_details_stage
            if (endpoint.path === 'go_eyes' || endpoint.path === 'user_details_stage') {
                const newPhiSid = await getNewPhiSid(test, request);
                // Update the request body with the new PHI SID
                endpoint.config.requestBody.phi_sid = newPhiSid;
            }
            
            // Only use the headers specified in the endpoint's config
            const headers = endpoint.config.requiredHeaders;
            
            const response = await executeRequest(test, request, endpoint, headers);
            
            expect(response.ok()).toBeTruthy();
            expect(response.status()).toBe(200);
        });

        /**
         * Test to verify the API response time is within acceptable limits
         * Verifies that:
         * - Response time is less than 3.5 seconds
         * - API performs within performance expectations
         */
        test(getTestTitle('Response Time Within Limit', endpoint), async ({ request }) => {
            // Get new PHI SID if testing go_eyes or user_details_stage
            if (endpoint.path === 'go_eyes' || endpoint.path === 'user_details_stage') {
                const newPhiSid = await getNewPhiSid(test, request);
                // Update the request body with the new PHI SID
                endpoint.config.requestBody.phi_sid = newPhiSid;
            }
            
            // Only use the headers specified in the endpoint's config
            const headers = endpoint.config.requiredHeaders;

            const startTime = Date.now();
            const response = await executeRequest(test, request, endpoint, headers);
            const duration = Date.now() - startTime;

            expect(duration).toBeLessThan(3500); //Adjust limit based on API performance expectations
        });

        /**
         * Test to verify the API returns a 403 status code for invalid HTTP methods
         * Verifies that:
         * - Using GET instead of POST returns 403
         * - Using POST instead of GET returns 403
         * - Response includes "Missing Authentication Token" message
         * - Only runs for endpoints that support GET or POST methods
         */
        test(getTestTitle('Invalid Method', endpoint), async ({ request }) => {
            if (!['GET', 'POST', 'PUT', 'DELETE'].includes(endpoint.method)) {
                test.skip();
            }

            // Get new PHI SID if testing go_eyes or user_details_stage
            if (endpoint.path === 'go_eyes' || endpoint.path === 'user_details_stage') {
                const newPhiSid = await getNewPhiSid(test, request);
                // Update the request body with the new PHI SID
                endpoint.config.requestBody.phi_sid = newPhiSid;
            }

            // Create a modified endpoint for invalid method test
            const invalidEndpoint = {
                ...endpoint,
                method: endpoint.method === 'GET' ? 'POST' : 'GET',
                config: {
                    ...endpoint.config,
                    requiredHeaders: endpoint.config.requiredHeaders
                }
            };

            const response = await executeRequest(test, request, invalidEndpoint, endpoint.config.requiredHeaders);
            expect(response.status()).toBe(403);
            
            const responseBody = await response.json();
            expect(responseBody).toEqual({
                message: "Missing Authentication Token"
            });
        });

        /**
         * Test to verify the server refuses HTTP connections
         * Verifies that:
         * - Server returns ECONNREFUSED for HTTP connections
         * - Only runs when BASE_URL_PHI uses HTTPS
         * - Original HTTPS connection is restored after test
         */
        test(getTestTitle('Server Should Refuse HTTP Connection', endpoint), async ({ request }) => {
            // For PHI endpoints, check BASE_URL_PHI instead of BASE_URL
            const baseUrl = endpoint.product === 'PHI' ? process.env.BASE_URL_PHI : process.env.BASE_URL;
            if (!baseUrl.startsWith('https://')) {
                test.skip('Test only runs when base URL uses HTTPS');
            }

            // Get new PHI SID if testing go_eyes or user_details_stage
            if (endpoint.path === 'go_eyes' || endpoint.path === 'user_details_stage') {
                const newPhiSid = await getNewPhiSid(test, request);
                // Update the request body with the new PHI SID
                endpoint.config.requestBody.phi_sid = newPhiSid;
            }

            // Create a modified endpoint for HTTP test
            const httpEndpoint = {
                ...endpoint,
                config: {
                    ...endpoint.config,
                    requiredHeaders: endpoint.config.requiredHeaders
                }
            };

            // Override the appropriate base URL environment variable temporarily
            const originalBaseUrl = baseUrl;
            if (endpoint.product === 'PHI') {
                process.env.BASE_URL_PHI = process.env.BASE_URL_PHI.replace('https://', 'http://');
            } else {
                process.env.BASE_URL = process.env.BASE_URL.replace('https://', 'http://');
            }

            try {
                await test.step('Testing HTTP Connection', async () => {
                    console.log('Original HTTPS URL:', originalBaseUrl);
                    console.log('Testing HTTP URL:', endpoint.product === 'PHI' ? process.env.BASE_URL_PHI : process.env.BASE_URL);
                    console.log('Method:', endpoint.method);
                    
                    try {
                        await executeRequest(test, request, httpEndpoint, endpoint.config.requiredHeaders);
                        throw new Error('Expected connection to be refused');
                    } catch (error) {
                        if (!error.message.includes('ECONNREFUSED')) {
                            throw error; // Re-throw if it's not the expected error
                        }
                        console.log('Received expected ECONNREFUSED error');
                        expect(error.message).toContain('ECONNREFUSED');
                    }
                });
            } finally {
                // Restore the original base URL
                if (endpoint.product === 'PHI') {
                    process.env.BASE_URL_PHI = originalBaseUrl;
                } else {
                    process.env.BASE_URL = originalBaseUrl;
                }
            }
        });
    }
});