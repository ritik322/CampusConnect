import React from 'react';
import { View, Text } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const ClassroomListItem = ({ classroom }) => {
  return (
    <View className="bg-white flex-row items-center p-4 mb-4 rounded-2xl shadow-sm">
      <View className="p-3 bg-green-100 rounded-full">
        <Icon name={classroom.type === 'lab' ? 'flask' : 'door-closed'} size={24} color="#166534" />
      </View>
      <View className="ml-4 flex-1">
        <Text className="text-lg font-semibold text-gray-800">Room: {classroom.roomNumber}</Text>
        <Text className="text-sm text-gray-500">Capacity: {classroom.capacity}</Text>
      </View>
      <View className="px-3 py-1 bg-gray-200 rounded-full">
        <Text className="text-xs font-bold text-gray-600 uppercase">{classroom.department}</Text>
      </View>
    </View>
  );
};

export default ClassroomListItem;