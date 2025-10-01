const {db} = require('../../config/firebase');
const { getMessaging } = require('firebase-admin/messaging');

const createNotice = async (req, res) => {
    try {
        const { title, content, attachmentUrl, targetAudience } = req.body;
        const authorId = req.user.uid;
        const authorName = req.user.displayName || 'Admin';

        const audienceTags = [];
        if (targetAudience.type === "GLOBAL") {
            audienceTags.push("GLOBAL_ALL");
        } else if (targetAudience.type === "DEPARTMENT") {
            audienceTags.push(`DEPARTMENT_${targetAudience.value}`);
        } else if (targetAudience.type === "HOSTEL") {
            audienceTags.push(`HOSTEL_${targetAudience.value}`);
        }

        const newNotice = {
            title, 
            content, 
            attachmentUrl, 
            targetAudience,
            audienceTags, // Add this for querying
            authorId, 
            authorName, 
            createdAt: new Date(),
        };

        const docRef = await db.collection('notices').add(newNotice);

        // Send notifications asynchronously (don't block response)
        sendNotificationsToUsers(docRef.id, title, content, targetAudience)
            .catch(error => console.error('Error sending notifications:', error));

        res.status(201).send({ 
            message: 'Notice published successfully.', 
            id: docRef.id 
        });

    } catch (error) {
        console.error("Error creating notice:", error);
        res.status(500).send({ message: 'Error creating notice.' });
    }
};

async function sendNotificationsToUsers(noticeId, title, content, targetAudience) {
    try {
        let usersQuery = db.collection("users");
        
        if (targetAudience.type === "DEPARTMENT") {
            usersQuery = usersQuery.where("department", "==", targetAudience.value);
        } else if (targetAudience.type === "HOSTEL") {
            usersQuery = usersQuery.where("hostelInfo.hostelId", "==", targetAudience.value);
        }

        const usersSnapshot = await usersQuery.get();
        
        if (usersSnapshot.empty) {
            console.log('No users found for target audience');
            return;
        }

        const tokens = [];
        usersSnapshot.forEach(doc => {
            const fcmToken = doc.data().fcmToken;
            if (fcmToken) {
                tokens.push(fcmToken);
            }
        });

        if (tokens.length === 0) {
            console.log('No FCM tokens found');
            return;
        }

        const message = {
            notification: {
                title: "New Notice: " + title,
                body: content.substring(0, 100) + (content.length > 100 ? "..." : ""),
            },
            data: { 
                noticeId: noticeId,
                type: 'new_notice'
            },
            tokens: tokens
        };

        const response = await getMessaging().sendEachForMulticast(message);
        
        console.log(`Successfully sent ${response.successCount} notifications`);
        
        if (response.failureCount > 0) {
            console.log(`Failed to send ${response.failureCount} notifications`);
            const failedTokens = [];
            response.responses.forEach((resp, idx) => {
                if (!resp.success) {
                    failedTokens.push(tokens[idx]);
                }
            });
            console.log('Failed tokens:', failedTokens);
        }

    } catch (error) {
        console.error('Error in sendNotificationsToUsers:', error);
        throw error;
    }
}

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
            // Superadmin sees all notices
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
        const notices = noticesSnapshot.docs.map(doc => ({ 
            id: doc.id, 
            ...doc.data() 
        }));
        
        res.status(200).send(notices);

    } catch (error) {
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