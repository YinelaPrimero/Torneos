document.addEventListener('DOMContentLoaded', async () => {
  const equipoId = 'rxHVhO3ObnzE8ERMJ7gF'; // Cambia esto por el id real

 const idUsuario = '0NqKJzQglbeuRlOIiy9y';  // Aquí pones el id del usuario (capitán)

  // Elementos modal y formulario
  const modal = document.getElementById('edit-team-modal');
  const btnEditar = document.getElementById('edit-team');
  const btnCancelar = document.getElementById('cancel-edit');
  const formEditar = document.getElementById('edit-team-form');

  // Función para abrir modal y cargar datos (igual)
  async function abrirModalEdicion() {
    try {
      const res = await fetch(`http://localhost:3001/equipos/${equipoId}`);
      if (!res.ok) throw new Error('Error al obtener equipo para edición');
      const equipo = await res.json();

      document.getElementById('edit-team-name').value = equipo.nombre || '';
      document.getElementById('edit-team-logo').value = equipo.logo || '';
      document.getElementById('edit-team-description').value = equipo.descripcion || '';

      modal.style.display = 'flex';
    } catch (error) {
      alert('Error cargando datos para edición: ' + error.message);
    }
  }

  // Abrir modal con botón editar
  btnEditar.addEventListener('click', abrirModalEdicion);

  // Cerrar modal con botón cancelar
  btnCancelar.addEventListener('click', () => {
    modal.style.display = 'none';
  });

  // Guardar cambios con submit
  formEditar.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nombre = document.getElementById('edit-team-name').value.trim();
    const logo = document.getElementById('edit-team-logo').value.trim();
    const descripcion = document.getElementById('edit-team-description').value.trim();

    if (!nombre) {
      alert('El nombre del equipo es obligatorio');
      return;
    }

    // Aquí agregamos idUsuario en el body
    const dataActualizar = { nombre, logo, descripcion, idUsuario };

    try {
      const res = await fetch(`http://localhost:3001/equipos/${equipoId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataActualizar)
      });

      if (!res.ok) throw new Error('Error al actualizar equipo');

      alert('Equipo actualizado con éxito');
      modal.style.display = 'none';

      // Actualizar vista principal
      document.getElementById('team-name').textContent = nombre;
      document.getElementById('team-logo-img').src = logo || 'https://via.placeholder.com/150';
      document.getElementById('team-description').textContent = descripcion;
    } catch (error) {
      alert(error.message);
    }
  });

  try {
    // Obtener datos equipo
    const equipoRes = await fetch(`http://localhost:3001/equipos/${equipoId}`);
    if (!equipoRes.ok) throw new Error('Error al obtener datos del equipo');
    const equipo = await equipoRes.json();

    // Obtener nombre del capitán
    let nombreCapitan = 'Desconocido';
    if (equipo.capitan) {
      try {
        const capitanRes = await fetch(`http://localhost:3003/usuarios/${equipo.capitan}`);
        if (capitanRes.ok) {
          const capitanData = await capitanRes.json();
          nombreCapitan = capitanData.nombre || 'Desconocido';
        }
      } catch {
        // ignorar error
      }
    }

    // Actualizar info básica
    document.getElementById('team-name').textContent = equipo.nombre;
    document.getElementById('team-logo-img').src = equipo.logo || 'https://via.placeholder.com/150';
    document.getElementById('team-captain').textContent = nombreCapitan;
    document.getElementById('team-description').textContent = equipo.descripcion || '';

    // Obtener jugadores detallados
    const jugadoresDetalles = await Promise.all(
      (equipo.jugadores || []).map(async (jugadorId) => {
        try {
          const res = await fetch(`http://localhost:3003/usuarios/${jugadorId}`);
          if (!res.ok) throw new Error('Error al obtener jugador');
          const data = await res.json();
          return {
            id: jugadorId,
            name: data.nombre || 'Sin nombre',
            position: data.posicion || 'Posición no definida',
            avatar: data.avatar || 'https://via.placeholder.com/80',
            isCaptain: jugadorId === equipo.capitan,
          };
        } catch {
          return {
            id: jugadorId,
            name: 'Jugador no encontrado',
            position: '',
            avatar: 'https://via.placeholder.com/80',
            isCaptain: false,
          };
        }
      })
    );

    // Actualizar contador de jugadores
    const playersHeader = document.querySelector('.card-header h2');
    if (playersHeader) {
      const playersCount = jugadoresDetalles.length;
      const maxPlayers = equipo.cantidad_jugadores || '?';
      playersHeader.innerHTML = `<i class="fas fa-users"></i> Jugadores (${playersCount})`;
    }

    // Mostrar jugadores
    const playersGrid = document.getElementById('team-players');
    playersGrid.innerHTML = jugadoresDetalles.map(player => `
      <div class="player-card ${player.isCaptain ? 'captain' : ''}">
        <img src="${player.avatar}" alt="${player.name}" class="player-avatar" />
        <h3>${player.name} ${player.isCaptain ? '👑' : ''}</h3>
        <p>${player.position}</p>
        ${(equipo.isCaptain && !player.isCaptain) ? 
          `<button class="btn btn-danger btn-sm remove-player" data-id="${player.id}">Eliminar</button>` : ''}
      </div>
    `).join('');

    // Mostrar solicitudes si es capitán
    if (equipo.isCaptain) {
      document.getElementById('requests-section').style.display = 'block';
      const requestsList = document.getElementById('team-requests');
      requestsList.innerHTML = (equipo.requests || []).map(request => `
        <div class="request-item">
          <div class="request-info">
            <h4>${request.playerName}</h4>
            <p>${request.position} • ${request.date}</p>
          </div>
          <div class="request-actions">
            <button class="btn btn-success btn-sm accept-request" data-id="${request.id}">Aceptar</button>
            <button class="btn btn-danger btn-sm reject-request" data-id="${request.id}">Rechazar</button>
          </div>
        </div>
      `).join('');
    }
  } catch (error) {
    console.error('Error cargando datos del equipo:', error);
    alert('Error al cargar la información del equipo. Intenta recargar la página.');
  }
});
