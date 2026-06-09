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
exports.createAlbum=(req,res)=>{
    let {userId,title}=req.body;
    let sql='INSERT INTO albums (userId,title) VALUES (?,?)';
    db.query(sql,[userId,title],(err,result)=>{
        if(err){
             console.error('Error creating album:',err);
            res.status(500).json({error:'Failed to create album'});  
        }
        let selectSql='SELECT * FROM albums WHERE id=?';
        db.query(selectSql,[result.insertId],(err2,result2)=>{
            if(err2 ||result2.length === 0){
                console.error('Error fetching new album data:', err2);
                return res.status(500).json({ error: 'Album created, but failed to fetch confirmation' });
            }
            res.status(201).json(result2[0]);

        })
    })
}

exports.updateAlbum=(req,res)=>{
    let {id}=req.params;
    const {userId,title}=req.body;
    let sql='UPDATE albums set title=? WHERE id=? and userId=?';
    db.query(sql,[title,id,userId], (err,result)=>{
    if(err)
    {
        console.error('Error updating album:',err);
        res.status(500).json({error:'Failed to update album'});  
    }
    else{
        if(result.affectedRows===0)
        {
            res.status(404).json({error:'Album not found'});
        }
       let selectSql = 'SELECT * FROM albums WHERE id = ?';
        db.query(selectSql, [id], (err2, result2) => {
            if (err2 || !result2 || result2.length === 0) {
                console.error('Error fetching updated album data:', err2);
                return res.status(500).json({ error: 'Album updated, but failed to fetch updated confirmation' });
            }
            
            // Return the complete updated object back to React!
            res.json(result2[0]);
        })
    }
    })
}
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