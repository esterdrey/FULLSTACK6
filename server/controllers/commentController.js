const db = require('../db');

exports.getAllComments = (req, res) => {
    const {
        postId,
        userId,
        q,
        sort = "id",
        order = "ASC"
    } = req.query;

    let sql = `
        SELECT comments.*, users.username, users.email
        FROM comments
        JOIN users ON comments.userId = users.id
        WHERE 1=1
    `;

    const params = [];

    if (postId) {
        sql += " AND comments.postId = ?";
        params.push(postId);
    }

    if (userId) {
        sql += " AND comments.userId = ?";
        params.push(userId);
    }

    if (q) {
        sql += " AND (comments.title LIKE ? OR comments.body LIKE ?)";
        params.push(`%${q}%`, `%${q}%`);
    }

    const allowedSort = ["id", "title"];
    const sortField = allowedSort.includes(sort) ? sort : "id";
    const sortOrder = order.toUpperCase() === "DESC" ? "DESC" : "ASC";

    sql += ` ORDER BY comments.${sortField} ${sortOrder}`;

    db.query(sql, params, (err, results) => {
        if (err) {
            console.error("Error fetching comments:", err);
            return res.status(500).json({ error: "Failed to fetch comments" });
        }

        res.json(results);
    });
};

exports.getCommentById = (req, res) => {
    const { id } = req.params;

    db.query(
        'SELECT * FROM comments WHERE id = ?',
        [id],
        (err, results) => {
            if (err) {
                console.error('Error fetching comment:', err);
                return res.status(500).json({ error: 'Failed to fetch comment' });
            }

            if (results.length === 0) {
                return res.status(404).json({ error: 'Comment not found' });
            }

            res.json(results[0]);
        }
    );
};

exports.createComment = (req, res) => {
    const { postId, userId, title, body } = req.body;

    if (!postId) {
        return res.status(400).json({ error: 'postId is required' });
    }

    if (!userId) {
        return res.status(400).json({ error: 'userId is required' });
    }

    if (!title) {
        return res.status(400).json({ error: 'title is required' });
    }

    if (!body) {
        return res.status(400).json({ error: 'body is required' });
    }

    const sql = `
        INSERT INTO comments (postId, userId, title, body)
        VALUES (?, ?, ?, ?)
    `;

    db.query(sql, [postId, userId, title, body], (err, result) => {
        if (err) {
            console.error('Error creating comment:', err);
            return res.status(500).json({ error: 'Failed to create comment' });
        }

        res.status(201).json({
            id: result.insertId,
            postId,
            userId,
            title,
            body
        });
    });
};

exports.updateComment = (req, res) => {
    const { id } = req.params;
    const { userId, title, body } = req.body;

    if (!userId) {
        return res.status(400).json({ error: 'userId is required' });
    }

    if (!title) {
        return res.status(400).json({ error: 'title is required' });
    }

    if (!body) {
        return res.status(400).json({ error: 'body is required' });
    }

    const sql = `
        UPDATE comments
        SET title = ?, body = ?
        WHERE id = ? AND userId = ?
    `;

    db.query(sql, [title, body, id, userId], (err, result) => {
        if (err) {
            console.error('Error updating comment:', err);
            return res.status(500).json({ error: 'Failed to update comment' });
        }

        if (result.affectedRows === 0) {
            return res.status(403).json({
                error: 'Action forbidden: comment not found or belongs to another user.'
            });
        }

        res.json({
            id: Number(id),
            userId,
            title,
            body
        });
    });
};

exports.deleteComment = (req, res) => {
    const { id } = req.params;
    const { userId } = req.body;

    if (!userId) {
        return res.status(400).json({ error: 'userId is required' });
    }

    const sql = `
        DELETE FROM comments
        WHERE id = ?
          AND (
              userId = ?
              OR EXISTS (
                  SELECT 1
                  FROM users
                  WHERE users.id = ?
                    AND users.isAdmin = 1
              )
          )
    `;

    db.query(sql, [id, userId, userId], (err, result) => {
        if (err) {
            console.error('Error deleting comment:', err);
            return res.status(500).json({ error: 'Failed to delete comment' });
        }

        if (result.affectedRows === 0) {
            return res.status(403).json({
                error: 'Action forbidden: comment not found or belongs to another user.'
            });
        }

        res.json({ message: 'Comment deleted successfully' });
    });
};