document.addEventListener("DOMContentLoaded", () => {
  const matchesList = document.getElementById("matches-list");

  let equipos = [];

  // Cargar equipos al inicio
  fetch("http://192.168.100.2:3001/equipos")
    .then(async res => {
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "No se pudo cargar la lista de equipos");
      }
      return res.json();
    })
    .then(data => {
      equipos = data;
    })
    .catch(error => {
      console.error("Error al cargar equipos:", error);
      alert("No se pudieron cargar los equipos. Verifica tu conexión o vuelve a intentarlo más tarde.");
    });

  document.getElementById('show-all-matches').addEventListener('click', async () => {
    try {
      const response = await fetch('http://192.168.100.2:3005/partidos');
      if (!response.ok) {
        throw new Error('Error al consultar partidos');
      }
      const partidos = await response.json();
      mostrarPartidos(partidos);
    } catch (error) {
      console.error('Error al consultar partidos:', error);
      alert('Hubo un problema al obtener los partidos.');
    }
  });

  document.getElementById('filter-by-id').addEventListener('click', async () => {
    const partidoId = document.getElementById('match-id-input').value.trim();
    if (!partidoId) {
      alert('Por favor, ingresa un ID de partido válido.');
      return;
    }

    try {
      const response = await fetch(`http://192.168.100.2:3005/partidos/${partidoId}`);
      if (response.status === 404) {
        alert('Partido no encontrado.');
        return;
      }

      if (!response.ok) {
        throw new Error('Error al consultar el partido');
      }

      const partido = await response.json();
      mostrarPartido(partido);
    } catch (error) {
      console.error('Error al consultar el partido:', error);
      alert('Hubo un problema al obtener el partido.');
    }
  });

  function mostrarPartidos(partidos) {
    matchesList.innerHTML = ''; // Limpiar la tabla antes de actualizar

    partidos.forEach(partido => {
      const localNombre = equipos.find(e => e._id === partido.equipoLocalId || e.id === partido.equipoLocalId)?.nombre || 'Equipo Desconocido';
      const visitanteNombre = equipos.find(e => e._id === partido.equipoVisitanteId || e.id === partido.equipoVisitanteId)?.nombre || 'Equipo Desconocido';

      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${partido.torneoNombre || 'Torneo Desconocido'}</td>
        <td>${localNombre}</td>
        <td>${visitanteNombre}</td>
        <td>${partido.fecha || ""} ${partido.hora || ""}</td>
        <td>${partido.resultado || 'N/A'}</td>
        <td>${partido.estado}</td>
      `;
      matchesList.appendChild(row);
    });
  }

  function mostrarPartido(partido) {
    matchesList.innerHTML = ''; // Limpiar la tabla antes de actualizar

    const localNombre = equipos.find(e => e._id === partido.equipoLocalId || e.id === partido.equipoLocalId)?.nombre || 'Equipo Desconocido';
    const visitanteNombre = equipos.find(e => e._id === partido.equipoVisitanteId || e.id === partido.equipoVisitanteId)?.nombre || 'Equipo Desconocido';

    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${partido.torneoNombre || 'Torneo Desconocido'}</td>
      <td>${localNombre}</td>
      <td>${visitanteNombre}</td>
      <td>${partido.fecha || ""} ${partido.hora || ""}</td>
      <td>${partido.resultado || 'N/A'}</td>
      <td>${partido.estado}</td>
    `;
    matchesList.appendChild(row);
  }
});