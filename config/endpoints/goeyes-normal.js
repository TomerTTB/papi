const commonHeaders = require('./headers').commonHeaders;
const { targetTolerance } = require('../endpoints');

const goeyesNormalEndpoints = [
    // Init
    {
        path: '@/mobile/init',
        product: 'GoEyes-Normal',
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
                        target: 752946,
                        tolerance: targetTolerance
                    },
                    schemaFile: 'config/response-schemas/goeyes-normal/mobile-init.json',
                    comparisonFile: 'config/response-bodies/goeyes-normal/mobile-init.json'
                }
            }
        ]
    },

    // Check Weak Eye
    {
        path: '@/go-eyes/checkweakeye/block3',
        product: 'GoEyes-Normal',
        method: 'POST',
        testCases: [
            {
                name: 'Default',
                config: {
                    queryParams: {},
                    requiredHeaders: commonHeaders,
                    requestBody: require('../request-bodies/goeyes-normal/check-weak-eye-block3.json'),
                    expectedSizeBytes: {
                        target: 2258,
                        tolerance: targetTolerance
                    },
                    schemaFile: 'config/response-schemas/goeyes-normal/check-weak-eye-block3.json',
                    comparisonFile: 'config/response-bodies/goeyes-normal/check-weak-eye-block3.json'
                }
            },
        ]
    },

    // Weak Eye Relaxed
    {
        path: '@/go-eyes/weakEyeRelaxed',
        product: 'GoEyes-Normal',
        method: 'POST',
        config: {
            queryParams: {},
            requiredHeaders: commonHeaders,
            requestBody: require('../request-bodies/goeyes-normal/weak-eye-relaxed.json'),
            expectedSizeBytes: {
                target: 425,
                tolerance: targetTolerance
            },
            schemaFile: 'config/response-schemas/goeyes-normal/weak-eye-relaxed.json',
            comparisonFile: 'config/response-bodies/goeyes-normal/weak-eye-relaxed.json'
        }
    },

    // J
    {
        path: '@/go-eyes/j/sph/cyl-verifier/low',
        product: 'GoEyes-Normal',
        method: 'POST',
        config: {
            queryParams: {},
            requiredHeaders: commonHeaders,
            requestBody: require('../request-bodies/goeyes-normal/cyl-verifier-low.json'),
            expectedSizeBytes: {
                target: 627,
                tolerance: targetTolerance
            },
            schemaFile: 'config/response-schemas/goeyes-normal/cyl-verifier-low.json',
            comparisonFile: 'config/response-bodies/goeyes-normal/cyl-verifier-low.json'
        }
    },
    {
        path: '@/go-eyes/j/sph/cyl-verifier/low/mdba/consistency',
        product: 'GoEyes-Normal',
        method: 'POST',
        config: {
            queryParams: {},
            requiredHeaders: commonHeaders,
            requestBody: require('../request-bodies/goeyes-normal/low-mdba-consistency.json'),
            expectedSizeBytes: {
                target: 254,
                tolerance: targetTolerance
            },
            schemaFile: 'config/response-schemas/goeyes-normal/low-mdba-consistency.json',
            comparisonFile: 'config/response-bodies/goeyes-normal/low-mdba-consistency.json'
        }
    },
    {
        path: '@/go-eyes/j/sph/cyl-verifier/low/mdba/calcMdba',
        product: 'GoEyes-Normal',
        method: 'POST',
        config: {
            queryParams: {},
            requiredHeaders: commonHeaders,
            requestBody: require('../request-bodies/goeyes-normal/low-mdba-calcMdba.json'),
            expectedSizeBytes: {
                target: 407,
                tolerance: targetTolerance
            },
            schemaFile: 'config/response-schemas/goeyes-normal/low-mdba-calcMdba.json',
            comparisonFile: 'config/response-bodies/goeyes-normal/low-mdba-calcMdba.json'
        }
    },
    {
        path: '@/go-eyes/j/sph/cyl-verifier/low/mdba/final',
        product: 'GoEyes-Normal',
        method: 'POST',
        config: {
            queryParams: {},
            requiredHeaders: commonHeaders,
            requestBody: require('../request-bodies/goeyes-normal/low-mdba-final.json'),
            expectedSizeBytes: {
                target: 332,
                tolerance: targetTolerance
            },
            schemaFile: 'config/response-schemas/goeyes-normal/low-mdba-final.json',
            comparisonFile: 'config/response-bodies/goeyes-normal/low-mdba-final.json'
        }
    },
    {
        path: '@/go-eyes/j/sph/cyl-verifier/mid',
        product: 'GoEyes-Normal',
        method: 'POST',
        config: {
            queryParams: {},
            requiredHeaders: commonHeaders,
            requestBody: require('../request-bodies/goeyes-normal/cyl-verifier-mid.json'),
            expectedSizeBytes: {
                target: 581,
                tolerance: targetTolerance
            },
            schemaFile: 'config/response-schemas/goeyes-normal/cyl-verifier-mid.json',
            comparisonFile: 'config/response-bodies/goeyes-normal/cyl-verifier-mid.json'
        }
    },
    {
        path: '@/go-eyes/j/sph/cyl-verifier/mid/high',
        product: 'GoEyes-Normal',
        method: 'POST',
        config: {
            queryParams: {},
            requiredHeaders: commonHeaders,
            requestBody: require('../request-bodies/goeyes-normal/cyl-verifier-mid-high.json'),
            expectedSizeBytes: {
                target: 492,
                tolerance: targetTolerance
            },
            schemaFile: 'config/response-schemas/goeyes-normal/cyl-verifier-mid-high.json',
            comparisonFile: 'config/response-bodies/goeyes-normal/cyl-verifier-mid-high.json'
        }
    },
    {
        path: '@/go-eyes/j/sph/cyl-verifier/high',
        product: 'GoEyes-Normal',
        method: 'POST',
        config: {
            queryParams: {},
            requiredHeaders: commonHeaders,
            requestBody: require('../request-bodies/goeyes-normal/cyl-verifier-high.json'),
            expectedSizeBytes: {
                target: 606,
                tolerance: targetTolerance
            },
            schemaFile: 'config/response-schemas/goeyes-normal/cyl-verifier-high.json',
            comparisonFile: 'config/response-bodies/goeyes-normal/cyl-verifier-high.json'
        }
    },
    {
        path: '@/go-eyes/j/sph/cyl-verifier/final',
        product: 'GoEyes-Normal',
        method: 'POST',
        config: {
            queryParams: {},
            requiredHeaders: commonHeaders,
            requestBody: require('../request-bodies/goeyes-normal/cyl-verifier-final.json'),
            expectedSizeBytes: {
                target: 333,
                tolerance: targetTolerance
            },
            schemaFile: 'config/response-schemas/goeyes-normal/cyl-verifier-final.json',
            comparisonFile: 'config/response-bodies/goeyes-normal/cyl-verifier-final.json'
        }
    },

    // Mono Va
    {
        path: '@/go-eyes/monoVaConfirmed/',
        product: 'GoEyes-Normal',
        method: 'POST',
        config: {
            queryParams: {},
            requiredHeaders: commonHeaders,
            requestBody: require('../request-bodies/goeyes-normal/mono-va-confirmed.json'),
            expectedSizeBytes: {
                target: 2185,
                tolerance: targetTolerance
            },
            schemaFile: 'config/response-schemas/goeyes-normal/mono-va-confirmed.json',
            comparisonFile: 'config/response-bodies/goeyes-normal/mono-va-confirmed.json'
        }
    },

    // Save Station
    {
        path: '@/go-eyes/save-station',
        product: 'GoEyes-Normal',
        method: 'POST',
        config: {
            queryParams: {},
            requiredHeaders: commonHeaders,
            requestBody: require('../request-bodies/goeyes-normal/check-weak-eye-block3.json'),
            expectedSizeBytes: {
                target: 2,
                tolerance: targetTolerance
            },
            schemaFile: 'config/response-schemas/goeyes-normal/save-station.json',
            comparisonFile: 'config/response-bodies/goeyes-normal/save-station.json'
        }
    },

    // FFC
    {
        path: '@/face-distance-calibration/ffc-calculation',
        product: 'GoEyes-Normal',
        method: 'POST',
        config: {
            queryParams: {},
            requiredHeaders: commonHeaders,
            requestBody: require('../request-bodies/goeyes-normal/ffc-calculation.json'),
            expectedSizeBytes: {
                target: 15840,
                tolerance: targetTolerance
            },
            schemaFile: 'config/response-schemas/goeyes-normal/ffc-calculation.json',
            comparisonFile: 'config/response-bodies/goeyes-normal/ffc-calculation.json'
        }
    }
];

// For backward compatibility, copy the first test case config to the endpoint level
goeyesNormalEndpoints.forEach(endpoint => {
    if (endpoint.testCases && endpoint.testCases.length > 0) {
        endpoint.config = endpoint.testCases[0].config;
    }
});

module.exports = goeyesNormalEndpoints; 