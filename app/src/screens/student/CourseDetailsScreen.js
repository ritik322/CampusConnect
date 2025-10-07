import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import auth from '@react-native-firebase/auth';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import API_URL from '../../config/apiConfig';

const CourseDetailsScreen = ({ route, navigation }) => {
  const { course } = route.params;
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Assignments');
  const [assignments, setAssignments] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [submissions, setSubmissions] = useState([]);

  console.log(course);

  useFocusEffect(
    useCallback(() => {
      const fetchData = async () => {
        if (!course?.classId || !course?.subjectId) {
          setLoading(false);
          return;
        }

        setLoading(true);
        try {
          const idToken = await auth().currentUser.getIdToken();
          const headers = { Authorization: `Bearer ${idToken}` };

          const [assignmentsRes, materialsRes, submissionsRes] =
            await Promise.all([
              axios.get(`${API_URL}/assessments`, {
                headers,
                params: {
                  classId: course.classId,
                  subjectId: course.subjectId,
                },
              }),
              axios.get(`${API_URL}/workspace/shared-files`, {
                headers,
                params: { classId: course.classId },
              }),
              axios.get(`${API_URL}/submissions/my-submissions`, {
                headers,
                params: { classId: course.classId },
              }), // <-- ADD THIS CALL
            ]);

          setAssignments(
            assignmentsRes.data.filter(a => a.type === 'Assignment'),
          );
          setMaterials(materialsRes.data);
          setSubmissions(submissionsRes.data);
        } catch (error) {
          console.error('Failed to fetch course details:', error);
        } finally {
          setLoading(false);
        }
      };

      fetchData();
    }, [course]),
  );

  const renderContent = () => {
    if (loading) return <ActivityIndicator size="large" color="#2563EB" />;

    if (activeTab === 'Assignments') {
      return (
        <FlatList
          data={assignments}
          keyExtractor={item => item.id}
          renderItem={({ item }) => <AssignmentItem item={item} />}
          ListEmptyComponent={
            <Text className="text-center text-gray-500 mt-10">
              No assignments found for this course.
            </Text>
          }
        />
      );
    } else {
      return (
        <FlatList
          data={materials}
          keyExtractor={item => item.id}
          renderItem={({ item }) => <MaterialItem item={item} />}
          ListEmptyComponent={
            <Text className="text-center text-gray-500 mt-10">
              No materials shared for this course.
            </Text>
          }
        />
      );
    }
  };

  const AssignmentItem = ({ item }) => {
    const isSubmitted = submissions.some(sub => sub.assignmentId === item.id);

    return (
      <TouchableOpacity
        onPress={() =>
          navigation.navigate('AssignmentDetail', { assignment: item })
        }
        className="bg-white p-4 mb-3 rounded-lg shadow-sm"
      >
        <View className="flex-row justify-between items-start">
          <Text className="text-base font-semibold text-gray-800 flex-1">
            {item.title}
          </Text>
          {isSubmitted && (
            <View className="bg-green-100 px-2 py-1 rounded-full ml-2">
              <Text className="text-green-800 text-xs font-bold">
                SUBMITTED
              </Text>
            </View>
          )}
        </View>
        <Text className="text-sm text-red-600 mt-1">
          Due: {new Date(item.dueDate).toLocaleDateString()}
        </Text>
      </TouchableOpacity>
    );
  };

  const MaterialItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => Linking.openURL(item.fileUrl)}
      className="bg-white p-4 mb-3 rounded-lg shadow-sm flex-row items-center"
    >
      <Icon name="file-document-outline" size={24} color="#4B5563" />
      <View className="ml-4 flex-1">
        <Text className="text-base font-semibold text-gray-800">
          {item.title}
        </Text>
        <Text className="text-sm text-gray-500 mt-1" numberOfLines={1}>
          {item.description}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <View className="p-6">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="absolute top-6 left-6 z-10"
        >
          <Icon name="arrow-left" size={28} color="#1F2937" />
        </TouchableOpacity>
        <Text className="text-2xl font-bold text-gray-800 text-center">
          {course.subjectName}
        </Text>
      </View>

      <View className="flex-row justify-around border-b border-gray-200 mb-4">
        <TabButton
          title="Assignments"
          active={activeTab === 'Assignments'}
          onPress={() => setActiveTab('Assignments')}
        />
        <TabButton
          title="Materials"
          active={activeTab === 'Materials'}
          onPress={() => setActiveTab('Materials')}
        />
      </View>

      <View className="flex-1 px-6">{renderContent()}</View>
    </SafeAreaView>
  );
};

const TabButton = ({ title, active, onPress }) => (
  <TouchableOpacity
    onPress={onPress}
    className={`py-3 border-b-2 ${
      active ? 'border-blue-600' : 'border-transparent'
    }`}
  >
    <Text
      className={`font-semibold ${active ? 'text-blue-600' : 'text-gray-500'}`}
    >
      {title}
    </Text>
  </TouchableOpacity>
);

export default CourseDetailsScreen;
