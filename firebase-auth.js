// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAtyefbXxpq2yKk5Ld9-0j1BZsOajq845s",
  authDomain: "apk-e6499.firebaseapp.com",
  databaseURL: "https://apk-e6499-default-rtdb.firebaseio.com",
  projectId: "apk-e6499",
  storageBucket: "apk-e6499.firebasestorage.app",
  messagingSenderId: "386830124267",
  appId: "1:386830124267:web:1e47ce44a0f0225c18eaae",
  measurementId: "G-EJRZ0XV2P5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const loginForm = document.getElementById('loginForm');
const errorMsg = document.getElementById('errorMsg');

if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();
    errorMsg.textContent = "";

    try {
      await signInWithEmailAndPassword(auth, email, password);
      window.location.href = "page.html"; // Redirection après connexion
    } catch (error) {
      errorMsg.textContent = "Erreur : " + (error.code === "auth/user-not-found" ? "Utilisateur inconnu" : 
        error.code === "auth/wrong-password" ? "Mot de passe incorrect" : 
        error.message);
    }
  });
}

// Redirection si déjà connecté
onAuthStateChanged(auth, (user) => {
  if (user && window.location.pathname.endsWith("login.html")) {
    window.location.href = "page.html";
  }
});