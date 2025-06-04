// URL de tu API (ajustar si tu microservicio está en otro puerto o dominio)
const apiUrl = "http://192.168.100.2:3001/equipos"; // Ajusta el endpoint

// Función para obtener el nombre del capitán dado su ID
async function obtenerNombreCapitan(idCapitan) {
  try {
    const response = await fetch(`http://192.168.100.2:3003/usuarios/${idCapitan}`);
    if (!response.ok) throw new Error('Error al obtener usuario');
    const usuario = await response.json();
    return usuario.nombre || "Nombre no disponible";
  } catch (error) {
    console.error("Error obteniendo nombre capitán:", error);
    return "Nombre no disponible";
  }
}

// Función para mostrar los equipos en el HTML (modificada para obtener nombres)
async function mostrarEquipos(equipos) {
  const grid = document.getElementById('teams-grid');
  grid.innerHTML = "";  // Limpiar cualquier contenido previo

  // Obtener los nombres de los capitanes en paralelo
  const equiposConNombre = await Promise.all(equipos.map(async (equipo) => {
    const nombreCapitan = await obtenerNombreCapitan(equipo.capitan);
    return { ...equipo, nombreCapitan };
  }));

  equiposConNombre.forEach((equipo) => {
    const equipoCard = document.createElement('div');
    equipoCard.classList.add('team-card');

    equipoCard.innerHTML = `
      <div class="team-header">
        <h3>${equipo.nombre}</h3>
      </div>
      <div class="team-info">
        <p><strong>Capitán:</strong> ${equipo.nombreCapitan}</p>
        <p><strong>Jugadores:</strong> ${equipo.jugadores.length}</p>
      </div>
      <div class="team-actions">
      <br>
        <button class="btn btn-secondary btn-sm">Editar</button>
        <button class="btn btn-danger btn-sm">Eliminar</button>
      </div>
    `;

    grid.appendChild(equipoCard);
  });
}

// Función para obtener los equipos
async function obtenerEquipos() {
  try {
    const response = await fetch(apiUrl);
    const equipos = await response.json();

    if (equipos.length === 0) {
      document.getElementById('teams-grid').innerHTML = "<p>No hay equipos disponibles.</p>";
    } else {
      await mostrarEquipos(equipos);  // Esperar a que se muestren los equipos
    }
  } catch (error) {
    console.error("Error al obtener los equipos:", error);
    document.getElementById('teams-grid').innerHTML = "<p>Error al cargar los equipos.</p>";
  }
}

// Ejecutar al cargar la página
window.onload = obtenerEquipos;


document.addEventListener('click', function (e) {
  if (e.target.closest('.btn-edit')) {
    const row = e.target.closest('tr');
    const columns = row.querySelectorAll('td');

    const torneoInfo = columns[0].textContent;
    const [torneoNombre, torneoIdText] = torneoInfo.split(' (ID: ');
    const torneoId = torneoIdText ? torneoIdText.replace(')', '') : '';

    const equipoLocal = columns[1].textContent.trim();
    const equipoVisitante = columns[2].textContent.trim();
    const fechaHora = columns[3].textContent.trim();

    // Formatear fecha y hora
    const [fecha, hora] = fechaHora.split(', ')[1].split(' ');
    const [dia, mes, año] = fechaHora.split(', ')[0].split('/');
    const [horas, minutos] = hora.split(':');

    // Rellenar el formulario
    document.getElementById('tournament-id-input').value = torneoId.trim();
    document.getElementById('tournament-name-input').value = torneoNombre.trim();
    document.getElementById('local-team-input').value = equipoLocal;
    document.getElementById('visitor-team-input').value = equipoVisitante;
    document.getElementById('date-input').value = `${año}-${mes}-${dia}`;
    document.getElementById('time-input').value = `${horas}:${minutos}`;

    // Mostrar el modal
    document.getElementById('toggle-modal').checked = true;
    document.getElementById('match-modal').style.display = 'block';
  }
});
