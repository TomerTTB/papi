const { endpoints } = require('../config/endpoints');
const fs = require('fs').promises;
const path = require('path');
const slackNotifier = require('./slack');
const { getEndpointConfig, getBaseUrl } = require('./utils/endpoint-utils');
const statusTracker = require('./utils/status-tracker');
const responseTimeTracker = require('./utils/response-time-tracker');
const slaComplianceTracker = require('./utils/sla-compliance');
const sslChecker = require('./utils/ssl-checker');
const sslStatusTracker = require('./utils/ssl-status-tracker');
const logCleaner = require('./utils/log-cleanup');

// Configuration
const CONFIG = {
    enableSLALogging: String(process.env.ENABLE_SLA_LOGS).toLowerCase() === 'true',  // More robust string comparison
    retryDelay: 30 * 1000,  // 60 seconds in milliseconds
    maxRetries: 2,  // Will try up to 3 times total (initial + 2 retries)
    slaResponseTime: parseFloat(process.env.SLA_RESPONSE_TIME || '2.5') * 1000, // Convert seconds to milliseconds
    sslExpiryThreshold: parseInt(process.env.SSL_EXPIRY_THRESHOLD) || 30, // Days before expiration to trigger alert
    regions: {
        US: {
            baseUrlSLA: process.env.BASE_URL_SLA_US,
            baseUrlPHISLA: process.env.BASE_URL_PHI_SLA_US,
            phiApiKey: process.env.PHI_API_KEY_US,
            sslDomains: [
                'api-staging.dev.glasseson.com',
                'api.us.6over6-health.com'
            ],
            endpoints: [
                // '/a',
                // '/b',
                // '/c',
                '@/mobile/init',
                '@/go-eyes/weakEyeRelaxed',
                '@/go-eyes/save-station',
                '@/face-distance-calibration/ffc-calculation',
                'attachments',
                // 'questionnaire_stage',
                '@/websdk/init',
                '@/webcompanion/init',
                '@/go-va/bino/increase',
            ]
        },
        EU: {
            baseUrlSLA: process.env.BASE_URL_SLA_EU,
            baseUrlPHISLA: process.env.BASE_URL_PHI_SLA_EU,
            phiApiKey: process.env.PHI_API_KEY_EU,
            sslDomains: [
                'api-staging.dev.glasseson.com',
                'dev.api.6over6-health.com'
            ],
            endpoints: [
                '@/mobile/init',
                '@/go-eyes/weakEyeRelaxed',
                '@/go-eyes/save-station',
                '@/face-distance-calibration/ffc-calculation',
                'attachments',
                // 'questionnaire_stage',
                '@/websdk/init',    
                '@/webcompanion/init',
                '@/go-va/bino/increase',
            ]
        }
    }
};

// Initialize fetch using dynamic import
let fetchPromise = import('node-fetch').then(module => module.default);

// Ensure logs directory exists
async function ensureLogDirectory() {
    if (!CONFIG.enableSLALogging) return null;
    
    const baseLogDir = path.join(__dirname, 'logs');
    const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const dailyLogDir = path.join(baseLogDir, timestamp);

    try {
        // Create base logs directory if it doesn't exist
        await fs.access(baseLogDir);
    } catch {
        await fs.mkdir(baseLogDir, { recursive: true });
    }

    try {
        // Create daily directory if it doesn't exist
        await fs.access(dailyLogDir);
    } catch {
        await fs.mkdir(dailyLogDir, { recursive: true });
    }

    return dailyLogDir;
}

// Function to write to log file
async function writeToLog(logEntry, region) {
    if (!CONFIG.enableSLALogging) return;

    const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const logDir = await ensureLogDirectory();
    if (!logDir) return; // Exit if logging is disabled
    
    const logFile = path.join(logDir, `sla-${region}-${timestamp}.log`);
    const formattedEntry = `${'-'.repeat(80)}\n${new Date().toISOString()}\n${logEntry}\n`;
    
    await fs.appendFile(logFile, formattedEntry, 'utf8');
}

