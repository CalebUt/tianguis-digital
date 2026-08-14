// nav.js - genera el header/menú en todas las páginas
function renderNav() {
  const usuarioRaw = localStorage.getItem("td_usuario");
  const usuario = usuarioRaw ? JSON.parse(usuarioRaw) : null;

  const header = document.createElement("header");
  header.innerHTML = `
    <div class="header-top">
      <a href="/index.html" class="logo">Tianguis Digital</a>
      <nav>
        <ul>
          <li><a href="/index.html">Inicio</a></li>
          <li><a href="/pages/catalogo.html">Catálogo</a></li>
          <li><a href="/pages/carrito.html">Carrito</a></li>
         ${
  usuario
    ? usuario.rol === "administrador"
      ? `<li><a href="/pages/pedidos.html">Pedidos</a></li><li><a href="/pages/admin.html">Panel Admin</a></li><li><a href="#" id="linkLogout">Salir</a></li>`
      : `<li><a href="/pages/pedidos.html">Mis pedidos</a></li><li>Hola, ${usuario.nombre}</li><li><a href="#" id="linkLogout">Salir</a></li>`
    : `<li><a href="/pages/login.html">Iniciar sesión</a></li>`
}
        </ul>
      </nav>
      <form class="buscador-header" onsubmit="return buscarDesdeHeader(event)">
        <input type="text" id="buscadorHeaderInput" placeholder="Buscar productos..." />
        <button type="submit">Buscar</button>
      </form>
    </div>
  `;
  document.body.prepend(header);

  const linkLogout = document.getElementById("linkLogout");
  if (linkLogout) {
    linkLogout.addEventListener("click", (e) => {
      e.preventDefault();
      localStorage.removeItem("td_token");
      localStorage.removeItem("td_usuario");
      window.location.href = "/index.html";
    });
  }
}

function buscarDesdeHeader(event) {
  event.preventDefault();
  const texto = document.getElementById("buscadorHeaderInput").value.trim();
  window.location.href = `/pages/catalogo.html?buscar=${encodeURIComponent(texto)}`;
  return false;
}

renderNav();