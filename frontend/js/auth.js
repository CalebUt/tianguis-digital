// auth.js - validación de formularios de login y registro
// La conexión real con /api/auth/login y /api/auth/registro se agrega en el Video 5 (backend)

function mostrarError(elementoMensaje, texto) {
  elementoMensaje.textContent = texto;
  elementoMensaje.style.color = "#c0392b";
}

function mostrarExito(elementoMensaje, texto) {
  elementoMensaje.textContent = texto;
  elementoMensaje.style.color = "#2e7d32";
}

const formLogin = document.getElementById("formLogin");
if (formLogin) {
  formLogin.addEventListener("submit", async (event) => {
    event.preventDefault();
    const mensaje = document.getElementById("mensajeLogin");
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    if (!email || !password) {
      mostrarError(mensaje, "Debes llenar correo y contraseña.");
      return;
    }
    if (password.length < 8) {
      mostrarError(mensaje, "La contraseña debe tener al menos 8 caracteres.");
      return;
    }

    // TODO (Video 5): reemplazar por fetch("/api/auth/login", { method: "POST", body: JSON.stringify({ email, password }) })
try {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const datos = await res.json();

  if (!res.ok) {
    mostrarError(mensaje, datos.error || "No se pudo iniciar sesión");
    return;
  }

localStorage.setItem("td_token", datos.token);
localStorage.setItem("td_usuario", JSON.stringify(datos.usuario));
mostrarExito(mensaje, `Bienvenido, ${datos.usuario.nombre}`);

// Redirige según el rol: admin va directo a su panel, comprador va al inicio
setTimeout(() => {
  if (datos.usuario.rol === "administrador") {
    window.location.href = "admin.html";
  } else {
    window.location.href = "/index.html";
  }
}, 800); // pequeña pausa para que alcances a ver el mensaje de bienvenida
} catch (error) {
  mostrarError(mensaje, "No se pudo conectar con el servidor");
}
  });
}

const formRegistro = document.getElementById("formRegistro");
if (formRegistro) {
  formRegistro.addEventListener("submit", async (event) => {
    event.preventDefault();
    const mensaje = document.getElementById("mensajeRegistro");
    const nombre = document.getElementById("nombre").value.trim();
    const apellido = document.getElementById("apellido").value.trim();
    const email = document.getElementById("email").value.trim();
    const telefono = document.getElementById("telefono").value.trim();
    const password = document.getElementById("password").value;

    if (!nombre || !apellido || !email || !password) {
      mostrarError(mensaje, "Todos los campos obligatorios deben llenarse.");
      return;
    }
    if (password.length < 8) {
      mostrarError(mensaje, "La contraseña debe tener al menos 8 caracteres.");
      return;
    }
    if (telefono && !/^[0-9]{10}$/.test(telefono)) {
      mostrarError(mensaje, "El teléfono debe tener 10 dígitos.");
      return;
    }

    // TODO (Video 5): reemplazar por fetch("/api/auth/registro", { method: "POST", body: JSON.stringify({...}) })
 try {
  const res = await fetch("/api/auth/registro", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nombre, apellido, email, telefono, password }),
  });
  const datos = await res.json();

  if (!res.ok) {
    mostrarError(mensaje, datos.error || "No se pudo registrar");
    return;
  }

  mostrarExito(mensaje, "Cuenta creada correctamente. Ya puedes iniciar sesión.");
  formRegistro.reset();
} catch (error) {
  mostrarError(mensaje, "No se pudo conectar con el servidor");
}
  });
}