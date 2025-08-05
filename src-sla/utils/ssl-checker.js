const https = require('https');
const { URL } = require('url');
const fs = require('fs').promises;
const path = require('path');

class SSLChecker {
    constructor() {
        this.alertedDomains = new Set();
        this.maxRetries = 3;
        this.retryDelay = 30000; // 30 seconds between retries
    }

    async wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async checkCertificate(domain) {
        let retryCount = 0;
        let lastError = null;

        while (retryCount <= this.maxRetries) {
            try {
                const options = {
                    host: domain,
                    port: 443,
                    method: 'HEAD',
                    rejectUnauthorized: true,
                    timeout: 10000 // 10 second timeout
                };

                const result = await new Promise((resolve, reject) => {
                    const req = https.request(options, (res) => {
                        try {
                            const cert = res.socket.getPeerCertificate();
                            if (!cert || !cert.valid_to) {
                                reject(new Error('Invalid certificate data received'));
                                return;
                            }

                            const validTo = new Date(cert.valid_to);
                            const daysUntilExpiry = Math.floor((validTo - new Date()) / (1000 * 60 * 60 * 24));
                            
                            resolve({
                                valid: true,
                                daysUntilExpiry,
                                expiryDate: validTo,
                                issuer: cert.issuer,
                                domain: domain
                            });
                        } catch (error) {
                            reject(error);
                        }
                    });

                    req.on('error', reject);
                    req.on('timeout', () => reject(new Error('Request timed out')));
                    req.end();
                });

                return result;

            } catch (error) {
                lastError = error;
                if (retryCount < this.maxRetries) {
                    console.log(`Retrying SSL check for ${domain} (attempt ${retryCount + 1}/${this.maxRetries})...`);
                    await this.wait(this.retryDelay);
                    retryCount++;
                } else {
                    break;
                }
            }
        }

        return {
            valid: false,
            error: lastError?.message || 'Unknown error',
            domain: domain
        };
    }

    async checkRegionalCertificates(region, config) {
        const results = [];
        const domains = config.regions[region].sslDomains || [];
        const alertsToSend = [];
        const timestamp = new Date().toISOString();

        console.log(`\n[${timestamp}] Checking SSL certificates for ${region} region...`);
        console.log(`[${timestamp}] SSL expiry threshold set to ${config.sslExpiryThreshold} days`);
        console.log('-'.repeat(50));

        for (const domain of domains) {
            try {
                console.log(`[${timestamp}] Checking certificate for ${domain}...`);
                const result = await this.checkCertificate(domain);
                results.push(result);

                if (result.valid) {
                    console.log(`[${timestamp}] ✓ ${result.domain}: Valid (Expires in ${result.daysUntilExpiry} days)`);
                    
                    if (result.daysUntilExpiry <= config.sslExpiryThreshold) {
                        // Certificate expiry is within or equal to threshold - needs attention
                        if (!this.alertedDomains.has(result.domain)) {
                            // Haven't alerted about this domain yet
                            console.log(`[${timestamp}] ⚠️ Certificate expiry (${result.daysUntilExpiry} days) is within/equal to threshold (${config.sslExpiryThreshold} days)`);
                            alertsToSend.push(result);
                        } else {
                            // Already alerted about this domain
                            console.log(`[${timestamp}] ⏭️ Certificate within threshold but alert already sent for ${result.domain}`);
                        }
                    } else {
                        // Certificate expiry is above threshold - all good
                        console.log(`[${timestamp}] ✅ Certificate expiry (${result.daysUntilExpiry} days) is above threshold (${config.sslExpiryThreshold} days)`);
                        
                        // If we previously alerted about this domain, we can reset the flag
                        if (this.alertedDomains.has(result.domain)) {
                            console.log(`[${timestamp}] 🔄 Resetting alert flag for ${result.domain} (expiry now above threshold)`);
                            this.alertedDomains.delete(result.domain);
                        }
                    }
                } else {
                    console.error(`[${timestamp}] ✗ ${result.domain}: Invalid - ${result.error}`);
                }

            } catch (error) {
                console.error(`[${timestamp}] Error checking SSL for ${domain}:`, error.message);
                results.push({
                    valid: false,
                    error: error.message,
                    domain: domain
                });
            }

            // Add a small delay between checks
            await this.wait(1000);
        }

        // Send alerts and set flags only if we have domains that need notification
        if (alertsToSend.length > 0) {
            console.log(`\n[${timestamp}] Sending SSL alerts for ${region} region (${alertsToSend.length} domains)...`);
            await this.sendSSLAlerts(alertsToSend, region);
            
            // After successful notification, set the alert flags
            for (const cert of alertsToSend) {
                console.log(`[${timestamp}] 🚩 Setting alert flag for ${cert.domain} (notification sent)`);
                this.alertedDomains.add(cert.domain);
            }
        }

        console.log('-'.repeat(50));
        return results;
    }

    async sendSSLAlerts(certInfos, region) {
        const slackNotifier = require('../slack');
        const alertPayload = {
            timestamp: new Date().toISOString(),
            region,
            details: certInfos.map(certInfo => ({
                path: certInfo.domain,
                region: region,
                success: true,
                attempts: 1,
                error: `SSL Certificate will expire in ${certInfo.daysUntilExpiry} days (on ${new Date(certInfo.expiryDate).toLocaleDateString()})`,
                ssl: {
                    domain: certInfo.domain,
                    daysUntilExpiry: certInfo.daysUntilExpiry,
                    expiryDate: certInfo.expiryDate,
                    issuer: certInfo.issuer
                }
            }))
        };

        await slackNotifier.sendNotification(alertPayload);
    }

    async writeToLog(results, region, logDir) {
        const timestamp = new Date().toISOString().split('T')[0];
        const logFile = path.join(logDir, `sla-${region}-${timestamp}.log`);
        
        const logEntry = {
            timestamp: new Date().toISOString(),
            type: 'SSL_CHECK',
            results
        };

        await fs.appendFile(logFile, JSON.stringify(logEntry, null, 2) + '\n', 'utf8');
    }
}

module.exports = new SSLChecker(); 