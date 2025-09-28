const express = require('express');
const { 
  createClass, 
  getAllClasses, 
  deleteClass 
} = require('./classes.controller');
const isAdmin = require('../../middlewares/isAdmin');
const isAuthenticated = require('../../middlewares/isAuthenticated');

const router = express.Router();

router.post('/', isAdmin, createClass);
router.get('/', isAuthenticated, getAllClasses);
router.delete('/:classId', isAdmin, deleteClass);

module.exports = router;