import React from 'react';
import { View, Text, Pressable, Linking, TouchableOpacity } from 'react-native';
import { format, isValid } from 'date-fns';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const NoticeCard = ({ notice, onPress }) => {
  

  const getFormattedDate = () => {
    if (!notice.createdAt) return '';

    let date;
    try {
      if (notice.createdAt._seconds) {
        date = new Date(notice.createdAt._seconds * 1000);
      } 
      else if (notice.createdAt.seconds) {
        date = new Date(notice.createdAt.seconds * 1000);
      } 
      else {
        date = new Date(notice.createdAt);
      }

      if (isValid(date)) {
        return format(date, 'MMMM d, yyyy');
      }
    } catch (error) {
        console.error("Could not parse date:", notice.createdAt, error);
        return ''; // Return empty string on error to prevent crash
    }
    
    return '';
  };

  const formattedDate = getFormattedDate();

  const getSourceLabel = () => {
    if (!notice.targetAudience) return 'General';
    const { type, value } = notice.targetAudience;
    if (type === 'GLOBAL') return 'Entire College';
    if (type === 'DEPARTMENT') return `${value.toUpperCase()} Department`;
    if (type === 'HOSTEL') return notice.hostelName || 'Hostel Notice';
    return 'General';
  };

  return (
    <Pressable 
      onPress={onPress}
      className="bg-white p-4 rounded-xl shadow-sm mb-4"
    >
      <View className="flex-row justify-between items-start mb-2">
        <Text className="text-lg font-bold text-gray-800 flex-1 mr-2">{notice.title}</Text>
        <Text className="text-xs text-gray-500 mt-1">{formattedDate}</Text>
      </View>
      <Text className="text-base text-gray-700 leading-6" numberOfLines={3}>{notice.content}</Text>
      
      {notice.attachmentUrl && (
        <TouchableOpacity
          onPress={() => Linking.openURL(notice.attachmentUrl)}
          className="flex-row items-center mt-3 bg-blue-50 p-2 rounded-lg self-start"
        >
          <Icon name="attachment" size={16} color="#2563EB" />
          <Text className="text-blue-600 font-semibold ml-2">View Attachment</Text>
        </TouchableOpacity>
      )}

      <View className="border-t border-gray-100 mt-4 pt-2 flex-row justify-between items-center">
        <View>
            <Text className="text-xs text-gray-400">Published to:</Text>
        </View>
        <View className="px-3 py-1 rounded-full bg-gray-100">
            <Text className="text-xs font-bold text-gray-500">{getSourceLabel()}</Text>
        </View>
      </View>
    </Pressable>
  );
};

export default NoticeCard;

