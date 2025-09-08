const express = require('express');
const { generateTimetable, getTimetableForUser } = require('./timetable.controller');
const isAdmin = require('../../middlewares/isAdmin');
const isAuthenticated = require('../../middlewares/isAuthenticated');

const router = express.Router();

router.post('/generate', isAdmin, generateTimetable);
router.get('/', isAuthenticated, getTimetableForUser);

module.exports = router;