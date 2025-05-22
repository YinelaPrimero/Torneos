import { Router } from 'express';
import { crearUsuario, consultarUsuarios, consultarUsuarioPorId, actualizarUsuario, eliminarUsuario, verificarEmailUnico } from '../models/usuariosModel.js';

const router = Router();

router.post('/usuarios', async (req, res) => {
    const { nombre, apellido, email, foto, edad, sexo_biologico, descripcion, posicion, goles, contacto, ubicacion, eps, tipo_sangre, contacto_emergencia, password, isAdmin, fecha_nacimiento, alergias, equipo } = req.body;
    try {
        if (!nombre || !contacto || !password) {
            return res.status(400).send("Nombre, teléfono y contraseña son obligatorios");
        }
        const emailExiste = await verificarEmailUnico(contacto); // Reusing emailUnico for contacto uniqueness
        if (emailExiste) {
            return res.status(400).send("El teléfono ya está registrado");
        }
        const usuarios = await consultarUsuarios();
        let finalIsAdmin = false;
        if (usuarios.length === 0 && isAdmin === true) {
            finalIsAdmin = true;
        } else if (isAdmin !== undefined && isAdmin !== false) {
            return res.status(403).send("Solo el primer usuario o un administrador existente puede establecer isAdmin: true");
        }
        await crearUsuario({ 
            nombre, apellido, email, foto, edad, sexo_biologico, descripcion, posicion, goles, contacto, ubicacion, eps, tipo_sangre, contacto_emergencia, password, isAdmin: finalIsAdmin, fecha_nacimiento, alergias, equipo 
        });
        res.status(201).send("Usuario creado");
    } catch (error) {
        console.error("Error en POST /usuarios:", error);
        res.status(500).send("Error al crear el usuario");
    }
});

router.post('/login', async (req, res) => {
    const { contacto, password } = req.body;
    try {
        if (!contacto || !password) {
            return res.status(400).send("Teléfono y contraseña son obligatorios");
        }
        const usuarios = await consultarUsuarios();
        const usuario = usuarios.find(u => u.contacto === contacto);
        if (!usuario) {
            return res.status(401).send("Teléfono no encontrado");
        }
        if (password !== usuario.password) {
            return res.status(401).send("Contraseña incorrecta");
        }
        const { password: _, ...usuarioSinPassword } = usuario;
        res.json({ id: usuario.id, isAdmin: usuario.isAdmin });
    } catch (error) {
        console.error("Error en POST /login:", error);
        res.status(500).send("Error al iniciar sesión");
    }
});

router.get('/usuarios', async (req, res) => {
    try {
        const result = await consultarUsuarios();
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
        const { password, ...usuarioSinPassword } = result;
        res.json(usuarioSinPassword);
    } catch (error) {
        console.error("Error en GET /usuarios/:id:", error);
        res.status(500).send("Error al consultar el usuario");
    }
});

router.put('/usuarios/:id', async (req, res) => {
    const { id } = req.params;
    const { nombre, apellido, email, foto, edad, sexo_biologico, descripcion, posicion, goles, contacto, ubicacion, eps, tipo_sangre, contacto_emergencia, password, fecha_nacimiento, alergias, equipo } = req.body;
    try {
        if (contacto) {
            const contactoExiste = await verificarEmailUnico(contacto, id); // Reusing emailUnico for contacto uniqueness
            if (contactoExiste) {
                return res.status(400).send("El teléfono ya está registrado");
            }
        }
        await actualizarUsuario(id, { 
            nombre, apellido, email, foto, edad, sexo_biologico, descripcion, posicion, goles, contacto, ubicacion, eps, tipo_sangre, contacto_emergencia, password, fecha_nacimiento, alergias, equipo 
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
        if (typeof isAdmin !== 'boolean') {
            return res.status(400).send("El campo isAdmin debe ser un booleano (true o false)");
        }
        const solicitante = await consultarUsuarioPorId(adminId);
        if (!solicitante) {
            return res.status(404).send("Administrador no encontrado");
        }
        if (!solicitante.isAdmin) {
            return res.status(403).send("Solo un administrador puede modificar el rol de administrador");
        }
        const usuario = await consultarUsuarioPorId(id);
        if (!usuario) {
            return res.status(404).send("Usuario a modificar no encontrado");
        }
        await actualizarUsuario(id, { isAdmin });
        res.send(`Rol de administrador ${isAdmin ? 'otorgado' : 'revocado'} para el usuario ${id}`);
    } catch (error) {
        console.error("Error en PATCH /usuarios/:id/admin:", error);
        res.status(500).send(`Error al modificar el rol de administrador: ${error.message}`);
    }
});

export default router;