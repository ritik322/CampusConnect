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

// --- NEW HELPER FUNCTION ---
/**
 * Calculates the current academic year based on a batch string (e.g., "2022-26")
 * Assumes the academic year starts in August (month 7).
 * @param {string} batchString - The batch string (e.g., "2022-26")
 * @returns {number | null} The calculated academic year (e.g., 4) or null
 */
const getAcademicYear = (batchString) => {
  if (!batchString || !batchString.includes('-')) {
    return null; // Not a valid batch string
  }

  const startYear = parseInt(batchString.split('-')[0], 10);
  if (isNaN(startYear)) {
    return null; // Invalid start year
  }

  const now = new Date(); // Current local date
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth(); // 0-11 (e.g., Nov = 10)

  // Assuming academic year starts in August (month index 7)
  const academicYearStartMonth = 7; 

  let academicYear = currentYear - startYear;

  if (currentMonth >= academicYearStartMonth) {
    // We are in the new academic year
    academicYear += 1;
  }
  
  // Example (Date: Nov 2025, Batch: "2022-26"):
  // startYear = 2022
  // currentYear = 2025
  // currentMonth = 10
  // academicYear = 2025 - 2022 = 3
  // 10 >= 7 is true, so academicYear becomes 3 + 1 = 4.

  return academicYear;
};
// --- END HELPER FUNCTION ---


