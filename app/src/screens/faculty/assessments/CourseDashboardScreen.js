import React, { useState, useCallback } from 'react';
import { View, Text, SafeAreaView, ActivityIndicator, TouchableOpacity, Alert, StyleSheet, Pressable } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import auth from '@react-native-firebase/auth';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import API_URL from '../../../config/apiConfig';
import { SwipeListView } from 'react-native-swipe-list-view';
import Toast from 'react-native-toast-message';

const CourseDashboardScreen = ({ route, navigation }) => {
    const { course } = route.params;
    const [assessments, setAssessments] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                const idToken = await auth().currentUser.getIdToken();
                const headers = { Authorization: `Bearer ${idToken}` };

                const response = await axios.get(`${API_URL}/assessments`, {
                    headers,
                    params: { classId: course.classId, subjectId: course.subjectId },
                });
                setAssessments(response.data);
            } catch (error) {
                console.error("Failed to fetch assessments:", error);
                Toast.show({ type: 'error', text2: 'Could not load assessments.' });
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [course]);

    useFocusEffect(fetchData);

    const confirmDelete = (assessmentId) => {
        Alert.alert(
            "Delete Assessment",
            "Are you sure? This will also delete all associated student marks and submissions.",
            [
                { text: "Cancel", style: "cancel" },
                { text: "Delete", style: "destructive", onPress: () => handleDelete(assessmentId) }
            ]
        );
    };

    const handleDelete = async (assessmentId) => {
        try {
            const idToken = await auth().currentUser.getIdToken();
            await axios.delete(`${API_URL}/assessments/${assessmentId}`, {
                headers: { Authorization: `Bearer ${idToken}` }
            });
            setAssessments(prev => prev.filter(item => item.id !== assessmentId));
            Toast.show({ type: 'success', text2: 'Assessment deleted.' });
        } catch (error) {
            Toast.show({ type: 'error', text2: 'Failed to delete assessment.' });
        }
    };

    const handleCreateNew = () => {
        Alert.alert(
            "Create New Assessment", "What type would you like to create?",
            [
                { text: "Assignment", onPress: () => navigation.navigate('AddAssignment', { course }) },
                { text: "Exam", onPress: () => navigation.navigate('AddExam', { course }) },
                { text: "Cancel", style: "cancel" },
            ]
        );
    };

    const AssessmentItem = ({ item }) => (
        <Pressable 
            onPress={() => navigation.navigate('GradeAssessment', { assessment: item })}
            className="bg-white p-4 mb-4 rounded-2xl shadow-sm flex-row items-center"
        >
            <View className={`p-3 rounded-full ${item.type === 'Assignment' ? 'bg-green-100' : 'bg-purple-100'}`}>
                <Icon 
                    name={item.type === 'Assignment' ? 'file-document-outline' : 'clipboard-text-outline'} 
                    size={24} 
                    color={item.type === 'Assignment' ? '#166534' : '#5B21B6'} 
                />
            </View>
            <View className="ml-4 flex-1">
                <Text className="text-lg font-semibold text-gray-800">{item.title}</Text>
                <Text className="text-sm text-gray-500">Max Marks: {item.maxMarks}</Text>
                {item.dueDate && (
                    <Text className="text-sm text-red-600">
                        Due: {new Date(item.dueDate).toLocaleDateString()}
                    </Text>
                )}
            </View>
            <Icon name="chevron-right" size={24} color="#9CA3AF" />
        </Pressable>
    );

    const renderHiddenItem = (data) => (
        <View style={styles.rowBack}>
            <TouchableOpacity
                style={[styles.backRightBtn, styles.backRightBtnRight]}
                onPress={() => confirmDelete(data.item.id)}
            >
                <Icon name="delete-forever" size={25} color="white" />
                <Text style={styles.backTextWhite}>Delete</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <SafeAreaView className="flex-1 bg-gray-100">
            <View className="p-6">
                <TouchableOpacity onPress={() => navigation.goBack()} className="absolute top-6 left-6 z-10">
                    <Icon name="arrow-left" size={28} color="#1F2937" />
                </TouchableOpacity>
                <Text className="text-2xl font-bold text-gray-800 text-center">{course.subjectName}</Text>
                <Text className="text-base text-gray-500 text-center">{course.className}</Text>
            </View>

            {loading ? (
                <ActivityIndicator size="large" color="#2563EB" />
            ) : (
                <SwipeListView
                    data={assessments}
                    renderItem={(data) => <AssessmentItem item={data.item} />}
                    renderHiddenItem={renderHiddenItem}
                    rightOpenValue={-85}
                    keyExtractor={item => item.id}
                    contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 100 }}
                    ListEmptyComponent={
                        <Text className="text-center text-gray-500 mt-10">
                            No assessments found. Tap '+' to create one.
                        </Text>
                    }
                />
            )}

            <TouchableOpacity
                onPress={handleCreateNew}
                className="absolute bottom-8 right-8 bg-blue-600 p-4 rounded-full shadow-lg"
            >
                <Icon name="plus" size={30} color="white" />
            </TouchableOpacity>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    rowBack: {
        alignItems: 'center',
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginBottom: 16,
        borderRadius: 16,
    },
    backRightBtn: {
        alignItems: 'center',
        bottom: 0,
        justifyContent: 'center',
        position: 'absolute',
        top: 0,
        width: 85,
    },
    backRightBtnRight: {
        backgroundColor: '#EF4444',
        right: 0,
        borderTopRightRadius: 16,
        borderBottomRightRadius: 16,
    },
    backTextWhite: {
        color: '#FFF',
        marginTop: 2,
    },
});

export default CourseDashboardScreen;

