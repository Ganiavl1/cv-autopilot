// /api/unlock — Vercel serverless function (Node 18+, zero dependencies)
// Validates and activates a Lemon Squeezy license key.
// The customer receives a license key by email instantly after paying.
// Activation limit (set on your LS product, e.g. 3) controls how many times a key can unlock.
// No API key needed: the LS license endpoints are public.

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { licenseKey } = req.body || {};
  if (!licenseKey || licenseKey.trim().length < 10) {
    return res.status(400).json({ error: 'Please enter the license key from your purchase email.' });
  }

  try {
    const r = await fetch('https://api.lemonsqueezy.com/v1/licenses/activate', {
      method: 'POST',
      headers: { 'content-type': 'application/json', accept: 'application/json' },
      body: JSON.stringify({
        license_key: licenseKey.trim(),
        instance_name: 'cv-download-' + Date.now()
      })
    });

    const data = await r.json();

    if (data.activated === true || (data.license_key && data.license_key.status === 'active')) {
      return res.status(200).json({ unlocked: true });
    }

    const reason = data.error || 'This license key is invalid or has already been used.';
    return res.status(402).json({ error: reason });
  } catch (err) {
    console.error('unlock error:', err);
    return res.status(500).json({ error: 'Could not verify the license key. Please try again.' });
  }
}
