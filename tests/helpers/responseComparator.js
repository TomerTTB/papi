// Define all fields to ignore with their specific paths
const IGNORED_PATHS = [

    // Specific fields in specific locations
    'first-flow-actions.actions[].id',
    'flows.lensesAndPupils[].id',
    'flows.lenses[].id',
    'flows.deviceCalibration[].id',
    'flows.prescription[].id',
    'flows.intercom[].id',
    'flows.eyes[].id',

    //Ignore GoEyes-LM
    'flows.eyesLowMyop[].id',
    // 'actions[].page.prescription_view.id',
    // 'actions[].page.bottom_section_view.id',
    // 'actions[].page.id',
    // 'actions[].id',
    // 'id',
    
    // Ignore values of fields in S3 objects
    's3_objects[*].fields.key.value',
    's3_objects[*].fields.AWSAccessKeyId.value',
    's3_objects[*].fields.x-amz-security-token.value',
    's3_objects[*].fields.policy.value',
    's3_objects[*].fields.signature.value',

    // Ignore values FFC
    '[].data.inputs_to_algo.uuid',
    '[].data.inputs_to_algo.session_id',
    '[].data.duration_from_start',

    // PHI specific fields
    'phi_sid',

    // PD - WebSDK init dynamic IDs - specific patterns
    'first-flow-actions.actions[].page.tutorial_page.playSoundsAction.id',
    'first-flow-actions.actions[].page.video_page.playSoundsAction.id',
    'first-flow-actions.actions[].page.video_page.tutorialIsDoneAction.id',
    'first-flow-actions.actions[].page.changeMenuIconColorAction.id',
    'offline_pages.*.playSoundsAction.id',
    'authorized_flows_actions.*.actions[].id',
    'authorized_flows_actions.*.actions[].page.tutorial_page.playSoundsAction.id',
    'authorized_flows_actions.*.actions[].page.video_page.playSoundsAction.id',
    'authorized_flows_actions.*.actions[].page.video_page.tutorialIsDoneAction.id',
    'authorized_flows_actions.*.actions[].page.changeMenuIconColorAction.id',
    'authorized_flows_actions.*.actions[].page.playSoundsAction.id',
    'authorized_flows_actions.*.actions[].page.tutorialIsDoneAction.id',
    'offline_pages_all_flows.*.*.playSoundsAction.id',
    'offline_pages_all_flows.*.device_orientation_denied.playSoundsAction.id',
    'offline_pages_all_flows.*.unsupported_browser_mobile_ios.playSoundsAction.id',
    'offline_pages_all_flows.*.unsupported_browser_no_camera_support.playSoundsAction.id',
    'offline_pages_all_flows.*.camera_not_allowed.playSoundsAction.id',
    'offline_pages_all_flows.*.camera_general_error.playSoundsAction.id',
    'offline_pages_all_flows.*.unsuccessful_flow.playSoundsAction.id',
    'offline_pages_all_flows.*.camera_constraints.playSoundsAction.id',

    // PD - Mobile init dynamic IDs
    'flows.pupilsDistance[].id',
    'flows.pupilsDistance[].page.tutorial_page.playSoundsAction.id',
    'flows.pupilsDistance[].page.video_page.playSoundsAction.id',
    'flows.pupilsDistance[].page.video_page.tutorialIsDoneAction.id',
    'flows.pupilsDistance[].page.changeMenuIconColorAction.id'
];

/**
 * Checks if a field at a specific path should be ignored
 * @param {string} fieldName - The name of the field to check
 * @param {string} currentPath - The current path in the object structure
 * @returns {boolean} - True if the field should be ignored
 */
function shouldIgnoreField(fieldName, currentPath) {
    // Create the full path to check
    const fullPath = currentPath ? `${currentPath}.${fieldName}` : fieldName;
    
    // Special handling for s3_objects fields - ignore their values but not their existence
    if (fullPath.match(/^s3_objects\[\d+\]\.fields\.(key|AWSAccessKeyId|x-amz-security-token|policy|signature)$/)) {
        return true;
    }
    
    return IGNORED_PATHS.some(ignoredPath => {
        // Convert the ignored path pattern to a regex
        const pattern = ignoredPath
            .replace(/\./g, '\\.')         // Escape dots
            .replace(/\[\]/g, '\\[\\d+\\]') // Replace [] with [\d+] to match any array index
            .replace(/\*/g, '[^\\.]+');     // Replace * with "match anything except dot"
        
        // Create regex that matches the exact path
        const regex = new RegExp(`^${pattern}$`);
        return regex.test(fullPath);
    });
}

/**
 * Recursively compares two objects while ignoring specified fields
 * @param {Object} actual - The actual response object
 * @param {Object} expected - The expected response object
 * @param {string} path - Current path in the object structure
 * @returns {Array} Array of differences found
 */
function compareObjects(actual, expected, path = '') {
    const differences = [];

    // If either value is null/undefined, compare directly
    if (actual === null || expected === null || actual === undefined || expected === undefined) {
        if (actual !== expected) {
            differences.push(`${path}: Expected ${expected}, got ${actual}`);
        }
        return differences;
    }

    // Handle different types
    if (typeof actual !== typeof expected) {
        differences.push(`${path}: Type mismatch - Expected ${typeof expected}, got ${typeof actual}`);
        return differences;
    }

    // For arrays, compare each element
    if (Array.isArray(actual)) {
        if (!Array.isArray(expected)) {
            differences.push(`${path}: Expected array, got ${typeof expected}`);
            return differences;
        }
        
        // Skip length comparison if it's in ignored fields
        if (!shouldIgnoreField('length', path)) {
            if (actual.length !== expected.length) {
                differences.push(`${path}: Array length mismatch - Expected ${expected.length}, got ${actual.length}`);
            }
        }

        // Compare array elements
        actual.forEach((item, index) => {
            if (index < expected.length) {
                const arrayPath = path ? `${path}[${index}]` : `[${index}]`;
                differences.push(...compareObjects(item, expected[index], arrayPath));
            }
        });
        return differences;
    }

    // For objects, compare each property
    if (typeof actual === 'object') {
        Object.keys(expected).forEach(key => {
            // Check if this specific field at this path should be ignored
            if (shouldIgnoreField(key, path)) {
                return;
            }

            const newPath = path ? `${path}.${key}` : key;
            
            if (!(key in actual)) {
                differences.push(`${newPath}: Missing in actual response`);
                return;
            }

            differences.push(...compareObjects(actual[key], expected[key], newPath));
        });

        // Check for extra fields in actual that aren't in expected
        Object.keys(actual).forEach(key => {
            if (!(key in expected) && !shouldIgnoreField(key, path)) {
                differences.push(`${path ? `${path}.${key}` : key}: Unexpected field in actual response`);
            }
        });

        return differences;
    }

    // For primitive values, compare directly
    if (actual !== expected) {
        differences.push(`${path}: Expected ${expected}, got ${actual}`);
    }

    return differences;
}

module.exports = {
    compareObjects,
    shouldIgnoreField,
    IGNORED_PATHS
}; 