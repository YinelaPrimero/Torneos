import { Router } from 'express';
import {
  crearSolicitud,
  consultarSolicitudPorId,
  consultarSolicitudesPorEquipo,
  actualizarEstadoSolicitud
} from '../models/solicitudModel.js';

const router = Router();

// Crear una solicitud
router.post('/solicitudes', async (req, res) => {
  const { id, id_jugador, id_equipo, estado } = req.body;
  try {
    await crearSolicitud(id, id_jugador, id_equipo, estado);
    res.status(201).send("Solicitud creada");
  } catch (error) {
    res.status(500).send("Error al crear la solicitud");
  }
});

// Consultar una solicitud por ID
router.get('/solicitudes/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const solicitud = await consultarSolicitudPorId(id);
    if (solicitud) {
      res.json(solicitud);
    } else {
      res.status(404).send("Solicitud no encontrada");
    }
  } catch (error) {
    res.status(500).send("Error al consultar la solicitud");
  }
});

// Consultar todas las solicitudes de un equipo
router.get('/solicitudes/equipo/:id_equipo', async (req, res) => {
  const { id_equipo } = req.params;
  try {
    const solicitudes = await consultarSolicitudesPorEquipo(id_equipo);
    res.json(solicitudes);
  } catch (error) {
    res.status(500).send("Error al consultar las solicitudes del equipo");
  }
});

// Aceptar o rechazar una solicitud
router.put('/solicitudes/:id', async (req, res) => {
  const { id } = req.params;
  const { estado } = req.body;

  if (!["aceptada", "rechazada"].includes(estado)) {
    return res.status(400).send("Estado inválido");
  }

  try {
    await actualizarEstadoSolicitud(id, estado);
    res.send(`Solicitud ${estado}`);
  } catch (error) {
    res.status(500).send("Error al actualizar la solicitud");
  }
});

export default router;
