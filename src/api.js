const { endpoints, productTests } = require('../config/endpoints');
const testController = require('./testController');
const testCaseGenerator = require('./testCaseGenerator');
const path = require('path');
const fs = require('fs');

const getVersion = (req, res) => {
    console.log('\n=== Version Request ===');
    console.log(`Time: ${new Date().toISOString()}`);
    console.log(`Method: ${req.method}`);
    console.log(`URL: ${req.url}`);
    
    const version = process.env.PAPI_VERSION || 'Unknown';
    console.log('Version:', version);
    console.log('===========================\n');
    
    res.send(version);
};

const getProductStats = (req, res) => {
    console.log('\n=== Product Stats Request ===');
    console.log(`Time: ${new Date().toISOString()}`);
    console.log(`Method: ${req.method}`);
    console.log(`URL: ${req.url}`);
    console.log('Headers:', req.headers);

    // Get unique products and count their endpoints
    const productStats = endpoints.reduce((acc, endpoint) => {
        const product = endpoint.product;
        if (!acc[product]) {
            acc[product] = {
                name: product,
                endpointCount: 0,
                baseURL: process.env.BASE_URL || 'http://localhost:3000'
            };
        }
        acc[product].endpointCount++;
        return acc;
    }, {});

    const response = Object.values(productStats);
    console.log('\nResponse Data:', JSON.stringify(response, null, 2));
    console.log('===========================\n');

    res.json(response);
};

const getProductDetails = (req, res) => {
    console.log('\n=== Product Details Request ===');
    console.log(`Time: ${new Date().toISOString()}`);
    console.log(`Method: ${req.method}`);
    console.log(`URL: ${req.url}`);
    console.log('Headers:', req.headers);

    // Group endpoints by product
    const productDetails = endpoints.reduce((acc, endpoint) => {
        const product = endpoint.product;
        if (!acc[product]) {
            acc[product] = {
                name: product,
                paths: [],
                tests: productTests[product] || [],
                baseURL: process.env.BASE_URL || 'http://localhost:3000'
            };
            
            // Add product-specific base URLs
            if (product === 'Attachments') {
                acc[product].baseURL_ATTACHMENTS = process.env.BASE_URL_ATTACHMENTS;
            } else if (product === 'PHI') {
                acc[product].baseURL_PHI = process.env.BASE_URL_PHI;
            }
        }
        acc[product].paths.push(endpoint.path);
        return acc;
    }, {});

    const response = Object.values(productDetails);
    console.log('\nResponse Data:', JSON.stringify(response, null, 2));
    console.log('===========================\n');

    res.json(response);
};

const getAvailableTests = (req, res) => {
    console.log('\n=== Available Tests Request ===');
    console.log(`Time: ${new Date().toISOString()}`);
    console.log(`Method: ${req.method}`);
    console.log(`URL: ${req.url}`);
    console.log('Headers:', req.headers);

    // Map of test filenames to display names
    // const testNameMap = {
    //     'basic.spec.js': 'Basic',
    //     'headers.spec.js': 'Headers Validation'
    // };

    // Collect all unique test files across products
    const allTests = [];
    
    // Add tests from each product
    Object.entries(productTests).forEach(([product, tests]) => {
        tests.forEach(test => {
            if (!allTests.includes(test)) {
                allTests.push(test);
            }
        });
    });

    // Format response
    const response = allTests.map(test => ({
        name: testNameMap[test] || test.replace('.spec.js', ''),
        path: test
    }));
    
    console.log('\nResponse Data:', JSON.stringify(response, null, 2));
    console.log('===========================\n');

    res.json(response);
};

