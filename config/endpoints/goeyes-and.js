const commonHeaders = require('./headers').commonHeaders;
const { targetTolerance } = require('../endpoints');

const goeyesAndEndpoints = [
    // Init
    {
        path: '@/mobile/init',
        product: 'GoEyes-Android',
        method: 'GET',
        testCases: [
            {
                name: 'Default',
                config: {
                    queryParams: {
                        phone_model: 'IPHONE14,2',
                        version: '5.1.0'
                    },
                    requiredHeaders: {
                        'Glasseson-Native-App-Id': process.env.GLASSESON_NATIVE_APP_ID,
                        'Glasseson-Profile-Name': process.env.GLASSESON_PROFILE_NAME,
                        'Glasseson-Client-Id': process.env.GLASSESON_CLIENT_ID,
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    expectedSizeBytes: {
                        target: 752939,
                        tolerance: targetTolerance
                    },
                    schemaFile: 'config/response-schemas/goeyes-and/mobile-init.json',
                    comparisonFile: 'config/response-bodies/goeyes-and/mobile-init.json'
                }
            }
            // Additional test cases can be added here
        ]
    },

    // FFC
    {
        path: '@/face-distance-calibration/ffc-calculation',
        product: 'GoEyes-Android',
        method: 'POST',
        config: {
            queryParams: {},
            requiredHeaders: commonHeaders,
            requestBody: require('../request-bodies/goeyes-and/ffc-calculation.json'),
            expectedSizeBytes: {
                target: 15840,
                tolerance: targetTolerance
            },
            schemaFile: 'config/response-schemas/goeyes-and/ffc-calculation.json',
            comparisonFile: 'config/response-bodies/goeyes-and/ffc-calculation.json'
        }
    }
];

// For backward compatibility, copy the first test case config to the endpoint level
goeyesAndEndpoints.forEach(endpoint => {
    if (endpoint.testCases && endpoint.testCases.length > 0) {
        endpoint.config = endpoint.testCases[0].config;
    }
});

module.exports = goeyesAndEndpoints; 