// controllers/carritoController.js
const pool = require("../config/db");

async function obtenerOcrearCarrito(idUsuario) {
  const existente = await pool.query("SELECT * FROM carrito WHERE id_usuario = $1", [idUsuario]);
  if (existente.rows.length > 0) return existente.rows[0];

  const nuevo = await pool.query("INSERT INTO carrito (id_usuario) VALUES ($1) RETURNING *", [idUsuario]);
  return nuevo.rows[0];
}

// GET /api/carrito
async function verCarrito(req, res) {
  try {
    const carrito = await obtenerOcrearCarrito(req.usuario.id_usuario);

    const items = await pool.query(
      `SELECT dc.id_detalle, dc.id_producto, dc.cantidad, dc.precio_unitario,
              p.nombre, p.existencia,
              (SELECT imagen_url FROM imagenes im WHERE im.id_producto = p.id_producto AND im.es_principal = TRUE LIMIT 1) AS imagen_url
       FROM detalle_carrito dc
       JOIN productos p ON dc.id_producto = p.id_producto
       WHERE dc.id_carrito = $1`,
      [carrito.id_carrito]
    );

    const total = items.rows.reduce((acc, it) => acc + it.cantidad * Number(it.precio_unitario), 0);
    res.json({ items: items.rows, total: total.toFixed(2) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al consultar el carrito" });
  }
}

// POST /api/carrito  body: { id_producto, cantidad }
async function agregarProducto(req, res) {
  const { id_producto, cantidad } = req.body;

  if (!id_producto || !cantidad || cantidad < 1) {
    return res.status(400).json({ error: "id_producto y cantidad (mínimo 1) son requeridos" });
  }

  try {
    const producto = await pool.query("SELECT precio, existencia FROM productos WHERE id_producto = $1", [id_producto]);
    if (producto.rows.length === 0) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }
    if (producto.rows[0].existencia < cantidad) {
      return res.status(400).json({ error: "No hay suficiente existencia de este producto" });
    }

    const carrito = await obtenerOcrearCarrito(req.usuario.id_usuario);

    const resultado = await pool.query(
      `INSERT INTO detalle_carrito (id_carrito, id_producto, cantidad, precio_unitario)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (id_carrito, id_producto)
       DO UPDATE SET cantidad = detalle_carrito.cantidad + EXCLUDED.cantidad
       RETURNING *`,
      [carrito.id_carrito, id_producto, cantidad, producto.rows[0].precio]
    );

    res.status(201).json(resultado.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al agregar el producto al carrito" });
  }
}

// PUT /api/carrito/:idDetalle  body: { cantidad }
async function actualizarCantidad(req, res) {
  const { cantidad } = req.body;
  if (!cantidad || cantidad < 1) {
    return res.status(400).json({ error: "Cantidad inválida" });
  }

  try {
    const resultado = await pool.query(
      `UPDATE detalle_carrito SET cantidad = $1
       WHERE id_detalle = $2 AND id_carrito = (SELECT id_carrito FROM carrito WHERE id_usuario = $3)
       RETURNING *`,
      [cantidad, req.params.idDetalle, req.usuario.id_usuario]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({ error: "Elemento del carrito no encontrado" });
    }
    res.json(resultado.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al actualizar el carrito" });
  }
}

// DELETE /api/carrito/:idDetalle
async function eliminarProducto(req, res) {
  try {
    const resultado = await pool.query(
      `DELETE FROM detalle_carrito
       WHERE id_detalle = $1 AND id_carrito = (SELECT id_carrito FROM carrito WHERE id_usuario = $2)
       RETURNING id_detalle`,
      [req.params.idDetalle, req.usuario.id_usuario]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({ error: "Elemento del carrito no encontrado" });
    }
    res.json({ mensaje: "Producto eliminado del carrito" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al eliminar del carrito" });
  }
}

module.exports = { verCarrito, agregarProducto, actualizarCantidad, eliminarProducto };