import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, SafeAreaView, ActivityIndicator, StyleSheet, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import axios from 'axios';
import auth from '@react-native-firebase/auth';
import Toast from 'react-native-toast-message';
import RNPickerSelect from 'react-native-picker-select';
import API_URL from '../../../config/apiConfig';
import { useAuth } from '../../../context/AuthContext';

const AddClassScreen = ({ navigation }) => {
  const { userProfile } = useAuth();
  const [className, setClassName] = useState('');
  const [year, setYear] = useState('');
  const [section, setSection] = useState('');
  const [department, setDepartment] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (userProfile?.adminDomain !== 'ALL_DEPARTMENTS') {
      setDepartment(userProfile.adminDomain);
    }
  }, [userProfile]);

  const handleAddClass = async () => {
    if (!className || !year || !section || !department) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Please fill all fields.' });
      return;
    }
    setLoading(true);
    try {
      const idToken = await auth().currentUser.getIdToken();
      const newClass = {
        className: className.trim(),
        year: year.trim(),
        section: section.trim().toUpperCase(),
        department,
      };

      await axios.post(`${API_URL}/classes`, newClass, {
        headers: { Authorization: `Bearer ${idToken}` }
      });
      Toast.show({ type: 'success', text1: 'Success', text2: 'Class added successfully.' });
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
        <Text className="text-3xl font-bold text-gray-800 ml-4">Add New Class</Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 24 }}>
        <Text className="text-base text-gray-600 mb-2">Class Name</Text>
        <TextInput
          className="bg-white p-4 mb-4 rounded-lg border border-gray-300 text-lg text-black"
          placeholder="e.g., D4 CSE B"
          value={className}
          onChangeText={setClassName}
        />

        <Text className="text-base text-gray-600 mb-2">Year</Text>
        <TextInput
          className="bg-white p-4 mb-4 rounded-lg border border-gray-300 text-lg text-black"
          placeholder="e.g., 4"
          keyboardType="number-pad"
          value={year}
          onChangeText={setYear}
        />
        
        <Text className="text-base text-gray-600 mb-2">Section</Text>
        <TextInput
          className="bg-white p-4 mb-4 rounded-lg border border-gray-300 text-lg text-black"
          placeholder="e.g., A, B, C"
          autoCapitalize="characters"
          value={section}
          onChangeText={setSection}
        />

        <Text className="text-base text-gray-600 mb-2">Department</Text>
        {userProfile?.adminDomain === 'ALL_DEPARTMENTS' ? (
          <RNPickerSelect
            onValueChange={(value) => setDepartment(value)}
            items={departmentItems}
            style={pickerSelectStyles}
            placeholder={{ label: "Select a department...", value: null }}
            Icon={() => <Icon name="chevron-down" size={24} color="gray" />}
          />
        ) : (
          <TextInput
            className="bg-gray-200 p-4 mb-4 rounded-lg border border-gray-300 text-lg text-gray-500"
            value={department}
            editable={false}
          />
        )}
        
        <TouchableOpacity
          className="bg-blue-600 p-4 rounded-lg items-center shadow mt-6"
          onPress={handleAddClass}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color="white" /> : <Text className="text-white text-lg font-bold">Add Class</Text>}
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

export default AddClassScreen;