const db=require('../db');

exports.getAllPosts=(req,res)=>

    {
        const {userId}=req.query;
        db.query('SELECT posts.*, users.username, users.email FROM posts JOIN users ON users.id=posts.userId WHERE userId=?',[userId],(err,results)=>{
            if(err)
            {
                console.error('Error fetching posts:',err);
                res.status(500).json({error:'Failed to fetch posts'});  
            }
            else            {
                res.json(results);
            }
        });
    }

exports.getPostByUserId=(req,res)=>{
    const {userId}=req.params;
    db.query('SELECT * FROM posts WHERE userId=?',[userId],(err,results)=>{ 
        if(err)
        {
            console.error('Error fetching posts:',err);
            res.status(500).json({error:'Failed to fetch posts'});  
        }
        else        {
            res.json(results);
        }
    });
}
exports.getPostById=(req,res)=>{
    const {id}=req.params;
    db.query('SELECT * FROM posts WHERE id=?',[id],(err,results)=>{
        if(err)
        {
            console.error('Error fetching post:',err);
            res.status(500).json({error:'Failed to fetch post'});  
        }
        else        {
            if(results.length===0)
            {
                res.status(404).json({error:'Post not found'});
            }
            else            {
                res.json(results[0]);
            }
        }
    });
}

    exports.createPost=(req,res)=>{
        const {userId,title,body}=req.body;

        if(!userId) return res.status(400).json({error:'userId is required'});
        if(!title)  return res.status(400).json({error:'title is required'});
        if(!body)   return res.status(400).json({error:'body is required'});

        const sql=`INSERT INTO POSTS (userId,title,body) VALUES (?,?,?)`;
        
        db.query(sql,[userId,title,body],(err,result)=>{
            if(err)
            {
                console.error('Error creating post:',err);
                res.status(500).json({error:'Failed to create post'});
            }
            db.query(
        `SELECT posts.*, users.username, users.email
         FROM posts JOIN users ON users.id = posts.userId
         WHERE posts.id = ?`,
        [result.insertId],
        (err2, rows) => {
          if (err2 || rows.length === 0) {
            return res.status(201).json({ id: result.insertId, userId, title, body });
          }
          res.status(201).json(rows[0]);
        }
      );
   });

}

exports.updatePost=(req,res)=>{
    const {id}=req.params;
    const {title,body}=req.body;
    const userId=req.body.userId;

    const sql=`UPDATE posts SET title=?, body=? WHERE id=? AND userId=?`;

    db.query(sql,[title,body,id,userId],(err,result)=>{
        if(err)
        {
            console.error('Error updating post:',err);
            res.status(500).json({error:'Failed to update post'});
        }
         db.query(
        `SELECT posts.*, users.username, users.email
         FROM posts JOIN users ON users.id = posts.userId
         WHERE posts.id = ? AND posts.userId = ?`,
        [id, userId],
        (err2, rows) => {
          if (err2) return res.status(500).json({ error: 'Failed to fetch updated post' });
          if (rows.length === 0) {
            return res.status(403).json({ error: 'Action forbidden: post not found or belongs to another user.' });
          }
          res.json(rows[0]);
        }
      );
    });
}
exports.deletePost=(req,res)=>{
    const {id}=req.params;
    const userId=req.body.userId;

    const sql=`DELETE FROM posts WHERE id=? AND userId=?`;

    db.query(sql,[id,userId],(err,result)=>{
        if(err)
        {
            console.error('Error deleting post:',err);
            return res.status(500).json({error:'Failed to delete post'});
        }
        if (result.affectedRows === 0) {
            return res.status(403).json({ error: 'Action forbidden: Post not found or it belongs to another user.' });
        }
        else
        {
            res.json({message:'Post deleted successfully'});
        }
    });
}