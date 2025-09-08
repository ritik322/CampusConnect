const db = require('../../config/firebase');

const createClass = async (req, res) => {
  try {
    const { className, year, section, department } = req.body;
    const adminDomain = req.user.adminDomain;

    if (adminDomain !== 'ALL_DEPARTMENTS' && adminDomain !== department) {
      return res.status(403).send({ message: 'Forbidden. You can only add classes to your own department.' });
    }

    if (!className || !year || !section || !department) {
      return res.status(400).send({ message: 'All fields are required.' });
    }

    const newClass = { className, year: parseInt(year, 10), section, department };
    const docRef = await db.collection('classes').add(newClass);
    res.status(201).send({ message: 'Class created successfully.', id: docRef.id });
  } catch (error) {
    console.error('Error creating class:', error);
    res.status(500).send({ message: 'Error creating class.' });
  }
};

const getAllClasses = async (req, res) => {
  try {
    let query = db.collection('classes');
    const adminDomain = req.user.adminDomain;

    if (adminDomain !== 'ALL_DEPARTMENTS') {
      query = query.where('department', '==', adminDomain);
    }
    
    const classesSnapshot = await query.orderBy('className').get();
    const classes = classesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.status(200).send(classes);
  } catch (error) {
    console.error('Error fetching classes:', error);
    res.status(500).send({ message: 'Error fetching classes.' });
  }
};

const deleteClass = async (req, res) => {
  try {
    const { classId } = req.params;
    // We can add more security here later if needed
    await db.collection('classes').doc(classId).delete();
    res.status(200).send({ message: 'Class deleted successfully.' });
  } catch (error) {
    console.error('Error deleting class:', error);
    res.status(500).send({ message: 'Error deleting class.' });
  }
};

module.exports = { createClass, getAllClasses, deleteClass };