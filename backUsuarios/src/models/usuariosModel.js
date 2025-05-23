import { addDoc, getDocs, getDoc, updateDoc, deleteDoc, doc, collection, query, where } from "firebase/firestore";
import { db } from "../index.js";

async function crearUsuario(data) {
    try {
        const docRef = await addDoc(collection(db, "usuarios"), {
            nombre: data.nombre,
            apellido: data.apellido || "",
            email: data.email || "",
            foto: data.foto || "",
            edad: data.edad || null,
            sexo_biologico: data.sexo_biologico || null,
            descripcion: data.descripcion || "",
            posicion: data.posicion || "",
            goles: data.goles || 0,
            contacto: data.contacto || "",
            ubicacion: data.ubicacion || "",
            eps: data.eps || "",
            tipo_sangre: data.tipo_sangre || "",
            contacto_emergencia: data.contacto_emergencia || "",
            password: data.password || "",
            isAdmin: data.isAdmin || false,
            fecha_nacimiento: data.fecha_nacimiento || "",
            alergias: data.alergias || "",
            equipo: data.equipo || ""
        });
        console.log("El usuario fue creado con ID: ", docRef.id);
        return docRef.id;
    } catch (e) {
        console.error("Error al crear el usuario: ", e);
        throw e;
    }
}

async function consultarUsuarios() {
    try {
        const querySnapshot = await getDocs(collection(db, "usuarios"));
        const response = querySnapshot.docs.map(doc => ({
            id: doc.id, // Ensure the Firebase document ID is used
            ...doc.data()
        }));
        return response;
    } catch (e) {
        console.error("Error al consultar usuarios: ", e);
        return [];
    }
}

async function consultarUsuarioPorId(id) {
    try {
        const docRef = doc(db, "usuarios", id);
        const docSnap = await getDoc(docRef);
        if (!docSnap.exists()) {
            return null;
        }
        return { id: docSnap.id, ...docSnap.data() };
    } catch (e) {
        console.error("Error al consultar usuario: ", e);
        throw e;
    }
}

async function actualizarUsuario(id, data) {
    try {
        const docRef = doc(db, "usuarios", id);
        const updateData = {};
        if (data.nombre !== undefined) updateData.nombre = data.nombre;
        if (data.apellido !== undefined) updateData.apellido = data.apellido;
        if (data.email !== undefined) updateData.email = data.email;
        if (data.foto !== undefined) updateData.foto = data.foto;
        if (data.edad !== undefined) updateData.edad = data.edad;
        if (data.sexo_biologico !== undefined) updateData.sexo_biologico = data.sexo_biologico;
        if (data.descripcion !== undefined) updateData.descripcion = data.descripcion;
        if (data.posicion !== undefined) updateData.posicion = data.posicion;
        if (data.goles !== undefined) updateData.goles = data.goles;
        if (data.contacto !== undefined) updateData.contacto = data.contacto;
        if (data.ubicacion !== undefined) updateData.ubicacion = data.ubicacion;
        if (data.eps !== undefined) updateData.eps = data.eps;
        if (data.tipo_sangre !== undefined) updateData.tipo_sangre = data.tipo_sangre;
        if (data.contacto_emergencia !== undefined) updateData.contacto_emergencia = data.contacto_emergencia;
        if (data.password !== undefined) updateData.password = data.password;
        if (data.isAdmin !== undefined) updateData.isAdmin = data.isAdmin;
        if (data.fecha_nacimiento !== undefined) updateData.fecha_nacimiento = data.fecha_nacimiento;
        if (data.alergias !== undefined) updateData.alergias = data.alergias;
        if (data.equipo !== undefined) updateData.equipo = data.equipo;

        await updateDoc(docRef, updateData);
        console.log("Usuario actualizado con ID: ", id);
    } catch (e) {
        console.error("Error al actualizar usuario: ", e);
        throw e;
    }
}

async function eliminarUsuario(id) {
    try {
        const docRef = doc(db, "usuarios", id);
        await deleteDoc(docRef);
        console.log("Usuario eliminado con ID: ", id);
    } catch (e) {
        console.error("Error al eliminar usuario: ", e);
        throw e;
    }
}

async function verificarEmailUnico(email, excludeId = null) {
    try {
        const q = query(collection(db, "usuarios"), where("email", "==", email));
        const querySnapshot = await getDocs(q);
        if (querySnapshot.empty) {
            return false;
        }
        if (excludeId) {
            return querySnapshot.docs.some(doc => doc.id !== excludeId);
        }
        return true;
    } catch (e) {
        console.error("Error al verificar email único: ", e);
        throw e;
    }
}

export { crearUsuario, consultarUsuarios, consultarUsuarioPorId, actualizarUsuario, eliminarUsuario, verificarEmailUnico };