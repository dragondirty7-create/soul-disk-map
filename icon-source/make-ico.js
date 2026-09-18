const sharp = require('sharp');
const fs = require('fs');
const sizes = [16, 24, 32, 48, 64, 128, 256];
const svg = fs.readFileSync(process.argv[3]);

(async () => {
  const pngs = [];
  for (const s of sizes) {
    pngs.push({ size: s, buf: await sharp(svg, { density: 384 }).resize(s, s).png({ compressionLevel: 9 }).toBuffer() });
  }
  const dir = Buffer.alloc(6);
  dir.writeUInt16LE(0, 0); dir.writeUInt16LE(1, 2); dir.writeUInt16LE(pngs.length, 4);
  let offset = 6 + 16 * pngs.length;
  const entries = [], datas = [];
  for (const { size, buf } of pngs) {
    const e = Buffer.alloc(16);
    e.writeUInt8(size >= 256 ? 0 : size, 0);
    e.writeUInt8(size >= 256 ? 0 : size, 1);
    e.writeUInt8(0, 2); e.writeUInt8(0, 3);
    e.writeUInt16LE(1, 4); e.writeUInt16LE(32, 6);
    e.writeUInt32LE(buf.length, 8); e.writeUInt32LE(offset, 12);
    entries.push(e); datas.push(buf); offset += buf.length;
  }
  fs.writeFileSync(process.argv[2], Buffer.concat([dir, ...entries, ...datas]));
  console.log('ICO written:', sizes.join(','), '->', fs.statSync(process.argv[2]).size, 'bytes');
  await sharp(svg, { density: 384 }).resize(256, 256).png().toFile(process.argv[4]);
  console.log('preview written');
})();
