const express = require('express');
const multer = require('multer');
const { createSubmission, getSubmissionStatus, getMySubmissions } = require('./submissions.controller');
const isAuthenticated = require('../../middlewares/isAuthenticated');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/', isAuthenticated, upload.single('file'), createSubmission);
router.get('/',isAuthenticated,getSubmissionStatus)
router.get('/my-submissions', isAuthenticated, getMySubmissions);

module.exports = router;