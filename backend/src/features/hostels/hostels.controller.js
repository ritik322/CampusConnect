const {db} = require('../../config/firebase');

const createHostel = async (req, res) => {
  try {
    const { hostelName, wardenName } = req.body;
    if (!hostelName || !wardenName) {
      return res.status(400).send({ message: 'Hostel name and warden name are required.' });
    }

    const newHostel = {
      hostelName,
      wardenName,
      messMenuUrl: null,
      createdAt: new Date(),
    };

    const docRef = await db.collection('hostels').add(newHostel);
    res.status(201).send({ message: 'Hostel created successfully.', id: docRef.id });
  } catch (error) {
    console.error('Error creating hostel:', error);
    res.status(500).send({ message: 'Error creating hostel.' });
  }
};

const getAllHostels = async (req, res) => {
  try {
    const user = req.user;
    let hostelsSnapshot;

    // If user is admin, get all hostels or filter by domain
    if (user.role === 'admin') {
      if (user.adminDomain === 'Hostel' || user.adminDomain === 'ALL_DEPARTMENTS') {
        hostelsSnapshot = await db.collection('hostels').orderBy('hostelName').get();
      } else {
        hostelsSnapshot = await db.collection('hostels').where('department', '==', user.adminDomain).orderBy('hostelName').get();
      }
    } 
    // If user is student, only return hostels they have access to
    else if (user.role === 'student') {
      hostelsSnapshot = await db.collection('hostels').orderBy('hostelName').get();
    }
    // If user is faculty, return hostels from their department
    else if (user.role === 'faculty') {
      hostelsSnapshot = await db.collection('hostels').where('department', '==', user.department).orderBy('hostelName').get();
    }
    else {
      hostelsSnapshot = await db.collection('hostels').orderBy('hostelName').get();
    }

    const hostels = hostelsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.status(200).send(hostels);
  } catch (error) {
    console.error('Error fetching hostels:', error);
    res.status(500).send({ message: 'Error fetching hostels.' });
  }
};

module.exports = { createHostel, getAllHostels };