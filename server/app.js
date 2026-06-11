const express = require('express');
const db = require('./db');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const todoRoutes = require('./routes/todoRoutes');
const postRoutes = require('./routes/postRoutes');
const commentRoutes = require('./routes/commentRoutes');
const albumRoutes=require('./routes/albumRoutes');
const photoRoutes=require('./routes/photoRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/', authRoutes);
app.use('/', todoRoutes);
app.use('/posts', postRoutes);
app.use('/comments', commentRoutes);
app.use('/albums',albumRoutes);
app.use('/photos',photoRoutes);

app.get('/', (req, res) => {
    res.send('Server + MySQL Working!');
});

const isAdmin=require('./middleware/isAdmin');
app.get('/users',isAdmin, (req, res) => {
    db.query(
        'SELECT id, name, username, email, phone, website, blocked, login_attempts FROM users',
        (err, results) => {
            if (err) return res.status(500).json({ message: 'Database error' });
            res.json(results);
        }
    );
});

app.get('/users/:id', (req, res) => {
    db.query(
        'SELECT id, name, username, email, phone, website, blocked,isAdmin FROM users WHERE id = ?',
        [req.params.id],
        (err, results) => {
            if (err) return res.status(500).json({ message: 'Database error' });
            if (results.length === 0) return res.status(404).json({ message: 'User not found' });
            res.json(results[0]);
        }
    );
});

/* שינוי פרטים */
app.put('/users/:id', (req, res) => {
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

        db.query(
            'SELECT id, name, username, email, phone, website, blocked FROM users WHERE id = ?',
            [id],
            (err2, rows) => {
                if (err2) return res.status(500).json({ message: 'Database error' });
                res.json(rows[0]);
            }
        );
    });
});

/* שינוי סיסמה */
app.put('/users/:id/password', (req, res) => {
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
});

/* חסימת / שחרור משתמש */
app.put('/users/:id/block', (req, res) => {
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
});

app.listen(3000, () => {
    console.log('Server running on port 3000');
});