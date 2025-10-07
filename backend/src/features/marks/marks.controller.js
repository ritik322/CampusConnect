const { db } = require('../../config/firebase');
const { FieldPath } = require('firebase-admin/firestore'); // <-- ADD THIS LINE

const getMyMarks = async (req, res) => {
    try {
        const studentId = req.user.uid;

        const marksSnapshot = await db.collection('marks').where('studentId', '==', studentId).get();
        if (marksSnapshot.empty) {
            return res.status(200).json([]);
        }

        const marksData = marksSnapshot.docs.map(doc => doc.data());
        
        // Ensure the arrays are not empty before querying
        const assessmentIds = [...new Set(marksData.map(mark => mark.assessmentId))];
        if (assessmentIds.length === 0) {
            return res.status(200).json([]);
        }
        
        const assessmentsSnapshot = await db.collection('assessments').where(FieldPath.documentId(), 'in', assessmentIds).get(); // <-- FIX IS HERE
        const assessmentsMap = new Map(assessmentsSnapshot.docs.map(doc => [doc.id, doc.data()]));

        // Get all subject IDs from the valid assessments
        const subjectIds = [...new Set(Array.from(assessmentsMap.values()).map(assessment => assessment.subjectId))];
        if (subjectIds.length === 0) {
            // This can happen if assessments have no subjectId, handle gracefully
            return res.status(200).json([]);
        }

        const subjectsSnapshot = await db.collection('subjects').where(FieldPath.documentId(), 'in', subjectIds).get(); // <-- FIX IS HERE
        const subjectsMap = new Map(subjectsSnapshot.docs.map(doc => [doc.id, doc.data()]));

        const enrichedMarks = marksData.map(mark => {
            const assessment = assessmentsMap.get(mark.assessmentId);
            const subject = subjectsMap.get(assessment?.subjectId);
            return {
                assessmentTitle: assessment?.title || 'Unknown Assessment',
                subjectName: subject?.subjectName || 'Unknown Subject',
                marksObtained: mark.marksObtained,
                maxMarks: assessment?.maxMarks || 0,
            };
        });

        res.status(200).json(enrichedMarks);

    } catch (error) {
        console.error("Error fetching marks:", error);
        res.status(500).send({ message: 'Failed to fetch marks.' });
    }
};

module.exports = {getMyMarks}