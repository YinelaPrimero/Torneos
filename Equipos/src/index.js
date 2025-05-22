import express from 'express';  
import equipoController from './controllers/equiposController.js';  // Importa tu controlador
import { initializeApp } from "firebase/app";  
import { getFirestore } from "firebase/firestore"; 
import cors from 'cors'; 

const firebaseConfig = {
  apiKey: "AIzaSyA-dfwrleFFhghRJO2z12Pp5uqnK6Ct2zE",
  authDomain: "proyecto-torneos.firebaseapp.com",
  projectId: "proyecto-torneos",
  storageBucket: "proyecto-torneos.firebasestorage.app",
  messagingSenderId: "977844691436",
  appId: "1:977844691436:web:707685de9dd396962320c9"
};

const app = express();  
app.use(cors());
app.use(express.json()) 
const firebaseApp = initializeApp(firebaseConfig);  
export const db = getFirestore(firebaseApp);  


app.use(express.json());

app.use(equipoController);  

const PORT = 3001;  
app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en el puerto ${PORT}`);
});