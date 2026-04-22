import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAIRdkZV2LYXiUTIj8HOifWvwy-ldNawdQ",
  authDomain: "spasiobrok.firebaseapp.com",
  projectId: "spasiobrok",
  storageBucket: "spasiobrok.firebasestorage.app",
  messagingSenderId: "640149044788",
  appId: "1:640149044788:web:1d1e00ef9db9dccb86d461",
  measurementId: "G-3TDJ8G9SFP"
};

const app = initializeApp(firebaseConfig);

// Initialize Analytics safely (in case it's not supported in some environments/iframes)
isSupported().then(supported => {
  if (supported) {
    getAnalytics(app);
  }
});

// Since user config doesn't have firestoreDatabaseId, we use the default
export const db = getFirestore(app);
export const auth = getAuth(app);

const provider = new GoogleAuthProvider();
provider.setCustomParameters({
  prompt: 'select_account'
});

export const loginWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (err: any) {
    console.warn("Google auth failed:", err.code, err.message);
    
    // Handled specific popup errors
    if (err.code === 'auth/popup-blocked') {
      alert("Skočni prozor za prijavu je blokiran. Pojavit će se u adresnoj traci 'Pop-up blocked', molimo Vas dozvolite ga ili otvorite aplikaciju u novom tabu.");
    } 
    else if (err.code === 'auth/cancelled-popup-request' || err.code === 'auth/popup-closed-by-user') {
      console.warn("Korisnik je ranije ugasio prozor za prijavu.");
    }
    else if (err.code === 'auth/unauthorized-domain') {
       alert("Prijava odbijena. Vaša trenutna web adresa (domena) nije odobrena unutar Firebase Konzole. Dodajte ovu web adresu u Firebase -> Authentication -> Settings -> Authorized domains.");
    }
    else if (err.message?.includes('Pending promise was never set')) {
       // This is a known internal React/Firebase strict mode glitch usually fixed by just retrying or unmounting
       console.warn("Firebase internal assertion glitch ignored.");
    } 
    else {
      alert("Greška pri prijavi: " + err.message);
    }
    return null;
  }
};

export const logout = async () => {
  try {
    await signOut(auth);
  } catch (err) {
    console.error(err);
  }
};