// Function to display startup information
function displayStartupInfo() {
    const iterationMinutes = parseInt(process.env.ITERATION) || 5;
    console.log(`SLA Monitor Configuration:`);
    console.log(`- Iteration interval: ${iterationMinutes} minutes`);
    console.log('\nUS Region:');
    console.log(`- Base URL SLA (GoEyes): ${CONFIG.regions.US.baseUrlSLA}`);
    console.log(`- Base URL PHI SLA: ${CONFIG.regions.US.baseUrlPHISLA}`);
    console.log(`- PHI API Key: ${CONFIG.regions.US.phiApiKey ? '********' : 'Not set'}`);
    console.log('\nEU Region:');
    console.log(`- Base URL SLA (GoEyes): ${CONFIG.regions.EU.baseUrlSLA}`);
    console.log(`- Base URL PHI SLA: ${CONFIG.regions.EU.baseUrlPHISLA}`);
    console.log(`- PHI API Key: ${CONFIG.regions.EU.phiApiKey ? '********' : 'Not set'}`);
    console.log(`\n- SLA Logging: ${CONFIG.enableSLALogging ? 'Enabled' : 'Disabled'}`);
    console.log('-'.repeat(50));
}

// Function to build URL with query parameters
function buildUrl(baseUrl, path, queryParams) {
    if (!queryParams || Object.keys(queryParams).length === 0) {
        return `${baseUrl}${path}`;
    }

    const queryString = Object.entries(queryParams)
        .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
        .join('&');

    return `${baseUrl}${path}?${queryString}`;
}

// Function to test a single endpoint
async function testEndpoint(path, region) {
    const fetch = await fetchPromise;
    const endpointConfig = getEndpointConfig(path);
    if (!endpointConfig) {
        const errorMsg = `Configuration not found for path: ${path}`;
        console.error(`❌ [${region}][${path}] ${errorMsg}`);
        await writeToLog(errorMsg, region);
        slaComplianceTracker.recordCheck(path, region, false, 0);  // Record failed check
        return { success: false, error: errorMsg };
    }

    // Use region-specific base URLs
    const baseUrl = endpointConfig.product === 'PHI' ? 
        CONFIG.regions[region].baseUrlPHISLA : 
        CONFIG.regions[region].baseUrlSLA;

    const url = buildUrl(baseUrl, path, endpointConfig.config.queryParams);
    
    // Clone headers to avoid modifying the original
    let headers = { ...endpointConfig.config.requiredHeaders };

    // For PHI endpoints, replace the X-Api-Key with region-specific key
    if (endpointConfig.product === 'PHI') {
        headers['X-Api-Key'] = region === 'US' ? process.env.PHI_API_KEY_US : process.env.PHI_API_KEY_EU;
    }

    try {
        const startTime = performance.now();
        const response = await fetch(url, {
            method: endpointConfig.method,
            headers: headers,
            body: endpointConfig.config.requestBody ? 
                JSON.stringify(endpointConfig.config.requestBody) : 
                undefined
        });
        const endTime = performance.now();
        const responseTime = endTime - startTime;

        // Record the response time
        responseTimeTracker.recordResponseTime(path, region, responseTime);

        const responseBody = await response.text();
        let parsedResponse;
        try {
            parsedResponse = JSON.parse(responseBody);
        } catch {
            parsedResponse = responseBody;
        }

        const success = response.status === 200;
        const timestamp = new Date().toISOString();

        // Check if response time is within SLA when status is 200
        const isWithinSLA = responseTime <= CONFIG.slaResponseTime;
        const finalSuccess = success && isWithinSLA;

        // Record compliance without modifying existing behavior
        slaComplianceTracker.recordCheck(path, region, finalSuccess, responseTime);

        // Log the result with response time and SLA status
        if (success) {
            if (isWithinSLA) {
                console.log(`✅ [${region}][${timestamp}] ${endpointConfig.product}/${path} - Success (${response.status}) - ${responseTime.toFixed(2)}ms`);
            } else {
                console.error(`⚠️ [${region}][${timestamp}] ${endpointConfig.product}/${path} - Success (${response.status}) but exceeded SLA - ${responseTime.toFixed(2)}ms > ${CONFIG.slaResponseTime}ms`);
            }
        } else {
            console.error(`❌ [${region}][${timestamp}] ${endpointConfig.product}/${path} - Failed (${response.status}): ${responseBody} - ${responseTime.toFixed(2)}ms`);
        }

        // Write to log
        const logEntry = JSON.stringify({
            timestamp: new Date().toISOString(),
            endpoint: path,
            product: endpointConfig.product,
            status: response.status,
            success: finalSuccess,
            responseTime: responseTime,
            isWithinSLA: isWithinSLA
        }, null, 2);
        await writeToLog(logEntry, region);

        return { 
            success: finalSuccess,
            httpSuccess: success,
            error: success ? (isWithinSLA ? undefined : `Response time ${responseTime.toFixed(2)}ms exceeded SLA ${CONFIG.slaResponseTime}ms`) : parsedResponse || responseBody,
            responseTime,
            isWithinSLA
        };

    } catch (error) {
        const errorMsg = error.message;
        console.error(`❌ [${region}][${new Date().toISOString()}] ${endpointConfig.product}/${path} - Error: ${errorMsg}`);
        
        const errorLog = JSON.stringify({
            timestamp: new Date().toISOString(),
            endpoint: path,
            product: endpointConfig.product,
            status: 'error',
            error: errorMsg
        }, null, 2);
        await writeToLog(errorLog, region);
        
        return { 
            success: false,
            httpSuccess: false,
            error: errorMsg
        };
    }
}

