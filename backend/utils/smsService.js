// backend/utils/smsService.js
const pool = require("../config/dbConfig");

/**
 * Servicio centralizado para el envío de notificaciones.
 * Actualmente funciona como SIMULADOR insertando en la BD para el frontend.
 * 
 * PARA PRODUCCIÓN: 
 * Aquí es donde se integraría Twilio, o WhatsApp Business API.
 */
const sendSMS = async ({ idTurno, id_usuario, celular, mensaje }) => {
  try {
    // 1. LÓGICA DE SIMULACIÓN (Base de datos)
    // El frontend (Simulador) lee de esta tabla
    const fecha = new Date().toLocaleString("en-CA", {
      timeZone: "America/Bogota",
      hour12: false,
    }).replace(",", "");

    await pool.query(
      "INSERT INTO Notificaciones (id_turno, id_usuario, numero_celular, mensaje, tipo, receptor_tipo, estado, fecha_creacion) VALUES (?, ?, ?, ?, 'SMS', 'Conductor', 'pendiente', ?)",
      [idTurno, id_usuario || null, celular, mensaje, fecha]
    );

    console.log(`[SMS SERVICE] Notificación encolada para ${celular}: ${mensaje.substring(0, 30)}...`);

    // 2. LÓGICA DE PRODUCCIÓN (Ejemplo con Twilio - Descomentar y configurar en el futuro)
    /*
    const client = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    await client.messages.create({
       body: mensaje,
       from: process.env.TWILIO_PHONE_NUMBER,
       to: celular.startsWith('+') ? celular : `+57${celular}` // Ejemplo para Colombia
    });
    */

    return { ok: true };
  } catch (error) {
    console.error("[SMS SERVICE] Error:", error.message);
    return { ok: false, error: error.message };
  }
};

module.exports = {
  sendSMS
};
