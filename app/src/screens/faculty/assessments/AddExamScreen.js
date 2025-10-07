import React, { useState } from 'react';
import { View, Text, SafeAreaView, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import axios from 'axios';
import auth from '@react-native-firebase/auth';
import Toast from 'react-native-toast-message';
import API_URL from '../../../config/apiConfig';

const AddExamScreen = ({ route, navigation }) => {
    const { course } = route.params;
    const [title, setTitle] = useState('');
    const [maxMarks, setMaxMarks] = useState('');
    const [loading, setLoading] = useState(false);

    const handleCreate = async () => {
        if (!title.trim() || !maxMarks.trim()) {
            Toast.show({ type: 'error', text2: 'Title and Max Marks are required.' });
            return;
        }
        setLoading(true);
        try {
            const idToken = await auth().currentUser.getIdToken();
            const newAssessment = {
                type: 'Exam',
                title: title.trim(),
                maxMarks,
                classId: course.classId,
                subjectId: course.subjectId,
            };

            await axios.post(`${API_URL}/assessments`, newAssessment, {
                headers: { Authorization: `Bearer ${idToken}` }
            });

            Toast.show({ type: 'success', text2: 'Exam created successfully.' });
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
                <Text className="text-3xl font-bold text-gray-800 text-center">New Exam</Text>
            </View>
            <View className="px-6">
                <Text className="text-base text-gray-600 mb-2">Exam Title</Text>
                <TextInput 
                    className="bg-white p-4 mb-4 rounded-lg border border-gray-300 text-lg text-black" 
                    placeholder="e.g., Mid-Semester Examination"
                    value={title} 
                    onChangeText={setTitle} 
                />

                <Text className="text-base text-gray-600 mb-2">Max Marks</Text>
                <TextInput 
                    className="bg-white p-4 mb-4 rounded-lg border border-gray-300 text-lg text-black" 
                    keyboardType="number-pad" 
                    value={maxMarks} 
                    onChangeText={setMaxMarks} 
                />

                <TouchableOpacity 
                    className="bg-blue-600 p-4 rounded-lg items-center shadow mt-8" 
                    onPress={handleCreate} 
                    disabled={loading}
                >
                    {loading ? <ActivityIndicator color="white" /> : <Text className="text-white text-lg font-bold">Create Exam</Text>}
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

export default AddExamScreen;
