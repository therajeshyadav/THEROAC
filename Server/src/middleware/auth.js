const jwt = require('jsonwebtoken');
const { User } = require('../models');

exports.authenticate = async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: 'Missing token' });
  const token = header.split(' ')[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(payload.id);
    if (!user) return res.status(401).json({ error: 'User not found' });
    
    // Check if user is banned
    if (user.status === 'banned') {
      return res.status(403).json({ 
        error: 'Your account has been banned. Please contact admin for further assistance.',
        isBanned: true,
        supportEmail: 'support@theroac.com',
        supportPhone: '+91-0000000000'
      });
    }
    
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};
