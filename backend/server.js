require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");

const pool = require("./config/db");

const authRoutes = require("./routes/auth.routes");
const productosRoutes = require("./routes/productos.routes");
const categoriasRoutes = require("./routes/categorias.routes");
const carritoRoutes = require("./routes/carrito.routes");
const pedidosRoutes = require("./routes/pedidos.routes");
const imagenesRoutes = require("./routes/imagenes.routes");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "..", "frontend")));

app.use("/api/auth", authRoutes);
app.use("/api/productos", productosRoutes);
app.use("/api/categorias", categoriasRoutes);
app.use("/api/carrito", carritoRoutes);
app.use("/api/pedidos", pedidosRoutes);
app.use("/api", imagenesRoutes);

app.get("/api/health", async (req, res) => {
  try {
    const resultado = await pool.query("SELECT NOW()");
    res.json({ estado: "ok", horaServidorBD: resultado.rows[0].now });
  } catch (error) {
    console.error(error);
    res.status(500).json({ estado: "error", mensaje: "No se pudo conectar a la base de datos" });
  }
});

// Ruta no encontrada (404 genérico para rutas de API que no existen)
app.use("/api", (req, res) => {
  res.status(404).json({ error: "Ruta no encontrada" });
});

// Manejo de errores centralizado — cualquier error no controlado cae aquí
app.use((err, req, res, next) => {
  console.error("Error no controlado:", err);
  res.status(500).json({ error: "Error interno del servidor" });
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});