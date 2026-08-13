// main.js - lógica de la página principal

async function cargarCategorias() {
  try {
    const res = await fetch("/api/categorias");
    const categorias = await res.json();
    const contenedor = document.getElementById("listaCategorias");
    contenedor.innerHTML = categorias
      .map(
        (cat) =>
          `<a href="/pages/catalogo.html?categoria=${cat.id_categoria}">${cat.nombre}</a>`
      )
      .join("");
  } catch (error) {
    console.error("Error al cargar categorías:", error);
  }
}

async function cargarProductosDestacados() {
  try {
    const res = await fetch("/api/productos");
    const productos = await res.json();
    const contenedor = document.getElementById("listaProductosDestacados");

    if (productos.length === 0) {
      contenedor.innerHTML = "<p>No hay productos disponibles.</p>";
      return;
    }

    contenedor.innerHTML = productos
      .slice(0, 8)
      .map(
        (p) => `
        <a href="/pages/producto.html?id=${p.id_producto}" class="producto-card">
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
    document.getElementById("listaProductosDestacados").innerHTML =
      "<p>No se pudo conectar con el servidor.</p>";
  }
}

cargarCategorias();
cargarProductosDestacados();