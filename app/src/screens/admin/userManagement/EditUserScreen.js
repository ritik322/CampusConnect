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

const EditUserScreen = ({ route, navigation }) => {
  const { user } = route.params;
  const { userProfile } = useAuth();

  const [displayName, setDisplayName] = useState(user.displayName);
  const [username, setUsername] = useState(user.username);
  const [role, setRole] = useState(user.role);
 const [department, setDepartment] = useState(user.academicInfo?.department || user.department);
  const [rollNumber, setRollNumber] = useState(user.academicInfo?.urn || '');

  const [batch, setBatch] = useState(user.academicInfo?.batch || '');
  const [isHosteller, setIsHosteller] = useState(user.isHosteller || false);

  const [adminPermissionLevel, setAdminPermissionLevel] = useState(
    user.permissionLevel || null,
  );

  const [loading, setLoading] = useState(false);

  const [roleOpen, setRoleOpen] = useState(false);
  const [roleItemsList, setRoleItemsList] = useState([
    { label: 'Student', value: 'student' },
    { label: 'Faculty', value: 'faculty' },
    { label: 'Admin', value: 'admin' },
  ]);

  const [deptOpen, setDeptOpen] = useState(false);
  const [deptItems, setDeptItems] = useState([
    { label: 'Computer Science (CSE)', value: 'CSE' },
    { label: 'Information Technology', value: 'IT' },
    { label: 'Mechanical', value: 'Mechanical' },
    { label: 'Civil', value: 'Civil' },
    { label: 'Electrical', value: 'Electrical' },
  ]);

  const [adminPermOpen, setAdminPermOpen] = useState(false);
  const [adminPermItems, setAdminPermItems] = useState([
    { label: 'Super Admin (All Access)', value: 'superadmin' },
    { label: 'HOD (Head of Department)', value: 'hod' },
    { label: 'Warden (Hostel Management)', value: 'warden' },
  ]);

  const handleUpdateUser = async () => {
    // Start with the basic data that is always updated
    const updatedData = {
      displayName: displayName.trim(),
      role,
    };

    if (role === 'student') {
      if (!rollNumber.trim() || !batch.trim() || !department) {
        Toast.show({ type: 'error', text2: 'Please fill all student fields.' });
        return;
      }
      updatedData.username = rollNumber.trim();
      updatedData.isHosteller = isHosteller;

     
      updatedData.academicInfo = {
        ...user.academicInfo,
        urn: rollNumber.trim(),
        batch: batch.trim(),
        department: department,
      };
    } else if (role === 'faculty' || role === 'admin') {
      if (!username.trim() || !department) {
        Toast.show({
          type: 'error',
          text1: 'Failed',
          text2: 'Username and Department are required.',
        });
        return;
      }
      updatedData.username = username.trim();
      updatedData.department = department;
    }

    if (role === 'admin') {
      if (!adminPermissionLevel) {
        Toast.show({
          type: 'error',
          text2: 'Please select an admin permission level.',
        });
        return;
      }
      updatedData.permissionLevel = adminPermissionLevel;

      switch (adminPermissionLevel) {
        case 'superadmin':
          updatedData.adminDomain = 'ALL_DEPARTMENTS';
          break;
        case 'hod':
          updatedData.adminDomain = department;
          break;
        case 'warden':
          updatedData.adminDomain = 'Hostel';
          updatedData.department = null; 
          break;
        default:
          break;
      }
    }

    setLoading(true);
    try {
      const idToken = await auth().currentUser.getIdToken();
      await axios.put(`${API_URL}/users/${user.id}`, updatedData, {
        headers: { Authorization: `Bearer ${idToken}` },
      });
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'User updated successfully.',
      });
      navigation.goBack();
    } catch (error) {
      Toast.show({
        type: 'error',
        text2: error.response?.data?.message || 'User update failed.',
      });
    } finally {
      setLoading(false);
    }
  };

  const renderDepartmentSelector = () => {
    if (userProfile?.permissionLevel === 'superadmin') {
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
        <Text className="text-3xl font-bold text-gray-800 ml-4">Edit User</Text>
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

        <Text className="text-base text-gray-600 mb-2">
          Email (Cannot be changed)
        </Text>
        <TextInput
          className="bg-gray-200 p-3 mb-4 rounded-lg border border-gray-300 text-lg text-gray-500"
          value={user.email}
          editable={false}
        />

        <Text className="text-base text-gray-600 mb-2">Role</Text>
        <DropDownPicker
          open={roleOpen}
          value={role}
          items={
            userProfile?.permissionLevel === 'superadmin'
              ? roleItemsList
              : roleItemsList.filter(r => r.value !== 'admin')
          }
          setOpen={setRoleOpen}
          setValue={setRole}
          setItems={setRoleItemsList}
          zIndex={3000}
          listMode="SCROLLVIEW"
          style={styles.pickerStyle}
          dropDownContainerStyle={styles.dropdownContainerStyle}
        />

        {role === 'student' && (
          <>
            {renderDepartmentSelector()}
            <Text className="text-base text-gray-600 mb-2">
              Roll Number (as Username)
            </Text>
            <TextInput
              className="bg-white p-3 mb-4 rounded-lg border border-gray-300 text-lg text-black"
              value={rollNumber.toString()}
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
          onPress={handleUpdateUser}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white text-lg font-bold">Save Changes</Text>
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

export default EditUserScreen;
