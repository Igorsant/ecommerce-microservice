const jwt = require('jsonwebtoken');

function verifyAuthentication(req, res, next) {
  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    console.log('{"level": "WARN", "correlationId": "' + req.correlationId + '", "message": "Access denied. No token provided"}');
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    const token = authHeader.replace('Bearer ', '');
    
    const jwtSecret = process.env.JWT_SECRET || 'default-secret-key';
    const decodedToken = jwt.verify(token, jwtSecret);
    
    req.userId = decodedToken.id;
    
    next(); 
    
  } catch (error) {
    console.log('{"level": "WARN", "correlationId": "' + req.correlationId + '", "message": "Invalid or expired token"}');
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
}

module.exports = verifyAuthentication;