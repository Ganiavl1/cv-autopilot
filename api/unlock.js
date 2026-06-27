// /api/unlock — Vercel serverless function (Node 18+, zero dependencies)
// Validates a Gumroad license key using the Gumroad API.
// No API key needed — the Gumroad license endpoint is public.
// Required: GUMROAD_PRODUCT_ID env var on Vercel = hOhbQd9k5B97uOpVGx2iAw==

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { licenseKey } = req.body || {};
  if (!licenseKey || licenseKey.trim().length < 10) {
    return res.status(400).json({ error: 'Please enter the license key from your purchase email.' });
  }

  try {
    const r = await fetch('https://api.gumroad.com/v2/licenses/verify', {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        product_id: process.env.GUMROAD_PRODUCT_ID,
        license_key: licenseKey.trim(),
        increment_uses_count: 'true'
      })
    });

    const data = await r.json();

    if (data.success === true) {
      return res.status(200).json({ unlocked: true });
    }

    return res.status(402).json({ error: data.message || 'Invalid license key. Please check and try again.' });
  } catch (err) {
    console.error('unlock error:', err);
    return res.status(500).json({ error: 'Could not verify the license key. Please try again.' });
  }
}
