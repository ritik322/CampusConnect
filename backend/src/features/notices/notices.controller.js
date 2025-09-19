const db = require('../../config/firebase');

const createNotice = async (req, res) => {
  try {
    const { title, content, attachmentUrl, targetAudience } = req.body;
    const authorId = req.user.uid;
    const authorName = req.user.displayName;

    if (!title || !content || !targetAudience) {
      return res.status(400).send({ message: 'Title, content, and target audience are required.' });
    }

    const audienceTags = [`${targetAudience.type}_${targetAudience.value}`];

    const newNotice = {
      title,
      content,
      authorId,
      authorName,
      targetAudience,
      audienceTags,
      createdAt: new Date(),
      attachmentUrl: attachmentUrl || null,
    };

    await db.collection('notices').add(newNotice);
    res.status(201).send({ message: 'Notice created successfully.' });

  } catch (error) {
    console.error('Error creating notice:', error);
    res.status(500).send({ message: 'Error creating notice.', error: error.message });
  }
};

const getAllNotices = async (req, res) => {
  try {
    const { uid } = req.user;
    const userDoc = await db.collection('users').doc(uid).get();
    if (!userDoc.exists) {
        return res.status(404).send({ message: 'User profile not found.' });
    }
    const userProfile = userDoc.data();

    let query = db.collection('notices');

    if (userProfile.permissionLevel === 'superadmin') {
    } else {
      const userTags = ['GLOBAL_ALL'];
      if (userProfile.department) {
        userTags.push(`DEPARTMENT_${userProfile.department}`);
      }
      if (userProfile.isHosteller && userProfile.hostelInfo?.hostelId) {
        userTags.push(`HOSTEL_${userProfile.hostelInfo.hostelId}`);
      }
      query = query.where('audienceTags', 'array-contains-any', userTags);
    }
      
    const noticesSnapshot = await query.orderBy('createdAt', 'desc').get();
    const notices = noticesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.status(200).send(notices);

  } catch (error)    {
    console.error('Error fetching notices:', error);
    res.status(500).send({ message: 'Error fetching notices.' });
  }
};

const updateNotice = async (req, res) => {
  try {
    const { noticeId } = req.params;
    const { title, content } = req.body;
    const updateData = {};
    if (title) updateData.title = title;
    if (content) updateData.content = content;
    if(Object.keys(updateData).length === 0) {
        return res.status(400).send({ message: 'No fields to update.' });
    }
    await db.collection('notices').doc(noticeId).update(updateData);
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

