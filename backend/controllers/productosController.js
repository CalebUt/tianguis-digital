// controllers/productosController.js
const pool = require("../config/db");

// GET /api/productos?categoria=1&precioMin=100&precioMax=5000&buscar=laptop
async function listar(req, res) {
  const { categoria, precioMin, precioMax, buscar } = req.query;

  const condiciones = ["p.estado = 'activo'"];
  const valores = [];
  let contador = 1;

  if (categoria) {
    condiciones.push(`p.id_categoria = $${contador++}`);
    valores.push(categoria);
  }
  if (precioMin) {
    condiciones.push(`p.precio >= $${contador++}`);
    valores.push(precioMin);
  }
  if (precioMax) {
    condiciones.push(`p.precio <= $${contador++}`);
    valores.push(precioMax);
  }
  if (buscar) {
    condiciones.push(`p.nombre ILIKE $${contador++}`);
    valores.push(`%${buscar}%`);
  }

  const whereClause = condiciones.length ? `WHERE ${condiciones.join(" AND ")}` : "";

  try {
    const resultado = await pool.query(
      `SELECT p.id_producto, p.nombre, p.descripcion, p.precio, p.existencia,
              c.nombre AS categoria,
              (SELECT imagen_url FROM imagenes i WHERE i.id_producto = p.id_producto AND i.es_principal = TRUE LIMIT 1) AS imagen_url
       FROM productos p
       JOIN categorias c ON c.id_categoria = p.id_categoria
       ${whereClause}
       ORDER BY p.fecha_registro DESC`,
      valores
    );
    res.json(resultado.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al consultar productos" });
  }
}

// GET /api/productos/:id
async function obtenerPorId(req, res) {
  const { id } = req.params;

  try {
    const resultado = await pool.query(
      `SELECT p.id_producto, p.nombre, p.descripcion, p.precio, p.existencia,
              c.nombre AS categoria,
              u.nombre AS vendedor_nombre,
              (SELECT imagen_url FROM imagenes i WHERE i.id_producto = p.id_producto AND i.es_principal = TRUE LIMIT 1) AS imagen_url
       FROM productos p
       JOIN categorias c ON c.id_categoria = p.id_categoria
       JOIN usuarios u ON u.id_usuario = p.id_usuario_vendedor
       WHERE p.id_producto = $1 AND p.estado = 'activo'`,
      [id]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    res.json(resultado.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al consultar el producto" });
  }
}

module.exports = { listar, obtenerPorId };