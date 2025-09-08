const express = require('express');
const { assignCurriculum } = require('./curriculum.controller');
const isAdmin = require('../../middlewares/isAdmin');

const router = express.Router();

router.put('/classes/:classId', isAdmin, assignCurriculum);

module.exports = router;