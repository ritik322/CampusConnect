const express = require('express');
const { createHostel, getAllHostels } = require('./hostels.controller');
const isAdmin = require('../../middlewares/isAdmin');
const isAuthenticated = require('../../middlewares/isAuthenticated');

const router = express.Router();

router.post('/', isAdmin, createHostel);
router.get('/', isAuthenticated, getAllHostels);

module.exports = router;