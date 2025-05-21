import { db } from "../index.js";
import {
  collection,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  doc,
  arrayUnion
} from "firebase/firestore";

// Crear Torneo
async function crearTorneo(data) {
  try {
    const docRef = await addDoc(collection(db, "torneos"), {
      id: data.id,
      nombre: data.nombre,
      descripcion: data.descripcion,
      edad_minima: data.edad_minima,
      sexo_biologico: data.sexo_biologico,
      fecha_inicio: data.fecha_inicio,
      fecha_fin: data.fecha_fin,
      num_equipos_permitidos: data.num_equipos_permitidos,
      tipo_torneo: data.tipo_torneo,
      estado: data.estado,
      equipos_inscritos: [],
      clasificación: []
    });
    console.log("El torneo fue creado con ID: ", docRef.id);
  } catch (e) {
    console.error("Error al crear el torneo", e);
  }
}

// Consultar todos los torneos
async function consultarTorneos() {
  try {
    const querySnapshot = await getDocs(collection(db, "torneos"));
    const response = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    }));
    return response;
  } catch (e) {
    console.error("Error al consultar torneos: ", e);
    return [];
  }
}

// Consultar torneo por ID
async function consultarTorneo(id) {
  try {
    const torneoRef = doc(db, "torneos", id);
    const docSnap = await getDoc(torneoRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      throw new Error("Torneo no encontrado");
    }
  } catch (e) {
    console.error("Error al consultar el torneo: ", e);
    return null;
  }
}

// Actualizar torneo
async function actualizarTorneo(id, data) {
  try {
    const torneoRef = doc(db, "torneos", id);
    await updateDoc(torneoRef, {
      nombre: data.nombre,
      descripcion: data.descripcion,
      edad_minima: data.edad_minima,
      sexo_biologico: data.sexo_biologico,
      fecha_inicio: data.fecha_inicio,
      fecha_fin: data.fecha_fin,
      num_equipos_permitidos: data.num_equipos_permitidos,
      tipo_torneo: data.tipo_torneo,
      estado: data.estado
    });
  } catch (e) {
    console.error("Error al actualizar el torneo", e);
  }
}

// Actualizar resultados / clasificación
async function actualizarResultados(id, clasificacion) {
  try {
    const torneoRef = doc(db, "torneos", id);
    await updateDoc(torneoRef, {
      clasificación: clasificacion
    });
  } catch (e) {
    console.error("Error al actualizar resultados", e);
  }
}

// Añadir equipo al torneo
async function añadirEquipoTorneo(id, equipoId) {
  try {
    const torneoRef = doc(db, "torneos", id);
    await updateDoc(torneoRef, {
      equipos_inscritos: arrayUnion(equipoId)
    });
  } catch (e) {
    console.error("Error al añadir equipo al torneo", e);
  }
}

// Consultar equipos inscritos en un torneo
async function consultarEquiposInscritos(id) {
  try {
    const torneoRef = doc(db, "torneos", id);
    const docSnap = await getDoc(torneoRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      return data.equipos_inscritos || [];
    } else {
      throw new Error("Torneo no encontrado");
    }
  } catch (e) {
    console.error("Error al consultar equipos inscritos", e);
    return [];
  }
}

export {
  crearTorneo,
  consultarTorneos,
  consultarTorneo,
  actualizarTorneo,
  actualizarResultados,
  añadirEquipoTorneo,
  consultarEquiposInscritos
};
