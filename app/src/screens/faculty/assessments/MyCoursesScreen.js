import React, { useState, useCallback } from 'react';
import { View, Text, SafeAreaView, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import auth from '@react-native-firebase/auth';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from '../../../context/AuthContext';
import API_URL from '../../../config/apiConfig';

const MyCoursesScreen = ({ navigation }) => {
    const { userProfile } = useAuth();
    const [myCourses, setMyCourses] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(() => {
        const loadData = async () => {
            if (!userProfile?.uid) return;
            setLoading(true);
            try {
                const idToken = await auth().currentUser.getIdToken();
                const headers = { Authorization: `Bearer ${idToken}` };

                const [classesResponse, subjectsResponse] = await Promise.all([
                    axios.get(`${API_URL}/classes`, { headers }),
                    axios.get(`${API_URL}/subjects`, { headers })
                ]);

                const subjectsMap = new Map(subjectsResponse.data.map(sub => [sub.id, sub.subjectName]));
                const assignedCourses = [];

                classesResponse.data.forEach(cls => {
                    if (cls.curriculum) {
                        cls.curriculum.forEach(assignment => {
                            if (assignment.facultyId === userProfile.uid) {
                                assignedCourses.push({
                                    classId: cls.id,
                                    className: cls.className,
                                    subjectId: assignment.subjectId,
                                    subjectName: subjectsMap.get(assignment.subjectId) || 'Unknown Subject',
                                });
                            }
                        });
                    }
                });

                setMyCourses(assignedCourses);
            } catch (error) {
                console.error("Failed to fetch courses:", error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [userProfile]);

    useFocusEffect(fetchData);

    const CourseItem = ({ item }) => (
        <TouchableOpacity 
            onPress={() => navigation.navigate('CourseDashboard', { course: item })}
            className="bg-white flex-row items-center p-4 mb-4 rounded-2xl shadow-sm"
        >
            <View className="p-3 bg-blue-100 rounded-full">
                <Icon name="book-open-variant" size={24} color="#2563EB" />
            </View>
            <View className="ml-4 flex-1">
                <Text className="text-lg font-semibold text-gray-800">{item.subjectName}</Text>
                <Text className="text-sm text-gray-500">{item.className}</Text>
            </View>
            <Icon name="chevron-right" size={24} color="#9CA3AF" />
        </TouchableOpacity>
    );

    return (
        <SafeAreaView className="flex-1 bg-gray-100">
            <View className="p-6 flex-row items-center">
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Icon name="arrow-left" size={28} color="#1F2937" />
                </TouchableOpacity>
                <Text className="text-3xl font-bold text-gray-800 ml-4">My Courses</Text>
            </View>

            {loading ? (
                <ActivityIndicator size="large" color="#2563EB" />
            ) : (
                <FlatList
                    data={myCourses}
                    renderItem={({ item }) => <CourseItem item={item} />}
                    keyExtractor={item => `${item.classId}-${item.subjectId}`}
                    contentContainerStyle={{ paddingHorizontal: 24 }}
                    ListEmptyComponent={
                        <Text className="text-center text-gray-500 mt-10">
                            You are not assigned to any courses.
                        </Text>
                    }
                />
            )}
        </SafeAreaView>
    );
};

export default MyCoursesScreen;
