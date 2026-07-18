# Turo Ops

A single-page Turo fleet operations tracker: vehicle maintenance (with due-date
calculations), vehicle notes/warranty/insurance tracking, profit tracking with
Turo CSV earnings import, cohost financials with split calculations and
share/export, fleet financials, and JSON backup/restore. Dark theme, installs
as a home-screen app on iPhone/iPad.

Data is stored in **Firestore** (Firebase's database) as the source of truth,
with **localStorage** as an offline fallback/cache and a live listener so
edits on one device show up on another within seconds.

## Files in this folder

```
index.html              the whole app (HTML + CSS + JS, no build step)
manifest.json            PWA manifest (name, icons, standalone display)
sw.js                    service worker — caches the app shell for offline loads
firebase-config.js       Firebase project config — YOU fill this in
icon-source.svg          source icon — convert to the PNGs listed below
firestore.rules          test-mode security rules (quick start, expires in 30 days)
firestore.rules.locked   locked-down rules (Anonymous Auth) — switch to this once working
```

Before pushing to GitHub, arrange the files into this structure (GitHub Pages
serves straight from the repo root, no build step):

```
turo-ops/
  index.html
  manifest.json
  sw.js
  firebase-config.js
  icons/
    icon-192.png
    icon-512.png
    icon-512-maskable.png
    icon-180.png          (apple-touch-icon)
  firestore.rules
  firestore.rules.locked
  README.md
```

I generated `icon-source.svg` but couldn't rasterize it to PNG from this
session (no shell access on this device). Two easy ways to get the four PNGs
above from `icon-source.svg`:

- **Online, zero install:** upload `icon-source.svg` to
  [realfavicongenerator.net](https://realfavicongenerator.net) or
  [cloudconvert.com/svg-to-png](https://cloudconvert.com/svg-to-png) and
  export at 192, 512 (x2, one with extra padding for "maskable"), and 180px.
- **Locally, if you have ImageMagick** (`brew install imagemagick` on a Mac):
  ```
  magick icon-source.svg -resize 192x192 icons/icon-192.png
  magick icon-source.svg -resize 512x512 icons/icon-512.png
  magick icon-source.svg -resize 512x512 icons/icon-512-maskable.png
  magick icon-source.svg -resize 180x180 icons/icon-180.png
  ```
Until those PNGs exist, the app itself works fine — you'll just get a generic
icon on the home screen instead of the custom one.

---

## 1. Firebase (Firestore) setup — do this first

1. Go to [console.firebase.google.com](https://console.firebase.google.com) →
   **Add project**. Name it anything (e.g. `turo-ops`). You can decline
   Google Analytics — not needed.
2. Once the project is created, click the **`</>`** (web) icon on the project
   overview page to register a web app. Nickname it `turo-ops`. You do **not**
   need Firebase Hosting — we're using GitHub Pages instead.
3. Firebase shows you a `firebaseConfig` object that looks like:
   ```js
   const firebaseConfig = {
     apiKey: "AIza...",
     authDomain: "turo-ops-xxxxx.firebaseapp.com",
     projectId: "turo-ops-xxxxx",
     storageBucket: "turo-ops-xxxxx.appspot.com",
     messagingSenderId: "...",
     appId: "..."
   };
   ```
   Copy those six values into `firebase-config.js` in this folder, replacing
   the `REPLACE_WITH_...` placeholders. Paste the real config back to me here
   too if you want me to double check it or wire up the locked-rules variant.
4. In the left sidebar: **Build → Firestore Database → Create database**.
   - Choose **Start in test mode**.
   - Pick any region close to you (e.g. `nam5` / `us-central`).
5. Still in Firestore, go to the **Rules** tab, and paste in the contents of
   `firestore.rules` from this folder (it's the same test-mode rule Firebase
   just generated for you, just with a visible expiry date you can track).
   Click **Publish**.

That's it for Firebase — the app will now sync through Firestore once the
config values are real. Until you fill them in, the app quietly runs on
localStorage only and shows an amber banner saying cloud sync isn't set up.

## 2. GitHub Pages setup

You said you'll create the repo yourself — here's exactly what to run once
you've got these files locally (adjust the path to wherever you saved them).

**Option A — GitHub CLI (`gh`), if you have it installed:**
```bash
cd /path/to/turo-ops
git init
git add .
git commit -m "Initial commit: Turo Ops with Firestore sync"
gh repo create turo-ops --public --source=. --remote=origin --push
gh api -X PUT repos/:owner/turo-ops/pages -f "source[branch]=main" -f "source[path]=/"
```
That last command turns on Pages serving from the repo root of `main`. If it
errors because Pages needs to be enabled via the API differently on your
account, just do it from the UI instead (Option B, step 4).

**Option B — github.com/new, then push manually:**
1. Go to [github.com/new](https://github.com/new), name the repo `turo-ops`,
   set it to **Public**, don't initialize with a README (you already have
   one here).
2. Locally:
   ```bash
   cd /path/to/turo-ops
   git init
   git add .
   git commit -m "Initial commit: Turo Ops with Firestore sync"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/turo-ops.git
   git push -u origin main
   ```
3. On the repo page: **Settings → Pages**.
4. Under "Build and deployment", set **Source: Deploy from a branch**,
   **Branch: main**, folder **`/ (root)`**. Save.
5. GitHub will give you a URL like `https://YOUR_USERNAME.github.io/turo-ops/`
   — that's your live app. It can take a minute or two to go live the first
   time.

Add that URL to your iPhone/iPad home screen: open it in Safari → Share →
**Add to Home Screen**. Because of the manifest + apple-mobile-web-app meta
tags in `index.html`, it launches full-screen (no Safari address bar) like a
native app.

## 3. Confirm it's working

- Open the deployed URL, add a vehicle, log a service.
- Open the same URL on a second device (or a private browsing window) — the
  vehicle should appear within a few seconds without refreshing, proving the
  Firestore `onSnapshot` live sync is working.
- Turn on airplane mode, make an edit, turn it back on — the edit should
  sync once you're back online (Firestore's own offline persistence plus the
  localStorage cache both back this up).
- Try **Backup** in the bottom bar — it should download/share a `.json` file
  with your data. Keep doing this occasionally regardless of cloud sync; it's
  your ground-truth copy if anything ever goes sideways with the Firebase
  project itself (e.g. you delete it by accident).

## 4. Switch to locked-down rules (recommended, once step 3 works)

Test-mode rules (`firestore.rules`) allow **anyone who knows your
`projectId`** to read/write your Firestore data, and your `projectId` is
visible in `firebase-config.js`, which is sitting in a public GitHub repo.
Realistically nobody's going to stumble onto it, but it's a straightforward
fix, so it's worth doing once you've confirmed everything works.

1. **Enable Anonymous Auth:** Firebase console → **Build → Authentication →
   Get started** → **Sign-in method** tab → enable **Anonymous** → Save.
2. **Publish the locked rules:** Firestore → Rules tab → replace the contents
   with `firestore.rules.locked` from this folder → Publish.
3. **Add sign-in to the app.** In `index.html`, add the Auth SDK script tag
   next to the existing Firestore one:
   ```html
   <script src="https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js"></script>
   <script src="https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore-compat.js"></script>
   <script src="https://www.gstatic.com/firebasejs/10.14.1/firebase-auth-compat.js"></script>
   <script src="firebase-config.js"></script>
   ```
   Then, inside the main `<script>` block, right after `docRef = db.collection(...)` is
   set up (in the `if(hasCloudConfig){ ... }` block near the top), add:
   ```js
   firebase.auth().signInAnonymously().catch(err => {
     console.warn('Anonymous sign-in failed', err);
     cloudStatus = 'unavailable';
   });
   ```
   That's the only code change needed — the rest of the persistence layer
   (`save`, `attachCloudListener`, etc.) already just uses `docRef` and
   doesn't care whether the underlying request is authenticated.
4. Reload the app on each of your devices once — each one silently gets its
   own anonymous Firebase identity the first time it loads, then behaves
   exactly as before.

If you want, paste your real `firebaseConfig` back to me once you've got it
and I'll make this edit for you directly instead of doing it by hand.

## Notes

- All app data (vehicles, maintenance log, profit entries, cohost/fleet
  financials, recurring expenses) lives in **one Firestore document**
  (`turoOps/state`), same shape as the old localStorage keys. That's simple
  and plenty fast for a personal/small fleet's worth of data — Firestore
  documents can hold up to 1MB, which is a lot of maintenance records.
- If you ever want to track more than one fleet/household from the same
  Firebase project, change `docId` in `firebase-config.js` to something
  unique per fleet (e.g. `state-garage2`) and deploy a second copy of the
  site pointing at that config.
- The CSV import logic (Turo earnings export → monthly profit entries) is
  unchanged from the original — it looks for columns containing
  "vehicle"/"car", "trip earnings"/"earnings"/"payout"/"total", and "start
  date"/"trip date"/"date".
