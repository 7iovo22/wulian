const fs = require('fs');
const path = require('path');

const iconDir = path.join(__dirname, '../images/tab');

if (!fs.existsSync(iconDir)) {
  fs.mkdirSync(iconDir, { recursive: true });
}

function createSimplePNG(width, height, color) {
  const signature = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
  
  const ihdr = createIHDRChunk(width, height);
  const idat = createIDATChunk(width, height, color);
  const iend = createIENDChunk();
  
  return Buffer.concat([signature, ihdr, idat, iend]);
}

function createIHDRChunk(width, height) {
  const data = Buffer.alloc(13);
  data.writeUInt32BE(width, 0);
  data.writeUInt32BE(height, 4);
  data[8] = 8;
  data[9] = 2;
  data[10] = 0;
  data[11] = 0;
  data[12] = 0;
  
  return createChunk('IHDR', data);
}

function createIDATChunk(width, height, color) {
  const rawData = [];
  for (let y = 0; y < height; y++) {
    rawData.push(0);
    for (let x = 0; x < width; x++) {
      const cx = Math.floor(x / 16);
      const cy = Math.floor(y / 16);
      if ((cx + cy) % 2 === 0) {
        rawData.push(color.r, color.g, color.b);
      } else {
        rawData.push(200, 200, 200);
      }
    }
  }
  
  const zlib = require('zlib');
  const compressed = zlib.deflateSync(Buffer.from(rawData));
  
  return createChunk('IDAT', compressed);
}

function createIENDChunk() {
  return createChunk('IEND', Buffer.alloc(0));
}

function createChunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  
  const typeBuffer = Buffer.from(type, 'ascii');
  const crcData = Buffer.concat([typeBuffer, data]);
  
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(crcData), 0);
  
  return Buffer.concat([length, typeBuffer, data, crc]);
}

function crc32(data) {
  let crc = 0xFFFFFFFF;
  const table = [];
  
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) {
      c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[i] = c;
  }
  
  for (let i = 0; i < data.length; i++) {
    crc = table[(crc ^ data[i]) & 0xFF] ^ (crc >>> 8);
  }
  
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

const icons = [
  { name: 'home.png', color: { r: 153, g: 153, b: 153 } },
  { name: 'home-active.png', color: { r: 30, g: 144, b: 255 } },
  { name: 'device.png', color: { r: 153, g: 153, b: 153 } },
  { name: 'device-active.png', color: { r: 30, g: 144, b: 255 } },
  { name: 'safety.png', color: { r: 153, g: 153, b: 153 } },
  { name: 'safety-active.png', color: { r: 30, g: 144, b: 255 } },
  { name: 'mine.png', color: { r: 153, g: 153, b: 153 } },
  { name: 'mine-active.png', color: { r: 30, g: 144, b: 255 } }
];

icons.forEach(icon => {
  const png = createSimplePNG(81, 81, icon.color);
  fs.writeFileSync(path.join(iconDir, icon.name), png);
  console.log(`Created ${icon.name}`);
});

console.log('All icons created successfully!');