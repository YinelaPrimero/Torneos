document.addEventListener('DOMContentLoaded', async () => {
  const teamsList = document.getElementById('available-teams');

  // Simula el ID del jugador logueado, reemplaza con el real de tu sistema
    const userId = localStorage.getItem("userId");
  const jugadorId = userId;

  try {
    const response = await fetch('http://192.168.100.2:3001/equipos');
    if (!response.ok) throw new Error('Error al obtener equipos');
    const equipos = await response.json();

    if (equipos.length === 0) {
      teamsList.innerHTML = "<p>No hay equipos disponibles.</p>";
      return;
    }

    // Para cada equipo obtener info del capitán
    const equiposConCapitan = await Promise.all(
      equipos.map(async (team) => {
        try {
          const resUser = await fetch(`http://192.168.100.2:3003/usuarios/${team.capitan}`);
          if (!resUser.ok) throw new Error('Error al obtener capitán');
          const userData = await resUser.json();
          return { ...team, capitanNombre: userData.nombre || 'Sin nombre' };
        } catch {
          return { ...team, capitanNombre: 'Información no disponible' };
        }
      })
    );

    teamsList.innerHTML = equiposConCapitan.map(team => `
      <div class="team-card">
        <div class="team-header">
          <img src="${team.logo || 'https://via.placeholder.com/80'}" alt="${team.nombre}" class="team-logo-sm" />
          <div class="team-info">
            <h3>${team.nombre}</h3>
            <p>${team.jugadores?.length || 0} jugadores • </p>
            <p class="team-desc">${team.descripcion || ''}</p>
            <p><strong>Capitán:</strong> ${team.capitanNombre}</p>
          </div>
        </div>
        <div class="team-actions">
          <button class="btn btn-primary join-team" data-id="${team.id}">Enviar Solicitud</button>
          <button class="btn btn-secondary">Ver Detalles</button>
        </div>
      </div>
    `).join('');

    // Función para enviar solicitud al backend
    async function enviarSolicitud(equipoId) {
      try {
        const res = await fetch('http://192.168.100.2:3004/solicitudes', { 
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            id: 'aq3242424',
            id_jugador: jugadorId,
            id_equipo: equipoId,
            estado: 'pendiente'
          })
        });

        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || 'Error enviando solicitud');
        }

        alert('Solicitud enviada con éxito');
      } catch (error) {
        alert('No se pudo enviar la solicitud: ' + error.message);
        console.error(error);
      }
    }

    // Agregar listeners para los botones de unirse
    document.querySelectorAll('.join-team').forEach(btn => {
      btn.addEventListener('click', function() {
        const teamId = this.getAttribute('data-id');
        const team = equiposConCapitan.find(t => t.id === teamId);
        if (confirm(`¿Enviar solicitud para unirte a ${team.nombre}?`)) {
          enviarSolicitud(teamId);
        }
      });
    });

  } catch (error) {
    console.error(error);
    teamsList.innerHTML = "<p>Error al cargar los equipos.</p>";
  }

  // Filtro para búsqueda
  document.getElementById('team-search').addEventListener('input', function(e) {
    const searchTerm = e.target.value.toLowerCase();
    document.querySelectorAll('.team-card').forEach(card => {
      const teamName = card.querySelector('h3').textContent.toLowerCase();
      card.style.display = teamName.includes(searchTerm) ? 'block' : 'none';
    });
  });
});
