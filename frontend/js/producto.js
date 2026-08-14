// producto.js - detalle de un producto individual

function obtenerIdDeURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
}

async function cargarDetalleProducto() {
  const contenedor = document.getElementById("detalleProducto");
  const id = obtenerIdDeURL();

  if (!id) {
    contenedor.innerHTML = "<p>No se especificó ningún producto.</p>";
    return;
  }

  try {
    const res = await fetch(`/api/productos/${id}`);

    if (res.status === 404) {
      contenedor.innerHTML = "<p>Este producto no existe o ya no está disponible.</p>";
      return;
    }

    const p = await res.json();

    contenedor.innerHTML = `
      <img src="${p.imagen_url || "https://via.placeholder.com/320x320?text=Sin+imagen"}" alt="${p.nombre}" />
      <div class="detalle-info">
        <div class="categoria-tag">${p.categoria}</div>
        <h2>${p.nombre}</h2>
        <p>${p.descripcion}</p>
        <div class="precio">$${Number(p.precio).toLocaleString("es-MX")} MXN</div>
        <p>Existencia disponible: ${p.existencia}</p>
        <p>Vendido por: ${p.vendedor_nombre}</p>

        <div style="margin-top:1rem; display:flex; gap:0.6rem; align-items:center;">
          <input type="number" id="cantidadProducto" value="1" min="1" max="${p.existencia}" style="width:70px; padding:0.4rem;">
          <button class="btn-agregar" id="btnAgregarCarrito">Agregar al carrito</button>
        </div>
        <p id="mensajeCarrito" class="mensaje-error"></p>
      </div>
    `;

document.getElementById("btnAgregarCarrito").addEventListener("click", async () => {
  const mensaje = document.getElementById("mensajeCarrito");
  if (!obtenerToken()) {
    window.location.href = "login.html";
    return;
  }
  const cantidad = Number(document.getElementById("cantidadProducto").value);
  try {
    await agregarAlCarrito(p.id_producto, cantidad);
    mensaje.textContent = "Producto agregado al carrito";
    mensaje.style.color = "#2e7d32";
  } catch (error) {
    mensaje.textContent = error.message;
    mensaje.style.color = "#c0392b";
  }
});
  } catch (error) {
    console.error("Error al cargar el producto:", error);
    contenedor.innerHTML = "<p>No se pudo conectar con el servidor.</p>";
  }
}

cargarDetalleProducto();