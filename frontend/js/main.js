fetch("/api/health")
  .then((res) => res.json())
  .then((data) => {
    document.getElementById("estadoBackend").textContent =
      "Servidor conectado correctamente. Hora de la base de datos: " + data.horaServidorBD;
  })
  .catch(() => {
    document.getElementById("estadoBackend").textContent =
      "No se pudo conectar con el servidor.";
  });