const db = require('../../config/firebase');

const assignCurriculum = async (req, res) => {
  try {
    const { classId } = req.params;
    const { assignments } = req.body;
    const adminDomain = req.user.adminDomain;

    const classDoc = await db.collection('classes').doc(classId).get();
    if (!classDoc.exists) {
      return res.status(404).send({ message: 'Class not found.' });
    }

    const classDepartment = classDoc.data().department;
    if (adminDomain !== 'ALL_DEPARTMENTS' && adminDomain !== classDepartment) {
      return res.status(403).send({ message: 'Forbidden. You can only manage curriculum for your own department.' });
    }

    if (!Array.isArray(assignments)) {
      return res.status(400).send({ message: 'Assignments must be an array.' });
    }

    for (const assignment of assignments) {
      if (!assignment.subjectId || !assignment.facultyId || !assignment.lecturesPerWeek) {
        return res.status(400).send({ message: 'Each assignment must include subjectId, facultyId, and lecturesPerWeek.' });
      }
    }

    await classDoc.ref.update({
      curriculum: assignments
    });

    res.status(200).send({ message: 'Curriculum assigned successfully.' });
  } catch (error) {
    console.error('Error assigning curriculum:', error);
    res.status(500).send({ message: 'Error assigning curriculum.', error: error.message });
  }
};

module.exports = { assignCurriculum };