const runTestSuite = async (req, res) => {
    console.log('\n=== Run Test Suite Request ===');
    console.log(`Time: ${new Date().toISOString()}`);
    console.log(`Method: ${req.method}`);
    console.log(`URL: ${req.url}`);
    console.log('Headers:', req.headers);
    
    // Log the request body - this is the data sent from the client
    // console.log('\nReceived Test Selection:');
    // console.log(JSON.stringify(req.body, null, 2));
    // console.log('===========================\n');

    const { selection } = req.body;

    if (!selection || !selection.endpoints || !Array.isArray(selection.endpoints) || selection.endpoints.length === 0) {
        console.error('Error: selection.endpoints must be a non-empty array');
        return res.status(400).json({ error: 'selection.endpoints must be a non-empty array' });
    }

    if (!selection.tests || !Array.isArray(selection.tests) || selection.tests.length === 0) {
        console.error('Error: selection.tests must be a non-empty array');
        return res.status(400).json({ error: 'selection.tests must be a non-empty array' });
    }

    try {
        const results = await testController.runTests(selection);
        res.json(results);
    } catch (error) {
        console.error('Error running tests:', error);
        res.status(500).json({ error: 'Failed to run tests: ' + error.message });
    }
};

const getProductCsvFiles = async (req, res) => {
    console.log('\n=== Get Product CSV Files Request ===');
    console.log(`Time: ${new Date().toISOString()}`);
    console.log(`Method: ${req.method}`);
    console.log(`URL: ${req.url}`);
    console.log('Headers:', req.headers);
    
    const { product } = req.params;

    if (!product) {
        console.error('Error: product is required');
        return res.status(400).json({ error: 'Product name is required' });
    }

    try {
        const files = await testCaseGenerator.listProductCsvFiles(product);
        
        console.log(`\nFound ${files.length} CSV files for product ${product}`);
        console.log('Files:', files);
        console.log('===========================\n');

        res.json({
            success: true,
            product: product,
            files: files
        });
    } catch (error) {
        console.error('Error listing CSV files:', error);
        res.status(500).json({ error: 'Failed to list CSV files: ' + error.message });
    }
};

const getEnvironmentVariables = (req, res) => {
    console.log('\n=== Environment Variables Request ===');
    console.log(`Time: ${new Date().toISOString()}`);
    console.log(`Method: ${req.method}`);
    console.log(`URL: ${req.url}`);
    console.log('Headers:', req.headers);

    // Define the regular environment variables
    const regularEnvironmentVariables = [
        { name: 'BASE_URL', value: process.env.BASE_URL },
        { name: 'STAGING', value: process.env.STAGING },
        { name: 'BETA', value: process.env.BETA },
        { name: 'MUFASA', value: process.env.MUFASA },
        { name: 'SHAZAM', value: process.env.SHAZAM },
        { name: 'MADEYE', value: process.env.MADEYE },
        { name: 'SANDBOX', value: process.env.SANDBOX },
        { name: 'UPLOAD_ATTACHMENTS_STAGING', value: process.env.UPLOAD_ATTACHMENTS_STAGING },
        { name: 'UPLOAD_ATTACHMENTS_BETA', value: process.env.UPLOAD_ATTACHMENTS_BETA },
        { name: 'UPLOAD_ATTACHMENTS_MUFASA', value: process.env.UPLOAD_ATTACHMENTS_MUFASA },
        { name: 'UPLOAD_ATTACHMENTS_SHAZAM', value: process.env.UPLOAD_ATTACHMENTS_SHAZAM },
        { name: 'UPLOAD_ATTACHMENTS_MADEYE', value: process.env.UPLOAD_ATTACHMENTS_MADEYE },
        { name: 'UPLOAD_ATTACHMENTS_SANDBOX', value: process.env.UPLOAD_ATTACHMENTS_SANDBOX }
    ];

    // Define the PHI environment variables (excluding API keys)
    const phiEnvironmentVariables = [
        { name: 'BASE_URL_PHI', value: process.env.BASE_URL_PHI },
        { name: 'PHI_URL_STAGING', value: process.env.PHI_URL_STAGING },
        { name: 'PHI_URL_PREPROD', value: process.env.PHI_URL_PREPROD }
    ];

    const response = {
        regular: regularEnvironmentVariables,
        phi: phiEnvironmentVariables
    };

    console.log('\nResponse Data:', JSON.stringify(response, null, 2));
    console.log('===========================\n');

    res.json(response);
};

