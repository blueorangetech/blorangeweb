const fs = require('fs');

function getPngDimensions(filePath) {
    const buffer = fs.readFileSync(filePath);
    // PNG signature is 8 bytes
    // IHDR chunk starts after that. 
    // Width is at 16-20 bytes, Height at 20-24 bytes
    const width = buffer.readUInt32BE(16);
    const height = buffer.readUInt32BE(20);
    return { width, height };
}

try {
    const dims = getPngDimensions('c:/Users/blueorange/Desktop/Boweb/src/assets/#symbol_main.png');
    console.log(JSON.stringify(dims));
} catch (e) {
    console.error(e);
}