// Function to wait
async function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Function to test a single endpoint with retries
async function testEndpointWithRetries(path, region) {
    let attempts = 0;
    let lastResult = null;
    let isResponseTimeRetry = false;
    let previousFailureType = null;
    const maxAttempts = CONFIG.maxRetries + 1; // 3 attempts total
    
    while (attempts < maxAttempts) {
        if (attempts > 0) {
            console.log(`${isResponseTimeRetry ? 'Response time' : 'Status code'} retry attempt ${attempts}/${CONFIG.maxRetries} for ${region}/${path} after ${CONFIG.retryDelay/1000} seconds...`);
            await wait(CONFIG.retryDelay);
        }
        
        const result = await testEndpoint(path, region);
        lastResult = result;

        // Determine current failure type
        const currentFailureType = !result.httpSuccess ? 'status_code' : 
                                 (result.responseTime > CONFIG.slaResponseTime ? 'response_time' : null);

        // Track both types of failures
        const hasStatusCodeFailure = !result.httpSuccess;
        const hasResponseTimeFailure = result.responseTime > CONFIG.slaResponseTime;

        // Handle transition from status code to response time failure
        if (previousFailureType === 'status_code' && currentFailureType === 'response_time') {
            console.log(`Transitioning from status code to response time failure for ${region}/${path}, resetting retry counter`);
            attempts = 0;
            isResponseTimeRetry = true;
            previousFailureType = currentFailureType;
            continue;
        }

        // If HTTP status is not 200, continue with normal retry logic
        if (!result.httpSuccess) {
            attempts++;
            previousFailureType = 'status_code';
            statusTracker.updateEndpointStatus(path, { 
                success: false, 
                attempts, 
                region,
                error: result.error,
                responseTime: result.responseTime,
                httpSuccess: result.httpSuccess,
                isResponseTimeFailure: hasResponseTimeFailure,
                hasStatusCodeFailure: true,
                failureTypes: {
                    statusCode: hasStatusCodeFailure,
                    responseTime: hasResponseTimeFailure
                }
            });
            
            if (attempts < maxAttempts) {
                console.log(`❌ ${region}/${path} failed with non-200 status, will retry...`);
                continue;
            }
            break;
        }

        // If we get here, HTTP status is 200
        if (result.isWithinSLA) {
            // Success case - both HTTP 200 and within SLA
            statusTracker.updateEndpointStatus(path, { 
                success: true, 
                attempts: attempts + 1, 
                region,
                responseTime: result.responseTime,
                hasStatusCodeFailure: false,
                hasResponseTimeFailure: false,
                failureTypes: {
                    statusCode: false,
                    responseTime: false
                }
            });
            return { success: true, attempts: attempts + 1 };
        }

        // If we're here, status is 200 but response time exceeded SLA
        attempts++;
        previousFailureType = 'response_time';
        isResponseTimeRetry = true;
        
        const failureDetails = {
            success: false,
            attempts,
            region,
            error: null,
            responseTime: result.responseTime,
            httpSuccess: true,
            isResponseTimeFailure: true,
            hasStatusCodeFailure: false,
            hasResponseTimeFailure: true,
            failureTypes: {
                statusCode: false,
                responseTime: true
            }
        };

        statusTracker.updateEndpointStatus(path, failureDetails);
        
        if (attempts < maxAttempts) {
            console.log(`⚠️ ${region}/${path} exceeded SLA response time, will retry...`);
            continue;
        }
        break;
    }
    
    console.log(`❌ ${region}/${path} failed after ${attempts} attempts`);
    return { 
        success: false, 
        attempts,
        error: lastResult.httpSuccess ? null : lastResult.error,
        responseTime: lastResult.responseTime,
        httpSuccess: lastResult.httpSuccess,
        isResponseTimeFailure: lastResult.isResponseTimeFailure,
        hasStatusCodeFailure: !lastResult.httpSuccess,
        hasResponseTimeFailure: lastResult.responseTime > CONFIG.slaResponseTime,
        failureTypes: {
            statusCode: !lastResult.httpSuccess,
            responseTime: lastResult.responseTime > CONFIG.slaResponseTime
        }
    };
}

