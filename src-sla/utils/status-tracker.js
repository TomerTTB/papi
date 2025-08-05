class StatusTracker {
    constructor() {
        this.endpointStatuses = {
            US: new Map(),
            EU: new Map()
        };
        this.lastUpdate = null;
        this.currentRun = {
            inProgress: false,
            startTime: null,
            endTime: null,
            region: null
        };
        // Add cleanup interval
        this.MAX_ERROR_LENGTH = 1000; // Maximum length for error messages
        this.CLEANUP_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
        
        // Start periodic cleanup
        setInterval(() => this.cleanup(), this.CLEANUP_INTERVAL);
    }

    updateEndpointStatus(path, status) {
        const region = status.region || 'US'; // Default to US if no region specified
        if (!this.endpointStatuses[region]) {
            this.endpointStatuses[region] = new Map();
        }

        // Get current status to preserve compliance if it exists
        const currentStatus = this.endpointStatuses[region].get(path) || {};
        
        // Create the status object with memory management
        const updatedStatus = {
            status: {
                success: status.success,
                attempts: status.attempts || 1,
                error: status.error ? this.truncateError(status.error) : null,
                responseTime: status.responseTime || currentStatus.status?.responseTime
            },
            lastChecked: new Date().toISOString(),
            compliance: status.compliance !== undefined ? status.compliance : currentStatus.compliance
        };
        
        this.endpointStatuses[region].set(path, updatedStatus);
        this.lastUpdate = new Date().toISOString();
    }

    // Add method to update compliance for an endpoint
    updateEndpointCompliance(path, region, compliance) {
        if (!this.endpointStatuses[region]) {
            this.endpointStatuses[region] = new Map();
        }

        const currentStatus = this.endpointStatuses[region].get(path) || {};
        currentStatus.compliance = compliance;
        this.endpointStatuses[region].set(path, currentStatus);
    }

    // Add method to truncate error messages
    truncateError(error) {
        if (typeof error === 'string') {
            return error.slice(0, this.MAX_ERROR_LENGTH);
        }
        if (typeof error === 'object') {
            const errorStr = JSON.stringify(error);
            return errorStr.slice(0, this.MAX_ERROR_LENGTH);
        }
        return String(error).slice(0, this.MAX_ERROR_LENGTH);
    }

    // Add cleanup method
    cleanup() {
        try {
            // Clear any null or undefined entries
            ['US', 'EU'].forEach(region => {
                for (const [path, status] of this.endpointStatuses[region].entries()) {
                    if (!status || !status.lastChecked) {
                        this.endpointStatuses[region].delete(path);
                        continue;
                    }

                    // Clear very old error messages (older than 7 days)
                    const lastChecked = new Date(status.lastChecked);
                    const now = new Date();
                    if (now - lastChecked > 7 * 24 * 60 * 60 * 1000) { // 7 days
                        status.status.error = null;
                    }
                }
            });

            // Force garbage collection of any unused memory
            if (global.gc) {
                global.gc();
            }
        } catch (error) {
            console.error('Error during status cleanup:', error);
        }
    }

    startNewRun(region) {
        this.currentRun = {
            inProgress: true,
            startTime: new Date().toISOString(),
            endTime: null,
            region
        };
    }

    endCurrentRun(region) {
        if (this.currentRun.region === region) {
            this.currentRun.inProgress = false;
            this.currentRun.endTime = new Date().toISOString();
        }
    }

    getStatus() {
        return {
            endpoints: {
                US: Object.fromEntries(this.endpointStatuses.US),
                EU: Object.fromEntries(this.endpointStatuses.EU)
            },
            lastUpdate: this.lastUpdate,
            currentRun: this.currentRun
        };
    }

    clear() {
        this.endpointStatuses = {
            US: new Map(),
            EU: new Map()
        };
        this.lastUpdate = null;
        this.currentRun = {
            inProgress: false,
            startTime: null,
            endTime: null,
            region: null
        };
    }
}

module.exports = new StatusTracker(); 