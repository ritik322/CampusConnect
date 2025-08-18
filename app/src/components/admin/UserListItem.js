import React from 'react';
import { View, Text } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const UserListItem = ({ user }) => {
  return (
    <View className="bg-white flex-row items-center p-4 mb-4 rounded-2xl shadow-sm">
      <View className="p-3 bg-blue-100 rounded-full">
        <Icon name="account" size={24} color="#2563EB" />
      </View>
      <View className="ml-4 flex-1">
        <Text className="text-lg font-semibold text-gray-800">{user.displayName}</Text>
        <Text className="text-sm text-gray-500">{user.email}</Text>
      </View>
      <View className="px-3 py-1 bg-gray-200 rounded-full">
        <Text className="text-xs font-bold text-gray-600 uppercase">{user.role}</Text>
      </View>
    </View>
  );
};

export default UserListItem;