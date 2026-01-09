import crypto from "crypto";

export default function handler(req, res) {
  const totalBytes = Math.max(0, parseInt(req.query.bytes || "0", 10)) || 0;

  res.setHeader("Content-Type", "application/octet-stream");
  res.setHeader("Cache-Control", "no-store");

  if (!totalBytes) return res.end();

  const CHUNK = 64 * 1024;
  let sent = 0;

  function write() {
    while (sent < totalBytes) {
      const remaining = totalBytes - sent;
      const size = Math.min(CHUNK, remaining);
      const buf = crypto.randomBytes(size);
      sent += size;

      if (!res.write(buf)) {
        res.once("drain", write);
        return;
      }
    }
    res.end();
  }

  write();
}
