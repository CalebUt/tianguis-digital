// controllers/authController.js
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../config/db");

// POST /api/auth/registro
async function registro(req, res) {
  const { nombre, apellido, email, password, telefono } = req.body;

  try {
    const existente = await pool.query("SELECT id_usuario FROM usuarios WHERE email = $1", [email]);
    if (existente.rows.length > 0) {
      return res.status(409).json({ error: "Ya existe una cuenta con ese email" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const rolComprador = await pool.query("SELECT id_rol FROM roles WHERE nombre_rol = 'comprador'");
    if (rolComprador.rows.length === 0) {
      return res.status(500).json({ error: "El rol 'comprador' no existe en la base de datos" });
    }
    const idRol = rolComprador.rows[0].id_rol;

    const resultado = await pool.query(
      `INSERT INTO usuarios (id_rol, nombre, apellido, email, password_hash, telefono)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id_usuario, nombre, apellido, email`,
      [idRol, nombre, apellido, email, passwordHash, telefono || null]
    );

    const nuevoUsuario = resultado.rows[0];

    // Cada usuario nuevo tiene un carrito propio esperándolo
    await pool.query("INSERT INTO carrito (id_usuario) VALUES ($1)", [nuevoUsuario.id_usuario]);

    res.status(201).json({ mensaje: "Usuario registrado correctamente", usuario: nuevoUsuario });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al registrar el usuario" });
  }
}

// POST /api/auth/login
async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email y contraseña son requeridos" });
  }

  try {
    const resultado = await pool.query(
      `SELECT u.id_usuario, u.nombre, u.apellido, u.email, u.password_hash, u.activo, r.nombre_rol
       FROM usuarios u JOIN roles r ON u.id_rol = r.id_rol
       WHERE u.email = $1`,
      [email]
    );

    if (resultado.rows.length === 0) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    const usuario = resultado.rows[0];

    if (!usuario.activo) {
      return res.status(403).json({ error: "Esta cuenta está desactivada" });
    }

    const passwordValida = await bcrypt.compare(password, usuario.password_hash);
    if (!passwordValida) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    const token = jwt.sign(
      { id_usuario: usuario.id_usuario, rol: usuario.nombre_rol, email: usuario.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "8h" }
    );

    res.json({
      token,
      usuario: {
        id_usuario: usuario.id_usuario,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        email: usuario.email,
        rol: usuario.nombre_rol,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al iniciar sesión" });
  }
}

module.exports = { registro, login };