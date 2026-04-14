  //login.js
  (function () {
    const form = document.getElementById('loginForm');
    const msg = document.getElementById('loginMsg');
    const submitBtn = form?.querySelector('button[type="submit"]');

    const routesByRole = {
      porteria: '/frontend/porteria.html',
      logistica: '/frontend/logistica.html',
      admin: '/frontend/admin.html'
    };

    form?.addEventListener('submit', async (e) => {
      e.preventDefault();
      msg.textContent = '';

      submitBtn.disabled = true;
      const originalText = submitBtn.textContent;
      submitBtn.textContent = 'Entrando...';

      try {
        const fd = new FormData(form);
        const body = Object.fromEntries(fd.entries()); // { email, password }

        const r = await api.post('/api/auth/login', body);
        if (!r.ok) {
          msg.textContent = r.error || 'Credenciales inválidas';
          return;
        }

        const { token, user } = r.data;
        localStorage.setItem('token', token);

        // Redirección por rol
        const to = routesByRole[user?.rol] || '/frontend/dashboard.html';
        window.location.href = to;
      } catch (err) {
        msg.textContent = err.message || 'Error de conexión. Intenta de nuevo.';
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
      }
    });
  })();