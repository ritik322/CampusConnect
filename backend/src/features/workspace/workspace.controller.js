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
        const facultyId = req.user.uid;
        const { title, description, tags, sharedWith } = req.body; // <-- Now accepts sharedWith

        const fileRef = db.collection('workspaceFiles').doc(fileId);
        const doc = await fileRef.get();

        if (!doc.exists || doc.data().facultyId !== facultyId) {
            return res.status(404).send({ message: 'File not found or you do not have permission.' });
        }

        const updateData = {};
        if (title) updateData.title = title;
        if (description !== undefined) updateData.description = description;
        if (tags !== undefined) updateData.tags = tags;
        if (sharedWith !== undefined) updateData.sharedWith = sharedWith; // <-- Saves the new field

        await fileRef.update(updateData);
        res.status(200).send({ message: 'File updated successfully.' });

    } catch (error) {
        console.error("Error updating file:", error);
        res.status(500).send({ message: 'Failed to update file.' });
    }
};

const getSharedFiles = async (req, res) => {
    try {
        const { classId } = req.query;

        if (!classId) {
            return res.status(400).send({ message: 'A classId is required.' });
        }

        const snapshot = await db.collection('workspaceFiles')
            .where('sharedWith', 'array-contains', classId)
            .get();

        if (snapshot.empty) {
            return res.status(200).json([]);
        }

        const sharedFiles = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.status(200).json(sharedFiles);

    } catch (error) {
        console.error("Error fetching shared files:", error);
        res.status(500).send({ message: 'Failed to fetch shared files.' });
    }
};


module.exports = { getFiles, createFile, deleteFile, updateFile,getSharedFiles };

