// routes/auth.routes.js
const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { validarRegistro } = require("../middleware/validate");

router.post("/registro", validarRegistro, authController.registro);
router.post("/login", authController.login);

module.exports = router;