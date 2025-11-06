// server.js
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());
app.use(cors());

// Rutas
app.use("/api/empleados", require("./routes/empleadosRoutes"));
app.use("/api/conductores", require("./routes/conductoresRoutes"));



// Ruta raíz
app.get("/", (req, res) => {
  res.send("Servidor funcionando con conexión a MySQL en Clever Cloud!");
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
