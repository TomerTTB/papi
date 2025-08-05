const { pdHeaders } = require('./headers');
const { targetTolerance } = require('../endpoints');    

const lensesEndpoints = [
    // VA Measurement
    {
        path: '@/webcompanion/init',
        product: 'Lenses',
        method: 'GET',
        config: {
            queryParams: {},
            requiredHeaders: pdHeaders,
            // requestBody: require('../request-bodies/va/bino-decrease.json'),
            expectedSizeBytes: {
                target: 472,
                tolerance: targetTolerance
            },
            schemaFile: '',
            comparisonFile: ''
        }
    },
];

module.exports = lensesEndpoints; 