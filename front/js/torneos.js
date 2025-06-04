document.addEventListener('DOMContentLoaded', function() {
  const tournamentsTable = document.getElementById('tournaments-table');
  const userIdLo = localStorage.getItem("userId");
  const  UserId= userIdLo;

  let tournaments = [];

  // Cargar torneos desde backend
  function loadTournaments() {
    fetch('http://192.168.100.2:3002/torneos', {
      headers: { Authorization: UserId }
    })
    .then(res => {
      if (!res.ok) throw new Error('Error al cargar torneos');
      return res.json();
    })
    .then(data => {
      tournaments = data;
      renderTournaments();
    })
    .catch(console.error);
  }

  // Renderizar tabla con torneos
  function renderTournaments() {
    if (!tournamentsTable) return;
    tournamentsTable.innerHTML = tournaments.map(tournament => `
      <tr>
        <td>${tournament.nombre}</td>
        <td>${tournament.fecha_inicio}</td>
        <td>${tournament.fecha_fin}</td>
        <td>${tournament.equipos_inscritos?.length || 0}</td>
        <td>${tournament.tipo_torneo}</td>
        <td>
          <span class="badge ${
            tournament.estado === 'activo' ? 'badge-success' :
            tournament.estado === 'finalizado' ? 'badge-secondary' : 'badge-info'
          }">${tournament.estado}</span>
        </td>
        <td class="table-actions">
          <button class="btn btn-secondary btn-sm edit-tournament" data-id="${tournament.id}">
            <i class="fas fa-edit"></i>
          </button>
          <button class="btn btn-primary btn-sm view-tournament" data-id="${tournament.id}">
            <i class="fas fa-eye"></i>
          </button>
        </td>
      </tr>
    `).join('');

    // Eventos para botones de acción
    document.querySelectorAll('.edit-tournament').forEach(btn => {
      btn.addEventListener('click', function() {
        const tournamentId = this.getAttribute('data-id');
        const tournament = tournaments.find(t => t.id === tournamentId);
        if (tournament) {
          openModalForEdit(tournament);
        }
      });
    });

    document.querySelectorAll('.view-tournament').forEach(btn => {
      btn.addEventListener('click', function() {
        const tournamentId = this.getAttribute('data-id');
        alert(`Funcionalidad de ver detalles aún no implementada. ID: ${tournamentId}`);
      });
    });
  }

  // Abrir modal para editar torneo
  function openModalForEdit(tournament) {
    document.getElementById('modal-title').textContent = 'Editar Torneo';
    document.getElementById('t-name').value = tournament.nombre;
    document.getElementById('t-description').value = tournament.descripcion || '';
    document.getElementById('t-start').value = tournament.fecha_inicio;
    document.getElementById('t-end').value = tournament.fecha_fin;
    document.getElementById('t-teams').value = tournament.num_equipos_permitidos;
    document.getElementById('t-type').value = tournament.tipo_torneo.toLowerCase();
    document.getElementById('t-min-age').value = tournament.edad_minima || 18;
    const genderInputs = document.querySelectorAll('input[name="t-gender"]');
    genderInputs.forEach(input => {
      input.checked = (input.value === tournament.sexo_biologico);
    });

    const modal = document.getElementById('tournament-modal');
    modal.classList.add('open');
    document.getElementById('tournament-form').dataset.id = tournament.id;
  }

  // Botón crear torneo
  const createTournamentBtn = document.getElementById('create-tournament-btn');
  if (createTournamentBtn) {
    createTournamentBtn.addEventListener('click', function() {
      document.getElementById('modal-title').textContent = 'Crear Nuevo Torneo';
      document.getElementById('tournament-form').reset();
      document.getElementById('tournament-form').removeAttribute('data-id');
      const modal = document.getElementById('tournament-modal');
      modal.classList.add('open');
    });
  }

  // Cerrar modal
  document.querySelector('.close-modal').addEventListener('click', () => {
    closeModal();
  });
  document.getElementById('cancel-tournament').addEventListener('click', () => {
    closeModal();
  });

  function closeModal() {
    const modal = document.getElementById('tournament-modal');
    modal.classList.remove('open');
  }

  // Guardar torneo (crear o actualizar)
  document.getElementById('save-tournament').addEventListener('click', () => {
    const form = document.getElementById('tournament-form');
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const id = form.dataset.id;
    const data = {
      nombre: document.getElementById('t-name').value,
      descripcion: document.getElementById('t-description').value,
      fecha_inicio: document.getElementById('t-start').value,
      fecha_fin: document.getElementById('t-end').value,
      num_equipos_permitidos: Number(document.getElementById('t-teams').value),
      tipo_torneo: document.getElementById('t-type').value,
      edad_minima: Number(document.getElementById('t-min-age').value),
      sexo_biologico: document.querySelector('input[name="t-gender"]:checked').value,
      estado: 'activo'
    };

    const url = id ? `http://192.168.100.2:3002/torneos/${id}` : 'http://192.168.100.2:3002/torneos';
    const method = id ? 'PUT' : 'POST';

    fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: UserId
      },
      body: JSON.stringify(data)
    })
    .then(res => {
      if (!res.ok) throw new Error('Error guardando torneo');
      return res.text();
    })
    .then(msg => {
      alert(msg);
      closeModal();
      loadTournaments();
    })
    .catch(err => {
      alert(err.message);
    });
  });

  // Inicializar la carga de torneos
  loadTournaments();
});
