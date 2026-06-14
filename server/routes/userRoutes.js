const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const isAdmin = require('../middleware/isAdmin');

router.get('/check-admin', userController.checkAdmin);
router.get('/', isAdmin, userController.getAllUsers);
router.get('/:id', userController.getUserById);
router.put('/:id', userController.updateUser);
router.put('/:id/password', userController.updatePassword);
router.put('/:id/block', isAdmin, userController.blockUser);

module.exports = router;
