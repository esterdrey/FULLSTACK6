const db = require('../db');

exports.checkAdmin = (req, res) => {
    const { userId } = req.query;
    if (!userId) return res.status(401).json({ message: 'Not authenticated' });

    db.query('SELECT isAdmin FROM users WHERE id = ?', [userId], (err, results) => {
        if (err) return res.status(500).json({ message: 'Database error' });
        if (!results[0]?.isAdmin) return res.status(403).json({ message: 'Admins only' });
        res.json({ isAdmin: true });
    });
};

exports.getAllUsers = (req, res) => {
    const { userId } = req.query;

    if (!userId) {
        return res.status(401).json({ message: 'Not authenticated' });
    }

    db.query(
        'SELECT id, name, username, email, phone, website, blocked, login_attempts FROM users',
        (err, results) => {
            if (err) return res.status(500).json({ message: 'Database error' });
            res.json(results);
        }
    );
};

exports.getUserById = (req, res) => {
    db.query(
        'SELECT id, name, username, email, phone, website, blocked, isAdmin FROM users WHERE id = ?',
        [req.params.id],
        (err, results) => {
            if (err) return res.status(500).json({ message: 'Database error' });
            if (results.length === 0) return res.status(404).json({ message: 'User not found' });
            res.json(results[0]);
        }
    );
};

exports.updateUser = (req, res) => {
    const { id } = req.params;
    const { name, email, phone, website } = req.body;

    const sql = `
        UPDATE users
        SET name = ?, email = ?, phone = ?, website = ?
        WHERE id = ?
    `;

    db.query(sql, [name, email, phone, website, id], (err, result) => {
        if (err) return res.status(500).json({ message: 'Database error' });
        if (result.affectedRows === 0) return res.status(404).json({ message: 'User not found' });

        res.json({ id: Number(id), name, email, phone, website });
    });
};

exports.updatePassword = (req, res) => {
    const { id } = req.params;
    const { oldPassword, newPassword } = req.body;

    db.query(
        'SELECT password FROM user_passwords WHERE userId = ?',
        [id],
        (err, results) => {
            if (err) return res.status(500).json({ message: 'Database error' });
            if (results.length === 0) return res.status(404).json({ message: 'User password not found' });

            if (results[0].password !== oldPassword) {
                return res.status(401).json({ message: 'Old password is incorrect' });
            }

            db.query(
                'UPDATE user_passwords SET password = ? WHERE userId = ?',
                [newPassword, id],
                (err2) => {
                    if (err2) return res.status(500).json({ message: 'Database error' });
                    res.json({ message: 'Password updated successfully' });
                }
            );
        }
    );
};

exports.blockUser = (req, res) => {
    const { id } = req.params;
    const { blocked } = req.body;
    const resetAttempts = blocked ? '' : ', login_attempts = 0';

    db.query(
        `UPDATE users SET blocked = ?${resetAttempts} WHERE id = ?`,
        [blocked, id],
        (err, result) => {
            if (err) return res.status(500).json({ message: 'Database error' });
            if (result.affectedRows === 0) return res.status(404).json({ message: 'User not found' });

            res.json({
                message: blocked ? 'User blocked successfully' : 'User unblocked successfully'
            });
        }
    );
};
