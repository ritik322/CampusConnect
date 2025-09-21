import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, TextInput, TouchableOpacity, ActivityIndicator, ScrollView, Modal, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import auth from '@react-native-firebase/auth';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { pick, types, isCancelError } from '@react-native-documents/picker';
import { CLOUDINARY_CLOUD_NAME, CLOUDINARY_UPLOAD_PRESET } from '@env';
import API_URL from '../../../config/apiConfig';
import Toast from 'react-native-toast-message';

const UploadFileScreen = () => {
    const navigation = useNavigation();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [tags, setTags] = useState('');
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    
    const [allTags, setAllTags] = useState([]);
    const [isModalVisible, setModalVisible] = useState(false);

    useEffect(() => {
        const fetchExistingTags = async () => {
            try {
                const idToken = await auth().currentUser.getIdToken();
                const response = await axios.get(`${API_URL}/workspace/files`, {
                    headers: { Authorization: `Bearer ${idToken}` },
                });
                const files = response.data;
                const uniqueTags = [...new Set(files.flatMap(file => file.tags))];
                setAllTags(uniqueTags);
            } catch (error) {
                console.error("Failed to fetch existing tags", error);
            }
        };
        fetchExistingTags();
    }, []);

    const handleFilePick = async () => {
        try {
            const res = await pick({ type: [types.allFiles] });
            setFile(res[0]);
            if (!title) {
                const fileNameWithoutExt = res[0].name.split('.').slice(0, -1).join('.');
                setTitle(fileNameWithoutExt.replace(/_/g, ' '));
            }
        } catch (err) {
            if (!isCancelError(err)) {
                Toast.show({ type: 'error', text2: 'An error occurred while picking the file.' });
            }
        }
    };

    const handleUpload = async () => {
        if (!title.trim() || !file) {
            Toast.show({ type: 'error', text2: 'Please provide a title and select a file.' });
            return;
        }
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('file', {
                uri: file.uri,
                type: file.type,
                name: file.name,
            });
            formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
            const cloudinaryResponse = await axios.post(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/auto/upload`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            const { secure_url: fileUrl, resource_type: fileType } = cloudinaryResponse.data;

            const idToken = await auth().currentUser.getIdToken();
            const tagsArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag);
            const newFilePayload = {
                title: title.trim(),
                description: description.trim(),
                tags: tagsArray,
                fileName: file.name,
                fileUrl,
                fileType,
            };

            await axios.post(`${API_URL}/workspace/files`, newFilePayload, {
                headers: { Authorization: `Bearer ${idToken}` }
            });

            Toast.show({ type: 'success', text2: 'File uploaded successfully.' });
            navigation.goBack();
        } catch (error) {
            console.error("Upload Error:", error.response ? error.response.data : error);
            Toast.show({ type: 'error', text1: 'Upload Failed', text2: 'An error occurred.' });
        } finally {
            setLoading(false);
        }
    };

    const handleTagSelect = (tag) => {
        const currentTags = tags.split(',').map(t => t.trim()).filter(t => t);
        if (!currentTags.includes(tag)) {
            setTags(prevTags => prevTags ? `${prevTags}, ${tag}` : tag);
        }
        setModalVisible(false);
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-100">
            <View className="p-6 flex-row items-center">
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Icon name="arrow-left" size={28} color="#1F2937" />
                </TouchableOpacity>
                <Text className="text-3xl font-bold text-gray-800 ml-4">Upload New File</Text>
            </View>

            <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}>
                <Text className="text-base text-gray-600 mb-2">File</Text>
                <TouchableOpacity onPress={handleFilePick} className="flex-row items-center bg-white p-4 mb-4 rounded-lg border border-gray-300">
                    <Icon name="paperclip" size={20} color="#4A5568" />
                    <Text className="text-lg text-gray-700 ml-3" numberOfLines={1}>{file ? file.name : 'Select a file'}</Text>
                </TouchableOpacity>

                <Text className="text-base text-gray-600 mb-2">Title</Text>
                <TextInput className="bg-white p-4 mb-4 rounded-lg border border-gray-300 text-lg text-black" value={title} onChangeText={setTitle} placeholder="e.g., Mid-Term Exam Syllabus" />

                <Text className="text-base text-gray-600 mb-2">Description (Optional)</Text>
                <TextInput className="bg-white p-4 mb-4 rounded-lg border border-gray-300 text-lg text-black h-24" multiline textAlignVertical="top" value={description} onChangeText={setDescription} placeholder="e.g., For 3rd Semester CSE" />
                
                <Text className="text-base text-gray-600 mb-2">Tags (Optional)</Text>
                <View className="flex-row items-center bg-white rounded-lg border border-gray-300 mb-4">
                    <TextInput className="flex-1 p-4 text-lg text-black" value={tags} onChangeText={setTags} placeholder="e.g., Exam, Syllabus" />
                    {/* --- NEW: Button to open the tag modal --- */}
                    <TouchableOpacity onPress={() => setModalVisible(true)} className="p-3">
                        <Icon name="tag-plus-outline" size={24} color="#4A5568" />
                    </TouchableOpacity>
                </View>
                <Text className="text-xs text-gray-500 -mt-2 mb-6 ml-1">Separate tags with a comma.</Text>

                <TouchableOpacity className="bg-blue-600 p-4 rounded-lg items-center shadow" onPress={handleUpload} disabled={loading}>
                    {loading ? <ActivityIndicator color="white" /> : <Text className="text-white text-lg font-bold">Upload File</Text>}
                </TouchableOpacity>
            </ScrollView>
            
            <Modal
                animationType="slide"
                transparent={true}
                visible={isModalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Select an Existing Tag</Text>
                        <ScrollView>
                            {allTags.map((tag, index) => (
                                <TouchableOpacity key={index} style={styles.tagItem} onPress={() => handleTagSelect(tag)}>
                                    <Text style={styles.tagText}>{tag}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                        <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
                            <Text style={styles.closeButtonText}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        width: '80%',
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 20,
        maxHeight: '60%',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 15,
        textAlign: 'center',
    },
    tagItem: {
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    tagText: {
        fontSize: 16,
    },
    closeButton: {
        backgroundColor: '#2563EB',
        borderRadius: 8,
        padding: 12,
        marginTop: 20,
    },
    closeButtonText: {
        color: 'white',
        textAlign: 'center',
        fontWeight: 'bold',
        fontSize: 16,
    },
});

export default UploadFileScreen;

