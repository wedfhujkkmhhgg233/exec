const express = require('express');
const { exec } = require('child_process');
const schedule = require('node-schedule');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const PORT = 3000;

// Log function to send output to the client
function logToClient(message) {
    console.log(message); // Standard console log for debugging
    io.emit('log', message); // Send log to the client in real-time
}

// Function to check if npm-increaser-downloads is installed
function checkAndInstallNpmPackage() {
    return new Promise((resolve, reject) => {
        exec('npm list -g npm-increaser-downloads', (error, stdout, stderr) => {
            if (error) {
                logToClient('npm-increaser-downloads not found. Installing...');
                exec('npm install -g npm-increaser-downloads', (installError, installStdout, installStderr) => {
                    if (installError) {
                        logToClient('Error installing npm-increaser-downloads: ' + installError.message);
                        reject(installError);
                    } else {
                        logToClient('npm-increaser-downloads installed successfully.');
                        resolve();
                    }
                });
            } else {
                logToClient('npm-increaser-downloads is already installed.');
                resolve();
            }
        });
    });
}

// Schedule the job to run every hour
schedule.scheduleJob('0 * * * *', () => {
    logToClient('Scheduled job started...');
    runDownloadIncrement();
});

// Route for manual execution
app.get('/execute-now', (req, res) => {
    logToClient('Manual execution started...');
    runDownloadIncrement(res);
});

async function runDownloadIncrement(res = null) {
    try {
        await checkAndInstallNpmPackage();
    } catch (error) {
        if (res) {
            res.send('Error installing npm-increaser-downloads. Please check the logs.');
        }
        return;
    }

    // Generate a random number for downloads from a predefined set
    const downloadCounts = [521568, 678235, 16788, 986457, 1467642, 1356773, 1342334, 9643234, 133344, 13346, 145334];
    const numDownloads = downloadCounts[Math.floor(Math.random() * downloadCounts.length)];
    const command = `npm-increaser-downloads --package-name sim-ph --num-downloads ${numDownloads} --max-concurrent-downloads 1000 --download-timeout 3000`;

    logToClient('Running command: ' + command);

    exec(command, (error, stdout, stderr) => {
        if (error) {
            logToClient('Error executing command: ' + error.message);
            if (res) res.send('Error executing command: ' + error.message);
            return;
        }
        if (stderr) {
            logToClient('Error output: ' + stderr);
            if (res) res.send('Error output: ' + stderr);
            return;
        }
        logToClient('Command output: ' + stdout);
        if (res) res.send('Command output: ' + stdout);
    });
}

// Serve static files and setup the server
app.use(express.static('public'));

server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
