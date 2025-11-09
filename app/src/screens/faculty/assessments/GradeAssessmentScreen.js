import React, { useState, useCallback } from 'react';
import { View, Text, SafeAreaView, FlatList, ActivityIndicator, TouchableOpacity, TextInput, Platform, PermissionsAndroid, Linking, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import auth from '@react-native-firebase/auth';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import API_URL from '../../../config/apiConfig';
import Toast from 'react-native-toast-message';
import { pick, types } from '@react-native-documents/picker';
import RNFS from 'react-native-fs'; // --- ADDED IMPORT ---
import Share from 'react-native-share'; // --- ADDED IMPORT ---

const GradeAssessmentScreen = ({ route, navigation }) => {
    const { assessment } = route.params;
    const [gradeSheet, setGradeSheet] = useState([]);
    const [loading, setLoading] = useState(true);
    const [marks, setMarks] = useState({});

    const fetchData = useCallback(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                const idToken = await auth().currentUser.getIdToken();
                const response = await axios.get(`${API_URL}/assessments/${assessment.id}/grades`, {
                    headers: { Authorization: `Bearer ${idToken}` },
                });
                setGradeSheet(response.data);
                
                const initialMarks = {};
                response.data.forEach(student => {
                    if (student.marksObtained !== null && student.marksObtained !== undefined) { // Check for undefined
                        initialMarks[student.studentId] = student.marksObtained.toString();
                    }
                });
                setMarks(initialMarks);
            } catch (error) {
                console.error("Failed to fetch grade sheet:", error);
                Toast.show({ type: 'error', text2: 'Could not load grade sheet.' });
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [assessment.id]);

    useFocusEffect(fetchData);

    const handleMarksChange = (studentId, value) => {
        setMarks(prev => ({ ...prev, [studentId]: value }));
    };

    const handleSaveChanges = async () => {
        setLoading(true);
        try {
            const idToken = await auth().currentUser.getIdToken();
            const marksPayload = Object.keys(marks).map(studentId => ({
                studentId,
                marksObtained: marks[studentId], // Send as string, backend will parseInt
            }));

            await axios.post(`${API_URL}/assessments/${assessment.id}/grades`, { marks: marksPayload }, {
                headers: { Authorization: `Bearer ${idToken}` }
            });

            Toast.show({ type: 'success', text2: 'Grades saved successfully.' });
            navigation.goBack();
        } catch (error) {
            console.error("Error saving grades:", error.response?.data || error.message);
            Toast.show({ type: 'error', text1: 'Save Failed', text2: error.response?.data?.message || 'An error occurred.' });
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadTemplate = async () => {
        if (gradeSheet.length === 0) {
            Toast.show({ type: 'error', text2: 'No students found to generate a template.' });
            return;
        }

        const header = "urn,marksObtained\n";
        const rows = gradeSheet.map(student => `${student.urn},`).join("\n");
        const csvContent = header + rows;

        const fileName = `grades_template_${assessment.id}.csv`;
        const path = `${RNFS.CachesDirectoryPath}/${fileName}`;

        try {
            await RNFS.writeFile(path, csvContent, 'utf8');
            await Share.open({
                url: `file://${path}`,
                type: 'text/csv',
                filename: fileName,
                saveToFiles: true,
                message: 'Download Grade Template',
            });

        } catch (error) {
            if (error.message.includes('User did not share')) {
                return;
            }
            console.error("Failed to download template:", error);
            Toast.show({ 
                type: 'error', 
                text1: 'Download Failed',
                text2: 'Could not share the template file.' 
            });
        }
    };

    const handleBulkUpload = async () => {
        try {
            const res = await pick({ type: [types.xlsx, types.csv] });
            const file = res[0];

            setLoading(true);
            const idToken = await auth().currentUser.getIdToken();
            const formData = new FormData();
            formData.append('file', { uri: file.uri, type: file.type, name: file.name });

            await axios.post(`${API_URL}/assessments/${assessment.id}/grades`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${idToken}`,
                },
            });

            Toast.show({ type: 'success', text2: 'Marks sheet uploaded successfully.' });
            fetchData(); 
        } catch (error) {
            if (error.code === 'DOCUMENT_PICKER_CANCELLED') {
                return;
            }
            console.error("Upload failed:", error.response?.data || error.message);
            Toast.show({ type: 'error', text1: 'Upload Failed', text2: error.response?.data?.message || 'An error occurred.' });
        } finally {
            setLoading(false);
        }
    };

    const StudentRow = ({ item }) => (
        <View className="bg-white p-4 mb-3 rounded-lg shadow-sm">
            <View className="flex-row items-center justify-between">
                <View className="flex-1">
                    <Text className="text-base font-semibold text-gray-800">{item.displayName}</Text>
                    <Text className="text-sm text-gray-500">URN: {item.urn}</Text>
                </View>
                {assessment.type === 'Assignment' && (
                    <View className={`px-2 py-1 rounded-full ${
                        item.submissionStatus === 'Submitted' ? 'bg-yellow-100' : 
                        item.submissionStatus === 'Graded' ? 'bg-green-100' : 'bg-red-100'
                    }`}>
                        <Text className={`text-xs font-bold ${
                            item.submissionStatus === 'Submitted' ? 'text-yellow-800' :
                            item.submissionStatus === 'Graded' ? 'text-green-800' : 'text-red-800'
                        }`}>{item.submissionStatus}</Text>
                    </View>
                )}
            </View>
            <View className="flex-row items-center justify-end mt-2">
                {item.submissionFileUrl && (
                    <TouchableOpacity 
                        onPress={() => {
                            Linking.openURL(item.submissionFileUrl).catch(err => {
                                console.error("Failed to open URL:", err);
                                Alert.alert("Error", "Could not open the file URL.");
                            });
                        }} 
                        className="mr-4"
                    >
                        <Icon name="download-circle-outline" size={28} color="#2563EB" />
                    </TouchableOpacity>
                )}
                <TextInput
                    className={`bg-gray-100 border border-gray-300 rounded-md w-20 text-center text-lg text-black ${
                        assessment.type === 'Assignment' && item.submissionStatus === 'Not Submitted' ? 'bg-gray-200 text-gray-400' : ''
                    }`}
                    keyboardType="number-pad"
                    value={marks[item.studentId] || ''}
                    onChangeText={value => handleMarksChange(item.studentId, value)}
                    placeholder="-"
                    placeholderTextColor="#9CA3AF"
                    editable={assessment.type === 'Exam' || item.submissionStatus !== 'Not Submitted'}
                />
                <Text className="text-lg text-gray-600 ml-2">/ {assessment.maxMarks}</Text>
            </View>
        </View>
    );

    return (
        <SafeAreaView className="flex-1 bg-gray-100">
            <View className="p-6">
                <TouchableOpacity onPress={() => navigation.goBack()} className="absolute top-6 left-6 z-10">
                    <Icon name="arrow-left" size={28} color="#1F2937" />
                </TouchableOpacity>
                <Text className="text-2xl font-bold text-gray-800 text-center">{assessment.title}</Text>
                <Text className="text-base text-gray-500 text-center">Enter Grades</Text>
            </View>

            {assessment.type === 'Exam' && (
                <View className="px-6 mb-4 flex-row justify-between">
                    <TouchableOpacity onPress={handleDownloadTemplate} className="bg-gray-200 p-3 rounded-lg flex-1 mr-2 items-center">
                        <Text className="text-gray-800 font-semibold">Download Template</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleBulkUpload} className="bg-green-500 p-3 rounded-lg flex-1 ml-2 items-center">
                        <Text className="text-white font-bold">Bulk Upload Marks</Text>
                    </TouchableOpacity>
                </View>
            )}

            {loading ? (
                <ActivityIndicator size="large" color="#2563EB" />
            ) : (
                <FlatList
                    data={gradeSheet}
                    renderItem={StudentRow}
                    keyExtractor={item => item.studentId}
                    contentContainerStyle={{ paddingHorizontal: 24 }}
                    ListEmptyComponent={<Text className="text-center text-gray-500 mt-10">No students found for this assessment.</Text>}
                />
            )}

            <View className="p-6 border-t border-gray-200 bg-white">
                <TouchableOpacity
                    className={`bg-blue-600 p-4 rounded-lg items-center shadow ${loading ? 'opacity-50' : ''}`}
                    onPress={handleSaveChanges}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text className="text-white text-lg font-bold">Save Changes</Text>
                    )}
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

export default GradeAssessmentScreen;