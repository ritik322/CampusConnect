const {db} = require('../../config/firebase');

const getMyClass = async (req, res) => {
  try {
    const firebaseUser = req.user; // This is the decoded Firebase token
    const uid = firebaseUser.uid;
    
    // Get the user's profile from Firestore
    const userDoc = await db.collection('users').doc(uid).get();
    
    if (!userDoc.exists) {
      console.log('User document not found for UID:', uid);
      return res.status(404).send({ message: 'User profile not found.' });
    }
    
    const user = userDoc.data();

    
    // Only students can access this endpoint
    if (user.role !== 'student') {
      console.log('Access denied - user role is:', user.role);
      return res.status(403).send({ 
        message: `Access denied. Students only. Your role: ${user.role}` 
      });
    }
    
    // Check if student has a class assigned
    if (!user.classId) {
      console.log('No classId assigned to student');
      return res.status(200).send({ 
        message: 'No class assigned',
        classInfo: null,
        subjects: []
      });
    }
    
    
    // Get class information
    const classDoc = await db.collection('classes').doc(user.classId).get();
    
    if (!classDoc.exists) {
      console.log('Class document not found for ID:', user.classId);
      return res.status(404).send({ 
        message: 'Assigned class not found',
        classId: user.classId
      });
    }
    
    const classData = { id: classDoc.id, ...classDoc.data() };
    
    // If no curriculum, return basic class info
    if (!classData.curriculum || !Array.isArray(classData.curriculum) || classData.curriculum.length === 0) {
      console.log('No curriculum found for class');
      return res.status(200).send({
        message: 'Class found but no curriculum assigned',
        classInfo: classData,
        subjects: []
      });
    }
    
    
    // Get subject and faculty details for curriculum
    const subjectIds = classData.curriculum.map(item => item.subjectId);
    const facultyIds = classData.curriculum.map(item => item.facultyId);
    
    // Fetch subjects
    const subjectsPromises = subjectIds.map(id => 
      db.collection('subjects').doc(id).get()
    );
    
    // Fetch faculty members
    const facultyPromises = facultyIds.map(id => 
      db.collection('users').doc(id).get()
    );
    
    const [subjectDocs, facultyDocs] = await Promise.all([
      Promise.all(subjectsPromises),
      Promise.all(facultyPromises)
    ]);
    
    // Create lookup maps
    const subjectsMap = {};
    subjectDocs.forEach(doc => {
      if (doc.exists) {
        subjectsMap[doc.id] = doc.data();
      }
    });
    
    const facultyMap = {};
    facultyDocs.forEach(doc => {
      if (doc.exists) {
        facultyMap[doc.id] = doc.data();
      }
    });
    
    // Combine curriculum with subject and faculty details
    const detailedCurriculum = classData.curriculum.map(item => {
      const subject = subjectsMap[item.subjectId];
      const faculty = facultyMap[item.facultyId];
      
      return {
        ...item,
        subjectName: subject?.subjectName || 'Unknown Subject',
        subjectCode: subject?.subjectCode || 'N/A',
        facultyName: faculty?.displayName || 'Unknown Faculty',
        facultyEmail: faculty?.email || 'N/A'
      };
    });
    
    res.status(200).send({
      message: 'Class information retrieved successfully',
      classInfo: classData,
      subjects: detailedCurriculum
    });
    
  } catch (error) {
    console.error('Error fetching student class:', error);
    res.status(500).send({ 
      message: 'Error fetching class information',
      error: error.message 
    });
  }
};

module.exports = { getMyClass };