const { db } = require("../../config/firebase");
const xlsx = require('xlsx');
const deleteAssessment = async (req, res) => {
    try {
        const { id } = req.params; // Assessment ID
        const facultyId = req.user.uid;

        const assessmentRef = db.collection('assessments').doc(id);
        const assessmentDoc = await assessmentRef.get();

        if (!assessmentDoc.exists) {
            return res.status(404).send({ message: 'Assessment not found.' });
        }

        // Security check: Only the faculty who created it can delete it.
        if (assessmentDoc.data().facultyId !== facultyId) {
            return res.status(403).send({ message: 'You are not authorized to delete this assessment.' });
        }

        const batch = db.batch();

        // 1. Delete the main assessment document
        batch.delete(assessmentRef);

        // 2. Find and delete all related marks
        const marksSnapshot = await db.collection('marks').where('assessmentId', '==', id).get();
        marksSnapshot.docs.forEach(doc => batch.delete(doc.ref));

        // 3. Find and delete all related submissions
        const submissionsSnapshot = await db.collection('submissions').where('assessmentId', '==', id).get();
        submissionsSnapshot.docs.forEach(doc => batch.delete(doc.ref));

        await batch.commit();

        res.status(200).send({ message: 'Assessment and all related data deleted successfully.' });

    } catch (error) {
        console.error("Error deleting assessment:", error);
        res.status(500).send({ message: 'Failed to delete assessment.' });
    }
};

const createAssessment = async (req, res) => {
  try {
    const {
      type,
      title,
      maxMarks,
      classId,
      subjectId,
      description,
      dueDate,
      attachmentUrl,
    } = req.body;
    const facultyId = req.user.uid;

    if (!type || !title || !maxMarks || !classId || !subjectId) {
      return res.status(400).send({ message: "Missing required fields." });
    }

    const newAssessment = {
      type,
      title,
      maxMarks: parseInt(maxMarks, 10),
      classId,
      subjectId,
      facultyId,
      createdAt: new Date(),
    };

    if (type === "Assignment") {
      newAssessment.description = description || "";
      newAssessment.dueDate = dueDate ? new Date(dueDate) : null;
      newAssessment.attachmentUrl = attachmentUrl || null;
    }

    const docRef = await db.collection("assessments").add(newAssessment);
    res
      .status(201)
      .send({ message: "Assessment created successfully.", id: docRef.id });
  } catch (error) {
    console.error("Error creating assessment:", error);
    res.status(500).send({ message: "Failed to create assessment." });
  }
};

const getAllAssessments = async (req, res) => {
    try {
        const { classId, subjectId } = req.query;

        if (!classId) {
            return res.status(400).send({ message: 'A classId is required.' });
        }

        let query = db.collection('assessments').where('classId', '==', classId);

    
        if (subjectId) {
            query = query.where('subjectId', '==', subjectId);
        }
        
        const snapshot = await query.orderBy('createdAt', 'desc').get();

        if (snapshot.empty) {
            return res.status(200).json([]);
        }

        const assessments = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                dueDate: data.dueDate ? data.dueDate.toDate().toISOString() : null,
                createdAt: data.createdAt.toDate().toISOString(),
            };
        });

        res.status(200).json(assessments);

    } catch (error) {
        console.error("Error fetching assessments:", error);
        res.status(500).send({ message: 'Failed to fetch assessments.' });
    }
};

