import React, { useState, useCallback } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import auth from '@react-native-firebase/auth';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import API_URL from '../../../config/apiConfig';
import Toast from 'react-native-toast-message';
import RNPickerSelect from 'react-native-picker-select';

const GenerateTimetableScreen = ({ navigation }) => {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const fetchClasses = useCallback( () => {
    const loadData = async ()=>{
    setLoading(true);
    try {
      const idToken = await auth().currentUser.getIdToken();
      const response = await axios.get(`${API_URL}/classes`, {
        headers: { Authorization: `Bearer ${idToken}` }
      });
      const classItems = response.data.map(c => ({ label: c.className, value: c.id }));
      setClasses(classItems);
    } catch (error) {
      console.error("Failed to fetch classes:", error);
    } finally {
      setLoading(false);
    }}
    loadData()
  }, []);

  useFocusEffect(fetchClasses);

  const handleGenerate = async () => {
    if (!selectedClass) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Please select a class.' });
      return;
    }
    setGenerating(true);
    try {
      const idToken = await auth().currentUser.getIdToken();
      const response = await axios.post(`${API_URL}/timetable/generate`, { classId: selectedClass }, {
        headers: { Authorization: `Bearer ${idToken}` }
      });
      Toast.show({ type: 'success', text1: 'Success', text2: response.data.message });
      navigation.goBack();
    } catch (error) {
      const errorMessage = error.response ? error.response.data.message : 'An error occurred.';
      Toast.show({ type: 'error', text1: 'Generation Failed', text2: errorMessage });
    } finally {
      setGenerating(false);
    }
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
        <Text className="text-base text-gray-600 mb-2">Select Class</Text>
        {loading ? (
          <ActivityIndicator />
        ) : (
          <RNPickerSelect
            onValueChange={(value) => setSelectedClass(value)}
            items={classes}
            style={pickerSelectStyles}
            placeholder={{ label: "Select a class to generate for...", value: null }}
            Icon={() => <Icon name="chevron-down" size={24} color="gray" />}
          />
        )}
        
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
    top: 15,
    right: 15,
  },
  placeholder: {
    color: '#9CA3AF',
  },
});

export default GenerateTimetableScreen;