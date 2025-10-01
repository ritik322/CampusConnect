const express = require('express');
const multer = require('multer');
const { getAllUsers, createUser, updateUser, deleteUser, bulkCreateUsers, getUnassignedBatches } = require('./users.controller');
const isAuthenticated = require('../../middlewares/isAuthenticated');
const isAdmin = require('../../middlewares/isAdmin');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get('/', isAuthenticated, isAdmin, getAllUsers);
router.post('/', isAuthenticated, isAdmin, createUser);
router.put('/:id', isAuthenticated, isAdmin, updateUser);
router.delete('/:id', isAuthenticated, isAdmin, deleteUser);
router.post('/bulk-upload', isAuthenticated, isAdmin, upload.single('file'), bulkCreateUsers);
router.get('/unassigned-batches', isAuthenticated, isAdmin, getUnassignedBatches);

module.exports = router;