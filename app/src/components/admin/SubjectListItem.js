import React from 'react';
import { View, Text } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const SubjectListItem = ({ subject }) => {
  return (
    <View className="bg-white flex-row items-center p-4 mb-4 rounded-2xl shadow-sm">
      <View className="p-3 bg-indigo-100 rounded-full">
        <Icon name="book-open-variant" size={24} color="#4338CA" />
      </View>
      <View className="ml-4 flex-1">
        <Text className="text-lg font-semibold text-gray-800">{subject.subjectName}</Text>
        <Text className="text-sm text-gray-500">{subject.subjectCode} - Year {subject.year}</Text>
      </View>
      <View className="px-3 py-1 bg-gray-200 rounded-full">
        <Text className="text-xs font-bold text-gray-600 uppercase">{subject.department}</Text>
      </View>
    </View>
  );
};

export default SubjectListItem;