// routes/productos.routes.js
const express = require("express");
const router = express.Router();
const productosController = require("../controllers/productosController");

router.get("/", productosController.listar);
router.get("/:id", productosController.obtenerPorId);

module.exports = router;