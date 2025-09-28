import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, RefreshControl, TouchableOpacity, Alert, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import auth from '@react-native-firebase/auth';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import API_URL from '../../config/apiConfig';

const { width } = Dimensions.get('window');

const WelcomeHeader = ({ userProfile, greeting }) => (
  <View className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-6 rounded-b-3xl">
    <View className="flex-row items-center justify-between">
      <View className="flex-1 mr-3">
        <Text className="text-black text-xl font-bold" numberOfLines={1}>
          {greeting}, {userProfile?.displayName?.split(' ')[0] || 'Student'}! 👋
        </Text>
        <Text className="text-grey-100 mt-1 text-sm" numberOfLines={2}>
          {userProfile?.department || 'Student'} • {userProfile?.academicInfo?.year || 'Year'} {userProfile?.academicInfo?.semester || 'Semester'}
        </Text>
      </View>
      <TouchableOpacity className="bg-white/20 p-3 rounded-full">
        <Icon name="bell-outline" size={20} color="#black" />
      </TouchableOpacity>
    </View>
  </View>
);

const NextClassCard = ({ nextClass, loading }) => {
  if (loading) {
    return (
      <View className="bg-white p-4 rounded-xl shadow-lg mx-4 -mt-4 mb-4" style={{ maxWidth: width - 32 }}>
        <View className="animate-pulse">
          <View className="h-4 bg-gray-200 rounded w-1/3 mb-3"></View>
          <View className="h-5 bg-gray-200 rounded w-2/3 mb-2"></View>
          <View className="h-3 bg-gray-200 rounded w-1/2"></View>
        </View>
      </View>
    );
  }

  if (!nextClass) {
    return (
      <View 
        className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl shadow-lg mx-4 -mt-4 mb-4 border border-green-100" 
        style={{ maxWidth: width - 32 }}
      >
        <View className="items-center">
          <View className="bg-green-100 p-3 rounded-full mb-2">
            <Icon name="calendar-check" size={24} color="#10B981" />
          </View>
          <Text className="text-green-800 font-semibold text-base text-center">All done for today! 🎉</Text>
          <Text className="text-green-600 text-center mt-1 text-sm">No more classes scheduled</Text>
        </View>
      </View>
    );
  }

  return (
    <View 
      className="bg-white p-4 rounded-xl shadow-lg mx-4 -mt-4 mb-4 border-l-4 border-blue-500" 
      style={{ maxWidth: width - 32 }}
    >
      <View className="flex-row items-center justify-between mb-3">
        <Text className="text-gray-500 text-xs font-medium">UP NEXT</Text>
        <View className="bg-blue-50 px-2 py-1 rounded-full">
          <Text className="text-blue-600 text-xs font-semibold" numberOfLines={1}>
            {nextClass.time}
          </Text>
        </View>
      </View>
      
      <Text className="text-lg font-bold text-gray-800 mb-2" numberOfLines={2}>
        {nextClass.subjectName}
      </Text>
      
      <View className="space-y-1">
        <View className="flex-row items-center">
          <Icon name="map-marker" size={14} color="#6B7280" />
          <Text className="text-gray-600 ml-2 flex-1 text-sm" numberOfLines={1}>
            {nextClass.location}
          </Text>
        </View>
        <View className="flex-row items-center">
          <Icon name="account-tie" size={14} color="#6B7280" />
          <Text className="text-gray-600 ml-2 flex-1 text-sm" numberOfLines={1}>
            {nextClass.facultyName}
          </Text>
        </View>
      </View>
      
      <TouchableOpacity className="bg-blue-600 py-2 rounded-lg mt-3">
        <Text className="text-white text-center font-semibold text-sm">View Details</Text>
      </TouchableOpacity>
    </View>
  );
};

