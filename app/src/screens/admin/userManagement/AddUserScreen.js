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
import DropDownPicker from 'react-native-dropdown-picker';
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
  const [batch, setBatch] = useState('');
  const [department, setDepartment] = useState(null);
  const [isHosteller, setIsHosteller] = useState(false);

  const [adminPermissionLevel, setAdminPermissionLevel] = useState(null);

  const [loading, setLoading] = useState(false);

  const [roleOpen, setRoleOpen] = useState(false);
  const [roleValue, setRoleValue] = useState('student');
  const [roleItems, setRoleItems] = useState([
    { label: 'Student', value: 'student' },
    { label: 'Faculty', value: 'faculty' },
    { label: 'Admin', value: 'admin' },
  ]);

  const [deptOpen, setDeptOpen] = useState(false);
  const [deptItems, setDeptItems] = useState([
    { label: 'Computer Science (CSE)', value: 'cse' },
    { label: 'Information Technology', value: 'it' },
    { label: 'Mechanical', value: 'me' },
    { label: 'Civil', value: 'ce' },
    { label: 'Electrical', value: 'ee' },
  ]);

  const [classOpen, setClassOpen] = useState(false);

  const [adminPermOpen, setAdminPermOpen] = useState(false);
  const [adminPermItems, setAdminPermItems] = useState([
    { label: 'Super Admin (All Access)', value: 'superadmin' },
    { label: 'HOD (Head of Department)', value: 'hod' },
    { label: 'Warden (Hostel Management)', value: 'warden' },
  ]);

  useEffect(() => {
    if (
      userProfile?.adminDomain &&
      userProfile.adminDomain !== 'ALL_DEPARTMENTS'
    ) {
      setDepartment(userProfile.adminDomain);
    }
  }, [userProfile]);

  const handleAddUser = async () => {
    const userToCreate = {
      displayName: displayName.trim(),
      email: email.trim(),
      password: password.trim(),
      role: roleValue,
    };

    if (roleValue === 'student') {
      if (!rollNumber.trim() || !batch.trim() || !department) {
        Toast.show({ type: 'error', text2: 'Please fill all student fields.' });
        return;
      }
      userToCreate.department = department;
      userToCreate.batch = batch.trim();
      userToCreate.username = rollNumber.trim();
      userToCreate.academicInfo = {
        rollNumber: rollNumber.trim(),
      };
      userToCreate.isHosteller = isHosteller;
    } else {
      userToCreate.department = department;
      if (!username.trim()) {
        Toast.show({
          type: 'error',
          text1: 'Failed',
          text2: 'Username is required.',
        });
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
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'User created successfully.',
      });
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

  const renderDepartmentSelector = () => {
    if (userProfile?.adminDomain === 'ALL_DEPARTMENTS') {
      return (
        <View>
          <Text className="text-base text-gray-600 mb-2">Department</Text>
          <DropDownPicker
            open={deptOpen}
            value={department}
            items={deptItems}
            setOpen={setDeptOpen}
            setValue={setDepartment}
            setItems={setDeptItems}
            placeholder="Select a department..."
            zIndex={2000}
            listMode="SCROLLVIEW"
            style={styles.pickerStyle}
            dropDownContainerStyle={styles.dropdownContainerStyle}
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
        <DropDownPicker
          open={roleOpen}
          value={roleValue}
          items={
            userProfile?.permissionLevel === 'superadmin'
              ? roleItems
              : roleItems.filter(r => r.value !== 'admin')
          }
          setOpen={setRoleOpen}
          setValue={setRoleValue}
          setItems={setRoleItems}
          zIndex={3000}
          listMode="SCROLLVIEW"
          style={styles.pickerStyle}
          dropDownContainerStyle={styles.dropdownContainerStyle}
        />

        {roleValue === 'student' && (
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

            <Text className="text-base text-gray-600 mb-2">Batch</Text>
            <TextInput
              className="bg-white p-3 mb-4 rounded-lg border border-gray-300 text-lg text-black"
              placeholder="e.g., 2022-2026"
              value={batch}
              onChangeText={setBatch}
            />

            <View className="flex-row items-center justify-between bg-white p-3 mb-4 rounded-lg border border-gray-300">
              <Text className="text-lg text-black">Is Hosteller?</Text>
              <Switch value={isHosteller} onValueChange={setIsHosteller} />
            </View>
          </>
        )}

        {roleValue === 'faculty' && (
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

        {roleValue === 'admin' && (
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
            <DropDownPicker
              open={adminPermOpen}
              value={adminPermissionLevel}
              items={adminPermItems}
              setOpen={setAdminPermOpen}
              setValue={setAdminPermissionLevel}
              setItems={setAdminPermItems}
              placeholder="Select permission level..."
              zIndex={2000}
              listMode="SCROLLVIEW"
              style={styles.pickerStyle}
              dropDownContainerStyle={styles.dropdownContainerStyle}
            />
            {adminPermissionLevel === 'hod' && renderDepartmentSelector()}
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

const styles = StyleSheet.create({
  pickerStyle: {
    borderColor: '#D1D5DB',
    marginBottom: 16,
  },
  dropdownContainerStyle: {
    borderColor: '#D1D5DB',
  },
});

export default AddUserScreen;
