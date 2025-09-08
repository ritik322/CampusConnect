const db = require('../../config/firebase');

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
    const hostelsSnapshot = await db.collection('hostels').orderBy('hostelName').get();
    const hostels = hostelsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.status(200).send(hostels);
  } catch (error) {
    console.error('Error fetching hostels:', error);
    res.status(500).send({ message: 'Error fetching hostels.' });
  }
};

module.exports = { createHostel, getAllHostels };