const QuickActionCard = ({ icon, title, subtitle, onPress, color = "#2563EB", bgColor = "bg-blue-50" }) => {
  const cardWidth = (width - 48) / 2 - 4; // Account for margins and padding
  
  return (
    <TouchableOpacity 
      onPress={onPress} 
      className={`${bgColor} p-3 rounded-xl items-center justify-center shadow-sm`}
      style={{ width: cardWidth, minHeight: 90, maxHeight: 110 }}
    >
      <View className="bg-white p-2 rounded-full mb-2 shadow-sm">
        <Icon name={icon} size={20} color={color} />
      </View>
      <Text className="text-center text-xs font-semibold text-gray-800" numberOfLines={2}>
        {title}
      </Text>
      {subtitle && (
        <Text className="text-center text-xs text-gray-500 mt-1" numberOfLines={1}>
          {subtitle}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const StatsCard = ({ icon, title, value, color = "#2563EB" }) => {
  const cardWidth = (width - 48) / 3 - 4; // Account for margins and spacing
  
  return (
    <View 
      className="bg-white p-3 rounded-lg shadow-sm"
      style={{ width: cardWidth, minHeight: 80 }}
    >
      <View className="items-center">
        <Text className="text-lg font-bold text-gray-800" numberOfLines={1}>
          {value}
        </Text>
        <Text className="text-gray-500 text-xs mt-1 text-center" numberOfLines={2}>
          {title}
        </Text>
        <View className="mt-1">
          <Icon name={icon} size={16} color={color} />
        </View>
      </View>
    </View>
  );
};

const AssignmentCard = ({ assignment }) => (
  <View 
    className="bg-white p-3 rounded-lg shadow-sm mb-3 border-l-4 border-orange-400" 
    style={{ maxWidth: width - 32 }}
  >
    <View className="flex-row items-center justify-between mb-2">
      <Text className="font-semibold text-gray-800 flex-1 text-sm" numberOfLines={2}>
        {assignment.title}
      </Text>
      <View className="bg-orange-50 px-2 py-1 rounded ml-2">
        <Text className="text-orange-600 text-xs font-medium" numberOfLines={1}>
          {assignment.dueDate}
        </Text>
      </View>
    </View>
    <Text className="text-gray-600 text-xs" numberOfLines={1}>
      {assignment.subject}
    </Text>
  </View>
);

const getNextClass = (schedule) => {
  const now = new Date();
  const currentDay = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][now.getDay()];
  const currentTime = now.getHours() * 60 + now.getMinutes();

  const timeSlots = [
    '08:30 AM', '09:30 AM', '10:30 AM', '11:30 AM', 
    '12:30 PM', '01:30 PM', '02:30 PM', '03:30 PM'
  ];

  const timeToMinutes = (timeStr) => {
    const [time, period] = timeStr.split(' ');
    let [hours, minutes] = time.split(':').map(Number);
    if (period === 'PM' && hours !== 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;
    return hours * 60 + minutes;
  };

  for (const timeSlot of timeSlots) {
    const slotKey = `${currentDay}-${timeSlot}`;
    const slotTime = timeToMinutes(timeSlot);
    
    if (schedule[slotKey] && slotTime > currentTime) {
      const classData = schedule[slotKey];
      const endTime = timeToMinutes(timeSlot) + 60;
      const endHours = Math.floor(endTime / 60);
      const endMinutes = endTime % 60;
      const endPeriod = endHours >= 12 ? 'PM' : 'AM';
      const displayEndHours = endHours > 12 ? endHours - 12 : (endHours === 0 ? 12 : endHours);
      const endTimeStr = `${displayEndHours}:${endMinutes.toString().padStart(2, '0')} ${endPeriod}`;

      return {
        subjectName: classData.subjectCode || 'Unknown Subject',
        time: `${timeSlot} - ${endTimeStr}`,
        location: `Room ${classData.roomNumber || 'TBA'}`,
        facultyName: classData.facultyName || 'Unknown Faculty'
      };
    }
  }

  const tomorrow = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][(now.getDay() + 1) % 7];
  
  for (const timeSlot of timeSlots) {
    const slotKey = `${tomorrow}-${timeSlot}`;
    if (schedule[slotKey]) {
      const classData = schedule[slotKey];
      const endTime = timeToMinutes(timeSlot) + 60;
      const endHours = Math.floor(endTime / 60);
      const endMinutes = endTime % 60;
      const endPeriod = endHours >= 12 ? 'PM' : 'AM';
      const displayEndHours = endHours > 12 ? endHours - 12 : (endHours === 0 ? 12 : endHours);
      const endTimeStr = `${displayEndHours}:${endMinutes.toString().padStart(2, '0')} ${endPeriod}`;

      return {
        subjectName: classData.subjectCode || 'Unknown Subject',
        time: `${timeSlot} - ${endTimeStr} (Tomorrow)`,
        location: `Room ${classData.roomNumber || 'TBA'}`,
        facultyName: classData.facultyName || 'Unknown Faculty'
      };
    }
  }

  return null;
};

const HomeScreen = ({ navigation }) => {
  const { userProfile } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [nextClass, setNextClass] = useState(null);
  const [loading, setLoading] = useState(true);
  const [assignments, setAssignments] = useState([]);
  const [todayClassCount, setTodayClassCount] = useState(0);

  const fetchDashboardData = async () => {
    try {
      const token = await auth().currentUser.getIdToken();
      const timetableResponse = await axios.get(`${API_URL}/timetable`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (timetableResponse.data && timetableResponse.data.schedule) {
        const nextClass = getNextClass(timetableResponse.data.schedule);
        setNextClass(nextClass);
        
        const today = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][new Date().getDay()];
        const todayClasses = Object.keys(timetableResponse.data.schedule).filter(key => key.startsWith(today + '-'));
        setTodayClassCount(todayClasses.length);
      } else {
        setNextClass(null);
        setTodayClassCount(0);
      }

      setAssignments([
        { id: 1, title: 'Binary Tree Implementation', subject: 'Data Structures', dueDate: 'Tomorrow' },
        { id: 2, title: 'Physics Lab Report', subject: 'Physics II', dueDate: 'Dec 15' }
      ]);

    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
      setNextClass(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
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
        <WelcomeHeader userProfile={userProfile} greeting={getGreeting()} />

        <NextClassCard nextClass={nextClass} loading={loading} />

        <View className="px-4 mb-4">
          <Text className="text-base font-bold text-gray-800 mb-3">Today's Overview</Text>
          <View className="flex-row justify-between">
            <StatsCard 
              icon="calendar-today" 
              title="Classes Today" 
              value={todayClassCount.toString()} 
              color="#10B981" 
            />
            <StatsCard 
              icon="clipboard-text" 
              title="Assignments" 
              value={assignments.length.toString()} 
              color="#F59E0B" 
            />
            <StatsCard 
              icon="percent" 
              title="Attendance" 
              value="92%" 
              color="#8B5CF6" 
            />
          </View>
        </View>

        <View className="px-4 mb-4">
          <Text className="text-base font-bold text-gray-800 mb-3">Quick Actions</Text>
          <View className="flex-row justify-between mb-2">
            <QuickActionCard 
              icon="newspaper-variant" 
              title="Notices" 
              subtitle="Latest updates"
              onPress={() => navigation.navigate('NoticeBoard')} 
              color="#EF4444"
              bgColor="bg-red-50"
            />
            <QuickActionCard 
              icon="office-building" 
              title="Hostel" 
              subtitle="Room info"
              onPress={() => navigation.navigate('StudentHostel')} 
              color="#10B981"
              bgColor="bg-green-50"
            />
          </View>
          <View className="flex-row justify-between">
            <QuickActionCard 
              icon="currency-usd" 
              title="Fees" 
              subtitle="Payment status"
              onPress={() => Alert.alert("Fees", "This feature is coming soon!")} 
              color="#F59E0B"
              bgColor="bg-yellow-50"
            />
            <QuickActionCard 
              icon="information" 
              title="About" 
              subtitle="App info"
              onPress={() => navigation.navigate('StudentAbout')} 
              color="#8B5CF6"
              bgColor="bg-purple-50"
            />
          </View>
        </View>

        <View className="px-4 mb-4">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-base font-bold text-gray-800">Upcoming Assignments</Text>
            <TouchableOpacity onPress={() => Alert.alert("Assignments", "This feature is coming soon!")}>
              <Text className="font-semibold text-blue-600 text-sm">View All</Text>
            </TouchableOpacity>
          </View>
          
          {assignments.length > 0 ? (
            assignments.map(assignment => (
              <AssignmentCard key={assignment.id} assignment={assignment} />
            ))
          ) : (
            <View 
              className="bg-white p-4 rounded-lg shadow-sm items-center" 
              style={{ maxWidth: width - 32 }}
            >
              <View className="bg-green-100 p-3 rounded-full mb-2">
                <Icon name="clipboard-check" size={24} color="#10B981" />
              </View>
              <Text className="text-gray-600 text-center font-medium text-sm">All caught up! 🎉</Text>
              <Text className="text-gray-400 text-xs mt-1 text-center">No assignments due soon</Text>
            </View>
          )}
        </View>

        <View className="h-4" />
      </ScrollView>
    </SafeAreaView>
  );
};

export default HomeScreen;