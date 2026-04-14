// guard.js

(function () {

  const token = localStorage.getItem('token');

  if (!token) {
    window.location.href = "index.html";
    return;
  }

  document.addEventListener('DOMContentLoaded', () => {
    api.me()
      .then((r) => {

        if (!r.ok) {
          localStorage.removeItem("token");
          window.location.href = "index.html";
          return;
        }

        const user = r.data;

        // Guardamos usuario global
        window.currentUser = user;

        // Rol requerido en la página
        const requiredRole = document.body.getAttribute("data-role");

        if (requiredRole && String(user.rol) !== String(requiredRole)) {

          alert("No tienes permisos para acceder a esta página");

          window.location.href = "index.html";
          return;
        }

        console.log("Usuario autenticado:", user);

      })
      .catch((err) => {
        console.error("Guard error:", err);
        localStorage.removeItem("token");
        window.location.href = "index.html";
      });
  });

})();