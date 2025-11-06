// backend/server.js

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 4000;

//dotenv.config();
app.use(bodyParser.json());

// Middlewares
app.use(cors());
app.use(express.json());

// Rutas
app.use("/api/empleados", require("./routes/empleadosRoutes"));
app.use("/api/conductores", require("./routes/conductoresRoutes"));
app.use("/api/turnos", require("./routes/turnosRoutes"));
app.use("/api/roles",require("./routes/rolesRoutes"));

// Rutas de autenticación
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);


// Endpoint base
app.get("/", (req, res) => {
  res.send("Servidor funcionando con conexión a MySQL en Clever Cloud!");
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});



