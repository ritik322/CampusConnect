import React from 'react';
import { View, Text, TouchableOpacity, Linking } from 'react-native';
import { format } from 'date-fns';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const NoticeCard = ({ notice, onPress }) => {
  let formattedDate = '';
  if (notice.createdAt && notice.createdAt._seconds) {
    formattedDate = format(new Date(notice.createdAt._seconds * 1000), 'MMMM d, yyyy');
  }

  return (
    <TouchableOpacity 
      onPress={onPress} 
      activeOpacity={1}
      className="bg-white p-4 rounded-xl shadow-sm mb-4"
    >
      <View className="flex-row justify-between items-center mb-2">
        <Text className="text-lg font-bold text-gray-800 flex-1">{notice.title}</Text>
        <Text className="text-xs text-gray-500">{formattedDate}</Text>
      </View>
      <Text className="text-base text-gray-700" numberOfLines={3}>{notice.content}</Text>
      {notice.attachmentUrl && (
        <TouchableOpacity
          onPress={() => Linking.openURL(notice.attachmentUrl)}
          className="flex-row items-center mt-3 bg-blue-50 p-2 rounded-lg self-start"
        >
          <Icon name="attachment" size={16} color="#2563EB" />
          <Text className="text-blue-600 font-semibold ml-2">View Attachment</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

export default NoticeCard;