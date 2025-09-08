import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, SafeAreaView, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import axios from 'axios';
import auth from '@react-native-firebase/auth';
import Toast from 'react-native-toast-message';
import API_URL from '../../../config/apiConfig';

const AddHostelScreen = ({ navigation }) => {
  const [hostelName, setHostelName] = useState('');
  const [wardenName, setWardenName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAddHostel = async () => {
    if (!hostelName.trim() || !wardenName.trim()) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Please fill all fields.' });
      return;
    }
    setLoading(true);
    try {
      const idToken = await auth().currentUser.getIdToken();
      const newHostel = {
        hostelName: hostelName.trim(),
        wardenName: wardenName.trim(),
      };

      await axios.post(`${API_URL}/hostels`, newHostel, {
        headers: { Authorization: `Bearer ${idToken}` }
      });
      Toast.show({ type: 'success', text1: 'Success', text2: 'Hostel added successfully.' });
      navigation.goBack();
    } catch (error) {
      const errorMessage = error.response ? error.response.data.message : 'An error occurred.';
      Toast.show({ type: 'error', text1: 'Creation Failed', text2: errorMessage });
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
        <Text className="text-3xl font-bold text-gray-800 ml-4">Add New Hostel</Text>
      </View>

      <View className="p-6">
        <Text className="text-base text-gray-600 mb-2">Hostel Name</Text>
        <TextInput
          className="bg-white p-4 mb-4 rounded-lg border border-gray-300 text-lg text-black"
          placeholder="e.g., Boys Hostel A"
          placeholderTextColor="#9CA3AF"
          value={hostelName}
          onChangeText={setHostelName}
        />

        <Text className="text-base text-gray-600 mb-2">Warden's Name</Text>
        <TextInput
          className="bg-white p-4 mb-4 rounded-lg border border-gray-300 text-lg text-black"
          placeholder="e.g., Mr. John Doe"
          placeholderTextColor="#9CA3AF"
          value={wardenName}
          onChangeText={setWardenName}
        />
        
        <TouchableOpacity
          className="bg-blue-600 p-4 rounded-lg items-center shadow mt-6"
          onPress={handleAddHostel}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color="white" /> : <Text className="text-white text-lg font-bold">Add Hostel</Text>}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default AddHostelScreen;