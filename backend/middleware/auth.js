// middleware/auth.js
const jwt = require("jsonwebtoken");

function verificarToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // "Bearer <token>"

  if (!token) {
    return res.status(401).json({ error: "No se proporcionó un token de acceso" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, usuario) => {
    if (err) {
      return res.status(403).json({ error: "Token inválido o expirado" });
    }
    req.usuario = usuario; // { id_usuario, rol, email }
    next();
  });
}

function soloAdministrador(req, res, next) {
  if (req.usuario.rol !== "administrador") {
    return res.status(403).json({ error: "Acceso restringido a administradores" });
  }
  next();
}

module.exports = { verificarToken, soloAdministrador };