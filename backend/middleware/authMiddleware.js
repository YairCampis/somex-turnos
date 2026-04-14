// backend/middleware/authMiddleware.js

const jwt = require('jsonwebtoken');

const requireAuth = (req, res, next) => {

  const token = req.headers['authorization']?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Token requerido' });
  }

  try {

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.empleadoId = decoded.id;
    req.rol = decoded.rol;

    next();

  } catch (error) {

    return res.status(401).json({ message: 'Token inválido o expirado' });

  }

};


// Útil para endpoints abiertos en desarrollo
const optionalAuthInDev = (req, res, next) => {

  if (process.env.NODE_ENV === 'development') {
    return next();
  }

  return requireAuth(req, res, next);

};


module.exports = { requireAuth, optionalAuthInDev };
