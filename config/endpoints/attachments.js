const { attachmentsHeaders } = require('./headers');
const { targetTolerance } = require('../endpoints');

const attachmentsEndpoints = [
    {
        path: 'attachments',
        product: 'Attachments',
        method: 'POST',
        config: {
            queryParams: {},
            requiredHeaders: attachmentsHeaders,
            expectedSizeBytes: {
                target: 55166,
                tolerance: 700
            },
            schemaFile: 'config/response-schemas/attachments/attachments.json',
            comparisonFile: 'config/response-bodies/attachments/attachments.json',
            uploadFilePath: '../papi/config/upload-attachments/testpass.csv'
        }
    }
];

module.exports = attachmentsEndpoints; 