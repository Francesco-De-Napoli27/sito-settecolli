import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

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
const db = getFirestore(app);

let currentUser = null;

/**
 * 🔐 Stato di autenticazione globale
 */
onAuthStateChanged(auth, (user) => {
  currentUser = user;
});

/**
 * 👉 Click su "Gestione account"
 */
window.goToAccount = async function () {
  if (!currentUser) {
    window.location.href = "login.html";
    return;
  }

  const snap = await getDoc(doc(db, "users", currentUser.uid));
  if (!snap.exists()) {
    alert("Profilo utente non trovato");
    return;
  }

  const { ruolo } = snap.data();

  switch (ruolo) {
    case "admin":
      window.location.href = "admin.html";
      break;
    case "dirigente":
      window.location.href = "area-dirigente.html";
      break;
    case "allenatore":
      window.location.href = "area-allenatore.html";
      break;
    case "atleta":
      window.location.href = "area-atleta.html";
      break;
    case "tifoso":
      window.location.href = "area-tifoso.html";
      break;
    default:
      alert("Ruolo non valido");
  }
};

/**
 * 👉 Logout
 */
window.logout = function () {
  signOut(auth).then(() => {
    window.location.href = "index.html";
  });
};
