const db = require('../db');

exports.getAllPosts = (req, res) => {
    const {
        username,
        userId,
        q,
        sort = "id",
        order = "ASC",
        includeComments
    } = req.query;

    let sql = `
        SELECT posts.*, users.username, users.email
        FROM posts
        JOIN users ON users.id = posts.userId
        WHERE 1=1
    `;

    const params = [];

    if (username) {
        sql += " AND users.username = ?";
        params.push(username);
    }

    if (userId) {
        sql += " AND posts.userId = ?";
        params.push(userId);
    }

    if (q) {
        sql += " AND (posts.title LIKE ? OR posts.body LIKE ?)";
        params.push(`%${q}%`, `%${q}%`);
    }

    const allowedSort = ["id", "title"];
    const sortField = allowedSort.includes(sort) ? sort : "id";
    const sortOrder = order.toUpperCase() === "DESC" ? "DESC" : "ASC";

    sql += ` ORDER BY posts.${sortField} ${sortOrder}`;

    if (req.query.limit !== undefined) {
        const limit = Math.min(parseInt(req.query.limit) || 10, 50);
        const offset = Math.max(parseInt(req.query.offset) || 0, 0);

        sql += ` LIMIT ? OFFSET ?`;
        params.push(limit, offset);
    }

    db.query(sql, params, (err, posts) => {
        if (err) {
            console.error('Error fetching posts:', err);
            return res.status(500).json({ error: 'Failed to fetch posts' });
        }

        if (includeComments !== "true" || posts.length === 0) {
            return res.json(posts);
        }

        const postIds = posts.map(post => post.id);

        const commentsSql = `
            SELECT comments.*, users.username, users.email
            FROM comments
            JOIN users ON users.id = comments.userId
            WHERE comments.postId IN (?)
            ORDER BY comments.id ASC
        `;

        db.query(commentsSql, [postIds], (err2, comments) => {
            if (err2) {
                console.error('Error fetching comments:', err2);
                return res.status(500).json({ error: 'Failed to fetch comments' });
            }

            const postsWithComments = posts.map(post => ({
                ...post,
                comments: comments.filter(comment => comment.postId === post.id)
            }));

            res.json(postsWithComments);
        });
    });
};



exports.getPostById = (req, res) => {
    const { id } = req.params;

    db.query(
        'SELECT * FROM posts WHERE id = ?',
        [id],
        (err, results) => {
            if (err) {
                console.error('Error fetching post:', err);
                return res.status(500).json({ error: 'Failed to fetch post' });
            }

            if (results.length === 0) {
                return res.status(404).json({ error: 'Post not found' });
            }

            res.json(results[0]);
        }
    );
};

exports.createPost = (req, res) => {
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
        INSERT INTO posts (userId, title, body)
        VALUES (?, ?, ?)
    `;

    db.query(sql, [userId, title, body], (err, result) => {
        if (err) {
            console.error('Error creating post:', err);
            return res.status(500).json({ error: 'Failed to create post' });
        }

        res.status(201).json({
            id: result.insertId,
            userId,
            title,
            body,
            comments: []
        });
    });
};

exports.updatePost = (req, res) => {
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
        UPDATE posts
        SET title = ?, body = ?
        WHERE id = ? AND userId = ?
    `;

    db.query(sql, [title, body, id, userId], (err, result) => {
        if (err) {
            console.error('Error updating post:', err);
            return res.status(500).json({ error: 'Failed to update post' });
        }

        if (result.affectedRows === 0) {
            return res.status(403).json({
                error: 'Action forbidden: post not found or belongs to another user.'
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

exports.deletePost = (req, res) => {
    const { id } = req.params;
    const { userId } = req.body;

    if (!userId) {
        return res.status(400).json({ error: 'userId is required' });
    }

    const sql = `
        DELETE FROM posts
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
            console.error('Error deleting post:', err);
            return res.status(500).json({ error: 'Failed to delete post' });
        }

        if (result.affectedRows === 0) {
            return res.status(403).json({
                error: 'Action forbidden: Post not found or it belongs to another user.'
            });
        }

        res.json({ message: 'Post deleted successfully' });
    });
};