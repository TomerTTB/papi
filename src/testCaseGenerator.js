const fs = require('fs');
const path = require('path');

/**
 * Lists all CSV files for a specific product
 * @param {string} product - Product name
 * @returns {Promise<Array<string>>} - Array of file names
 */
async function listProductCsvFiles(product) {
    try {
        // Ensure output directory exists
        const outputDir = path.join(__dirname, '../output');
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
            return [];
        }
        
        // Create product-specific directory if it doesn't exist
        const productDir = path.join(outputDir, product.toLowerCase());
        if (!fs.existsSync(productDir)) {
            fs.mkdirSync(productDir, { recursive: true });
            return [];
        }
        
        // List all files in the product directory
        const files = fs.readdirSync(productDir)
            .filter(file => file.endsWith('.csv'))
            .sort();
        
        return files;
    } catch (error) {
        console.error('Error listing CSV files:', error);
        throw error;
    }
}

module.exports = {
    listProductCsvFiles
}; 