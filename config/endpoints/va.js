const { commonHeaders, vaHeaders } = require('./headers');
const { targetTolerance } = require('../endpoints');    

const vaEndpoints = [
    // VA Measurement
    {
        path: '@/websdk/init',
        product: 'VA',
        method: 'GET',
        config: {
            queryParams: {
                is_desktop: 'false'
            },
            requiredHeaders: vaHeaders,
            expectedSizeBytes: {
                target: 137695,
                tolerance: targetTolerance
            },
            schemaFile: 'config/response-schemas/va/websdk-init.json',
            comparisonFile: 'config/response-bodies/va/websdk-init.json'
        }
    },
    {
        path: '@/go-va/bino/decrease',
        product: 'VA',
        method: 'POST',
        config: {
            queryParams: {},
            requiredHeaders: vaHeaders,
            requestBody: require('../request-bodies/va/bino-decrease.json'),
            expectedSizeBytes: {
                target: 486,
                tolerance: targetTolerance
            },
            schemaFile: 'config/response-schemas/va/bino-decrease.json',
            comparisonFile: 'config/response-bodies/va/bino-decrease.json'
        }
    },
    {
        path: '@/go-va/mono/decrease/small-bino',
        product: 'VA',
        method: 'POST',
        config: {
            queryParams: {},
            requiredHeaders: vaHeaders,
            requestBody: require('../request-bodies/va/mono-decrease-small-bino.json'),
            expectedSizeBytes: {
                target: 247,
                tolerance: targetTolerance
            },
            schemaFile: 'config/response-schemas/va/mono-decrease-small-bino.json',
            comparisonFile: 'config/response-bodies/va/mono-decrease-small-bino.json'
        }
    },
    {
        path: '@/go-va/bino/increase',
        product: 'VA',
        method: 'POST',
        config: {
            queryParams: {},
            requiredHeaders: vaHeaders,
            requestBody: require('../request-bodies/va/bino-increase.json'),
            expectedSizeBytes: {
                target: 1267,
                tolerance: targetTolerance
            },
            schemaFile: 'config/response-schemas/va/bino-increase.json',
            comparisonFile: 'config/response-bodies/va/bino-increase.json'
        }
    },
    {
        path: '@/go-va/mono',
        product: 'VA',
        method: 'POST',
        testCases: [
            {
                name: 'Right Eye',
                config: {
                    queryParams: {},
                    requiredHeaders: vaHeaders,
                    requestBody: require('../request-bodies/va/mono-right.json'),
                    expectedSizeBytes: {
                        target: 1077,
                        tolerance: targetTolerance
                    },
                    schemaFile: 'config/response-schemas/va/mono-right.json',
                    comparisonFile: 'config/response-bodies/va/mono-right.json'
                }
            },
            {
                name: 'Left Eye',
                config: {
                    queryParams: {},
                    requiredHeaders: vaHeaders,
                    requestBody: require('../request-bodies/va/mono-left.json'),
                    expectedSizeBytes: {
                        target: 1077,
                        tolerance: targetTolerance
                    },
                    schemaFile: 'config/response-schemas/va/mono-left.json',
                    comparisonFile: 'config/response-bodies/va/mono-left.json'
                }
            }
        ]
    },
    {
        path: '@/go-va/save-station',
        product: 'VA',
        method: 'POST',
        config: {
            queryParams: {},
            requiredHeaders: vaHeaders,
            requestBody: require('../request-bodies/va/save-station.json'),
            expectedSizeBytes: {
                target: 2,
                tolerance: targetTolerance
            },
            schemaFile: 'config/response-schemas/va/save-station.json',
            comparisonFile: 'config/response-bodies/va/save-station.json'
        }
    },
];

// For backward compatibility, copy the first test case config to the endpoint level
vaEndpoints.forEach(endpoint => {
    if (endpoint.testCases && endpoint.testCases.length > 0) {
        endpoint.config = endpoint.testCases[0].config;
    }
});

module.exports = vaEndpoints; 