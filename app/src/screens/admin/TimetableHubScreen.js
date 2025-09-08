import React from 'react';
import { View, Text, SafeAreaView, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const TimetableHubScreen = ({ navigation }) => {
  const menuItems = [
    { title: 'Manage Subjects', icon: 'book-open-page-variant', navigateTo: 'ManageSubjects' },
    { title: 'Manage Classrooms', icon: 'school', navigateTo: 'ManageClassrooms' },
    { title: 'Manage Classes', icon: 'google-classroom', navigateTo: 'ManageClasses' },
    { title: 'Generate Timetable', icon: 'cogs', navigateTo: 'GenerateTimetable' },
  ];

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <View className="p-6 flex-row items-center">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={28} color="#1F2937" />
        </TouchableOpacity>
        <Text className="text-3xl font-bold text-gray-800 ml-4">Timetable Management</Text>
      </View>

      <View className="p-6">
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => navigation.navigate(item.navigateTo)}
            className="bg-white flex-row items-center p-4 mb-4 rounded-2xl shadow-sm"
          >
            <Icon name={item.icon} size={30} color="#4A5568" />
            <Text className="text-lg font-semibold text-gray-700 ml-4">{item.title}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
};

export default TimetableHubScreen;