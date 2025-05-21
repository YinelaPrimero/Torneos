document.addEventListener('DOMContentLoaded', function() {
  // Datos de ejemplo
  const tournaments = [
    {
      id: 1,
      name: 'Torneo de Verano 2025',
      startDate: '2025-06-15',
      endDate: '2025-08-20',
      teams: 16,
      type: 'Grupos + Eliminación',
      status: 'Activo'
    },
    {
      id: 2,
      name: 'Copa Primavera',
      startDate: '2025-03-01',
      endDate: '2025-05-30',
      teams: 8,
      type: 'Eliminación directa',
      status: 'Finalizado'
    }
  ];
  
  const matches = [
    {
      id: 1,
      tournament: 'Torneo de Verano 2025',
      home: 'Los Tigres',
      away: 'Águilas FC',
      date: '2025-06-20 18:00',
      status: 'Programado'
    },
    {
      id: 2,
      tournament: 'Torneo de Verano 2025',
      home: 'Dragones',
      away: 'Leones',
      date: '2025-06-21 19:30',
      status: 'Programado'
    }
  ];
  
  // Mostrar estadísticas
  document.getElementById('active-tournaments').textContent = tournaments.filter(t => t.status === 'Activo').length;
  document.getElementById('teams-count').textContent = '24';
  document.getElementById('players-count').textContent = '120';
  document.getElementById('matches-today').textContent = '3';
  
  // Llenar tabla de próximos partidos
  const upcomingMatchesTable = document.getElementById('upcoming-matches');
  if (upcomingMatchesTable) {
    upcomingMatchesTable.innerHTML = matches.map(match => `
      <tr>
        <td>${match.tournament}</td>
        <td>${match.home}</td>
        <td>${match.away}</td>
        <td>${match.date}</td>
        <td><span class="badge ${match.status === 'Programado' ? 'badge-info' : 'badge-success'}">${match.status}</span></td>
        <td class="table-actions">
          <button class="btn btn-secondary btn-sm"><i class="fas fa-edit"></i></button>
          <button class="btn btn-danger btn-sm"><i class="fas fa-trash"></i></button>
        </td>
      </tr>
    `).join('');
  }
  
  // Llenar tabla de torneos recientes
  const recentTournamentsTable = document.getElementById('recent-tournaments');
  if (recentTournamentsTable) {
    recentTournamentsTable.innerHTML = tournaments.map(tournament => `
      <tr>
        <td>${tournament.name}</td>
        <td>${tournament.startDate}</td>
        <td>${tournament.endDate}</td>
        <td>${tournament.teams}</td>
        <td><span class="badge ${tournament.status === 'Activo' ? 'badge-success' : 'badge-secondary'}">${tournament.status}</span></td>
        <td class="table-actions">
          <button class="btn btn-secondary btn-sm"><i class="fas fa-edit"></i></button>
          <button class="btn btn-danger btn-sm"><i class="fas fa-trash"></i></button>
        </td>
      </tr>
    `).join('');
  }
  
  // Modal de torneo
  const tournamentModal = document.getElementById('tournament-modal');
  const openModalBtn = document.getElementById('add-match-btn');
  const closeModalBtn = document.querySelector('.close-modal');
  const cancelTournamentBtn = document.getElementById('cancel-tournament');
  
  if (openModalBtn) {
    openModalBtn.addEventListener('click', () => {
      tournamentModal.classList.add('open');
    });
  }
  
  if (closeModalBtn) {
    closeModalBtn.addEventListener('click', () => {
      tournamentModal.classList.remove('open');
    });
  }
  
  if (cancelTournamentBtn) {
    cancelTournamentBtn.addEventListener('click', () => {
      tournamentModal.classList.remove('open');
    });
  }
  
  // Guardar torneo
  const saveTournamentBtn = document.getElementById('save-tournament');
  if (saveTournamentBtn) {
    saveTournamentBtn.addEventListener('click', () => {
      const name = document.getElementById('t-name').value;
      if (name) {
        alert(`Torneo "${name}" creado exitosamente`);
        tournamentModal.classList.remove('open');
        // Aquí normalmente haríamos una petición al backend
      } else {
        alert('Por favor ingresa un nombre para el torneo');
      }
    });
  }
  
  // Cerrar modal al hacer clic fuera
  tournamentModal.addEventListener('click', (e) => {
    if (e.target === tournamentModal) {
      tournamentModal.classList.remove('open');
    }
  });
});