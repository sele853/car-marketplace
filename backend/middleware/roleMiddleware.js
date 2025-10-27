export const adminOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Not authenticated' });
  }
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

export const sellerOrAdminOnly = (req, res, next) => {
  if (req.user.role === 'seller' || req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Only sellers or admins can perform this action.' });
  }
};


export const buyerOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Not authenticated' });
  }
  if (req.user.role !== 'buyer' && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Buyer or admin access required' });
  }
  next();
};