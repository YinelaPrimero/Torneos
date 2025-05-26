document.addEventListener('DOMContentLoaded', function () {
  const tournamentsContainer = document.querySelector('.tournaments-container');
  const myTournamentsTable = document.querySelector('.table tbody');
  const filterSelect = document.querySelector('.tournament-filters select');
  const userId = localStorage.getItem('userId');
  let tournaments = [];

  // Cargar torneos desde el backend
  function loadTournaments() {
    fetch('http://localhost:3002/torneos', {
      headers: { Authorization: userId },
    })
      .then((res) => {
        if (!res.ok) throw new Error('Error al cargar torneos');
        return res.json();
      })
      .then((data) => {
        tournaments = data;
        renderTournaments();
        loadMyTournaments();
      })
      .catch((error) => console.error(error));
  }

  // Renderizar torneos disponibles
  function renderTournaments(filter = 'all') {
    if (!tournamentsContainer) return;
    let filteredTournaments = tournaments;

    // Aplicar filtro
    const now = new Date();
    if (filter === 'active') {
      filteredTournaments = tournaments.filter((t) => t.estado === 'activo');
    } else if (filter === 'upcoming') {
      filteredTournaments = tournaments.filter(
        (t) => new Date(t.fecha_inicio) > now
      );
    }

    tournamentsContainer.innerHTML = filteredTournaments
      .map((tournament) => {
        const isFull =
          tournament.equipos_inscritos?.length >= tournament.num_equipos_permitidos;
        const isOpen = tournament.estado === 'activo' && !isFull;
        return `
          <div class="tournament-card${isOpen ? ' featured' : ''}">
            ${isOpen ? '<div class="tournament-badge">Inscripción abierta</div>' : ''}
            <div class="tournament-header">
              <h2>${tournament.nombre}</h2>
              <p>${tournament.fecha_inicio} - ${tournament.fecha_fin}</p>
            </div>
            <div class="tournament-body">
              <div class="tournament-info">
                <p><i class="fas fa-users"></i> ${tournament.equipos_inscritos?.length || 0}/${
          tournament.num_equipos_permitidos
        } equipos inscritos</p>
                <p><i class="fas fa-trophy"></i> Premio: ${tournament.premio || 'No especificado'}</p>
              </div>
              <div class="tournament-actions">
                <button class="btn btn-primary inscribir-equipo" data-id="${
                  tournament.id
                }" ${isFull || tournament.estado !== 'activo' ? 'disabled' : ''}>
                  Inscribir equipo
                </button>
                <button class="btn btn-secondary ver-detalles" data-id="${tournament.id}">
                  Ver detalles
                </button>
              </div>
            </div>
          </div>
        `;
      })
      .join('');

    // Agregar eventos a los botones
    document.querySelectorAll('.inscribir-equipo').forEach((btn) => {
      btn.addEventListener('click', function () {
        const tournamentId = this.getAttribute('data-id');
        inscribirEquipo(tournamentId);
      });
    });

    document.querySelectorAll('.ver-detalles').forEach((btn) => {
      btn.addEventListener('click', function () {
        const tournamentId = this.getAttribute('data-id');
        verDetalles(tournamentId);
      });
    });
  }

  // Cargar torneos en los que el jugador está inscrito
  async function loadMyTournaments() {
    if (!myTournamentsTable) return;

    try {
      // Suponemos que el backend tiene un endpoint para obtener el equipo del jugador
      const equipoResponse = await fetch('http://localhost:3001/equipos/jugador/' + userId, {
        headers: { Authorization: userId },
      });
      if (!equipoResponse.ok) throw new Error('Error al cargar equipo del jugador');
      const equipo = await equipoResponse.json();

      if (!equipo) {
        myTournamentsTable.innerHTML = '<tr><td colspan="4">No estás en ningún equipo</td></tr>';
        return;
      }

      const torneosInscritos = await Promise.all(
        tournaments.map(async (tournament) => {
          const equipos = await fetch(`http://localhost:3002/torneos/${tournament.id}/equipos`, {
            headers: { Authorization: userId },
          }).then((res) => res.json());
          const isInscrito = equipos.some((e) => e._id === equipo._id);
          if (isInscrito) {
            return { ...tournament, equipo };
          }
          return null;
        })
      );

      const torneosFiltrados = torneosInscritos.filter((t) => t !== null);
      myTournamentsTable.innerHTML = torneosFiltrados
        .map((tournament) => {
          const posicion = tournament.clasificación?.find((c) => c.equipoId === equipo._id)?.posicion || '-';
          return `
            <tr>
              <td>${tournament.nombre}</td>
              <td>${tournament.equipo.nombre}</td>
              <td>${posicion}</td>
              <td>${tournament.proximo_partido || 'No disponible'}</td>
            </tr>
          `;
        })
        .join('');

      if (torneosFiltrados.length === 0) {
        myTournamentsTable.innerHTML = '<tr><td colspan="4">No estás inscrito en ningún torneo</td></tr>';
      }
    } catch (error) {
      console.error(error);
      myTournamentsTable.innerHTML = '<tr><td colspan="4">Error al cargar torneos</td></tr>';
    }
  }

  // Inscribir equipo en un torneo
  function inscribirEquipo(tournamentId) {
    fetch('http://localhost:3001/equipos/jugador/' + userId, {
      headers: { Authorization: userId },
    })
      .then((res) => {
        if (!res.ok) throw new Error('Error al obtener equipo');
        return res.json();
      })
      .then((equipo) => {
        if (!equipo) {
          alert('No estás en ningún equipo. Únete o crea uno primero.');
          return;
        }
        return fetch(`http://localhost:3002/torneos/${tournamentId}/equipos`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: userId,
          },
          body: JSON.stringify({ equipoId: equipo._id }),
        });
      })
      .then((res) => {
        if (!res.ok) throw new Error('Error al inscribir equipo');
        return res.text();
      })
      .then((msg) => {
        alert(msg);
        loadTournaments();
      })
      .catch((error) => {
        alert(error.message);
      });
  }

  // Ver detalles de un torneo
  function verDetalles(tournamentId) {
    const tournament = tournaments.find((t) => t.id === tournamentId);
    if (tournament) {
      alert(`
        Nombre: ${tournament.nombre}
        Descripción: ${tournament.descripcion || 'No disponible'}
        Fecha: ${tournament.fecha_inicio} - ${tournament.fecha_fin}
        Tipo: ${tournament.tipo_torneo}
        Edad mínima: ${tournament.edad_minima}
        Género: ${tournament.sexo_biologico}
        Equipos: ${tournament.equipos_inscritos?.length || 0}/${tournament.num_equipos_permitidos}
      `);
    }
  }

  // Evento para el filtro
  filterSelect.addEventListener('change', (e) => {
    renderTournaments(e.target.value);
  });

  // Inicializar
  loadTournaments();
});