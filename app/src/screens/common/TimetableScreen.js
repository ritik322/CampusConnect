import React, { useState, useCallback } from 'react';
import { View, Text, SafeAreaView, ActivityIndicator, TouchableOpacity, ScrollView } from 'react-native';
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
  const [schedule, setSchedule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({ subjects: {}, faculty: {}, classrooms: {} });

  const fetchData = useCallback(() => {
    if (!userProfile) return;

    const loadData = async () => {
      setLoading(true);
      try {
        const idToken = await auth().currentUser.getIdToken();
        const headers = { Authorization: `Bearer ${idToken}` };
        
        const [scheduleRes, subjectsRes, facultyRes, classroomsRes] = await Promise.all([
          axios.get(`${API_URL}/timetable`, { headers }),
          axios.get(`${API_URL}/subjects`, { headers }),
          axios.get(`${API_URL}/users`, { headers }),
          axios.get(`${API_URL}/classrooms`, { headers })
        ]);

        const subjectsMap = subjectsRes.data.reduce((acc, s) => ({ ...acc, [s.id]: s }), {});
        const facultyMap = facultyRes.data.reduce((acc, f) => ({ ...acc, [f.id]: f }), {});
        const classroomsMap = classroomsRes.data.reduce((acc, c) => ({ ...acc, [c.id]: c }), {});
        
        setData({ subjects: subjectsMap, faculty: facultyMap, classrooms: classroomsMap });
        
        if (scheduleRes.data && Object.keys(scheduleRes.data).length > 0) {
          setSchedule(scheduleRes.data);
        } else {
          setSchedule({});
          Toast.show({ type: 'info', text1: 'No Timetable Found', text2: 'A schedule has not been generated yet.' });
        }

      } catch (error) {
        console.error(error);
        Toast.show({ type: 'error', text1: 'Error', text2: 'Could not fetch timetable data.' });
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [userProfile]);

  useFocusEffect(fetchData);

  const renderCell = (day, time) => {
    const slotId = `${day}-${time}`;
    const entry = schedule ? schedule[slotId] : null;

    if (!entry) {
      // Logic to find the class-specific break time can be added here
      return <View className="flex-1 border-r border-b border-gray-200 p-1" />;
    }
    
    const subject = data.subjects[entry.subjectId];
    const faculty = data.faculty[entry.facultyId];
    const classroom = data.classrooms[entry.classroomId];

    return (
      <View className="flex-1 border-r border-b border-gray-200 p-1 justify-center items-center bg-blue-50">
        <Text className="text-xs font-bold text-center text-blue-800">{subject?.subjectCode || 'N/A'}</Text>
        <Text className="text-[10px] text-center text-blue-700" numberOfLines={1}>{faculty?.displayName || 'N/A'}</Text>
        <Text className="text-[10px] text-center text-blue-600">({classroom?.roomNumber || 'N/A'})</Text>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <View className="p-6 flex-row items-center">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={28} color="#1F2937" />
        </TouchableOpacity>
        <Text className="text-3xl font-bold text-gray-800 ml-4">My Timetable</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#2563EB" />
      ) : (
        <ScrollView horizontal>
          <View>
            <View className="flex-row bg-gray-200">
              <View className="w-20 border-r border-b border-gray-300 p-2 justify-center items-center"><Text className="font-bold">Time</Text></View>
              {DAYS.map(day => <View key={day} className="w-28 border-r border-b border-gray-300 p-2 justify-center items-center"><Text className="font-bold">{day}</Text></View>)}
            </View>
            {LECTURE_SLOTS.map(time => (
              <View key={time} className="flex-row h-16">
                <View className="w-20 border-r border-b border-gray-200 p-1 justify-center items-center"><Text className="text-xs font-semibold">{time}</Text></View>
                {DAYS.map(day => (
                  <View key={`${day}-${time}`} className="w-28">
                    {renderCell(day, time)}
                  </View>
                ))}
              </View>
            ))}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

export default TimetableScreen;