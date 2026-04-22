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
    console.error("Google auth failed:", err);
    if (err.code === 'auth/popup-blocked') {
      alert("Please allow popups to sign in with Google.");
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
