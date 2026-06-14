const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.get('/check-admin', userController.checkAdmin);
router.get('/', userController.getAllUsers);
router.get('/:id', userController.getUserById);
router.put('/:id', userController.updateUser);
router.put('/:id/password', userController.updatePassword);
router.put('/:id/block', userController.blockUser);

module.exports = router;
