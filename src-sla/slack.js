const fs = require('fs').promises;
const path = require('path');
const { getEndpointConfig } = require('./utils/endpoint-utils');

// Initialize fetch using dynamic import
let fetchPromise = import('node-fetch').then(module => module.default);

class SlackNotifier {
    constructor() {
        this.webhookUrl = process.env.SLACK_WEBHOOK_URL;
        this.slaResponseTime = parseFloat(process.env.SLA_RESPONSE_TIME || '2.5') * 1000; // Convert seconds to milliseconds
        this.subteamId = process.env.SLACK_SUBTEAM_ID || ''; // New configurable subteam ID
        
        // Log webhook URL status on initialization
        if (this.webhookUrl) {
            console.log('Slack notifications are enabled');
        } else {
            console.warn('WARNING: Slack webhook URL is not configured. Notifications will be disabled.');
        }
    }

    // Helper method to get mention text
    getMentionText() {
        return this.subteamId ? `<!subteam^${this.subteamId}|sla-monitor-group> ` : '';
    }

    async sendNotification(summary) {
        console.log('\nProcessing Slack notification...');
        
        // Check if this is an SSL alert
        const isSSLAlert = summary.details.some(detail => detail.ssl);
        
        if (isSSLAlert) {
            await this.sendSSLNotification(summary);
            return;
        }

        // Handle SLA failures
        const criticalFailures = summary.details.filter(detail => 
            (!detail.success && detail.attempts >= 1) || // Standard failures after 1 attempt
            (detail.httpSuccess && detail.responseTime > this.slaResponseTime && detail.attempts >= 1) // SLA failures after 1 attempt
        );

        console.log(`Found ${criticalFailures.length} critical failures`);

        if (criticalFailures.length === 0) {
            console.log('No critical failures to report');
            return;
        }

        // Send to Slack if webhook is configured
        if (this.webhookUrl) {
            try {
                console.log('Preparing to send SLA failure notification...');
                const fetch = await fetchPromise;
                const environment = process.env.BASE_URL_SLA_US.includes('staging') ? 'Staging' : 'Production';
                
                const slackPayload = {
                    text: `:rotating_light: ${this.getMentionText()}SLA Monitor - Critical Failures Detected\nEnvironment: ${environment}`,
                    blocks: [
                        {
                            type: "header",
                            text: {
                                type: "plain_text",
                                text: ":rotating_light: SLA Monitor - Critical Failures Detected",
                                emoji: true
                            }
                        },
                        {
                            type: "section",
                            text: {
                                type: "mrkdwn",
                                text: `${this.getMentionText()}Environment: ${environment}`
                            }
                        },
                        {
                            type: "divider"
                        }
                    ]
                };

                // Add each failure as a section
                criticalFailures.forEach(failure => {
                    const endpointConfig = getEndpointConfig(failure.path);
                    let failureText = '';
                    
                    if (!endpointConfig) {
                        failureText = [
                            `*Failed Endpoint Details:*`,
                            `*Region:* ${failure.region}`,
                            `*Path:* ${failure.path}`,
                            `*Error:* Endpoint configuration not found`,
                            failure.responseTime ? `*Response Time:* ${failure.responseTime.toFixed(2)}ms (SLA: ${this.slaResponseTime}ms)` : ''
                        ].filter(Boolean).join('\n');
                    } else {
                        const baseUrl = endpointConfig.product === 'PHI' ? 
                            (failure.region === 'US' ? process.env.BASE_URL_PHI_SLA_US : process.env.BASE_URL_PHI_SLA_EU) :
                            (failure.region === 'US' ? process.env.BASE_URL_SLA_US : process.env.BASE_URL_SLA_EU);

                        // Determine failure types and messages
                        let failureType = '';
                        let errorMessage = '';

                        // Prioritize Status Code failures over Response Time failures
                        if (failure.hasStatusCodeFailure) {
                            failureType = 'Status Code';
                            if (failure.error) {
                                errorMessage = typeof failure.error === 'object' ? 
                                    JSON.stringify(failure.error, null, 2) : 
                                    failure.error;
                            }
                        } else if (failure.hasResponseTimeFailure) {
                            failureType = 'Response Time';
                            errorMessage = `Response time ${failure.responseTime.toFixed(2)}ms exceeded SLA ${this.slaResponseTime}ms`;
                        }

                        failureText = [
                            `*Failed Endpoint Details:*`,
                            `*Region:* ${failure.region}`,
                            `*Product:* ${endpointConfig.product}`,
                            `*Full URL:* ${baseUrl}${failure.path}`,
                            `*Failure Type:* ${failureType}`,
                            `*Error:* Failed after ${failure.attempts} attempts`,
                            errorMessage ? `*Response:*\n\`\`\`${errorMessage}\`\`\`` : ''
                        ].filter(Boolean).join('\n');
                    }

                    slackPayload.blocks.push({
                        type: "section",
                        text: {
                            type: "mrkdwn",
                            text: failureText
                        }
                    });
                });

                await this.sendSlackMessage(slackPayload);
            } catch (error) {
                console.error('❌ Error sending SLA notification:', error);
                console.error('Error details:', error.stack);
            }
        } else {
            console.warn('⚠️ Slack webhook URL not configured. Skipping notification.');
        }
    }

    async sendSSLNotification(summary) {
        if (!this.webhookUrl) {
            console.warn('⚠️ Slack webhook URL not configured. Skipping SSL notification.');
            return;
        }

        try {
            console.log('Preparing to send SSL expiry notification...');
            const fetch = await fetchPromise;
            const environment = process.env.BASE_URL_SLA_US.includes('staging') ? 'Staging' : 'Production';

            const sslAlerts = summary.details.filter(detail => detail.ssl);
            
            const slackPayload = {
                text: `:warning: ${this.getMentionText()}SLA Monitor - SSL Certificate Alert\nEnvironment: ${environment}`,
                blocks: [
                    {
                        type: "header",
                        text: {
                            type: "plain_text",
                            text: ":warning: SLA Monitor - SSL Certificate Alert",
                            emoji: true
                        }
                    },
                    {
                        type: "section",
                        text: {
                            type: "mrkdwn",
                            text: `${this.getMentionText()}Environment: ${environment}\nRegion: ${summary.region}`
                        }
                    },
                    {
                        type: "divider"
                    }
                ]
            };

            // Add each SSL alert as a section
            sslAlerts.forEach(alert => {
                const sslInfo = alert.ssl;
                const alertText = [
                    `*Domain:* ${sslInfo.domain}`,
                    `*Days Until Expiry:* ${sslInfo.daysUntilExpiry}`,
                    `*Expiry Date:* ${new Date(sslInfo.expiryDate).toLocaleDateString()}`,
                    `*Issuer:* ${JSON.stringify(sslInfo.issuer, null, 2)}`
                ].join('\n');

                slackPayload.blocks.push({
                    type: "section",
                    text: {
                        type: "mrkdwn",
                        text: alertText
                    }
                });
            });

            await this.sendSlackMessage(slackPayload);
        } catch (error) {
            console.error('❌ Error sending SSL notification:', error);
            console.error('Error details:', error.stack);
        }
    }

    async sendSlackMessage(payload) {
        const fetch = await fetchPromise;
        const response = await fetch(this.webhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error(`Failed to send Slack notification: ${response.status} ${response.statusText}`);
        }

        const responseText = await response.text();
        console.log('✅ Successfully sent notification to Slack');
        console.log('Slack response:', responseText);
    }
}

module.exports = new SlackNotifier();