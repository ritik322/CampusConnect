import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, SafeAreaView, ActivityIndicator, StyleSheet, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import axios from 'axios';
import auth from '@react-native-firebase/auth';
import Toast from 'react-native-toast-message';
import RNPickerSelect from 'react-native-picker-select';

const API_URL = 'http://192.168.59.189:3000/api';

const AddUserScreen = ({ navigation }) => {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [department, setDepartment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState(''); // For non-student roles
  const [rollNumber, setRollNumber] = useState(''); // For student role
  const [year, setYear] = useState(''); // For student role

  const handleAddUser = async () => {
    const userToCreate = {
      displayName: displayName.trim(),
      email: email.trim(),
      password: password.trim(),
      role,
      department,
    };

    if (role === 'student') {
      userToCreate.username = rollNumber.trim();
      userToCreate.academicInfo = {
        rollNumber: rollNumber.trim(),
        year: parseInt(year, 10),
      };
      if (!userToCreate.academicInfo.rollNumber || !userToCreate.academicInfo.year) {
        Toast.show({ type: 'error', text1: 'Error', text2: 'Please fill all student fields.' });
        return;
      }
    } else {
      userToCreate.username = username.trim();
      if (!userToCreate.username) {
        Toast.show({ type: 'error', text1: 'Error', text2: 'Please enter a username.' });
        return;
      }
    }

    if (!userToCreate.displayName || !userToCreate.email || !userToCreate.password || !userToCreate.role || !userToCreate.department) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Please fill all fields.' });
      return;
    }

    setLoading(true);
    try {
      const idToken = await auth().currentUser.getIdToken();
      await axios.post(`${API_URL}/users`, userToCreate, {
        headers: { Authorization: `Bearer ${idToken}` }
      });

      Toast.show({ type: 'success', text1: 'Success', text2: 'User created successfully.' });
      navigation.goBack();
    } catch (error) {
      const errorMessage = error.response ? error.response.data.message : error.message;
      Toast.show({ type: 'error', text1: 'Creation Failed', text2: errorMessage });
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
        <Text className="text-3xl font-bold text-gray-800 ml-4">Add New User</Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 24 }}>
        <Text className="text-base text-gray-600 mb-2">Full Name</Text>
        <TextInput
          className="bg-white p-3 mb-4 rounded-lg border border-gray-300 text-lg text-black"
          placeholder="John Doe"
          placeholderTextColor="#9CA3AF"
          value={displayName}
          onChangeText={setDisplayName}
        />

        <Text className="text-base text-gray-600 mb-2">Email</Text>
        <TextInput
          className="bg-white p-3 mb-4 rounded-lg border border-gray-300 text-lg text-black"
          placeholder="john.doe@gndec.ac.in"
          placeholderTextColor="#9CA3AF"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />

        <Text className="text-base text-gray-600 mb-2">Password</Text>
        <TextInput
          className="bg-white p-3 mb-4 rounded-lg border border-gray-300 text-lg text-black"
          placeholder="********"
          placeholderTextColor="#9CA3AF"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
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
          <>
            <Text className="text-base text-gray-600 mb-2">Roll Number (as Username)</Text>
            <TextInput
              className="bg-white p-3 mb-4 rounded-lg border border-gray-300 text-lg text-black"
              placeholder="e.g., 2203503"
              placeholderTextColor="#9CA3AF"
              value={rollNumber}
              onChangeText={setRollNumber}
              keyboardType="number-pad"
            />

            <Text className="text-base text-gray-600 mb-2">Year</Text>
            <TextInput
              className="bg-white p-3 mb-4 rounded-lg border border-gray-300 text-lg text-black"
              placeholder="e.g., 1, 2, 3, or 4"
              placeholderTextColor="#9CA3AF"
              value={year}
              onChangeText={setYear}
              keyboardType="number-pad"
            />
          </>
        ) : (
          <>
            <Text className="text-base text-gray-600 mb-2">Username</Text>
            <TextInput
              className="bg-white p-3 mb-4 rounded-lg border border-gray-300 text-lg text-black"
              placeholder="e.g., faculty_username"
              placeholderTextColor="#9CA3AF"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
            />
          </>
        )}

        <Text className="text-base text-gray-600 mb-2">Department</Text>
        <RNPickerSelect
          onValueChange={(value) => setDepartment(value)}
          items={departmentItems}
          style={pickerSelectStyles}
          placeholder={{ label: "Select a department...", value: null }}
          Icon={() => <Icon name="chevron-down" size={24} color="gray" />}
        />
        
        <TouchableOpacity
          className="bg-blue-600 p-3 rounded-lg items-center shadow mt-6"
          onPress={handleAddUser}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color="white" /> : <Text className="text-white text-lg font-bold">Create User</Text>}
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
    borderRadius: 12,
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

export default AddUserScreen;