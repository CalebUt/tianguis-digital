// routes/carrito.routes.js
const express = require("express");
const router = express.Router();
const carritoController = require("../controllers/carritoController");
const { verificarToken } = require("../middleware/auth");

router.use(verificarToken); // todo el carrito requiere sesión iniciada

router.get("/", carritoController.verCarrito);
router.post("/", carritoController.agregarProducto);
router.put("/:idDetalle", carritoController.actualizarCantidad);
router.delete("/:idDetalle", carritoController.eliminarProducto);

module.exports = router;