const { test, expect } = require('@playwright/test');
const { endpoints, commonHeaders } = require('../config/endpoints');
const { initializeTestEnvironment, getEndpointsToTest, executeRequest } = require('./helpers/testUtils');
const fs = require('fs');
const path = require('path');

const selectedEndpoints = initializeTestEnvironment();

// Ensure BASE_URL is set
if (!process.env.BASE_URL) {
    console.warn('BASE_URL environment variable is not set. Using default: http://localhost:3000');
    process.env.BASE_URL = 'http://localhost:3000';
}

// Define all fields to ignore with their specific paths
const IGNORED_PATHS = [
    // Specific fields in specific locations
    'first-flow-actions.actions[].id'
];

/**
 * Checks if a field at a specific path should be ignored
 * @param {string} fieldName - The name of the field to check
 * @param {string} currentPath - The current path in the object structure
 * @returns {boolean} - True if the field should be ignored
 */
function shouldIgnoreField(fieldName, currentPath) {
    // Create the full path to check
    const fullPath = currentPath ? `${currentPath}.${fieldName}` : fieldName;
    
    return IGNORED_PATHS.some(ignoredPath => {
        // Convert the ignored path pattern to a regex
        const pattern = ignoredPath
            .replace(/\./g, '\\.')         // Escape dots
            .replace(/\[\]/g, '\\[\\d+\\]') // Replace [] with [\d+] to match any array index
            .replace(/\*\*/g, '.*')         // Replace ** with .* for "match anything"
            .replace(/\*/g, '[^\\.]+');     // Replace * with "match anything except dot"
        
        // Create regex that matches the exact path
        const regex = new RegExp(`^${pattern}$`);
        return regex.test(fullPath);
    });
}

/**
 * Recursively compares two objects while ignoring specified fields
 * @param {Object} actual - The actual response object
 * @param {Object} expected - The expected response object
 * @param {string} path - Current path in the object structure
 * @returns {Array} Array of differences found
 */
function compareObjects(actual, expected, path = '') {
    const differences = [];

    // If either value is null/undefined, compare directly
    if (actual === null || expected === null || actual === undefined || expected === undefined) {
        if (actual !== expected) {
            differences.push(`${path}: Expected ${expected}, got ${actual}`);
        }
        return differences;
    }

    // Handle different types
    if (typeof actual !== typeof expected) {
        differences.push(`${path}: Type mismatch - Expected ${typeof expected}, got ${typeof actual}`);
        return differences;
    }

    // For arrays, compare each element
    if (Array.isArray(actual)) {
        if (!Array.isArray(expected)) {
            differences.push(`${path}: Expected array, got ${typeof expected}`);
            return differences;
        }
        
        // Skip length comparison if it's in ignored fields
        if (!shouldIgnoreField('length', path)) {
            if (actual.length !== expected.length) {
                differences.push(`${path}: Array length mismatch - Expected ${expected.length}, got ${actual.length}`);
            }
        }

        // Compare array elements
        actual.forEach((item, index) => {
            if (index < expected.length) {
                const arrayPath = path ? `${path}[${index}]` : `[${index}]`;
                differences.push(...compareObjects(item, expected[index], arrayPath));
            }
        });
        return differences;
    }

    // For objects, compare each property
    if (typeof actual === 'object') {
        Object.keys(expected).forEach(key => {
            // Check if this specific field at this path should be ignored
            if (shouldIgnoreField(key, path)) {
                return;
            }

            const newPath = path ? `${path}.${key}` : key;
            
            if (!(key in actual)) {
                differences.push(`${newPath}: Missing in actual response`);
                return;
            }

            differences.push(...compareObjects(actual[key], expected[key], newPath));
        });

        // Check for extra fields in actual that aren't in expected
        Object.keys(actual).forEach(key => {
            if (!(key in expected) && !shouldIgnoreField(key, path)) {
                differences.push(`${path ? `${path}.${key}` : key}: Unexpected field in actual response`);
            }
        });

        return differences;
    }

    // For primitive values, compare directly
    if (actual !== expected) {
        differences.push(`${path}: Expected ${expected}, got ${actual}`);
    }

    return differences;
}

test.describe('Response Body Comparison', () => {
    const endpointsToTest = getEndpointsToTest(endpoints, selectedEndpoints);

    for (const endpoint of endpointsToTest) {
        test(`Compare response body with expected ${endpoint.path}`, async ({ request }) => {
            // Skip if no comparison file is specified
            if (!endpoint.config.comparisonFile) {
                test.skip();
                return;
            }

            // Read the expected response body from the comparison file
            const comparisonFilePath = path.join(process.cwd(), endpoint.config.comparisonFile);
            let expectedResponseBody;
            try {
                expectedResponseBody = require(comparisonFilePath);
            } catch (error) {
                throw new Error(`Failed to load comparison file ${comparisonFilePath}: ${error.message}`);
            }

            // Execute the request
            const response = await executeRequest(test, request, endpoint, endpoint.config.requiredHeaders);
            expect(response.ok()).toBeTruthy();

            // Extract only the response body for comparison, ignoring headers and other metadata
            const actualResponseBody = await response.json();

            // Log the bodies being compared when in debug mode
            if (process.env.DEBUG) {
                console.log('Expected response body:', JSON.stringify(expectedResponseBody, null, 2));
                console.log('Actual response body:', JSON.stringify(actualResponseBody, null, 2));
            }

            // Compare only the response bodies while ignoring specified fields
            const differences = compareObjects(actualResponseBody, expectedResponseBody);

            // If there are differences in the response bodies, format them nicely and fail the test
            if (differences.length > 0) {
                const message = [
                    'Response body differences found:',
                    'Note: Only comparing response bodies, ignoring headers and other metadata.',
                    ...differences.map(diff => `- ${diff}`)
                ].join('\n');
                throw new Error(message);
            }
        });
    }
});

// Keep existing tests
test.describe('Basic Validation', () => {
    const endpointsToTest = getEndpointsToTest(endpoints, selectedEndpoints);

    for (const endpoint of endpointsToTest) {
        /**
         * Test to verify the API returns a 200 status code for valid requests
         * Verifies that:
         * - Response status is 200
         * - Response is successful (ok)
         */
        test(`Status code 200 ${endpoint.path}`, async ({ request }) => {
            // Only use the headers specified in the endpoint's config
            const headers = endpoint.config.requiredHeaders;
            
            const response = await executeRequest(test, request, endpoint, headers);
            
            expect(response.ok()).toBeTruthy();
            expect(response.status()).toBe(200);
        });
    }
});