document.addEventListener('DOMContentLoaded', function() {
  // Datos de ejemplo
  const playerData = {
    name: 'Juan Pérez',
    position: 'Delantero',
    team: 'Los Tigres',
    goals: 8,
    matches: 12,
    rating: 8.2,
    avatar: 'https://via.placeholder.com/100'
  };
  
  const upcomingMatches = [
    {
      id: 1,
      home: 'Los Tigres',
      away: 'Águilas FC',
      date: '20 Jun 2025 - 18:00',
      tournament: 'Torneo de Verano'
    },
    {
      id: 2,
      home: 'Los Tigres',
      away: 'Dragones',
      date: '27 Jun 2025 - 19:30',
      tournament: 'Torneo de Verano'
    }
  ];
  
  const activeTournaments = [
    {
      id: 1,
      name: 'Torneo de Verano',
      startDate: '15 Jun 2025',
      endDate: '20 Ago 2025',
      teams: 16,
      progress: 60,
      status: 'En progreso'
    },
    {
      id: 2,
      name: 'Copa Amistad',
      startDate: '01 Jul 2025',
      endDate: '30 Jul 2025',
      teams: 8,
      progress: 10,
      status: 'Inscripciones abiertas'
    }
  ];
  
  const availableTeams = [
    {
      id: 1,
      name: 'Águilas FC',
      players: 12,
      tournament: 'Torneo de Verano'
    },
    {
      id: 2,
      name: 'Dragones',
      players: 10,
      tournament: 'Torneo de Verano'
    }
  ];
  
  // Mostrar datos del jugador
  document.getElementById('full-name').textContent = playerData.name;
  document.getElementById('player-position').textContent = playerData.position;
  document.getElementById('player-team').textContent = playerData.team;
  document.getElementById('goals-count').textContent = playerData.goals;
  document.getElementById('matches-count').textContent = playerData.matches;
  document.getElementById('player-rating').textContent = playerData.rating;
  document.querySelector('.player-avatar img').src = playerData.avatar;
  
  // Mostrar próximos partidos
  const upcomingMatchesList = document.getElementById('upcoming-matches-list');
  if (upcomingMatchesList) {
    upcomingMatchesList.innerHTML = upcomingMatches.map(match => `
      <div class="match-item">
        <div class="match-teams">
          <span class="home-team">${match.home}</span>
          <span class="vs">vs</span>
          <span class="away-team">${match.away}</span>
        </div>
        <div class="match-date">${match.date}</div>
        <div class="match-actions">
          <button class="btn btn-secondary">Detalles</button>
        </div>
      </div>
    `).join('');
  }
  
  // Mostrar torneos activos
  const activeTournamentsGrid = document.getElementById('active-tournaments');
  if (activeTournamentsGrid) {
    activeTournamentsGrid.innerHTML = activeTournaments.map(tournament => `
      <div class="tournament-card">
        <div class="tournament-header">
          <h3>${tournament.name}</h3>
          <p>${tournament.startDate} - ${tournament.endDate}</p>
        </div>
        <div class="tournament-body">
          <div class="tournament-info">
            <span>Equipos:</span>
            <span>${tournament.teams}</span>
          </div>
          <div class="tournament-info">
            <span>Estado:</span>
            <span>${tournament.status}</span>
          </div>
          <div class="tournament-progress">
            <div class="progress-text">
              <span>Progreso:</span>
              <span>${tournament.progress}%</span>
            </div>
            <div class="progress-bar">
              <div class="progress-fill" style="width: ${tournament.progress}%"></div>
            </div>
          </div>
          <div class="tournament-actions">
            <button class="btn btn-primary">Ver más</button>
          </div>
        </div>
      </div>
    `).join('');
  }
  
  // Modal unirse a equipo
  const joinTeamModal = document.getElementById('join-team-modal');
  const joinTeamBtn = document.getElementById('join-team-btn');
  const closeJoinTeamModal = document.querySelector('#join-team-modal .close-modal');
  const cancelJoinTeamBtn = document.getElementById('cancel-join-team');
  
  if (joinTeamBtn) {
    joinTeamBtn.addEventListener('click', () => {
      // Llenar lista de equipos disponibles
      const teamsList = document.getElementById('available-teams');
      if (teamsList) {
        teamsList.innerHTML = availableTeams.map(team => `
          <div class="team-item">
            <div class="team-logo">${team.name.charAt(0)}</div>
            <div class="team-info">
              <h4>${team.name}</h4>
              <p>${team.players} jugadores • ${team.tournament}</p>
            </div>
            <div class="team-actions">
              <button class="btn btn-primary btn-sm">Unirse</button>
            </div>
          </div>
        `).join('');
      }
      
      joinTeamModal.classList.add('open');
    });
  }
  
  if (closeJoinTeamModal) {
    closeJoinTeamModal.addEventListener('click', () => {
      joinTeamModal.classList.remove('open');
    });
  }
  
  if (cancelJoinTeamBtn) {
    cancelJoinTeamBtn.addEventListener('click', () => {
      joinTeamModal.classList.remove('open');
    });
  }
  
  // Cerrar modal al hacer clic fuera
  joinTeamModal.addEventListener('click', (e) => {
    if (e.target === joinTeamModal) {
      joinTeamModal.classList.remove('open');
    }
  });
  
  // Configurar otros botones de acción rápida
  const joinTournamentBtn = document.getElementById('join-tournament-btn');
  if (joinTournamentBtn) {
    joinTournamentBtn.addEventListener('click', () => {
      alert('Redirigiendo a página de torneos disponibles');
      window.location.href = 'torneos.html';
    });
  }
  
  const viewStatsBtn = document.getElementById('view-stats-btn');
  if (viewStatsBtn) {
    viewStatsBtn.addEventListener('click', () => {
      alert('Redirigiendo a estadísticas');
      window.location.href = 'estadisticas.html';
    });
  }
  
  const editProfileBtn = document.getElementById('edit-profile-btn');
  if (editProfileBtn) {
    editProfileBtn.addEventListener('click', () => {
      alert('Redirigiendo a edición de perfil');
      window.location.href = 'perfil.html';
    });
  }
});