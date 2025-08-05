const commonHeaders = require('./headers').commonHeaders;
const { targetTolerance } = require('../endpoints');

const goeyesEndpoints = [
    // Init
    {
        path: '@/mobile/init',
        product: 'GoEyes',
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
                        target: 746971,
                        tolerance: targetTolerance
                    },
                    schemaFile: 'config/response-schemas/goeyes/mobile-init.json',
                    comparisonFile: 'config/response-bodies/goeyes/mobile-init.json'
                }
            }
            // Additional test cases can be added here
        ]
    },

    // Check Weak Eye
    {
        path: '@/go-eyes/checkweakeye/block3',
        product: 'GoEyes',
        method: 'POST',
        testCases: [
            {
                name: 'Default',
                config: {
                    queryParams: {},
                    requiredHeaders: commonHeaders,
                    requestBody: require('../request-bodies/goeyes/check-weak-eye-block3.json'),
                    expectedSizeBytes: {
                        target: 2258,
                        tolerance: targetTolerance
                    },
                    schemaFile: 'config/response-schemas/goeyes/check-weak-eye-block3.json',
                    comparisonFile: 'config/response-bodies/goeyes/check-weak-eye-block3.json'
                }
            },
            {
                name: 'DefaultOne',
                config: {
                    queryParams: {},
                    requiredHeaders: commonHeaders,
                    requestBody: require('../request-bodies/goeyes/one-check-weak-eye-block3.json'),
                    expectedSizeBytes: {
                        target: 2258,
                        tolerance: targetTolerance
                    },
                    schemaFile: 'config/response-schemas/goeyes/one-check-weak-eye-block3.json',
                    comparisonFile: 'config/response-bodies/goeyes/one-check-weak-eye-block3.json'
                }
            }
        ]
    },
    {
        path: '@/go-eyes/checkweakeye/v2',
        product: 'GoEyes',
        method: 'POST',
        config: {
            queryParams: {},
            requiredHeaders: commonHeaders,
            requestBody: require('../request-bodies/goeyes/check-weak-eye-block3.json'),
            expectedSizeBytes: {
                target: 2259 ,
                tolerance: targetTolerance
            },
            schemaFile: 'config/response-schemas/goeyes/check-weak-eye-block3.json',
            comparisonFile: 'config/response-bodies/goeyes/check-weak-eye-v2.json'
        }
    },

    // Weak Eye Relaxed
    {
        path: '@/go-eyes/weakEyeRelaxed',
        product: 'GoEyes',
        method: 'POST',
        config: {
            queryParams: {},
            requiredHeaders: commonHeaders,
            requestBody: require('../request-bodies/goeyes/weak-eye-relaxed.json'),
            expectedSizeBytes: {
                target: 434,
                tolerance: targetTolerance
            },
            schemaFile: 'config/response-schemas/goeyes/weak-eye-relaxed.json',
            comparisonFile: 'config/response-bodies/goeyes/weak-eye-relaxed.json'
        }
    },
    {
        path: '@/go-eyes/weakEyeRelaxed/v2',
        product: 'GoEyes',
        method: 'POST',
        config: {
            queryParams: {},
            requiredHeaders: commonHeaders,
            requestBody: require('../request-bodies/goeyes/weak-eye-relaxed.json'),
            expectedSizeBytes: {
                target: 434,
                tolerance: targetTolerance
            },
            schemaFile: 'config/response-schemas/goeyes/weak-eye-relaxed.json',
            comparisonFile: 'config/response-bodies/goeyes/weak-eye-relaxed-v2.json'
        }
    },

    // J
    {
        path: '@/go-eyes/j/sph/cyl-verifier/low',
        product: 'GoEyes',
        method: 'POST',
        config: {
            queryParams: {},
            requiredHeaders: commonHeaders,
            requestBody: require('../request-bodies/goeyes/cyl-verifier-low.json'),
            expectedSizeBytes: {
                target: 597,
                tolerance: targetTolerance
            },
            schemaFile: 'config/response-schemas/goeyes/cyl-verifier-low.json',
            comparisonFile: 'config/response-bodies/goeyes/cyl-verifier-low.json'
        }
    },
    {
        path: '@/go-eyes/j/sph/cyl-verifier/low/mdba/consistency',
        product: 'GoEyes',
        method: 'POST',
        config: {
            queryParams: {},
            requiredHeaders: commonHeaders,
            requestBody: require('../request-bodies/goeyes/low-mdba-consistency.json'),
            expectedSizeBytes: {
                target: 265,
                tolerance: targetTolerance
            },
            schemaFile: 'config/response-schemas/goeyes/low-mdba-consistency.json',
            comparisonFile: 'config/response-bodies/goeyes/low-mdba-consistency.json'
        }
    },
    {
        path: '@/go-eyes/j/sph/cyl-verifier/low/mdba/calcMdba',
        product: 'GoEyes',
        method: 'POST',
        config: {
            queryParams: {},
            requiredHeaders: commonHeaders,
            requestBody: require('../request-bodies/goeyes/low-mdba-calcMdba.json'),
            expectedSizeBytes: {
                target: 405,
                tolerance: targetTolerance
            },
            schemaFile: 'config/response-schemas/goeyes/low-mdba-calcMdba.json',
            comparisonFile: 'config/response-bodies/goeyes/low-mdba-calcMdba.json'
        }
    },
    {
        path: '@/go-eyes/j/sph/cyl-verifier/low/mdba/final',
        product: 'GoEyes',
        method: 'POST',
        config: {
            queryParams: {},
            requiredHeaders: commonHeaders,
            requestBody: require('../request-bodies/goeyes/low-mdba-final.json'),
            expectedSizeBytes: {
                target: 333,
                tolerance: targetTolerance
            },
            schemaFile: 'config/response-schemas/goeyes/low-mdba-final.json',
            comparisonFile: 'config/response-bodies/goeyes/low-mdba-final.json'
        }
    },
    {
        path: '@/go-eyes/j/sph/cyl-verifier/mid',
        product: 'GoEyes',
        method: 'POST',
        config: {
            queryParams: {},
            requiredHeaders: commonHeaders,
            requestBody: require('../request-bodies/goeyes/cyl-verifier-mid.json'),
            expectedSizeBytes: {
                target: 663,
                tolerance: targetTolerance
            },
            schemaFile: 'config/response-schemas/goeyes/cyl-verifier-mid.json',
            comparisonFile: 'config/response-bodies/goeyes/cyl-verifier-mid.json'
        }
    },
    {
        path: '@/go-eyes/j/sph/cyl-verifier/mid/high',
        product: 'GoEyes',
        method: 'POST',
        config: {
            queryParams: {},
            requiredHeaders: commonHeaders,
            requestBody: require('../request-bodies/goeyes/cyl-verifier-mid-high.json'),
            expectedSizeBytes: {
                target: 492,
                tolerance: targetTolerance
            },
            schemaFile: 'config/response-schemas/goeyes/cyl-verifier-mid-high.json',
            comparisonFile: 'config/response-bodies/goeyes/cyl-verifier-mid-high.json'
        }
    },
    {
        path: '@/go-eyes/j/sph/cyl-verifier/high',
        product: 'GoEyes',
        method: 'POST',
        config: {
            queryParams: {},
            requiredHeaders: commonHeaders,
            requestBody: require('../request-bodies/goeyes/cyl-verifier-high.json'),
            expectedSizeBytes: {
                target: 606,
                tolerance: targetTolerance
            },
            schemaFile: 'config/response-schemas/goeyes/cyl-verifier-high.json',
            comparisonFile: 'config/response-bodies/goeyes/cyl-verifier-high.json'
        }
    },
    {
        path: '@/go-eyes/j/sph/cyl-verifier/high/v2',
        product: 'GoEyes',
        method: 'POST',
        config: {
            queryParams: {},
            requiredHeaders: commonHeaders,
            requestBody: require('../request-bodies/goeyes/cyl-verifier-high-v2.json'),
            expectedSizeBytes: {
                target: 611,
                tolerance: targetTolerance
            },
            schemaFile: 'config/response-schemas/goeyes/cyl-verifier-high-v2.json',
            comparisonFile: 'config/response-bodies/goeyes/cyl-verifier-high-v2.json'
        }
    },
    {
        path: '@/go-eyes/j/sph/cyl-verifier/final',
        product: 'GoEyes',
        method: 'POST',
        config: {
            queryParams: {},
            requiredHeaders: commonHeaders,
            requestBody: require('../request-bodies/goeyes/cyl-verifier-final.json'),
            expectedSizeBytes: {
                target: 333,
                tolerance: targetTolerance
            },
            schemaFile: 'config/response-schemas/goeyes/cyl-verifier-final.json',
            comparisonFile: 'config/response-bodies/goeyes/cyl-verifier-final.json'
        }
    },

    // Mono Va
    {
        path: '@/go-eyes/monoVaConfirmed/',
        product: 'GoEyes',
        method: 'POST',
        config: {
            queryParams: {},
            requiredHeaders: commonHeaders,
            requestBody: require('../request-bodies/goeyes/mono-va-confirmed.json'),
            expectedSizeBytes: {
                target: 2174,
                tolerance: targetTolerance
            },
            schemaFile: 'config/response-schemas/goeyes/mono-va-confirmed.json',
            comparisonFile: 'config/response-bodies/goeyes/mono-va-confirmed.json'
        }
    },
    {
        path: '@/go-eyes/monoVaConfirmed/v2',
        product: 'GoEyes',
        method: 'POST',
        config: {
            queryParams: {},
            requiredHeaders: commonHeaders,
            requestBody: require('../request-bodies/goeyes/mono-va-confirmed.json'),
            expectedSizeBytes: {
                target: 2174,
                tolerance: targetTolerance
            },
            schemaFile: 'config/response-schemas/goeyes/mono-va-confirmed.json',
            comparisonFile: 'config/response-bodies/goeyes/mono-va-confirmed-v2.json'
        }
    },

    // Save Station
    {
        path: '@/go-eyes/save-station',
        product: 'GoEyes',
        method: 'POST',
        config: {
            queryParams: {},
            requiredHeaders: commonHeaders,
            requestBody: require('../request-bodies/goeyes/check-weak-eye-block3.json'),
            expectedSizeBytes: {
                target: 2,
                tolerance: targetTolerance
            },
            schemaFile: 'config/response-schemas/goeyes/save-station.json',
            comparisonFile: 'config/response-bodies/goeyes/save-station.json'
        }
    },

    // FFC
    {
        path: '@/face-distance-calibration/ffc-calculation',
        product: 'GoEyes',
        method: 'POST',
        config: {
            queryParams: {},
            requiredHeaders: commonHeaders,
            requestBody: require('../request-bodies/goeyes/ffc-calculation.json'),
            expectedSizeBytes: {
                target: 15840,
                tolerance: targetTolerance
            },
            schemaFile: 'config/response-schemas/goeyes/ffc-calculation.json',
            comparisonFile: 'config/response-bodies/goeyes/ffc-calculation.json'
        }
    }
];

// For backward compatibility, copy the first test case config to the endpoint level
goeyesEndpoints.forEach(endpoint => {
    if (endpoint.testCases && endpoint.testCases.length > 0) {
        endpoint.config = endpoint.testCases[0].config;
    }
});

module.exports = goeyesEndpoints; 