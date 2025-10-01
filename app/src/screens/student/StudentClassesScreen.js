import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, RefreshControl, Alert, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import auth from '@react-native-firebase/auth';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import API_URL from '../../config/apiConfig';

const { width } = Dimensions.get('window');

const ClassesHeader = ({ classInfo }) => (
  <View className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-6 rounded-b-3xl">
    <View className="flex-row items-center justify-between">
      <View className="flex-1">
        <Text className="text-black text-2xl font-bold">My Classes</Text>
        <Text className="text-black-100 mt-1">
          {classInfo?.className || 'Loading class information...'}
        </Text>
      </View>
      <View className="bg-white/20 p-3 rounded-full">
        <Icon name="google-classroom" size={24} color="#black" />
      </View>
    </View>
  </View>
);

const StatsCard = ({ icon, title, value, color = "#2563EB" }) => (
  <View className="bg-white p-4 rounded-2xl shadow-sm flex-1 mx-1">
    <View className="items-center">
      <View className="w-12 h-12 rounded-2xl items-center justify-center mb-3" style={{ backgroundColor: `${color}15` }}>
        <Icon name={icon} size={24} color={color} />
      </View>
      <Text className="text-2xl font-bold text-gray-800">{value}</Text>
      <Text className="text-gray-500 text-sm text-center">{title}</Text>
    </View>
  </View>
);

