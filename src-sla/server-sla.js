const express = require('express');
const cors = require('cors');
const { startSLAMonitoring, displayStartupInfo, runSLATests, SLA_ENDPOINTS } = require('./sla');
const statusTracker = require('./utils/status-tracker');
const sslStatusTracker = require('./utils/ssl-status-tracker');
const path = require('path');

const app = express();
const port = process.env.SLA_PORT || 3001;

// Configure CORS
const corsOptions = {
    origin: function (origin, callback) {
        // List of allowed origins
        const allowedOrigins = [
            'http://localhost:3000',
            'http://localhost:3001',
            'http://localhost:8080'
        ];
        
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
};

// Enable CORS with options
app.use(cors(corsOptions));
app.use(express.json());

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// Serve shared resources
app.use('/shared/styles', express.static(path.join(__dirname, '../web_server/styles')));
app.use('/shared/templates', express.static(path.join(__dirname, '../web_server/templates')));
app.use('/shared/scripts', express.static(path.join(__dirname, '../web_server/scripts')));
app.use('/shared/images', express.static(path.join(__dirname, '../web_server/images')));

// Display startup information
displayStartupInfo();

// API endpoints for SLA monitoring
app.get('/status', (req, res) => {
    res.json({
        status: 'running',
        iteration: process.env.ITERATION || '5',
        version: process.env.PAPI_VERSION || 'Unknown',
        endpoints: SLA_ENDPOINTS,
        lastCheck: new Date().toISOString(),
        urls: {
            goeyes: process.env.BASE_URL_SLA,
            phi: process.env.BASE_URL_PHI_SLA
        },
        ssl: sslStatusTracker.getStatus()
    });
});

// Endpoint to get current status of all endpoints
app.get('/api/status', (req, res) => {
    const endpointStatus = statusTracker.getStatus();
    const sslStatus = sslStatusTracker.getStatus();
    
    res.json({
        ...endpointStatus,
        ssl: sslStatus
    });
});

// HTML status page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/run', async (req, res) => {
    try {
        await runSLATests();
        res.json({ status: 'success', message: 'SLA tests completed' });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`SLA Monitor server is running on http://localhost:${port}`);
    
    // Initial delay before starting SLA monitoring
    console.log('Waiting 10 seconds for other services to initialize...');
    setTimeout(() => {
        console.log('Starting SLA monitoring...');
        startSLAMonitoring().catch(error => {
            console.error('Error in SLA monitoring:', error);
            process.exit(1);
        });
    }, 10000); // 10 seconds delay
}); 