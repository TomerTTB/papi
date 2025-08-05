const { test, expect } = require('@playwright/test');
const { endpoints, commonHeaders } = require('../config/endpoints');
const { initializeTestEnvironment, getEndpointsToTest, executeRequest, getTestTitle, getTestCases } = require('./helpers/testUtils');
const { compareObjects } = require('./helpers/responseComparator');
const { getNewPhiSid } = require('./helpers/phiSidUpdater');
const fs = require('fs');
const path = require('path');

const selectedEndpoints = initializeTestEnvironment();

// Ensure BASE_URL is set
if (!process.env.BASE_URL) {
    console.warn('BASE_URL environment variable is not set. Using default: http://localhost:3000');
    process.env.BASE_URL = 'http://localhost:3000';
}

test.describe('Response Body Comparison', () => {
    const endpointsToTest = getEndpointsToTest(endpoints, selectedEndpoints);

    for (const endpoint of endpointsToTest) {
        const testCases = getTestCases(endpoint);

        for (const testCase of testCases) {
            test(getTestTitle('Compare Response Body With Expected', endpoint, testCase), async ({ request }) => {
                // Skip if no comparison file is specified
                if (!testCase.config.comparisonFile) {
                    test.skip();
                    return;
                }

                // Get new PHI SID if testing go_eyes or user_details_stage
                if (endpoint.path === 'go_eyes' || endpoint.path === 'user_details_stage') {
                    const newPhiSid = await getNewPhiSid(test, request);
                    testCase.config.requestBody.phi_sid = newPhiSid;
                }

                // Read the expected response body from the comparison file
                const comparisonFilePath = path.join(process.cwd(), testCase.config.comparisonFile);
                let expectedResponseBody;
                try {
                    expectedResponseBody = require(comparisonFilePath);
                } catch (error) {
                    throw new Error(`Failed to load comparison file ${comparisonFilePath}: ${error.message}`);
                }

                // Execute the request
                const response = await executeRequest(test, request, endpoint, testCase.config.requiredHeaders, testCase);
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
    }
});