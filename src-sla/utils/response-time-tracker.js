class ResponseTimeTracker {
    constructor() {
        this.responseTimes = {
            US: new Map(),
            EU: new Map()
        };
    }

    /**
     * Records the response time for an endpoint
     * @param {string} path - The endpoint path
     * @param {string} region - The region (US or EU)
     * @param {number} responseTime - Response time in milliseconds
     */
    recordResponseTime(path, region, responseTime) {
        if (!this.responseTimes[region]) {
            this.responseTimes[region] = new Map();
        }

        const endpointStats = this.responseTimes[region].get(path) || {
            lastResponseTime: 0,
            avgResponseTime: 0,
            minResponseTime: Infinity,
            maxResponseTime: 0,
            totalSamples: 0
        };

        // Update stats
        endpointStats.lastResponseTime = responseTime;
        endpointStats.totalSamples++;
        endpointStats.minResponseTime = Math.min(endpointStats.minResponseTime, responseTime);
        endpointStats.maxResponseTime = Math.max(endpointStats.maxResponseTime, responseTime);
        
        // Calculate new average
        endpointStats.avgResponseTime = 
            ((endpointStats.avgResponseTime * (endpointStats.totalSamples - 1)) + responseTime) / 
            endpointStats.totalSamples;

        this.responseTimes[region].set(path, endpointStats);
    }

    /**
     * Gets the response time stats for a specific endpoint
     * @param {string} path - The endpoint path
     * @param {string} region - The region
     * @returns {object|null} The response time statistics or null if not found
     */
    getResponseTimeStats(path, region) {
        return this.responseTimes[region]?.get(path) || null;
    }

    /**
     * Clears all response time data
     */
    clear() {
        this.responseTimes = {
            US: new Map(),
            EU: new Map()
        };
    }
}

module.exports = new ResponseTimeTracker(); 