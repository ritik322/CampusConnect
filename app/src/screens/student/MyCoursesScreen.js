import React, { useState, useCallback } from 'react';
import { View, Text, SafeAreaView, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import auth from '@react-native-firebase/auth';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from '../../context/AuthContext';
import API_URL from '../../config/apiConfig';

const MyCoursesScreen = ({ navigation }) => {
    const { userProfile } = useAuth();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(() => {
        const loadData = async () => {
            if (!userProfile?.academicInfo?.classId) return;
            setLoading(true);
            try {
                const idToken = await auth().currentUser.getIdToken();
                const headers = { Authorization: `Bearer ${idToken}` };

                const [classRes, subjectsRes] = await Promise.all([
                    axios.get(`${API_URL}/classes/${userProfile.academicInfo.classId}`, { headers }),
                    axios.get(`${API_URL}/subjects`, { headers })
                ]);

                const subjectsMap = new Map(subjectsRes.data.map(sub => [sub.id, sub]));
                const assignedCourses = [];

                if (classRes.data && classRes.data.curriculum) {
                    classRes.data.curriculum.forEach(item => {
                        const subject = subjectsMap.get(item.subjectId);
                        if (subject) {
                            assignedCourses.push({
                                subjectId: item.subjectId,
                                facultyId: item.facultyId,
                                subjectName: subject.subjectName,
                                subjectCode: subject.subjectCode,
                                classId: classRes.data.id, 
                                className: classRes.data.className, 
                            });
                        }
                    });
                }
                setCourses(assignedCourses);
            } catch (error) {
                console.error("Failed to fetch student courses:", error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [userProfile]);

    useFocusEffect(fetchData);

    const CourseItem = ({ item }) => (
        <TouchableOpacity 
            onPress={() => navigation.navigate('CourseDetails', { course: item })}
            className="bg-white flex-row items-center p-4 mb-4 rounded-2xl shadow-sm"
        >
            <View className="p-3 bg-green-100 rounded-full">
                <Icon name="book-outline" size={24} color="#166534" />
            </View>
            <View className="ml-4 flex-1">
                <Text className="text-lg font-semibold text-gray-800">{item.subjectName}</Text>
                <Text className="text-sm text-gray-500">{item.subjectCode}</Text>
            </View>
            <Icon name="chevron-right" size={24} color="#9CA3AF" />
        </TouchableOpacity>
    );

    return (
        <SafeAreaView className="flex-1 bg-gray-100">
            <View className="p-6">
                <Text className="text-3xl font-bold text-gray-800">My Courses</Text>
            </View>

            <TouchableOpacity 
                onPress={() => navigation.navigate('MyMarks')}
                className="bg-blue-600 p-3 rounded-lg flex-row items-center justify-center mb-4 mx-6 shadow-md"
            >
                <Icon name="chart-bar" size={22} color="white" />
                <Text className="text-white text-lg font-bold ml-2">View My Overall Marks</Text>
            </TouchableOpacity>

            {loading ? (
                <ActivityIndicator size="large" color="#2563EB" />
            ) : (
                <FlatList
                    data={courses}
                    renderItem={({ item }) => <CourseItem item={item} />}
                    keyExtractor={item => item.subjectId}
                    contentContainerStyle={{ paddingHorizontal: 24 }}
                    ListEmptyComponent={
                        <Text className="text-center text-gray-500 mt-10">
                            No courses found for your class.
                        </Text>
                    }
                />
            )}
        </SafeAreaView>
    );
};

export default MyCoursesScreen;
