export const config = {
  api: { bodyParser: false }
};

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") return res.status(405).json({ ok: false });

  let received = 0;
  for await (const chunk of req) received += chunk.length;

  res.json({ ok: true, received });
}
