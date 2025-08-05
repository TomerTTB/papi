const { pdHeaders, pdHeadersNative, pdHeadersVerify } = require('./headers');
const { targetTolerance } = require('../endpoints');
const fs = require('fs');
const path = require('path');
const pdVerifyFormData = require('../request-bodies/pd/pd-verify-form');

const pdEndpoints = [
    // PD Measurement
    {
        path: '@/websdk/init',
        product: 'PD',
        method: 'GET',
        config: {
            queryParams: {},
            requiredHeaders: pdHeaders,
            expectedSizeBytes: {
                target: 151882,
                tolerance: targetTolerance
            },
            schemaFile: 'config/response-schemas/pd/websdk-init.json',
            comparisonFile: 'config/response-bodies/pd/websdk-init.json'
        }
    },
    {
        path: '@/mobile/init',
        product: 'PD',
        method: 'GET',
        config: {
            queryParams: {
                phone_model: 'IPHONE14,2',
                version: '5.1.0'
            },
            requiredHeaders: pdHeadersNative,
            expectedSizeBytes: {
                target: 74550,
                tolerance: targetTolerance
            },
            schemaFile: 'config/response-schemas/pd/mobile-init.json',
            comparisonFile: 'config/response-bodies/pd/mobile-init.json'
        }
    },
    {
        path: '@/pd/verify',
        product: 'PD',
        method: 'POST',
        config: {
            queryParams: {},
            requiredHeaders: pdHeadersVerify,
            formData: pdVerifyFormData.formData,
            fileParams: pdVerifyFormData.fileParams,
            expectedSizeBytes: {
                target: 1126,
                tolerance: targetTolerance
            },
            schemaFile: 'config/response-schemas/pd/verify.json',
            comparisonFile: 'config/response-bodies/pd/verify.json'
        }
    }
];

module.exports = pdEndpoints; 