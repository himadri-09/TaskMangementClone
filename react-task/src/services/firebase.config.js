import { initializeApp } from "firebase/app";
import { initializeAuth } from 'firebase/auth';
import { getFirestore } from "firebase/firestore";

import { getAuth } from 'firebase/auth'


var firebaseConfig = {
    apiKey: "AIzaSyCPwOt2IkJD6xqansqYjl07xX9goQNzrpU",
    authDomain: "tasker-5080c.firebaseapp.com",
    projectId: "tasker-5080c",
    storageBucket: "tasker-5080c.appspot.com",
    messagingSenderId: "115177546960",
    appId: "1:115177546960:web:82ac989a6e073ab7ce2ad5"
};


const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);

// for user log in

export const auth = getAuth(app)

// export const au = firebase.auth();
// export const provider = new firebase.auth.GoogleAuthProvider();
// export const emailAuthProvider = firebase.auth.EmailAuthProvider;

