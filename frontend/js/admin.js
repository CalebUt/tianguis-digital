// admin.js - panel de administración: CRUD de productos, imágenes, y estados de pedidos

document.addEventListener("DOMContentLoaded", () => {
  const usuario = obtenerUsuarioLocal();

  if (!usuario || usuario.rol !== "administrador") {
    alert("Debes iniciar sesión con una cuenta de administrador para ver esta página.");
    window.location.href = "login.html";
    return;
  }

  cargarCategoriasSelect();
  cargarProductosAdmin();
  cargarPedidosAdmin();

  document.getElementById("formImagen").addEventListener("submit", guardarProducto);
  document.getElementById("btnCancelarEdicion").addEventListener("click", cancelarEdicion);
});

function obtenerUsuarioLocal() {
  const raw = localStorage.getItem("td_usuario");
  return raw ? JSON.parse(raw) : null;
}

async function cargarCategoriasSelect() {
  const select = document.getElementById("categoriaProducto");
  try {
    const res = await fetch("/api/categorias");
    const categorias = await res.json();
    select.innerHTML = categorias.map((c) => `<option value="${c.id_categoria}">${c.nombre}</option>`).join("");
  } catch (error) {
    console.error("Error al cargar categorías:", error);
  }
}

async function cargarProductosSelectImagen() {
  const select = document.getElementById("productoSelect");
  try {
    const res = await fetch("/api/productos");
    const productos = await res.json();
    select.innerHTML = productos.map((p) => `<option value="${p.id_producto}">${p.nombre} (id: ${p.id_producto})</option>`).join("");
  } catch (error) {
    console.error("Error al cargar productos:", error);
  }
}

