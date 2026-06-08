const db = require('../db');

exports.register = (req, res) => {
    const { name, username, email, phone, website, password } = req.body;

    if (!name || !username || !password) {
        return res.status(400).json({ message: 'Name, username and password are required' });
    }

    const insertUserSql = `
        INSERT INTO users (name, username, email, phone, website)
        VALUES (?, ?, ?, ?, ?)
    `;

    db.query(insertUserSql, [name, username, email, phone, website], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: 'Username already exists or database error' });
        }

        const userId = result.insertId;

        const insertPasswordSql = `
            INSERT INTO user_passwords (userId, password)
            VALUES (?, ?)
        `;

        db.query(insertPasswordSql, [userId, password], (err2) => {
            if (err2) {
                console.error(err2);
                return res.status(500).json({ message: 'Error saving password' });
            }

            res.status(201).json({
                message: 'User registered successfully',
                user: {
                    id: userId,
                    name,
                    username,
                    email,
                    phone,
                    website
                }
            });
        });
    });
};

exports.login = (req, res) => {
    const { username, password } = req.body;

    const sql = `
        SELECT users.id, users.name, users.username, users.email, users.phone, users.website
        FROM users
        JOIN user_passwords ON users.id = user_passwords.userId
        WHERE users.username = ? AND user_passwords.password = ?
    `;

    db.query(sql, [username, password], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: 'Database error' });
        }

        if (results.length === 0) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }

        res.json({
            message: 'Login successful',
            user: results[0]
        });
    });
};