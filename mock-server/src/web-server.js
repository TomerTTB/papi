const express = require('express');
const path = require('path');
const app = express();

app.use(express.static(path.join(__dirname, '../public')));

const webPort = 3004;
app.listen(webPort, () => {
    console.log(`Web interface running on http://localhost:${webPort}`);
}); 