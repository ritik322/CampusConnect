import React from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, Alert } from 'react-native';
import auth from '@react-native-firebase/auth';

const AdminDashboardScreen = () => {
  const handleLogout = async () => {
    try {
      await auth().signOut();
    } catch (error) {
      Alert.alert('Error', 'Failed to log out.');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-100 justify-center items-center p-6">
      <Text className="text-3xl font-bold text-gray-800">
        Admin Dashboard
      </Text>
      <TouchableOpacity 
        className="mt-8 bg-red-500 p-4 rounded-lg"
        onPress={handleLogout}
      >
        <Text className="text-white text-lg font-bold">Log Out</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default AdminDashboardScreen;