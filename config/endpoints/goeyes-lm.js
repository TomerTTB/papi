const { commonLmHeaders } = require('./headers');
const { targetTolerance } = require('../endpoints');

const goeyesLmEndpoints = [
    // Init
    {
        path: '@/mobile/init',
        product: 'GoEyes-LM',
        method: 'GET',
        testCases: [
            {
                name: 'Default',
                config: {
                    queryParams: {
                        phone_model: 'IPHONE15,3',
                        version: '5.1.0'
                    },
                    requiredHeaders: commonLmHeaders,
                    expectedSizeBytes: {
                        target: 1074315,
                        tolerance: targetTolerance
                    },
                    schemaFile: 'config/response-schemas/goeyes-lm/mobile-init.json',
                    comparisonFile: 'config/response-bodies/goeyes-lm/mobile-init.json'
                }
            }
            // Additional test cases can be added here
        ]
    },

    // Check Weak Eye
    {
        path: '@/go-eyes/checkweakeye/v2',
        product: 'GoEyes-LM',
        method: 'POST',
        config: {
            queryParams: {},
            requiredHeaders: commonLmHeaders,
            requestBody: require('../request-bodies/goeyes-lm/check-weak-eye-v2.json'),
            expectedSizeBytes: {
                target: 2281 ,
                tolerance: targetTolerance
            },
            schemaFile: 'config/response-schemas/goeyes-lm/check-weak-eye-v2.json',
            comparisonFile: 'config/response-bodies/goeyes-lm/check-weak-eye-v2.json'
        }
    },

    // Weak Eye Relaxed
    {
        path: '@/go-eyes/weakEyeRelaxed/v2',
        product: 'GoEyes-LM',
        method: 'POST',
        config: {
            queryParams: {},
            requiredHeaders: commonLmHeaders,
            requestBody: require('../request-bodies/goeyes-lm/weak-eye-relaxed-v2.json'),
            expectedSizeBytes: {
                target: 419,
                tolerance: targetTolerance
            },
            schemaFile: 'config/response-schemas/goeyes-lm/weak-eye-relaxed-v2.json',
            comparisonFile: 'config/response-bodies/goeyes-lm/weak-eye-relaxed-v2.json'
        }
    },

    // J
    {
        path: '@/go-eyes/j/sph/cyl-verifier/low',
        product: 'GoEyes-LM',
        method: 'POST',
        config: {
            queryParams: {},
            requiredHeaders: commonLmHeaders,
            requestBody: require('../request-bodies/goeyes-lm/cyl-verifier-low.json'),
            expectedSizeBytes: {
                target: 623,
                tolerance: targetTolerance
            },
            schemaFile: 'config/response-schemas/goeyes-lm/cyl-verifier-low.json',
            comparisonFile: 'config/response-bodies/goeyes-lm/cyl-verifier-low.json'
        }
    },
    {
        path: '@/go-eyes/j/sph/cyl-verifier/low/mdba/consistency',
        product: 'GoEyes-LM',
        method: 'POST',
        config: {
            queryParams: {},
            requiredHeaders: commonLmHeaders,
            requestBody: require('../request-bodies/goeyes-lm/low-mdba-consistency.json'),
            expectedSizeBytes: {
                target: 260,
                tolerance: targetTolerance
            },
            schemaFile: 'config/response-schemas/goeyes-lm/low-mdba-consistency.json',
            comparisonFile: 'config/response-bodies/goeyes-lm/low-mdba-consistency.json'
        }
    },
    {
        path: '@/go-eyes/j/sph/cyl-verifier/low/mdba/calcMdba',
        product: 'GoEyes-LM',
        method: 'POST',
        config: {
            queryParams: {},
            requiredHeaders: commonLmHeaders,
            requestBody: require('../request-bodies/goeyes-lm/low-mdba-calcMdba.json'),
            expectedSizeBytes: {
                target: 413,
                tolerance: targetTolerance
            },
            schemaFile: 'config/response-schemas/goeyes-lm/low-mdba-calcMdba.json',
            comparisonFile: 'config/response-bodies/goeyes-lm/low-mdba-calcMdba.json'
        }
    },
    {
        path: '@/go-eyes/j/sph/cyl-verifier/low/mdba/final',
        product: 'GoEyes-LM',
        method: 'POST',
        config: {
            queryParams: {},
            requiredHeaders: commonLmHeaders,
            requestBody: require('../request-bodies/goeyes-lm/low-mdba-final.json'),
            expectedSizeBytes: {
                target: 338,
                tolerance: targetTolerance
            },
            schemaFile: 'config/response-schemas/goeyes-lm/low-mdba-final.json',
            comparisonFile: 'config/response-bodies/goeyes-lm/low-mdba-final.json'
        }
    },
    {
        path: '@/go-eyes/j/sph/cyl-verifier/mid',
        product: 'GoEyes-LM',
        method: 'POST',
        config: {
            queryParams: {},
            requiredHeaders: commonLmHeaders,
            requestBody: require('../request-bodies/goeyes-lm/cyl-verifier-mid.json'),
            expectedSizeBytes: {
                target: 586,
                tolerance: targetTolerance
            },
            schemaFile: 'config/response-schemas/goeyes-lm/cyl-verifier-mid.json',
            comparisonFile: 'config/response-bodies/goeyes-lm/cyl-verifier-mid.json'
        }
    },
    {
        path: '@/go-eyes/j/sph/cyl-verifier/mid/high',
        product: 'GoEyes-LM',
        method: 'POST',
        config: {
            queryParams: {},
            requiredHeaders: commonLmHeaders,
            requestBody: require('../request-bodies/goeyes-lm/cyl-verifier-mid-high.json'),
            expectedSizeBytes: {
                target: 497,
                tolerance: targetTolerance
            },
            schemaFile: 'config/response-schemas/goeyes-lm/cyl-verifier-mid-high.json',
            comparisonFile: 'config/response-bodies/goeyes-lm/cyl-verifier-mid-high.json'
        }
    },
    {
        path: '@/go-eyes/j/sph/cyl-verifier/high/v2',
        product: 'GoEyes-LM',
        method: 'POST',
        config: {
            queryParams: {},
            requiredHeaders: commonLmHeaders,
            requestBody: require('../request-bodies/goeyes-lm/cyl-verifier-high-v2.json'),
            expectedSizeBytes: {
                target: 612,
                tolerance: targetTolerance
            },
            schemaFile: 'config/response-schemas/goeyes-lm/cyl-verifier-high-v2.json',
            comparisonFile: 'config/response-bodies/goeyes-lm/cyl-verifier-high-v2.json'
        }
    },
    {
        path: '@/go-eyes/j/sph/cyl-verifier/final',
        product: 'GoEyes-LM',
        method: 'POST',
        config: {
            queryParams: {},
            requiredHeaders: commonLmHeaders,
            requestBody: require('../request-bodies/goeyes-lm/cyl-verifier-final.json'),
            expectedSizeBytes: {
                target: 338,
                tolerance: targetTolerance
            },
            schemaFile: 'config/response-schemas/goeyes-lm/cyl-verifier-final.json',
            comparisonFile: 'config/response-bodies/goeyes-lm/cyl-verifier-final.json'
        }
    },

    // Mono Va
    {
        path: '@/go-eyes/monoVaConfirmed/v2',
        product: 'GoEyes-LM',
        method: 'POST',
        config: {
            queryParams: {},
            requiredHeaders: commonLmHeaders,
            requestBody: require('../request-bodies/goeyes-lm/mono-va-confirmed-v2.json'),
            expectedSizeBytes: {
                target: 2203,
                tolerance: targetTolerance
            },
            schemaFile: 'config/response-schemas/goeyes-lm/mono-va-confirmed-v2.json',
            comparisonFile: 'config/response-bodies/goeyes-lm/mono-va-confirmed-v2.json'
        }
    },

    // Save Station
    {
        path: '@/go-eyes/save-station',
        product: 'GoEyes-LM',
        method: 'POST',
        config: {
            queryParams: {},
            requiredHeaders: commonLmHeaders,
            requestBody: require('../request-bodies/goeyes-lm/save-station.json'),
            expectedSizeBytes: {
                target: 2,
                tolerance: targetTolerance
            },
            schemaFile: 'config/response-schemas/goeyes-lm/save-station.json',
            comparisonFile: 'config/response-bodies/goeyes-lm/save-station.json'
        }
    },
];

// For backward compatibility, copy the first test case config to the endpoint level
goeyesLmEndpoints.forEach(endpoint => {
    if (endpoint.testCases && endpoint.testCases.length > 0) {
        endpoint.config = endpoint.testCases[0].config;
    }
});

module.exports = goeyesLmEndpoints; 