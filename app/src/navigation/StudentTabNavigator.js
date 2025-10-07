import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import TimetableScreen from '../screens/common/TimetableScreen';
import NoticeBoardScreen from '../screens/common/NoticeBoardScreen';
import MyCoursesScreen from '../screens/student/MyCoursesScreen';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

const Tab = createBottomTabNavigator();

const CustomHeader = ({ title }) => {
    const navigation = useNavigation();
    return (
        <SafeAreaView className="bg-white">
            <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
                <Text className="text-xl font-bold text-gray-800">{title}</Text>
                <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
                    <Icon name="account-circle-outline" size={28} color="#4B5563" />
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const StudentTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        header: () => <CustomHeader title={route.name} />,
        tabBarActiveTintColor: '#2563EB',
        tabBarInactiveTintColor: '#6B7280',
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === 'Academics') {
            iconName = 'school-outline';
          } else if (route.name === 'Timetable') {
            iconName = 'calendar-month';
          } else if (route.name === 'Notices') {
            iconName = 'newspaper-variant-multiple';
          }
          return <Icon name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Academics" component={MyCoursesScreen} />
      <Tab.Screen name="Timetable" component={TimetableScreen} />
      <Tab.Screen name="Notices" component={NoticeBoardScreen} />
    </Tab.Navigator>
  );
};

export default StudentTabNavigator;

