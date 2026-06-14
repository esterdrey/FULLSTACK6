const db = require('../db');

module.exports = (req, res, next) => {
    const userId = req.body?.userId || req.query?.userId;
    if (!userId) return next();

    db.query('SELECT blocked FROM users WHERE id = ?', [userId], (err, results) => {
        if (err) return next();
        if (results[0]?.blocked) {
            return res.status(403).json({ message: 'Account is blocked' });
        }
        next();
    });
};
