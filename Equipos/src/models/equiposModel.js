import { addDoc, getDocs, getDoc, doc, updateDoc, deleteDoc, arrayUnion, arrayRemove, collection } from "firebase/firestore";
import { db } from "../index.js";
import axios from 'axios'; 

async function crearEquipo(id, nombre, capitan, jugadores) { 
    try {
        const docRef = await addDoc(collection(db, "equipos"), {
            id: id,
            nombre: nombre,
            capitan: capitan,           
            jugadores: jugadores || [], 
        });
        console.log("El equipo fue creado con ID: ", docRef.id);
    } catch (e) {
        console.error("Error al crear el equipo", e);
        throw e;  
    }
}

async function consultarEquipos() {
  try {
    const querySnapshot = await getDocs(collection(db, "equipos"));
    const response = querySnapshot.docs.map((doc) => ({
      id: doc.id, 
      ...doc.data()
    }));
    return response;
  } catch (e) {
    console.error("Error al consultar equipos: ", e);
    return [];
  }
}

async function consultarEquipo(id) {
    try {
        const docRef = doc(db, "equipos", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() };
        } else {
            console.log("No existe el documento con id:", id);
            return null; 
        }
    } catch (error) {
        console.error("Error al consultar equipo por id:", error);
        throw error;  
    }
}

async function actualizarEquipo(id, nombre) {
  try {
    const equipoRef = doc(db, "equipos", id);
    await updateDoc(equipoRef, { 
        nombre: nombre,
    });

    console.log("Equipo actualizado con ID: ", id);

  } catch (e) {
    console.error("Error actualizando equipo: ", e);
    throw e;  
  }
}

async function eliminarEquipo(id) {
  try {
    const equipoRef = doc(db, "equipos", id); 
    await deleteDoc(equipoRef);

    console.log("Equipo eliminado con ID:", id);
    
  } catch (e) {

    console.error("Error al eliminar equipo:", e);
    throw e;  
  }
}

async function agregarJugador(idEquipo, idJugador) {
  try {
    const equipoRef = doc(db, "equipos", idEquipo);
    await updateDoc(equipoRef, {
      jugadores: arrayUnion(idJugador)
    });
    console.log(`Jugador ${idJugador} agregado al equipo ${idEquipo}`);
  } catch (e) {
    console.error("Error agregando jugador:", e);
    throw e;
  }
}

async function eliminarJugador(idEquipo, idJugador) { //validar que el usuario que ejecuta esto sea el capitán
  try {
    const equipoRef = doc(db, "equipos", idEquipo);
    await updateDoc(equipoRef, {
      jugadores: arrayRemove(idJugador)
    });
    console.log(`Jugador ${idJugador} eliminado del equipo ${idEquipo}`);
  } catch (e) {
    console.error("Error eliminando jugador:", e);
    throw e;
  }
}

async function consultarJugadores(idEquipo) {
  try {
    const equipoRef = doc(db, "equipos", idEquipo);
    const equipoSnap = await getDoc(equipoRef);

    if (!equipoSnap.exists()) {
      console.log("Equipo no encontrado:", idEquipo);
      return null;
    }

    const data = equipoSnap.data();
    const jugadores = data.jugadores || [];
    const cantidad_jugadores = jugadores.length;

    return {
      jugadores,
      cantidad_jugadores,
    };
  } catch (error) {
    console.error("Error consultando jugadores:", error);
    throw error;
  }
}

async function obtenerEdadesJugadores(idEquipo) {
  try {
    const equipoRef = doc(db, "equipos", idEquipo);
    const equipoSnap = await getDoc(equipoRef);

    if (!equipoSnap.exists()) {
      return null; 
    }

    const data = equipoSnap.data();
    const jugadores = data.jugadores || [];

    const edades = [];

    for (const jugadorId of jugadores) {
      const response = await axios.get(`http://localhost:3003/usuarios/${jugadorId}`);
      const edad = response.data.edad;
      edades.push(edad);
    }

    return edades;
  } catch (error) {
    console.error("Error al obtener edades de los jugadores:", error);
    throw error;
  }
}

export { crearEquipo, consultarEquipos, consultarEquipo, actualizarEquipo, eliminarEquipo, agregarJugador, eliminarJugador, consultarJugadores, obtenerEdadesJugadores}; 
