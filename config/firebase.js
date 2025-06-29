// src/firebase.js
import { initializeApp } from "firebase/app";
import { getMessaging } from "firebase/messaging";

const firebaseConfig = {
    apiKey: "AIzaSyDus2GNczZZYOVeycPilBT3ZUga86ThVro",
    authDomain: "desarrollodeapp1-f8e65.firebaseapp.com",
    projectId: "desarrollodeapp1-f8e65",
    storageBucket: "desarrollodeapp1-f8e65.firebasestorage.app",
    messagingSenderId: "477147110154",
    appId: "1:477147110154:web:7e71eda3fd9aa8c1d6b8f3",
    measurementId: "G-5H7NVK4VS6"
};

const firebaseApp = initializeApp(firebaseConfig);
export const messaging = getMessaging(firebaseApp);
