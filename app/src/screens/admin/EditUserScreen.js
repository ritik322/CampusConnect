import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, SafeAreaView, ActivityIndicator, StyleSheet, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import axios from 'axios';
import auth from '@react-native-firebase/auth';
import Toast from 'react-native-toast-message';
import RNPickerSelect from 'react-native-picker-select';

const API_URL = 'http://192.168.59.189:3000/api';

const EditUserScreen = ({ route, navigation }) => {
  const { user } = route.params;

  const [displayName, setDisplayName] = useState(user.displayName);
  const [role, setRole] = useState(user.role);
  const [department, setDepartment] = useState(user.department);
  const [username, setUsername] = useState(user.username);
  const [rollNumber, setRollNumber] = useState(user.academicInfo?.rollNumber || '');
  const [year, setYear] = useState(user.academicInfo?.year?.toString() || '');
  const [loading, setLoading] = useState(false);

  const handleUpdateUser = async () => {
    setLoading(true);
    try {
      const idToken = await auth().currentUser.getIdToken();
      const updatedData = {
        displayName: displayName.trim(),
        role,
        department,
        username: role === 'student' ? rollNumber.trim() : username.trim(),
      };

      if (role === 'student') {
        updatedData.academicInfo = {
          rollNumber: rollNumber.trim(),
          year: parseInt(year, 10),
        };
      }

      await axios.put(`${API_URL}/users/${user.id}`, updatedData, {
        headers: { Authorization: `Bearer ${idToken}` }
      });

      Toast.show({ type: 'success', text1: 'Success', text2: 'User updated successfully.' });
      navigation.goBack();
    } catch (error) {
      const errorMessage = error.response ? error.response.data.message : error.message;
      Toast.show({ type: 'error', text1: 'Update Failed', text2: errorMessage });
    } finally {
      setLoading(false);
    }
  };
  
  const roleItems = [
    { label: 'Student', value: 'student' },
    { label: 'Faculty', value: 'faculty' },
    { label: 'Admin', value: 'admin' },
  ];

  const departmentItems = [
    { label: 'Computer Science', value: 'CSE' },
    { label: 'Information Technology', value: 'IT' },
    { label: 'Mechanical', value: 'Mechanical' },
    { label: 'Civil', value: 'Civil' },
    { label: 'Electrical', value: 'Electrical' },
    { label: 'Administration', value: 'ADMINISTRATION' },
  ];

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <View className="p-6 flex-row items-center">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={28} color="#1F2937" />
        </TouchableOpacity>
        <Text className="text-3xl font-bold text-gray-800 ml-4">Edit User</Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 24 }}>
        <Text className="text-base text-gray-600 mb-2">Full Name</Text>
        <TextInput
          className="bg-white p-3 mb-4 rounded-lg border border-gray-300 text-lg text-black"
          value={displayName}
          onChangeText={setDisplayName}
        />

        <Text className="text-base text-gray-600 mb-2">Email (Cannot be changed)</Text>
        <TextInput
          className="bg-gray-200 p-3 mb-4 rounded-lg border border-gray-300 text-lg text-gray-500"
          value={user.email}
          editable={false}
        />
        
        <Text className="text-base text-gray-600 mb-2">Role</Text>
        <RNPickerSelect
          onValueChange={(value) => setRole(value)}
          items={roleItems}
          style={pickerSelectStyles}
          value={role}
          Icon={() => <Icon name="chevron-down" size={24} color="gray" />}
        />

        {role === 'student' ? (
          <View key="student-fields">
            <Text className="text-base text-gray-600 mb-2">Roll Number (as Username)</Text>
            <TextInput
              className="bg-white p-3 mb-4 rounded-lg border border-gray-300 text-lg text-black"
              value={rollNumber}
              onChangeText={setRollNumber}
              keyboardType="number-pad"
            />
            <Text className="text-base text-gray-600 mb-2">Year</Text>
            <TextInput
              className="bg-white p-3 mb-4 rounded-lg border border-gray-300 text-lg text-black"
              value={year}
              onChangeText={setYear}
              keyboardType="number-pad"
            />
          </View>
        ) : (
          <View key="other-fields">
            <Text className="text-base text-gray-600 mb-2">Username</Text>
            <TextInput
              className="bg-white p-3 mb-4 rounded-lg border border-gray-300 text-lg text-black"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
            />
          </View>
        )}

        <Text className="text-base text-gray-600 mb-2">Department</Text>
        <RNPickerSelect
          onValueChange={(value) => setDepartment(value)}
          items={departmentItems}
          style={pickerSelectStyles}
          value={department}
          placeholder={{ label: "Select a department...", value: null }}
          Icon={() => <Icon name="chevron-down" size={24} color="gray" />}
        />
        
        <TouchableOpacity
          className="bg-blue-600 p-3 rounded-lg items-center shadow mt-6"
          onPress={handleUpdateUser}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color="white" /> : <Text className="text-white text-lg font-bold">Save Changes</Text>}
        </TouchableOpacity>
        <View className="h-20" />
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

export default EditUserScreen;