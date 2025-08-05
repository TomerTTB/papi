const { test, expect } = require('@playwright/test');
const { endpoints, commonHeaders } = require('../config/endpoints');
const { initializeTestEnvironment, getEndpointsToTest, executeRequest, getTestTitle } = require('./helpers/testUtils');
const { getNewPhiSid } = require('./helpers/phiSidUpdater');

const selectedEndpoints = initializeTestEnvironment();

// Whats in this file?
// 1. Test to verify the API returns the correct content type
// 2. Test to verify Cache-Control header directives
// 3. Test to verify Connection header is keep-alive
// 4. Test to verify all expected AWS API Gateway headers are present in the response
// 5. Test to verify server handles missing x-api-key header correctly (expects 403 Forbidden)
// 6. Test to verify server handles empty x-api-key header correctly (expects 403 Forbidden)
// 7. Test to verify server handles invalid x-api-key header correctly (expects 403 Forbidden)

// Ensure BASE_URL is set
if (!process.env.BASE_URL) {
    console.warn('BASE_URL environment variable is not set. Using default: http://localhost:3000');
    process.env.BASE_URL = 'http://localhost:3000';
}

test.describe('Headers Validation', () => {
    const endpointsToTest = getEndpointsToTest(endpoints, selectedEndpoints);

    for (const endpoint of endpointsToTest) {
        //  Ensures all responses have the correct Content-Type header
        test(getTestTitle('Response Has Correct Content-Type', endpoint), async ({ request }) => {
            // Get new PHI SID if testing go_eyes or user_details_stage
            if (endpoint.path === 'go_eyes' || endpoint.path === 'user_details_stage') {
                const newPhiSid = await getNewPhiSid(test, request);
                endpoint.config.requestBody.phi_sid = newPhiSid;
            }

            const headers = endpoint.config.requiredHeaders;
            const response = await executeRequest(test, request, endpoint, headers);
            expect(response.headers()['content-type']).toContain('application/json');
        });


        //  Test CORS header behavior
        //  1. Wildcard (*): Server allows any origin, must return * exactly
        //  2. Specific origins: Server should echo back the exact requesting origin
        // test(getTestTitle('CORS No Origin Returns Wildcard', endpoint), async ({ request }) => {
        //     const headers = {
        //         ...endpoint.config.requiredHeaders
        //         // No Origin header sent
        //     };
            
        //     const response = await executeRequest(test, request, endpoint, headers);
        //     const corsHeader = response.headers()['access-control-allow-origin'];
            
        //     // Should return wildcard when no Origin is specified
        //     expect(corsHeader).toBe('*');
        //     // When using wildcard, credentials must not be allowed
        //     expect(response.headers()['access-control-allow-credentials']).toBeFalsy();
        // });


        // test(getTestTitle('CORS Origin Echoed Back', endpoint), async ({ request }) => {
        //     const headers = {
        //         ...endpoint.config.requiredHeaders,
        //         Origin: 'https://any-origin.com'
        //     };
            
        //     const response = await executeRequest(test, request, endpoint, headers);
        //     const corsHeader = response.headers()['access-control-allow-origin'];
            
        //     // Server should echo back the specific origin
        //     expect(corsHeader).toBe('https://any-origin.com');
        //     // When echoing specific origin, credentials might be allowed
        //     if (response.headers()['access-control-allow-credentials']) {
        //         expect(response.headers()['access-control-allow-credentials']).toBe('true');
        //     }
        // });


        //  Test Cache-Control header directives
        test(getTestTitle('Cache Control Directives', endpoint), async ({ request }, testInfo) => {
            // Get new PHI SID if testing go_eyes or user_details_stage
            if (endpoint.path === 'go_eyes' || endpoint.path === 'user_details_stage') {
                const newPhiSid = await getNewPhiSid(test, request);
                endpoint.config.requestBody.phi_sid = newPhiSid;
            }

            const headers = endpoint.config.requiredHeaders;
            const response = await executeRequest(test, request, endpoint, headers);
            const cacheControl = response.headers()['cache-control'];
        
            if (!cacheControl) {
                testInfo.annotations.push({
                    type: 'warning',
                    description: `Cache-Control header is missing in response for ${endpoint.path}`
                });
                return;
            }
        
            const directives = cacheControl.split(',').map(d => d.trim());
            expect(directives).toContain('no-store');
            expect(directives).toContain('no-cache');
            expect(directives).toContain('must-revalidate');
            expect(directives).toContain('private');
        });


        //  Test Connection header is keep-alive
        test(getTestTitle('Verify Connection header is keep-alive', endpoint), async ({ request }) => {
            // Get new PHI SID if testing go_eyes or user_details_stage
            if (endpoint.path === 'go_eyes' || endpoint.path === 'user_details_stage') {
                const newPhiSid = await getNewPhiSid(test, request);
                endpoint.config.requestBody.phi_sid = newPhiSid;
            }

            const headers = endpoint.config.requiredHeaders
            const response = await executeRequest(test, request, endpoint, headers);
        
            expect(response.headers()['connection']).toBe('keep-alive');
        });


        //  Verifies that all expected AWS API Gateway headers are present in the response
        //  These headers are standard for AWS API Gateway responses and should be present
        test(getTestTitle('Required AWS Headers Present', endpoint), async ({ request }) => {
            // Get new PHI SID if testing go_eyes or user_details_stage
            if (endpoint.path === 'go_eyes' || endpoint.path === 'user_details_stage') {
                const newPhiSid = await getNewPhiSid(test, request);
                endpoint.config.requestBody.phi_sid = newPhiSid;
            }

            const headers = endpoint.config.requiredHeaders;
            const response = await executeRequest(test, request, endpoint, headers);
            const responseHeaders = response.headers();

            // List of required AWS API Gateway headers
            const requiredHeaders = [
                'x-amzn-requestid',
                'x-amz-apigw-id',
                'x-amzn-trace-id',
            ];

            // Check each required header is present
            for (const headerName of requiredHeaders) {
                expect(responseHeaders[headerName.toLowerCase()], 
                    `Response header ${headerName} should be present`
                ).toBeDefined();
            }
        });


        //  Verifies that the server returns 403 when x-api-key header is missing
        test(getTestTitle('Missing Headers Validation', endpoint), async ({ request }) => {
            // Get new PHI SID if testing go_eyes or user_details_stage
            if (endpoint.path === 'go_eyes' || endpoint.path === 'user_details_stage') {
                const newPhiSid = await getNewPhiSid(test, request);
                endpoint.config.requestBody.phi_sid = newPhiSid;
            }

            const headers = { ...endpoint.config.requiredHeaders };
            delete headers['X-Api-Key'];
    
            const response = await executeRequest(test, request, endpoint, headers);
            expect(response.status()).toBe(403);
            
            const errorResponse = await response.json();
            expect(errorResponse.message).toContain("Forbidden");
        });
      
        
        /**
         * Test Empty Header Values - Verifies that the server returns 403 when x-api-key header is empty
         */
        test(getTestTitle('Empty Headers Validation', endpoint), async ({ request }) => {
            // Get new PHI SID if testing go_eyes or user_details_stage
            if (endpoint.path === 'go_eyes' || endpoint.path === 'user_details_stage') {
                const newPhiSid = await getNewPhiSid(test, request);
                endpoint.config.requestBody.phi_sid = newPhiSid;
            }

            const headers = { ...endpoint.config.requiredHeaders };
            headers['X-Api-Key'] = '';
    
            const response = await executeRequest(test, request, endpoint, headers);
            expect(response.status()).toBe(403);
            
            const errorResponse = await response.json();
            expect(errorResponse.message).toContain("Forbidden");
        });
     
        
        /**
         * Test Invalid Header Values - Verifies that the server returns 403 when x-api-key header has invalid value
         */
        test(getTestTitle('Invalid Header Values', endpoint), async ({ request }) => {
            // Get new PHI SID if testing go_eyes or user_details_stage
            if (endpoint.path === 'go_eyes' || endpoint.path === 'user_details_stage') {
                const newPhiSid = await getNewPhiSid(test, request);
                endpoint.config.requestBody.phi_sid = newPhiSid;
            }

            const headers = { ...endpoint.config.requiredHeaders };
            headers['x-api-key'] = 'invalid_value';
    
            const response = await executeRequest(test, request, endpoint, headers);
            expect(response.status()).toBe(403);
            
            const errorResponse = await response.json();
            expect(errorResponse.message).toContain("Forbidden");
        });
     }
}); 