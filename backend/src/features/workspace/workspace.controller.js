const {db} = require('../../config/firebase');

const getFiles = async (req, res) => {
    try {
        const facultyId = req.user.uid;
        const snapshot = await db.collection('workspaceFiles').where('facultyId', '==', facultyId).orderBy('createdAt', 'desc').get();
        if (snapshot.empty) {
            return res.status(200).json([]);
        }
        const files = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.status(200).json(files);
    } catch (error) {
        res.status(500).send({ message: 'Error fetching files.', error: error.message });
    }
};

const createFile = async (req, res) => {
    try {
        const { title, description, tags, fileName, fileUrl, fileType } = req.body;
        const newFile = {
            facultyId: req.user.uid,
            title,
            description,
            tags,
            fileName,
            fileUrl,
            fileType,
            createdAt: new Date(),
        };
        const docRef = await db.collection('workspaceFiles').add(newFile);
        res.status(201).send({ id: docRef.id, ...newFile });
    } catch (error) {
        res.status(500).send({ message: 'Error creating file record.', error: error.message });
    }
};

const deleteFile = async (req, res) => {
    try {
        const { fileId } = req.params;
        const fileRef = db.collection('workspaceFiles').doc(fileId);
        const doc = await fileRef.get();
        if (!doc.exists) {
            return res.status(404).send({ message: 'File not found.' });
        }
        if (doc.data().facultyId !== req.user.uid) {
            return res.status(403).send({ message: 'Forbidden: You do not own this file.' });
        }
        await fileRef.delete();
        res.status(200).send({ message: 'File deleted successfully.' });
    } catch (error) {
        res.status(500).send({ message: 'Error deleting file.', error: error.message });
    }
};

const updateFile = async (req, res) => {
    try {
        const { fileId } = req.params;
        const { title, description, tags } = req.body;
        const fileRef = db.collection('workspaceFiles').doc(fileId);
        const doc = await fileRef.get();

        if (!doc.exists) {
            return res.status(404).send({ message: 'File not found.' });
        }
        if (doc.data().facultyId !== req.user.uid) {
            return res.status(403).send({ message: 'Forbidden: You cannot edit this file.' });
        }

        await fileRef.update({
            title,
            description,
            tags,
        });

        res.status(200).send({ message: 'File updated successfully.' });
    } catch (error) {
        res.status(500).send({ message: 'Error updating file.', error: error.message });
    }
};

module.exports = { getFiles, createFile, deleteFile, updateFile };

