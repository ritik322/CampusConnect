const express = require('express');
const { getMyClass } = require('./students.controller');
const isAuthenticated = require('../../middlewares/isAuthenticated');

const router = express.Router();

// Test endpoint to debug authentication
router.get('/test', isAuthenticated, (req, res) => {
  res.status(200).send({ 
    message: 'Authentication working',
    firebaseUser: req.user,
    uid: req.user.uid
  });
});

router.get('/my-class', isAuthenticated, getMyClass);

module.exports = router;