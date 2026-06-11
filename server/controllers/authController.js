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
        SELECT users.id, users.name, users.username, users.email, users.phone, users.website,
               users.blocked, users.isAdmin, users.login_attempts,
               user_passwords.password AS stored_password
        FROM users
        JOIN user_passwords ON users.id = user_passwords.userId
        WHERE users.username = ?
    `;

    db.query(sql, [username], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: 'Database error' });
        }

        if (results.length === 0) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }

        const user = results[0];

        if (user.blocked) {
            return res.status(403).json({ message: 'This account is blocked. Contact admin.' });
        }

        if (user.stored_password !== password) {
            const newAttempts = user.login_attempts + 1;
            if (newAttempts >= 3) {
                db.query('UPDATE users SET login_attempts = ?, blocked = 1 WHERE id = ?', [newAttempts, user.id]);
                return res.status(403).json({ message: 'Account locked after 3 failed attempts. Contact admin.' });
            }
            db.query('UPDATE users SET login_attempts = ? WHERE id = ?', [newAttempts, user.id]);
            return res.status(401).json({ message: `Invalid password. ${3 - newAttempts} attempt(s) remaining.` });
        }

        db.query('UPDATE users SET login_attempts = 0 WHERE id = ?', [user.id]);

        const { stored_password, login_attempts, ...userToReturn } = user;
        res.json({ message: 'Login successful', user: userToReturn });
    });
};