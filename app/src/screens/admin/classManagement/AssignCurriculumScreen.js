import React, { useState, useCallback } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, FlatList, ActivityIndicator, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import axios from 'axios';
import auth from '@react-native-firebase/auth';
import API_URL from '../../../config/apiConfig';
import Toast from 'react-native-toast-message';
import DropDownPicker from 'react-native-dropdown-picker';
import { useFocusEffect } from '@react-navigation/native';

const AssignCurriculumScreen = ({ route, navigation }) => {
    const { selectedClass } = route.params;
    const [subjects, setSubjects] = useState([]);
    const [faculty, setFaculty] = useState([]);
    const [assignments, setAssignments] = useState({});
    const [loading, setLoading] = useState(true);
    const [openPickerId, setOpenPickerId] = useState(null);

    const fetchData = useCallback(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                const idToken = await auth().currentUser.getIdToken();
                const headers = { Authorization: `Bearer ${idToken}` };
                
                const subjectsResponse = await axios.get(`${API_URL}/subjects`, { headers });
                // Fetch all users from the backend
                const usersResponse = await axios.get(`${API_URL}/users`, { headers });

                // Filter subjects for the correct department on the frontend
                const departmentSubjects = subjectsResponse.data.filter(s => 
                    s.department === selectedClass.department && s.year === selectedClass.year
                );
                
                // Filter all users to get only faculty from the correct department
                const allFaculty = usersResponse.data.filter(u => u.role === 'faculty');
                const departmentFaculty = allFaculty.filter(f => f.department === selectedClass.department);
                
                setSubjects(departmentSubjects);
                setFaculty(departmentFaculty.map(f => ({ label: f.displayName, value: f.id })));

                const initialAssignments = {};
                if (selectedClass.curriculum) {
                    selectedClass.curriculum.forEach(item => {
                        initialAssignments[item.subjectId] = { 
                            facultyId: item.facultyId, 
                        };
                    });
                }
                setAssignments(initialAssignments);

            } catch (error) {
                console.error("Failed to fetch data:", error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [selectedClass]);

    useFocusEffect(fetchData);

    const handleAssignmentChange = (subjectId, value) => {
        setAssignments(prev => ({
            ...prev,
            [subjectId]: {
                ...prev[subjectId],
                facultyId: value
            }
        }));
    };

    const handleSaveChanges = async () => {
        setLoading(true);
        try {
            const idToken = await auth().currentUser.getIdToken();
            
            const formattedAssignments = subjects.map(subject => ({
                subjectId: subject.id,
                facultyId: assignments[subject.id]?.facultyId,
                lecturesPerWeek: subject.lecturesPerWeek || 0, 
            })).filter(a => a.facultyId); 

            await axios.put(`${API_URL}/curriculum/classes/${selectedClass.id}`, { assignments: formattedAssignments }, {
                headers: { Authorization: `Bearer ${idToken}` }
            });

            Toast.show({ type: 'success', text1: 'Success', text2: 'Curriculum saved successfully.' });
            navigation.goBack();
        } catch (error) {
            const errorMessage = error.response ? error.response.data.message : 'An error occurred.';
            Toast.show({ type: 'error', text1: 'Update Failed', text2: errorMessage });
        } finally {
            setLoading(false);
        }
    };

    const renderItem = ({ item, index }) => (
        <View style={{ zIndex: openPickerId === item.id ? 999 : subjects.length - index }} className="bg-white p-4 mb-4 rounded-lg shadow-sm">
            <Text className="text-lg font-semibold text-gray-800">{item.subjectName}</Text>
            <Text className="text-sm text-gray-500 mb-1">{item.subjectCode}</Text>
            <Text className="text-sm text-blue-600 font-semibold mb-3">Lectures per Week: {item.lecturesPerWeek || 'N/A'}</Text>
            
            <Text className="text-base text-gray-600 mb-2">Assign Faculty</Text>
            <DropDownPicker
                open={openPickerId === item.id}
                setOpen={() => setOpenPickerId(prevId => (prevId === item.id ? null : item.id))}
                value={assignments[item.id]?.facultyId || null}
                setValue={(callback) => {
                    const value = callback();
                    handleAssignmentChange(item.id, value);
                }}
                items={faculty}
                placeholder="Select faculty..."
                style={{ borderColor: '#F3F4F6' }}
                dropDownContainerStyle={{ borderColor: '#F3F4F6' }}
                listMode="SCROLLVIEW"
            />
        </View>
    );

    return (
        <SafeAreaView className="flex-1 bg-gray-100">
            <View className="p-6">
                <TouchableOpacity onPress={() => navigation.goBack()} className="absolute top-6 left-6 z-10">
                    <Icon name="arrow-left" size={28} color="#1F2937" />
                </TouchableOpacity>
                <Text className="text-3xl font-bold text-gray-800 text-center">Assign Curriculum</Text>
                <Text className="text-base text-gray-500 text-center">{selectedClass.className}</Text>
            </View>

            {loading ? (
                <ActivityIndicator size="large" color="#2563EB" />
            ) : (
                <FlatList
                    data={subjects}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={{ paddingHorizontal: 24 }}
                    removeClippedSubviews={false}
                />
            )}
            
            <View className="p-6">
                <TouchableOpacity
                    className="bg-blue-600 p-4 rounded-lg items-center shadow"
                    onPress={handleSaveChanges}
                    disabled={loading}
                >
                    {loading ? <ActivityIndicator color="white" /> : <Text className="text-white text-lg font-bold">Save Changes</Text>}
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

export default AssignCurriculumScreen;

