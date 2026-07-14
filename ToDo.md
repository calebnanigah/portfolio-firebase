1. You still need to: ① register at Google Search Console + Bing Webmaster Tools and submit the sitemap; ② create og-image.png — it's referenced in every page's meta but doesn't exist in the repo (1200×630px); ③ know that blog posts render client-side from Firestore — Google handles this, Bing is weaker; consider prerendering posts later.

2. Web3Forms key in contact.html is public by design but spammable — enable domain allowlist and captcha in your Web3Forms dashboard.

3. The Firebase API key being visible is normal (not a flaw), but restrict it by HTTP referrer in Google Cloud Console → Credentials, and consider Firebase App Check to stop bots writing comments/reactions.

4. No security headers (CSP, X-Frame-Options, HSTS) — add via firebase.json headers or Netlify _headers when you deploy. Happy to write these if you tell me where you're hosting.

5. 


Updae the Part 1 — Restrict the API key by HTTP referrer (~2 min, console only) here



4. Search and add 'APP_CHECK_SITE_KEY' in code

It's the public reCAPTCHA v3 "site key" — the thing that lets your website prove to Firebase that requests are coming from your real site, loaded in a real browser, and not from a bot or a script someone wrote.

Here's the mechanics of it:

You register your domains with Google reCAPTCHA and get a key pair: a site key (public, goes in your HTML — that's APP_CHECK_SITE_KEY) and a secret key (private, you paste it only into the Firebase Console when registering your app for App Check).

When a visitor loads your page, the App Check SDK uses the site key to run reCAPTCHA v3 invisibly in the background. reCAPTCHA scores the visitor ("looks like a human in a real browser on an allowed domain") and Firebase exchanges that for a short-lived App Check token.

That token is then attached automatically to every Firestore request the page makes. Once you enforce App Check, Firestore drops any request that doesn't carry a valid token.

The problem it solves for you specifically: your Firestore rules allow anyone to create comments, reactions, and subscribers — that's necessary for those features to work. But "anyone" includes a bot running curl in a loop, since your API key and project ID are visible in the page source. Your rules constrain what can be written (field names, sizes, ±1 increments), but not who — App Check adds the "who": only code running on your actual site, in a real browser.

Why it's safe to have in your HTML: like the Firebase API key, the site key is public by design. It only works on the domains you registered with reCAPTCHA, so someone copying it gains nothing. The secret key is the one that must never appear in your code — it lives only in the Firebase Console.

So in one sentence: APP_CHECK_SITE_KEY is the switch that turns on bot protection — empty, your site runs on rules alone; filled in (and later enforced), Firestore only talks to genuine visitors on your domains.