// routes/productos.routes.js
const express = require("express");
const router = express.Router();
const productosController = require("../controllers/productosController");
const { verificarToken, soloAdministrador } = require("../middleware/auth");
const { validarProducto } = require("../middleware/validate");

router.get("/", productosController.listar);
router.get("/:id", productosController.obtenerPorId);

router.post("/", verificarToken, soloAdministrador, validarProducto, productosController.crear);
router.put("/:id", verificarToken, soloAdministrador, validarProducto, productosController.actualizar);
router.delete("/:id", verificarToken, soloAdministrador, productosController.desactivar);

module.exports = router;