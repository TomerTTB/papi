const { endpoints } = require('../../config/endpoints');

// Function to get endpoint configuration
function getEndpointConfig(path) {
    return endpoints.find(e => e.path === path);
}

// Function to get base URL for a product
function getBaseUrl(product, path) {
    // Log the endpoint details for debugging
    console.log(`Getting base URL for product: ${product}, path: ${path}`);
    
    if (!product) {
        console.warn('No product specified, defaulting to BASE_URL_SLA');
        return process.env.BASE_URL_SLA;
    }

    // Convert to uppercase for case-insensitive comparison
    const upperProduct = product.toUpperCase();
    
    // Use PHI base URL for PHI product
    if (upperProduct === 'PHI') {
        return process.env.BASE_URL_PHI_SLA;
    }

    // For all other products (GoEyes, Attachments), use the default base URL
    return process.env.BASE_URL_SLA;
}

module.exports = {
    getEndpointConfig,
    getBaseUrl
}; 