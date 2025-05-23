import { Router } from 'express';
import axios from 'axios';
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
router.post('/partidos', async (req, res) => {
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
router.get('/partidos/:id', async (req, res) => {
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
router.get('/partidos', async (req, res) => {
  try {
    const partidos = await consultarPartidos();
    res.json(partidos);
  } catch (error) {
    console.error('Error en consultarPartidos:', error);
    res.status(500).send('Error al consultar partidos');
  }
});

// Actualizar resultado
router.put('/partidos/:id/resultado', async (req, res) => {
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
router.put('/partidos/:id/estado', async (req, res) => {
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

// Ruta para obtener partidos por torneo con token en headers


router.get('/partidos/torneos/:id/equipos', async (req, res) => {
  try {
    const equipos = await consultarPartidosPorTorneo(req.params.id);
    res.json(equipos);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Error al consultar equipos inscritos desde el microservicio de torneos");
  }
});





export default router;
