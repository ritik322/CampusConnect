const admin = require('firebase-admin');
const db = require('../../config/firebase');

const getAllUsers = async (req, res) => {
 try {
  const adminUser = req.user;
    let query = db.collection('users');

  if (adminUser.adminDomain === 'Hostel') {
   query = query.where('isHosteller', '==', true);
  } else if (adminUser.adminDomain !== 'ALL_DEPARTMENTS') {
   query = query.where('department', '==', adminUser.adminDomain);
  }

  const usersSnapshot = await query.get();
  const users = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  res.status(200).send(users);
 } catch (error) {
  console.error('Error fetching users:', error);
  res.status(500).send({ message: 'Error fetching users.' });
 }
};

const createUser = async (req, res) => {
 const { 
  email, password, displayName, role, department, 
  username, academicInfo, classId, isHosteller, 
  permissionLevel, adminDomain 
 } = req.body;

 try {
  const userRecord = await admin.auth().createUser({ email, password, displayName });
  const uid = userRecord.uid;

  const newUser = {
   uid, email, displayName, role, department, 
   username, createdAt: new Date()
  };
  
  if (role === 'student') {
   newUser.academicInfo = academicInfo;
   newUser.classId = classId;
   newUser.isHosteller = isHosteller || false;
  }

  if (role === 'admin') {
   newUser.permissionLevel = permissionLevel;
   newUser.adminDomain = adminDomain;
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
 const { displayName, role, department, username, academicInfo, isHosteller, hostelInfo } = req.body;

 try {
  if (displayName) {
   await admin.auth().updateUser(id, { displayName });
  }

  const userRef = db.collection('users').doc(id);
  const updateData = {}; 

  if (displayName !== undefined) updateData.displayName = displayName;
  if (role !== undefined) updateData.role = role;
  if (department !== undefined) updateData.department = department;
  if (username !== undefined) updateData.username = username;
  
  if (role === 'student' || (role === undefined && req.body.hasOwnProperty('isHosteller'))) {
    if (academicInfo) {
      updateData.academicInfo = academicInfo;
    }
    if (isHosteller !== undefined) {
      updateData.isHosteller = isHosteller;
    }
  }

  if (hostelInfo) {
   updateData.hostelInfo = hostelInfo;
  }

  if (Object.keys(updateData).length > 0) {
   await userRef.update(updateData);
  }

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
