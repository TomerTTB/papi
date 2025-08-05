const fs = require('fs').promises;
const path = require('path');

class SLAComplianceTracker {
    constructor() {
        this.dailyStats = {
            US: new Map(),
            EU: new Map()
        };
    }

    /**
     * Record a check result for an endpoint
     * @param {string} endpoint - The endpoint path
     * @param {string} region - The region (US/EU)
     * @param {boolean} isSuccessful - Whether the check met SLA requirements
     * @param {number} responseTime - Response time in milliseconds
     */
    recordCheck(endpoint, region, isSuccessful, responseTime) {
        const today = new Date().toISOString().split('T')[0];
        
        // Initialize daily stats if not exists
        if (!this.dailyStats[region].has(today)) {
            this.dailyStats[region].set(today, new Map());
        }
        
        // Initialize endpoint stats if not exists
        if (!this.dailyStats[region].get(today).has(endpoint)) {
            this.dailyStats[region].get(today).set(endpoint, {
                totalChecks: 0,
                successfulChecks: 0,
                totalResponseTime: 0,
                minResponseTime: Infinity,
                maxResponseTime: 0
            });
        }

        const stats = this.dailyStats[region].get(today).get(endpoint);
        stats.totalChecks++;
        if (isSuccessful) {
            stats.successfulChecks++;
        }
        stats.totalResponseTime += responseTime;
        stats.minResponseTime = Math.min(stats.minResponseTime, responseTime);
        stats.maxResponseTime = Math.max(stats.maxResponseTime, responseTime);
    }

    /**
     * Generate a compliance report for a specific region
     * @param {string} region - The region (US/EU)
     * @returns {Object} Compliance report for the region
     */
    generateRegionalReport(region) {
        const today = new Date().toISOString().split('T')[0];
        const stats = this.dailyStats[region].get(today);
        
        if (!stats) {
            return {
                timestamp: new Date().toISOString(),
                region,
                overallCompliance: 100,
                endpoints: []
            };
        }

        let totalChecks = 0;
        let totalSuccessful = 0;
        const endpoints = [];

        for (const [endpoint, data] of stats.entries()) {
            totalChecks += data.totalChecks;
            totalSuccessful += data.successfulChecks;
            
            endpoints.push({
                endpoint,
                compliance: (data.successfulChecks / data.totalChecks) * 100,
                totalChecks: data.totalChecks,
                successfulChecks: data.successfulChecks,
                averageResponseTime: data.totalResponseTime / data.totalChecks,
                minResponseTime: data.minResponseTime,
                maxResponseTime: data.maxResponseTime
            });
        }

        return {
            timestamp: new Date().toISOString(),
            region,
            overallCompliance: totalChecks > 0 ? (totalSuccessful / totalChecks) * 100 : 100,
            endpoints
        };
    }

    /**
     * Save compliance report to the logs directory
     * @param {string} logsDir - Path to the logs directory
     */
    async saveReport(logsDir) {
        const today = new Date().toISOString().split('T')[0];
        
        for (const region of ['US', 'EU']) {
            const report = this.generateRegionalReport(region);
            const reportPath = path.join(logsDir, `sla-compliance-${region}-${today}.json`);
            
            try {
                await fs.writeFile(
                    reportPath, 
                    JSON.stringify(report, null, 2)
                );
            } catch (error) {
                console.error(`Error saving compliance report for ${region}:`, error);
            }
        }
    }
}

module.exports = new SLAComplianceTracker(); 