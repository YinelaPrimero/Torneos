import express from 'express';
import solicitudController from './controllers/solicitudController.js';  
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyA-dfwrleFFhghRJO2z12Pp5uqnK6Ct2zE",
  authDomain: "proyecto-torneos.firebaseapp.com",
  projectId: "proyecto-torneos",
  storageBucket: "proyecto-torneos.firebasestorage.app",
  messagingSenderId: "977844691436",
  appId: "1:977844691436:web:707685de9dd396962320c9"
};

const app = express();
const firebaseApp = initializeApp(firebaseConfig);
export const db = getFirestore(firebaseApp);


app.use(express.json());

app.use(solicitudController);

const PORT = 3004;
app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en el puerto ${PORT}`);
});