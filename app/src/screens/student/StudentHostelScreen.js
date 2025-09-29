//app\src\screens\student\StudentHostelScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, RefreshControl, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import auth from '@react-native-firebase/auth';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import InfoCard from '../../components/student/InfoCard';
import API_URL from '../../config/apiConfig';

const StudentHostelScreen = ({ navigation }) => {
  const { userProfile } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [hostelInfo, setHostelInfo] = useState(null);
  const [roommates, setRoommates] = useState([]);

  const fetchHostelData = async () => {
    if (!userProfile?.isHosteller) return;
    
    try {
      const token = await auth().currentUser.getIdToken();
      const response = await axios.get(`${API_URL}/hostels`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Find hostel info for this student
      const studentHostel = response.data.find(hostel => 
        hostel.students?.some(student => student.uid === userProfile.uid)
      );
      
      if (studentHostel) {
        const studentDetails = studentHostel.students.find(s => s.uid === userProfile.uid);
        setHostelInfo({
          ...studentHostel,
          studentRoom: studentDetails?.roomNumber,
          studentFloor: studentDetails?.floor
        });
        
        // Find roommates (students in the same room)
        if (studentDetails?.roomNumber) {
          const roommatesList = studentHostel.students.filter(s => 
            s.roomNumber === studentDetails.roomNumber && s.uid !== userProfile.uid
          );
          setRoommates(roommatesList);
        }
      }
    } catch (error) {
      console.error('Error fetching hostel info:', error);
      Alert.alert('Error', 'Failed to load hostel information');
    }
  };

  useEffect(() => {
    fetchHostelData();
  }, [userProfile]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchHostelData();
    setRefreshing(false);
  };

  if (!userProfile?.isHosteller) {
    return (
      <SafeAreaView className="flex-1 bg-gray-100">
        <View className="p-6 bg-blue-600">
          <Text className="text-2xl font-bold text-white">Hostel Information</Text>
          <Text className="text-blue-100 mt-1">Accommodation Details</Text>
        </View>
        
        <View className="p-4">
          <View className="bg-blue-50 p-4 rounded-xl border border-blue-200">
            <Text className="text-blue-800 text-center">
              You are not registered as a hosteller. If this is incorrect, please contact your administrator.
            </Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <ScrollView 
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View className="p-6 bg-blue-600">
          <Text className="text-2xl font-bold text-white">Hostel Information</Text>
          <Text className="text-blue-100 mt-1">Accommodation Details</Text>
        </View>

        {/* Hostel Information */}
        {hostelInfo ? (
          <>
            <View className="p-4">
              <Text className="text-lg font-semibold text-gray-800 mb-3">My Accommodation</Text>
              
              <InfoCard 
                icon="home-city" 
                title="Hostel Name" 
                value={hostelInfo.hostelName} 
              />
              
              <InfoCard 
                icon="door" 
                title="Room Number" 
                value={hostelInfo.studentRoom} 
              />
              
              <InfoCard 
                icon="stairs" 
                title="Floor" 
                value={hostelInfo.studentFloor} 
              />
              
              <InfoCard 
                icon="account-group" 
                title="Roommates" 
                value={roommates.length > 0 ? `${roommates.length} roommate(s)` : 'No roommates'} 
              />
            </View>

            {/* Hostel Details */}
            <View className="p-4">
              <Text className="text-lg font-semibold text-gray-800 mb-3">Hostel Details</Text>
              
              <InfoCard 
                icon="office-building" 
                title="Hostel Type" 
                value={hostelInfo.hostelType} 
              />
              
              <InfoCard 
                icon="domain" 
                title="Department" 
                value={hostelInfo.department} 
              />
              
              <InfoCard 
                icon="account-supervisor" 
                title="Warden" 
                value={hostelInfo.wardenName || 'Not Assigned'} 
              />
              
              {hostelInfo.wardenContact && (
                <InfoCard 
                  icon="phone" 
                  title="Warden Contact" 
                  value={hostelInfo.wardenContact} 
                />
              )}
              
              <InfoCard 
                icon="bed" 
                title="Total Capacity" 
                value={hostelInfo.capacity?.toString() || 'N/A'} 
              />
              
              <InfoCard 
                icon="account-multiple" 
                title="Current Occupancy" 
                value={hostelInfo.students?.length?.toString() || '0'} 
              />
            </View>

            {/* Roommates */}
            {roommates.length > 0 && (
              <View className="p-4">
                <Text className="text-lg font-semibold text-gray-800 mb-3">Roommates</Text>
                
                {roommates.map((roommate, index) => (
                  <View key={index} className="bg-white p-4 rounded-xl shadow-sm mb-3">
                    <View className="flex-row items-center">
                      <View className="bg-green-100 p-2 rounded-full mr-3">
                        <Text className="text-green-600 font-bold text-sm">
                          {roommate.displayName?.charAt(0) || 'R'}
                        </Text>
                      </View>
                      <View className="flex-1">
                        <Text className="text-base font-semibold text-gray-800">
                          {roommate.displayName || 'Unknown'}
                        </Text>
                        <Text className="text-sm text-gray-500">
                          Room {roommate.roomNumber} • Floor {roommate.floor}
                        </Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* Hostel Rules/Info */}
            <View className="p-4">
              <Text className="text-lg font-semibold text-gray-800 mb-3">Important Information</Text>
              
              <View className="bg-yellow-50 p-4 rounded-xl border border-yellow-200 mb-3">
                <Text className="text-yellow-800 font-medium mb-2">Hostel Guidelines</Text>
                <Text className="text-yellow-700 text-sm">
                  • Maintain cleanliness in your room and common areas{'\n'}
                  • Follow hostel timings and regulations{'\n'}
                  • Report any issues to the warden immediately{'\n'}
                  • Respect your roommates and neighbors
                </Text>
              </View>
              
              <View className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                <Text className="text-blue-800 font-medium mb-2">Contact Information</Text>
                <Text className="text-blue-700 text-sm">
                  For any hostel-related queries or issues, please contact your warden or the hostel administration.
                </Text>
              </View>
            </View>
          </>
        ) : (
          <View className="p-4">
            <View className="bg-yellow-50 p-4 rounded-xl border border-yellow-200">
              <Text className="text-yellow-800 text-center">
                Hostel information not found. Please contact your administrator for room allocation.
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default StudentHostelScreen;