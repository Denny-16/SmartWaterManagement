// src/firebase.js
import { initializeApp } from "firebase/app";

import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyCZXeRx4hcTVMkpW1Q0nZecotSqcrv-Kuo",
  authDomain: "fir-b3428.firebaseapp.com",
  projectId: "fir-b3428",
  storageBucket: "fir-b3428.firebasestorage.app",
  messagingSenderId: "411105537603",
  appId: "1:411105537603:web:10527d6d1c70a9f77b6ef6",
  measurementId: "G-7DD2YXSPC8",
  databaseURL: "https://fir-b3428-default-rtdb.firebaseio.com"
};

const app = initializeApp(firebaseConfig);

export const db = getDatabase(app)

