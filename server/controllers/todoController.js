const db = require('../db');

exports.getTodos = (req, res) => {
    const { username } = req.query;

    let sql = 'SELECT todos.* FROM todos JOIN users ON users.id=todos.userId';
    let params = [];

    if (username) {
        sql += ' WHERE username = ?';
        params.push(username);
    }

    sql += ' ORDER BY todos.id';

    db.query(sql, params, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: 'Database error' });
        }

        res.json(results);
    });
};

exports.createTodo = (req, res) => {
    const { userId, title, completed } = req.body;

    if (!userId || !title) {
        return res.status(400).json({ message: 'userId and title are required' });
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
                completed: completed || false});
    });
};

exports.updateTodo = (req, res) => {
    const { id } = req.params;
    const { userId,title, completed } = req.body;

    const sql = `
        UPDATE todos
        SET title = ?, completed = ?
        WHERE id = ?
        AND userId=?
    `;

    db.query(sql, [title, completed, id,userId], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: 'Database error' });
        }

        db.query('SELECT * FROM todos WHERE id = ? AND userId=?', [id,userId], (err2, rows) => {
        if (err2) {
          console.error(err2);
          return res.status(500).json({ message: 'Database error' });
        }
        if (rows.length === 0) {
          return res.status(404).json({ message: 'Todo not found' });
        }
        res.json(rows[0]);
      });
    });
};

exports.deleteTodo = (req, res) => {
    const { id } = req.params;
    const {userId}=req.body;

    const sql = 'DELETE FROM todos WHERE id = ? AND userId=?';

    db.query(sql, [id,userId], (err, result) => {
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