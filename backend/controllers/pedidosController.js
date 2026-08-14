// controllers/pedidosController.js
const pool = require("../config/db");

// POST /api/pedidos
// body: { id_direccion } (si ya tiene una guardada) o { direccionNueva: {...} }
async function crearPedido(req, res) {
  const { id_direccion, direccionNueva } = req.body;
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // 1) Resolver la dirección de entrega
    let idDireccionFinal = id_direccion;
    if (!idDireccionFinal && direccionNueva) {
      const { calle, numero, colonia, codigo_postal, municipio, estado } = direccionNueva;
      const dir = await client.query(
        `INSERT INTO direcciones (id_usuario, calle, numero, colonia, codigo_postal, municipio, estado)
         VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id_direccion`,
        [req.usuario.id_usuario, calle, numero, colonia, codigo_postal, municipio, estado]
      );
      idDireccionFinal = dir.rows[0].id_direccion;
    }

    if (!idDireccionFinal) {
      await client.query("ROLLBACK");
      return res.status(400).json({ error: "Se requiere una dirección de entrega" });
    }

    // 2) Obtener el carrito del usuario
    const carrito = await client.query("SELECT id_carrito FROM carrito WHERE id_usuario = $1", [req.usuario.id_usuario]);
    if (carrito.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(400).json({ error: "No tienes un carrito activo" });
    }

    const items = await client.query(
      `SELECT dc.id_producto, dc.cantidad, dc.precio_unitario, p.nombre, p.existencia
       FROM detalle_carrito dc JOIN productos p ON dc.id_producto = p.id_producto
       WHERE dc.id_carrito = $1`,
      [carrito.rows[0].id_carrito]
    );

    if (items.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(400).json({ error: "El carrito está vacío" });
    }

    // 3) Verificar existencia antes de confirmar (regla de negocio importante)
    for (const item of items.rows) {
      if (item.existencia < item.cantidad) {
        await client.query("ROLLBACK");
        return res.status(400).json({ error: `Existencia insuficiente para "${item.nombre}"` });
      }
    }

    // 4) Crear el pedido (pago simulado, por eso no hay pasarela de pago aquí)
    const total = items.rows.reduce((acc, it) => acc + it.cantidad * Number(it.precio_unitario), 0);

    const pedido = await client.query(
      `INSERT INTO pedidos (id_usuario, id_direccion, subtotal, total, estado)
       VALUES ($1, $2, $3, $3, 'pendiente') RETURNING *`,
      [req.usuario.id_usuario, idDireccionFinal, total]
    );

    // 5) Congelar cada producto en detalle_pedido y descontar existencia
    for (const item of items.rows) {
      await client.query(
        `INSERT INTO detalle_pedido (id_pedido, id_producto, nombre_producto, cantidad, precio_unitario, subtotal)
         VALUES ($1,$2,$3,$4,$5,$6)`,
        [pedido.rows[0].id_pedido, item.id_producto, item.nombre, item.cantidad, item.precio_unitario, item.cantidad * item.precio_unitario]
      );
      await client.query(`UPDATE productos SET existencia = existencia - $1 WHERE id_producto = $2`, [item.cantidad, item.id_producto]);
    }

    // 6) Vaciar el carrito
    await client.query("DELETE FROM detalle_carrito WHERE id_carrito = $1", [carrito.rows[0].id_carrito]);

    await client.query("COMMIT");
    res.status(201).json({ mensaje: "Pedido generado correctamente (pago simulado)", pedido: pedido.rows[0] });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error(error);
    res.status(500).json({ error: "Error al generar el pedido" });
  } finally {
    client.release();
  }
}

// GET /api/pedidos -> mis pedidos (comprador) o todos (administrador)
async function listarPedidos(req, res) {
  try {
    const query = req.usuario.rol === "administrador"
      ? `SELECT p.*, u.nombre, u.apellido FROM pedidos p JOIN usuarios u ON p.id_usuario = u.id_usuario ORDER BY p.fecha_pedido DESC`
      : `SELECT * FROM pedidos WHERE id_usuario = $1 ORDER BY fecha_pedido DESC`;
    const valores = req.usuario.rol === "administrador" ? [] : [req.usuario.id_usuario];

    const resultado = await pool.query(query, valores);
    res.json(resultado.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al consultar pedidos" });
  }
}

// GET /api/pedidos/:id -> detalle de un pedido
async function obtenerPedido(req, res) {
  try {
    const pedido = await pool.query("SELECT * FROM pedidos WHERE id_pedido = $1", [req.params.id]);
    if (pedido.rows.length === 0) {
      return res.status(404).json({ error: "Pedido no encontrado" });
    }
    if (req.usuario.rol !== "administrador" && pedido.rows[0].id_usuario !== req.usuario.id_usuario) {
      return res.status(403).json({ error: "No autorizado para ver este pedido" });
    }

    const detalle = await pool.query("SELECT * FROM detalle_pedido WHERE id_pedido = $1", [req.params.id]);
    res.json({ ...pedido.rows[0], productos: detalle.rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al consultar el pedido" });
  }
}

// PUT /api/pedidos/:id/estado (solo administrador)
async function cambiarEstado(req, res) {
  const { estado } = req.body;
  const validos = ["pendiente", "confirmado", "preparando", "enviado", "entregado", "cancelado"];

  if (!validos.includes(estado)) {
    return res.status(400).json({ error: "Estado inválido" });
  }

  try {
    const resultado = await pool.query("UPDATE pedidos SET estado = $1 WHERE id_pedido = $2 RETURNING *", [estado, req.params.id]);
    if (resultado.rows.length === 0) {
      return res.status(404).json({ error: "Pedido no encontrado" });
    }
    res.json(resultado.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al actualizar el estado del pedido" });
  }
}

module.exports = { crearPedido, listarPedidos, obtenerPedido, cambiarEstado };