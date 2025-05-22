import { Router } from 'express';  
import { crearEquipo, consultarEquipos, consultarEquipo, actualizarEquipo, eliminarEquipo, agregarJugador, eliminarJugador, consultarJugadores, obtenerEdadesJugadores } from '../models/equiposModel.js'; 

const router = Router(); 

router.post('/equipos', async (req, res) => {
  const { nombre, capitan, descripcion, jugadores } = req.body;  

  try {
    const idEquipo = await crearEquipo(nombre, capitan, descripcion, jugadores);
    res.status(201).json({ mensaje: "Equipo creado", id: idEquipo });
  } catch (error) {
    res.status(500).send("Error al crear el equipo");
  }
});

router.get('/equipos', async (req, res) => {
    try {
        const result = await consultarEquipos();  
        res.json(result);  
    } catch (error) {
        res.status(500).send("Error al consultar el equipo");
    }
});

router.get('/equipos/:id', async (req, res) => {
    const id = req.params.id;
    try {
        const equipo = await consultarEquipo(id);
        if (equipo) {
            res.json(equipo);
        } else {
            res.status(404).send("Equipo no encontrado");
        }
    } catch (error) {
        res.status(500).send("Error al consultar el equipo");
    }
});

router.put('/equipos/:id', async (req, res) => { 
    const id = req.params.id; 
    const { nombre, cantidad_jugadores, idUsuario  } = req.body;

    try {
        await actualizarEquipo(id, nombre, cantidad_jugadores, idUsuario);
        res.send("Equipo actualizado");
    } catch (error) {
        res.status(403).send(error.message || "Error actualizando equipo");
    }
});

router.delete('/equipos/:id', async (req, res) => { 
    const id = req.params.id;
    const { idUsuario } = req.body;

    try {
        await eliminarEquipo(id, idUsuario);
        res.send("Equipo eliminado");
    } catch (error) {
        res.status(403).send(error.message || "Error al eliminar equipo");
    }
});

router.post('/equipos/:idEquipo/jugadores', async (req, res) => {
  const { idEquipo } = req.params;
  const { idJugador, idUsuario } = req.body;

  try {
    await agregarJugador(idEquipo, idJugador, idUsuario);
    res.send(`Jugador ${idJugador} agregado`);
  } catch (error) {
    res.status(403).send(error.message || "Error al agregar jugador");
  }
});

router.delete('/equipos/:idEquipo/jugadores/:idJugador', async (req, res) => {
  const { idEquipo, idJugador } = req.params;
  const { idUsuario } = req.body;

  try {
    await eliminarJugador(idEquipo, idJugador, idUsuario);
    res.send(`Jugador ${idJugador} eliminado`);
  } catch (error) {
    res.status(403).send(error.message || "Error al eliminar jugador");
  }
});


router.get('/equipos/:idEquipo/jugadores', async (req, res) => {
  const { idEquipo } = req.params;

  try {
    const result = await consultarJugadores(idEquipo);

    if (result === null) {
      return res.status(404).send("Equipo no encontrado");
    }
    res.json(result);
    
  } catch (error) {
    res.status(500).send("Error al consultar jugadores");
  }
});

router.get('/equipos/:id/edades-jugadores', async (req, res) => {
  const { id } = req.params;

  try {
    const edades = await obtenerEdadesJugadores(id);

    if (edades === null) {
      return res.status(404).send("Equipo no encontrado");
    }

    res.json({ edades });
  } catch (error) {
    res.status(500).send("Error al obtener las edades");
  }
});


export default router;  
