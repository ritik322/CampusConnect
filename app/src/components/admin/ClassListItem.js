import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const ClassListItem = ({ item, onPress }) => {
  return (
    <TouchableOpacity 
      onPress={onPress}
      className="bg-white flex-row items-center p-4 mb-4 rounded-2xl shadow-sm"
    >
      <View className="p-3 bg-cyan-100 rounded-full">
        <Icon name="google-classroom" size={24} color="#0E7490" />
      </View>
      <View className="ml-4 flex-1">
        <Text className="text-lg font-semibold text-gray-800">{item.className}</Text>
        <Text className="text-sm text-gray-500">Year {item.year}, Section {item.section}</Text>
      </View>
      <View className="px-3 py-1 bg-gray-200 rounded-full">
        <Text className="text-xs font-bold text-gray-600 uppercase">{item.department}</Text>
      </View>
    </TouchableOpacity>
  );
};

export default ClassListItem;