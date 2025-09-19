import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, SafeAreaView, ActivityIndicator, StyleSheet, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import axios from 'axios';
import auth from '@react-native-firebase/auth';
import Toast from 'react-native-toast-message';
import DocumentPicker from '@react-native-documents/picker'
import { CLOUDINARY_CLOUD_NAME, CLOUDINARY_UPLOAD_PRESET } from '@env';
import API_URL from '../../../config/apiConfig';
import RNPickerSelect from 'react-native-picker-select';
import { useAuth } from '../../../context/AuthContext';

const PublishNoticeScreen = ({ navigation }) => {
  const { userProfile } = useAuth();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [file, setFile] = useState(null);
  const [target, setTarget] = useState(null);
  const [audienceItems, setAudienceItems] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const generateAudienceOptions = async () => {
      let options = [];
      if (userProfile.permissionLevel === 'superadmin') {
        options.push({ label: 'Entire College', value: JSON.stringify({ type: 'GLOBAL', value: 'ALL' }) });
        const departments = [
            { label: 'Computer Science (CSE)', value: 'cse' }, { label: 'Information Technology', value: 'it' },
            { label: 'Mechanical', value: 'me' }, { label: 'Civil', value: 'ce' }, { label: 'Electrical', value: 'ee' }
        ];
        departments.forEach(d => options.push({ label: d.label, value: JSON.stringify({ type: 'DEPARTMENT', value: d.value }) }));
        
        try {
            const idToken = await auth().currentUser.getIdToken();
            const response = await axios.get(`${API_URL}/hostels`, { headers: { Authorization: `Bearer ${idToken}` } });
            response.data.forEach(h => options.push({ label: h.hostelName, value: JSON.stringify({ type: 'HOSTEL', value: h.id }) }));
        } catch (e) { console.error("Failed to fetch hostels for notices", e)}

      } else if (userProfile.permissionLevel === 'hod') {
        const deptValue = userProfile.adminDomain;
        const deptLabel = `Department: ${deptValue.toUpperCase()}`;
        const targetValue = JSON.stringify({ type: 'DEPARTMENT', value: deptValue });
        options.push({ label: deptLabel, value: targetValue });
        setTarget(targetValue);
      } else if (userProfile.permissionLevel === 'warden') {
        try {
            const idToken = await auth().currentUser.getIdToken();
            const response = await axios.get(`${API_URL}/hostels`, { headers: { Authorization: `Bearer ${idToken}` } });
            response.data.forEach(h => options.push({ label: h.hostelName, value: JSON.stringify({ type: 'HOSTEL', value: h.id }) }));
        } catch (e) { console.error("Failed to fetch hostels for notices", e)}
      }
      setAudienceItems(options);
    };
    generateAudienceOptions();
  }, [userProfile]);

  // --- THIS IS THE FIX ---
  // We have removed all manual permission checks.
  // We now let the library handle the entire process.
  const handleFilePick = async () => {
    try {
      const res = await DocumentPicker.pickSingle({
        type: [DocumentPicker.types.allFiles],
      });
      setFile(res);
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
        // This is not an error, the user just closed the picker.
        console.log('User cancelled the file picker.');
      } else {
        // An actual error occurred.
        Toast.show({ type: 'error', text2: 'An error occurred while picking the file.' });
        console.error('File Picker Error: ', err);
      }
    }
  };

  const handlePublish = async () => {
    if (!title.trim() || !content.trim() || !target) {
      Toast.show({ type: 'error', text2: 'Please fill all fields.' });
      return;
    }
    setLoading(true);
    try {
      let attachmentUrl = null;
      if (file) {
        const formData = new FormData();
        formData.append('file', {
            uri: file.uri,
            type: file.type,
            name: file.name,
        });
        formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
        const cloudinaryResponse = await axios.post(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/auto/upload`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        attachmentUrl = cloudinaryResponse.data.secure_url;
      }

      const idToken = await auth().currentUser.getIdToken();
      const newNotice = {
        title: title.trim(),
        content: content.trim(),
        attachmentUrl: attachmentUrl,
        targetAudience: JSON.parse(target)
      };

      await axios.post(`${API_URL}/notices`, newNotice, {
        headers: { Authorization: `Bearer ${idToken}` }
      });

      Toast.show({ type: 'success', text2: 'Notice published successfully.' });
      navigation.goBack();
    } catch (error) {
      console.error("Publish Error:", error.response ? error.response.data : error);
      Toast.show({ type: 'error', text1: 'Publish Failed', text2: 'An error occurred.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <View className="p-6 flex-row items-center">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={28} color="#1F2937" />
        </TouchableOpacity>
        <Text className="text-3xl font-bold text-gray-800 ml-4">Publish Notice</Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}>
        <Text className="text-base text-gray-600 mb-2">Title</Text>
        <TextInput className="bg-white p-4 mb-4 rounded-lg border border-gray-300 text-lg text-black" value={title} onChangeText={setTitle} />

        <Text className="text-base text-gray-600 mb-2">Content</Text>
        <TextInput className="bg-white p-4 rounded-lg border border-gray-300 text-lg text-black h-40" multiline textAlignVertical="top" value={content} onChangeText={setContent}/>
        
        <Text className="text-base text-gray-600 mb-2 mt-4">Target Audience</Text>
        <RNPickerSelect
          onValueChange={(value) => setTarget(value)}
          items={audienceItems}
          style={pickerSelectStyles}
          value={target}
          disabled={userProfile.permissionLevel === 'hod'}
          placeholder={{ label: "Select an audience...", value: null }}
          Icon={() => <Icon name="chevron-down" size={24} color="gray" />}
        />

        <TouchableOpacity onPress={handleFilePick} className="flex-row items-center bg-white p-4 mt-4 rounded-lg border border-gray-300">
          <Icon name="paperclip" size={20} color="#4A5568" />
          <Text className="text-lg text-gray-700 ml-3" numberOfLines={1}>{file ? file.name : 'Attach a file (Optional)'}</Text>
        </TouchableOpacity>

        <TouchableOpacity className="bg-blue-600 p-4 rounded-lg items-center shadow mt-8" onPress={handlePublish} disabled={loading}>
          {loading ? <ActivityIndicator color="white" /> : <Text className="text-white text-lg font-bold">Publish Notice</Text>}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const pickerSelectStyles = StyleSheet.create({
  inputAndroid: {
    fontSize: 16, paddingVertical: 0, paddingHorizontal: 10, borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 8, color: 'black', paddingRight: 30, backgroundColor: 'white', marginBottom: 16,
  },
  iconContainer: { top: 18, right: 15, },
  placeholder: { color: '#9CA3AF', },
});

export default PublishNoticeScreen;