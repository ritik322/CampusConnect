const express = require('express');
const { createHostel, getAllHostels } = require('./hostels.controller');
const isAdmin = require('../../middlewares/isAdmin');

const router = express.Router();

router.post('/', isAdmin, createHostel);
router.get('/', isAdmin, getAllHostels);

module.exports = router;