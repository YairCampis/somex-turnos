// frontend/assets/js/geo.js
(() => {
  const mapEl = document.getElementById("map");
  const geoStatusEl = document.getElementById("geoStatus");
  const distanceTextEl = document.getElementById("distanceText");
  const btnSolicitar = document.getElementById("btnSolicitar");
  api.setBase("http://localhost:4000");

  // --------- Utilidades de UI ----------
  function setStatus({ inside, distance }) {
    if (inside === true) {
      geoStatusEl.className = "badge bg-success";
      geoStatusEl.textContent = "Dentro del perímetro";
      btnSolicitar.disabled = false;
    } else if (inside === false) {
      geoStatusEl.className = "badge bg-danger";
      geoStatusEl.textContent = "Fuera del perímetro";
      btnSolicitar.disabled = true;
    } else {
      geoStatusEl.className = "badge bg-secondary";
      geoStatusEl.textContent = "Verificando ubicación…";
      btnSolicitar.disabled = true;
    }
    if (typeof distance === "number") {
      distanceTextEl.textContent = `Distancia a planta: ${distance.toFixed(0)} m`;
    }
  }

  // Navegación al crear turno cuando está habilitado
  if (btnSolicitar) {
    btnSolicitar.addEventListener("click", () => {
      // Redirige a la vista de creación de turno
      window.location.href = "nuevoTurnoViewCond.html";
    });
  }

  // --------- Configuración inicial ----------
  // Fallback por si /api/geo/config no está disponible aún
  let PLANT = { lat: 10.859123, lng: -74.773456 };
  let RADIUS = 400; // metros

  // Base de la API (puedes forzarla en localStorage: API_BASE=http://localhost:4000)
  const API_BASE = localStorage.getItem("API_BASE") || "http://localhost:4000";
  console.log("[GEO] API_BASE:", API_BASE);

  // Intentar obtener config desde backend
  fetch(`${API_BASE}/api/geo/config`)
    .then((r) =>
      r.ok ? r.json() : Promise.reject(new Error(`Config status ${r.status}`)),
    )
    .then((cfg) => {
      console.log("[GEO] cfg:", cfg);
      if (cfg?.lat && cfg?.lng && cfg?.radius) {
        PLANT = { lat: cfg.lat, lng: cfg.lng };
        RADIUS = cfg.radius;
      }
      initMap();
      locateAndValidate(); // primer intento
    })
    .catch((err) => {
      console.warn("[GEO] cfg error:", err);
      // Fallback a valores por defecto
      initMap();
      locateAndValidate();
    });

  let map, userMarker, plantMarker, fence;

  function initMap() {
    map = L.map("map").setView([PLANT.lat, PLANT.lng], 16);

    // Capa base (OSM)
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a target="_blank" href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    // Marcador de la planta
    plantMarker = L.marker([PLANT.lat, PLANT.lng], {
      title: "Planta de producción SOMEX",
    })
      .addTo(map)
      .bindPopup("<b>Planta de producción SOMEX</b>");

    // Círculo (geocerca)
    fence = L.circle([PLANT.lat, PLANT.lng], {
      color: "#198754",
      fillColor: "#198754",
      fillOpacity: 0.1,
      radius: RADIUS,
    }).addTo(map);
  }

  // --------- Geolocalización y validación ----------
  function locateAndValidate() {
    setStatus({ inside: null });
    if (!("geolocation" in navigator)) {
      distanceTextEl.textContent = "El navegador no soporta geolocalización.";
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        paintUser(latitude, longitude);
        validateServer(latitude, longitude);
        // Seguimiento continuo
        startWatch();
      },
      (err) => {
        setStatus({ inside: false });
        distanceTextEl.textContent = "No fue posible obtener tu ubicación.";
        console.warn("Geoloc error:", err);
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 },
    );
  }

  function paintUser(lat, lng) {
    if (!userMarker) {
      userMarker = L.marker([lat, lng], { title: "Mi ubicación" })
        .addTo(map)
        .bindPopup("<b>Tu ubicación</b>");
    } else {
      userMarker.setLatLng([lat, lng]);
    }
    // Ajustar encuadre para ver planta + geocerca + usuario
    const group = L.featureGroup([plantMarker, userMarker, fence]);
    map.fitBounds(group.getBounds().pad(0.2));
  }

  // Evitar spam al backend
  let lastValidateTs = 0;
  async function validateServer(lat, lng) {
    const now = Date.now();
    if (now - lastValidateTs < 1200) return; // 1.2s
    lastValidateTs = now;

    try {
      const resp = await api.post("/api/geo/validate", { lat, lng });
      console.log("[GEO] validate resp:", resp);

      if (resp.ok && resp.data) {
        setStatus({ inside: resp.data.inside, distance: resp.data.distance });
      } else {
        setStatus({ inside: false });
        distanceTextEl.textContent = resp.error || "Error validando ubicación";
      }
    } catch (e) {
      setStatus({ inside: false });
      distanceTextEl.textContent = e.message || "Error validando ubicación";
    }
  }

  // Seguimiento en vivo
  let watchId = null;
  function startWatch() {
    if (watchId !== null) return;
    watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        paintUser(latitude, longitude);
        validateServer(latitude, longitude);
      },
      (err) => console.warn("Watch geoloc error:", err),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 2000 },
    );
  }

  // Limpieza
  window.addEventListener("beforeunload", () => {
    if (watchId !== null) navigator.geolocation.clearWatch(watchId);
  });
})();

````;
