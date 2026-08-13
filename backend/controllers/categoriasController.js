// controllers/categoriasController.js
const pool = require("../config/db");

// GET /api/categorias
async function listar(req, res) {
  try {
    const resultado = await pool.query(
      "SELECT id_categoria, nombre FROM categorias WHERE activa = TRUE ORDER BY nombre"
    );
    res.json(resultado.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al consultar categorías" });
  }
}

module.exports = { listar };