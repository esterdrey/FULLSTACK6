const db=require('../db');

exports.getAllAlbums= (req,res)=>{
    let {username}=req.query;
    let sql='SELECT albums.id,albums.title from albums JOIN users on albums.userId=users.id WHERE username=?'
    db.query(sql,[username],(err,results)=>{
         if (err) {
            console.error('Error fetching albums:', err);
            return res.status(500).json({ error: 'Failed to fetch albums' });  
        }
        res.json(results);
    })
}

exports.getAlbumById=(req,res)=>{
    let {id}=req.params;
    let sql='SELECT albums.id,albums.title from albums WHERE id=?';
    db.query(sql,[id],(err,results)=>{
        if(err)
        {
            console.error('Error fetching albums:',err);
            res.status(500).json({error:'Failed to fetch albums'});  
        }   
        else{
            if(results.length===0)
            {
                res.status(404).json({error:'Album not found'});
            }
            else{
                res.json(results[0]);
            }
        }
    })
}
exports.createAlbum = (req, res) => {
    const { userId, title } = req.body;

    let sql = 'INSERT INTO albums (userId, title) VALUES (?, ?)';

    db.query(sql, [userId, title], (err, result) => {
        if (err) {
            console.error('Error creating album:', err);
            return res.status(500).json({ error: 'Failed to create album' });
        }

        res.status(201).json({
            id: result.insertId,
            userId,
            title
        });
    });
};

exports.updateAlbum = (req, res) => {
    let { id } = req.params;
    const { userId, title } = req.body;

    let sql = 'UPDATE albums SET title = ? WHERE id = ? AND userId = ?';

    db.query(sql, [title, id, userId], (err, result) => {
        if (err) {
            console.error('Error updating album:', err);
            return res.status(500).json({ error: 'Failed to update album' });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Album not found' });
        }

        res.json({
            id: Number(id),
            userId,
            title
        });
    });
};
exports.deleteAlbum=(req,res)=>{
    const {id}=req.params;
    const {userId}=req.body;
    let sql='DELETE FROM albums WHERE id=? AND userId=?';
    db.query(sql,[id,userId],(err,result)=>{
        if(err){
            console.error('Error deleting album:',err);
            res.status(500).json({error:'Failed to delete album'});  
        }
        else{
            if(result.affectedRows===0)
            {
                res.status(404).json({error:'Album not found'});
            }
            else{
                res.json({message:'Album deleted successfully'});
            }
        }
    })
}