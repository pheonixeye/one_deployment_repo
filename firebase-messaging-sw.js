// See this file for the latest firebase-js-sdk version:
// https://github.com/firebase/flutterfire/blob/main/packages/firebase_core/firebase_core_web/lib/src/firebase_sdk_version.dart
importScripts("https://www.gstatic.com/firebasejs/12.7.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/12.7.0/firebase-messaging-compat.js");

const config = {
    apiKey: 'AIzaSyAXAxPpvOuOnMQLd3W0mWebWd2cUJmtL5I',
    appId: '1:1085617843083:web:45c0f36a8b94dade601d8e',
    messagingSenderId: '1085617843083',
    projectId: 'proklinik-one',
    authDomain: 'proklinik-one.firebaseapp.com',
    storageBucket: 'proklinik-one.firebasestorage.app',
    measurementId: 'G-X9NLZ8X4LS',
};

firebase.initializeApp(config);

const messaging = firebase.messaging();

// Optional:
messaging.onBackgroundMessage((message) => {
    console.log("onBackgroundMessage", message);
});
