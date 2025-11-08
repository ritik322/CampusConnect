import React, { useState, useCallback } from 'react';
import { View, Text, SafeAreaView, FlatList, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import auth from '@react-native-firebase/auth';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import ClassroomListItem from '../../../components/admin/ClassroomListItem';
import API_URL from '../../../config/apiConfig';

const ManageClassroomsScreen = ({ navigation }) => {
  const [classrooms, setClassrooms] = useState([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      const fetchClassrooms = async () => {
        setLoading(true);
        try {
          const idToken = await auth().currentUser.getIdToken();
          const response = await axios.get(`${API_URL}/classrooms`, {
            headers: { Authorization: `Bearer ${idToken}` }
          });
          setClassrooms(response.data);
        } catch (error) {
          console.error("Failed to fetch classrooms:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchClassrooms();
    }, [])
  );

  const handleDelete = (classroomId) => {
    Alert.alert(
      "Confirm Delete",
      "Are you sure you want to delete this classroom?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const idToken = await auth().currentUser.getIdToken();
              await axios.delete(`${API_URL}/classrooms/${classroomId}`, {
                headers: { Authorization: `Bearer ${idToken}` }
              });
              setClassrooms(prevClassrooms => 
                prevClassrooms.filter(c => c.id !== classroomId)
              );
            } catch (error) {
              console.error("Failed to delete classroom:", error);
              Alert.alert("Error", "Could not delete classroom.");
            }
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <View className="p-6 flex-row items-center">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={28} color="#1F2937" />
        </TouchableOpacity>
        <Text className="text-3xl font-bold text-gray-800 ml-4">Manage Classrooms</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#2563EB" />
      ) : (
        <FlatList
          data={classrooms}
          renderItem={({ item }) => (
            <ClassroomListItem 
              classroom={item}
              onDelete={() => handleDelete(item.id)}
            />
          )}
          keyExtractor={item => item.id}
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 100 }}
          ListEmptyComponent={<Text className="text-center text-gray-500 mt-10">No classrooms found.</Text>}
        />
      )}

      <TouchableOpacity
        className="absolute bottom-8 right-8 bg-blue-600 p-4 rounded-full shadow-lg"
        onPress={() => navigation.navigate('AddClassroom')}
      >
        <Icon name="plus" size={30} color="white" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default ManageClassroomsScreen;