import React, { useState, useCallback } from 'react';
import { View, Text, SafeAreaView, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import auth from '@react-native-firebase/auth';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import SubjectListItem from '../../../components/admin/SubjectListItem';
import API_URL from '../../../config/apiConfig';
import { SwipeListView } from 'react-native-swipe-list-view';
import Toast from 'react-native-toast-message';

const ManageSubjectsScreen = ({ navigation }) => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSubjects = useCallback(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const idToken = await auth().currentUser.getIdToken();
        const response = await axios.get(`${API_URL}/subjects`, {
          headers: { Authorization: `Bearer ${idToken}` }
        });
        setSubjects(response.data);
      } catch (error) {
        console.error("Failed to fetch subjects:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  useFocusEffect(fetchSubjects);
  
  const handleDelete = async (subjectId) => {
    try {
      const idToken = await auth().currentUser.getIdToken();
      await axios.delete(`${API_URL}/subjects/${subjectId}`, {
        headers: { Authorization: `Bearer ${idToken}` }
      });
      Toast.show({ type: 'success', text1: 'Success', text2: 'Subject deleted.' });
      setSubjects(prev => prev.filter(sub => sub.id !== subjectId));
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Could not delete subject.' });
    }
  };

  const confirmDelete = (subjectId) => {
    Alert.alert( "Delete Subject", "Are you sure you want to delete this subject?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: () => handleDelete(subjectId) }
      ]
    );
  };
  
  const renderHiddenItem = (data) => (
    <View className="flex-1 flex-row justify-end items-center bg-red-500 rounded-2xl mb-4">
      <TouchableOpacity
        className="w-20 h-full items-center justify-center"
        onPress={() => confirmDelete(data.item.id)}
      >
        <Icon name="delete" size={25} color="white" />
        <Text className="text-white text-xs mt-1">Delete</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <View className="p-6 flex-row items-center">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={28} color="#1F2937" />
        </TouchableOpacity>
        <Text className="text-3xl font-bold text-gray-800 ml-4">Manage Subjects</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#2563EB" />
      ) : (
        <SwipeListView
          data={subjects}
          renderItem={(data) => <SubjectListItem subject={data.item} />}
          renderHiddenItem={renderHiddenItem}
          rightOpenValue={-80}
          disableRightSwipe
          keyExtractor={item => item.id}
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 100 }}
          ListEmptyComponent={<Text className="text-center text-gray-500 mt-10">No subjects found.</Text>}
        />
      )}

      <TouchableOpacity
        className="absolute bottom-8 right-8 bg-blue-600 p-4 rounded-full shadow-lg"
        onPress={() => navigation.navigate('AddSubject')}
      >
        <Icon name="plus" size={30} color="white" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default ManageSubjectsScreen;