const commonHeaders = require('./headers').commonHeaders;
const { targetTolerance } = require('../endpoints');

const mockEndpoints = [
    // Init
    {
        path: '/a',
        product: 'Mock',
        method: 'GET',
        config: {
            queryParams: {
            },
            requiredHeaders: {
            },
            expectedSizeBytes: {
                target: 744379,
                tolerance: targetTolerance
            },
            schemaFile: 'config/response-schemas/goeyes/mobile-init.json',
            comparisonFile: 'config/response-bodies/goeyes/mobile-init.json'
        }
    },
    {
        path: '/b',
        product: 'Mock',
        method: 'GET',
        config: {
            queryParams: {
            },
            requiredHeaders: {
            },
            expectedSizeBytes: {
                target: 744379,
                tolerance: targetTolerance
            },
            schemaFile: 'config/response-schemas/goeyes/mobile-init.json',
            comparisonFile: 'config/response-bodies/goeyes/mobile-init.json'
        }
    },
    {
        path: '/c',
        product: 'Mock',
        method: 'GET',
        config: {
            queryParams: {
            },
            requiredHeaders: {
            },
            expectedSizeBytes: {
                target: 744379,
                tolerance: targetTolerance
            },
            schemaFile: 'config/response-schemas/goeyes/mobile-init.json',
            comparisonFile: 'config/response-bodies/goeyes/mobile-init.json'
        }
    },
];

module.exports = mockEndpoints; 