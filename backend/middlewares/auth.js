const jwt = require('jsonwebtoken');

const verificarToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ mensaje: "Token no proporcionado" });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ mensaje: "Token inválido o expirado" });
    req.user = user;
    req.idConductor = String(user.idConductor || user.id || user.sub);
    next();
  });
};

module.exports = verificarToken;
