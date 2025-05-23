import axios from 'axios'; // Importar axios para realizar solicitudes a otros servicios
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

  // Validar que los campos requeridos estén presentes y en el formato correcto
  if (!id || !id_jugador || !id_equipo || !estado) {
    return res.status(400).send("Faltan campos obligatorios o el formato es incorrecto");
  }

  if (typeof id !== 'string' || typeof id_jugador !== 'string' || typeof id_equipo !== 'string' || typeof estado !== 'string') {
    return res.status(400).send("Los campos deben ser cadenas de texto");
  }

  if (!["pendiente", "aceptada", "rechazada"].includes(estado)) {
    return res.status(400).send("El estado debe ser 'pendiente', 'aceptada' o 'rechazada'");
  }

  try {
    // Validar que el usuario (jugador) exista
    const usuarioResponse = await axios.get(`http://localhost:3003/usuarios/${id_jugador}`);
    if (!usuarioResponse.data) {
      return res.status(404).send("Usuario no encontrado");
    }

    // Validar que el equipo exista
    const equipoResponse = await axios.get(`http://localhost:3001/equipos/${id_equipo}`);
    if (!equipoResponse.data) {
      return res.status(404).send("Equipo no encontrado");
    }

    // Crear la solicitud si las validaciones pasan
    await crearSolicitud(id, id_jugador, id_equipo, estado);
    res.status(201).send("Solicitud creada");
  } catch (error) {
    console.error("Error al crear la solicitud:", error);
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
    console.error("Error al consultar la solicitud:", error);
    res.status(500).send("Error al consultar la solicitud");
  }
});

// Consultar todas las solicitudes de un equipo
router.get('/solicitudes/equipo/:id_equipo', async (req, res) => {
  const { id_equipo } = req.params;
  try {
    // Validar que el equipo exista
    const equipoResponse = await axios.get(`http://localhost:3001/equipos/${id_equipo}`);
    if (!equipoResponse.data) {
      return res.status(404).send("Equipo no encontrado");
    }

    const solicitudes = await consultarSolicitudesPorEquipo(id_equipo);
    res.json(solicitudes);
  } catch (error) {
    console.error("Error al consultar las solicitudes del equipo:", error);
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
    const solicitud = await consultarSolicitudPorId(id);
    if (!solicitud) {
      return res.status(404).send("Solicitud no encontrada");
    }

    await actualizarEstadoSolicitud(id, estado);
    res.send(`Solicitud ${estado}`);
  } catch (error) {
    console.error("Error al actualizar la solicitud:", error);
    res.status(500).send("Error al actualizar la solicitud");
  }
});

export default router;
