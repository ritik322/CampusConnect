const admin = require('firebase-admin');
const db = require('../../config/firebase');

const getUserProfile = async (req, res) => {
  const { idToken } = req.body;


  if (!idToken) {
    return res.status(400).send({ message: 'ID token is required.' });
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const uid = decodedToken.uid;

    const userDoc = await db.collection('users').doc(uid).get();

    if (!userDoc.exists) {
      return res.status(404).send({ message: 'User not found in Firestore.' });
    }

    const userData = userDoc.data();
    
    res.status(200).send({ message: 'User authenticated successfully.', user: userData });
  } catch (error) {
    res.status(401).send({ message: 'Unauthorized. Invalid token.', error: error.message });
  }
};

const getEmailFromUsername = async (req, res) => {
  const { username } = req.body;

  if (!username) {
    return res.status(400).send({ message: 'Username is required.' });
  }

  try {
    const usersRef = db.collection('users');
    const snapshot = await usersRef.where('username', '==', username).limit(1).get();

    if (snapshot.empty) {
      return res.status(404).send({ message: 'User with that username not found.' });
    }

    const userData = snapshot.docs[0].data();
    res.status(200).send({ email: userData.email });

  } catch (error) {
    res.status(500).send({ message: 'Server error.', error: error.message });
  }
};

module.exports = { getUserProfile, getEmailFromUsername }