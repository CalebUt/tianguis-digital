require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");

const pool = require("./config/db");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "..", "frontend")));

app.get("/api/health", async (req, res) => {
  try {
    const resultado = await pool.query("SELECT NOW()");
    res.json({ estado: "ok", horaServidorBD: resultado.rows[0].now });
  } catch (error) {
    console.error(error);
    res.status(500).json({ estado: "error", mensaje: "No se pudo conectar a la base de datos" });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});