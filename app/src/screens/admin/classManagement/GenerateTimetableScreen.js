import React, { useState } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import axios from 'axios';
import auth from '@react-native-firebase/auth';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import API_URL from '../../../config/apiConfig';
import Toast from 'react-native-toast-message';
import RNPickerSelect from 'react-native-picker-select';
import { useAuth } from '../../../context/AuthContext';

const departmentItems = [
    { label: 'Computer Science (CSE)', value: 'cse' },
    { label: 'Information Technology', value: 'it' },
    { label: 'Mechanical', value: 'me' },
    { label: 'Civil', value: 'ce' },
    { label: 'Electrical', value: 'ee' },
];

const GenerateTimetableScreen = ({ navigation }) => {
  const { userProfile } = useAuth();
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [generating, setGenerating] = useState(false);

  const handleGenerate = async () => {
    const departmentToGenerate = userProfile.permissionLevel === 'hod' ? userProfile.adminDomain : selectedDepartment;

    if (!departmentToGenerate) {
      Toast.show({ type: 'error', text2: 'Please select a department.' });
      return;
    }
    setGenerating(true);
    try {
      const idToken = await auth().currentUser.getIdToken();
      const response = await axios.post(`${API_URL}/timetable/generate`, 
        { department: departmentToGenerate }, 
        { headers: { Authorization: `Bearer ${idToken}` } }
      );
      Toast.show({ type: 'success', text1: 'Success', text2: response.data.message });
      navigation.goBack();
    } catch (error) {
      const errorMessage = error.response ? error.response.data.message : 'An error occurred.';
      Toast.show({ type: 'error', text1: 'Generation Failed', text2: errorMessage });
    } finally {
      setGenerating(false);
    }
  };

  const renderContent = () => {
    if (userProfile.permissionLevel === 'superadmin') {
      return (
        <>
          <Text className="text-base text-gray-600 mb-2">Select Department</Text>
          <RNPickerSelect
            onValueChange={(value) => setSelectedDepartment(value)}
            items={departmentItems}
            style={pickerSelectStyles}
            placeholder={{ label: "Select a department to generate for...", value: null }}
            Icon={() => <Icon name="chevron-down" size={24} color="gray" />}
          />
        </>
      );
    }

    if (userProfile.permissionLevel === 'hod') {
      const dept = departmentItems.find(d => d.value === userProfile.adminDomain);
      return (
        <View className="items-center">
            <Text className="text-lg text-gray-700">You are about to generate a new timetable for the:</Text>
            <Text className="text-2xl font-bold text-blue-600 my-2">{dept ? dept.label : userProfile.adminDomain}</Text>
            <Text className="text-center text-sm text-gray-500">This will replace any existing timetable for all classes in this department.</Text>
        </View>
      );
    }
    return <Text>You do not have permission to generate timetables.</Text>;
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <View className="p-6 flex-row items-center">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={28} color="#1F2937" />
        </TouchableOpacity>
        <Text className="text-3xl font-bold text-gray-800 ml-4">Generate Timetable</Text>
      </View>

      <View className="p-6">
        {renderContent()}
        
        <TouchableOpacity
          className="bg-green-600 p-4 rounded-lg items-center shadow mt-8"
          onPress={handleGenerate}
          disabled={generating}
        >
          {generating ? <ActivityIndicator color="white" /> : <Text className="text-white text-lg font-bold">Generate Timetable</Text>}
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
  iconContainer: {
    top: 18,
    right: 15,
  },
  placeholder: {
    color: '#9CA3AF',
  },
});

export default GenerateTimetableScreen;
