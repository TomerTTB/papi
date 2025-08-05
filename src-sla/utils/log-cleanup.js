const fs = require('fs').promises;
const path = require('path');

class LogCleaner {
    constructor() {
        this.logBasePath = path.join(__dirname, '..', 'logs');
    }

    async cleanupOldLogs() {
        const logExpiry = parseInt(process.env.LOG_EXPIRY) || 30; // Default to 30 days if not set
        const currentDate = new Date();

        try {
            // Check if logs directory exists
            try {
                await fs.access(this.logBasePath);
            } catch {
                console.log('No logs directory found. Skipping cleanup.');
                return;
            }

            // Get all folders in the logs directory
            const folders = await fs.readdir(this.logBasePath);
            
            console.log('\n' + '='.repeat(50));
            console.log('Starting log cleanup process...');
            console.log(`Log expiry period: ${logExpiry} days`);

            let deletedCount = 0;
            
            for (const folder of folders) {
                const folderPath = path.join(this.logBasePath, folder);
                const stat = await fs.stat(folderPath);
                
                // Skip if it's not a directory
                if (!stat.isDirectory()) continue;
                
                // Parse the folder name as date (folder names are in YYYY-MM-DD format)
                const folderDate = new Date(folder);
                
                // Skip if folder name is not a valid date
                if (isNaN(folderDate.getTime())) continue;
                
                // Calculate the age in days
                const ageInDays = Math.floor((currentDate - folderDate) / (1000 * 60 * 60 * 24));
                
                // Delete if older than expiry period
                if (ageInDays > logExpiry) {
                    await fs.rm(folderPath, { recursive: true, force: true });
                    console.log(`Deleted log folder: ${folder} (${ageInDays} days old)`);
                    deletedCount++;
                }
            }
            
            console.log(`Log cleanup completed. ${deletedCount} folders deleted.`);
            console.log('='.repeat(50) + '\n');
        } catch (error) {
            console.error('Error during log cleanup:', error);
        }
    }
}

module.exports = new LogCleaner(); 