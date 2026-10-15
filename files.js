// Lua has no directory listing; server.lua validates kind, name and permission before calling these.
const fs = require('fs');
const path = require('path');

const root = GetResourcePath(GetCurrentResourceName());
const VIDEO_FOLDER = 'config/video';
const CONTAINERS = new Set(['moov', 'trak', 'mdia', 'minf', 'stbl']);

exports('listUploadFolder', (folder) => {
  const dir = path.join(root, folder);
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => {
      const stat = fs.statSync(path.join(dir, entry.name));
      return { name: entry.name, size: stat.size, modified: Math.floor(stat.mtimeMs / 1000) };
    });
});

exports('deleteUploadFile', (folder, name) => {
  try {
    fs.unlinkSync(path.join(root, folder, name));
    return true;
  } catch {
    return false;
  }
});

// Lua has no fast base64 decoder; an ArrayBuffer reaches Lua as a byte string (a Buffer arrives as a table).
exports('decodeBase64', (data) => {
  const buf = Buffer.from(String(data), 'base64');
  return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.length);
});

function readBoxes(buf, start, end) {
  const boxes = [];
  let off = start;
  while (off + 8 <= end) {
    let size = buf.readUInt32BE(off);
    let header = 8;
    if (size === 1) {
      if (off + 16 > end) return null;
      size = Number(buf.readBigUInt64BE(off + 8));
      header = 16;
    } else if (size === 0) {
      size = end - off;
    }
    if (size < header || off + size > end) return null;
    boxes.push({ type: buf.toString('latin1', off + 4, off + 8), start: off, size, header });
    off += size;
  }
  return boxes;
}

// Shifts every chunk offset (stco/co64) that points into [from, to) by `shift`; false if a 32-bit offset overflows.
function shiftChunkOffsets(buf, start, end, from, to, shift) {
  const boxes = readBoxes(buf, start, end);
  if (!boxes) return false;
  for (const box of boxes) {
    const body = box.start + box.header;
    if (CONTAINERS.has(box.type)) {
      if (!shiftChunkOffsets(buf, body, box.start + box.size, from, to, shift)) return false;
    } else if (box.type === 'stco' || box.type === 'co64') {
      const wide = box.type === 'co64';
      const count = buf.readUInt32BE(body + 4);
      for (let i = 0; i < count; i++) {
        const at = body + 8 + i * (wide ? 8 : 4);
        const value = wide ? Number(buf.readBigUInt64BE(at)) : buf.readUInt32BE(at);
        if (value < from || value >= to) continue;
        if (wide) buf.writeBigUInt64BE(BigInt(value + shift), at);
        else if (value + shift > 0xFFFFFFFF) return false;
        else buf.writeUInt32BE(value + shift, at);
      }
    }
  }
  return true;
}

/**
 * CEF can't play an MP4 from the resource when its index (moov) sits after the media (mdat):
 * the screen stays black. Moves the moov to the front without re-encoding.
 * Returns 'fixed', 'ok' (already in order or not an MP4 we can fix) or 'error'.
 */
function faststart(file) {
  try {
    const buf = fs.readFileSync(file);
    const top = readBoxes(buf, 0, buf.length);
    if (!top || top.some((box) => box.type === 'moof')) return 'ok';

    const moov = top.find((box) => box.type === 'moov');
    const mdat = top.find((box) => box.type === 'mdat');
    if (!moov || !mdat || moov.start < mdat.start) return 'ok';

    const moovBuf = Buffer.from(buf.subarray(moov.start, moov.start + moov.size));
    if (!shiftChunkOffsets(moovBuf, 0, moovBuf.length, mdat.start, moov.start, moov.size)) return 'error';

    const out = Buffer.concat([
      buf.subarray(0, mdat.start),
      moovBuf,
      buf.subarray(mdat.start, moov.start),
      buf.subarray(moov.start + moov.size),
    ]);
    const tmp = `${file}.tmp`;
    fs.writeFileSync(tmp, out);
    fs.renameSync(tmp, file);
    return 'fixed';
  } catch (err) {
    console.error(`[mri_Qloadscreen] faststart ${file}: ${err.message}`);
    return 'error';
  }
}

exports('faststartVideo', (name) => faststart(path.join(root, VIDEO_FOLDER, name)));

// Videos copied straight into the folder; players get the fixed file on the next restart.
for (const name of fs.existsSync(path.join(root, VIDEO_FOLDER)) ? fs.readdirSync(path.join(root, VIDEO_FOLDER)) : []) {
  if (!/\.mp4$/i.test(name)) continue;
  const result = faststart(path.join(root, VIDEO_FOLDER, name));
  if (result === 'fixed') console.log(`^3[mri_Qloadscreen] ${name} reorganizado para tocar na tela de carregamento. Reinicie o mri_Qloadscreen para os jogadores receberem.^0`);
  else if (result === 'error') console.log(`^1[mri_Qloadscreen] ${name} não pôde ser reorganizado e pode ficar preto na tela de carregamento.^0`);
}
