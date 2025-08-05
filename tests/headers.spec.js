const { test, expect } = require('@playwright/test');
const { endpoints, commonHeaders } = require('../config/endpoints');
const { initializeTestEnvironment, getEndpointsToTest, executeRequest, getTestTitle } = require('./helpers/testUtils');

const selectedEndpoints = initializeTestEnvironment();

// Whats in this file?
// 1. Test to verify the API returns the correct content type
// 2. Test to verify the API correctly implements wildcard CORS (Cross-Origin Resource Sharing)
// 3. Test to verify Cache-Control header directives
// 4. Test to verify Connection header is keep-alive
// 5. Test to verify all expected AWS API Gateway headers are present in the response
// 6. Test to verify server handles missing headers correctly
// 7. Test to verify server handles empty header values correctly
// 8. Test to verify server handles invalid header values correctly
// 9. Test to verify server handles missing Glasseson-Session-Id header correctly (POST requests only)

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
            const headers = endpoint.config.requiredHeaders;

            const response = await executeRequest(test, request, endpoint, headers);
            expect(response.headers()['content-type']).toContain('application/json');
        });

        //  Test CORS header behavior
        //  1. Wildcard (*): Server allows any origin, must return * exactly
        //  2. Specific origins: Server should echo back the exact requesting origin
        test(getTestTitle('CORS No Origin Returns Wildcard', endpoint), async ({ request }) => {
            const headers = {
                ...endpoint.config.requiredHeaders
                // No Origin header sent
            };
            
            const response = await executeRequest(test, request, endpoint, headers);
            const corsHeader = response.headers()['access-control-allow-origin'];
            
            // Should return wildcard when no Origin is specified
            expect(corsHeader).toBe('*');
            // When using wildcard, credentials must not be allowed
            expect(response.headers()['access-control-allow-credentials']).toBeFalsy();
        });

        test(getTestTitle('CORS Origin Echoed Back', endpoint), async ({ request }) => {
            const headers = {
                ...endpoint.config.requiredHeaders,
                Origin: 'https://any-origin.com'
            };
            
            const response = await executeRequest(test, request, endpoint, headers);
            const corsHeader = response.headers()['access-control-allow-origin'];
            
            // Server should echo back the specific origin
            expect(corsHeader).toBe('https://any-origin.com');
            // When echoing specific origin, credentials might be allowed
            if (response.headers()['access-control-allow-credentials']) {
                expect(response.headers()['access-control-allow-credentials']).toBe('true');
            }
        });

        //  Test Cache-Control header directives
        //  Verifies that the API responses include appropriate caching directives
        test(getTestTitle('Cache Control Directives', endpoint), async ({ request }) => {
            const headers = endpoint.config.requiredHeaders;
        
            const response = await executeRequest(test, request, endpoint, headers);
            const cacheControl = response.headers()['cache-control'];
        
            // Verify if Cache-Control header exists
            if (!cacheControl) {
                console.warn(`Warning: Cache-Control header is missing in response for ${endpoint.path}`);
                return; // Exit test if header is missing (optional)
            }
        
            // Split the Cache-Control header into individual directives
            const directives = cacheControl.split(',').map(d => d.trim());
        
            // Verify required cache control directives
            expect(directives).toContain('no-store');
            expect(directives).toContain('no-cache');
            expect(directives).toContain('must-revalidate');
            expect(directives).toContain('private');
        });

        //  Test Connection header is keep-alive
        test(getTestTitle('Verify Connection header is keep-alive', endpoint), async ({ request }) => {
            const headers = endpoint.config.requiredHeaders
            const response = await executeRequest(test, request, endpoint, headers);
        
            expect(response.headers()['connection']).toBe('keep-alive');
        });

        //  Verifies that all expected AWS API Gateway headers are present in the response
        //  These headers are standard for AWS API Gateway responses and should be present
        test(getTestTitle('Required AWS Headers Present', endpoint), async ({ request }) => {
            const headers = endpoint.config.requiredHeaders;

            const response = await executeRequest(test, request, endpoint, headers);
            const responseHeaders = response.headers();

            // List of required AWS API Gateway headers
            const requiredHeaders = [
                'content-length',
                'x-amzn-requestid',
                'x-amzn-remapped-content-length',
                'x-amzn-remapped-connection',
                'x-amz-apigw-id',
                'x-amzn-remapped-server',
                'x-amzn-remapped-date'
            ];

            // Check each required header is present
            for (const headerName of requiredHeaders) {
                expect(responseHeaders[headerName.toLowerCase()], 
                    `Response header ${headerName} should be present`
                ).toBeDefined();
            }
        });

        //  Verifies that the server returns 401 when specific required headers are missing
        //  Tests: Glasseson-Client-Id, Glasseson-Profile-Name, Glasseson-Native-App-Id
        //  Different error messages for different missing headers:
        test(getTestTitle('Missing Headers Validation', endpoint), async ({ request }) => {
            const requiredHeaders = [
                'Glasseson-Client-Id',
                'Glasseson-Profile-Name',
                'Glasseson-Native-App-Id'
            ];
        
            for (const missingHeader of requiredHeaders) {
                // Create headers object without one required header
                const headers = { ...endpoint.config.requiredHeaders }; // Clone headers to avoid mutation
                delete headers[missingHeader];
        
                const response = await executeRequest(test, request, endpoint, headers);
        
                // Verify status code
                expect(response.status()).toBe(401);
        
                // Different error responses based on missing header
                const errorResponse = await response.json();
        
                if (missingHeader === 'Glasseson-Profile-Name') {
                    // Expect JSON string response
                    expect(errorResponse).toBe('Something went wrong');
                } else if (missingHeader === 'Glasseson-Native-App-Id') {
                    // Expect specific error about domain
                    expect(errorResponse).toEqual({
                        error_code: 401,
                        error_message: 'No Domain was provided for client Id. Contact support@6over6.com if needed'
                    });
                } else if (missingHeader === 'Glasseson-Client-Id') {
                    // Expect updated response format
                    expect(errorResponse).toEqual({
                        error_message: 'Client id does not exist. You are connected to http://go-staging-flow-manager-nlb-ad5921478bb7c3e7.elb.us-east-1.amazonaws.com/. Please make sure this is the server link provided.  If the problem still persists please contact support@6over6.com',
                        error_code: 401
                    });
                }
            }
        });

        //  Test to verify that the server returns 401 when all required headers are missing
        //  Tests: Glasseson-Client-Id, Glasseson-Profile-Name, Glasseson-Native-App-Id
        test(getTestTitle('All Required Headers Missing', endpoint), async ({ request }) => {
            // Clone headers to avoid modifying the original config
            const headers = { ...endpoint.config.requiredHeaders };
        
            // Remove only the required headers
            delete headers['Glasseson-Client-Id'];
            delete headers['Glasseson-Profile-Name'];
            delete headers['Glasseson-Native-App-Id'];
        
            const response = await executeRequest(test, request, endpoint, headers);
        
            // Verify status code
            expect(response.status(), 'Server should return 401 when all required headers are missing').toBe(401);
        
            // Parse response JSON
            const errorResponse = await response.json();
        
            // Verify expected error message
            expect(errorResponse.error_message).toContain('Client id does not exist');
        });
        
        
        /**
         * Test Empty Header Values
         * Verifies that the server returns 401 when required headers are present but empty
         * Tests: Glasseson-Client-Id, Glasseson-Profile-Name, Glasseson-Native-App-Id
         * Different error messages for different empty headers:
         * - Glasseson-Client-Id: "Client id does not exist"
         * - Glasseson-Profile-Name: "Profile name does not exist for the provided client id"
         * - Glasseson-Native-App-Id: "No Domain was provided for client Id"
         */
        test(getTestTitle('Empty Headers Validation', endpoint), async ({ request }) => {
            const requiredHeaders = [
                'Glasseson-Client-Id',
                'Glasseson-Profile-Name',
                'Glasseson-Native-App-Id'
            ];
        
            for (const emptyHeader of requiredHeaders) {
                // Clone headers object to avoid modifying the original one
                const headers = { ...endpoint.config.requiredHeaders };
                headers[emptyHeader] = ''; // Set only the current header to an empty string
        
                const response = await executeRequest(test, request, endpoint, headers);
        
                // Verify status code
                expect(response.status(), 
                    `Server should return 401 when ${emptyHeader} is empty`
                ).toBe(401);
        
                // Different error responses based on the empty header
                const errorResponse = await response.json();
        
                if (emptyHeader === 'Glasseson-Profile-Name') {
                    expect(errorResponse.error_message).toContain('Profile name does not exist for the provided client id');
                } else if (emptyHeader === 'Glasseson-Native-App-Id') {
                    expect(errorResponse.error_message).toContain('No Domain was provided for client Id');
                } else if (emptyHeader === 'Glasseson-Client-Id') {
                    expect(errorResponse.error_message).toContain('Client id does not exist');
                }
            }
        });
     
        
        //  Test to verify that the server returns 401 when all required headers are empty
        //  Tests: Glasseson-Client-Id, Glasseson-Profile-Name, Glasseson-Native-App-Id
        test(getTestTitle('All Required Headers Empty', endpoint), async ({ request }) => {
            // Clone headers to avoid modifying the original config
            const headers = { ...endpoint.config.requiredHeaders };
        
            // Set all required headers to empty strings
            headers['Glasseson-Client-Id'] = '';
            headers['Glasseson-Profile-Name'] = '';
            headers['Glasseson-Native-App-Id'] = '';
        
            const response = await executeRequest(test, request, endpoint, headers);
        
            // Verify status code
            expect(response.status(), 'Server should return 401 when all required headers are empty').toBe(401);
        
            // Parse response JSON
            const errorResponse = await response.json();
        
            // Verify expected error message (adjust based on actual API response)
            expect(errorResponse.error_message).toContain('Client id does not exist'); 
        });

        
        /**
         * Test Invalid Header Values
         * Verifies that the server returns 401 when required headers have invalid values
         * Tests: Glasseson-Client-Id, Glasseson-Profile-Name, Glasseson-Native-App-Id
         * Different error messages for different invalid headers:
         * - Glasseson-Client-Id: "Client id does not exist"
         * - Glasseson-Profile-Name: "Profile name does not exist for the provided client id"
         * - Glasseson-Native-App-Id: "The provided client id does not match with the provided app id"
         */
        test(getTestTitle('Invalid Header Values', endpoint), async ({ request }) => {
            const requiredHeaders = [
                'Glasseson-Client-Id',
                'Glasseson-Profile-Name',
                'Glasseson-Native-App-Id'
            ];
        
            for (const invalidHeader of requiredHeaders) {
                // Clone headers object to avoid modifying the original one
                const headers = { ...endpoint.config.requiredHeaders };
                headers[invalidHeader] = 'invalid_value'; // Set only the current header to an invalid value
        
                const response = await executeRequest(test, request, endpoint, headers);
        
                // Verify status code
                expect(response.status(), 
                    `Server should return 401 when ${invalidHeader} has an invalid value`
                ).toBe(401);
        
                // Parse response JSON
                const errorResponse = await response.json();
        
                // Different error messages based on invalid header
                if (invalidHeader === 'Glasseson-Profile-Name') {
                    expect(errorResponse.error_message).toContain('Profile name does not exist for the provided client id');
                } else if (invalidHeader === 'Glasseson-Native-App-Id') {
                    expect(errorResponse.error_message).toContain('The provided client id does not match with the provided app id');
                } else if (invalidHeader === 'Glasseson-Client-Id') {
                    expect(errorResponse.error_message).toContain('Client id does not exist');
                }
            }
        });


        //  Test to verify that the server returns 401 when all required headers are invalid
        //  Tests: Glasseson-Client-Id, Glasseson-Profile-Name, Glasseson-Native-App-Id 
        test(getTestTitle('All Invalid Header Values', endpoint), async ({ request }) => {
            const requiredHeaders = [
                'Glasseson-Client-Id',
                'Glasseson-Profile-Name',
                'Glasseson-Native-App-Id'
            ];
        
            // Clone the headers to avoid modifying the original one
            const headers = { ...endpoint.config.requiredHeaders } || {};
        
            // Set all required headers to 'invalid_value'
            requiredHeaders.forEach(header => {
                headers[header] = 'invalid_value'; // All headers get the same invalid value
            });
        
            const response = await executeRequest(test, request, endpoint, headers);
        
            // Check the response status code (expecting 401 for invalid headers)
            expect(response.status(),
                'Server should return 401 when all headers are invalid'
            ).toBe(401);
        
            // Parse the response to verify the error message
            const errorResponse = await response.json();
        
            // Ensure the error message contains specific strings related to invalid headers
            expect(errorResponse.error_message).toContain('Client id does not exist');
        });
        

        /**
         * Test Missing Glasseson-Session-Id Header
         * Verifies that the server returns 500 when Glasseson-Session-Id is missing
         * Only runs on POST requests
         * Expected response:
         * - Status code: 500
         * - Response should contain "Internal Server Error" and "error_id"
         * Special case for /@/go-eyes/save-station:
         * - Status code: 401
         * - Response: "Something went wrong"
         */
        test(getTestTitle('Missing Glasseson-Session-Id Header', endpoint), async ({ request }) => {
            // Skip test for GET requests
            if (endpoint.method === 'GET') {
                console.log('Skipping test for GET requests, as Glasseson-Session-Id is not available');
                test.skip(); // Skip the test
                return;
            }

            // Create headers object without Glasseson-Session-Id
            const headers = { ...endpoint.config.requiredHeaders };
            delete headers['Glasseson-Session-Id'];

            const response = await executeRequest(test, request, endpoint, headers);
            
            // Special case for /@/go-eyes/save-station endpoint
            if (endpoint.path === '@/go-eyes/save-station') {
                expect(response.status(), 
                    'Server should return 401 when Glasseson-Session-Id is missing for /@/go-eyes/save-station'
                ).toBe(401);
                const errorResponse = await response.json();
                expect(errorResponse).toBe('Something went wrong');
                return;
            }

            // Special case for /@/go-va/save-station endpoint
            if (endpoint.path === '@/go-va/save-station') {
                expect(response.status(), 
                    'Server should return 200 when Glasseson-Session-Id is missing for /@/go-va/save-station'
                ).toBe(200);
                const errorResponse = await response.text(); // Use text() instead of json() for non-JSON response
                expect(errorResponse).toContain("unsupported operand type(s) for +: 'NoneType' and 'str'");
                return;
            }
            
            // Default case for all other endpoints
            expect(response.status(), 
                'Server should return 500 when Glasseson-Session-Id is missing'
            ).toBe(500);
            const errorResponse = await response.text(); // Use text() instead of json() for non-JSON response
            expect(errorResponse).toContain('Internal Server Error, error_id');
        });
     }
}); 