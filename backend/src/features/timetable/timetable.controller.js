const {db} = require('../../config/firebase');
const admin = require('firebase-admin');

const LECTURE_SLOTS = [
  '08:30 AM', '09:30 AM', '10:30 AM', '11:30 AM', '12:30 PM', '01:30 PM', '02:30 PM', '03:30 PM'
];
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

const generateTimetable = async (req, res) => {
  try {
    const { department } = req.body;
    const adminUser = req.user;

    const targetDepartment = department || adminUser.adminDomain;
    if (!targetDepartment || targetDepartment === 'ALL_DEPARTMENTS' || targetDepartment === 'Hostel') {
        return res.status(400).send({ message: 'A specific department must be provided.' });
    }

    const classesSnapshot = await db.collection('classes').where('department', '==', targetDepartment).get();
    if (classesSnapshot.empty) {
        return res.status(404).send({ message: 'No classes found for this department.' });
    }
    const allClasses = classesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    const classroomsSnapshot = await db.collection('classrooms').where('department', '==', targetDepartment).get();
    const allClassrooms = classroomsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    const masterLectureList = [];
    for (const classData of allClasses) {
        if (classData.curriculum && classData.curriculum.length > 0) {
            classData.curriculum.forEach(assignment => {
                for (let i = 0; i < assignment.lecturesPerWeek; i++) {
                    masterLectureList.push({
                        classId: classData.id,
                        subjectId: assignment.subjectId,
                        facultyId: assignment.facultyId,
                    });
                }
            });
        }
    }

    if (masterLectureList.length === 0) {
        return res.status(400).send({ message: 'No curriculum assigned to any classes in this department.' });
    }

    const allPossibleSlots = [];
    for (const day of DAYS) {
      for (const startTime of LECTURE_SLOTS) {
        allPossibleSlots.push({ day, startTime, id: `${day}-${startTime}` });
      }
    }
    allPossibleSlots.sort(() => Math.random() - 0.5);

    const masterSchedule = {};
    const classAvailability = {};
    const facultyAvailability = {};
    const classroomAvailability = {};
    const subjectClassDayAvailability = {}; 

    const classBreakTimes = {};
    const BREAK_SLOTS = ['11:30 AM', '12:30 PM'];
    for (const classData of allClasses) {
        const breakTime = BREAK_SLOTS[Math.floor(Math.random() * BREAK_SLOTS.length)];
        for (const day of DAYS) {
            const slotId = `${day}-${breakTime}`;
            if (!classAvailability[classData.id]) classAvailability[classData.id] = [];
            classAvailability[classData.id].push(slotId);
        }
    }

    for (const lecture of masterLectureList) {
        let placed = false;
        for (const slot of allPossibleSlots) {
            const isClassBusy = classAvailability[lecture.classId]?.includes(slot.id);
            const isFacultyBusy = facultyAvailability[lecture.facultyId]?.includes(slot.id);
            const subjectClassKey = `${lecture.subjectId}-${lecture.classId}`;
            const isSubjectAlreadyOnDay = subjectClassDayAvailability[subjectClassKey]?.includes(slot.day);

            if (!isClassBusy && !isFacultyBusy && !isSubjectAlreadyOnDay) {
                const availableClassroom = allClassrooms.find(room => !classroomAvailability[room.id]?.includes(slot.id));
                if (availableClassroom) {
                    masterSchedule[slot.id] = { ...lecture, classroomId: availableClassroom.id };

                    if (!classAvailability[lecture.classId]) classAvailability[lecture.classId] = [];
                    classAvailability[lecture.classId].push(slot.id);
                    
                    if (!facultyAvailability[lecture.facultyId]) facultyAvailability[lecture.facultyId] = [];
                    facultyAvailability[lecture.facultyId].push(slot.id);

                    if (!classroomAvailability[availableClassroom.id]) classroomAvailability[availableClassroom.id] = [];
                    classroomAvailability[availableClassroom.id].push(slot.id);
                    
                    if (!subjectClassDayAvailability[subjectClassKey]) subjectClassDayAvailability[subjectClassKey] = [];
                    subjectClassDayAvailability[subjectClassKey].push(slot.day);
                    
                    placed = true;
                    break;
                }
            }
        }
        if (!placed) {
            return res.status(409).send({ message: 'Could not generate a conflict-free timetable. Check for resource constraints.' });
        }
    }
    
    const batch = db.batch();
    for (const classData of allClasses) {
        const classSchedule = {};
        for(const slotId in masterSchedule) {
            if(masterSchedule[slotId].classId === classData.id) {
                classSchedule[slotId] = {
                    subjectId: masterSchedule[slotId].subjectId,
                    facultyId: masterSchedule[slotId].facultyId,
                    classroomId: masterSchedule[slotId].classroomId,
                };
            }
        }

        const timetableRef = db.collection('timetables').doc(classData.id);
        batch.set(timetableRef, {
            classId: classData.id,
            department: targetDepartment,
            generatedAt: new Date(),
            schedule: classSchedule,
        });
    }

    await batch.commit();

    res.status(200).send({ message: `Timetable generated successfully for the ${targetDepartment} department!` });

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

    if (userData.role === 'student') {
       const classId = userData.academicInfo?.classId;
      if (!classId) return res.status(200).send({ schedule: {} });

      const timetableDoc = await db.collection('timetables').doc(classId).get();
      const classDoc = await db.collection('classes').doc(classId).get();

      if (!timetableDoc.exists || !classDoc.exists) {
        return res.status(200).send({ schedule: {} });
      }

      const populatedSchedule = await populateSchedule(timetableDoc.data().schedule);
      
      return res.status(200).send({
        type: 'student',
        className: classDoc.data().className,
        schedule: populatedSchedule,
      });

    } else if (userData.role === 'faculty') {
      const timetablesSnapshot = await db.collection('timetables').where('department', '==', userData.department).get();
      if (timetablesSnapshot.empty) return res.status(200).send({});

      let facultyRawSchedule = {};
      const classDetailsCache = {};

      for (const doc of timetablesSnapshot.docs) {
        const classId = doc.id;
        const schedule = doc.data().schedule;

        for (const slotId in schedule) {
          if (schedule[slotId].facultyId === uid) {
            // Store the classId with the schedule entry
            facultyRawSchedule[slotId] = { ...schedule[slotId], classId: classId };
          }
        }
      }
      
      const populatedSchedule = await populateSchedule(facultyRawSchedule);

      for(const slotId in populatedSchedule) {
          const entry = populatedSchedule[slotId];
          const classId = facultyRawSchedule[slotId].classId;
          if(!classDetailsCache[classId]) {
              const classDoc = await db.collection('classes').doc(classId).get();
              classDetailsCache[classId] = classDoc.exists ? classDoc.data().className : 'Unknown';
          }
          entry.className = classDetailsCache[classId];
      }

      return res.status(200).send({
          type: 'faculty',
          schedule: populatedSchedule
      });
    }
    
    res.status(200).send({});

  } catch (error) {
    console.error('Error fetching timetable for user:', error);
    res.status(500).send({ message: 'Error fetching timetable.' });
  }
};

