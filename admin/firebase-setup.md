npm install firebase

---

## Hosting on Firebase

### 1. Install Firebase CLI

```bash
npm install -g firebase-tools
```

### 2. Login & Initialize

```bash
firebase login
firebase init hosting
```

During `init hosting`:
- Select your existing Firebase project (or create one)
- **Public directory**: `.` (HTML files are at the root)
- **Single-page app**: `No`
- **Overwrite index.html**: `No`

This creates two files:
- `firebase.json` — hosting config
- `.firebaserc` — project alias

### 3. Deploy

```bash
firebase deploy --only hosting
```

Your site will be live at `https://<your-project-id>.web.app` and `https://<your-project-id>.firebaseapp.com`.

### 4. Optional: Custom Domain

In the Firebase Console → **Hosting** → **Add custom domain**.

### 5. Optional: `.firebaseignore`

Create a `.firebaseignore` file to exclude unnecessary files from upload:

```
node_modules/
firebase-setup.md
```

---

## 1. Create a Firebase Project

1. Go to https://console.firebase.google.com
2. Click **Add project** → name it (e.g. `alex-blog`)
3. Disable Google Analytics if you don't need it → **Create project**

---

## 2. Enable Authentication

1. In the left sidebar → **Build → Authentication**
2. Click **Get started**
3. Under **Sign-in method**, enable **Email/Password**
4. Go to **Users** tab → **Add user** → enter your admin email + password

---

## 3. Create Firestore Database

1. In the left sidebar → **Build → Firestore Database**
2. Click **Create database**
3. Choose **Start in production mode** → select your region → **Enable**
4. Go to the **Rules** tab and paste these rules:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /posts/{postId} {
      allow read: if true;
      allow write: if request.auth != null;  // only admin can write

      // Public comments on each post — exact field set, sizes capped,
      // postId must match the parent, timestamp must be the server's
      match /comments/{comment} {
        allow read: if true;
        allow create: if request.resource.data.keys().hasOnly(['name','body','postId','createdAt'])
                      && request.resource.data.keys().hasAll(['name','body','postId','createdAt'])
                      && request.resource.data.name is string
                      && request.resource.data.name.size() >= 1
                      && request.resource.data.name.size() <= 80
                      && request.resource.data.body is string
                      && request.resource.data.body.size() >= 1
                      && request.resource.data.body.size() <= 2000
                      && request.resource.data.postId == postId
                      && request.resource.data.createdAt == request.time;
        // Admin can moderate (edit/remove spam); nobody else can touch
        allow update, delete: if request.auth != null;
      }
    }
    match /books/{doc} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    // Like/dislike counters — public read; writes limited to ±1 steps on
    // exactly the two counter fields, never negative, no deletes
    match /reactions/{postId} {
      allow read: if true;
      allow create: if request.resource.data.keys().hasOnly(['likes','dislikes'])
                    && request.resource.data.get('likes', 0) is int
                    && request.resource.data.get('dislikes', 0) is int
                    && request.resource.data.get('likes', 0) >= 0
                    && request.resource.data.get('likes', 0) <= 1
                    && request.resource.data.get('dislikes', 0) >= 0
                    && request.resource.data.get('dislikes', 0) <= 1;
      allow update: if request.resource.data.keys().hasOnly(['likes','dislikes'])
                    && request.resource.data.get('likes', 0) is int
                    && request.resource.data.get('dislikes', 0) is int
                    && request.resource.data.get('likes', 0) >= 0
                    && request.resource.data.get('dislikes', 0) >= 0
                    && (request.resource.data.get('likes', 0) - resource.data.get('likes', 0)) >= -1
                    && (request.resource.data.get('likes', 0) - resource.data.get('likes', 0)) <= 1
                    && (request.resource.data.get('dislikes', 0) - resource.data.get('dislikes', 0)) >= -1
                    && (request.resource.data.get('dislikes', 0) - resource.data.get('dislikes', 0)) <= 1;
      allow delete: if request.auth != null;
    }
    // Newsletter subscribers — public CREATE only (no overwrite/delete by
    // strangers), doc ID must equal a valid email, admin-only read
    match /subscribers/{email} {
      allow create: if request.resource.data.keys().hasOnly(['email','subscribedAt','source'])
                    && request.resource.data.email is string
                    && request.resource.data.email == email
                    && request.resource.data.email.size() <= 254
                    && request.resource.data.email.matches('^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$');
      allow update, delete: if request.auth != null;
      allow read: if request.auth != null;
    }
  }
}
```

> **Note:** with create-only subscriber rules, subscribing twice returns
> `permission-denied` — the blog page treats that as "already subscribed".
> After changing rules here, remember to re-publish them in
> Firebase Console → Firestore → Rules.

5. Click **Publish**

---

## 3b. Harden the API Key & Enable App Check

### Restrict the API key by HTTP referrer

1. Go to https://console.cloud.google.com → select project **calebnanigah-site**
2. **APIs & Services → Credentials**
3. Click the key named **"Browser key (auto created by Firebase)"**
4. Under **Application restrictions** → choose **Websites** → add:
   - `https://nanigahcaleb.com/*`
   - `https://*.nanigahcaleb.com/*`
   - `https://calebnanigah-site.web.app/*`
   - `https://calebnanigah-site.firebaseapp.com/*`
   - `http://localhost:*` (for local development — remove later if you want)
