const path = require('path');

class SSLStatusTracker {
    constructor() {
        this.sslStatus = {
            US: new Map(),
            EU: new Map()
        };
        this.lastUpdate = null;
        this.threshold = parseInt(process.env.SSL_EXPIRY_THRESHOLD) || 30;
    }

    updateSSLStatus(region, results) {
        if (!this.sslStatus[region]) {
            this.sslStatus[region] = new Map();
        }

        results.forEach(result => {
            this.sslStatus[region].set(result.domain, {
                valid: result.valid,
                daysUntilExpiry: result.daysUntilExpiry,
                expiryDate: result.expiryDate,
                issuer: result.issuer,
                error: result.error,
                lastChecked: new Date().toISOString()
            });
        });

        this.lastUpdate = new Date().toISOString();
    }

    getStatus() {
        return {
            certificates: {
                US: Object.fromEntries(this.sslStatus.US),
                EU: Object.fromEntries(this.sslStatus.EU)
            },
            lastUpdate: this.lastUpdate,
            threshold: this.threshold
        };
    }
}

module.exports = new SSLStatusTracker(); 