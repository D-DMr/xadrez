const fs = require('node:fs');
const path = require('node:path');
const zlib = require('node:zlib');

const size = 256;
const knight = [
  [52, 213], [204, 213], [204, 195], [178, 188], [168, 172], [177, 157],
  [188, 137], [186, 117], [176, 99], [161, 82], [145, 66], [128, 50],
  [112, 42], [97, 47], [86, 62], [81, 78], [84, 94], [99, 106],
  [89, 119], [74, 131], [65, 148], [69, 163], [84, 174], [91, 187],
  [82, 199], [52, 199]
];
const insidePolygon = (x, y) => {
  let inside = false;
  for (let i = 0, j = knight.length - 1; i < knight.length; j = i++) {
    const [xi, yi] = knight[i];
    const [xj, yj] = knight[j];
    if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
};
const raw = Buffer.alloc(size * (size * 4 + 1));
for (let y = 0; y < size; y++) {
  const row = y * (size * 4 + 1);
  raw[row] = 0;
  for (let x = 0; x < size; x++) {
    const dx = x < 42 ? 42 - x : x > 213 ? x - 213 : 0;
    const dy = y < 42 ? 42 - y : y > 213 ? y - 213 : 0;
    const rounded = dx * dx + dy * dy <= 42 * 42;
    const base = row + 1 + x * 4;
    if (!rounded) continue;
    const eye = (x - 109) ** 2 + (y - 74) ** 2 <= 5 ** 2;
    const color = insidePolygon(x + 0.5, y + 0.5) && !eye ? [255, 255, 255, 255] : [129, 182, 76, 255];
    raw.set(color, base);
  }
}

const crcTable = Array.from({ length: 256 }, (_, value) => {
  let crc = value;
  for (let bit = 0; bit < 8; bit++) crc = crc & 1 ? 0xedb88320 ^ (crc >>> 1) : crc >>> 1;
  return crc >>> 0;
});
const crc32 = buffer => {
  let crc = 0xffffffff;
  for (const byte of buffer) crc = crcTable[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
};
const pngChunk = (name, data) => {
  const type = Buffer.from(name);
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const checksum = Buffer.alloc(4);
  checksum.writeUInt32BE(crc32(Buffer.concat([type, data])));
  return Buffer.concat([length, type, data, checksum]);
};
const header = Buffer.alloc(13);
header.writeUInt32BE(size, 0);
header.writeUInt32BE(size, 4);
header[8] = 8;
header[9] = 6;
const png = Buffer.concat([
  Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
  pngChunk('IHDR', header),
  pngChunk('IDAT', zlib.deflateSync(raw)),
  pngChunk('IEND', Buffer.alloc(0))
]);
const iconHeader = Buffer.alloc(6);
iconHeader.writeUInt16LE(0, 0);
iconHeader.writeUInt16LE(1, 2);
iconHeader.writeUInt16LE(1, 4);
const entry = Buffer.alloc(16);
entry[0] = 0;
entry[1] = 0;
entry.writeUInt16LE(1, 4);
entry.writeUInt16LE(32, 6);
entry.writeUInt32LE(png.length, 8);
entry.writeUInt32LE(22, 12);
fs.writeFileSync(path.join(__dirname, 'icon.ico'), Buffer.concat([iconHeader, entry, png]));
