// catalogo.js - catálogo con búsqueda y filtros

async function cargarCategoriasFiltro() {
  const select = document.getElementById("filtroCategoria");
  try {
    const res = await fetch("/api/categorias");
    const categorias = await res.json();
    categorias.forEach((cat) => {
      const option = document.createElement("option");
      option.value = cat.id_categoria;
      option.textContent = cat.nombre;
      select.appendChild(option);
    });
  } catch (error) {
    console.error("Error al cargar categorías:", error);
  }
}

function construirQueryParams() {
  const params = new URLSearchParams();

  const categoria = document.getElementById("filtroCategoria").value;
  const precioMin = document.getElementById("filtroPrecioMin").value;
  const precioMax = document.getElementById("filtroPrecioMax").value;
  const buscar = document.getElementById("filtroBuscar").value;

  if (categoria) params.set("categoria", categoria);
  if (precioMin) params.set("precioMin", precioMin);
  if (precioMax) params.set("precioMax", precioMax);
  if (buscar) params.set("buscar", buscar);

  return params;
}

async function cargarProductos(params) {
  const contenedor = document.getElementById("listaProductos");
  contenedor.innerHTML = "Cargando productos...";

  try {
    const res = await fetch(`/api/productos?${params.toString()}`);
    const productos = await res.json();

    if (productos.length === 0) {
      contenedor.innerHTML = "<p>No se encontraron productos con esos filtros.</p>";
      return;
    }

    contenedor.innerHTML = productos
      .map(
        (p) => `
        <a href="producto.html?id=${p.id_producto}" class="producto-card">
          <img src="${p.imagen_url || "https://via.placeholder.com/220x160?text=Sin+imagen"}" alt="${p.nombre}" />
          <div class="producto-card-info">
            <div class="categoria-tag">${p.categoria}</div>
            <h3>${p.nombre}</h3>
            <div class="precio">$${Number(p.precio).toLocaleString("es-MX")}</div>
          </div>
        </a>
      `
      )
      .join("");
  } catch (error) {
    console.error("Error al cargar productos:", error);
    contenedor.innerHTML = "<p>No se pudo conectar con el servidor.</p>";
  }
}

// Al enviar el formulario de filtros
document.getElementById("formFiltros").addEventListener("submit", (event) => {
  event.preventDefault();
  const params = construirQueryParams();
  cargarProductos(params);
  // Actualiza la URL para que se pueda compartir/recargar con los mismos filtros
  window.history.replaceState({}, "", `catalogo.html?${params.toString()}`);
});

// Al cargar la página: lee los parámetros que vengan en la URL (ej. desde el menú de categorías o el buscador del header)
function inicializarDesdeURL() {
  const urlParams = new URLSearchParams(window.location.search);

  if (urlParams.get("categoria")) {
    document.getElementById("filtroCategoria").value = urlParams.get("categoria");
  }
  if (urlParams.get("buscar")) {
    document.getElementById("filtroBuscar").value = urlParams.get("buscar");
  }

  return urlParams;
}

async function iniciar() {
  await cargarCategoriasFiltro();
  const urlParams = inicializarDesdeURL();
  cargarProductos(urlParams);
}

iniciar();