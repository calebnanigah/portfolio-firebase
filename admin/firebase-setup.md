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

      // Public comments on each post
      match /comments/{comment} {
        allow read: if true;
        allow create: if request.resource.data.keys().hasAll(['name','body','postId','createdAt'])
                      && request.resource.data.name is string
                      && request.resource.data.name.size() <= 80
                      && request.resource.data.body is string
                      && request.resource.data.body.size() <= 2000;
        allow update, delete: if false;
      }
    }
    match /books/{doc} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    // Like/dislike counters — public read, public increment-only writes
    match /reactions/{postId} {
      allow read: if true;
      allow write: if true;
    }
  }
}
```

5. Click **Publish**

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
