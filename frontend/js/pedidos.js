// pedidos.js - consulta de pedidos (comprador ve los suyos, admin ve todos)

document.addEventListener("DOMContentLoaded", async () => {
  const contenedor = document.getElementById("listaPedidos");

  if (!obtenerToken()) {
    contenedor.innerHTML = "<p>Debes <a href='login.html'>iniciar sesión</a> para ver tus pedidos.</p>";
    return;
  }

  try {
    const res = await fetch("/api/pedidos", { headers: { Authorization: `Bearer ${obtenerToken()}` } });
    const pedidos = await res.json();

    if (!res.ok) {
      contenedor.innerHTML = `<p class="mensaje-error">${pedidos.error}</p>`;
      return;
    }
    if (pedidos.length === 0) {
      contenedor.innerHTML = "<p>Todavía no tienes pedidos.</p>";
      return;
    }

    contenedor.innerHTML = `
      <table>
        <thead><tr><th>Pedido</th><th>Fecha</th><th>Total</th><th>Estado</th></tr></thead>
        <tbody>
          ${pedidos
            .map(
              (p) => `
            <tr>
              <td>#${p.id_pedido}</td>
              <td>${new Date(p.fecha_pedido).toLocaleString("es-MX")}</td>
              <td>$${Number(p.total).toLocaleString("es-MX")}</td>
              <td>${p.estado}</td>
            </tr>`
            )
            .join("")}
        </tbody>
      </table>
    `;
  } catch (error) {
    contenedor.innerHTML = "<p class='mensaje-error'>No se pudo conectar con el servidor.</p>";
  }
});