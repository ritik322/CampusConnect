import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, TextInput, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import axios from 'axios';
import auth from '@react-native-firebase/auth';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Toast from 'react-native-toast-message';
import RNPickerSelect from 'react-native-picker-select';
import API_URL from '../../../config/apiConfig';

const AssignHostelDetailScreen = ({ route, navigation }) => {
  const { student } = route.params;
  
  const [hostels, setHostels] = useState([]);
  const [selectedHostelId, setSelectedHostelId] = useState(student.hostelInfo?.hostelId || null);
  const [roomNumber, setRoomNumber] = useState(student.hostelInfo?.roomNumber || '');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    const fetchHostels = async () => {
      try {
        const idToken = await auth().currentUser.getIdToken();
        const response = await axios.get(`${API_URL}/hostels`, {
          headers: { Authorization: `Bearer ${idToken}` },
        });
        const hostelItems = response.data.map(h => ({ label: h.hostelName, value: h.id }));
        setHostels(hostelItems);
      } catch (error) {
        console.error('Failed to fetch hostels:', error);
        Toast.show({ type: 'error', text2: 'Could not load hostels.' });
      } finally {
        setInitialLoading(false);
      }
    };
    fetchHostels();
  }, []);

  const handleUpdate = async () => {
    if (!selectedHostelId) {
      Toast.show({ type: 'error', text2: 'Please select a hostel.' });
      return;
    }
    setLoading(true);
    try {
      const idToken = await auth().currentUser.getIdToken();
      const selectedHostel = hostels.find(h => h.value === selectedHostelId);
      const updateData = {
        hostelInfo: {
            hostelId: selectedHostel.value,
            hostelName: selectedHostel.label,
            roomNumber: roomNumber.trim(),
        }
      };

      await axios.put(`${API_URL}/users/${student.id}`, updateData, {
        headers: { Authorization: `Bearer ${idToken}` },
      });
      
      Toast.show({ type: 'success', text2: 'Hostel information updated.' });
      navigation.goBack();
    } catch (error) {
      console.error('Failed to update hostel info:', error);
      Toast.show({ type: 'error', text2: 'Update failed.' });
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-gray-100">
        <ActivityIndicator size="large" color="#2563EB" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <View className="p-6">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={28} color="#1F2937" />
        </TouchableOpacity>
        <Text className="text-3xl font-bold text-gray-800 mt-2">Assign Hostel</Text>
        <Text className="text-lg text-gray-600">To: {student.displayName}</Text>
      </View>

      <View className="p-6">
        <Text className="text-base text-gray-600 mb-2">Select Hostel</Text>
        <RNPickerSelect
          onValueChange={(value) => setSelectedHostelId(value)}
          items={hostels}
          style={pickerSelectStyles}
          value={selectedHostelId}
          placeholder={{ label: "Select a hostel...", value: null }}
          Icon={() => <Icon name="chevron-down" size={24} color="gray" />}
        />

        <Text className="text-base text-gray-600 mb-2">Room Number</Text>
        <TextInput
          className="bg-white p-4 mb-4 rounded-lg border border-gray-300 text-lg text-black"
          placeholder="e.g., A-101"
          value={roomNumber}
          onChangeText={setRoomNumber}
        />

        <TouchableOpacity
          className="bg-blue-600 p-4 rounded-lg items-center shadow mt-6"
          onPress={handleUpdate}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color="white" /> : <Text className="text-white text-lg font-bold">Save Changes</Text>}
        </TouchableOpacity>
      </View>
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
  iconContainer: { top: 18, right: 15 },
  placeholder: { color: '#9CA3AF' },
});

export default AssignHostelDetailScreen;

