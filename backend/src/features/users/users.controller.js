const admin = require('firebase-admin');
const db = require('../../config/firebase');

const getAllUsers = async (req, res) => {
  try {
    let query = db.collection('users');
    const { search, role } = req.query;

    if (role) {
      query = query.where('role', '==', role);
    }
    
    if (search) {
      query = query.orderBy('displayName').startAt(search).endAt(search + '\uf8ff');
    }

    const usersSnapshot = await query.get();
    const users = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.status(200).send(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).send({ message: 'Error fetching users.', error: error.message });
  }
};

const createUser = async (req, res) => {
  const { email, password, displayName, role, department, username, academicInfo } = req.body;

  if (!email || !password || !displayName || !role || !department || !username) {
    return res.status(400).send({ message: 'Missing required fields.' });
  }

  try {
    const userRecord = await admin.auth().createUser({ email, password, displayName });
    const uid = userRecord.uid;

    const newUser = {
      uid,
      email,
      displayName,
      role,
      department,
      username,
      createdAt: new Date(),
    };
    
    if (role === 'student' && academicInfo) {
      newUser.academicInfo = academicInfo;
    }

    await db.collection('users').doc(uid).set(newUser);
    res.status(201).send({ message: 'User created successfully.', user: newUser });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).send({ message: 'Error creating user.', error: error.message });
  }
};

const updateUser = async (req, res) => {
  const { id } = req.params;
  const { displayName, role, department, username, academicInfo } = req.body;

  try {
    await admin.auth().updateUser(id, { displayName });

    const userRef = db.collection('users').doc(id);
    const updateData = { displayName, role, department, username };
    
    if (role === 'student' && academicInfo) {
      updateData.academicInfo = academicInfo;
    }

    await userRef.update(updateData);

    res.status(200).send({ message: 'User updated successfully.' });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).send({ message: 'Error updating user.', error: error.message });
  }
};

const deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    await admin.auth().deleteUser(id);
    await db.collection('users').doc(id).delete();
    res.status(200).send({ message: 'User deleted successfully.' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).send({ message: 'Error deleting user.', error: error.message });
  }
};

module.exports = { getAllUsers, createUser, updateUser, deleteUser };