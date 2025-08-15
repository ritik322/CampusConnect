const express = require('express');
const { getUserProfile, getEmailFromUsername } = require('./auth.controller.js'); 

const router = express.Router();

router.post('/profile', getUserProfile);
router.post('/getEmail', getEmailFromUsername); // 

module.exports = router;