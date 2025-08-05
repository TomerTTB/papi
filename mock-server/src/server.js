const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "http://localhost:3004",
        methods: ["GET", "POST"]
    }
});

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Store endpoint configurations
let endpointConfigs = {
    'a': { statusCode: 200, body: { message: 'Response from http://localhost:3003/a' }, delay: 0 },
    'b': { statusCode: 200, body: { message: 'Response from http://localhost:3003/b' }, delay: 0 },
    'c': { statusCode: 200, body: { message: 'Response from http://localhost:3003/c' }, delay: 0 }
};

// Socket.io connection handler
io.on('connection', (socket) => {
    console.log('Client connected');
    
    // Send current configurations to new clients
    socket.emit('configUpdate', endpointConfigs);

    // Handle configuration updates from clients
    socket.on('updateConfig', (newConfig) => {
        console.log('Received new configuration:', newConfig);
        endpointConfigs = { ...endpointConfigs, ...newConfig };
        // Broadcast the new configuration to all clients
        io.emit('configUpdate', endpointConfigs);
        // Send success confirmation to the updating client
        socket.emit('updateSuccess', { 
            endpoint: Object.keys(newConfig)[0],
            timestamp: new Date().toLocaleTimeString()
        });
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

// Dynamic endpoint handler
const handleEndpoint = (endpoint) => async (req, res) => {
    const config = endpointConfigs[endpoint];
    
    if (config.delay > 0) {
        await new Promise(resolve => setTimeout(resolve, config.delay));
    }
    
    res.status(config.statusCode).json(config.body);
};

// Set up endpoints
app.get('/a', handleEndpoint('a'));
app.get('/b', handleEndpoint('b'));
app.get('/c', handleEndpoint('c'));

// Start mock API server
const apiPort = 3003;
server.listen(apiPort, () => {
    console.log(`Mock API server running on http://localhost:${apiPort}`);
}); 