import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import auth from '@react-native-firebase/auth';
import axios from 'axios';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from '../../context/AuthContext';
import DashboardCard from '../../components/admin/DashboardCard';
import API_URL from '../../config/apiConfig';
import Toast from 'react-native-toast-message';

const DAYS = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

const facultyFeatures = [
  {
    id: '1',
    title: 'My Workspace',
    icon: 'folder-star-outline',
    navigateTo: 'Workspace',
  },
  {
    id: '2',
    title: 'Manage Attendance',
    icon: 'check-decagram-outline',
    navigateTo: 'ManageAttendance',
  },
  {
    id: '3',
    title: 'Upload Marks',
    icon: 'file-chart-outline',
    navigateTo: 'UploadMarks',
  },
  {
    id: '4',
    title: 'View Full Timetable',
    icon: 'calendar-week',
    navigateTo: 'Timetable',
  },
    { id: '5', title: 'View Notices', icon: 'newspaper-variant-multiple-outline', navigateTo: 'NoticeBoard' },
];

const FacultyDashboardScreen = ({ navigation }) => {
  const { userProfile } = useAuth();
  const [todaysSchedule, setTodaysSchedule] = useState([]);
  const [loading, setLoading] = useState(true);

  const currentDay = useMemo(() => DAYS[new Date().getDay()], []);

  useFocusEffect(
    React.useCallback(() => {
      const fetchTimetable = async () => {
        if (!userProfile) return;
        setLoading(true);
        try {
          const idToken = await auth().currentUser.getIdToken();
          const response = await axios.get(`${API_URL}/timetable`, {
            headers: { Authorization: `Bearer ${idToken}` },
          });

          const schedule = response.data?.schedule || {};
          const today = [];
          for (const key in schedule) {
            if (key.startsWith(currentDay)) {
              today.push({
                time: key.split('-')[1],
                ...schedule[key],
              });
            }
          }
          today.sort(
            (a, b) =>
              new Date('1970/01/01 ' + a.time) -
              new Date('1970/01/01 ' + b.time),
          );
          setTodaysSchedule(today);
        } catch (error) {
          Toast.show({
            type: 'error',
            text2: "Could not fetch today's schedule.",
          });
        } finally {
          setLoading(false);
        }
      };
      fetchTimetable();
    }, [userProfile, currentDay]),
  );

  const handleCardPress = feature => {
    navigation.navigate(feature.navigateTo);
  };

  const handleLogout = async () => {
    try {
      await auth().signOut();
    } catch (error) {
      Alert.alert('Error', 'Failed to log out.');
    }
  };

  const LectureCard = ({ item }) => (
    <View className="bg-white rounded-xl p-4 mb-3 flex-row items-center shadow-sm">
      <View className="w-20 items-center justify-center border-r border-gray-200 pr-3">
        <Text className="text-base font-bold text-blue-600">
          {item.time.split(' ')[0]}
        </Text>
        <Text className="text-xs text-blue-500">{item.time.split(' ')[1]}</Text>
      </View>
      <View className="flex-1 pl-3">
        <Text className="text-base font-bold text-gray-800">
          {item.subjectCode}
        </Text>
        <Text className="text-sm text-gray-600 mt-1">
          Class: {item.className}
        </Text>
        <Text className="text-sm text-gray-500 mt-1">
          Room: {item.roomNumber}
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <View className="p-6">
        <Text className="text-3xl font-bold text-gray-800">
          Welcome, {userProfile?.displayName || 'Faculty'}
        </Text>
        <Text className="text-base text-gray-500">
          Here is your schedule for today.
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 16 }}>
        <View className="px-2 mb-4">
          <Text className="text-xl font-bold text-gray-700 mb-3">
            {currentDay}'s Schedule
          </Text>
          {loading ? (
            <ActivityIndicator size="large" color="#2563EB" />
          ) : todaysSchedule.length > 0 ? (
            todaysSchedule.map((item, index) => (
              <LectureCard key={index} item={item} />
            ))
          ) : (
            <View className="items-center justify-center bg-white rounded-xl p-6">
              <Icon name="calendar-check" size={40} color="#9CA3AF" />
              <Text className="text-base text-gray-500 mt-2">
                You have no lectures today. Enjoy your day!
              </Text>
            </View>
          )}
        </View>

        <View className="flex-row flex-wrap justify-between mt-4">
          {facultyFeatures.map(item => (
            <DashboardCard
              key={item.id}
              title={item.title}
              icon={item.icon}
              onPress={() => handleCardPress(item)}
            />
          ))}
        </View>
      </ScrollView>

      <View className="p-6">
        <TouchableOpacity
          className="bg-red-500 p-4 rounded-lg items-center"
          onPress={handleLogout}
        >
          <Text className="text-white text-lg font-bold">Log Out</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default FacultyDashboardScreen;