const getGradesForAssessment = async (req, res) => {
    try {
        const { id } = req.params; // Assessment ID
        const assessmentDoc = await db.collection('assessments').doc(id).get();
        if (!assessmentDoc.exists) {
            return res.status(404).send({ message: 'Assessment not found.' });
        }
        const assessment = assessmentDoc.data();

        const studentsSnapshot = await db.collection('users').where('academicInfo.classId', '==', assessment.classId).get();
        const students = studentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        const marksSnapshot = await db.collection('marks').where('assessmentId', '==', id).get();
        const marksMap = new Map(marksSnapshot.docs.map(doc => [doc.data().studentId, doc.data()]));
        
        let submissionsMap = new Map();
        if (assessment.type === 'Assignment') {
            const submissionsSnapshot = await db.collection('submissions').where('assignmentId', '==', id).get();
            submissionsMap = new Map(submissionsSnapshot.docs.map(doc => [doc.data().studentId, doc.data()]));
        }

        const gradeSheet = students.map(student => {
            const existingMark = marksMap.get(student.id);
            const submission = submissionsMap.get(student.id);
            
            let submissionStatus = 'Not Submitted';
            if (submission) {
                submissionStatus = 'Submitted';
            }
            if (existingMark) {
                submissionStatus = 'Graded';
            }

            return {
                studentId: student.id,
                displayName: student.displayName,
                urn: student.academicInfo.urn,
                marksObtained: existingMark ? existingMark.marksObtained : null,
                submissionStatus: assessment.type === 'Assignment' ? submissionStatus : null,
                submissionFileUrl: submission ? submission.submissionFileUrl : null,
            };
        });

        res.status(200).json(gradeSheet);
    } catch (error) {
        console.error("Error fetching grade sheet:", error);
        res.status(500).send({ message: 'Failed to fetch grade sheet.' });
    }
};

const submitGradesForAssessment = async (req, res) => {
    try {
        const { id } = req.params; 
        const facultyId = req.user.uid;
        
        const assessmentDoc = await db.collection("assessments").doc(id).get();
        if (!assessmentDoc.exists) {
            return res.status(404).send({ message: "Assessment not found." });
        }
        const assessment = assessmentDoc.data();

        let marksData = [];
        if (req.file) {
            const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = xlsx.utils.sheet_to_json(worksheet);

            const studentsSnapshot = await db.collection("users").where("academicInfo.classId", "==", assessment.classId).get();
            const studentMap = new Map(studentsSnapshot.docs.map((doc) => [doc.data().academicInfo.urn.toString(), doc.id]));

            marksData = jsonData.map((row) => {
                const urn = row.rollNumber || row.urn;
                const studentId = studentMap.get(urn.toString());
                if (studentId) {
                    return { studentId, marksObtained: row.marks || row.marksObtained };
                }
                return null;
            }).filter(Boolean); 
        } else {
            marksData = req.body.marks;
        }

        if (!marksData || marksData.length === 0) {
            return res.status(400).send({ message: "No valid marks data provided." });
        }

        const batch = db.batch();

        // --- THE REFINEMENT IS HERE ---
        for (const mark of marksData) {
            if (mark.studentId && mark.marksObtained !== null) {
                // 1. Always write the grade to the 'marks' collection.
                const markRef = db.collection("marks").doc(`${id}_${mark.studentId}`);
                batch.set(markRef, {
                    assessmentId: id,
                    studentId: mark.studentId,
                    marksObtained: parseInt(mark.marksObtained, 10),
                    gradedAt: new Date(),
                    gradedBy: facultyId,
                    subjectId: assessment.subjectId,
                });

                // 2. If it's an assignment, also update the submission status.
                if (assessment.type === 'Assignment') {
                    const submissionQuery = await db.collection('submissions')
                        .where('assignmentId', '==', id)
                        .where('studentId', '==', mark.studentId)
                        .limit(1).get();
                    
                    if (!submissionQuery.empty) {
                        const submissionRef = submissionQuery.docs[0].ref;
                        batch.update(submissionRef, { status: 'Graded' });
                    }
                }
            }
        }
        // --- END OF REFINEMENT ---

        await batch.commit();
        res.status(200).send({ message: "Grades submitted successfully." });
    } catch (error) {
        console.error("Error submitting grades:", error);
        res.status(500).send({ message: "Failed to submit grades." });
    }
};

module.exports = {
  createAssessment,
  getAllAssessments,
  getGradesForAssessment,
  submitGradesForAssessment,
  deleteAssessment
};