const SubjectCard = ({ subject, index }) => {
  const getSubjectColor = (subjectName) => {
    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];
    return colors[index % colors.length];
  };

  const color = getSubjectColor(subject.subjectName);

  return (
    <TouchableOpacity className="bg-white p-5 rounded-2xl shadow-sm mb-4 mx-6">
      <View className="flex-row items-start">
        <View 
          className="w-14 h-14 rounded-2xl items-center justify-center mr-4"
          style={{ backgroundColor: `${color}15` }}
        >
          <Text className="text-white font-bold text-lg" style={{ color }}>
            {subject.subjectCode?.substring(0, 2) || 'SU'}
          </Text>
        </View>
        
        <View className="flex-1">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-lg font-bold text-gray-800 flex-1" numberOfLines={2}>
              {subject.subjectName}
            </Text>
            <View className="bg-gray-100 px-3 py-1 rounded-full ml-2">
              <Text className="text-gray-600 text-xs font-medium">
                {subject.subjectCode}
              </Text>
            </View>
          </View>
          
          <View className="space-y-2">
            <View className="flex-row items-center">
              <Icon name="account-tie" size={16} color="#6B7280" />
              <Text className="text-gray-600 ml-2 flex-1">{subject.facultyName}</Text>
            </View>
            
            <View className="flex-row items-center">
              <Icon name="clock-outline" size={16} color="#6B7280" />
              <Text className="text-gray-600 ml-2 flex-1">
                {subject.lecturesPerWeek} lectures per week
              </Text>
            </View>
          </View>
          
          <View className="flex-row mt-4 space-x-2">
            <TouchableOpacity className="bg-gray-50 py-2 px-4 rounded-xl flex-1">
              <Text className="text-gray-700 text-sm font-medium text-center">View Details</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              className="py-2 px-4 rounded-xl"
              style={{ backgroundColor: `${color}15` }}
            >
              <Text className="text-sm font-medium text-center" style={{ color }}>
                Contact
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const LoadingState = () => (
  <View className="px-6 py-4">
    {[1, 2, 3].map(i => (
      <View key={i} className="bg-white p-5 rounded-2xl shadow-sm mb-4 animate-pulse">
        <View className="flex-row">
          <View className="w-14 h-14 bg-gray-200 rounded-2xl mr-4" />
          <View className="flex-1">
            <View className="h-5 bg-gray-200 rounded w-3/4 mb-3" />
            <View className="h-4 bg-gray-200 rounded w-1/2 mb-2" />
            <View className="h-4 bg-gray-200 rounded w-2/3" />
          </View>
        </View>
      </View>
    ))}
  </View>
);

const EmptyState = () => (
  <View className="flex-1 items-center justify-center px-6 py-12">
    <View className="bg-gray-100 p-6 rounded-full mb-4">
      <Icon name="school-outline" size={48} color="#9CA3AF" />
    </View>
    <Text className="text-xl font-semibold text-gray-600 mb-2">No Classes Found</Text>
    <Text className="text-gray-400 text-center">
      Your class information is not available. Please contact your administrator.
    </Text>
  </View>
);

const StudentClassesScreen = () => {
  const { userProfile } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [classInfo, setClassInfo] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchClassData = async () => {
    try {
     
      
      if (!userProfile) {
        console.log('No user profile available');
        setLoading(false);
        return;
      }

      const token = await auth().currentUser.getIdToken();
      
      // First test authentication
      try {
        const testResponse = await axios.get(`${API_URL}/students/test`, { 
          headers: { Authorization: `Bearer ${token}` } 
        });
      } catch (testError) {
        console.error('Auth test failed:', testError.response?.data || testError.message);
      }
      
      // Use the dedicated student endpoint
      const response = await axios.get(`${API_URL}/students/my-class`, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      
      
      const { classInfo: fetchedClassInfo, subjects: fetchedSubjects } = response.data;
      
      setClassInfo(fetchedClassInfo);
      setSubjects(fetchedSubjects || []);
      
    
      
    } catch (error) {
      console.error('Error fetching class data:', error);
      console.error('Error details:', error.response?.data || error.message);
      
      if (error.response?.status === 403) {
        Alert.alert('Access Denied', 'You do not have permission to access class information.');
      } else if (error.response?.status === 404) {
        Alert.alert('Class Not Found', 'Your assigned class could not be found. Please contact your administrator.');
      } else {
        Alert.alert('Error', `Failed to load class information: ${error.response?.data?.message || error.message}`);
      }
      
      setClassInfo(null);
      setSubjects([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClassData();
  }, [userProfile]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchClassData().finally(() => setRefreshing(false));
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <ClassesHeader classInfo={classInfo} />
      
      

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh} 
            colors={['#2563EB']}
            tintColor="#2563EB"
          />
        }
      >
        {loading ? (
          <LoadingState />
        ) : !classInfo ? (
          <View className="flex-1 items-center justify-center px-6 py-12">
            <View className="bg-blue-100 p-6 rounded-full mb-4">
              <Icon name="account-school" size={48} color="#3B82F6" />
            </View>
            <Text className="text-xl font-semibold text-gray-600 mb-2">No Class Information</Text>
            <Text className="text-gray-400 text-center mb-4">
              {!userProfile?.classId 
                ? "You haven't been assigned to a class yet." 
                : "Your assigned class could not be found."
              }
            </Text>
            
            <View className="bg-blue-50 p-4 rounded-xl border border-blue-200 w-full">
              <Text className="text-blue-800 font-semibold mb-2">What you can do:</Text>
              <Text className="text-blue-700 text-sm mb-1">• Contact your academic coordinator</Text>
              <Text className="text-blue-700 text-sm mb-1">• Visit the student services office</Text>
              <Text className="text-blue-700 text-sm mb-1">• Provide your academic details (year, section, department)</Text>
              <Text className="text-blue-700 text-sm">• Wait for admin to assign you to the appropriate class</Text>
            </View>
            
            <View className="mt-4 bg-gray-100 p-3 rounded-lg">
              <Text className="text-gray-600 text-xs text-center">
                Student ID: {userProfile?.username || 'N/A'}{'\n'}
                Department: {userProfile?.department || 'N/A'}{'\n'}
                {userProfile?.classId && `Class ID: ${userProfile.classId}`}
              </Text>
            </View>
          </View>
        ) : (
          <>
            {/* Class Stats */}
            <View className="px-6 py-6 -mt-6">
              <View className="flex-row">
                <StatsCard 
                  icon="google-classroom" 
                  title="Class" 
                  value={classInfo.className?.split(' ').pop() || 'N/A'} 
                  color="#3B82F6" 
                />
                <StatsCard 
                  icon="book-multiple" 
                  title="Subjects" 
                  value={subjects.length.toString()} 
                  color="#10B981" 
                />
                <StatsCard 
                  icon="account-group" 
                  title="Students" 
                  value={classInfo.studentCount?.toString() || 'N/A'} 
                  color="#F59E0B" 
                />
              </View>
            </View>

            {/* Class Information */}
            <View className="px-6 mb-6">
              <Text className="text-lg font-bold text-gray-800 mb-4">Class Information</Text>
              <View className="bg-white p-5 rounded-2xl shadow-sm">
                <View className="flex-row items-center mb-4">
                  <View className="w-12 h-12 bg-blue-100 rounded-2xl items-center justify-center mr-4">
                    <Icon name="domain" size={24} color="#3B82F6" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-lg font-bold text-gray-800">{classInfo.className}</Text>
                    <Text className="text-gray-500">{classInfo.department} Department</Text>
                  </View>
                </View>
                
                <View className="border-t border-gray-100 pt-4">
                  <Text className="text-sm text-gray-500 mb-2">Academic Details</Text>
                  <View className="flex-row justify-between">
                    <Text className="text-gray-600">Year: {classInfo.year || 'N/A'}</Text>
                    <Text className="text-gray-600">Section: {classInfo.section || 'N/A'}</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Subjects List */}
            {subjects.length > 0 ? (
              <View className="mb-6">
                <View className="px-6 mb-4">
                  <Text className="text-lg font-bold text-gray-800">My Subjects</Text>
                  <Text className="text-gray-500 mt-1">{subjects.length} subjects this semester</Text>
                </View>
                
                {subjects.map((subject, index) => (
                  <SubjectCard key={index} subject={subject} index={index} />
                ))}
              </View>
            ) : (
              <View className="px-6 mb-6">
                <View className="bg-yellow-50 p-6 rounded-2xl border border-yellow-200">
                  <View className="items-center">
                    <Icon name="alert-circle" size={32} color="#F59E0B" />
                    <Text className="text-yellow-800 font-semibold mt-2">No Subjects Assigned</Text>
                    <Text className="text-yellow-600 text-center mt-1">
                      Your curriculum hasn't been set up yet. Please contact your administrator.
                    </Text>
                  </View>
                </View>
              </View>
            )}
          </>
        )}

        {/* Bottom Padding */}
        <View className="h-6" />
      </ScrollView>
    </SafeAreaView>
  );
};

export default StudentClassesScreen;