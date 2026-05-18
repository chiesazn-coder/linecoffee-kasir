import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCaFAjuH3N-LEfy50ANyIdPtoWkeZvOykI",
  authDomain: "linecoffee-db.firebaseapp.com",
  projectId: "linecoffee-db",
  storageBucket: "linecoffee-db.firebasestorage.app",
  messagingSenderId: "111679375461",
  appId: "1:111679375461:web:76b72ff11f800c615e1e8c"
};

// Inisialisasi Firebase
const app = initializeApp(firebaseConfig);

// Ekspor instance Firestore Database agar bisa dipakai di file lain
export const db = getFirestore(app);