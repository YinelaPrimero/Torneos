document.addEventListener('DOMContentLoaded', async () => {
  const equipoId = 'rxHVhO3ObnzE8ERMJ7gF';  // Cambia por id dinámico real
  const idUsuario = '0NqKJzQglbeuRlOIiy9y'; // ID del usuario logueado (capitán)

  // Elementos DOM
  const modal = document.getElementById('edit-team-modal');
  const btnEditar = document.getElementById('edit-team');
  const btnCancelar = document.getElementById('cancel-edit');
  const formEditar = document.getElementById('edit-team-form');
  const btnEliminar = document.getElementById('delete-team');
  const requestsSection = document.getElementById('requests-section');
  const requestsList = document.getElementById('team-requests');

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

  formEditar.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nombre = document.getElementById('edit-team-name').value.trim();
    const logo = document.getElementById('edit-team-logo').value.trim();
    const descripcion = document.getElementById('edit-team-description').value.trim();

    if (!nombre) {
      alert('El nombre del equipo es obligatorio');
      return;
    }

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

      document.getElementById('team-name').textContent = nombre;
      document.getElementById('team-logo-img').src = logo || 'https://via.placeholder.com/150';
      document.getElementById('team-description').textContent = descripcion;
    } catch (error) {
      alert(error.message);
    }
  });

  btnCancelar.addEventListener('click', () => {
    modal.style.display = 'none';
  });

  btnEditar.addEventListener('click', abrirModalEdicion);

  btnEliminar.addEventListener('click', async () => {
    if (!confirm('¿Estás seguro que quieres eliminar este equipo? Esta acción no se puede deshacer.')) return;

    try {
      const res = await fetch(`http://localhost:3001/equipos/${equipoId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idUsuario }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || 'Error al eliminar equipo');
      }

      alert('Equipo eliminado exitosamente');
      window.location.href = 'ver_equipo.html';
    } catch (error) {
      alert('No se pudo eliminar el equipo: ' + error.message);
    }
  });

  async function cargarSolicitudesPendientes(id_equipo) {
    try {
      const resSolicitudes = await fetch(`http://localhost:3004/solicitudes/equipo/${id_equipo}`);
      if (!resSolicitudes.ok) throw new Error('Error al obtener solicitudes');
      const solicitudes = await resSolicitudes.json();

      if (solicitudes.length === 0) {
        requestsList.innerHTML = '<p>No hay solicitudes pendientes.</p>';
        return;
      }

      const solicitudesConDatos = await Promise.all(
        solicitudes.map(async (solicitud) => {
          try {
            const resUser = await fetch(`http://localhost:3003/usuarios/${solicitud.id_jugador}`);
            if (!resUser.ok) throw new Error('Error al obtener usuario');
            const userData = await resUser.json();
            return {
              ...solicitud,
              nombreJugador: userData.nombre || 'Sin nombre',
              posicionJugador: userData.posicion || 'Posición no definida',
            };
          } catch {
            return {
              ...solicitud,
              nombreJugador: 'Jugador no encontrado',
              posicionJugador: '',
            };
          }
        })
      );

      requestsList.innerHTML = solicitudesConDatos.map(solicitud => `
        <div class="request-item">
          <div class="request-info">
            <h4>${solicitud.nombreJugador}</h4>
            <p>${solicitud.posicionJugador} • ${new Date(solicitud.fecha_solicitud || solicitud.date || '').toLocaleDateString()}</p>
          </div>
          <div class="request-actions">
            <button class="btn btn-success btn-sm accept-request" data-id="${solicitud.id}" data-jugador="${solicitud.id_jugador}">Aceptar</button>
            <button class="btn btn-danger btn-sm reject-request" data-id="${solicitud.id}">Rechazar</button>
          </div>
        </div>
      `).join('');

      document.querySelectorAll('.accept-request').forEach(btn => {
        btn.addEventListener('click', async () => {
          const idSolicitud = btn.getAttribute('data-id');
          const idJugador = btn.getAttribute('data-jugador');
          if (!confirm('¿Aceptar esta solicitud?')) return;

          try {
            // 1. Actualizar estado solicitud a aceptada
            //const res = await fetch(`http://localhost:3004/solicitudes/${idSolicitud}`, {
            //  method: 'PUT',
            //  headers: { 'Content-Type': 'application/json' },
            //  body: JSON.stringify({ estado: 'aceptada' }),
            //});
            //if (!res.ok) throw new Error('Error al aceptar solicitud');

            // 2. Agregar jugador al equipo
            const resAddPlayer = await fetch(`http://localhost:3001/equipos/${equipoId}/jugadores`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ idJugador, idUsuario }),
            });
            if (!resAddPlayer.ok) throw new Error('Error al agregar jugador al equipo');

            alert('Solicitud aceptada y jugador agregado al equipo');
            await cargarSolicitudesPendientes(id_equipo);
          } catch (error) {
            alert(error.message);
          }
        });
      });

      document.querySelectorAll('.reject-request').forEach(btn => {
        btn.addEventListener('click', async () => {
          const idSolicitud = btn.getAttribute('data-id');
          if (!confirm('¿Rechazar esta solicitud?')) return;

          try {
            const res = await fetch(`http://localhost:3001/solicitudes/${idSolicitud}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ estado: 'rechazada' }),
            });
            if (!res.ok) throw new Error('Error al rechazar solicitud');
            alert('Solicitud rechazada');
            await cargarSolicitudesPendientes(id_equipo);
          } catch (error) {
            alert(error.message);
          }
        });
      });

    } catch (error) {
      requestsList.innerHTML = `<p>Error cargando solicitudes: ${error.message}</p>`;
    }
  }

  try {
    const equipoRes = await fetch(`http://localhost:3001/equipos/${equipoId}`);
    if (!equipoRes.ok) throw new Error('Error al obtener datos del equipo');
    const equipo = await equipoRes.json();

    let nombreCapitan = 'Desconocido';
    if (equipo.capitan) {
      try {
        const capitanRes = await fetch(`http://localhost:3003/usuarios/${equipo.capitan}`);
        if (capitanRes.ok) {
          const capitanData = await capitanRes.json();
          nombreCapitan = capitanData.nombre || 'Desconocido';
        }
      } catch {}

    }

    document.getElementById('team-name').textContent = equipo.nombre;
    document.getElementById('team-logo-img').src = equipo.logo || 'https://via.placeholder.com/150';
    document.getElementById('team-captain').textContent = nombreCapitan;
    document.getElementById('team-description').textContent = equipo.descripcion || '';

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

    const playersHeader = document.querySelector('.card-header h2');
    if (playersHeader) {
      const playersCount = jugadoresDetalles.length;
      playersHeader.innerHTML = `<i class="fas fa-users"></i> Jugadores (${playersCount})`;
    }

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

    // Mostrar siempre solicitudes
    requestsSection.style.display = 'block';
    await cargarSolicitudesPendientes(equipoId);

  } catch (error) {
    console.error('Error cargando datos del equipo:', error);
    alert('Error al cargar la información del equipo. Intenta recargar la página.');
  }
});