// Crea un producto nuevo, o actualiza uno existente si estamos en modo edición
async function guardarProducto(event) {
  event.preventDefault();
  const mensaje = document.getElementById("mensajeProducto");
  const idEditar = document.getElementById("idProductoEditar").value;

  const cuerpo = {
    nombre: document.getElementById("nombreProducto").value.trim(),
    descripcion: document.getElementById("descripcionProducto").value.trim(),
    precio: Number(document.getElementById("precioProducto").value),
    existencia: Number(document.getElementById("existenciaProducto").value),
    id_categoria: Number(document.getElementById("categoriaProducto").value),
  };

  try {
    let idProducto = idEditar;
    let res, datos;

    if (idEditar) {
      res = await fetch(`/api/productos/${idEditar}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${obtenerToken()}` },
        body: JSON.stringify(cuerpo),
      });
    } else {
      res = await fetch("/api/productos", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${obtenerToken()}` },
        body: JSON.stringify(cuerpo),
      });
    }

    datos = await res.json();
    if (!res.ok) {
      mensaje.textContent = datos.error || "No se pudo guardar el producto";
      mensaje.style.color = "#c0392b";
      return;
    }

    if (!idEditar) idProducto = datos.id_producto;

    // Si seleccionaron una imagen, se sube después de guardar el producto
    const archivo = document.getElementById("archivoImagen").files[0];
    if (archivo) {
      const formData = new FormData();
      formData.append("imagen", archivo);
      const resImg = await fetch(`/api/productos/${idProducto}/imagenes`, {
        method: "POST",
        headers: { Authorization: `Bearer ${obtenerToken()}` },
        body: formData,
      });
      if (!resImg.ok) {
        const errImg = await resImg.json();
        mensaje.textContent = `Producto guardado, pero la imagen falló: ${errImg.error}`;
        mensaje.style.color = "#c0392b";
      }
    }

    mensaje.textContent = idEditar ? "Producto actualizado correctamente" : "Producto creado correctamente";
    mensaje.style.color = "#2e7d32";
    cancelarEdicion(); // limpia el formulario y regresa al modo "crear"
    cargarProductosAdmin();
  } catch (error) {
    mensaje.textContent = "No se pudo conectar con el servidor";
    mensaje.style.color = "#c0392b";
  }
}

// Llena el formulario con los datos de un producto para editarlo
function editarProducto(producto) {
  document.getElementById("tituloFormProducto").textContent = `Editando: ${producto.nombre}`;
  document.getElementById("idProductoEditar").value = producto.id_producto;
  document.getElementById("nombreProducto").value = producto.nombre;
  document.getElementById("descripcionProducto").value = producto.descripcion;
  document.getElementById("precioProducto").value = producto.precio;
  document.getElementById("existenciaProducto").value = producto.existencia;
  document.getElementById("categoriaProducto").value = producto.id_categoria || "";
  document.getElementById("btnGuardarProducto").textContent = "Guardar cambios";
  document.getElementById("btnCancelarEdicion").style.display = "inline-block";
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function cancelarEdicion() {
  document.getElementById("tituloFormProducto").textContent = "Registrar producto";
  document.getElementById("idProductoEditar").value = "";
  document.getElementById("formImagen").reset();
  document.getElementById("btnGuardarProducto").textContent = "Guardar producto";
  document.getElementById("btnCancelarEdicion").style.display = "none";
}

async function desactivarProducto(id) {
  if (!confirm("¿Seguro que quieres desactivar este producto? Ya no aparecerá en el catálogo.")) return;
  try {
    const res = await fetch(`/api/productos/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${obtenerToken()}` },
    });
    if (!res.ok) {
      const datos = await res.json();
      alert(datos.error || "No se pudo desactivar el producto");
      return;
    }
    cargarProductosAdmin();
  } catch (error) {
    alert("No se pudo conectar con el servidor");
  }
}

async function cargarProductosAdmin() {
  const cuerpo = document.getElementById("cuerpoProductosAdmin");
  try {
    const res = await fetch("/api/productos");
    const productos = await res.json();

    cuerpo.innerHTML = productos
      .map(
        (p) => `
      <tr>
        <td>${p.id_producto}</td>
        <td>${p.nombre}</td>
        <td>$${Number(p.precio).toLocaleString("es-MX")}</td>
        <td>${p.existencia}</td>
        <td>${p.estado}</td>
        <td>
          <button data-id="${p.id_producto}" class="btn-editar">Editar</button>
          <button data-id="${p.id_producto}" class="btn-desactivar" style="color:#c0392b;">Desactivar</button>
        </td>
      </tr>`
      )
      .join("");

    cuerpo.querySelectorAll(".btn-editar").forEach((btn) =>
      btn.addEventListener("click", () => {
        const producto = productos.find((p) => p.id_producto === Number(btn.dataset.id));
        editarProducto(producto);
      })
    );

    cuerpo.querySelectorAll(".btn-desactivar").forEach((btn) =>
      btn.addEventListener("click", () => desactivarProducto(btn.dataset.id))
    );

    cargarProductosSelectImagen(); // refresca el select del formulario también
  } catch (error) {
    cuerpo.innerHTML = `<tr><td colspan="6">No se pudo conectar con el servidor.</td></tr>`;
  }
}

async function cargarPedidosAdmin() {
  const cuerpo = document.getElementById("cuerpoPedidosAdmin");
  const estados = ["pendiente", "confirmado", "preparando", "enviado", "entregado", "cancelado"];

  try {
    const res = await fetch("/api/pedidos", { headers: { Authorization: `Bearer ${obtenerToken()}` } });
    const pedidos = await res.json();

    if (pedidos.length === 0) {
      cuerpo.innerHTML = `<tr><td colspan="4">Todavía no hay pedidos.</td></tr>`;
      return;
    }

    cuerpo.innerHTML = pedidos
      .map(
        (p) => `
      <tr>
        <td>#${p.id_pedido}</td>
        <td>${p.nombre} ${p.apellido}</td>
        <td>$${Number(p.total).toLocaleString("es-MX")}</td>
        <td>
          <select data-id="${p.id_pedido}" class="select-estado">
            ${estados.map((e) => `<option value="${e}" ${e === p.estado ? "selected" : ""}>${e}</option>`).join("")}
          </select>
        </td>
      </tr>`
      )
      .join("");

    cuerpo.querySelectorAll(".select-estado").forEach((select) =>
      select.addEventListener("change", async (e) => {
        try {
          const res = await fetch(`/api/pedidos/${e.target.dataset.id}/estado`, {
            method: "PUT",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${obtenerToken()}` },
            body: JSON.stringify({ estado: e.target.value }),
          });
          if (!res.ok) {
            const datos = await res.json();
            alert(datos.error || "No se pudo actualizar el estado");
          }
        } catch (error) {
          alert("No se pudo conectar con el servidor");
        }
      })
    );
  } catch (error) {
    cuerpo.innerHTML = `<tr><td colspan="4">No se pudo conectar con el servidor.</td></tr>`;
  }
}