// Function to run SLA tests for a specific region
async function runRegionalSLATests(region) {
    statusTracker.startNewRun(region);
    const results = [];
    
    // Run tests sequentially for the region
    for (const path of CONFIG.regions[region].endpoints) {
        const result = await testEndpointWithRetries(path, region);
        results.push({ path, region, ...result });
        
        // Record compliance after each test
        slaComplianceTracker.recordCheck(
            path, 
            region, 
            result.success, 
            result.responseTime || 0
        );

        // Get compliance data from the tracker
        const complianceReport = slaComplianceTracker.generateRegionalReport(region);
        const endpointCompliance = complianceReport.endpoints.find(e => e.endpoint === path);
        
        // Update status with compliance data
        statusTracker.updateEndpointStatus(path, { 
            success: result.success, 
            attempts: result.attempts, 
            region,
            responseTime: result.responseTime,
            compliance: endpointCompliance ? endpointCompliance.compliance : 100
        });
    }

    // Prepare and log summary
    const summary = {
        timestamp: new Date().toISOString(),
        region,
        totalEndpoints: results.length,
        successful: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length,
        details: results.map(r => ({
            path: r.path,
            region: r.region,
            success: r.success,
            attempts: r.attempts,
            error: r.error,
            responseTime: r.responseTime,
            httpSuccess: r.httpSuccess,
            isResponseTimeFailure: r.isResponseTimeFailure,
            hasStatusCodeFailure: r.hasStatusCodeFailure,
            hasResponseTimeFailure: r.hasResponseTimeFailure,
            failureTypes: r.failureTypes
        }))
    };

    statusTracker.endCurrentRun(region);

    console.log('\n' + '-'.repeat(50));
    console.log(`${region} SLA Test Summary:`);
    console.log(`Total Endpoints: ${summary.totalEndpoints}`);
    console.log(`Successful: ${summary.successful}`);
    console.log(`Failed: ${summary.failed}`);
    console.log('-'.repeat(50));
    
    if (CONFIG.enableSLALogging) {
        await writeToLog(`${region} Test Run Summary:\n` + JSON.stringify(summary, null, 2), region);
        // Generate compliance report after all tests are done
        const logDir = await ensureLogDirectory();
        if (logDir) {
            await slaComplianceTracker.saveReport(logDir);
        }
    }

    // Send Slack notification if there are critical failures
    await slackNotifier.sendNotification(summary);

    return summary.failed === 0;
}

// Function to start periodic testing
async function startSLAMonitoring() {
    const iterationMinutes = parseInt(process.env.ITERATION) || 5;
    const intervalMs = iterationMinutes * 60 * 1000;

    console.log(`Starting SLA monitoring with ${iterationMinutes} minute intervals`);
    console.log('Beginning first test run...\n');
    
    while (true) {
        try {
            // Run log cleanup before starting the monitoring cycle
            await logCleaner.cleanupOldLogs();

            // Run each region's tests sequentially
            for (const region of ['US', 'EU']) {
                console.log('\n' + '='.repeat(50));
                console.log(`Starting ${region} Region Tests - ${new Date().toISOString()}`);
                console.log('='.repeat(50) + '\n');

                // 1. Run SSL checks for the region
                console.log(`Running SSL certificate checks for ${region} region...`);
                const sslResults = await sslChecker.checkRegionalCertificates(region, CONFIG);
                
                // Update SSL status tracker
                sslStatusTracker.updateSSLStatus(region, sslResults);
                
                if (CONFIG.enableSLALogging) {
                    const logDir = await ensureLogDirectory();
                    if (logDir) {
                        await sslChecker.writeToLog(sslResults, region, logDir);
                    }
                }

                console.log(`\nSSL checks completed for ${region} region.`);
                console.log('-'.repeat(50));

                // 2. Run SLA checks for the region
                console.log(`\nStarting SLA checks for ${region} region...`);
                await runRegionalSLATests(region);
            }

            // Wait for the iteration time
            console.log(`\nAll regions completed. Waiting ${iterationMinutes} minutes until next test run...`);
            await new Promise(resolve => setTimeout(resolve, intervalMs));
        } catch (error) {
            console.error('Error in monitoring cycle:', error);
            // Wait a bit before retrying the whole cycle
            await new Promise(resolve => setTimeout(resolve, 60000));
        }
    }
}

module.exports = {
    startSLAMonitoring,
    runRegionalSLATests,
    CONFIG,
    displayStartupInfo
}; 