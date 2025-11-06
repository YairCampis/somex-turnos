// backend/controllers/authController.js

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Empleado = require("../models/empleadosModel");
console.log(" Empleado:", Empleado);

exports.registrar = async (req, res) => {
  try {
    const { nombreCompleto, correo, contrasena, idRol } = req.body;

    // Verificar si ya existe
    const existeEmpleado = await Empleado.buscarPorCorreo(correo);
    if (existeEmpleado) {
      return res.status(400).json({ message: "El correo ya está registrado" });
    }

    // Encriptar contraseña
    const hashedPassword = await bcrypt.hash(contrasena, 10);

    // Crear empleado
    await Empleado.crear({
      nombreCompleto,
      correo,
      contrasena: hashedPassword, // coincide con tu tabla
      idRol,
    });

    res.status(201).json({ message: "Empleado registrado exitosamente" });
  } catch (error) {
    console.error("❌ Error en registrar:", error);
    res.status(500).json({ message: "Error al registrar empleado", error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { correo, contrasena } = req.body;

    const empleado = await Empleado.buscarPorCorreo(correo);
    if (!empleado) {
      return res.status(401).json({ message: "Credenciales inválidas" });
    }

    // Comparar contraseña
    const esValida = await bcrypt.compare(contrasena, empleado.contrasena);
    if (!esValida) {
      return res.status(401).json({ message: "Credenciales inválidas" });
    }

    // Generar token
    const token = jwt.sign(
      { id: empleado.idEmpleado, correo: empleado.correo, rol: empleado.idRol },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ message: "Login exitoso", token });
  } catch (error) {
    console.error("❌ Error en login:", error);
    res.status(500).json({ message: "Error al iniciar sesión", error: error.message });
  }
};


