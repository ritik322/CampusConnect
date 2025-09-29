import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, RefreshControl, Alert, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import auth from '@react-native-firebase/auth';
import axios from 'axios';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import API_URL from '../../config/apiConfig';
import { useAuth } from '../../context/AuthContext';

const { width } = Dimensions.get('window');

const TimetableHeader = () => (
    <View className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-6 rounded-b-3xl">
        <View className="flex-row items-center justify-between">
            <View className="flex-1 mr-4">
                <Text className="text-black text-xl font-bold" numberOfLines={1}>My Timetable</Text>
                <Text className="text-grey-100 mt-1 text-sm" numberOfLines={1}>Weekly class schedule</Text>
            </View>
            <View className="bg-white/20 p-3 rounded-full">
                <Icon name="calendar-clock" size={20} color="#black" />
            </View>
        </View>
    </View>
);

const DaySelector = ({ days, selectedDay, onDaySelect }) => (
    <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="px-4 py-2"  // Reduced from py-3 to py-2
        contentContainerStyle={{ paddingRight: 16 }}
    >
        {days.map((day, index) => {
            const isSelected = selectedDay === day.title;
            const isToday = day.title === getCurrentDay();

            return (
                <TouchableOpacity
                    key={index}
                    onPress={() => onDaySelect(day.title)}
                    className={`mr-2 px-3 py-1.5 rounded-xl min-w-[70px] items-center ${  // Reduced from py-2 to py-1.5
                        isSelected
                            ? 'bg-blue-600 shadow-lg'
                            : isToday
                                ? 'bg-blue-50 border-2 border-blue-200'
                                : 'bg-white shadow-sm'
                        }`}
                    style={{ maxWidth: width * 0.2 }}
                >
                    <Text className={`text-xs font-semibold ${isSelected
                        ? 'text-white'
                        : isToday
                            ? 'text-blue-600'
                            : 'text-gray-600'
                        }`} numberOfLines={1}>
                        {day.title.substring(0, 3)}
                    </Text>
                    <Text className={`text-xs mt-0.5 ${  // Reduced from mt-1 to mt-0.5
                        isSelected
                            ? 'text-blue-100'
                            : isToday
                                ? 'text-blue-500'
                                : 'text-gray-400'
                        }`} numberOfLines={1}>
                        {day.data.length}
                    </Text>
                    {isToday && !isSelected && (
                        <View className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full" />
                    )}
                </TouchableOpacity>
            );
        })}
    </ScrollView>
);

