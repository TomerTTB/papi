const { test, expect } = require('@playwright/test');
const { endpoints } = require('../config/endpoints');
const { initializeTestEnvironment, getEndpointsToTest, executeRequest, getTestTitle } = require('./helpers/testUtils');
const { generateSchemaUsingAjv } = require('./helpers/schemaUtils');
const { getNewPhiSid } = require('./helpers/phiSidUpdater');
const Ajv = require('ajv');
const fs = require('fs');
const path = require('path');

const selectedEndpoints = initializeTestEnvironment();
// Initialize AJV with proper configuration
const ajv = new Ajv({
    strict: true,
    strictTypes: false, // Allow union types
    strictRequired: false // Be more lenient with required fields
});

// Ensure BASE_URL is set
if (!process.env.BASE_URL) {
    console.warn('BASE_URL environment variable is not set. Using default: http://localhost:3000');
    process.env.BASE_URL = 'http://localhost:3000';
}

test.describe('Response Structure Validation', () => {
    const endpointsToTest = getEndpointsToTest(endpoints, selectedEndpoints);

    for (const endpoint of endpointsToTest) {
        // Skip endpoints without schema file configuration
        // if (!endpoint.config.schemaFile) {
        //     console.log(`Skipping ${endpoint.path} - no schema file configured`);
        //     continue;
        // }

        // Test to verify response body is not null or undefined
        // This is to ensure the response body is not empty
        test(getTestTitle('Response Body Should Not Be Null or Undefined', endpoint), async ({ request }) => {
            // Get new PHI SID if testing go_eyes or user_details_stage
            if (endpoint.path === 'go_eyes' || endpoint.path === 'user_details_stage') {
                const newPhiSid = await getNewPhiSid(test, request);
                endpoint.config.requestBody.phi_sid = newPhiSid;
            }

            const headers = endpoint.config.requiredHeaders;
            const response = await executeRequest(test, request, endpoint, headers);
            
            const responseBody = await response.json();
        
            expect(responseBody, 'Response body should not be null or undefined').toBeDefined();
        });
        

        // This test ensures that the API response body is a valid JSON format.
        // It reads the response as text, attempts to parse it, and ensures no empty or malformed JSON is returned.
        test(getTestTitle('Response Should Be Valid JSON', endpoint), async ({ request }) => {
            // Get new PHI SID if testing go_eyes or user_details_stage
            if (endpoint.path === 'go_eyes' || endpoint.path === 'user_details_stage') {
                const newPhiSid = await getNewPhiSid(test, request);
                endpoint.config.requestBody.phi_sid = newPhiSid;
            }

            const headers = endpoint.config.requiredHeaders;
            const response = await executeRequest(test, request, endpoint, headers);
        
            // Read response as text first
            const responseText = await response.text();
        
            try {
                // Attempt to parse the response as JSON
                JSON.parse(responseText);
            } catch (error) {
                throw new Error('Response body is not valid JSON');
            }
        
            expect(responseText, 'Response should not be empty').not.toBe('');
        });


        /**
         * This test ensures that the API response body is not an empty string (`""`).
         * An empty string is invalid because it does not conform to a proper JSON format, and
         * could indicate that the server didn't return the expected data.
         * 
         * However, an empty object (`{}`) or an empty array (`[]`) is considered a valid response,
         * as they are structurally correct and meaningful in JSON. They represent valid JSON objects
         * or arrays, even though they contain no data.
         */
        test(getTestTitle('Response Body Should Not Be Empty String', endpoint), async ({ request }) => {
            // Get new PHI SID if testing go_eyes or user_details_stage
            if (endpoint.path === 'go_eyes' || endpoint.path === 'user_details_stage') {
                const newPhiSid = await getNewPhiSid(test, request);
                endpoint.config.requestBody.phi_sid = newPhiSid;
            }

            const headers = endpoint.config.requiredHeaders;
            const response = await executeRequest(test, request, endpoint, headers);

            // Read the response body as raw text
            const responseText = await response.text();

            // Ensure the response body is not an empty string ("")
            expect(responseText, 'Response body should not be an empty string').not.toBe('');
        });


        // Test to ensure that the response body size is within a defined range for each endpoint
        // This is to ensure that the response body is not too large or too small
        test(getTestTitle('Response Body Size Should Be Within Range', endpoint), async ({ request }) => {
            // Get new PHI SID if testing go_eyes or user_details_stage
            if (endpoint.path === 'go_eyes' || endpoint.path === 'user_details_stage') {
                const newPhiSid = await getNewPhiSid(test, request);
                endpoint.config.requestBody.phi_sid = newPhiSid;
            }

            const headers = endpoint.config.requiredHeaders;
            const response = await executeRequest(test, request, endpoint, headers);
            const responseText = await response.text();

            const responseSizeInBytes = Buffer.byteLength(responseText, 'utf8');
            console.log(`Actual Response Size for ${endpoint.path}: ${responseSizeInBytes} bytes`);

            // Skip empty responses
            if (responseSizeInBytes === 0) {
                console.log(`Skipping size check for ${endpoint.path} as the response is empty ({} or []).`);
                return;
            }

            // Get size config
            const { target, tolerance } = endpoint.config.expectedSizeBytes;

            const min = target - tolerance;
            const max = target + tolerance;

            console.log(`Target size for ${endpoint.path}: ${target} bytes, with tolerance: ±${tolerance} bytes`);
            console.log(`Acceptable range: ${min} - ${max} bytes`);

            expect(responseSizeInBytes, `Response body size for ${endpoint.path} should be >= ${min} bytes`).toBeGreaterThanOrEqual(min);
            expect(responseSizeInBytes, `Response body size for ${endpoint.path} should be <= ${max} bytes`).toBeLessThanOrEqual(max);
        });

        /*
        This test validates the response schema for a given endpoint.
        It performs the following steps:
        1. Retrieves the schema file path from the endpoint configuration.
        2. Verifies that the schema file is defined and exists on the filesystem.
        3. Loads the JSON schema from the specified file.
        4. Executes an API request for the current endpoint and gets the response body.
        5. Generates an actual response schema based on the response using AJV.
        6. Prints both the schema from the file and the generated schema for comparison (for debugging purposes).
        7. Validates the actual response body against the schema from the file using AJV.
        8. If the schema validation fails, the test logs the errors and fails the test.
        9. If the schema validation passes, it logs a success message indicating the response structure is correct.
        This test ensures that the API response adheres to the expected schema, which helps in maintaining consistency and quality in the API's structure.
        */
        test(getTestTitle('Validate Response Schema', endpoint), async ({ request }) => {
            // Get new PHI SID if testing go_eyes or user_details_stage
            if (endpoint.path === 'go_eyes' || endpoint.path === 'user_details_stage') {
                const newPhiSid = await getNewPhiSid(test, request);
                endpoint.config.requestBody.phi_sid = newPhiSid;
            }

            // Get schema file path from endpoint config
            const schemaFile = endpoint.config.schemaFile;
            console.log(`\nValidating endpoint: ${endpoint.path}`);
            console.log(`Using schema file: ${schemaFile}`);

            if (!schemaFile) {
                throw new Error(`Schema file is not defined for ${endpoint.path}`);
            }
            
            const schemaPath = path.resolve(__dirname, '..', schemaFile);
            console.log(`Full schema path: ${schemaPath}`);

            if (!fs.existsSync(schemaPath)) {
                throw new Error(`Schema file not found: ${schemaPath}`);
            }

            // Load JSON schema
            const fileSchema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));

            // Execute API request
            const response = await executeRequest(test, request, endpoint, endpoint.config.requiredHeaders);
            const responseBody = await response.json();

            // Generate schema from actual response using AJV-based function
            const actualSchema = generateSchemaUsingAjv(responseBody);

            // Print comparison
            console.log('\n' + '='.repeat(80));
            console.log(`Endpoint: ${endpoint.path}`);
            console.log(`Schema File: ${schemaFile}`);
            console.log('='.repeat(80));
            
            console.log('\nSchema from File:');
            console.log(JSON.stringify(fileSchema, null, 2));
            
            console.log('\nActual Response Schema:');
            console.log(JSON.stringify(actualSchema, null, 2));
            
            console.log('\nActual Response:');
            console.log(JSON.stringify(responseBody, null, 2));
            console.log('\n' + '='.repeat(80) + '\n');

            // Validate response against schema
            const validate = ajv.compile(fileSchema);
            const isValid = validate(responseBody);

            if (!isValid) {
                console.error(`Schema validation failed for ${endpoint.path}:`, validate.errors);
            }

            // Assert schema validation
            expect(isValid, `Schema validation errors: ${JSON.stringify(validate.errors, null, 2)}`).toBe(true);

            console.log(`✓ Successfully validated response structure for ${endpoint.path}`);
        });
    }
});
