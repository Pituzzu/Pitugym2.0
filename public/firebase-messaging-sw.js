importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyAzpnTVb-AbFhTuuJU13lLU29Do1bHNFNE",
  authDomain: "pitugym-2d8a0.firebaseapp.com",
  projectId: "pitugym-2d8a0",
  storageBucket: "pitugym-2d8a0.firebasestorage.app",
  messagingSenderId: "526652949432",
  appId: "1:526652949432:web:6326f832672b828369854d",
  measurementId: "G-TDCFZCTFGM"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/lion-icon.png'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
