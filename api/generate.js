// /api/generate — Vercel serverless function (Node 18+, zero dependencies)
// Calls the Anthropic API server-side so your key is never exposed to the browser.
// Required env var on Vercel: ANTHROPIC_API_KEY

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { rawInfo, targetRole } = req.body || {};
  if (!rawInfo || rawInfo.trim().length < 50) {
    return res.status(400).json({ error: 'Please provide more detail about your experience (at least a few sentences).' });
  }
  if (rawInfo.length > 12000) {
    return res.status(400).json({ error: 'Input too long. Please keep it under 12,000 characters.' });
  }

  const system = `You are an expert CV writer specializing in ATS-optimized resumes.
From the user's raw career information, produce a polished, professional CV.
Respond ONLY with valid JSON, no markdown fences, no preamble, matching exactly this schema:
{
  "name": string,
  "headline": string,            // e.g. "Sales Operations Manager"
  "contact": string,             // single line: location | email | phone (only what was provided; never invent)
  "summary": string,             // 3-4 sentence professional summary with strong keywords
  "skills": string[],            // 8-14 concise, ATS-keyword skills
  "experience": [ { "title": string, "company": string, "dates": string, "bullets": string[] } ],
  "education": [ { "degree": string, "institution": string, "dates": string } ],
  "extras": [ { "heading": string, "items": string[] } ]   // certifications, languages, etc. Empty array if none.
}
Rules: never invent employers, dates, degrees, or contact details not present in the input.
Rewrite bullets as achievement-oriented statements with action verbs and, where the input supports it, quantified results.
Tailor keyword emphasis to the target role if one is given.`;

  const userMsg = `TARGET ROLE: ${targetRole || 'Not specified'}\n\nRAW CAREER INFORMATION:\n${rawInfo}`;

  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 2500,
        system,
        messages: [{ role: 'user', content: userMsg }]
      })
    });

    if (!r.ok) {
      const errText = await r.text();
      console.error('Anthropic API error:', r.status, errText);
      return res.status(502).json({ error: 'CV generation failed. Please try again in a moment.' });
    }

    const data = await r.json();
    const text = (data.content || [])
      .filter(b => b.type === 'text')
      .map(b => b.text)
      .join('\n');

    const clean = text.replace(/```json|```/g, '').trim();
    let cv;
    try {
      cv = JSON.parse(clean);
    } catch (e) {
      console.error('JSON parse failed:', clean.slice(0, 300));
      return res.status(502).json({ error: 'CV generation returned an unexpected format. Please try again.' });
    }

    return res.status(200).json({ cv });
  } catch (err) {
    console.error('generate error:', err);
    return res.status(500).json({ error: 'Server error. Please try again.' });
  }
}
