// routes/pedidos.routes.js
const express = require("express");
const router = express.Router();
const pedidosController = require("../controllers/pedidosController");
const { verificarToken, soloAdministrador } = require("../middleware/auth");
const { validarDireccion } = require("../middleware/validate");

router.use(verificarToken); // todo pedidos requiere sesión iniciada

router.post("/", validarDireccion, pedidosController.crearPedido);
router.get("/", pedidosController.listarPedidos);
router.get("/:id", pedidosController.obtenerPedido);
router.put("/:id/estado", soloAdministrador, pedidosController.cambiarEstado);

module.exports = router;