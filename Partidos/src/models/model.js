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
    const docRef = await addDoc(collection(db, 'partidos'), partido);
    console.log('Partido creado con ID:', docRef.id);
  } catch (e) {
    console.error('Error al crear el partido:', e);
    throw e;
  }
}

// Consultar partido por ID lógico (campo 'id')
async function consultarPartidoPorId(idBuscado) {
  try {
    const q = query(collection(db, 'partidos'), where('id', '==', idBuscado));
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
    const snapshot = await getDocs(collection(db, 'partidos'));
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (e) {
    console.error('Error al consultar partidos:', e);
    throw e;
  }
}

// Actualizar resultado
async function actualizarResultadoPartido(idBuscado, goles_local, goles_visitante, resultado) {
  try {
    const q = query(collection(db, 'partidos'), where('id', '==', idBuscado));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      const partidoRef = doc(db, 'partidos', snapshot.docs[0].id);
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
    const q = query(collection(db, 'partidos'), where('id', '==', idBuscado));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      const partidoRef = doc(db, 'partidos', snapshot.docs[0].id);
      await updateDoc(partidoRef, { estado });
    }
  } catch (e) {
    console.error('Error al actualizar estado:', e);
    throw e;
  }
}

// Consultar partidos por torneo
async function consultarPartidosPorTorneo(idTorneo) {
  try {
    const q = query(collection(db, 'partidos'), where('torneo', '==', idTorneo));
    const snapshot = await getDocs(q);
    const partidos = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    let torneoInfo = null;
    try {
      const response = await axios.get(`http://localhost:3002/torneos/${idTorneo}`);
      torneoInfo = response.data;
    } catch (e) {
      console.warn('No se pudo obtener info del torneo en el microservicio 3002');
    }

    return {
      torneo: torneoInfo,
      partidos,
    };
  } catch (e) {
    console.error('Error al consultar partidos por torneo:', e);
    throw e;
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
