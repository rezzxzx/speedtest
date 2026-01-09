export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");

  const xff = req.headers["x-forwarded-for"];
  const ip = (Array.isArray(xff) ? xff[0] : (xff || "")).split(",")[0].trim()
    || req.socket?.remoteAddress
    || "";

  const cleanIp = ip.startsWith("::ffff:") ? ip.replace("::ffff:", "") : ip;

  try {
    const url = `https://ipwho.is/${encodeURIComponent(cleanIp)}`;
    const r = await fetch(url, { headers: { "accept": "application/json" } });
    const j = await r.json();

    res.json({
      ip: cleanIp || j?.ip || "",
      isp: j?.connection?.isp || "",
      org: j?.connection?.org || "",
      asn: j?.connection?.asn || "",
      country: j?.country || "",
      city: j?.city || "",
      region: j?.region || ""
    });
  } catch {
    res.json({ ip: cleanIp || "", isp: "", org: "", asn: "", country: "", city: "", region: "" });
  }
    }
