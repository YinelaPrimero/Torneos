import { addDoc, getDoc, getDocs, doc, collection, query, where, updateDoc } from "firebase/firestore";
import { db } from "../index.js";

// Crear una nueva solicitud
async function crearSolicitud(id, id_jugador, id_equipo, estado) {
  try {
    const docRef = await addDoc(collection(db, "solicitudes"), {
      id_jugador: id_jugador,
      id_equipo: id_equipo,
      estado: estado
    });

     await updateDoc(docRef, { id: docRef.id });
    console.log("Solicitud creada con ID:", docRef.id);
  } catch (e) {
    console.error("Error al crear la solicitud:", e);
  }
}

// Consultar una solicitud por ID
async function consultarSolicitudPorId(id) {
  try {
    const snapshot = await getDocs(query(collection(db, "solicitudes"), where("id", "==", id)));
    const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return docs.length > 0 ? docs[0] : null;
  } catch (e) {
    console.error("Error al consultar la solicitud:", e);
    return null;
  }
}

// Consultar todas las solicitudes de un equipo
async function consultarSolicitudesPorEquipo(id_equipo) {
  try {
    const q = query(collection(db, "solicitudes"), where("id_equipo", "==", id_equipo));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (e) {
    console.error("Error al consultar solicitudes del equipo:", e);
    return [];
  }
}

// Actualizar el estado de una solicitud
async function actualizarEstadoSolicitud(id, nuevoEstado) {
  try {
    const snapshot = await getDocs(query(collection(db, "solicitudes"), where("id", "==", id)));
    if (snapshot.empty) throw new Error("Solicitud no encontrada");

    const solicitudDoc = snapshot.docs[0];
    const docRef = doc(db, "solicitudes", solicitudDoc.id);
    await updateDoc(docRef, { estado: nuevoEstado });
    console.log("Estado de la solicitud actualizado a:", nuevoEstado);
  } catch (e) {
    console.error("Error al actualizar el estado de la solicitud:", e);
  }
}

export {
  crearSolicitud,
  consultarSolicitudPorId,
  consultarSolicitudesPorEquipo,
  actualizarEstadoSolicitud
};
