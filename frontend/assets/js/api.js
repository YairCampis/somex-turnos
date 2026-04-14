// frontend/assets/js/api.js

const DEFAULT_BASE =
  location.hostname === "localhost" || location.hostname === "127.0.0.1"
    ? "http://localhost:4000"
    : "https://TU-DOMINIO-API"; // <-- cambia en producción

(function () {
  let _apiBase =
    window.API_BASE || localStorage.getItem("API_BASE") || DEFAULT_BASE;
  let _token = localStorage.getItem("token") || null;

  function _timeoutFetch(resource, options = {}, ms = 8000) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), ms);
    const opts = { ...options, signal: controller.signal };
    return fetch(resource, opts).finally(() => clearTimeout(id));
  }

  const api = {
    /** Permite cambiar el host base en runtime */
    setBase(url) {
      _apiBase = url;
      localStorage.setItem("API_BASE", url);
      window.API_BASE = url;
    },

    /** Permite actualizar el token sin tocar localStorage (o con él) */
    setToken(token, persist = true) {
      _token = token;
      if (persist) {
        if (token) localStorage.setItem("token", token);
        else localStorage.removeItem("token");
      }
    },

    _headers({ sendJson } = { sendJson: true }) {
      const h = { Accept: "application/json" };
      if (sendJson) h["Content-Type"] = "application/json";
      if (_token) h["Authorization"] = "Bearer " + _token;
      return h;
    },

    async _request(method, path, data, { timeoutMs = 8000, retries = 0 } = {}) {
      const sendJson = !(method === "GET" || method === "DELETE");
      const opts = { method, headers: this._headers({ sendJson }) };
      if (data && sendJson) opts.body = JSON.stringify(data);

      let lastErr;
      for (let attempt = 0; attempt <= retries; attempt++) {
        try {
          const resp = await _timeoutFetch(_apiBase + path, opts, timeoutMs);

          // 204/205: no content
          if (resp.status === 204 || resp.status === 205) {
            return { ok: true, data: null, status: resp.status };
          }

          // Intenta parsear JSON; si falla, payload vacío
          let payload = {};
          try {
            payload = await resp.json();
          } catch {
            payload = {};
          }

          if (resp.ok) {
            // Soporta {ok:true,data:...} y también payload directo
            return {
              ok: true,
              data: payload.data ?? payload,
              status: resp.status,
            };
          }

          // Manejo dedicado de 401/403
          if (resp.status === 401 || resp.status === 403) {
            // Opcional: limpiar y redirigir a login
            // this.setToken(null);
            // location.href = 'index.html';
          }

          return {
            ok: false,
            error:
              payload.error ||
              payload.msg ||
              resp.statusText ||
              "Error de solicitud",
            status: resp.status,
          };
        } catch (err) {
          lastErr = err;
          // AbortError (timeout) u otros fallos de red
          if (attempt === retries) {
            return {
              ok: false,
              error:
                err.name === "AbortError"
                  ? "Tiempo de espera agotado"
                  : "Error de red: " + err.message,
            };
          }
          // Pequeño backoff antes del reintento
          await new Promise((r) => setTimeout(r, 250 * (attempt + 1)));
        }
      }
      // Nunca debería llegar acá
      return {
        ok: false,
        error: "Error inesperado: " + (lastErr?.message || "desconocido"),
      };
    },

    get(path, opt) {
      return this._request("GET", path, null, opt);
    },
    post(path, data, opt) {
      return this._request("POST", path, data, opt);
    },
    put(path, data, opt) {
      return this._request("PUT", path, data, opt);
    },
    del(path, opt) {
      return this._request("DELETE", path, null, opt);
    },

    // Ejemplo de endpoint autenticado
    me() {
      return this.get("/api/auth/me");
    },
  };

  // Exponer globalmente
  window.API_BASE = _apiBase;
  window.api = api;
})();
