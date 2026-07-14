1. You still need to: ① register at Google Search Console + Bing Webmaster Tools and submit the sitemap; ② create og-image.png — it's referenced in every page's meta but doesn't exist in the repo (1200×630px); ③ know that blog posts render client-side from Firestore — Google handles this, Bing is weaker; consider prerendering posts later.

2. Web3Forms key in contact.html is public by design but spammable — enable domain allowlist and captcha in your Web3Forms dashboard.

3. The Firebase API key being visible is normal (not a flaw), but restrict it by HTTP referrer in Google Cloud Console → Credentials, and consider Firebase App Check to stop bots writing comments/reactions.

4. No security headers (CSP, X-Frame-Options, HSTS) — add via firebase.json headers or Netlify _headers when you deploy. Happy to write these if you tell me where you're hosting.

5. 


Updae the Part 1 — Restrict the API key by HTTP referrer (~2 min, console only) here