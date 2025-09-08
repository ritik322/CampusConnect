import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, SafeAreaView, ActivityIndicator, StyleSheet, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import axios from 'axios';
import auth from '@react-native-firebase/auth';
import Toast from 'react-native-toast-message';
import RNPickerSelect from 'react-native-picker-select';
import API_URL from '../../../config/apiConfig';

const EditNoticeScreen = ({ route, navigation }) => {
  const { notice } = route.params;

  const [title, setTitle] = useState(notice.title);
  const [content, setContent] = useState(notice.content);
  const [target, setTarget] = useState(notice.targetAudience.department);
  const [loading, setLoading] = useState(false);

  const handleUpdate = async () => {
    if (!title.trim() || !content.trim() || !target) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Please fill all fields.' });
      return;
    }

    setLoading(true);
    try {
      const idToken = await auth().currentUser.getIdToken();
      const updatedNotice = {
        title: title.trim(),
        content: content.trim(),
        targetAudience: { department: target },
      };

      await axios.put(`${API_URL}/notices/${notice.id}`, updatedNotice, {
        headers: { Authorization: `Bearer ${idToken}` }
      });

      Toast.show({ type: 'success', text1: 'Success', text2: 'Notice updated successfully.' });
      navigation.goBack();
    } catch (error) {
      const errorMessage = error.response ? error.response.data.message : 'Update failed.';
      Toast.show({ type: 'error', text1: 'Update Failed', text2: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const audienceItems = [
    { label: 'Entire College', value: 'ALL' },
    { label: 'Computer Science (CSE)', value: 'CSE' },
    { label: 'Information Technology', value: 'IT' },
    { label: 'Mechanical', value: 'Mechanical' },
    { label: 'Civil', value: 'Civil' },
    { label: 'Electrical', value: 'Electrical' },
  ];

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <View className="p-6 flex-row items-center">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={28} color="#1F2937" />
        </TouchableOpacity>
        <Text className="text-3xl font-bold text-gray-800 ml-4">Edit Notice</Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 24 }}>
        <Text className="text-base text-gray-600 mb-2">Title</Text>
        <TextInput
          className="bg-white p-4 mb-4 rounded-lg border border-gray-300 text-lg text-black"
          value={title}
          onChangeText={setTitle}
        />

        <Text className="text-base text-gray-600 mb-2">Content</Text>
        <TextInput
          className="bg-white p-4 rounded-lg border border-gray-300 text-lg text-black h-40"
          multiline={true}
          textAlignVertical="top"
          value={content}
          onChangeText={setContent}
        />
        
        <Text className="text-base text-gray-600 mb-2 mt-4">Target Audience</Text>
        <RNPickerSelect
          onValueChange={(value) => setTarget(value)}
          items={audienceItems}
          style={pickerSelectStyles}
          value={target}
          Icon={() => <Icon name="chevron-down" size={24} color="gray" />}
        />

        <TouchableOpacity
          className="bg-blue-600 p-4 rounded-lg items-center shadow mt-8"
          onPress={handleUpdate}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color="white" /> : <Text className="text-white text-lg font-bold">Save Changes</Text>}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const pickerSelectStyles = StyleSheet.create({
  inputAndroid: {
    fontSize: 16,
    paddingVertical: 0,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    color: 'black',
    paddingRight: 30,
    backgroundColor: 'white',
    marginBottom: 16,
  },
  iconContainer: {
    top: 15,
    right: 15,
  },
  placeholder: {
    color: '#9CA3AF',
  },
});

export default EditNoticeScreen;