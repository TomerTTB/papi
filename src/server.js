/**
 * Main server file for the API Testing Platform
 * This file sets up the Express server, configures CORS, and defines all API endpoints
 */

const express = require('express');
const cors = require('cors');
const api = require('./api');
const path = require('path');
const fs = require('fs');

// Initialize Express app and set port (default: 3000)
const app = express();
const port = process.env.PORT || 3000;

/**
 * CORS Configuration
 * - Allows requests from localhost:3000 and localhost:8080
 * - Supports common HTTP methods (GET, POST, PUT, DELETE, OPTIONS)
 * - Allows Content-Type and Authorization headers
 * - Enables credentials for authenticated requests
 * - Caches preflight requests for 24 hours
 */
const corsOptions = {
    origin: function (origin, callback) {
        // List of allowed origins
        const allowedOrigins = [
            'http://localhost:3000',
            'http://localhost:8080'
        ];
        
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    maxAge: 86400 // 24 hours
};

// Apply middleware
app.use(cors(corsOptions));  // Enable CORS for all routes
app.use(express.json());     // Parse JSON request bodies

/**
 * API Routes
 * 
 * Version and Product Information:
 * - GET /version: Get current PAPI version
 * - GET /product: Get list of products and endpoint counts
 * - GET /productDetails: Get detailed product information including paths
 * 
 * Test Management:
 * - GET /tests: Get list of available test files
 * - POST /runTests: Execute selected test suite
 * 
 * Environment Management:
 * - GET /environment: Get list of environment variables
 * - POST /environment/update: Update environment variables (e.g., BASE_URL)
 * 
 * File Management:
 * - GET /csvFiles/:product: List CSV files for a specific product
 * - GET /download/:product/:filename: Download a specific CSV file
 */

// Version and Product Information Routes
app.get('/version', api.getVersion);
app.get('/product', api.getProductStats);
app.get('/productDetails', api.getProductDetails);

// Test Management Routes
app.get('/tests', api.getAvailableTests);
app.post('/runTests', api.runTestSuite);

// Environment Management Routes
app.get('/environment', api.getEnvironmentVariables);
app.post('/environment/update', api.updateEnvironmentVariable);

/**
 * CSV File Management Routes
 * 
 * /csvFiles/:product
 * - Lists all CSV files for a specific product
 * - Files are stored in product-specific directories under output
 * - Returns empty array if no files exist
 */
app.get('/csvFiles/:product', (req, res) => {
  const { product } = req.params;
  
  if (!product) {
    return res.status(400).json({ error: 'Product name is required' });
  }
  
  const outputDir = path.join(__dirname, '../output');
  const productDir = path.join(outputDir, product.toLowerCase());
  
  try {
    // Create output directory if it doesn't exist
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
      return res.json({ success: true, product, files: [] });
    }
    
    // Create product directory if it doesn't exist
    if (!fs.existsSync(productDir)) {
      fs.mkdirSync(productDir, { recursive: true });
      return res.json({ success: true, product, files: [] });
    }
    
    // List all files in the product directory
    const productFiles = fs.readdirSync(productDir)
      .filter(file => file.endsWith('.csv'))
      .sort();
    
    console.log(`Found ${productFiles.length} files for product ${product} in ${productDir}`);
    
    return res.json({ success: true, product, files: productFiles });
  } catch (error) {
    console.error('Error listing CSV files:', error);
    return res.status(500).json({ error: 'Failed to list CSV files' });
  }
});

// File Download Route
app.get('/download/:product/:filename', api.downloadCsvFile);

// Report Download Route
app.get('/report/:filename', api.downloadReport);

// Start server and log available endpoints
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
    console.log('\nAvailable endpoints:');
    console.log('  GET  /version        - Get current PAPI version');
    console.log('  GET  /product        - Get list of products and endpoint counts');
    console.log('  GET  /productDetails - Get list of paths for each product');
    console.log('  GET  /tests          - Get list of available test files');
    console.log('  POST /runTests       - Receive test selections from client');
    console.log('  GET  /environment    - Get list of environment variables');
    console.log('  POST /environment/update - Update an environment variable');
    console.log('  GET  /csvFiles/:product - Get CSV files for a product');
    console.log('  GET  /download/:product/:filename - Download a CSV file');
    console.log('  GET  /report/:filename - Download a test report file');
    console.log('\n');
}); 