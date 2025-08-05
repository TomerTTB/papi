const { chromium } = require('@playwright/test');
const { spawn } = require('child_process');
const path = require('path');
const crypto = require('crypto');
const fs = require('fs');

class TestController {
    constructor() {
        this.testResults = new Map();
        this.autoOpenReport = false; // Configuration flag for auto-opening reports
    }

    generateSessionId() {
        return crypto.randomUUID();
    }

    // Method to set auto-open behavior
    setAutoOpenReport(enabled) {
        this.autoOpenReport = enabled;
    }

    async runTests(selection) {
        const { endpoints, tests } = selection;
        
        // Generate a new session ID
        const sessionId = this.generateSessionId();
        
        // Create environment variables for the tests
        const env = {
            ...process.env,
            TEST_ENDPOINTS: JSON.stringify(endpoints),
            GLASSESON_SESSION_ID: sessionId,
            FORCE_COLOR: '1'
        };

        const results = [];
        
        // Determine the correct npx command for the platform
        const npxCommand = process.platform === 'win32' ? 'npx.cmd' : 'npx';
        
        try {
            // Convert test file paths to use forward slashes
            const testPaths = tests.map(testFile => 
                path.join('tests', testFile).replace(/\\/g, '/')
            );
            
            console.log('Running test files:', testPaths);
            
            const result = await new Promise((resolve, reject) => {
                // Run all tests with HTML reporter enabled but prevent auto serving
                const testProcess = spawn(npxCommand, [
                    'playwright',
                    'test',
                    ...testPaths,
                    '--config=playwright.config.js'
                ], {
                    env,
                    stdio: ['ignore', 'pipe', 'pipe'],
                    shell: true,
                    cwd: process.cwd(),
                    windowsHide: true
                });

                let output = '';
                let error = '';

                testProcess.stdout.on('data', (data) => {
                    const chunk = data.toString();
                    //console.log('Test output:', chunk);
                    output += chunk;
                });

                testProcess.stderr.on('data', (data) => {
                    const chunk = data.toString();
                    console.error('Test error:', chunk);
                    error += chunk;
                });

                testProcess.on('close', (code) => {
                    console.log(`Test process exited with code ${code}`);
                    resolve({
                        success: code === 0,
                        output: output,
                        error: error
                    });
                });

                testProcess.on('error', (err) => {
                    console.error('Test process error:', err);
                    reject(err);
                });
            });

            // Create individual results for each test file
            results.push(...tests.map(testFile => ({
                testFile,
                success: result.success,
                output: result.output,
                error: result.error
            })));

        } catch (error) {
            console.error('Error running tests:', error);
            results.push(...tests.map(testFile => ({
                testFile,
                success: false,
                output: '',
                error: error.message
            })));
        }

        // After all tests are done, handle the report based on configuration
        const timestamp = new Date().toISOString().split(':').slice(0, 2).join('-').replace('T', '-');
        const originalReportPath = path.join(process.cwd(), 'playwright-report', 'index.html');
        const newReportPath = path.join(process.cwd(), 'playwright-report', `report-${timestamp}.html`);
        
        // Rename the file if it exists
        try {
            if (fs.existsSync(originalReportPath)) {
                fs.renameSync(originalReportPath, newReportPath);
            }
        } catch (error) {
            console.error('Error renaming report file:', error);
        }

        const reportUrl = `file://${newReportPath}`;

        // Only attempt to open the report if autoOpenReport is true
        if (this.autoOpenReport) {
            try {
                if (process.platform === 'win32') {
                    // On Windows, open file directly
                    await new Promise((resolve, reject) => {
                        const showReportProcess = spawn('cmd.exe', ['/c', 'start', newReportPath], {
                            stdio: 'inherit',
                            shell: true,
                            cwd: process.cwd()
                        });

                        showReportProcess.on('error', (error) => {
                            console.error('Failed to open report:', error);
                            reject(error);
                        });

                        showReportProcess.on('close', (code) => {
                            if (code === 0) {
                                resolve();
                            } else {
                                reject(new Error(`Process exited with code ${code}`));
                            }
                        });
                    });
                } else {
                    // For non-Windows platforms
                    await new Promise((resolve, reject) => {
                        const showReportProcess = spawn(npxCommand, ['playwright', 'show-report', newReportPath], {
                            stdio: 'inherit',
                            shell: true,
                            cwd: process.cwd()
                        });

                        showReportProcess.on('error', (error) => {
                            console.error('Failed to open report:', error);
                            reject(error);
                        });

                        showReportProcess.on('close', (code) => {
                            if (code === 0) {
                                resolve();
                            } else {
                                reject(new Error(`Process exited with code ${code}`));
                            }
                        });
                    });
                }
            } catch (error) {
                console.error('Failed to open test report:', error);
            }
        }

        return {
            timestamp: new Date().toISOString(),
            results: results,
            summary: {
                total: results.length,
                passed: results.filter(r => r.success).length,
                failed: results.filter(r => !r.success).length
            },
            status: 'completed',
            reportUrl: reportUrl
        };
    }
}

module.exports = new TestController(); 