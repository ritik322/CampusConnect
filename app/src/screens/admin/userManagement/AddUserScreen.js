import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
  Switch,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import axios from 'axios';
import auth from '@react-native-firebase/auth';
import Toast from 'react-native-toast-message';
import RNPickerSelect from 'react-native-picker-select';
import API_URL from '../../../config/apiConfig';
import { useAuth } from '../../../context/AuthContext';

const AddUserScreen = ({ navigation }) => {
  const { userProfile } = useAuth();

  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [role, setRole] = useState('student');

  const [rollNumber, setRollNumber] = useState('');
  const [classId, setClassId] = useState(null);
  const [department, setDepartment] = useState(null);
  const [isHosteller, setIsHosteller] = useState(false);

  const [adminPermissionLevel, setAdminPermissionLevel] = useState(null);

  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (
      userProfile?.adminDomain &&
      userProfile.adminDomain !== 'ALL_DEPARTMENTS'
    ) {
      setDepartment(userProfile.adminDomain);
    }

    const fetchClasses = async () => {
      try {
        const idToken = await auth().currentUser.getIdToken();
        const response = await axios.get(`${API_URL}/classes`, {
          headers: { Authorization: `Bearer ${idToken}` },
        });
        const classItems = response.data.map(c => ({
          label: c.className,
          value: c.id,
          ...c,
        }));
        setClasses(classItems);
      } catch (e) {
        console.error('Error fetching classes for dropdown:', e);
        Toast.show({ type: 'error', text2: 'Could not load classes.' });
      }
    };

    fetchClasses();
  }, [userProfile]);

  const handleAddUser = async () => {
    const userToCreate = {
      displayName: displayName.trim(),
      email: email.trim(),
      password: password.trim(),
      role,
      department,
    };

    if (role === 'student') {
      const selectedClass = classes.find(c => c.value === classId);
      if (!selectedClass || !rollNumber.trim()) {
        Toast.show({ type: 'error', text2: 'Please fill all student fields.' });
        return;
      }
      userToCreate.username = rollNumber.trim();
      userToCreate.academicInfo = {
        rollNumber: rollNumber.trim(),
        year: selectedClass.year,
        section: selectedClass.section,
      };
      userToCreate.classId = classId;
      userToCreate.isHosteller = isHosteller;
    } else {
      if (!username.trim()) {
        Toast.show({ type: 'error',text1: "Failed" ,text2: 'Username is required.' });
        return;
      }
      userToCreate.username = username.trim();
    }

    if (role === 'admin') {
      if (!adminPermissionLevel) {
        Toast.show({
          type: 'error',
          text2: 'Please select an admin permission level.',
        });
        return;
      }
      userToCreate.permissionLevel = adminPermissionLevel;

      switch (adminPermissionLevel) {
        case 'superadmin':
          userToCreate.adminDomain = 'ALL_DEPARTMENTS';
          break;
        case 'hod':
          if (!department) {
            Toast.show({
              type: 'error',
              text1: 'Failed',
              text2: 'Please select a department for the HOD.',
            });
            return;
          }
          userToCreate.adminDomain = department;
          break;
        case 'warden':
          userToCreate.adminDomain = 'Hostel';
          userToCreate.department = null;
          break;
        default:
          break;
      }
    }

    setLoading(true);
    try {
      const idToken = await auth().currentUser.getIdToken();
      await axios.post(`${API_URL}/users`, userToCreate, {
        headers: { Authorization: `Bearer ${idToken}` },
      });
      Toast.show({ type: 'success', text1: "Success" ,text2: 'User created successfully.' });
      navigation.goBack();
    } catch (error) {
      Toast.show({
        type: 'error',
        text2: error.response?.data?.message || 'User creation failed.',
      });
    } finally {
      setLoading(false);
    }
  };

  const roleItems = [
    { label: 'Student', value: 'student' },
    { label: 'Faculty', value: 'faculty' },
    { label: 'Admin', value: 'admin' },
  ];

  const adminPermissionLevelItems = [
    { label: 'Super Admin (All Access)', value: 'superadmin' },
    { label: 'HOD (Head of Department)', value: 'hod' },
    { label: 'Warden (Hostel Management)', value: 'warden' },
  ];

  const departmentItems = [
    { label: 'Computer Science (CSE)', value: 'cse' },
    { label: 'Information Technology', value: 'it' },
    { label: 'Mechanical', value: 'me' },
    { label: 'Civil', value: 'ce' },
    { label: 'Electrical', value: 'ee' },
  ];

  const renderDepartmentSelector = () => {
    if (userProfile?.adminDomain === 'ALL_DEPARTMENTS') {
      return (
        <View>
          <Text className="text-base text-gray-600 mb-2">Department</Text>
          <RNPickerSelect
            onValueChange={value => setDepartment(value)}
            items={departmentItems}
            style={pickerSelectStyles}
            placeholder={{ label: 'Select a department...', value: null }}
            Icon={() => <Icon name="chevron-down" size={24} color="gray" />}
            value={department}
          />
        </View>
      );
    }
    return (
      <View>
        <Text className="text-base text-gray-600 mb-2">Department</Text>
        <TextInput
          className="bg-gray-200 p-4 mb-4 rounded-lg border border-gray-300 text-lg text-gray-500"
          value={department}
          editable={false}
        />
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <View className="p-6 flex-row items-center">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={28} color="#1F2937" />
        </TouchableOpacity>
        <Text className="text-3xl font-bold text-gray-800 ml-4">
          Add New User
        </Text>
      </View>
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 100 }}
      >
        <Text className="text-base text-gray-600 mb-2">Full Name</Text>
        <TextInput
          className="bg-white p-3 mb-4 rounded-lg border border-gray-300 text-lg text-black"
          value={displayName}
          onChangeText={setDisplayName}
        />

        <Text className="text-base text-gray-600 mb-2">Email</Text>
        <TextInput
          className="bg-white p-3 mb-4 rounded-lg border border-gray-300 text-lg text-black"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />

        <Text className="text-base text-gray-600 mb-2">Password</Text>
        <TextInput
          className="bg-white p-3 mb-4 rounded-lg border border-gray-300 text-lg text-black"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <Text className="text-base text-gray-600 mb-2">Role</Text>
        <RNPickerSelect
          onValueChange={value => setRole(value)}
          items={userProfile?.permissionLevel === 'superadmin' ? roleItems : roleItems.filter(r => r.label != 'Admin')}
          style={pickerSelectStyles}
          value={role}
          Icon={() => <Icon name="chevron-down" size={24} color="gray" />}
        />

        {role === 'student' && (
          <>
            {renderDepartmentSelector()}
            <Text className="text-base text-gray-600 mb-2">
              Roll Number (as Username)
            </Text>
            <TextInput
              className="bg-white p-3 mb-4 rounded-lg border border-gray-300 text-lg text-black"
              value={rollNumber}
              onChangeText={setRollNumber}
              keyboardType="number-pad"
            />

            <Text className="text-base text-gray-600 mb-2">
              Assign to Class
            </Text>
            <RNPickerSelect
              onValueChange={value => setClassId(value)}
              items={classes.filter(c => c.department === department)}
              style={pickerSelectStyles}
              placeholder={{ label: 'Select a class...', value: null }}
              Icon={() => <Icon name="chevron-down" size={24} color="gray" />}
              disabled={!department}
            />
            <View className="flex-row items-center justify-between bg-white p-3 mb-4 rounded-lg border border-gray-300">
              <Text className="text-lg text-black">Is Hosteller?</Text>
              <Switch value={isHosteller} onValueChange={setIsHosteller} />
            </View>
          </>
        )}

        {role === 'faculty' && (
          <>
            <Text className="text-base text-gray-600 mb-2">Username</Text>
            <TextInput
              className="bg-white p-3 mb-4 rounded-lg border border-gray-300 text-lg text-black"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
            />
            {renderDepartmentSelector()}
          </>
        )}

        {role === 'admin' && (
          <>
            <Text className="text-base text-gray-600 mb-2">Username</Text>
            <TextInput
              className="bg-white p-3 mb-4 rounded-lg border border-gray-300 text-lg text-black"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
            />

            <Text className="text-base text-gray-600 mb-2">
              Admin Permission Level
            </Text>
            <RNPickerSelect
              onValueChange={value => setAdminPermissionLevel(value)}
              items={adminPermissionLevelItems}
              style={pickerSelectStyles}
              placeholder={{ label: 'Select permission level...', value: null }}
              Icon={() => <Icon name="chevron-down" size={24} color="gray" />}
            />

            {adminPermissionLevel === 'hod' && renderDepartmentSelector()}

            {adminPermissionLevel === 'warden' && (
              <View>
                <Text className="text-base text-gray-600 mb-2">Domain</Text>
                <TextInput
                  className="bg-gray-200 p-4 mb-4 rounded-lg border border-gray-300 text-lg text-gray-500"
                  value="Hostel"
                  editable={false}
                />
              </View>
            )}
          </>
        )}

        <TouchableOpacity
          className="bg-blue-600 p-4 rounded-lg items-center shadow-lg mt-6"
          onPress={handleAddUser}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white text-lg font-bold">Create User</Text>
          )}
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
  iconContainer: { top: 18, right: 15 },
  placeholder: { color: '#9CA3AF' },
});

export default AddUserScreen;
