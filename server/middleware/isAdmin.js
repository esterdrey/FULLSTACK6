const db = require('../db');

const isAdmin = (req, res, next) => {
    const userId = req.query.userId || req.body.userId;

    if (!userId) return res.status(401).json({ message: 'Not authenticated' });

    db.query('SELECT isAdmin FROM users WHERE id = ?', [userId], (err, results) => {
        if (err || results.length === 0) return res.status(500).json({ message: 'Database error' });
        if (!results[0].isAdmin) return res.status(403).json({ message: 'Admins only' });
        next();
    });
};

module.exports = isAdmin;
