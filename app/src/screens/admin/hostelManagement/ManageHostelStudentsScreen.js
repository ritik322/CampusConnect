import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, SafeAreaView, FlatList, ActivityIndicator, TouchableOpacity, TextInput } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import auth from '@react-native-firebase/auth';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Toast from 'react-native-toast-message';
import API_URL from '../../../config/apiConfig';

const ManageHostelStudentsScreen = ({ route, navigation }) => {
  const { hostel } = route.params; // Receive the specific hostel context
  const [masterStudentList, setMasterStudentList] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchHostelStudents = useCallback(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const idToken = await auth().currentUser.getIdToken();
        const response = await axios.get(`${API_URL}/users`, {
          headers: { Authorization: `Bearer ${idToken}` },
        });
        
        // --- THIS IS THE NEW FILTERING LOGIC ---
        const allHostellers = response.data;
        const relevantStudents = allHostellers.filter(student => 
            !student.hostelInfo || student.hostelInfo.hostelId === hostel.id
        );

        setMasterStudentList(relevantStudents);
        setFilteredStudents(relevantStudents);
      } catch (error) {
        console.error('Failed to fetch hostel students:', error);
        Toast.show({ type: 'error', text2: 'Could not load students.' });
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [hostel.id]);

  useFocusEffect(fetchHostelStudents);

  useEffect(() => {
    if (search) {
      const lowercasedSearch = search.toLowerCase();
      const filtered = masterStudentList.filter(student =>
        student.displayName.toLowerCase().includes(lowercasedSearch) ||
        student.academicInfo.rollNumber.toLowerCase().includes(lowercasedSearch)
      );
      setFilteredStudents(filtered);
    } else {
      setFilteredStudents(masterStudentList);
    }
  }, [search, masterStudentList]);

  const StudentCard = ({ student }) => {
    const hostelName = student.hostelInfo?.hostelName || 'Unassigned';
    const cardColor = hostelName === 'Unassigned' ? 'bg-red-50' : 'bg-green-50';
    const textColor = hostelName === 'Unassigned' ? 'text-red-600' : 'text-green-600';

    return (
      <TouchableOpacity
        onPress={() => navigation.navigate('AssignHostelDetail', { student })}
        className="bg-white p-4 rounded-xl mb-4 shadow-sm flex-row justify-between items-center"
      >
        <View>
          <Text className="text-lg font-bold text-gray-800">{student.displayName}</Text>
          <Text className="text-gray-600">Roll No: {student.academicInfo.rollNumber}</Text>
        </View>
        <View className={`px-3 py-1 rounded-full ${cardColor}`}>
            <Text className={`font-bold ${textColor}`}>{hostelName}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <View className="p-6">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={28} color="#1F2937" />
        </TouchableOpacity>
        <Text className="text-3xl font-bold text-gray-800 mt-2">Manage Students</Text>
        <Text className="text-lg text-gray-600">For: {hostel.hostelName}</Text>
      </View>
      
      <View className="px-6 mb-4">
        <View className="flex-row items-center bg-white rounded-lg p-2 shadow-sm">
          <Icon name="magnify" size={24} color="#9CA3AF" />
          <TextInput
            className="flex-1 ml-2 text-lg text-black"
            placeholder="Search by name or roll no..."
            placeholderTextColor={'#9CA3AF'}
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#2563EB" />
      ) : (
        <FlatList
          data={filteredStudents}
          renderItem={({ item }) => <StudentCard student={item} />}
          keyExtractor={item => item.id}
          contentContainerStyle={{ paddingHorizontal: 24 }}
          ListEmptyComponent={
            <Text className="text-center text-gray-500 mt-10">
              No unassigned students or students allotted to this hostel were found.
            </Text>
          }
        />
      )}
    </SafeAreaView>
  );
};

export default ManageHostelStudentsScreen;