const populateSchedule = async (rawSchedule) => {
    if (Object.keys(rawSchedule).length === 0) return {};

    const subjectIds = [...new Set(Object.values(rawSchedule).map(s => s.subjectId))];
    const facultyIds = [...new Set(Object.values(rawSchedule).map(s => s.facultyId))];
    const classroomIds = [...new Set(Object.values(rawSchedule).map(s => s.classroomId))];

    const [subjectsSnapshot, facultySnapshot, classroomsSnapshot] = await Promise.all([
        subjectIds.length ? db.collection('subjects').where(admin.firestore.FieldPath.documentId(), 'in', subjectIds).get() : Promise.resolve({ docs: [] }),
        facultyIds.length ? db.collection('users').where(admin.firestore.FieldPath.documentId(), 'in', facultyIds).get() : Promise.resolve({ docs: [] }),
        classroomIds.length ? db.collection('classrooms').where(admin.firestore.FieldPath.documentId(), 'in', classroomIds).get() : Promise.resolve({ docs: [] }),
    ]);

    const subjectsMap = subjectsSnapshot.docs.reduce((acc, doc) => ({...acc, [doc.id]: doc.data()}), {});
    const facultyMap = facultySnapshot.docs.reduce((acc, doc) => ({...acc, [doc.id]: doc.data()}), {});
    const classroomsMap = classroomsSnapshot.docs.reduce((acc, doc) => ({...acc, [doc.id]: doc.data()}), {});

    const populatedSchedule = {};
    for (const slotId in rawSchedule) {
        const entry = rawSchedule[slotId];
        populatedSchedule[slotId] = {
            subjectCode: subjectsMap[entry.subjectId]?.subjectCode || 'N/A',
            facultyName: facultyMap[entry.facultyId]?.displayName || 'N/A',
            roomNumber: classroomsMap[entry.classroomId]?.roomNumber || 'N/A'
        };
    }
    return populatedSchedule;
}

module.exports = { generateTimetable, getTimetableForUser };

