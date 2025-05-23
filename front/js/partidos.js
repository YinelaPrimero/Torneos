document.addEventListener("DOMContentLoaded", () => {
  const tournamentSelect = document.getElementById("tournament-select");
  const localTeamSelect = document.getElementById("local-team-select");
  const visitorTeamSelect = document.getElementById("visitor-team-select");

  console.log("DOM listo");

  // Cargar torneos al inicio
  fetch("http://localhost:3002/torneos")
    .then(res => res.json())
    .then(torneos => {
      console.log("Torneos cargados:", torneos);
      torneos.forEach(torneo => {
        const option = document.createElement("option");
        option.value = torneo._id || torneo.id;  // <-- Aquí el cambio
        option.textContent = torneo.nombre;
        tournamentSelect.appendChild(option);
      });
    })
    .catch(error => console.error("Error al cargar torneos:", error));

  tournamentSelect.addEventListener("change", () => {
    const torneoId = tournamentSelect.value;
    console.log("Torneo seleccionado:", torneoId);
    if (!torneoId) return;

    // Limpiar selects
    localTeamSelect.innerHTML = '<option value="">Selecciona equipo local</option>';
    visitorTeamSelect.innerHTML = '<option value="">Selecciona equipo visitante</option>';

    fetch(`http://localhost:3002/torneos/${torneoId}/equipos`)
      .then(res => res.json())
      .then(equipos => {
        console.log("Equipos recibidos:", equipos);
        equipos.forEach(equipo => {
          const localOption = document.createElement("option");
          localOption.value = equipo._id || equipo.id;  // <-- Aquí también
          localOption.textContent = equipo.nombre;

          const visitorOption = localOption.cloneNode(true);

          localTeamSelect.appendChild(localOption);
          visitorTeamSelect.appendChild(visitorOption);
        });
      })
      .catch(error => console.error("Error al cargar equipos:", error));
  });
});
