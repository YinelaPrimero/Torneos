import { Router } from 'express';
import bcrypt from 'bcrypt';
import { crearUsuario, consultarUsuarios, consultarUsuarioPorId, actualizarUsuario, eliminarUsuario, verificarContactoUnico } from '../models/usuariosModel.js';

const router = Router();
const SALT_ROUNDS = 10;

router.post('/usuarios', async (req, res) => {
    const { nombre, foto, edad, sexo_biologico, descripcion, posicion, goles, contacto, ubicacion, eps, tipo_sangre, contacto_emergencia, password, isAdmin } = req.body;
    try {
        if (!nombre || !contacto || !password) {
            return res.status(400).send("Nombre, contacto y contraseña son obligatorios");
        }
        const contactoExiste = await verificarContactoUnico(contacto);
        if (contactoExiste) {
            return res.status(400).send("El contacto ya está registrado");
        }
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
        // Permitir isAdmin: true solo si la colección está vacía (primer administrador)
        const usuarios = await consultarUsuarios();
        let finalIsAdmin = false;
        if (usuarios.length === 0 && isAdmin === true) {
            finalIsAdmin = true; // Primer usuario puede ser admin
        } else if (isAdmin !== undefined && isAdmin !== false) {
            return res.status(403).send("Solo el primer usuario o un administrador existente puede establecer isAdmin: true");
        }
        await crearUsuario({ 
            nombre, 
            foto, 
            edad, 
            sexo_biologico, 
            descripcion, 
            posicion, 
            goles, 
            contacto, 
            ubicacion, 
            eps, 
            tipo_sangre, 
            contacto_emergencia, 
            password: hashedPassword,
            isAdmin: finalIsAdmin
        });
        res.status(201).send("Usuario creado");
    } catch (error) {
        console.error("Error en POST /usuarios:", error);
        res.status(500).send("Error al crear el usuario");
    }
});

router.get('/usuarios', async (req, res) => {
    try {
        const result = await consultarUsuarios();
        // Excluir password, incluir isAdmin
        const usuariosSinPassword = result.map(({ password, ...resto }) => resto);
        res.json(usuariosSinPassword);
    } catch (error) {
        console.error("Error en GET /usuarios:", error);
        res.status(500).send("Error al consultar los usuarios");
    }
});

router.get('/usuarios/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await consultarUsuarioPorId(id);
        if (!result) {
            return res.status(404).send("Usuario no encontrado");
        }
        // Excluir password, incluir isAdmin
        const { password, ...usuarioSinPassword } = result;
        res.json(usuarioSinPassword);
    } catch (error) {
        console.error("Error en GET /usuarios/:id:", error);
        res.status(500).send("Error al consultar el usuario");
    }
});

router.put('/usuarios/:id', async (req, res) => {
    const { id } = req.params;
    const { nombre, foto, edad, sexo_biologico, descripcion, posicion, goles, contacto, ubicacion, eps, tipo_sangre, contacto_emergencia, password } = req.body;
    try {
        if (contacto) {
            const contactoExiste = await verificarContactoUnico(contacto, id);
            if (contactoExiste) {
                return res.status(400).send("El contacto ya está registrado");
            }
        }
        const hashedPassword = password ? await bcrypt.hash(password, SALT_ROUNDS) : undefined;
        await actualizarUsuario(id, { 
            nombre, 
            foto, 
            edad, 
            sexo_biologico, 
            descripcion, 
            posicion, 
            goles, 
            contacto, 
            ubicacion, 
            eps, 
            tipo_sangre, 
            contacto_emergencia, 
            password: hashedPassword 
        });
        res.send("Usuario actualizado");
    } catch (error) {
        console.error("Error en PUT /usuarios/:id:", error);
        res.status(500).send("Error al actualizar el usuario");
    }
});

router.delete('/usuarios/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await eliminarUsuario(id);
        res.send("Usuario eliminado");
    } catch (error) {
        console.error("Error en DELETE /usuarios/:id:", error);
        res.status(500).send("Error al eliminar el usuario");
    }
});

router.patch('/usuarios/:id/admin', async (req, res) => {
    const { id } = req.params;
    const { isAdmin, adminId } = req.body;
    try {
        // Validar que isAdmin sea booleano
        if (typeof isAdmin !== 'boolean') {
            return res.status(400).send("El campo isAdmin debe ser un booleano (true o false)");
        }
        // Verificar que el solicitante exista y sea administrador
        const solicitante = await consultarUsuarioPorId(adminId);
        if (!solicitante) {
            return res.status(404).send("Administrador no encontrado");
        }
        if (!solicitante.isAdmin) {
            return res.status(403).send("Solo un administrador puede modificar el rol de administrador");
        }
        // Verificar que el usuario a modificar exista
        const usuario = await consultarUsuarioPorId(id);
        if (!usuario) {
            return res.status(404).send("Usuario a modificar no encontrado");
        }
        // Actualizar el estado isAdmin
        await actualizarUsuario(id, { isAdmin });
        res.send(`Rol de administrador ${isAdmin ? 'otorgado' : 'revocado'} para el usuario ${id}`);
    } catch (error) {
        console.error("Error en PATCH /usuarios/:id/admin:", error);
        res.status(500).send(`Error al modificar el rol de administrador: ${error.message}`);
    }
});

export default router;