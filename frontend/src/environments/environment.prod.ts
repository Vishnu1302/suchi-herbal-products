export const environment = {
  production: true,
  // Backend deployed on Render — replace with your actual Render URL after deploy
  apiUrl: "https://suchi-herbal-products.onrender.com/api",
  useMockData: false,
  appName: "Aurea",

  // ── Razorpay (LIVE mode) ──────────────────────────────────────────────────
  // Replace with your live key from Razorpay Dashboard → Settings → API Keys → Live
  razorpayKeyId: "rzp_live_REPLACE_WITH_LIVE_KEY",

  // ── Firebase ─────────────────────────────────────────────────────────────
  firebase: {
    apiKey: "AIzaSyDwOXQXH5EyBTr0YERFRVsEsLyY3C9fy_Q",
    authDomain: "aurea-c47f9.firebaseapp.com",
    projectId: "aurea-c47f9",
    storageBucket: "aurea-c47f9.firebasestorage.app",
    messagingSenderId: "476876809170",
    appId: "1:476876809170:web:2c960a678db882c3f09e0b",
    measurementId: "G-Y8SR6XKMLG",
  },

  adminEmails: ["vishnudeekshit@gmail.com", "shankarsuchitra@gmail.com"],
};
