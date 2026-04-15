// backend/server.js

require("dotenv").config();
//require("dotenv").config({ path: __dirname + "/.env" });

const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 4000;

// --- CORS: permite varios orígenes separados por coma en .env ---
const origins = (process.env.CORS_ORIGIN || "*")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: origins.length ? origins : "*",
    credentials: true,
  }),
);

// --- Body parsers ---
app.use(express.json()); // JSON
app.use(express.urlencoded({ extended: false })); // form-url-encoded (si lo necesitas)

// --- Rutas (importa una sola vez) ---
const empleadosRoutes = require("./routes/empleadosRoutes");
const conductoresRoutes = require("./routes/conductoresRoutes");
const turnosRoutes = require("./routes/turnosRoutes");
const rolesRoutes = require("./routes/rolesRoutes");
const authRoutes = require("./routes/authRoutes");
const geoRoutes = require("./routes/geoRoutes");
const statsRoutes = require("./routes/statsRoutes");
const notificacionRoutes = require("./routes/notificacionRoutes");
const auditoriaRoutes = require("./routes/auditoriaRoutes");
const accesosRoutes = require("./routes/accesosRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/empleados", empleadosRoutes);
app.use("/api/conductores", conductoresRoutes);
app.use("/api/turnos", turnosRoutes);
app.use("/api/roles", rolesRoutes);
app.use("/api/geo", geoRoutes);
app.use("/api/stats", statsRoutes);
app.use("/api/notificaciones", notificacionRoutes);
app.use("/api/auditoria", auditoriaRoutes);
app.use("/api/accesos", accesosRoutes);

// --- Endpoint de salud ---
app.get("/health", (req, res) => {
  res.json({
    ok: true,
    service: "somex-turnos-api",
    time: new Date().toISOString(),
  });
});

// --- Raíz informativa ---
app.get("/", (req, res) => {
  res.send("Servidor funcionando con conexión a MySQL en Clever Cloud!");
});

// --- 404 handler (después de todas las rutas) ---
app.use((req, res, next) => {
  res.status(404).json({ ok: false, error: "Ruta no encontrada" });
});

// --- Error handler (centralizado) ---
app.use((err, req, res, next) => {
  console.error("API error:", err);
  const status = err.status || 500;
  res
    .status(status)
    .json({ ok: false, error: err.message || "Error interno del servidor" });
});

// --- Iniciar servidor ---
/* const pool = require("./config/dbConfig");
(async () => {
  try {
    console.log("Comprobando estructura de la tabla Turnos...");
    await pool.query(`ALTER TABLE Turnos ADD COLUMN puedePasar TINYINT(1) DEFAULT 0`);
    await pool.query(`ALTER TABLE Turnos ADD COLUMN motivo VARCHAR(100) DEFAULT NULL`);
    await pool.query(`ALTER TABLE Turnos ADD COLUMN salaConductores TINYINT(1) DEFAULT 0`);
    await pool.query(`ALTER TABLE Turnos ADD COLUMN observaciones TEXT DEFAULT NULL`);
    console.log("Columnas agregadas correctamente.");
  } catch (err) {
    if (err.code === 'ER_DUP_FIELDNAME') {
      console.log("Las columnas ya existen en la base de datos.");
    } else {
      console.error("Error al intentar modificar la tabla:", err);
    }
  }
})(); */

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
