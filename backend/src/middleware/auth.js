const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = async function authenticate(request, response, next) {
  const authorization = request.get('authorization') || '';
  const [scheme, token] = authorization.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return response.status(401).json({ message: 'Authentication required.' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.sub).select('_id name email');
    if (!user) {
      return response.status(401).json({ message: 'Account no longer exists.' });
    }
    request.user = user;
    return next();
  } catch {
    return response.status(401).json({ message: 'Invalid or expired token.' });
  }
};