5. **Save** (takes ~5 minutes to propagate)

> Do NOT set "API restrictions" unless you know exactly which APIs to allow —
> missing "Identity Toolkit API" breaks admin login. Website restrictions alone
> are the safe win.

### Enable App Check (blocks bots writing comments/reactions)

1. Get a **reCAPTCHA v3** key pair at https://www.google.com/recaptcha/admin/create
   — choose *reCAPTCHA v3*, add domains `nanigahcaleb.com`,
   `calebnanigah-site.web.app`, `calebnanigah-site.firebaseapp.com`, `localhost`
2. Firebase Console → **App Check** → **Apps** → register your web app with the
   reCAPTCHA v3 **secret** key
3. Paste the reCAPTCHA **site** key into `APP_CHECK_SITE_KEY` in:
   `blog.html`, `books.html`, `post.html`, and `admin/index.html`
   (the activation code is already wired in each file)
4. Deploy, then watch App Check **metrics** for a few days in *unenforced* mode —
   verified-request % should approach 100%
5. Only then: App Check → **APIs** → **Cloud Firestore** → **Enforce**

> Enforcing too early blocks all traffic from pages/domains you forgot.
> For local dev after enforcement, add a **debug token**: App Check → your app →
> ⋮ → Manage debug tokens, and set
> `self.FIREBASE_APPCHECK_DEBUG_TOKEN = '<token>';` before the App Check
> activate call while developing.

---

## 4. Get Your Config Keys

1. In Firebase Console → click the **gear icon** → **Project settings**
2. Scroll to **Your apps** → click **</>** (Web) → register app → name it
3. Copy the `firebaseConfig` object

---

## 5. Add Config to admin.html

Open `admin.html` and replace the placeholder block:

```js
const firebaseConfig = {
  apiKey:            "YOUR_API_KEY",
  authDomain:        "YOUR_PROJECT_ID.firebaseapp.com",
  projectId:         "YOUR_PROJECT_ID",
  storageBucket:     "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId:             "YOUR_APP_ID"
};
```

with your actual values from step 4.

---

## 6. Open the Admin Panel

Open `admin.html` in your browser, sign in with the email/password you created in step 2.

---

## Collections Structure

### `posts`
| Field | Type | Example |
|---|---|---|
| title | string | "Shift-Left Testing..." |
| slug | string | "post-shift-left.html" |
| category | string | "qa" / "cyber" / "petro" |
| date | string | "2024-03-28" |
| readtime | number | 9 |
| excerpt | string | "Short description..." |
| gradient | string | "from-blue-500 to-indigo-600" |
| featured | boolean | true |

### `books`
| Field | Type | Example |
|---|---|---|
| title | string | "Clean Code" |
| author | string | "Robert C. Martin" |
| year | number | 2008 |
| status | string | "reading" / "finished" / "next" |
| progress | number | 62 |
| rating | number or null | 5 |
| tags | array | ["engineering", "productivity"] |
| note | string | "Changed how I write code..." |
| color | string | "from-zinc-700 to-zinc-900" |
