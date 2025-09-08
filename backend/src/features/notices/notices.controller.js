const db = require('../../config/firebase');

const createNotice = async (req, res) => {
  try {
    const { title, content, attachmentUrl, targetAudience } = req.body;
    const authorId = req.token.uid;
    const authorName = req.user.displayName;

    if (!title || !content) {
      return res.status(400).send({ message: 'Title and content are required.' });
    }

    const newNotice = {
      title,
      content,
      authorId,
      authorName,
      targetAudience: targetAudience || { department: 'ALL' },
      createdAt: new Date(),
      attachmentUrl: attachmentUrl || null,
    };

    const docRef = await db.collection('notices').add(newNotice);
    res.status(201).send({ message: 'Notice created successfully.', id: docRef.id });

  } catch (error) {
    console.error('Error creating notice:', error);
    res.status(500).send({ message: 'Error creating notice.', error: error.message });
  }
};

const getAllNotices = async (req, res) => {
  try {
    const noticesSnapshot = await db.collection('notices').orderBy('createdAt', 'desc').get();
    const notices = noticesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.status(200).send(notices);
  } catch (error) {
    console.error('Error fetching notices:', error);
    res.status(500).send({ message: 'Error fetching notices.' });
  }
};
const updateNotice = async (req, res) => {
  try {
    const { noticeId } = req.params;
    const { title, content, targetAudience } = req.body;
    await db.collection('notices').doc(noticeId).update({
      title,
      content,
      targetAudience,
    });
    res.status(200).send({ message: 'Notice updated successfully.' });
  } catch (error) {
    console.error('Error updating notice:', error);
    res.status(500).send({ message: 'Error updating notice.', error: error.message });
  }
};

const deleteNotice = async (req, res) => {
  try {
    const { noticeId } = req.params;
    await db.collection('notices').doc(noticeId).delete();
    res.status(200).send({ message: 'Notice deleted successfully.' });
  } catch (error) {
    console.error('Error deleting notice:', error);
    res.status(500).send({ message: 'Error deleting notice.', error: error.message });
  }
};

module.exports = { createNotice, getAllNotices, updateNotice, deleteNotice };