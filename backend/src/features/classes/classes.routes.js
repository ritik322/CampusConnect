const express = require('express');
const { 
  createClass, 
  getAllClasses, 
  deleteClass 
} = require('./classes.controller');
const isAdmin = require('../../middlewares/isAdmin');

const router = express.Router();

router.post('/', isAdmin, createClass);
router.get('/', isAdmin, getAllClasses);
router.delete('/:classId', isAdmin, deleteClass);

module.exports = router;