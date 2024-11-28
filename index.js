const express = require('express');
const { exec } = require('child_process');
const cron = require('node-cron'); // For scheduling tasks
const npmIncreaser = require('npm-increaser-downloads');

const app = express();
const PORT = 3000;

// Predefined list of `numDownloads`
const numDownloadsList = [
    521568, 678235, 16788, 986457, 1467642, 
    1356773, 1342334, 9643234, 133344, 13346, 145334
];

// Function to execute the command and capture output
async function executeCommand() {
    return new Promise(async (resolve, reject) => {
        const packageName = 'sim-ph'; // Fixed package name
        const maxConcurrentDownloads = 1000; // Fixed concurrent downloads

        // Randomly pick a value from `numDownloadsList`
        const numDownloads = numDownloadsList[Math.floor(Math.random() * numDownloadsList.length)];

        // Build the command using npm-increaser-downloads
        try {
            console.log('Incrementing downloads for package:', packageName);
            await npmIncreaser(packageName, numDownloads);
            console.log(`Successfully incremented ${numDownloads} downloads for ${packageName}.`);
            resolve(`Successfully incremented ${numDownloads} downloads for ${packageName}.`);
        } catch (error) {
            console.error('Error incrementing downloads:', error.message);
            reject(`Error: ${error.message}`);
        }
    });
}

// Schedule the command to run every hour
cron.schedule('0 * * * *', () => {
    console.log('Executing scheduled task at:', new Date().toLocaleString());
    executeCommand().catch(console.error);
});

// Express route to trigger execution manually
app.get('/execute-now', async (req, res) => {
    try {
        const output = await executeCommand();
        res.send(`<pre>${output}</pre>`);
    } catch (error) {
        res.status(500).send(`<pre>${error}</pre>`);
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
