import React from 'react';
import { View, Text } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const SlotPatternListItem = ({ pattern }) => {
  return (
    <View className="bg-white p-4 mb-4 rounded-2xl shadow-sm">
      <View className="flex-row items-center justify-between">
        <Text className="text-lg font-semibold text-gray-800">{pattern.patternName}</Text>
        <View className="px-3 py-1 bg-gray-200 rounded-full">
          <Text className="text-xs font-bold text-gray-600 uppercase">{pattern.type}</Text>
        </View>
      </View>
      <Text className="text-sm text-gray-500 mt-1">{pattern.department}</Text>
      <View className="mt-3 border-t border-gray-200 pt-2">
        <Text className="text-base font-medium text-gray-600 mb-1">Slots ({pattern.slots.length})</Text>
        {pattern.slots.slice(0, 2).map((slot, index) => (
          <Text key={index} className="text-sm text-gray-500">
            {slot.slotName}: {slot.startTime} - {slot.endTime}
          </Text>
        ))}
        {pattern.slots.length > 2 && <Text className="text-sm text-gray-500">...</Text>}
      </View>
    </View>
  );
};

export default SlotPatternListItem;