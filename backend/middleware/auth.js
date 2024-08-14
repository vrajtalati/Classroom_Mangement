const jwt = require('jsonwebtoken');

const authMiddleware = (role) => {
  return (req, res, next) => {
    const token = req.header('Authorization').replace('Bearer ', '');
    if (!token) return res.status(401).send('Access Denied');

    try {
      const verified = jwt.verify(token, 'secretKey');
      req.user = verified;

      if (role && req.user.role !== role) {
        return res.status(403).send('Forbidden');
      }

      next();
    } catch (err) {
      res.status(400).send('Invalid Token');
    }
  };
};

module.exports = authMiddleware;
