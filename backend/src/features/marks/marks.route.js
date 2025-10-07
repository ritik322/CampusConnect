const express = require('express');
const { getMyMarks } = require('./marks.controller');
const isAuthenticated = require('../../middlewares/isAuthenticated');

const router = express.Router();

router.get('/my-marks', isAuthenticated, getMyMarks);

module.exports = router;
