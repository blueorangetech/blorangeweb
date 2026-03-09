const fs = require('fs');
const { exec } = require('child_process');

// This script will be used to extract the base64 from a file and write it as a PNG
const base64Data = process.argv[2];
if (!base64Data) process.exit(1);

const cleanData = base64Data.replace(/^data:image\/png;base64,/, "");
fs.writeFileSync('c:/Users/blueorange/Desktop/Boweb/public/favicon.png', cleanData, 'base64');
console.log('Favicon updated successfully.');
