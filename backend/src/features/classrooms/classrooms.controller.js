const {db} = require('../../config/firebase');

const createClassroom = async (req, res) => {
  try {
    const { roomNumber, capacity, type, department } = req.body;
    const adminDomain = req.user.adminDomain;

    if (adminDomain !== 'ALL_DEPARTMENTS' && adminDomain !== department) {
      return res.status(403).send({ message: 'Forbidden. You can only add classrooms to your own department.' });
    }

    if (!roomNumber || !capacity || !type || !department) {
      return res.status(400).send({ message: 'All fields are required.' });
    }

    const newClassroom = { roomNumber, capacity: parseInt(capacity, 10), type, department };
    const docRef = await db.collection('classrooms').add(newClassroom);
    res.status(201).send({ message: 'Classroom added successfully.', id: docRef.id });
  } catch (error) {
    console.error('Error creating classroom:', error);
    res.status(500).send({ message: 'Error creating classroom.' });
  }
};

const getAllClassrooms = async (req, res) => {
    try {
        const adminUser = req.user;
        let query = db.collection('classrooms');


        if (adminUser.permissionLevel === 'hod') {
            query = query.where('department', '==', adminUser.adminDomain);
        }

        const snapshot = await query.get();
        const classrooms = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.status(200).send(classrooms);
        
    } catch (error) {
        console.error("Error fetching classrooms:", error);
        res.status(500).send({ message: 'Error fetching classrooms.' });
    }
};

const updateClassroom = async (req, res) => {
  try {
    const { classroomId } = req.params;
    const { roomNumber, capacity, type, department } = req.body;
    
    await db.collection('classrooms').doc(classroomId).update({
      roomNumber,
      capacity: parseInt(capacity, 10),
      type,
      department,
    });
    res.status(200).send({ message: 'Classroom updated successfully.' });
  } catch (error) {
    console.error('Error updating classroom:', error);
    res.status(500).send({ message: 'Error updating classroom.' });
  }
};

const deleteClassroom = async (req, res) => {
  try {
    const { classroomId } = req.params;
    await db.collection('classrooms').doc(classroomId).delete();
    res.status(200).send({ message: 'Classroom deleted successfully.' });
  } catch (error) {
    console.error('Error deleting classroom:', error);
    res.status(500).send({ message: 'Error deleting classroom.' });
  }
};

module.exports = { createClassroom, getAllClassrooms, updateClassroom, deleteClassroom };