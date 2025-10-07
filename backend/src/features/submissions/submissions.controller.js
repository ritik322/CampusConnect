const { db } = require('../../config/firebase');
const axios = require('axios');

const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_UPLOAD_PRESET } = process.env;

const createSubmission = async (req, res) => {
    try {
        const { assignmentId, classId } = req.body;
        const studentId = req.user.uid;

        if (!req.file) {
            return res.status(400).send({ message: 'No submission file provided.' });
        }

        // --- THE FIX IS HERE: Use a Data URI for reliable uploads ---
        const b64 = Buffer.from(req.file.buffer).toString('base64');
        let dataURI = 'data:' + req.file.mimetype + ';base64,' + b64;
        
        const formData = new FormData();
        formData.append('file', dataURI);
        formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
        // --- END OF FIX ---

        // Use the /auto/upload endpoint for flexibility with file types (PDF, DOCX, etc.)
        const cloudinaryResponse = await axios.post(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/auto/upload`, formData);

        const newSubmission = {
            assignmentId,
            classId,
            studentId,
            status: 'Submitted',
            submittedAt: new Date(),
            submissionFileUrl: cloudinaryResponse.data.secure_url,
            marksObtained: null,
            feedback: null
        };

        await db.collection('submissions').add(newSubmission);
        res.status(201).send({ message: 'Assignment submitted successfully.' });

    } catch (error) {
        console.error("Error creating submission:", error.response ? error.response.data : error.message);
        res.status(500).send({ message: 'Failed to submit assignment.' });
    }
};
const getMySubmissions = async (req, res) => {
    try {
        const { classId } = req.query;
        const studentId = req.user.uid;

        if (!classId) {
            return res.status(400).send({ message: 'A classId is required.' });
        }

        const snapshot = await db.collection('submissions')
            .where('classId', '==', classId)
            .where('studentId', '==', studentId)
            .get();

        if (snapshot.empty) {
            return res.status(200).json([]);
        }

        const submissions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.status(200).json(submissions);

    } catch (error) {
        console.error("Error fetching my submissions:", error);
        res.status(500).send({ message: 'Failed to fetch submissions.' });
    }
};
const getSubmissionStatus = async (req, res) => {
    try {
        const { assignmentId } = req.query;
        const studentId = req.user.uid;

        if (!assignmentId) {
            return res.status(400).send({ message: 'Assignment ID is required.' });
        }

        const submissionSnapshot = await db.collection('submissions')
            .where('assignmentId', '==', assignmentId)
            .where('studentId', '==', studentId)
            .limit(1)
            .get();

        // --- THE FIX IS HERE: Use submissionSnapshot instead of snapshot ---
        if (submissionSnapshot.empty) {
            return res.status(200).json({ submission: null, mark: null }); // Also return the mark structure
        }

        const submissionDoc = submissionSnapshot.docs[0];
        const submissionData = submissionDoc.data();

        // Now, let's also find the corresponding mark
        const markSnapshot = await db.collection('marks')
            .where('assessmentId', '==', assignmentId)
            .where('studentId', '==', studentId)
            .limit(1).get();
            
        const markData = markSnapshot.empty ? null : markSnapshot.docs[0].data();

        res.status(200).json({
            submission: {
                id: submissionDoc.id,
                ...submissionData,
                submittedAt: submissionData.submittedAt.toDate().toISOString(),
            },
            mark: markData
        });
        // --- END OF FIX ---

    } catch (error) {
        console.error("Error fetching submission status:", error);
        res.status(500).send({ message: 'Failed to fetch submission status.' });
    }
};


module.exports = { createSubmission, getSubmissionStatus, getMySubmissions, };

