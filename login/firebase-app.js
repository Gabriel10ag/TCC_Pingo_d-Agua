import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";


const firebaseConfig = {
    apiKey: "AIzaSyDjbdj0Q2GLbTQZK4Qw-I2PZh2Foa0ObPI",
    authDomain: "fazendapingod-agua.firebaseapp.com",
    projectId: "fazendapingod-agua",
    storageBucket: "fazendapingod-agua.appspot.com",
    messagingSenderId: "273265835920",
    appId: "1:273265835920:web:4e7e5f50b13c44b4817d15"
};


const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);


export async function registerUser(email, password, fullName) {
    try {

        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        await updateProfile(user, { displayName: fullName });

        // Salva o nome completo no Firestore
        await setDoc(doc(db, 'users', user.uid), { fullName });

        return user;
    } catch (error) {
        throw new Error(error.message);
    }
}


export function loginUser(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
}