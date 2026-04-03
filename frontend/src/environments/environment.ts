export const environment = {
  production: false,
  apiUrl: "https://suchi-herbal-products.onrender.com/api",
  useMockData: false,
  appName: "Aurea",

  // ── Razorpay ──────────────────────────────────────────────────────────────
  // Get your test key from: https://dashboard.razorpay.com → Settings → API Keys
  // Use rzp_test_XXXXXXXX for test mode, rzp_live_XXXXXXXX for production
  razorpayKeyId: "rzp_test_SSgWpziSvtsSVu", // ← Replace with your test key

  // ── Firebase ─────────────────────────────────────────────────────────────
  // Fill these in from your Firebase project console (Project settings → Your apps → Web app)
  firebase: {
    // apiKey: "AIzaSyBRbbJG2gH66P6SSqxa5qkgyPyDrppYjIo",           // old: sichi-kids-ecommerce
    // authDomain: "sichi-kids-ecommerce.firebaseapp.com",           // old
    // projectId: "sichi-kids-ecommerce",                            // old
    // storageBucket: "sichi-kids-ecommerce.firebasestorage.app",    // old
    // messagingSenderId: "301213554201",                            // old
    // appId: "1:301213554201:web:131b24ac6252ba3029fc88",           // old
    // measurementId: "G-4EEGV21HJW",                               // old
    apiKey: "AIzaSyDwOXQXH5EyBTr0YERFRVsEsLyY3C9fy_Q",
    authDomain: "aurea-c47f9.firebaseapp.com",
    projectId: "aurea-c47f9",
    storageBucket: "aurea-c47f9.firebasestorage.app",
    messagingSenderId: "476876809170",
    appId: "1:476876809170:web:2c960a678db882c3f09e0b",
    measurementId: "G-Y8SR6XKMLG",
  },

  // Emails that are allowed to access /admin
  adminEmails: ["vishnudeekshit@gmail.com", "shankarsuchitra@gmail.com"],
};
