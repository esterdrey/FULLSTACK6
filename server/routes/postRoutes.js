const express= require('express');
const router=express.Router();

const postController=require('../controllers/postController');

router.get('/',postController.getAllPosts);
router.get('/:id',postController.getPostById);
router.post('/',postController.createPost);
router.patch('/:id',postController.updatePost);
router.delete('/:id',postController.deletePost);

module.exports=router;