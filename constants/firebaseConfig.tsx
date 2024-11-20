// firebaseConfig.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyCBEdQbJhRQ_h4_rD_ErCyEplzdhCeQj-o',
  authDomain: 'cuoiky-48fab.firebaseapp.com',
  projectId: 'cuoiky-48fab',
  storageBucket: 'cuoiky-48fab.firebasestorage.app',
  messagingSenderId: '612708969652',
  appId: '1:612708969652:web:1cd1ebeb08cfcde5d9bbe1',
  measurementId: 'G-F50Z6HBHP3',
};
const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
