/**
 * Firebase Configuration
 *
 * IMPORTANT: Replace the values below with your actual Firebase project configuration.
 *
 * To get your config:
 * 1. Go to https://console.firebase.google.com
 * 2. Select your project (mlff-equipment-tracking)
 * 3. Click the gear icon ⚙️ > Project settings
 * 4. Scroll to "Your apps" section
 * 5. Click the web icon </> if you haven't created a web app yet
 * 6. Copy the firebaseConfig object
 */

const firebaseConfig = {
  apiKey: "YOUR_API_KEY_HERE",
  authDomain: "mlff-equipment-tracking.firebaseapp.com",
  projectId: "mlff-equipment-tracking",
  storageBucket: "mlff-equipment-tracking.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Firebase services
const db = firebase.firestore();
const storage = firebase.storage();
const auth = firebase.auth();

console.log('Firebase initialized successfully');
