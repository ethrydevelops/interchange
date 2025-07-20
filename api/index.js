const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const console = require('./modules/console');

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8080;

app.disable('x-powered-by');
app.use(cors());
app.use(express.json());

console.log("Starting interchange api...")
console.log("Loading routes...")

function loadRoutes(dir) {
    const files = fs.readdirSync(dir);

    files.forEach(file => {
        const fullPath = path.join(dir, file);
        const relativePath = "." + fullPath.replace(__dirname, "").replace(/\\/g, "/");
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            loadRoutes(fullPath); // load routes in subdirectories
        } else if (file.endsWith('.js')) {
            // if its a valid route file, load it
            const route = require(fullPath);
            try {
                app.use(route);
                console.log("Loaded route(s) from " + relativePath);
            } catch (error) {
                console.error("Failed to load route(s) from " + relativePath + ": " + error);
            }
        }
    });
}

// load required routes before starting:
loadRoutes(path.join(__dirname, "routes"));

// TODO: HTTPS

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}/`);
});