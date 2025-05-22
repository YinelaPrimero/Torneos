const matchesList = document.getElementById('matches-list');
const matchForm = document.getElementById('match-form');
const toggleModal = document.getElementById('toggle-modal');
const editResultModal = document.getElementById('edit-result-modal');
const editResultForm = document.getElementById('edit-result-form');
const cancelEditBtn = document.getElementById('cancel-edit');

// Function to render a match in the table
function renderMatch(partido, id) {
  const row = document.createElement('tr');
  row.setAttribute('data-id', id);

  row.innerHTML = `
    <td>${partido.torneo_nombre} (ID: ${partido.torneo_id})</td>
    <td>${partido.equipo_local}</td>
    <td>${partido.equipo_visitante}</td>
    <td>${new Date(partido.fecha).toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })}</td>
    <td>${partido.resultado}</td>
    <td><span class="badge badge-info">${partido.estado}</span></td>
    <td>
      <button class="btn btn-secondary btn-sm btn-edit" data-id="${id}"><i class="fas fa-edit"></i></button>
      <button class="btn btn-danger btn-sm btn-delete" data-id="${id}"><i class="fas fa-trash"></i></button>
    </td>
  `;

  matchesList.appendChild(row);
}

// Load matches from the server
async function loadMatches() {
  try {
    const res = await fetch('http://localhost:3005/partidos');
    if (!res.ok) throw new Error('Error al cargar partidos');
    const partidos = await res.json();
    matchesList.innerHTML = ''; // Clear table
    partidos.forEach(partido => renderMatch(partido, partido.id));
  } catch (error) {
    console.error('Error al cargar partidos:', error);
    alert('Error al cargar partidos');
  }
}

// Initial load of matches
loadMatches();

// Create a new match
document.getElementById('match-form').addEventListener('submit', async function(e) {
  e.preventDefault();

  const torneoId = document.getElementById('tournament-id-input').value.trim();
  const torneoNombre = document.getElementById('tournament-name-input').value.trim();
  const localTeam = document.getElementById('local-team-input').value.trim();
  const visitorTeam = document.getElementById('visitor-team-input').value.trim();
  const date = document.getElementById('date-input').value;
  const time = document.getElementById('time-input').value;

  if (!torneoId || !torneoNombre || !localTeam || !visitorTeam || !date || !time) {
    alert('Por favor, complete todos los campos.');
    return;
  }

  if (localTeam === visitorTeam) {
    alert('El equipo local y visitante no pueden ser el mismo.');
    return;
  }

  const fechaHora = `${date}T${time}:00`;

  const partido = {
    torneo_id: torneoId,
    torneo_nombre: torneoNombre,
    equipo_local: localTeam,
    equipo_visitante: visitorTeam,
    fecha: fechaHora,
    estado: 'Programado',
    goles_local: 0,
    goles_visitante: 0,
    resultado: '-'
  };

  try {
    const res = await fetch('http://localhost:3005/partidos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(partido)
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Error al crear el partido: ${errorText}`);
    }

    let newPartido;
    const contentType = res.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      newPartido = await res.json();
    } else {
      newPartido = { ...partido, id: 'temp-' + Date.now() }; // Fallback
      console.warn('Server returned non-JSON response:', await res.text());
    }

    renderMatch(newPartido, newPartido.id);
    matchForm.reset();
    toggleModal.checked = false;
    alert('Partido creado exitosamente');
  } catch (error) {
    console.error('Error al crear partido:', error);
    alert('Error al crear el partido: ' + error.message);
  }
});

// Event delegation for edit and delete buttons
matchesList.addEventListener('click', async e => {
  if (e.target.closest('.btn-edit')) {
    const id = e.target.closest('.btn-edit').dataset.id;
    openEditModal(id);
  }

  if (e.target.closest('.btn-delete')) {
    const id = e.target.closest('.btn-delete').dataset.id;
    if (confirm('¿Seguro que quieres eliminar este partido?')) {
      try {
        const res = await fetch(`http://localhost:3005/partidos/${id}`, {
          method: 'DELETE'
        });
        if (!res.ok) throw new Error('Error al eliminar el partido');
        document.querySelector(`tr[data-id="${id}"]`).remove();
      } catch (error) {
        console.error('Error al eliminar partido:', error);
        alert('Error al eliminar partido');
      }
    }
  }
});

// Open edit result modal
async function openEditModal(id) {
  console.log('Fetching match with ID:', id);
  try {
    const res = await fetch(`http://localhost:3005/partidos/${id}`);
    if (!res.ok) throw new Error('Partido no encontrado');
    const data = await res.json();
    document.getElementById('edit-id').value = id;
    document.getElementById('edit-goles-local').value = data.goles_local;
    document.getElementById('edit-goles-visitante').value = data.goles_visitante;
    editResultModal.style.display = 'block';
  } catch (error) {
    console.error('Error al cargar datos del partido:', error);
    alert('Error al cargar datos del partido');
  }
}

// Close edit result modal
cancelEditBtn.addEventListener('click', () => {
  editResultModal.style.display = 'none';
});

// Update match result
editResultForm.addEventListener('submit', async e => {
  e.preventDefault();
  const id = document.getElementById('edit-id').value;
  const golesLocal = parseInt(document.getElementById('edit-goles-local').value, 10);
  const golesVisitante = parseInt(document.getElementById('edit-goles-visitante').value, 10);

  if (isNaN(golesLocal) || isNaN(golesVisitante) || golesLocal < 0 || golesVisitante < 0) {
    alert('Ingresa resultados válidos');
    return;
  }

  const updatedPartido = {
    goles_local: golesLocal,
    goles_visitante: golesVisitante,
    resultado: `${golesLocal}-${golesVisitante}`,
    estado: (golesLocal === 0 && golesVisitante === 0) ? 'Programado' : 'Finalizado'
  };

  try {
    const res = await fetch(`http://localhost:3005/partidos/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedPartido)
    });

    if (!res.ok) throw new Error('Error al actualizar resultado');

    await loadMatches();
    editResultModal.style.display = 'none';
    alert('Resultado actualizado exitosamente');
  } catch (error) {
    console.error('Error al actualizar resultado:', error);
    alert('Error al actualizar resultado');
  }
});

// Close modals when clicking outside
window.addEventListener('click', e => {
  if (e.target === editResultModal) {
    editResultModal.style.display = 'none';
  }
  if (e.target === document.getElementById('match-modal') && toggleModal.checked) {
    toggleModal.checked = false;
  }
});