const bcrypt = require("bcrypt");

(async () => {
  const hash = await bcrypt.hash("liam", 10); //se coloca la contraseña que se desee hashear en la bd y se corre en el bash el comando: node hash.js
  console.log(hash);
})();