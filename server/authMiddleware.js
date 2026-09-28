import jwt from 'jsonwebtoken';
import User from './User.js';

export async function requireAuth(req, res, next) {
  const authorization = req.get('authorization') || '';
  const token = authorization.startsWith('Bearer ') ? authorization.slice(7) : '';

  if (!token) {
    return res.status(401).json({ success: false, message: 'Sign in to continue.' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'local-development-secret-change-me');
    const user = await User.findById(payload.sub).select('-passwordHash');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Your session is no longer valid.' });
    }
    req.user = user;
    next();
  } catch {
    return res.status(401).json({ success: false, message: 'Your session is invalid or expired. Please sign in again.' });
  }
}

export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Your account type cannot access this resource.' });
    }
    next();
  };
}