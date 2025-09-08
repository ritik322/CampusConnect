const admin = require('firebase-admin');

const isAuthenticated = async (req, res, next) => {
  const idToken = req.headers.authorization?.split('Bearer ')[1];

  if (!idToken) {
    return res.status(401).send({ message: 'Unauthorized. No token provided.' });
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.user = decodedToken; 
    next();
  } catch (error) {
    return res.status(401).send({ message: 'Unauthorized. Invalid token.' });
  }
};

module.exports = isAuthenticated;