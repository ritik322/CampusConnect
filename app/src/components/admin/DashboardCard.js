import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const DashboardCard = ({ icon, title, onPress }) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="w-[48%] bg-white p-6 mb-4 rounded-2xl shadow-md items-center justify-center"
      style={{ aspectRatio: 1 }}
    >
      <Icon name={icon} size={40} color="#2563EB" />
      <Text className="text-center text-base font-semibold text-gray-700 mt-4">{title}</Text>
    </TouchableOpacity>
  );
};

export default DashboardCard;