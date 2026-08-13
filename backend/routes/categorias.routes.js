// routes/categorias.routes.js
const express = require("express");
const router = express.Router();
const categoriasController = require("../controllers/categoriasController");

router.get("/", categoriasController.listar);

module.exports = router;