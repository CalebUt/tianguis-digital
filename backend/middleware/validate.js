// middleware/validate.js
// Validaciones en backend (nunca hay que confiar solo en las del frontend)

function validarRegistro(req, res, next) {
  const { nombre, apellido, email, password } = req.body;
  const errores = [];

  if (!nombre || nombre.trim().length < 2) errores.push("Nombre inválido");
  if (!apellido || apellido.trim().length < 2) errores.push("Apellido inválido");
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errores.push("Email inválido");
  if (!password || password.length < 8) errores.push("La contraseña debe tener al menos 8 caracteres");

  if (errores.length) return res.status(400).json({ error: errores.join(", ") });
  next();
}

function validarProducto(req, res, next) {
  const { nombre, descripcion, precio, id_categoria, existencia } = req.body;
  const errores = [];

  if (!nombre || nombre.trim().length < 3) errores.push("Nombre de producto inválido");
  if (!descripcion || descripcion.trim().length < 10) errores.push("Descripción demasiado corta (mínimo 10 caracteres)");
  if (precio === undefined || isNaN(precio) || Number(precio) < 0) errores.push("Precio inválido");
  if (!id_categoria) errores.push("Categoría requerida");
  if (existencia === undefined || isNaN(existencia) || Number(existencia) < 0) errores.push("Existencia inválida");

  if (errores.length) return res.status(400).json({ error: errores.join(", ") });
  next();
}

function validarDireccion(req, res, next) {
  const { direccionNueva, id_direccion } = req.body;

  if (id_direccion) return next(); // ya tiene una dirección guardada, no hay que validar nada más

  if (!direccionNueva) {
    return res.status(400).json({ error: "Se requiere id_direccion o direccionNueva" });
  }

  const { calle, numero, colonia, codigo_postal, municipio, estado } = direccionNueva;
  const errores = [];

  if (!calle) errores.push("Calle requerida");
  if (!numero) errores.push("Número requerido");
  if (!colonia) errores.push("Colonia requerida");
  if (!codigo_postal || !/^[0-9]{5}$/.test(codigo_postal)) errores.push("Código postal inválido (5 dígitos)");
  if (!municipio) errores.push("Municipio requerido");
  if (!estado) errores.push("Estado requerido");

  if (errores.length) return res.status(400).json({ error: errores.join(", ") });
  next();
}

module.exports = { validarRegistro, validarProducto, validarDireccion };