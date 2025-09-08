const express = require('express');
const { createNotice, getAllNotices, updateNotice, deleteNotice } = require('./notices.controller');
const isAdmin = require('../../middlewares/isAdmin');
const isAuthenticated = require('../../middlewares/isAuthenticated');

const router = express.Router();

router.post('/', isAdmin, createNotice);
router.get('/', isAuthenticated, getAllNotices);
router.put('/:noticeId', isAdmin, updateNotice);
router.delete('/:noticeId', isAdmin, deleteNotice);

module.exports = router;