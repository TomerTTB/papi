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
// 1. Test to verify 200 status when no query parameters are provided
// 2. Test to verify 200 status when query parameters have invalid values
// 3. Test to verify 400 status when query parameters are empty
// 4. Test to verify 401 status when query parameters are missing   

test.describe('Query Parameters', () => {
    const endpointsToTest = getEndpointsToTest(endpoints, selectedEndpoints);

    for (const endpoint of endpointsToTest) {
        // Skip @/websdk/init endpoint as it accepts any query params
        if (endpoint.path === '@/websdk/init') {
            test.skip(getTestTitle('Query Parameter Tests Skipped - Flexible Endpoint', endpoint), async () => {
                console.log('Skipping query parameter tests for @/websdk/init as it accepts any query parameters');
            });
            continue;
        }

        if (endpoint.config.queryParams && Object.keys(endpoint.config.queryParams).length > 0) {
            
            // Tests for endpoints WITH query parameters

            /**
             * Test to verify the API handles requests without query parameters
             * Verifies that:
             * - Response status is 400 when no query parameters are provided
             * - API returns appropriate error message for missing parameters
             */
            test(getTestTitle('No Query Parameters', endpoint), async ({ request }) => {
                // Only use the headers specified in the endpoint's config
                const headers = endpoint.config.requiredHeaders;
                
                // Create a modified endpoint without query parameters
                const endpointWithoutParams = {
                    ...endpoint,
                    config: {
                        ...endpoint.config,
                        queryParams: undefined,
                        requiredHeaders: endpoint.config.requiredHeaders
                    }
                };
                
                const response = await executeRequest(test, request, endpointWithoutParams, headers);
                expect(response.status()).toBe(400);
                expect(await response.text()).toBe("{'message':'Missing phone model in url parameters'}");
            });

            /**
             * Test to verify the API handles invalid query parameter values
             * Verifies that:
             * - Response status is 200 when invalid values are provided
             */
            test(getTestTitle('Invalid Query Parameters', endpoint), async ({ request }) => {
                // Only use the headers specified in the endpoint's config
                const headers = endpoint.config.requiredHeaders;

                // Create an object with invalid values for each query parameter
                const invalidParams = Object.keys(endpoint.config.queryParams).reduce((acc, param) => {
                    acc[param] = 'invalid_value';
                    return acc;
                }, {});

                // Create a modified endpoint with invalid query parameters
                const endpointWithInvalidParams = {
                    ...endpoint,
                    config: {
                        ...endpoint.config,
                        queryParams: invalidParams,
                        requiredHeaders: endpoint.config.requiredHeaders
                    }
                };

                const response = await executeRequest(test, request, endpointWithInvalidParams, headers);
                expect(response.ok()).toBeTruthy();
                expect(response.status()).toBe(200);
            });

            /**
             * Test to verify the API handles empty query parameter values
             * Verifies that:
             * - Response status is 400 when empty values are provided
             * - API returns appropriate error message for missing parameters
             */
            test(getTestTitle('Empty Query Parameters', endpoint), async ({ request }) => {
                // Only use the headers specified in the endpoint's config
                const headers = endpoint.config.requiredHeaders;

                // Create an object with empty values for each query parameter
                const emptyParams = Object.keys(endpoint.config.queryParams).reduce((acc, param) => {
                    acc[param] = '';
                    return acc;
                }, {});

                // Create a modified endpoint with empty query parameters
                const endpointWithEmptyParams = {
                    ...endpoint,
                    config: {
                        ...endpoint.config,
                        queryParams: emptyParams,
                        requiredHeaders: endpoint.config.requiredHeaders
                    }
                };

                const response = await executeRequest(test, request, endpointWithEmptyParams, headers);
                expect(response.status()).toBe(400);
                expect(await response.text()).toBe("{'message':'Missing phone model in url parameters'}");
            });
        } else {
            // Tests for endpoints WITHOUT query parameters
            /**
             * Test to verify the API handles requests with unexpected query parameters
             * Verifies that:
             * - Response status is 401 when unexpected parameters are provided
             * - API returns appropriate error message for unexpected parameters
             */
            test(getTestTitle('Unexpected Query Parameters', endpoint), async ({ request }) => {
                // Only use the headers specified in the endpoint's config
                const headers = endpoint.config.requiredHeaders;

                // Create a modified endpoint with unexpected query parameters
                const endpointWithUnexpectedParams = {
                    ...endpoint,
                    config: {
                        ...endpoint.config,
                        queryParams: { unexpected_param: 'value' },
                        requiredHeaders: endpoint.config.requiredHeaders
                    }
                };

                const response = await executeRequest(test, request, endpointWithUnexpectedParams, headers);
                expect(response.status()).toBe(401);
                expect(await response.text()).toBe('"Something went wrong"');
            });
        }
    }
});