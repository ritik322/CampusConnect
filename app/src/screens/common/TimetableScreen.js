import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, SafeAreaView, ActivityIndicator, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import auth from '@react-native-firebase/auth';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import API_URL from '../../config/apiConfig';
import Toast from 'react-native-toast-message';
import { useAuth } from '../../context/AuthContext';

const LECTURE_SLOTS = [
  '08:30 AM', '09:30 AM', '10:30 AM', '11:30 AM', '12:30 PM', '01:30 PM', '02:30 PM', '03:30 PM'
];
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

const TimetableScreen = ({ navigation }) => {
  const { userProfile } = useAuth();
  const [timetableData, setTimetableData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState(DAYS[0]);

  const fetchData = useCallback(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const idToken = await auth().currentUser.getIdToken();
        const headers = { Authorization: `Bearer ${idToken}` };
        const response = await axios.get(`${API_URL}/timetable`, { headers });
        setTimetableData(response.data);
      } catch (error) {
        console.error(error);
        Toast.show({ type: 'error', text2: 'Could not fetch timetable data.' });
      } finally {
        setLoading(false);
      }
    };
    if (userProfile) loadData();
  }, [userProfile]);

  useFocusEffect(fetchData);

  const dailySchedule = useMemo(() => {
    if (!timetableData?.schedule) return {};
    const grouped = {};
    for (const day of DAYS) {
        grouped[day] = [];
    }
    for(const slot of LECTURE_SLOTS) {
        for(const day of DAYS) {
            const slotId = `${day}-${slot}`;
            if(timetableData.schedule[slotId]){
                grouped[day].push({time: slot, ...timetableData.schedule[slotId]});
            }
        }
    }
    return grouped;
  }, [timetableData]);

  const DayTab = ({ day }) => (
    <TouchableOpacity
      onPress={() => setSelectedDay(day)}
      className={`px-4 py-2 rounded-full mx-1 ${selectedDay === day ? 'bg-blue-600' : 'bg-white'}`}
    >
      <Text className={`font-bold ${selectedDay === day ? 'text-white' : 'text-blue-600'}`}>{day.substring(0, 3)}</Text>
    </TouchableOpacity>
  );

  const LectureCard = ({ item }) => {
    const isFaculty = timetableData.type === 'faculty';
    return (
      <View className="bg-white rounded-2xl p-4 mb-4 shadow-sm flex-row items-center">
        <View className="w-20 items-center justify-center border-r border-gray-200 pr-4">
            <Text className="text-lg font-bold text-blue-600">{item.time.split(' ')[0]}</Text>
            <Text className="text-xs text-blue-500">{item.time.split(' ')[1]}</Text>
        </View>
        <View className="flex-1 pl-4">
            <Text className="text-base font-bold text-gray-800" numberOfLines={1}>{item.subjectCode}</Text>
            <Text className="text-sm text-gray-600 mt-1" numberOfLines={1}>
              {isFaculty ? `Class: ${item.className}` : item.facultyName}
            </Text>
            <Text className="text-sm text-gray-500 mt-1">Room: {item.roomNumber}</Text>
        </View>
      </View>
    );
  };

  const getHeaderTitle = () => {
    if (!timetableData) return "My Timetable";
    if (timetableData.type === 'student') return timetableData.className || "My Timetable";
    return "My Faculty Timetable";
  }

  if (loading) {
    return (
        <SafeAreaView className="flex-1 justify-center items-center bg-gray-100">
            <ActivityIndicator size="large" color="#2563EB" />
        </SafeAreaView>
    )
  }
  
  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <View className="p-6 flex-row items-center">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={28} color="#1F2937" />
        </TouchableOpacity>
        <Text className="text-3xl font-bold text-gray-800 ml-4">{getHeaderTitle()}</Text>
      </View>

      <View className="px-4 mb-4">
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {DAYS.map(day => <DayTab key={day} day={day} />)}
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}>
        {dailySchedule[selectedDay] && dailySchedule[selectedDay].length > 0 ? (
          dailySchedule[selectedDay].map((item, index) => <LectureCard key={index} item={item} />)
        ) : (
          <View className="mt-20 items-center">
            <Icon name="calendar-check" size={60} color="#D1D5DB" />
            <Text className="text-lg text-gray-500 mt-4">No lectures scheduled for {selectedDay}.</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default TimetableScreen;

