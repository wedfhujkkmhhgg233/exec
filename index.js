const express = require('express');
const { exec } = require('child_process');
const cron = require('node-cron'); // For scheduling tasks

const app = express();
const PORT = 3000;

// Predefined list of `numDownloads`
const numDownloadsList = [
    521568, 678235, 16788, 986457, 1467642, 
    1356773, 1342334, 9643234, 133344, 13346, 145334
];

// Function to execute the command
function executeCommand() {
    const packageName = 'sim-ph'; // Fixed package name
    const maxConcurrentDownloads = 1000; // Fixed concurrent downloads

    // Randomly pick a value from `numDownloadsList`
    const numDownloads = numDownloadsList[Math.floor(Math.random() * numDownloadsList.length)];

    // Build the command
    const command = `nid --package-name ${packageName} --num-downloads ${numDownloads} --max-concurrent-downloads ${maxConcurrentDownloads} --download-timeout 3000`;

    console.log('Running the command:', command);

    // Execute the command
    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error('Error executing command:', error.message);
            return;
        }
        if (stderr) {
            console.error('Error output:', stderr);
            return;
        }
        console.log('Command output:', stdout);
    });
}

// Schedule the command to run every hour
cron.schedule('0 * * * *', () => {
    console.log('Executing scheduled task at:', new Date().toLocaleString());
    executeCommand();
});

// Express route to trigger execution manually
app.get('/execute-now', (req, res) => {
    executeCommand();
    res.send('Command executed manually.');
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
