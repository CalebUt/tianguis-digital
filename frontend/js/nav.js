// nav.js - genera el header/menú en todas las páginas
function renderNav() {
  const header = document.createElement("header");
  header.innerHTML = `
    <div class="header-top">
      <a href="/index.html" class="logo">Tianguis Digital</a>
      <nav>
        <ul>
          <li><a href="/index.html">Inicio</a></li>
          <li><a href="/pages/catalogo.html">Catálogo</a></li>
          <li><a href="/pages/carrito.html">Carrito</a></li>
          <li><a href="/pages/login.html">Iniciar sesión</a></li>
        </ul>
      </nav>
      <form class="buscador-header" onsubmit="return buscarDesdeHeader(event)">
        <input type="text" id="buscadorHeaderInput" placeholder="Buscar productos..." />
        <button type="submit">Buscar</button>
      </form>
    </div>
  `;
  document.body.prepend(header);
}

function buscarDesdeHeader(event) {
  event.preventDefault();
  const texto = document.getElementById("buscadorHeaderInput").value.trim();
  window.location.href = `/pages/catalogo.html?buscar=${encodeURIComponent(texto)}`;
  return false;
}

renderNav();