// URL de tu API (ajustar si tu microservicio está en otro puerto o dominio)
const apiUrl = "http://localhost:3001/equipos"; // Ajusta el endpoint

// Función para obtener el nombre del capitán dado su ID
async function obtenerNombreCapitan(idCapitan) {
  try {
    const response = await fetch(`http://localhost:3003/usuarios/${idCapitan}`);
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
