const { endpoints } = require('../../config/endpoints');
const { executeRequest } = require('./testUtils');

// PHI Base URL configuration
const PHI_BASE_URL = process.env.PHI_BASE_URL || 'https://phi-staging.6over6.com';

/**
 * Gets a new PHI SID from the questionnaire_stage endpoint
 * @param {object} test - Playwright test object
 * @param {object} request - Playwright request object
 * @returns {Promise<string>} - Returns the new PHI SID
 */
async function getNewPhiSid(test, request) {
    try {
        // Store original BASE_URL
        const originalBaseUrl = process.env.BASE_URL;
        
        // Set PHI-specific BASE_URL
        process.env.BASE_URL = PHI_BASE_URL;
        
        try {
            // 1. Find the questionnaire_stage endpoint
            const questionnaireEndpoint = endpoints.find(e => e.path === 'questionnaire_stage' && e.product === 'PHI');
            if (!questionnaireEndpoint) {
                throw new Error('Could not find questionnaire_stage endpoint configuration');
            }

            // 2. Send request to questionnaire_stage endpoint
            const response = await executeRequest(test, request, questionnaireEndpoint, questionnaireEndpoint.config.requiredHeaders);
            if (!response.ok()) {
                throw new Error(`Failed to get PHI SID. Status: ${response.status()}`);
            }

            // 3. Extract phi_sid from response
            const responseData = await response.json();
            const newPhiSid = responseData.phi_sid;
            if (!newPhiSid) {
                throw new Error('No phi_sid found in response');
            }

            console.log('Got new PHI SID:', newPhiSid);
            return newPhiSid;
        } finally {
            // Restore original BASE_URL
            process.env.BASE_URL = originalBaseUrl;
        }
    } catch (error) {
        console.error('Error getting PHI SID:', error.message);
        throw error;
    }
}

module.exports = {
    getNewPhiSid,
    PHI_BASE_URL  // Export the PHI base URL in case it's needed elsewhere
}; 