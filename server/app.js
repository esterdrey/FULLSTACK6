const express = require('express');
const db = require('./db');

const authRoutes = require('./routes/authRoutes');
const todoRoutes = require('./routes/todoRoutes');

const app = express();

app.use(express.json());

app.use('/', authRoutes);
app.use('/', todoRoutes);

app.get('/', (req, res) => {
    res.send('Server + MySQL Working!');
});

app.get('/users', (req, res) => {
    db.query('SELECT * FROM users', (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: 'Database error' });
        }

        res.json(results);
    });
});

app.listen(3000, () => {
    console.log('Server running on port 3000');
});