export const environment = {
  production: false,
  apiUrl: "http://localhost:4000/api",
  useMockData: false,
  appName: "Veda",

  // ── Razorpay ──────────────────────────────────────────────────────────────
  // Get your test key from: https://dashboard.razorpay.com → Settings → API Keys
  // Use rzp_test_XXXXXXXX for test mode, rzp_live_XXXXXXXX for production
  razorpayKeyId: "rzp_test_SSgWpziSvtsSVu", // ← Replace with your test key

  // ── Firebase ─────────────────────────────────────────────────────────────
  // Fill these in from your Firebase project console (Project settings → Your apps → Web app)
  firebase: {
    apiKey: "AIzaSyBRbbJG2gH66P6SSqxa5qkgyPyDrppYjIo",
    authDomain: "sichi-kids-ecommerce.firebaseapp.com",
    projectId: "sichi-kids-ecommerce",
    storageBucket: "sichi-kids-ecommerce.firebasestorage.app",
    messagingSenderId: "301213554201",
    appId: "1:301213554201:web:131b24ac6252ba3029fc88",
    measurementId: "G-4EEGV21HJW",
  },

  // Emails that are allowed to access /admin
  adminEmails: ["vishnudeekshit@gmail.com", "shankarsuchitra@gmail.com"],
};
