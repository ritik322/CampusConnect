import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import axios from 'axios';
import auth from '@react-native-firebase/auth';
import Toast from 'react-native-toast-message';
import DropDownPicker from 'react-native-dropdown-picker';
import API_URL from '../../../config/apiConfig';
import { useAuth } from '../../../context/AuthContext';

const SectionAllotmentScreen = ({ navigation }) => {
  const { userProfile } = useAuth();
  const [numberOfSections, setNumberOfSections] = useState('');
  const [loading, setLoading] = useState(false);
  const [allUnassigned, setAllUnassigned] = useState([]); 

  const [deptOpen, setDeptOpen] = useState(false);
  const [deptValue, setDeptValue] = useState(null);
  const [deptItems, setDeptItems] = useState([
    { label: 'Computer Science (CSE)', value: 'cse' },
    { label: 'Information Technology', value: 'it' },
    { label: 'Mechanical', value: 'me' },
    { label: 'Civil', value: 'ce' },
    { label: 'Electrical', value: 'ee' },
  ]);

  const [batchOpen, setBatchOpen] = useState(false);
  const [batchValue, setBatchValue] = useState(null);
  const [batchItems, setBatchItems] = useState([]);

  useEffect(() => {
    const fetchUnassignedBatches = async () => {
      try {
        const idToken = await auth().currentUser.getIdToken();
        const response = await axios.get(
          `${API_URL}/users/unassigned-batches`,
          {
            headers: { Authorization: `Bearer ${idToken}` },
          },
        );
        setAllUnassigned(response.data);

        if (userProfile?.adminDomain !== 'ALL_DEPARTMENTS') {
          setDeptValue(userProfile.adminDomain);
        }
      } catch (error) {
        console.error('Failed to fetch unassigned batches:', error);
        Toast.show({ type: 'error', text2: 'Could not load batches.' });
      }
    };

    fetchUnassignedBatches();
  }, [userProfile]);

  useEffect(() => {
    if (deptValue) {
      const filtered = allUnassigned.filter(b => b.department === deptValue);
      setBatchItems(
        filtered.map(({ batch }) => ({
          label: batch,
          value: batch,
        })),
      );
    } else {
      setBatchItems([]);
    }
    setBatchValue(null); // Reset batch selection when department changes
  }, [deptValue, allUnassigned]);

  const calculateYearFromBatch = batch => {
    if (!batch) return null;
    const startYear = parseInt(batch.split('-')[0], 10);
    const currentMonth = new Date().getMonth(); // 0-11
    const currentYear = new Date().getFullYear();

    const academicYearStartMonth = 7;

    let academicYear = currentYear - startYear;
    if (currentMonth < academicYearStartMonth) {
      academicYear--; // If we are before the new session starts, they are still in the previous year
    }

    return academicYear + 1;
  };

  const handleCreateAndAllot = async () => {
    const year = calculateYearFromBatch(batchValue);

    if (!batchValue || !year || !numberOfSections) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please fill all fields.',
      });
      return;
    }
    setLoading(true);
    try {
      const idToken = await auth().currentUser.getIdToken();
      const payload = {
        batch: batchValue,
        department: deptValue,
        year,
        numberOfSections: parseInt(numberOfSections, 10),
      };

      const response = await axios.post(
        `${API_URL}/classes/allot-sections`,
        payload,
        {
          headers: { Authorization: `Bearer ${idToken}` },
        },
      );
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: response.data.message,
      });
      navigation.goBack();
    } catch (error) {
      const errorMessage = error.response
        ? error.response.data.message
        : 'An error occurred.';
      Toast.show({
        type: 'error',
        text1: 'Allotment Failed',
        text2: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <View className="p-6 flex-row items-center">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={28} color="#1F2937" />
        </TouchableOpacity>
        <Text className="text-3xl font-bold text-gray-800 ml-4">
          Create & Allot Sections
        </Text>
      </View>

      <View className="px-6">
        <Text className="text-base text-gray-600 mb-2">Department</Text>
        <DropDownPicker
          open={deptOpen}
          value={deptValue}
          items={deptItems}
          setOpen={setDeptOpen}
          setValue={setDeptValue}
          setItems={setDeptItems}
          placeholder="Select a department first..."
          disabled={userProfile?.adminDomain !== 'ALL_DEPARTMENTS'}
          style={{
            borderColor: '#D1D5DB',
            backgroundColor:
              userProfile?.adminDomain !== 'ALL_DEPARTMENTS'
                ? '#E5E7EB'
                : '#FFFFFF',
          }}
          dropDownContainerStyle={{ borderColor: '#D1D5DB' }}
          zIndex={3000}
        />

        <Text className="text-base text-gray-600 mb-2 mt-4">
          Unassigned Batch
        </Text>
        <DropDownPicker
          open={batchOpen}
          value={batchValue}
          items={batchItems}
          setOpen={setBatchOpen}
          setValue={setBatchValue}
          setItems={setBatchItems}
          disabled={!deptValue}
          placeholder={
            deptValue ? 'Select a batch...' : 'Select department first'
          }
          style={{ borderColor: '#D1D5DB', marginBottom: 16 }}
          dropDownContainerStyle={{ borderColor: '#D1D5DB' }}
          zIndex={2000}
        />

        <Text className="text-base text-gray-600 mb-2">
          Number of Sections to Create
        </Text>
        <TextInput
          className="bg-white p-4 mb-4 rounded-lg border border-gray-300 text-lg text-black"
          placeholder="e.g., 2"
          keyboardType="number-pad"
          value={numberOfSections}
          onChangeText={setNumberOfSections}
        />

        <TouchableOpacity
          className="bg-green-600 p-4 rounded-lg items-center shadow mt-6"
          onPress={handleCreateAndAllot}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white text-lg font-bold">
              Create and Allot
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default SectionAllotmentScreen;
