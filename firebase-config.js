// ============================================================================
// FIREBASE CONFIG — REPLACE WITH YOUR OWN PROJECT'S VALUES
// ============================================================================
// How to get these values:
//   1. Go to https://console.firebase.google.com -> "Add project"
//      (you can disable Google Analytics for this project, not needed)
//   2. Inside the project, click the "</>" (web) icon to register a new web app
//      - Give it a nickname like "turo-ops"
//      - You do NOT need Firebase Hosting (we're using GitHub Pages)
//   3. Firebase will show you a `firebaseConfig` object — copy those values
//      into the object below (apiKey, authDomain, projectId, etc).
//   4. In the left sidebar go to Build -> Firestore Database -> "Create database"
//      - Choose "Start in test mode" (test-mode rules are provided in
//        firestore.rules in this repo — paste them into the Rules tab)
//      - Pick any region close to you (e.g. us-central, or nam5)
//
// This file is safe to commit to a public repo. Firebase web config values
// are not secret — they identify your project, not authenticate access.
// Actual data access is controlled by Firestore Security Rules
// (see firestore.rules / firestore.rules.locked), not by hiding this file.
// ============================================================================

window.FIREBASE_CONFIG = {
  apiKey: "REPLACE_WITH_YOUR_API_KEY",
  authDomain: "REPLACE_WITH_YOUR_PROJECT.firebaseapp.com",
  projectId: "REPLACE_WITH_YOUR_PROJECT_ID",
  storageBucket: "REPLACE_WITH_YOUR_PROJECT.appspot.com",
  messagingSenderId: "REPLACE_WITH_YOUR_SENDER_ID",
  appId: "REPLACE_WITH_YOUR_APP_ID"
};

// Firestore document path: all app data lives in a single document so the
// whole state can be read/written/synced in one go, same shape as the old
// window.storage keys.
//   collection: "turoOps"
//   document:   "state"
// If you ever run multiple fleets/households from one Firebase project,
// change docId below to something unique per fleet (e.g. "state-garage2").
window.FIREBASE_DOC_PATH = { collection: "turoOps", docId: "state" };
