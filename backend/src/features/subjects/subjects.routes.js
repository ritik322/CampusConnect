const express = require('express');
const { createSubject, getAllSubjects, updateSubject, deleteSubject } = require('./subjects.controller');
const isAdmin = require('../../middlewares/isAdmin');
const isAuthenticated = require('../../middlewares/isAuthenticated');

const router = express.Router();

router.post('/', isAdmin, createSubject);
router.get('/', isAuthenticated, getAllSubjects);
router.put('/:subjectId', isAdmin, updateSubject);
router.delete('/:subjectId', isAdmin, deleteSubject);

module.exports = router;