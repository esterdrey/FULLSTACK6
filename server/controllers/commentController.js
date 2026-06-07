const db=require('../db');

exports.getAllComments = (req, res) => {
    const { postId } = req.query; 
    
    let sql = 'SELECT comments.*,users.username,users.email FROM comments JOIN users ON comments.userId = users.id';
    let params = [];

    if (postId) {
        sql += ' WHERE comments.postId = ?';
        params = [postId];
    }
    sql += ' ORDER BY comments.id ASC';

    db.query(sql, params, (err, results) => {
        if (err) {
            console.error('Error fetching comments:', err);
            return res.status(500).json({ error: 'Failed to fetch comments' });  
        }
        res.json(results);
    });
}

exports.getCommentById=(req,res)=>{
    const {id}=req.params;
    db.query('SELECT * FROM comments WHERE id=?',[id],(err,results)=>{
        if(err)
        {
            console.error('Error fetching comment:',err);
            res.status(500).json({error:'Failed to fetch comment'});  
        }   
        else {
            if(results.length===0)
            {
                res.status(404).json({error:'Comment not found'});
            }
            else            {
                res.json(results[0]);
            }
        }
    });
}

exports.createComment=(req,res)=>{
    const {postId,userId,title,body}=req.body;
    if(!postId) return res.status(400).json({error:'postId is required'});
    if(!userId) return res.status(400).json({error:'userId is required'});
    if(!title) return res.status(400).json({error:'title is required'});
    if(!body) return res.status(400).json({error:'body is required'});
    
    db.query('INSERT INTO comments (postId,userId,title,body) VALUES (?,?,?,?)',[postId,userId,title,body],(err,result)=>{
        if(err){
            console.error('Error creating comment:',err);
            res.status(500).json({error:'Failed to create comment'});  
        }
        db.query(
        `SELECT comments.*, users.username, users.email
        FROM comments JOIN users ON comments.userId = users.id
        WHERE comments.id = ?`,
        [result.insertId],
        (err2, rows) => {
        if (err2 || rows.length === 0) {
            return res.status(201).json({ id: result.insertId, postId, userId, body });
        }
        res.status(201).json(rows[0]);
            }
        );

    });
}

exports.updateComment=(req,res)=>{
   const {id}=req.params;
   const {userId,body,title}=req.body;
   db.query('UPDATE comments SET title=?,body=?  WHERE id=? AND userId=?',[title,body,id,userId],(err,results)=>{
    if(err)
    {
        console.error('Error updating comment:',err);
        res.status(500).json({error:'Failed to update comment'});  
    }
    else{
        if(results.affectedRows===0)
        {
            res.status(404).json({error:'Comment not found'});
        }
        else{
            res.json({message:'Comment updated successfully'});
        }
    }
   });
}

exports.deleteComment=(req,res)=>{
    const {id}=req.params;
    const userId=req.body.userId;
    db.query('DELETE FROM comments WHERE id=? AND userId=?',[id,userId],(err,results)=>{
        if(err){
            console.error('Error deleting comment:',err);
            res.status(500).json({error:'Failed to delete comment'});  
        }
        else{
            if(results.affectedRows===0)
            {
                res.status(404).json({error:'Comment not found'});
            }
            else{
                res.json({message:'Comment deleted successfully'});
            }
        }
    });

}