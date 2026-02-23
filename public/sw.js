/* eslint-disable no-undef */

// --- Firebase Cloud Messaging (background) ---
// Usiamo le librerie compat per poter usare importScripts nel Service Worker.
importScripts("https://www.gstatic.com/firebasejs/10.12.5/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.5/firebase-messaging-compat.js");

// Deve combaciare con services/firebase.ts
firebase.initializeApp({
  apiKey: "AIzaSyAzpnTVb-AbFhTuuJU13lLU29Do1bHNFNE",
  authDomain: "pitugym-2d8a0.firebaseapp.com",
  projectId: "pitugym-2d8a0",
  storageBucket: "pitugym-2d8a0.firebasestorage.app",
  messagingSenderId: "526652949432",
  appId: "1:526652949432:web:6326f832672b828369854d",
  measurementId: "G-TDCFZCTFGM",
});

const messaging = firebase.messaging();

// Quando arriva un messaggio in background
messaging.onBackgroundMessage((payload) => {
  const title = payload?.notification?.title || payload?.data?.title || "PituGym";
  const body = payload?.notification?.body || payload?.data?.body || "Nuova notifica";
  const icon = payload?.notification?.icon || "/lion-icon.png";
  const link = payload?.fcmOptions?.link || payload?.data?.link || "/";

  self.registration.showNotification(title, {
    body,
    icon,
    badge: "/lion-icon.png",
    data: { url: link },
  });
});

// Click sulla notifica → apri il link
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification?.data?.url || "/";
  event.waitUntil(clients.openWindow(url));
});
