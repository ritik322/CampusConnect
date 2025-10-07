import React, { useState } from 'react';
import { View, Text, SafeAreaView, TextInput, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import axios from 'axios';
import auth from '@react-native-firebase/auth';
import Toast from 'react-native-toast-message';
import { pick, types, isCancelError } from '@react-native-documents/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import API_URL from '../../../config/apiConfig';
import { CLOUDINARY_CLOUD_NAME, CLOUDINARY_UPLOAD_PRESET } from '@env';

const AddAssignmentScreen = ({ route, navigation }) => {
    const { course } = route.params;
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [maxMarks, setMaxMarks] = useState('');
    const [dueDate, setDueDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleFilePick = async () => {
        try {
            const res = await pick({ type: [types.allFiles] });
            setFile(res[0]);
        } catch (err) {
            if (!isCancelError(err)) {
                Toast.show({ type: 'error', text2: 'An error occurred while picking the file.' });
            }
        }
    };

    const handleCreate = async () => {
        if (!title.trim() || !maxMarks.trim()) {
            Toast.show({ type: 'error', text2: 'Title and Max Marks are required.' });
            return;
        }
        setLoading(true);
        try {
            let attachmentUrl = null;
            if (file) {
                const formData = new FormData();
                formData.append('file', { uri: file.uri, type: file.type, name: file.name });
                formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
                const cloudinaryResponse = await axios.post(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/auto/upload`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                attachmentUrl = cloudinaryResponse.data.secure_url;
            }

            const idToken = await auth().currentUser.getIdToken();
            const newAssessment = {
                type: 'Assignment',
                title: title.trim(),
                description: description.trim(),
                maxMarks,
                dueDate: dueDate.toISOString(),
                attachmentUrl,
                classId: course.classId,
                subjectId: course.subjectId,
            };

            await axios.post(`${API_URL}/assessments`, newAssessment, {
                headers: { Authorization: `Bearer ${idToken}` }
            });

            Toast.show({ type: 'success', text2: 'Assignment created successfully.' });
            navigation.goBack();
        } catch (error) {
            Toast.show({ type: 'error', text1: 'Creation Failed', text2: 'An error occurred.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-100">
            <View className="p-6">
                <TouchableOpacity onPress={() => navigation.goBack()} className="absolute top-6 left-6 z-10">
                    <Icon name="arrow-left" size={28} color="#1F2937" />
                </TouchableOpacity>
                <Text className="text-3xl font-bold text-gray-800 text-center">New Assignment</Text>
            </View>
            <ScrollView contentContainerStyle={{ paddingHorizontal: 24 }}>
                <Text className="text-base text-gray-600 mb-2">Title</Text>
                <TextInput className="bg-white p-4 mb-4 rounded-lg border border-gray-300 text-lg text-black" value={title} onChangeText={setTitle} />

                <Text className="text-base text-gray-600 mb-2">Description</Text>
                <TextInput className="bg-white p-4 rounded-lg border border-gray-300 text-lg text-black h-24" multiline textAlignVertical="top" value={description} onChangeText={setDescription} />

                <Text className="text-base text-gray-600 mb-2 mt-4">Max Marks</Text>
                <TextInput className="bg-white p-4 mb-4 rounded-lg border border-gray-300 text-lg text-black" keyboardType="number-pad" value={maxMarks} onChangeText={setMaxMarks} />

                <Text className="text-base text-gray-600 mb-2">Due Date</Text>
                <TouchableOpacity onPress={() => setShowDatePicker(true)} className="bg-white p-4 mb-4 rounded-lg border border-gray-300">
                    <Text className="text-lg text-black">{dueDate.toLocaleDateString()}</Text>
                </TouchableOpacity>
                {showDatePicker && (
                    <DateTimePicker value={dueDate} mode="date" display="default" onChange={(event, selectedDate) => {
                        setShowDatePicker(false);
                        setDueDate(selectedDate || dueDate);
                    }} />
                )}

                <TouchableOpacity onPress={handleFilePick} className="flex-row items-center bg-white p-4 mt-4 rounded-lg border border-gray-300">
                    <Icon name="paperclip" size={20} color="#4A5568" />
                    <Text className="text-lg text-gray-700 ml-3" numberOfLines={1}>{file ? file.name : 'Attach a file (Optional)'}</Text>
                </TouchableOpacity>

                <TouchableOpacity className="bg-blue-600 p-4 rounded-lg items-center shadow mt-8" onPress={handleCreate} disabled={loading}>
                    {loading ? <ActivityIndicator color="white" /> : <Text className="text-white text-lg font-bold">Create Assignment</Text>}
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
};

export default AddAssignmentScreen;
