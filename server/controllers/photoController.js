const db=require('../db');

exports.getPhotosByAlbum=(req,res)=>{
    const { albumId } = req.query;
    const limit = Math.min(parseInt(req.query.limit) || 12, 50);
    const offset = Math.max(parseInt(req.query.offset) || 0, 0);

    const sql = 'SELECT id, albumId, title, url, thumbnailUrl FROM photos WHERE albumId = ? LIMIT ? OFFSET ?';

    db.query(sql, [albumId, limit, offset], (err, results) => {
        if (err) {
            console.error('Error fetching photos:', err);
            return res.status(500).json({ error: 'Failed to fetch photos' });
        }
        res.json(results);
    });
}

exports.getPhotoById=(req,res)=>{
    let { id } = req.params;
    let sql = 'SELECT id, albumId, title, url, thumbnailUrl FROM photos WHERE id = ?';
    
    db.query(sql, [id], (err, results) => {
        if (err) {
            console.error('Error fetching photo:', err);
            return res.status(500).json({ error: 'Failed to fetch photo' });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: 'Photo not found' });
        }
        res.json(results[0]);
    });
}

exports.createPhoto = (req, res) => {
    const { albumId, title, url, thumbnailUrl } = req.body;

    let sql = 'INSERT INTO photos (albumId, title, url, thumbnailUrl) VALUES (?, ?, ?, ?)';

    db.query(sql, [albumId, title, url, thumbnailUrl], (err, result) => {
        if (err) {
            console.error('Error creating photo:', err);
            return res.status(500).json({ error: 'Failed to create photo' });
        }

        res.status(201).json({
            id: result.insertId,
            albumId,
            title,
            url,
            thumbnailUrl
        });
    });
};

exports.updatePhoto = (req, res) => {
    const { id } = req.params;
    const { title, userId } = req.body;

    const sql = `
        UPDATE photos
        JOIN albums ON photos.albumId = albums.id
        SET photos.title = ?
        WHERE photos.id = ? AND albums.userId = ?
    `;

    db.query(sql, [title, id, userId], (err, result) => {
        if (err) {
            console.error('Error updating photo:', err);
            return res.status(500).json({ error: 'Failed to update photo' });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Photo not found or unauthorized' });
        }

        res.json({
            id: Number(id),
            title
        });
    });
};

exports.deletePhoto = (req, res) => {
    const { id } = req.params;
    const { userId } = req.body;
    
    
    let sql = `
        DELETE photos FROM photos
        JOIN albums ON photos.albumId = albums.id
        WHERE photos.id = ? AND albums.userId = ?
    `;
    
    db.query(sql, [id, userId], (err, result) => {
        if (err) {
            console.error('Error deleting photo:', err);
            return res.status(500).json({ error: 'Failed to delete photo' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Photo not found or unauthorized' });
        }
        res.json({ message: 'Photo deleted successfully' });
    });
};