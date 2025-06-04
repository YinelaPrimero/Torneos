import { addDoc, getDocs, getDoc, doc, updateDoc, deleteDoc, arrayUnion, arrayRemove, collection } from "firebase/firestore";
import { db } from "../index.js";
import axios from 'axios'; 

async function crearEquipo(nombre, capitan, descripcion, logo, jugadores) {  
  try {
    const docRef = await addDoc(collection(db, "equipos"), {
      nombre: nombre,
      capitan: capitan,
      descripcion: descripcion,
      logo: logo,
      jugadores: jugadores || [],
    });

    console.log("El equipo fue creado con ID: ", docRef.id);
    return docRef.id;

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

async function actualizarEquipo(idEquipo, nombre, logo, descripcion, idUsuario) {
  try {
    const equipoRef = doc(db, "equipos", idEquipo);
    const equipoSnap = await getDoc(equipoRef);
    
    if (!equipoSnap.exists()) {
      throw new Error("Equipo no existe");
    }
    
    const equipoData = equipoSnap.data();

    // Validar que idUsuario sea el capitán
    if (equipoData.capitan !== idUsuario) {
      throw new Error("No autorizado: solo el capitán puede actualizar el equipo");
    }

    await updateDoc(equipoRef, { nombre, logo, descripcion });

    console.log("Equipo actualizado con ID: ", idEquipo);

  } catch (e) {
    console.error("Error actualizando equipo: ", e);
    throw e;  
  }
}

async function eliminarEquipo(idEquipo, idUsuario) {
  try {
    const equipoRef = doc(db, "equipos", idEquipo);
    const equipoSnap = await getDoc(equipoRef);

    if (!equipoSnap.exists()) {
      throw new Error("Equipo no existe");
    }

    const equipoData = equipoSnap.data();

    if (equipoData.capitan !== idUsuario) {
      throw new Error("No autorizado: solo el capitán puede eliminar el equipo");
    }

    await deleteDoc(equipoRef);

    console.log("Equipo eliminado con ID:", idEquipo);

  } catch (e) {
    console.error("Error al eliminar equipo:", e);
    throw e;  
  }
}

async function agregarJugador(idEquipo, idJugador, idUsuario) {
  try {
    const equipoRef = doc(db, "equipos", idEquipo);
    const equipoSnap = await getDoc(equipoRef);

    if (!equipoSnap.exists()) {
      throw new Error("Equipo no existe");
    }

    const equipoData = equipoSnap.data();

    if (equipoData.capitan !== idUsuario) {
      throw new Error("No autorizado: solo el capitán puede agregar jugadores");
    }

    await updateDoc(equipoRef, {
      jugadores: arrayUnion(idJugador)
    });

    console.log(`Jugador ${idJugador} agregado al equipo ${idEquipo}`);
  } catch (e) {
    console.error("Error agregando jugador:", e);
    throw e;
  }
}

async function eliminarJugador(idEquipo, idJugador, idUsuario) {
  try {
    const equipoRef = doc(db, "equipos", idEquipo);
    const equipoSnap = await getDoc(equipoRef);

    if (!equipoSnap.exists()) {
      throw new Error("Equipo no existe");
    }

    const equipoData = equipoSnap.data();

    if (equipoData.capitan !== idUsuario) {
      throw new Error("No autorizado: solo el capitán puede eliminar jugadores");
    }

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
      const response = await axios.get(`http://192.168.100.2:3003/usuarios/${jugadorId}`);
      const edad = response.data.edad;
      edades.push(edad);
    }

    return edades;
  } catch (error) {
    console.error("Error al obtener edades de los jugadores:", error);
    throw error;
  }
}

export {crearEquipo, consultarEquipos, consultarEquipo, actualizarEquipo, eliminarEquipo, agregarJugador, eliminarJugador, consultarJugadores, obtenerEdadesJugadores}; 
