const db = require('../db');

exports.getTodos = (req, res) => {
    const {
        username,
        userId,
        completed,
        q,
        sort = "id",
        order = "ASC"
    } = req.query;

    let sql = `
        SELECT todos.*
        FROM todos
        JOIN users ON users.id = todos.userId
        WHERE 1=1
    `;

    const params = [];

    if (username) {
        sql += " AND users.username = ?";
        params.push(username);
    }

    if (userId) {
        sql += " AND todos.userId = ?";
        params.push(userId);
    }

    if (completed !== undefined) {
        sql += " AND todos.completed = ?";
        params.push(completed === "true" || completed === "1" ? 1 : 0);
    }

    if (q) {
        sql += " AND todos.title LIKE ?";
        params.push(`%${q}%`);
    }

    const allowedSort = ["id", "title", "completed"];
    const sortField = allowedSort.includes(sort) ? sort : "id";
    const sortOrder = order.toUpperCase() === "DESC" ? "DESC" : "ASC";

    sql += ` ORDER BY todos.${sortField} ${sortOrder}`;

    db.query(sql, params, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: "Database error" });
        }

        res.json(results);
    });
};

exports.createTodo = (req, res) => {
    const { userId, title, completed } = req.body;

    if (!userId || !title) {
        return res.status(400).json({
            message: 'userId and title are required'
        });
    }

    const sql = `
        INSERT INTO todos (userId, title, completed)
        VALUES (?, ?, ?)
    `;

    db.query(sql, [userId, title, completed || false], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: 'Database error' });
        }

        res.status(201).json({
            id: result.insertId,
            userId,
            title,
            completed: completed || false
        });
    });
};

exports.updateTodo = (req, res) => {
    const { id } = req.params;
    const { userId, title, completed } = req.body;

    if (!userId || !title) {
        return res.status(400).json({
            message: 'userId and title are required'
        });
    }

    const sql = `
        UPDATE todos
        SET title = ?, completed = ?
        WHERE id = ? AND userId = ?
    `;

    db.query(sql, [title, completed, id, userId], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: 'Database error' });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Todo not found' });
        }

        db.query(
            'SELECT * FROM todos WHERE id = ? AND userId = ?',
            [id, userId],
            (err2, rows) => {
                if (err2) {
                    console.error(err2);
                    return res.status(500).json({ message: 'Database error' });
                }

                res.json(rows[0]);
            }
        );
    });
};

exports.deleteTodo = (req, res) => {
    const { id } = req.params;
    const { userId } = req.body;

    if (!userId) {
        return res.status(400).json({ message: 'userId is required' });
    }

    const sql = `
        DELETE FROM todos
        WHERE id = ? AND userId = ?
    `;

    db.query(sql, [id, userId], (err, result) => {
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