const EditUserScreen = ({ route, navigation }) => {
  const { user } = route.params;
  const { userProfile } = useAuth();

  const [displayName, setDisplayName] = useState(user.displayName);
  const [username, setUsername] = useState(user.username);
  const [role, setRole] = useState(user.role);
  const [department, setDepartment] = useState(user.academicInfo?.department || user.department);
  const [rollNumber, setRollNumber] = useState(user.academicInfo?.urn || '');

  // STUDENT'S BATCH (e.g., "2022-26")
  const [batch, setBatch] = useState(user.academicInfo?.batch || '');
  
  // --- STUDENT'S CURRENT YEAR (e.g., 4) - Now auto-calculated ---
  const [derivedYear, setDerivedYear] = useState(
    getAcademicYear(user.academicInfo?.batch)
  );
  // --- End Auto-Calculated Year ---

  const [isHosteller, setIsHosteller] = useState(user.isHosteller || false);

  // --- Class State (was Section State) ---
  const [classId, setClassId] = useState(user.academicInfo?.classId || null);
  const [classOpen, setClassOpen] = useState(false);
  const [classItems, setClassItems] = useState([]); // Filtered items for dropdown
  const [allClasses, setAllClasses] = useState([]); // Master list of all classes
  const [classLoading, setClassLoading] = useState(false); // For fetching master list
  // --- End Class State ---

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

  // --- Effect 1: Fetch ALL classes once on component mount ---
  useEffect(() => {
    const fetchAllClasses = async () => {
      setClassLoading(true);
      try {
        const idToken = await auth().currentUser.getIdToken();
        const response = await axios.get(`${API_URL}/classes`, {
          headers: { Authorization: `Bearer ${idToken}` },
        });
        setAllClasses(response.data); // Store the master list
      } catch (error) {
        console.error('Failed to fetch all classes:', error);
        Toast.show({ type: 'error', text2: 'Failed to load classes.' });
      } finally {
        setClassLoading(false);
      }
    };

    fetchAllClasses();
  }, []); // Runs only once

  // --- Effect 2: Update derivedYear when batch string changes ---
  useEffect(() => {
    const year = getAcademicYear(batch);
    setDerivedYear(year);
  }, [batch]);

  // --- Effect 3: Filter classes whenever role, derivedYear, dept, or master list changes ---
  useEffect(() => {
    // Now, filter by the new 'derivedYear' state
    const yearAsNumber = derivedYear;

    if (role === 'student' && yearAsNumber && department && allClasses.length > 0) {
      // Filter the master list
      const filtered = allClasses.filter(
        s => s.year === yearAsNumber && s.department === department,
      );

      // Format for the dropdown
      const formatted = filtered.map(s => ({
        label: s.className, // <-- Use className from your backend
        value: s.id,   // <-- Assuming your section object has 'id'
      }));

      setClassItems(formatted);

      // If the user's current class is not in the new filtered list, reset it
      if (!formatted.some(item => item.value === classId)) {
        setClassId(null);
      }
    } else {
      // If not a student or missing info, clear the class list
      setClassItems([]);
      setClassId(null);
    }
  }, [role, derivedYear, department, allClasses]); // --- CHANGED to 'derivedYear' ---

  const handleUpdateUser = async () => {
    // Start with the basic data that is always updated
    const updatedData = {
      displayName: displayName.trim(),
      role,
    };

    if (role === 'student') {
      // Check derivedYear
      if (!rollNumber.trim() || !batch.trim() || !derivedYear || !department) {
        if(!derivedYear) {
            Toast.show({ type: 'error', text2: 'Please enter a valid Batch Range.' });
        } else {
            Toast.show({ type: 'error', text2: 'Please fill all student fields.' });
        }
        return;
      }
      updatedData.username = rollNumber.trim();
      updatedData.isHosteller = isHosteller;

      // --- FIX: Send data in the format the backend expects ---
      // Send the full object for the 'academicInfo.urn' field
      updatedData.academicInfo = {
        ...user.academicInfo,
        urn: rollNumber.trim(),
        batch: batch.trim(),
        year: derivedYear,
        department: department,
        classId: classId,
      };
      
      // Send the individual fields your backend is looking for
      updatedData.batch = batch.trim();
      updatedData.year = derivedYear;
      updatedData.classId = classId;
      // --- END FIX ---

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
      // updatedData now contains all the fields your backend needs
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
            listMode="SCROLLVIEW" // --- FIX: Removed "MODAL" ---
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
        zIndex={0} // --- FIX: Added zIndex to ScrollView ---
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
          zIndex={3000} // --- FIX: Added zIndex ---
          listMode="SCROLLVIEW" // --- FIX: Removed "MODAL" ---
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
            
            <Text className="text-base text-gray-600 mb-2">Batch Range</Text>
            <TextInput
                className="bg-white p-3 mb-4 rounded-lg border border-gray-300 text-lg text-black"
                placeholder="e.g., 2022-2026"
                value={batch}
                onChangeText={setBatch}
            />

            {/* --- MODIFIED YEAR TEXTINPUT --- */}
            <Text className="text-base text-gray-600 mb-2">Current Year (Auto-calculated)</Text>
            <TextInput
                className="bg-gray-200 p-3 mb-4 rounded-lg border border-gray-300 text-lg text-gray-500"
                value={derivedYear ? derivedYear.toString() : 'N/A'}
                editable={false} // Now read-only
            />
            {/* --- END YEAR TEXTINPUT --- */}


            {/* --- New Class Picker --- */}
            <Text className="text-base text-gray-600 mb-2">Class</Text>
            {classLoading ? (
              <ActivityIndicator color="#2563EB" className="mb-4" />
            ) : (
              <DropDownPicker
                open={classOpen}
                value={classId}
                items={classItems}
                setOpen={setClassOpen}
                setValue={setClassId}
                setItems={setClassItems}
                placeholder="Select a class"
                disabled={classItems.length === 0}
                listMode="SCROLLVIEW" // --- FIX: Removed "MODAL" ---
                zIndex={1000} // --- FIX: Added zIndex (lower) ---
                containerStyle={{ marginBottom: 16 }}
                style={styles.pickerStyle}
                dropDownContainerStyle={styles.dropdownContainerStyle}
                listEmptyText={
                  // --- CHANGED to 'derivedYear' ---
                  derivedYear && department
                    ? 'No classes found for this year/dept.'
                    : 'Please enter batch/year and select department first.'
                }
              />
            )}
            {/* --- End Class Picker --- */}

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
              zIndex={2000} // --- FIX: Added zIndex ---
              listMode="SCROLLVIEW" // --- FIX: Removed "MODAL" ---
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
    backgroundColor: '#FFFFFF',
    marginBottom: 16,
  },
  dropdownContainerStyle: {
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
  },
});

export default EditUserScreen;