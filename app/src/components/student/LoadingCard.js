//app\src\components\student\LoadingCard.js
import React from 'react';
import { View, Text } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const LoadingCard = ({ message = "Loading...", variant = "default" }) => {
  if (variant === "compact") {
    return (
      <View className="bg-white p-3 rounded-xl shadow-sm mb-2 flex-row items-center">
        <View className="w-10 h-10 bg-gray-200 rounded-xl mr-3 animate-pulse" />
        <View className="flex-1">
          <View className="h-4 bg-gray-200 rounded w-3/4 mb-1 animate-pulse" />
          <View className="h-3 bg-gray-200 rounded w-1/2 animate-pulse" />
        </View>
      </View>
    );
  }

  if (variant === "detailed") {
    return (
      <View className="bg-white p-5 rounded-2xl shadow-sm mb-4">
        <View className="flex-row items-start">
          <View className="w-12 h-12 bg-gray-200 rounded-2xl mr-4 animate-pulse" />
          <View className="flex-1">
            <View className="h-4 bg-gray-200 rounded w-1/3 mb-2 animate-pulse" />
            <View className="h-6 bg-gray-200 rounded w-2/3 mb-2 animate-pulse" />
            <View className="h-4 bg-gray-200 rounded w-1/2 animate-pulse" />
          </View>
        </View>
      </View>
    );
  }

  // Default variant
  return (
    <View className="bg-white p-6 rounded-2xl shadow-sm mb-4 items-center justify-center" style={{ minHeight: 120 }}>
      <View className="bg-blue-100 p-4 rounded-full mb-4">
        <Icon name="loading" size={24} color="#3B82F6" />
      </View>
      <Text className="text-gray-600 text-center font-medium">{message}</Text>
      <View className="flex-row mt-3 space-x-1">
        <View className="w-2 h-2 bg-blue-300 rounded-full animate-pulse" />
        <View className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '0.1s' }} />
        <View className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
      </View>
    </View>
  );
};

export default LoadingCard;