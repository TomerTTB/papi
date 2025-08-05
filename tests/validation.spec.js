const { test, expect } = require('@playwright/test');
const { endpoints, commonHeaders } = require('../config/endpoints');
const { initializeTestEnvironment, getEndpointsToTest, executeRequest, getTestTitle } = require('./helpers/testUtils');

const selectedEndpoints = initializeTestEnvironment();

test.describe('Basic Tests Validation', () => {
    const endpointsToTest = getEndpointsToTest(endpoints, selectedEndpoints);

    for (const endpoint of endpointsToTest) {
        test(getTestTitle('Negative Test: Should NOT Return 200', endpoint), async ({ request }) => {
            const response = await executeRequest(test, request, endpoint, {});
            expect(response.ok()).toBeFalsy();
            expect(response.status()).not.toBe(200);
        });

        test(getTestTitle('Negative Test: Response Time Should Exceed Limit', endpoint), async ({ request }) => {
            // Create a delayed endpoint configuration
            const delayedEndpoint = {
                ...endpoint,
                config: {
                    ...endpoint.config,
                    delay: 4000, // Add delay configuration that testUtils will handle
                    requiredHeaders: {
                        ...commonHeaders,
                        ...endpoint.config.requiredHeaders
                    }
                }
            };

            const startTime = Date.now();
            await executeRequest(test, request, delayedEndpoint, commonHeaders);
            expect(Date.now() - startTime).toBeGreaterThan(3500);
        });

        test(getTestTitle('Negative Test: Should NOT return JSON', endpoint), async ({ request }) => {
            // Create an invalid endpoint configuration
            const invalidEndpoint = {
                ...endpoint,
                path: `${endpoint.path}-invalid`,
                config: {
                    ...endpoint.config,
                    requiredHeaders: {
                        ...commonHeaders,
                        ...endpoint.config.requiredHeaders
                    }
                }
            };

            const response = await executeRequest(test, request, invalidEndpoint, commonHeaders);
            expect(response.headers()['content-type']).not.toContain('application/json');
        });

        test(getTestTitle('Negative Test: Valid Request Should NOT Return 500', endpoint), async ({ request }) => {
            if (!['GET', 'POST', 'PUT', 'DELETE'].includes(endpoint.method)) {
                test.skip();
            }

            const validEndpoint = {
                ...endpoint,
                config: {
                    ...endpoint.config,
                    requiredHeaders: {
                        ...commonHeaders,
                        ...endpoint.config.requiredHeaders
                    }
                }
            };

            const response = await executeRequest(test, request, validEndpoint, commonHeaders);
            expect(response.status()).not.toBe(500);
        });

        test(getTestTitle('Negative Test: Should NOT Refuse Secure Requests', endpoint), async ({ request }) => {
            if (!process.env.BASE_URL.startsWith('https://')) {
                test.skip('Test only runs when BASE_URL uses HTTPS');
            }

            const httpsEndpoint = {
                ...endpoint,
                config: {
                    ...endpoint.config,
                    requiredHeaders: commonHeaders
                }
            };

            const response = await executeRequest(test, request, httpsEndpoint, commonHeaders);
            expect(response.ok()).toBeTruthy();
        });
    }
}); 