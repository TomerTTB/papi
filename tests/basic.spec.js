const { test, expect } = require('@playwright/test');
const { endpoints, commonHeaders } = require('../config/endpoints');
const { initializeTestEnvironment, getEndpointsToTest, executeRequest, getTestTitle } = require('./helpers/testUtils');

const selectedEndpoints = initializeTestEnvironment();

// Ensure BASE_URL is set
if (!process.env.BASE_URL) {
    console.warn('BASE_URL environment variable is not set. Using default: http://localhost:3000');
    process.env.BASE_URL = 'http://localhost:3000';
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
            const response = await executeRequest(test, request, endpoint, endpoint.config.requiredHeaders);
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
            const startTime = Date.now();
            const response = await executeRequest(test, request, endpoint, endpoint.config.requiredHeaders);
            const duration = Date.now() - startTime;

            expect(duration).toBeLessThan(3500); //Adjust limit based on API performance expectations
        });

        /**
         * Test to verify the API returns a 500 status code for invalid HTTP methods
         * Verifies that:
         * - Using GET instead of POST returns 500
         * - Using POST instead of GET returns 500
         * - Only runs for endpoints that support GET or POST methods
         */
        test(getTestTitle('Invalid Method', endpoint), async ({ request }) => {
            if (!['GET', 'POST', 'PUT', 'DELETE'].includes(endpoint.method)) {
                test.skip();
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
            expect(response.status()).toBe(500);
        });

        /**
         * Test to verify the server refuses HTTP connections
         * Verifies that:
         * - Server returns ECONNREFUSED for HTTP connections
         * - Only runs when BASE_URL uses HTTPS
         * - Original HTTPS connection is restored after test
         */
        test(getTestTitle('Server Should Refuse HTTP Connection', endpoint), async ({ request }) => {
            if (!process.env.BASE_URL.startsWith('https://')) {
                test.skip('Test only runs when BASE_URL uses HTTPS');
            }

            // Create a modified endpoint for HTTP test
            const httpEndpoint = {
                ...endpoint,
                config: {
                    ...endpoint.config,
                    requiredHeaders: endpoint.config.requiredHeaders
                }
            };

            // Override the BASE_URL environment variable temporarily
            const originalBaseUrl = process.env.BASE_URL;
            process.env.BASE_URL = process.env.BASE_URL.replace('https://', 'http://');

            try {
                await test.step('Testing HTTP Connection', async () => {
                    console.log('Original HTTPS URL:', originalBaseUrl);
                    console.log('Testing HTTP URL:', process.env.BASE_URL);
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
                // Restore the original BASE_URL
                process.env.BASE_URL = originalBaseUrl;
            }
        });
    }
});