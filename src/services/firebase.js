import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyAFKv5HlTVXy42UxQSMwjWShSSoXIXje6w",
  authDomain: "cafeteria-ff5e2.firebaseapp.com",
  databaseURL: "https://cafeteria-ff5e2-default-rtdb.firebaseio.com",
  projectId: "cafeteria-ff5e2",
  storageBucket: "cafeteria-ff5e2.firebasestorage.app",
  messagingSenderId: "550994694873",
  appId: "1:550994694873:web:2946fae710cf0c4d6e24c8",
  measurementId: "G-0E3LY6XHL9"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const database = getDatabase(app);

export { database };
