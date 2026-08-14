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

// POST /api/productos (solo administrador)
async function crear(req, res) {
  const { nombre, descripcion, precio, id_categoria, existencia } = req.body;

  try {
    const resultado = await pool.query(
      `INSERT INTO productos (id_usuario_vendedor, id_categoria, nombre, descripcion, precio, existencia)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [req.usuario.id_usuario, id_categoria, nombre, descripcion, precio, existencia]
    );
    res.status(201).json(resultado.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al crear el producto" });
  }
}

// PUT /api/productos/:id (solo administrador)
async function actualizar(req, res) {
  const { id } = req.params;
  const { nombre, descripcion, precio, id_categoria, existencia } = req.body;

  try {
    const resultado = await pool.query(
      `UPDATE productos SET nombre = $1, descripcion = $2, precio = $3, id_categoria = $4, existencia = $5
       WHERE id_producto = $6 RETURNING *`,
      [nombre, descripcion, precio, id_categoria, existencia, id]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }
    res.json(resultado.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al actualizar el producto" });
  }
}

// DELETE /api/productos/:id (solo administrador) — desactiva, no borra físicamente
async function desactivar(req, res) {
  const { id } = req.params;

  try {
    const resultado = await pool.query(
      `UPDATE productos SET estado = 'inactivo' WHERE id_producto = $1 RETURNING id_producto`,
      [id]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }
    res.json({ mensaje: "Producto desactivado correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al desactivar el producto" });
  }
}

module.exports = { listar, obtenerPorId, crear, actualizar, desactivar };