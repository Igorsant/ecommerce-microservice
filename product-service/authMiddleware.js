const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ 
      error: "Token de autenticação não fornecido", 
      correlationId: req.correlationId 
    });
  }

  try {
    const secret = process.env.JWT_SECRET || 'sua_chave_secreta_compartilhada';
    
    const decoded = jwt.verify(token, secret);
    
    req.user = decoded;
    
    console.log(JSON.stringify({
      level: "INFO",
      message: "Usuário autenticado",
      userId: decoded.id,
      correlationId: req.correlationId
    }));

    next();
  } catch (err) {
    return res.status(403).json({ 
      error: "Token inválido ou expirado", 
      correlationId: req.correlationId 
    });
  }
};

module.exports = authMiddleware;