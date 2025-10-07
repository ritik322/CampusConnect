const admin = require('firebase-admin');
const {db} = require('../../config/firebase');
const xlsx = require('xlsx');
const csv = require('csv-parser');
const stream = require('stream');

const getUnassignedBatches = async (req, res) => {
    try {
        const snapshot = await db.collection('users')
            .where('academicInfo.classId', '==', null)
            .where('role', '==', 'student')
            .get();

        if (snapshot.empty) {
            return res.status(200).json([]);
        }

        const uniqueBatches = new Map();
        snapshot.docs.forEach(doc => {
            const data = doc.data();
            const batch = data.academicInfo?.batch;
            const department = data.department;

            if (batch && department) {
                const key = `${batch}-${department}`;
                if (!uniqueBatches.has(key)) {
                    uniqueBatches.set(key, { batch, department });
                }
            }
        });

        res.status(200).json(Array.from(uniqueBatches.values()));
    } catch (error) {
        console.error("Error fetching unassigned batches:", error);
        res.status(500).send({ message: 'Error fetching unassigned batches.' });
    }
};

const bulkCreateUsers = async (req, res) => {
    if (!req.file) {
        return res.status(400).send({ message: 'No file uploaded.' });
    }

    let results = [];
    const errors = [];
    let successCount = 0;
    const adminUser = req.user;

    try {
        if (req.file.originalname.endsWith('.csv')) {
            const bufferStream = new stream.Readable();
            bufferStream.push(req.file.buffer);
            bufferStream.push(null);

            await new Promise((resolve, reject) => {
                bufferStream.pipe(csv({ separator: ',' }))
                    .on('data', (data) => results.push(data))
                    .on('end', resolve)
                    .on('error', reject);
            });
        } else if (req.file.originalname.endsWith('.xlsx')) {
            const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            results = xlsx.utils.sheet_to_json(worksheet);
        } else {
            return res.status(400).send({ message: 'Unsupported file type. Please upload a CSV or XLSX file.' });
        }

        const usersSnapshot = await db.collection('users').select('email').get();
        const existingEmails = new Set(usersSnapshot.docs.map(doc => doc.data().email));

        for (const [index, row] of results.entries()) {
            const { displayName, email, password, role, rollNumber, batch, department, isHosteller, username } = row;

            try {
                if (adminUser.permissionLevel === 'hod' && department !== adminUser.adminDomain) {
                    continue;
                }

                if (!displayName || !email || !password || !role) {
                    throw new Error('Missing required fields: displayName, email, password, role.');
                }

                if (existingEmails.has(email)) {
                    throw new Error('Email already exists in the system.');
                }

                const userRecord = await admin.auth().createUser({ email, password, displayName });
                const uid = userRecord.uid;

                const newUser = { uid, email, displayName, role, createdAt: new Date() };

                if (role === 'student') {
                    if (!rollNumber || !batch || !department) {
                        throw new Error('Missing student fields: rollNumber, batch, department.');
                    }
                    newUser.username = rollNumber.toString();
                    newUser.department = department,
                    newUser.academicInfo = {
                        urn: rollNumber.toString(),
                        batch: batch,
                        classId: null
                    };
                    newUser.isHosteller = (isHosteller || false).toString().toLowerCase() === 'true';
                } else if (role === 'faculty') {
                    if (!username || !department) {
                        throw new Error('Missing faculty fields: username, department.');
                    }
                    newUser.username = username.toString();
                    newUser.department = department;
                }
                
                await db.collection('users').doc(uid).set(newUser);
                existingEmails.add(email);
                successCount++;

            } catch (error) {
                errors.push({ row: index + 2, email: email || 'N/A', error: error.message });
            }
        }
        
        res.status(200).send({
            message: 'Bulk upload processing complete.',
            successCount,
            failureCount: errors.length,
            errors,
        });

    } catch (error) {
        res.status(500).send({ message: 'Failed to process CSV file.', error: error.message });
    }
};

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
  username, academicInfo, batch, isHosteller, 
  permissionLevel, adminDomain 
 } = req.body;

 try {
  const userRecord = await admin.auth().createUser({ email, password, displayName });
  const uid = userRecord.uid;

  const newUser = {
   uid, email, displayName, role, createdAt: new Date()
  };
  
  if (role === 'student') {
   newUser.username = academicInfo.rollNumber;
   newUser.department = department;
   newUser.academicInfo = {
        urn: academicInfo.rollNumber.toString(),
        batch: batch,
        department: department,
        classId: null // Initially unassigned
      };
   newUser.isHosteller = isHosteller || false;
  } else if (role === 'faculty') {
        newUser.username = username;
        newUser.department = department;
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
 const { displayName, role, department, username, academicInfo, batch, isHosteller, hostelInfo } = req.body;

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
  
  if (role === 'student') {
    if (academicInfo) {
      updateData['academicInfo.urn'] = academicInfo.rollNumber;
    }
        if (batch) {
            updateData['academicInfo.batch'] = batch;
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

module.exports = { getAllUsers, createUser, updateUser, deleteUser, bulkCreateUsers, getUnassignedBatches };
