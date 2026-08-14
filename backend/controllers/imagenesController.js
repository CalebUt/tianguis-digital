// controllers/imagenesController.js
const pool = require("../config/db");
const { subirImagen, eliminarImagen, obtenerImagenStream } = require("../config/googleDrive");

// POST /api/productos/:id/imagenes  (form-data, campo "imagen")
async function subirImagenProducto(req, res) {
  const { id } = req.params; // id_producto

  if (!req.file) {
    return res.status(400).json({ error: "No se envió ninguna imagen" });
  }

  try {
    const producto = await pool.query("SELECT id_producto FROM productos WHERE id_producto = $1", [id]);
    if (producto.rows.length === 0) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    // 1) Subir el archivo a Google Drive
    const nombreArchivo = `${Date.now()}_${req.file.originalname}`;
    const { driveFileId } = await subirImagen(req.file.buffer, nombreArchivo, req.file.mimetype);

    // 2) Si es la primera imagen del producto, se marca como principal
    const existentes = await pool.query("SELECT COUNT(*) FROM imagenes WHERE id_producto = $1", [id]);
    const esPrincipal = Number(existentes.rows[0].count) === 0;

    // 3) Se inserta primero (con imagen_url vacía) para obtener el id_imagen autogenerado
    const insertado = await pool.query(
      `INSERT INTO imagenes (id_producto, drive_file_id, imagen_url, es_principal)
       VALUES ($1, $2, '', $3) RETURNING id_imagen`,
      [id, driveFileId, esPrincipal]
    );
    const idImagen = insertado.rows[0].id_imagen;

    // 4) La URL guardada apunta a nuestro propio backend, no directo a Drive
    const imagenUrl = `/api/imagenes/${idImagen}/ver`;
    const actualizado = await pool.query(
      `UPDATE imagenes SET imagen_url = $1 WHERE id_imagen = $2 RETURNING *`,
      [imagenUrl, idImagen]
    );

    res.status(201).json(actualizado.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al subir la imagen a Google Drive" });
  }
}

// GET /api/imagenes/:idImagen/ver  (ruta pública — sirve la imagen a través del backend)
async function verImagen(req, res) {
  const { idImagen } = req.params;
  try {
    const resultado = await pool.query("SELECT drive_file_id FROM imagenes WHERE id_imagen = $1", [idImagen]);
    if (resultado.rows.length === 0) {
      return res.status(404).send("Imagen no encontrada");
    }

    const streamImagen = await obtenerImagenStream(resultado.rows[0].drive_file_id);
    res.setHeader("Cache-Control", "public, max-age=86400");
    streamImagen.pipe(res);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error al obtener la imagen");
  }
}

// DELETE /api/imagenes/:idImagen
async function eliminarImagenProducto(req, res) {
  const { idImagen } = req.params;

  try {
    const imagen = await pool.query("SELECT * FROM imagenes WHERE id_imagen = $1", [idImagen]);
    if (imagen.rows.length === 0) {
      return res.status(404).json({ error: "Imagen no encontrada" });
    }

    await eliminarImagen(imagen.rows[0].drive_file_id); // borra el archivo de Drive
    await pool.query("DELETE FROM imagenes WHERE id_imagen = $1", [idImagen]); // borra la referencia

    res.json({ mensaje: "Imagen eliminada correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al eliminar la imagen" });
  }
}

module.exports = { subirImagenProducto, eliminarImagenProducto, verImagen };