const TimetableEntry = ({ item, isNext = false }) => {
    const getSubjectColor = (subject) => {
        const colors = {
            'Physics': '#EF4444',
            'Calculus': '#10B981',
            'Data Structures': '#3B82F6',
            'Chemistry': '#F59E0B',
            'Mathematics': '#8B5CF6'
        };

        for (const key in colors) {
            if (subject.includes(key)) return colors[key];
        }
        return '#6B7280';
    };

    const subjectColor = getSubjectColor(item.subjectName);

    return (
        <View
            className={`bg-white p-4 rounded-xl shadow-sm mb-3 mx-4 ${isNext ? 'border-2 border-blue-500' : ''}`}
            style={{ maxWidth: width - 32 }}
        >
            {isNext && (
                <View className="absolute -top-2 left-3 bg-blue-500 px-2 py-1 rounded-full">
                    <Text className="text-white text-xs font-semibold">NEXT</Text>
                </View>
            )}

            <View className="flex-row items-start">
                <View className="mr-3 items-center" style={{ width: 60 }}>
                    <View
                        className="w-10 h-10 rounded-xl items-center justify-center"
                        style={{ backgroundColor: `${subjectColor}15` }}
                    >
                        <Icon name="book-open-variant" size={18} color={subjectColor} />
                    </View>
                    <View className="mt-2 items-center">
                        <Text className="text-xs font-bold text-gray-800" numberOfLines={1}>
                            {item.startTime}
                        </Text>
                        <View className="w-px h-3 bg-gray-300 my-1" />
                        <Text className="text-xs text-gray-500" numberOfLines={1}>
                            {item.endTime}
                        </Text>
                    </View>
                </View>

                <View className="flex-1" style={{ minWidth: 0 }}>
                    <Text className="text-base font-bold text-gray-800 mb-2" numberOfLines={2}>
                        {item.subjectName}
                    </Text>

                    <View className="space-y-1">
                        <View className="flex-row items-center">
                            <Icon name="account-tie" size={14} color="#6B7280" />
                            <Text className="text-gray-600 ml-2 flex-1 text-sm" numberOfLines={1}>
                                {item.facultyName}
                            </Text>
                        </View>

                        <View className="flex-row items-center">
                            <Icon name="map-marker" size={14} color="#6B7280" />
                            <Text className="text-gray-600 ml-2 flex-1 text-sm" numberOfLines={1}>
                                {item.location}
                            </Text>
                        </View>

                        <View className="flex-row items-center">
                            <Icon name="clock-outline" size={14} color="#6B7280" />
                            <Text className="text-gray-600 ml-2 flex-1 text-sm" numberOfLines={1}>
                                {calculateDuration(item.startTime, item.endTime)}
                            </Text>
                        </View>
                    </View>

                    <TouchableOpacity className="mt-3 bg-gray-50 py-2 px-3 rounded-lg self-start">
                        <Text className="text-gray-700 text-xs font-medium">Details</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

const EmptyState = ({ day }) => (
    <View className="flex-1 items-center justify-center px-6 py-12" style={{ minHeight: 300 }}>
        <View className="bg-gray-100 p-4 rounded-full mb-4">
            <Icon name="calendar-remove" size={40} color="#9CA3AF" />
        </View>
        <Text className="text-lg font-semibold text-gray-600 mb-2 text-center">No Classes Today</Text>
        <Text className="text-gray-400 text-center text-sm px-4">
            {day === getCurrentDay()
                ? "Enjoy your free day! 🎉"
                : `No classes scheduled for ${day}`
            }
        </Text>
    </View>
);

const LoadingState = () => (
    <View className="px-4 py-4">
        {[1, 2, 3].map(i => (
            <View key={i} className="bg-white p-4 rounded-xl shadow-sm mb-3 animate-pulse">
                <View className="flex-row">
                    <View className="w-10 h-10 bg-gray-200 rounded-xl mr-3" />
                    <View className="flex-1">
                        <View className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                        <View className="h-3 bg-gray-200 rounded w-1/2 mb-2" />
                        <View className="h-3 bg-gray-200 rounded w-2/3" />
                    </View>
                </View>
            </View>
        ))}
    </View>
);

// Helper functions
const getCurrentDay = () => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[new Date().getDay()];
};

const calculateDuration = (startTime, endTime) => {
    const timeToMinutes = (timeStr) => {
        const [time, period] = timeStr.split(' ');
        let [hours, minutes] = time.split(':').map(Number);
        if (period === 'PM' && hours !== 12) hours += 12;
        if (period === 'AM' && hours === 12) hours = 0;
        return hours * 60 + minutes;
    };

    const startMinutes = timeToMinutes(startTime);
    const endMinutes = timeToMinutes(endTime);
    const durationMinutes = endMinutes - startMinutes;

    if (durationMinutes >= 60) {
        const hours = Math.floor(durationMinutes / 60);
        const minutes = durationMinutes % 60;
        if (minutes === 0) {
            return `${hours}h`;
        } else {
            return `${hours}h ${minutes}m`;
        }
    } else {
        return `${durationMinutes}m`;
    }
};

const getNextClass = (timetable) => {
    const now = new Date();
    const today = getCurrentDay();
    const currentTime = now.getHours() * 60 + now.getMinutes();

    const timeToMinutes = (timeStr) => {
        const [time, period] = timeStr.split(' ');
        let [hours, minutes] = time.split(':').map(Number);
        if (period === 'PM' && hours !== 12) hours += 12;
        if (period === 'AM' && hours === 12) hours = 0;
        return hours * 60 + minutes;
    };

    const todayClasses = timetable.find(day => day.title === today);

    if (todayClasses && todayClasses.data) {
        const sortedClasses = todayClasses.data
            .map(classItem => ({
                ...classItem,
                timeInMinutes: timeToMinutes(classItem.startTime)
            }))
            .sort((a, b) => a.timeInMinutes - b.timeInMinutes);

        for (const classItem of sortedClasses) {
            if (classItem.timeInMinutes > currentTime) {
                return classItem;
            }
        }
    }

    const tomorrow = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][(now.getDay() + 1) % 7];
    const tomorrowClasses = timetable.find(day => day.title === tomorrow);

    if (tomorrowClasses && tomorrowClasses.data && tomorrowClasses.data.length > 0) {
        const sortedTomorrowClasses = tomorrowClasses.data
            .map(classItem => ({
                ...classItem,
                timeInMinutes: timeToMinutes(classItem.startTime)
            }))
            .sort((a, b) => a.timeInMinutes - b.timeInMinutes);

        return sortedTomorrowClasses[0];
    }

    return null;
};

