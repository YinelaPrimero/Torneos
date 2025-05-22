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

import axios from 'axios';

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

// Añadir equipo al torneo (validación de edad mínima)
router.post('/torneos/:id/equipos', async (req, res) => {
  const torneoId = req.params.id;
  const equipoId = req.body.equipoId;

  try {
    const torneo = await consultarTorneo(torneoId);
    if (!torneo) {
      return res.status(404).send("Torneo no encontrado");
    }

    const edadMinima = Number(torneo.edad_minima);
    if (isNaN(edadMinima)) {
      return res.status(500).send("Edad mínima inválida en el torneo");
    }

    const response = await axios.get(`http://localhost:3001/equipos/${equipoId}/edades-jugadores`);

    const edades = response.data.edades;
    if (!edades || edades.length === 0) {
      return res.status(400).send("No se encontraron jugadores en el equipo o edades vacías");
    }

    console.log("edadMinima del torneo:", edadMinima);
    console.log("edades de jugadores:", edades);
    const todasCumplen = edades.every(edad => edad >= edadMinima);
    console.log("¿Todas cumplen la edad mínima?:", todasCumplen);

    if (!todasCumplen) {
      return res.status(400).send(`Algunos jugadores no cumplen la edad mínima requerida: ${edadMinima} años`);
    }

    await añadirEquipoTorneo(torneoId, equipoId);
    return res.send("Equipo añadido al torneo");

  } catch (error) {
    console.error("Error al añadir equipo al torneo:", error);
    return res.status(500).send("Error al añadir equipo al torneo");
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

