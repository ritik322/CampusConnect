//app\src\components\student\InfoCard.js
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const InfoCard = ({ 
  icon, 
  title, 
  value, 
  iconColor = "#2563EB", 
  onPress, 
  showArrow = false,
  subtitle,
  variant = "default" // "default", "compact", "detailed"
}) => {
  const Component = onPress ? TouchableOpacity : View;
  
  if (variant === "compact") {
    return (
      <Component 
        onPress={onPress}
        className="bg-white p-3 rounded-xl shadow-sm mb-2 flex-row items-center"
      >
        <View 
          className="w-10 h-10 rounded-xl items-center justify-center mr-3"
          style={{ backgroundColor: `${iconColor}15` }}
        >
          <Icon name={icon} size={18} color={iconColor} />
        </View>
        <View className="flex-1">
          <Text className="text-sm font-semibold text-gray-800">{value || 'Not Available'}</Text>
          <Text className="text-xs text-gray-500">{title}</Text>
        </View>
        {showArrow && <Icon name="chevron-right" size={16} color="#9CA3AF" />}
      </Component>
    );
  }

  if (variant === "detailed") {
    return (
      <Component 
        onPress={onPress}
        className="bg-white p-5 rounded-2xl shadow-sm mb-4"
      >
        <View className="flex-row items-start">
          <View 
            className="w-12 h-12 rounded-2xl items-center justify-center mr-4"
            style={{ backgroundColor: `${iconColor}15` }}
          >
            <Icon name={icon} size={24} color={iconColor} />
          </View>
          <View className="flex-1">
            <Text className="text-sm text-gray-500 mb-1">{title}</Text>
            <Text className="text-lg font-bold text-gray-800 mb-1">{value || 'Not Available'}</Text>
            {subtitle && <Text className="text-sm text-gray-600">{subtitle}</Text>}
          </View>
          {showArrow && <Icon name="chevron-right" size={20} color="#9CA3AF" />}
        </View>
      </Component>
    );
  }

  // Default variant
  return (
    <Component 
      onPress={onPress}
      className="bg-white p-4 rounded-xl shadow-sm mb-3 flex-row items-center"
    >
      <View 
        className="w-12 h-12 rounded-xl items-center justify-center mr-4"
        style={{ backgroundColor: `${iconColor}15` }}
      >
        <Icon name={icon} size={24} color={iconColor} />
      </View>
      <View className="flex-1">
        <Text className="text-sm text-gray-500 mb-1">{title}</Text>
        <Text className="text-base font-semibold text-gray-800">{value || 'Not Available'}</Text>
        {subtitle && <Text className="text-sm text-gray-600 mt-1">{subtitle}</Text>}
      </View>
      {showArrow && <Icon name="chevron-right" size={20} color="#9CA3AF" />}
    </Component>
  );
};

export default InfoCard;