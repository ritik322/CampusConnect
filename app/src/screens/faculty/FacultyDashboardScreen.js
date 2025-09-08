import React from 'react';
import { View, Text, SafeAreaView, TouchableOpacity } from 'react-native';
import auth from '@react-native-firebase/auth';

const FacultyDashboardScreen = ({ navigation }) => {
  return (
    <SafeAreaView className="flex-1 justify-center items-center">
      <Text className="text-3xl font-bold">Faculty Dashboard</Text>
      <TouchableOpacity 
        onPress={() => navigation.navigate('Timetable')}
        className="bg-blue-600 p-4 rounded-lg mt-8"
      >
        <Text className="text-white text-lg font-bold">View Timetable</Text>
      </TouchableOpacity>
      <TouchableOpacity 
        onPress={() => auth().signOut()}
        className="bg-red-500 p-4 rounded-lg mt-4"
      >
        <Text className="text-white text-lg font-bold">Log Out</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default FacultyDashboardScreen;