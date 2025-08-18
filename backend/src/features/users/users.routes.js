const express = require('express');
const { getAllUsers, createUser, updateUser, deleteUser } = require('./users.controller');
const isAdmin = require('../../middlewares/isAdmin');

const router = express.Router();

router.get('/', isAdmin, getAllUsers);
router.post('/', isAdmin, createUser);
router.put('/:id', isAdmin, updateUser); 
router.delete('/:id', isAdmin, deleteUser);

module.exports = router;