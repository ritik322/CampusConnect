import React, { useState, useCallback } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, ActivityIndicator, ScrollView, Linking } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import axios from 'axios';
import auth from '@react-native-firebase/auth';
import Toast from 'react-native-toast-message';
import { pick, types, isCancelError } from '@react-native-documents/picker';
import API_URL from '../../config/apiConfig';
import { useFocusEffect } from '@react-navigation/native';

const AssignmentDetailScreen = ({ route, navigation }) => {
    const { assignment } = route.params;
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [details, setDetails] = useState({ submission: null, mark: null });
    const [initialLoading, setInitialLoading] = useState(true);

    const fetchDetails = useCallback( () => {
        const fetchData = async () => {
        setInitialLoading(true);
        try {
            const idToken = await auth().currentUser.getIdToken();
            const response = await axios.get(`${API_URL}/submissions`, {
                headers: { Authorization: `Bearer ${idToken}` },
                params: { assignmentId: assignment.id },
            });
            setDetails(response.data);
        } catch (error) {
            console.error("Failed to fetch submission details:", error);
        } finally {
            setInitialLoading(false);
        }
    }; fetchData()}, [assignment.id]);

    useFocusEffect(fetchDetails);

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

    const handleSubmission = async () => {
        if (!file) {
            Toast.show({ type: 'error', text2: 'Please select a file to submit.' });
            return;
        }
        setLoading(true);
        try {
            const idToken = await auth().currentUser.getIdToken();
            const formData = new FormData();
            formData.append('file', { uri: file.uri, type: file.type, name: file.name });
            formData.append('assignmentId', assignment.id);
            formData.append('classId', assignment.classId);

            await axios.post(`${API_URL}/submissions`, formData, {
                headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${idToken}` },
            });

            Toast.show({ type: 'success', text2: 'Assignment submitted successfully.' });
            fetchDetails(); 
        } catch (error) {
            Toast.show({ type: 'error', text1: 'Submission Failed', text2: 'An error occurred.' });
        } finally {
            setLoading(false);
        }
    };

    const renderSubmissionSection = () => {
        if (initialLoading) {
            return <ActivityIndicator size="large" color="#2563EB" />;
        }

        const { submission, mark } = details;

        if (submission) {
            const isGraded = !!mark;
            return (
                <View className={`p-4 rounded-lg border ${isGraded ? 'bg-blue-50 border-blue-200' : 'bg-green-50 border-green-200'}`}>
                    <View className="flex-row items-center">
                        <Icon name={isGraded ? "check-decagram" : "check-circle-outline"} size={24} color={isGraded ? "#2563EB" : "#166534"} />
                        <Text className={`text-lg font-bold ml-2 ${isGraded ? 'text-blue-800' : 'text-green-800'}`}>
                            {isGraded ? 'Graded' : 'Submitted Successfully'}
                        </Text>
                    </View>
                    {isGraded ? (
                        <View className="mt-4 items-center">
                            <Text className="text-sm text-gray-600">You received</Text>
                            <Text className="text-4xl font-bold text-blue-800 my-1">{mark.marksObtained} / {assignment.maxMarks}</Text>
                        </View>
                    ) : (
                        <Text className="text-base text-green-700 mt-2">
                            On: {new Date(submission.submittedAt).toLocaleString()}
                        </Text>
                    )}
                    <TouchableOpacity onPress={() => Linking.openURL(submission.submissionFileUrl)} className="mt-4 bg-white px-4 py-2 rounded-full self-center border border-gray-300">
                        <Text className="text-gray-800 font-semibold">View My Submission</Text>
                    </TouchableOpacity>
                </View>
            );
        }

        return (
            <>
                <TouchableOpacity onPress={handleFilePick} className="flex-row items-center bg-white p-4 rounded-lg border border-gray-300">
                    <Icon name="paperclip" size={20} color="#4A5563" />
                    <Text className="text-lg text-gray-700 ml-3" numberOfLines={1}>{file ? file.name : 'Select a file...'}</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                    className={`p-4 rounded-lg items-center shadow mt-4 ${!file || loading ? 'bg-gray-400' : 'bg-green-600'}`}
                    onPress={handleSubmission} 
                    disabled={loading || !file}
                >
                    {loading ? <ActivityIndicator color="white" /> : <Text className="text-white text-lg font-bold">Submit Assignment</Text>}
                </TouchableOpacity>
            </>
        );
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-100">
            <View className="p-6">
                <TouchableOpacity onPress={() => navigation.goBack()} className="absolute top-6 left-6 z-10">
                    <Icon name="arrow-left" size={28} color="#1F2937" />
                </TouchableOpacity>
                <Text className="text-3xl font-bold text-gray-800 text-center">Assignment</Text>
            </View>

            <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}>
                <View className="bg-white p-4 rounded-lg shadow-sm">
                    <Text className="text-xl font-bold text-gray-800">{assignment.title}</Text>
                    <Text className="text-base text-gray-500 mt-1">Max Marks: {assignment.maxMarks}</Text>
                    <Text className="text-base text-red-600 mt-1">Due: {new Date(assignment.dueDate).toLocaleString()}</Text>
                    <Text className="text-base text-gray-700 mt-4">{assignment.description}</Text>
                    {assignment.attachmentUrl && (
                        <TouchableOpacity onPress={() => Linking.openURL(assignment.attachmentUrl)} className="mt-4 bg-blue-100 p-3 rounded-lg flex-row items-center">
                            <Icon name="download-circle-outline" size={22} color="#2563EB" />
                            <Text className="text-blue-600 font-semibold ml-2">Download Attachment</Text>
                        </TouchableOpacity>
                    )}
                </View>

                <View className="mt-8">
                    <Text className="text-xl font-bold text-gray-800 mb-2">Your Submission</Text>
                    {renderSubmissionSection()}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default AssignmentDetailScreen;

