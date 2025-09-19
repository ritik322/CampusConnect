import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, SafeAreaView, ActivityIndicator, StyleSheet, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import axios from 'axios';
import auth from '@react-native-firebase/auth';
import Toast from 'react-native-toast-message';
import RNPickerSelect from 'react-native-picker-select';
import API_URL from '../../../config/apiConfig';
import { useAuth } from '../../../context/AuthContext';

const AddSubjectScreen = ({ navigation }) => {
  const { userProfile } = useAuth();
  const [subjectName, setSubjectName] = useState('');
  const [subjectCode, setSubjectCode] = useState('');
  const [department, setDepartment] = useState(null);
  const [year, setYear] = useState('');
  const [lecturesPerWeek, setLecturesPerWeek] = useState(''); // New state
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (userProfile?.adminDomain !== 'ALL_DEPARTMENTS') {
      setDepartment(userProfile.adminDomain);
    }
  }, [userProfile]);

  const handleAddSubject = async () => {
    if (!subjectName || !subjectCode || !department || !year || !lecturesPerWeek) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Please fill all fields.' });
      return;
    }
    setLoading(true);
    try {
      const idToken = await auth().currentUser.getIdToken();
      const newSubject = { 
        subjectName: subjectName.trim(), 
        subjectCode: subjectCode.trim().toUpperCase(),
        department,
        year: parseInt(year, 10),
        lecturesPerWeek: parseInt(lecturesPerWeek, 10),
      };

      await axios.post(`${API_URL}/subjects`, newSubject, {
        headers: { Authorization: `Bearer ${idToken}` }
      });
      Toast.show({ type: 'success', text1: 'Success', text2: 'Subject added successfully.' });
      navigation.goBack();
    } catch (error) {
      const errorMessage = error.response ? error.response.data.message : 'An error occurred.';
      Toast.show({ type: 'error', text1: 'Creation Failed', text2: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const departmentItems = [
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
        <Text className="text-3xl font-bold text-gray-800 ml-4">Add New Subject</Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 24 }}>
        <Text className="text-base text-gray-600 mb-2">Subject Name</Text>
        <TextInput
          className="bg-white p-4 mb-4 rounded-lg border border-gray-300 text-lg text-black"
          value={subjectName}
          onChangeText={setSubjectName}
        />

        <Text className="text-base text-gray-600 mb-2">Subject Code</Text>
        <TextInput
          className="bg-white p-4 mb-4 rounded-lg border border-gray-300 text-lg text-black"
          autoCapitalize="characters"
          value={subjectCode}
          onChangeText={setSubjectCode}
        />

        <Text className="text-base text-gray-600 mb-2">Year</Text>
        <TextInput
          className="bg-white p-4 mb-4 rounded-lg border border-gray-300 text-lg text-black"
          keyboardType="number-pad"
          value={year}
          onChangeText={setYear}
        />

        {/* --- NEW FIELD --- */}
        <Text className="text-base text-gray-600 mb-2">Lectures per Week</Text>
        <TextInput
          className="bg-white p-4 mb-4 rounded-lg border border-gray-300 text-lg text-black"
          keyboardType="number-pad"
          value={lecturesPerWeek}
          onChangeText={setLecturesPerWeek}
          placeholder="e.g., 4"
          placeholderTextColor="#9CA3AF"
        />

        <Text className="text-base text-gray-600 mb-2">Department</Text>
        <RNPickerSelect
          onValueChange={(value) => setDepartment(value)}
          items={departmentItems}
          style={pickerSelectStyles}
          value={department}
          placeholder={{ label: "Select a department...", value: null }}
          disabled={userProfile?.adminDomain !== 'ALL_DEPARTMENTS'}
          Icon={() => <Icon name="chevron-down" size={24} color="gray" />}
        />
        
        <TouchableOpacity
          className="bg-blue-600 p-4 rounded-lg items-center shadow mt-6"
          onPress={handleAddSubject}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color="white" /> : <Text className="text-white text-lg font-bold">Add Subject</Text>}
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
    top: 18,
    right: 15,
  },
  placeholder: {
    color: '#9CA3AF',
  },
});

export default AddSubjectScreen;
