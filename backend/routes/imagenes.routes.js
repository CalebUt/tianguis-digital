// routes/imagenes.routes.js
const express = require("express");
const router = express.Router();
const imagenesController = require("../controllers/imagenesController");
const upload = require("../middleware/upload");
const { verificarToken, soloAdministrador } = require("../middleware/auth");

// POST /api/productos/:id/imagenes
router.post("/productos/:id/imagenes", verificarToken, soloAdministrador, upload.single("imagen"), imagenesController.subirImagenProducto);

// GET /api/imagenes/:idImagen/ver  (pública — el navegador pide la imagen aquí, sin necesitar token)
router.get("/imagenes/:idImagen/ver", imagenesController.verImagen);

// DELETE /api/imagenes/:idImagen
router.delete("/imagenes/:idImagen", verificarToken, soloAdministrador, imagenesController.eliminarImagenProducto);

module.exports = router;