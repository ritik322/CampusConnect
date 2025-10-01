const admin = require('firebase-admin');
const {db} = require('../config/firebase');

const isAdmin = async (req, res, next) => {
  const idToken = req.headers.authorization?.split('Bearer ')[1];

  if (!idToken) {
    return res.status(401).send({ message: 'Unauthorized. No token provided.' });
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const userDoc = await db.collection('users').doc(decodedToken.uid).get();

    if (!userDoc.exists || userDoc.data().role !== 'admin') {
      return res.status(403).send({ message: 'Forbidden. User is not an admin.' });
    }
    
    req.user = userDoc.data();
    req.token = decodedToken;
    next();
  } catch (error) {
    return res.status(401).send({ message: 'Unauthorized. Invalid token.' });
  }
};

module.exports = isAdmin;