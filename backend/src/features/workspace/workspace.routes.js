const express = require('express');
const { getFiles, createFile, deleteFile, updateFile, getSharedFiles } = require('./workspace.controller');
const isAuthenticated = require('../../middlewares/isAuthenticated');

const router = express.Router();

router.get('/files', isAuthenticated, getFiles);
router.post('/files', isAuthenticated, createFile);
router.delete('/files/:fileId', isAuthenticated, deleteFile);
router.put('/files/:fileId', isAuthenticated, updateFile);
router.get('/shared-files', isAuthenticated, getSharedFiles);

module.exports = router;

