const { commonHeaders, attachmentsHeaders, phiHeaders, pdHeaders, goeyesLmHeaders, vaHeaders } = require('./endpoints/headers');

// Response size validation constants
const targetTolerance = 10;

// Export constants first to avoid circular dependency
exports.targetTolerance = targetTolerance;

// Then require the endpoint files that use targetTolerance
const goeyesEndpoints = require('./endpoints/goeyes');
const goeyesNormalEndpoints = require('./endpoints/goeyes-normal');
const goeyesLmEndpoints = require('./endpoints/goeyes-lm');
const goeyesAndEndpoints = require('./endpoints/goeyes-and');
const attachmentsEndpoints = require('./endpoints/attachments');
const phiEndpoints = require('./endpoints/phi');
const pdEndpoints = require('./endpoints/pd');
const vaEndpoints = require('./endpoints/va');
const lensesEndpoints = require('./endpoints/Lenses');
const mockEndpoints = require('./endpoints/mock');

// Product-level test information
const productTests = {
    'GoEyes': [
        'basic.spec.js',
        'headers.spec.js',
        'query-params.spec.js',
        'response-structure.spec.js',
        'response-comparison.spec.js',
        'validation.spec.js'  
    ],
    'GoEyes-Normal': [
        'basic.spec.js',
        'headers.spec.js',
        'query-params.spec.js',
        'response-structure.spec.js',
        'response-comparison.spec.js',
    ],
    'GoEyes-LM': [
        'basic.spec.js',
        'headers.spec.js',
        'query-params.spec.js',
        'response-structure.spec.js',
        'response-comparison.spec.js', 
    ],
    'GoEyes-Android': [
        'basic.spec.js',
        'headers.spec.js',
        'query-params.spec.js',
        'response-structure.spec.js',
        'response-comparison.spec.js',
    ],
    'Attachments': [
        'basic.spec.js',
        'headers-attachments.spec.js',
        'response-structure.spec.js',
        'response-comparison.spec.js',
        'upload-attachments.spec.js'
    ],
    'PHI': [
        'basic-phi.spec.js',
        'headers-phi.spec.js',
        'response-structure.spec.js',
        'response-comparison.spec.js',
    ],
    'PD': [
        'basic.spec.js',
        'headers-pd.spec.js',
        'query-params.spec.js',
        'response-structure.spec.js',
        'response-comparison.spec.js',
    ],
    'VA': [
        'basic.spec.js',
        'headers-va.spec.js',
        'query-params.spec.js',
        'response-structure.spec.js',
        'response-comparison.spec.js',
    ],
    'Lenses': [
        'basic.spec.js',
        'headers.spec.js',
        'query-params.spec.js',
        'response-structure.spec.js',
        'response-comparison.spec.js',
    ]
};

// Combine all endpoints
const endpoints = [
    ...goeyesEndpoints,
    ...goeyesNormalEndpoints,
    ...goeyesLmEndpoints,
    ...goeyesAndEndpoints,
    ...attachmentsEndpoints,
    ...phiEndpoints,
    ...pdEndpoints,
    ...vaEndpoints,
    ...lensesEndpoints,
    ...mockEndpoints,
];

// Export everything else
module.exports = {
    ...exports,  // Include the already exported targetTolerance
    endpoints,
    commonHeaders,
    goeyesLmHeaders,
    goeyesAndEndpoints,
    attachmentsHeaders,
    phiHeaders,
    pdHeaders,
    vaHeaders,
    productTests
};