const { phiHeaders } = require('./headers');
const { targetTolerance } = require('../endpoints');

const phiEndpoints = [
    {
        path: 'questionnaire_stage',
        product: 'PHI',
        method: 'POST',
        config: {
            queryParams: {},
            requiredHeaders: phiHeaders,
            requestBody: require('../request-bodies/phi/questionnaire_stage.json'),
            expectedSizeBytes: {
                target: 125,
                tolerance: targetTolerance
            },
            schemaFile: 'config/response-schemas/phi/questionnaire_stage.json',
            comparisonFile: 'config/response-bodies/phi/questionnaire_stage.json'
        }
    },
    {
        path: 'go_eyes',
        product: 'PHI',
        method: 'POST',
        config: {
            queryParams: {},
            requiredHeaders: phiHeaders,
            requestBody: require('../request-bodies/phi/go_eyes.json'),
            expectedSizeBytes: {
                target: 47,
                tolerance: targetTolerance
            },
            schemaFile: 'config/response-schemas/phi/go_eyes.json',
            comparisonFile: 'config/response-bodies/phi/go_eyes.json'
        }
    },
    {
        path: 'user_details_stage',
        product: 'PHI',
        method: 'POST',
        config: {
            queryParams: {},
            requiredHeaders: phiHeaders,
            requestBody: require('../request-bodies/phi/user_details_stage.json'),
            expectedSizeBytes: {
                target: 52,
                tolerance: targetTolerance
            },
            schemaFile: 'config/response-schemas/phi/user_details_stage.json',
            comparisonFile: 'config/response-bodies/phi/user_details_stage.json'
        }
    }
];

module.exports = phiEndpoints; 