import { Router } from 'express';
import {
  crearTorneo,
  actualizarTorneo,
  consultarTorneo,
  consultarTorneos,
  actualizarResultados,
  añadirEquipoTorneo,
  consultarEquiposInscritos
} from '../models/torneosModel.js';

import { verificarAdmin } from '../middlewares/verificarAdmin.js';

const router = Router();

// Crear torneo (solo admin)
router.post('/torneos', verificarAdmin, async (req, res) => {
  try {
    await crearTorneo(req.body);
    res.status(201).send("Torneo creado");
  } catch (error) {
    console.error(error);
    res.status(500).send("Error al crear el torneo");
  }
});

// Actualizar torneo (solo admin)
router.put('/torneos/:id', verificarAdmin, async (req, res) => {
  try {
    await actualizarTorneo(req.params.id, req.body);
    res.send("Torneo actualizado");
  } catch (error) {
    console.error(error);
    res.status(500).send("Error al actualizar el torneo");
  }
});

// Consultar un torneo por ID (solo admin)
router.get('/torneos/:id', verificarAdmin, async (req, res) => {
  try {
    const result = await consultarTorneo(req.params.id);
    if (!result) return res.status(404).send("Torneo no encontrado");
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error al consultar el torneo");
  }
});

// Consultar todos los torneos (solo admin)
router.get('/torneos', verificarAdmin, async (req, res) => {
  try {
    const result = await consultarTorneos();
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error al consultar torneos");
  }
});

// Actualizar resultados de un torneo (solo admin)
router.post('/torneos/:id/resultados', verificarAdmin, async (req, res) => {
  try {
    await actualizarResultados(req.params.id, req.body.clasificacion);
    res.send("Resultados actualizados");
  } catch (error) {
    console.error(error);
    res.status(500).send("Error al actualizar resultados");
  }
});

// Añadir equipo al torneo (sin validación admin)
router.post('/torneos/:id/equipos', async (req, res) => {
  try {
    await añadirEquipoTorneo(req.params.id, req.body.equipoId);
    res.send("Equipo añadido al torneo");
  } catch (error) {
    console.error(error);
    res.status(500).send("Error al añadir equipo al torneo");
  }
});

// Consultar equipos inscritos en un torneo (sin validación admin)
router.get('/torneos/:id/equipos', async (req, res) => {
  try {
    const equipos = await consultarEquiposInscritos(req.params.id);
    res.json(equipos);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error al consultar equipos inscritos");
  }
});

export default router;

