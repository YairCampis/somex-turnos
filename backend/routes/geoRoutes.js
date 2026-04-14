// routes/geoRoutes.js
const router = require('express').Router();
const { optionalAuthInDev } = require('../middleware/authMiddleware');

// Config pública
router.get('/config', (req, res) => {
  const PLAT = parseFloat(process.env.PLANT_LAT);
  const PLNG = parseFloat(process.env.PLANT_LNG);
  const R = parseInt(process.env.RADIUS_METERS || '400', 10);
  if (Number.isNaN(PLAT) || Number.isNaN(PLNG)) {
    return res.status(500).json({ ok:false, msg:'Config de planta inválida' });
  }
  res.json({ ok:true, lat: PLAT, lng: PLNG, radius: R });
});

router.post('/validate', optionalAuthInDev, (req, res) => {
  const { lat, lng } = req.body;
  const PLAT = parseFloat(process.env.PLANT_LAT);
  const PLNG = parseFloat(process.env.PLANT_LNG);
  const R = parseInt(process.env.RADIUS_METERS || '400', 10); // 400m por defecto

  if (![lat, lng].every(v => typeof v === 'number')) {
    return res.status(400).json({ ok:false, msg:'Coordenadas inválidas' });
  }

  const d = haversineMeters(lat, lng, PLAT, PLNG);
  return res.json({ ok:true, inside: d <= R, distance: d });
});

function haversineMeters(lat1, lon1, lat2, lon2) {
  const toRad = v => (v * Math.PI) / 180;
  const R = 6371000;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat/2)**2 +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
            Math.sin(dLon/2)**2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

module.exports = router;
