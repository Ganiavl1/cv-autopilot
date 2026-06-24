# CV Autopilot — your pay-per-download CV SaaS

Paste raw career info → AI generates an ATS-optimized CV → free watermarked preview → customer pays → license key unlocks the PDF download.

No database, no user accounts, no subscriptions to manage. Two serverless functions and one page.

## What's in this folder

| File | What it does |
|---|---|
| `index.html` | The whole site: landing page, generator, preview, paywall, PDF download |
| `api/generate.js` | Calls the Anthropic API server-side (your key is never exposed to visitors) |
| `api/unlock.js` | Verifies the customer's Lemon Squeezy license key and unlocks the download |

## Deploy in ~30 minutes

### Step 1 — Put it on Vercel
1. Create a free GitHub repository and upload this folder (keep the `api` folder structure).
2. In Vercel, click **Add New → Project**, import the repo, and deploy. No build settings needed — Vercel auto-detects the static page and the `api` functions.
3. In Vercel → your project → **Settings → Environment Variables**, add:
   - `ANTHROPIC_API_KEY` = your Anthropic API key
4. Redeploy. Test the generator with the free preview — it should work now.

### Step 2 — Set up payments (Lemon Squeezy)
Lemon Squeezy acts as the "merchant of record," meaning they handle cards, invoices, and taxes for you — ideal for an individual seller in the UAE.

1. Create a store at lemonsqueezy.com.
2. Create a **Product**: name it "CV Download Unlock", price **$4.99**, type: digital.
3. In the product settings, enable **License keys** and set the **Activation limit to 3** (lets a customer unlock/re-download up to 3 times; prevents key sharing).
4. Copy the product's **Buy link** (looks like `https://yourstore.lemonsqueezy.com/buy/xxxx`).
5. Open `index.html`, find the `CONFIG` block near the bottom, and paste your buy link into `checkoutUrl`. Update `priceLabel` if you change the price.
6. Commit + push — Vercel redeploys automatically.

### Step 3 — Point your domain
In Vercel → project → **Settings → Domains**, add `cv.autopilotdollar.com`, then add the CNAME record Vercel shows you in your domain registrar's DNS settings.

### Step 4 — Test the full money loop
1. Generate a CV with the free preview.
2. Buy your own product in Lemon Squeezy **test mode** (toggle in LS dashboard) — you'll get a license key by email.
3. Paste the key → watermark disappears → Download PDF works.
4. Switch Lemon Squeezy out of test mode. You are now live and able to take real money.

## How the money flows
Customer pays → Lemon Squeezy emails them a license key instantly → they paste it on your site → `api/unlock.js` activates the key against the Lemon Squeezy API → download unlocked. Lemon Squeezy pays out to you (Payoneer/PayPal/bank depending on setup).

## Costs per sale (rough)
- Lemon Squeezy fee: ~5% + $0.50 → about $0.75 on a $4.99 sale
- Anthropic API: a CV generation costs a few cents
- Vercel: free tier covers a lot of traffic
- **You keep roughly $4 per sale.**

## First customers (do these in week 1)
1. Make 2 example CVs (before/after screenshots) and post on LinkedIn — UAE job-seeker groups are very active.
2. Post in r/UAEJobs-type communities and job-hunting Facebook groups (check group rules first).
3. Offer 5 free unlocks to friends in exchange for honest testimonials you can put on the page.
4. Add a "Made for UAE job seekers" angle — local positioning beats generic tools.

## Ideas for v2 (after first sales)
- Cover letter add-on (+$2.99 with the same license flow)
- Arabic CV option (huge differentiator in the UAE)
- "3 CV pack" pricing for different target roles
- Simple rate limiting on `/api/generate` if free-preview abuse appears (e.g. Vercel KV + IP counter)

## Important notes
- Never commit your API key to GitHub — it lives only in Vercel environment variables.
- The free preview costs you a few cents per generation; that's your marketing cost. If abuse appears, add rate limiting (see v2 ideas).
- Check that the terms/refund policy in your Lemon Squeezy store match what the site's FAQ promises.
