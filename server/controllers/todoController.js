const db = require('../db');

exports.getTodos = (req, res) => {
    const { userId } = req.query;

    let sql = 'SELECT * FROM todos';
    let params = [];

    if (userId) {
        sql += ' WHERE user_id = ?';
        params.push(userId);
    }

    sql += ' ORDER BY id';

    db.query(sql, params, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: 'Database error' });
        }

        res.json(results);
    });
};

exports.createTodo = (req, res) => {
    const { user_id, title, completed } = req.body;

    if (!user_id || !title) {
        return res.status(400).json({ message: 'user_id and title are required' });
    }

    const sql = `
        INSERT INTO todos (user_id, title, completed)
        VALUES (?, ?, ?)
    `;

    db.query(sql, [user_id, title, completed || false], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: 'Database error' });
        }

        res.status(201).json({
            message: 'Todo created successfully',
            todo: {
                id: result.insertId,
                user_id,
                title,
                completed: completed || false
            }
        });
    });
};

exports.updateTodo = (req, res) => {
    const { id } = req.params;
    const { title, completed } = req.body;

    const sql = `
        UPDATE todos
        SET title = ?, completed = ?
        WHERE id = ?
    `;

    db.query(sql, [title, completed, id], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: 'Database error' });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Todo not found' });
        }

        res.json({ message: 'Todo updated successfully' });
    });
};

exports.deleteTodo = (req, res) => {
    const { id } = req.params;

    const sql = 'DELETE FROM todos WHERE id = ?';

    db.query(sql, [id], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: 'Database error' });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Todo not found' });
        }

        res.json({ message: 'Todo deleted successfully' });
    });
};