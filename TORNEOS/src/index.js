import express from 'express';
import cors from 'cors';   // <-- Importa cors
import torneoController from './controllers/torneosController.js';  
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

// Agrega CORS aquí, justo después de crear app y antes de rutas y otros middlewares
app.use(cors({
  origin: ['http://127.0.0.1:5500', 'http://192.168.100.2:5500'], // Orígenes permitidos
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

app.use(express.json());

app.use(torneoController);

const PORT = 3002;
app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en el puerto ${PORT}`);
});