const updateEnvironmentVariable = (req, res) => {
    console.log('\n=== Update Environment Variable Request ===');
    console.log(`Time: ${new Date().toISOString()}`);
    console.log(`Method: ${req.method}`);
    console.log(`URL: ${req.url}`);
    console.log('Headers:', req.headers);
    console.log('Body:', req.body);

    const { name, value, environment } = req.body;

    if (!name || (!value && !environment)) {
        return res.status(400).json({ error: 'Name and value/environment are required' });
    }

    // Allow updating BASE_URL, BASE_URL_ATTACHMENTS, BASE_URL_PHI, and PHI_API_KEY
    if (name !== 'BASE_URL' && 
        name !== 'BASE_URL_ATTACHMENTS' && 
        name !== 'BASE_URL_PHI' && 
        name !== 'PHI_API_KEY') {
        return res.status(403).json({ error: 'Only BASE_URL, BASE_URL_ATTACHMENTS, BASE_URL_PHI, and PHI_API_KEY can be updated' });
    }

    try {
        // Log the current value before update
        console.log(`Current ${name} value:`, process.env[name]);
        
        // For PHI_API_KEY, use the environment name to get the correct key value
        if (name === 'PHI_API_KEY' && environment) {
            process.env[name] = process.env[environment];
        } else {
            // For all other variables, use the provided value
            process.env[name] = value;
        }
        
        console.log(`Updated ${name} to:`, process.env[name]);
        console.log('===========================\n');

        res.json({ 
            success: true, 
            message: `${name} updated successfully`,
            value: process.env[name]
        });
    } catch (error) {
        console.error('Error updating environment variable:', error);
        console.log('===========================\n');
        res.status(500).json({ error: 'Failed to update environment variable' });
    }
};

/**
 * Download CSV File
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * 
 * Downloads a specific CSV file for a product with security checks:
 * - Prevents directory traversal attacks
 * - Validates file extension (.csv)
 * - Ensures filename starts with product name
 */
const downloadCsvFile = (req, res) => {
    console.log('\n=== CSV File Download Request ===');
    console.log(`Time: ${new Date().toISOString()}`);
    console.log(`Method: ${req.method}`);
    console.log(`URL: ${req.url}`);
    console.log('Headers:', req.headers);

    const { product, filename } = req.params;
    
    // Security check: Prevent directory traversal attacks
    if (filename.includes('..') || product.includes('..')) {
        console.log('Security check failed: Directory traversal attempt detected');
        console.log('===========================\n');
        return res.status(403).send('Forbidden');
    }
    
    // Check if filename ends with .csv
    if (!filename.endsWith('.csv')) {
        console.log('Invalid file extension');
        console.log('===========================\n');
        return res.status(400).send('Only CSV files can be downloaded');
    }
    
    // Using product-specific directory structure
    const filePath = path.join(__dirname, '../output', product.toLowerCase(), filename);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
        console.log('File not found:', filePath);
        console.log('===========================\n');
        return res.status(404).send('File not found');
    }
    
    console.log('File found, sending:', filePath);
    console.log('===========================\n');
    
    // Set headers and send file
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.sendFile(filePath);
};

const downloadReport = (req, res) => {
    const { filename } = req.params;
    
    // Security check: Prevent directory traversal and ensure only HTML files
    if (filename.includes('..') || !filename.endsWith('.html')) {
        return res.status(403).json({ error: 'Invalid file request' });
    }

    // Get just the base filename without any path
    const baseFilename = path.basename(filename);
    const reportPath = path.join(process.cwd(), 'playwright-report', baseFilename);

    console.log('Attempting to download report:', reportPath);

    // Check if file exists
    if (!fs.existsSync(reportPath)) {
        console.error('Report file not found:', reportPath);
        return res.status(404).json({ error: 'Report file not found' });
    }

    // Set headers for file download
    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Content-Disposition', `attachment; filename="${baseFilename}"`);

    // Stream the file
    const fileStream = fs.createReadStream(reportPath);
    fileStream.pipe(res);
};

module.exports = {
    getVersion,
    getProductStats,
    getProductDetails,
    getAvailableTests,
    runTestSuite,
    getProductCsvFiles,
    getEnvironmentVariables,
    updateEnvironmentVariable,
    downloadCsvFile,
    downloadReport
}; 