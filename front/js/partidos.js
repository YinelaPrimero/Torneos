document.addEventListener("DOMContentLoaded", () => {
  const tournamentSelect = document.getElementById("tournament-select");
  const localTeamSelect = document.getElementById("local-team-select");
  const visitorTeamSelect = document.getElementById("visitor-team-select");
  const matchForm = document.getElementById("match-form");
  const matchesList = document.getElementById("matches-list");

  let torneos = [];
  let equiposActuales = [];

  console.log("DOM listo");

  // Cargar torneos al inicio
  fetch("http://localhost:3002/torneos")
    .then(async res => {
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "No se pudo cargar la lista de torneos");
      }
      return res.json();
    })
    .then(data => {
      torneos = data;
      torneos.forEach(torneo => {
        const option = document.createElement("option");
        option.value = torneo._id || torneo.id;
        option.textContent = torneo.nombre;
        tournamentSelect.appendChild(option);
      });
    })
    .catch(error => {
      console.error("Error al cargar torneos:", error);
      alert("No se pudieron cargar los torneos. Verifica tu conexión o vuelve a intentarlo más tarde.");
    });

  // Manejar el cambio de torneo para cargar equipos
  tournamentSelect.addEventListener("change", async () => {
    const torneoId = tournamentSelect.value;
    if (!torneoId) return;

    localTeamSelect.innerHTML = '<option value="">Selecciona equipo local</option>';
    visitorTeamSelect.innerHTML = '<option value="">Selecciona equipo visitante</option>';

    try {
      const res = await fetch(`http://localhost:3002/torneos/${torneoId}/equipos`);
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "Error al consultar los equipos inscritos.");
      }
      const equipos = await res.json();
      equiposActuales = equipos;
      equipos.forEach(equipo => {
        const localOption = document.createElement("option");
        localOption.value = equipo._id || equipo.id;
        localOption.textContent = equipo.nombre;
        const visitorOption = localOption.cloneNode(true);
        localTeamSelect.appendChild(localOption);
        visitorTeamSelect.appendChild(visitorOption);
      });
    } catch (error) {
      console.error("Error al cargar equipos:", error);
      alert("No se pudieron cargar los equipos. Intenta más tarde.");
    }
  });

  // Manejar el envío del formulario para crear partido
  matchForm.addEventListener("submit", async function(e) {
    e.preventDefault();

    const torneoId = tournamentSelect.value;
    const equipoLocalId = localTeamSelect.value;
    const equipoVisitanteId = visitorTeamSelect.value;
    const fecha = document.getElementById('date-input').value;
    const hora = document.getElementById('time-input').value;
    const estado = 'Programado'; // Define este valor aquí
    const resultado = ''; // Define este valor aquí si es necesario

    if (equipoLocalId === equipoVisitanteId) {
      alert("El equipo local y visitante no pueden ser el mismo.");
      return;
    }

    const partido = {
      equipoLocalId: equipoLocalId,
      equipoVisitanteId: equipoVisitanteId,
      estado: estado,
      fecha: fecha,
      hora: hora,
      resultado: resultado,
      torneoId: torneoId
    };
    try {
      const res = await fetch("http://localhost:3005/partidos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(partido)
      });
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "Error al crear partido");
      }
      matchForm.reset(); // Resetea el formulario
      await cargarPartidos();
    } catch (error) {
      alert("Error al crear partido: " + error.message);
      console.error(error);
    }
  });

  let partidos = [];
  // Función para cargar la tabla con los partidos
  async function cargarPartidos() {
    try {
      const res = await fetch("http://localhost:3005/partidos");
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "Error al consultar partidos.");
      }
      const partidos = await res.json();
      matchesList.innerHTML = "";

      partidos.forEach(partido => {
        let local = equiposActuales.find(e => (e._id || e.id) === partido.equipoLocalId);
        let visitante = equiposActuales.find(e => (e._id || e.id) === partido.equipoVisitanteId);

        let torneoNombre = torneos.find(t => (t._id || t.id) === partido.torneoId)?.nombre || 'Torneo Desconocido';

        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${torneoNombre}</td>
          <td>${local?.nombre || 'Equipo Desconocido'}</td>
          <td>${visitante?.nombre || 'Equipo Desconocido'}</td>
          <td>${partido.fecha || ""} ${partido.hora || ""}</td>
          <td>${partido.resultado || "-"}</td>
          <td>${partido.estado || ""}</td>
          <td>
            <button class="btn btn-small btn-edit" data-id="${partido.id}">
              <i class="fas fa-edit"></i> Editar
            </button>
          </td>
        `;
        matchesList.appendChild(row);
      });
    

      // Configurar handler para los botones de editar
      matchesList.querySelectorAll(".btn-edit").forEach(btn => {
        btn.onclick = function() {
          const partidoId = btn.getAttribute("data-id");
          const partido = partidos.find(p => p.id === partidoId);
          if (partido) {
            document.getElementById("edit-id").value = partido.id;
            // Si tienes resultado tipo "2 - 3", separa
            if (partido.resultado && partido.resultado.includes("-")) {
              const [gL, gV] = partido.resultado.split("-").map(x=>x.trim());
              document.getElementById("edit-goles-local").value = gL || "";
              document.getElementById("edit-goles-visitante").value = gV || "";
            } else {
              document.getElementById("edit-goles-local").value = partido.goles_local || "";
              document.getElementById("edit-goles-visitante").value = partido.goles_visitante || "";
            }
            document.getElementById("edit-estado").value = partido.estado || "Programado";
            document.getElementById("edit-result-modal").style.display = "block";
          }
        };
      });
    } catch (e) {
      matchesList.innerHTML = `<tr><td colspan="7">Error al cargar partidos</td></tr>`;
      console.error("Error al cargar partidos:", e);
    }
  }

  // Handler para editar el partido (resultado + estado)
document.getElementById("edit-result-form").onsubmit = async function(e) {
  e.preventDefault();
  const partidoId = document.getElementById("edit-id").value;
  const golesLocal = document.getElementById("edit-goles-local").value;
  const golesVisitante = document.getElementById("edit-goles-visitante").value;
  const estado = document.getElementById("edit-estado").value;
  const resultado = `${golesLocal} - ${golesVisitante}`;

    try {
    let res1 = await fetch(`http://localhost:3005/partidos/${partidoId}/resultado`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        goles_local: golesLocal,
        goles_visitante: golesVisitante,
        resultado
      })
    });
    if (!res1.ok) throw new Error("Error actualizando goles");
      console.log(`Resultado del partido ${partidoId} actualizado en el microservicio`);

      let res2 = await fetch(`http://localhost:3005/partidos/${partidoId}/estado`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estado })
    });
    if (!res2.ok) throw new Error("Error actualizando estado");
      console.log(`Estado del partido ${partidoId} actualizado en el microservicio`);

       await actualizarPartidoFirebase(partidoId, { golesLocal, golesVisitante, resultado, estado });

      document.getElementById("edit-result-modal").style.display = "none";
      await cargarPartidos();
    } catch (e) {
      alert("Error al actualizar partido.");
      console.error(e);
    }
  };

  // Botón cancelar del modal
   document.getElementById("cancel-edit").onclick = function() {
    document.getElementById("edit-result-modal").style.display = "none";
  };

  // Cargar partidos al iniciar página
  cargarPartidos();
});

async function actualizarPartidoFirebase(partidoId, data) {
  console.log(`Actualizando documento ${partidoId} con los datos:`, data);
  try {
    await db.collection("Partidos").doc(partidoId).update(data);
    console.log("Partido actualizado en Firebase");
  } catch (error) {
    console.error("Error al actualizar en Firebase:", error.message);
    alert("Error al actualizar el partido en Firebase: " + error.message);
  }
}


const firebaseConfig = {
  apiKey: "AIzaSyA-dfwrleFFhghRJO2z12Pp5uqnK6Ct2zE",
  authDomain: "proyecto-torneos.firebaseapp.com",
  projectId: "proyecto-torneos",
  storageBucket: "proyecto-torneos.firebasestorage.app",
  messagingSenderId: "977844691436",
  appId: "1:977844691436:web:707685de9dd396962320c9"
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const db = firebase.firestore();