const convertScheduleToTimetableData = (schedule) => {
    const timetableData = [];

    const timeSlots = [
        '08:30 AM', '09:30 AM', '10:30 AM', '11:30 AM',
        '12:30 PM', '01:30 PM', '02:30 PM', '03:30 PM'
    ];

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

    const getEndTime = (startTime) => {
        const [time, period] = startTime.split(' ');
        let [hours, minutes] = time.split(':').map(Number);

        if (period === 'PM' && hours !== 12) hours += 12;
        if (period === 'AM' && hours === 12) hours = 0;

        hours += 1;

        const newPeriod = hours >= 12 ? 'PM' : 'AM';
        const displayHours = hours > 12 ? hours - 12 : (hours === 0 ? 12 : hours);

        return `${displayHours}:${minutes.toString().padStart(2, '0')} ${newPeriod}`;
    };

    Object.keys(schedule).forEach(slotKey => {
        const [day, startTime] = slotKey.split('-');
        const classData = schedule[slotKey];

        if (days.includes(day) && timeSlots.includes(startTime)) {
            timetableData.push({
                day: day,
                startTime: startTime,
                endTime: getEndTime(startTime),
                subjectName: classData.subjectCode || 'Unknown Subject',
                facultyName: classData.facultyName || 'Unknown Faculty',
                location: `Room ${classData.roomNumber || 'TBA'}`
            });
        }
    });

    return timetableData;
};

const TimetableScreen = () => {
    const { userProfile } = useAuth();
    const [timetable, setTimetable] = useState([]);
    const [selectedDay, setSelectedDay] = useState(getCurrentDay());
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(true);

    const fetchTimetable = async () => {
        setLoading(true);
        try {
            const token = await auth().currentUser.getIdToken();
            const response = await axios.get(`${API_URL}/timetable`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data && response.data.schedule) {
                const formattedData = convertScheduleToTimetableData(response.data.schedule);
                setTimetable(formatDataForSectionList(formattedData));
            } else {
                setTimetable([]);
            }
        } catch (error) {
            console.error("Failed to fetch timetable:", error);
            Alert.alert('Error', 'Could not load your timetable. Please try again.');
            setTimetable([]);
        } finally {
            setLoading(false);
        }
    };

    const formatDataForSectionList = (data) => {
        const groupedByDay = data.reduce((acc, item) => {
            (acc[item.day] = acc[item.day] || []).push(item);
            return acc;
        }, {});

        const daysOrder = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

        return daysOrder
            .map(day => ({
                title: day,
                data: groupedByDay[day] ? groupedByDay[day].sort((a, b) => a.startTime.localeCompare(b.startTime)) : []
            }))
            .filter(day => day.data.length > 0);
    };

    useEffect(() => {
        fetchTimetable();
    }, [userProfile]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchTimetable().finally(() => setRefreshing(false));
    };

    const selectedDayData = timetable.find(day => day.title === selectedDay);
    const nextClass = getNextClass(timetable);

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <TimetableHeader />

            {!loading && timetable.length > 0 && (
                <DaySelector
                    days={timetable}
                    selectedDay={selectedDay}
                    onDaySelect={setSelectedDay}
                />
            )}

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
                className="flex-1"
            >
                {loading ? (
                    <LoadingState />
                ) : timetable.length === 0 ? (
                    <EmptyState day="today" />
                ) : selectedDayData && selectedDayData.data.length > 0 ? (
                    <View className="py-3">
                        {selectedDayData.data.map((item, index) => (
                            <TimetableEntry
                                key={index}
                                item={item}
                                isNext={selectedDay === getCurrentDay() && index === 0}
                            />
                        ))}
                    </View>
                ) : (
                    <EmptyState day={selectedDay} />
                )}

                <View className="h-4" />
            </ScrollView>
        </SafeAreaView>
    );
};

export default TimetableScreen;