import React from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, ScrollView, Linking } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { format } from 'date-fns';

const NoticeDetailScreen = ({ route, navigation }) => {
  const { notice } = route.params;

  let formattedDate = 'Date not available';
  if (notice.createdAt && notice.createdAt._seconds) {
    formattedDate = format(new Date(notice.createdAt._seconds * 1000), 'MMMM d, yyyy');
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <View className="p-6 flex-row items-center">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={28} color="#1F2937" />
        </TouchableOpacity>
        <Text className="text-3xl font-bold text-gray-800 ml-4 flex-1" numberOfLines={1}>
          {notice.title}
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 24 }}>
        <View className="bg-white p-4 rounded-xl shadow-sm">
          <Text className="text-sm text-gray-500 mb-3">{formattedDate}</Text>
          <Text className="text-base text-gray-700">{notice.content}</Text>

          {notice.attachmentUrl && (
            <TouchableOpacity 
              onPress={() => Linking.openURL(notice.attachmentUrl)}
              className="flex-row items-center mt-4 bg-blue-50 p-3 rounded-lg self-start"
            >
              <Icon name="download-circle-outline" size={20} color="#2563EB" />
              <Text className="text-blue-600 font-bold ml-2">Download Attachment</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default NoticeDetailScreen;