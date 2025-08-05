const Ajv = require('ajv');
const path = require('path');

// Helper function to generate schema using AJV
function generateSchemaUsingAjv(obj) {
    if (obj === null || obj === undefined) {
        return { type: 'null' };
    }

    if (Array.isArray(obj)) {
        // Handle array case
        const schema = {
            type: 'array'
        };
        if (obj.length > 0) {
            schema.items = generateSchemaUsingAjv(obj[0]); // Assume all items in array follow the same structure
        }
        return schema;
    }

    if (typeof obj === 'object') {
        // Handle object case
        const schema = {
            type: 'object',
            properties: {},
            required: [],
            additionalProperties: false
        };

        for (const [key, value] of Object.entries(obj)) {
            if (value !== null && value !== undefined) {
                // Handle multiple possible types
                if (typeof value === 'object' && !Array.isArray(value)) {
                    schema.properties[key] = generateSchemaUsingAjv(value);
                } else {
                    schema.properties[key] = {
                        type: Array.isArray(value) ? 'array' : typeof value
                    };
                    
                    // If it's an array, add items schema
                    if (Array.isArray(value) && value.length > 0) {
                        schema.properties[key].items = generateSchemaUsingAjv(value[0]);
                    }
                }
                schema.required.push(key);
            }
        }
        return schema;
    }

    // Handle primitive types
    return {
        type: typeof obj
    };
}

// Function to generate schema from object
function generateSchemaFromObject(obj) {
    if (obj === null || obj === undefined) {
        return { type: 'null' };
    }

    if (Array.isArray(obj)) {
        const schema = { type: 'array' };
        if (obj.length > 0) {
            schema.items = generateSchemaFromObject(obj[0]);
        }
        return schema;
    }

    if (typeof obj === 'object') {
        const schema = {
            type: 'object',
            properties: {},
            required: []
        };

        for (const [key, value] of Object.entries(obj)) {
            if (value !== null && value !== undefined) {
                schema.properties[key] = generateSchemaFromObject(value);
                schema.required.push(key);
            }
        }
        return schema;
    }

    return {
        type: typeof obj
    };
}

module.exports = {
    generateSchemaUsingAjv,
    generateSchemaFromObject
};
