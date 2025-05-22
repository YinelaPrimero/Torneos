import { Router } from 'express';
import {
  crearPartido,
  consultarPartidoPorId,
  consultarPartidos,
  actualizarResultadoPartido,
  actualizarEstadoPartido,
  consultarPartidosPorTorneo,
} from '../models/partidosmodel.js';

const router = Router();

// Crear un partido
router.post('/Partidos', async (req, res) => {
  const partido = req.body;
  try {
    await crearPartido(partido);
    res.status(201).send('Partido creado');
  } catch (error) {
    console.error('Error en crearPartido:', error);
    res.status(500).send('Error al crear el partido');
  }
});

// Obtener partido por ID
router.get('/Partidos/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const partido = await consultarPartidoPorId(id);
    if (partido) {
      res.json(partido);
    } else {
      res.status(404).send('Partido no encontrado');
    }
  } catch (error) {
    console.error('Error en consultarPartidoPorId:', error);
    res.status(500).send('Error al consultar el partido');
  }
});

// Obtener todos los partidos
router.get('/Partidos', async (req, res) => {
  try {
    const partidos = await consultarPartidos();
    res.json(partidos);
  } catch (error) {
    console.error('Error en consultarPartidos:', error);
    res.status(500).send('Error al consultar partidos');
  }
});

// Actualizar resultado
router.put('/Partidos/:id/resultado', async (req, res) => {
  const { id } = req.params;
  const { goles_local, goles_visitante, resultado } = req.body;

  try {
    await actualizarResultadoPartido(id, goles_local, goles_visitante, resultado);
    res.send('Resultado actualizado');
  } catch (error) {
    console.error('Error en actualizarResultadoPartido:', error);
    res.status(500).send('Error al actualizar el resultado');
  }
});

// Actualizar estado
router.put('/Partidos/:id/estado', async (req, res) => {
  const { id } = req.params;
  const { estado } = req.body;

  try {
    await actualizarEstadoPartido(id, estado);
    res.send('Estado actualizado');
  } catch (error) {
    console.error('Error en actualizarEstadoPartido:', error);
    res.status(500).send('Error al actualizar el estado');
  }
});

// Obtener partidos por torneo
router.get('/Partidos/torneos/:id', async (req, res) => {
  const idTorneo = req.params.id;
  const authHeader = req.headers.authorization;

  try {
    const response = await axios.get(`http://localhost:3002/torneos/${idTorneo}`, {
      headers: {
        Authorization: authHeader, // 👈 Reenvías el token
      },
    });
    const torneoInfo = response.data;

    const partidos = await Partido.find({ idTorneo });
    const partidosConInfo = partidos.map((partido) => ({
      ...partido.toObject(),
      torneo: torneoInfo,
    }));

    res.json(partidosConInfo);
  } catch (error) {
    console.error('Error al obtener torneo o partidos:', error.response?.data || error.message);
    res.status(500).json({ error: 'Error al obtener torneo o partidos' });
  }
});

export default router;
