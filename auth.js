import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyDRf3Q_-D7nsVIPKSxxIm78rz1Nn5QY1cQ",
  authDomain: "settecollisite.firebaseapp.com",
  projectId: "settecollisite",
  storageBucket: "settecollisite.appspot.com",
  messagingSenderId: "928590715316",
  appId: "1:928590715316:web:031eae061e38bd5ef9bae1"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const loginIcon = document.getElementById("user-icon");
const dropdown = document.getElementById("user-dropdown");

onAuthStateChanged(auth, (user) => {
  if (user) {
    loginIcon.addEventListener("click", (e) => {
      e.preventDefault();
      dropdown.style.display = dropdown.style.display === "block" ? "none" : "block";
    });
  } else {
    loginIcon.setAttribute("href", "login.html");
  }
});

window.logout = function () {
  signOut(auth).then(() => {
    window.location.href = "index.html";
  });
};
