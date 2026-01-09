import express from "express";
import crypto from "crypto";

const app = express();
const PORT = process.env.PORT || 3000;

// Serve frontend
app.use(express.static("public"));

// Ping endpoint (tiny + fast)
app.get("/ping", (req, res) => {
  res.set("Cache-Control", "no-store");
  res.status(204).end();
});

// Download stream endpoint
// /down?bytes=20971520  (20MB)
app.get("/down", (req, res) => {
  const totalBytes = Math.max(0, parseInt(req.query.bytes || "0", 10)) || 0;

  res.set({
    "Content-Type": "application/octet-stream",
    "Cache-Control": "no-store",
    "Content-Disposition": "inline",
  });

  if (totalBytes === 0) return res.end();

  const CHUNK = 64 * 1024; // 64KB chunks
  let sent = 0;

  const interval = setInterval(() => {
    if (sent >= totalBytes) {
      clearInterval(interval);
      return res.end();
    }
    const remaining = totalBytes - sent;
    const size = Math.min(CHUNK, remaining);
    const buf = crypto.randomBytes(size);
    sent += size;
    res.write(buf);
  }, 0);

  req.on("close", () => clearInterval(interval));
});

// Upload sink endpoint (discard body)
app.post(
  "/up",
  express.raw({ type: "*/*", limit: "2gb" }),
  (req, res) => {
    res.set("Cache-Control", "no-store");
    res.json({ ok: true, received: req.body?.length || 0 });
  }
);

app.listen(PORT, () => {
  console.log(`✅ SpeedTest running on http://localhost:${PORT}`);
});
