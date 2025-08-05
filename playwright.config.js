const { defineConfig } = require('@playwright/test');
const path = require('path');

// Generate timestamp for report file (YYYY-MM-DD-HH-MM format)
const timestamp = new Date().toISOString().split(':').slice(0, 2).join('-').replace('T', '-');
const reportFile = `report-${timestamp}.html`;

module.exports = defineConfig({
  testDir: './tests',
  timeout: 30000,
  reporter: [
    ['html', { 
      open: 'never',
      outputFile: reportFile  // Use timestamped file name
    }],
    ['list']
  ],
  use: {
    extraHTTPHeaders: {
      'Accept': 'application/json'
    }
  },
  projects: [
    {
      name: 'api',
      testMatch: '**/*.spec.js',
      testDir: './tests'
    }
  ],
  workers: 1 // Run tests sequentially
}); 