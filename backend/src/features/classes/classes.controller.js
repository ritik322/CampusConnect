const {db} = require('../../config/firebase');

const createAndAllotSections = async (req, res) => {
    try {
        const { batch, department, numberOfSections, year } = req.body;

        if (!batch || !department || !numberOfSections || !year) {
            return res.status(400).send({ message: 'Batch, department, year, and number of sections are required.' });
        }

        const studentsSnapshot = await db.collection('users')
            .where('academicInfo.batch', '==', batch)
            .where('academicInfo.department', '==', department)
            .where('academicInfo.classId', '==', null)
            .get();

        if (studentsSnapshot.empty) {
            return res.status(404).send({ message: 'No unassigned students found for the selected batch and department.' });
        }

        const students = studentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const studentCount = students.length;
        const newClassIds = [];

        for (let i = 0; i < numberOfSections; i++) {
            const section = String.fromCharCode(65 + i);
            const className = `D${year} ${department} ${section}`;

            const newClass = {
                year: parseInt(year, 10),
                department,
                section,
                className,
                curriculum: [],
            };
            const docRef = await db.collection('classes').add(newClass);
            newClassIds.push(docRef.id);
        }

        const batchWrite = db.batch();
        students.forEach((student, index) => {
            const assignedClassId = newClassIds[index % numberOfSections];
            const studentRef = db.collection('users').doc(student.id);
            batchWrite.update(studentRef, { 'academicInfo.classId': assignedClassId });
        });

        await batchWrite.commit();

        res.status(200).send({
            message: `Successfully created ${numberOfSections} sections and distributed ${studentCount} students.`,
        });

    } catch (error) {
        console.error("Error in section allotment:", error);
        res.status(500).send({ message: 'An error occurred during section allotment.', error: error.message });
    }
};

const createClass = async (req, res) => {
    try {
        const { year, department, section } = req.body;

        if (!year || !department || !section) {
            return res.status(400).send({ message: 'Year, department, and section are required.' });
        }

        const className = `D${year} ${department} ${section.toUpperCase()}`;

        const newClass = {
            year: parseInt(year, 10),
            department,
            section: section.toUpperCase(),
            className, 
            curriculum: [], 
        };

        const docRef = await db.collection('classes').add(newClass);
        res.status(201).send({ message: 'Class created successfully.', id: docRef.id, ...newClass });
    } catch (error) {
        console.error("Error creating class:", error);
        res.status(500).send({ message: 'Error creating class.', error: error.message });
    }
};

const getAllClasses = async (req, res) => {
  try {
    let query = db.collection('classes');
    const user = req.user;

    if (user.role === 'admin') {
      const adminDomain = user.adminDomain;
      if (adminDomain !== 'ALL_DEPARTMENTS') {
        query = query.where('department', '==', adminDomain);
      }
    } 
    else if (user.role === 'student' || user.role === 'faculty') {
      query = query.where('department', '==', user.department);
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

module.exports = { createClass, getAllClasses, deleteClass, createAndAllotSections };