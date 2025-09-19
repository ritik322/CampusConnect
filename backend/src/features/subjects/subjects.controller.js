const db = require('../../config/firebase');

const createSubject = async (req, res) => {
  try {
    const { subjectCode, subjectName, department, year, lecturesPerWeek } = req.body;
    const adminDomain = req.user.adminDomain;

    if (adminDomain !== 'ALL_DEPARTMENTS' && adminDomain !== department) {
      return res.status(403).send({ message: 'Forbidden. You can only add subjects to your own department.' });
    }

    if (!subjectCode || !subjectName || !department || !year || !lecturesPerWeek) {
      return res.status(400).send({ message: 'All fields are required.' });
    }
    
    const newSubject = { subjectCode, subjectName, department, year, lecturesPerWeek };
    const docRef = await db.collection('subjects').add(newSubject);
    res.status(201).send({ message: 'Subject created successfully.', id: docRef.id });
  } catch (error) {
    console.error('Error creating subject:', error);
    res.status(500).send({ message: 'Error creating subject.' });
  }
};

const getAllSubjects = async (req, res) => {
  try {
    const userDoc = await db.collection('users').doc(req.user.uid).get();
    if (!userDoc.exists) return res.status(404).send({ message: 'User not found.' });
    const userData = userDoc.data();
    let query = db.collection('subjects');

    if (userData.permissionLevel === 'hod') {
        query = query.where('department', '==', userData.adminDomain);
    }
    
    const subjectsSnapshot = await query.get();
    const subjects = subjectsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.status(200).send(subjects);
  } catch (error) {
    console.error('Error fetching subjects:', error);
    res.status(500).send({ message: 'Error fetching subjects.' });
  }
};

const updateSubject = async (req, res) => {
  try {
    const { subjectId } = req.params;
    // --- FIX 2: Read 'lecturesPerWeek' for updates too ---
    const { subjectCode, subjectName, department, year, lecturesPerWeek } = req.body;

    const updateData = { subjectCode, subjectName, department, year, lecturesPerWeek };
    
    // This is a good practice to prevent saving 'undefined' values
    Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);

    await db.collection('subjects').doc(subjectId).update(updateData);
    res.status(200).send({ message: 'Subject updated successfully.' });
  } catch (error) {
    console.error('Error updating subject:', error);
    res.status(500).send({ message: 'Error updating subject.' });
  }
};

const deleteSubject = async (req, res) => {
  try {
    const { subjectId } = req.params;
    await db.collection('subjects').doc(subjectId).delete();
    res.status(200).send({ message: 'Subject deleted successfully.' });
  } catch (error) {
    console.error('Error deleting subject:', error);
    res.status(500).send({ message: 'Error deleting subject.' });
  }
};

module.exports = { createSubject, getAllSubjects, updateSubject, deleteSubject };
