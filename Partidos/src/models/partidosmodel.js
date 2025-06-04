import { db } from '../index.js';
import axios from 'axios';
import {
  addDoc,
  getDocs,
  doc,
  collection,
  query,
  where,
  updateDoc,
} from 'firebase/firestore';

// Crear un partido
async function crearPartido(partido) {
  try {
    const docRef = await addDoc(collection(db, 'Partidos'), partido);
    console.log('Partido creado con ID:', docRef.id);
  } catch (e) {
    console.error('Error al crear el partido:', e);
    throw e;
  }
}

// Consultar partido por ID lÃ³gico (campo 'id')
async function consultarPartidoPorId(idBuscado) {
  try {
    const q = query(collection(db, 'Partidos'), where('id', '==', idBuscado));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
    }
    return null;
  } catch (e) {
    console.error('Error al consultar partido por ID:', e);
    throw e;
  }
}

// Consultar todos los partidos
async function consultarPartidos() {
  try {
    const snapshot = await getDocs(collection(db, 'Partidos'));
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (e) {
    console.error('Error al consultar partidos:', e);
    throw e;
  }
}

// Actualizar resultado
async function actualizarResultadoPartido(idBuscado, goles_local, goles_visitante, resultado) {
  try {
    const q = query(collection(db, 'Partidos'), where('id', '==', idBuscado));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      const partidoRef = doc(db, 'Partidos', snapshot.docs[0].id);
      await updateDoc(partidoRef, { goles_local, goles_visitante, resultado });
    }
  } catch (e) {
    console.error('Error al actualizar resultado:', e);
    throw e;
  }
}

// Actualizar estado
async function actualizarEstadoPartido(idBuscado, estado) {
  try {
    const q = query(collection(db, 'Partidos'), where('id', '==', idBuscado));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      const partidoRef = doc(db, 'Partidos', snapshot.docs[0].id);
      await updateDoc(partidoRef, { estado });
    }
  } catch (e) {
    console.error('Error al actualizar estado:', e);
    throw e;
  }
}

// Consultar partidos por torneo
// Consultar partidos por torneo (y equipos inscritos)


// Consultar equipos inscritos desde microservicio de torneos


async function consultarPartidosPorTorneo(idTorneo) {
  try {
    const response = await axios.get(`http://192.168.100.2:3002/torneos/${idTorneo}/equipos`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener equipos inscritos:', error.message);
    throw new Error('No se pudieron obtener los equipos inscritos');
  }
}





export {
  crearPartido,
  consultarPartidoPorId,
  consultarPartidos,
  actualizarResultadoPartido,
  actualizarEstadoPartido,
  consultarPartidosPorTorneo,
};