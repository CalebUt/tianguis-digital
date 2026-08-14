// carrito.js - carrito conectado a PostgreSQL vía la API real

function obtenerToken() {
  return localStorage.getItem("td_token");
}

async function agregarAlCarrito(idProducto, cantidad) {
  const res = await fetch("/api/carrito", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${obtenerToken()}` },
    body: JSON.stringify({ id_producto: idProducto, cantidad }),
  });
  const datos = await res.json();
  if (!res.ok) throw new Error(datos.error || "No se pudo agregar al carrito");
  return datos;
}

async function obtenerCarritoBackend() {
  const res = await fetch("/api/carrito", { headers: { Authorization: `Bearer ${obtenerToken()}` } });
  const datos = await res.json();
  if (!res.ok) throw new Error(datos.error || "No se pudo consultar el carrito");
  return datos; // { items, total }
}

async function actualizarCantidadCarrito(idDetalle, cantidad) {
  const res = await fetch(`/api/carrito/${idDetalle}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${obtenerToken()}` },
    body: JSON.stringify({ cantidad }),
  });
  const datos = await res.json();
  if (!res.ok) throw new Error(datos.error || "No se pudo actualizar la cantidad");
  return datos;
}

async function eliminarDelCarrito(idDetalle) {
  const res = await fetch(`/api/carrito/${idDetalle}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${obtenerToken()}` },
  });
  const datos = await res.json();
  if (!res.ok) throw new Error(datos.error || "No se pudo eliminar del carrito");
  return datos;
}

async function renderizarCarrito() {
  const contenedor = document.getElementById("listaCarrito");
  if (!contenedor) return; // esta página no es carrito.html

  if (!obtenerToken()) {
    contenedor.innerHTML = "<p>Debes <a href='login.html'>iniciar sesión</a> para ver tu carrito.</p>";
    return;
  }

  try {
    const { items, total } = await obtenerCarritoBackend();

    if (items.length === 0) {
      contenedor.innerHTML = "<p>Tu carrito está vacío.</p>";
      document.getElementById("carritoTotal").textContent = "";
      return;
    }

    contenedor.innerHTML = items
      .map(
        (it) => `
        <div class="carrito-item" data-id="${it.id_detalle}">
          <img src="${it.imagen_url || "https://via.placeholder.com/70x70?text=Sin+imagen"}" alt="${it.nombre}" width="70" height="70" style="object-fit:cover;border-radius:6px;" />
          <div style="flex:1; padding: 0 1rem;">
            <strong>${it.nombre}</strong><br />
            $${Number(it.precio_unitario).toLocaleString("es-MX")} c/u
          </div>
          <div class="cantidad-control">
            <button class="btn-restar" data-id="${it.id_detalle}">-</button>
            <span>${it.cantidad}</span>
            <button class="btn-sumar" data-id="${it.id_detalle}" data-max="${it.existencia}">+</button>
          </div>
          <div style="width:100px; text-align:right; font-weight:bold;">
            $${(it.cantidad * it.precio_unitario).toLocaleString("es-MX")}
          </div>
          <button class="btn-eliminar" data-id="${it.id_detalle}" style="margin-left:1rem; color:#c0392b; background:none; border:none; cursor:pointer;">✕</button>
        </div>`
      )
      .join("");

    document.getElementById("carritoTotal").textContent = "Total: $" + Number(total).toLocaleString("es-MX") + " MXN";

    contenedor.querySelectorAll(".btn-sumar").forEach((btn) =>
      btn.addEventListener("click", async () => {
        const fila = btn.closest(".carrito-item");
        const actual = Number(fila.querySelector("span").textContent);
        if (actual >= Number(btn.dataset.max)) {
          alert("No hay más existencia disponible de este producto.");
          return;
        }
        await actualizarCantidadCarrito(btn.dataset.id, actual + 1);
        renderizarCarrito();
      })
    );

    contenedor.querySelectorAll(".btn-restar").forEach((btn) =>
      btn.addEventListener("click", async () => {
        const fila = btn.closest(".carrito-item");
        const actual = Number(fila.querySelector("span").textContent);
        if (actual <= 1) await eliminarDelCarrito(btn.dataset.id);
        else await actualizarCantidadCarrito(btn.dataset.id, actual - 1);
        renderizarCarrito();
      })
    );

    contenedor.querySelectorAll(".btn-eliminar").forEach((btn) =>
      btn.addEventListener("click", async () => {
        await eliminarDelCarrito(btn.dataset.id);
        renderizarCarrito();
      })
    );
  } catch (error) {
    contenedor.innerHTML = `<p class="mensaje-error">${error.message}</p>`;
  }
}

document.addEventListener("DOMContentLoaded", renderizarCarrito);