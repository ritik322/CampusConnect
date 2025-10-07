const express = require('express');
const multer = require('multer');
const { createAssessment, getAllAssessments, getGradesForAssessment, submitGradesForAssessment } = require('./assessments.controller');
const isAuthenticated = require('../../middlewares/isAuthenticated');
const { deleteAssessment } = require('./assessments.controller');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get('/', isAuthenticated, getAllAssessments);
router.post('/', isAuthenticated, createAssessment);
router.delete('/:id', isAuthenticated, deleteAssessment);
router.get('/:id/grades', isAuthenticated, getGradesForAssessment);
router.post('/:id/grades', isAuthenticated, upload.single('file'), submitGradesForAssessment);

module.exports = router;