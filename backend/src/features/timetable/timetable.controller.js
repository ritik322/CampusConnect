const db = require('../../config/firebase');

const LECTURE_SLOTS = [
  '08:30 AM', '09:30 AM', '10:30 AM', '12:30 PM', '01:30 PM', '02:30 PM', '03:30 PM'
];
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

const generateTimetable = async (req, res) => {
  try {
    const { classId } = req.body;
    const adminDomain = req.user.adminDomain;

    const classDoc = await db.collection('classes').doc(classId).get();
    if (!classDoc.exists) return res.status(404).send({ message: 'Selected class not found.' });
    
    const classData = { id: classDoc.id, ...classDoc.data() };
    
    if (adminDomain !== 'ALL_DEPARTMENTS' && adminDomain !== classData.department) {
      return res.status(403).send({ message: 'Forbidden.' });
    }

    if (!classData.curriculum || classData.curriculum.length === 0) {
      return res.status(400).send({ message: 'Curriculum not assigned for this class.' });
    }

    const classroomsSnapshot = await db.collection('classrooms').where('department', '==', classData.department).get();
    const classrooms = classroomsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    const lecturesToSchedule = [];
    classData.curriculum.forEach(assignment => {
      for (let i = 0; i < assignment.lecturesPerWeek; i++) {
        lecturesToSchedule.push({
          subjectId: assignment.subjectId,
          facultyId: assignment.facultyId,
        });
      }
    });

    const allPossibleSlots = [];
    for (const day of DAYS) {
      for (const startTime of LECTURE_SLOTS) {
        allPossibleSlots.push({ day, startTime, id: `${day}-${startTime}` });
      }
    }

    allPossibleSlots.sort(() => Math.random() - 0.5);

    const schedule = {};
    const facultyAvailability = {};
    const classroomAvailability = {};
    const subjectDayAvailability = {};

    for (const lecture of lecturesToSchedule) {
      let placed = false;
      for (const slot of allPossibleSlots) {
        const isSubjectAlreadyOnDay = subjectDayAvailability[lecture.subjectId]?.includes(slot.day);
        const isFacultyBusy = facultyAvailability[lecture.facultyId]?.includes(slot.id);
        const isClassBusy = schedule[slot.id];
        
        if (!isSubjectAlreadyOnDay && !isFacultyBusy && !isClassBusy) {
          const availableClassroom = classrooms.find(room => !classroomAvailability[room.id]?.includes(slot.id));

          if (availableClassroom) {
            schedule[slot.id] = {
              subjectId: lecture.subjectId,
              facultyId: lecture.facultyId,
              classroomId: availableClassroom.id,
            };

            if (!facultyAvailability[lecture.facultyId]) facultyAvailability[lecture.facultyId] = [];
            facultyAvailability[lecture.facultyId].push(slot.id);

            if (!classroomAvailability[availableClassroom.id]) classroomAvailability[availableClassroom.id] = [];
            classroomAvailability[availableClassroom.id].push(slot.id);
            
            if (!subjectDayAvailability[lecture.subjectId]) subjectDayAvailability[lecture.subjectId] = [];
            subjectDayAvailability[lecture.subjectId].push(slot.day);

            placed = true;
            break;
          }
        }
      }

      if (!placed) {
        return res.status(409).send({ message: 'Could not generate a conflict-free timetable. A subject may be scheduled too many times for the week.' });
      }
    }

    const finalTimetable = {
      classId,
      department: classData.department,
      generatedAt: new Date(),
      schedule: schedule
    };

    await db.collection('timetables').doc(classId).set(finalTimetable);

    res.status(200).send({ message: 'Timetable generated and saved successfully!' });

  } catch (error) {
    console.error('Error in timetable generation process:', error);
    res.status(500).send({ message: 'Error during timetable generation.' });
  }
};

const getTimetableForUser = async (req, res) => {
  try {
    const { uid } = req.user;
    const userDoc = await db.collection('users').doc(uid).get();
    if (!userDoc.exists) {
      return res.status(404).send({ message: 'User not found.' });
    }
    const userData = userDoc.data();

    let finalSchedule = {};

    if (userData.role === 'student') {
      const classId = userData.classId;
      if (classId) {
        const timetableDoc = await db.collection('timetables').doc(classId).get();
        if (timetableDoc.exists) {
          finalSchedule = timetableDoc.data().schedule;
        }
      }
    } else if (userData.role === 'faculty') {
      const timetablesSnapshot = await db.collection('timetables').where('department', '==', userData.department).get();
      timetablesSnapshot.forEach(doc => {
        const schedule = doc.data().schedule;
        for (const slotId in schedule) {
          if (schedule[slotId].facultyId === uid) {
            finalSchedule[slotId] = schedule[slotId];
          }
        }
      });
    }

    res.status(200).send(finalSchedule);
  } catch (error) {
    console.error('Error fetching timetable for user:', error);
    res.status(500).send({ message: 'Error fetching timetable.' });
  }
};

module.exports = { generateTimetable, getTimetableForUser };