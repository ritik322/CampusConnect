const express = require('express');
const { 
  createClassroom, 
  getAllClassrooms, 
  updateClassroom, 
  deleteClassroom 
} = require('./classrooms.controller');
const isAdmin = require('../../middlewares/isAdmin');
const isAuthenticated = require('../../middlewares/isAuthenticated');

const router = express.Router();

router.post('/', isAdmin, createClassroom);
router.get('/', isAuthenticated, getAllClassrooms);
router.put('/:classroomId', isAdmin, updateClassroom);
router.delete('/:classroomId', isAdmin, deleteClassroom);

module.exports = router;