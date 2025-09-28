import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// Import the newly designed screens
import HomeScreen from '../screens/student/HomeScreen';
import TimetableScreen from '../screens/student/TimetableScreen';
import StudentClassesScreen from '../screens/student/StudentClassesScreen';
import StudentProfileScreen from '../screens/student/StudentProfileScreen';

const Tab = createBottomTabNavigator();

const TabIcon = ({ name, focused, color, size }) => (
  <View className={`items-center justify-center ${focused ? 'transform scale-110' : ''}`}>
    <Icon name={name} size={size} color={color} />
    {focused && (
      <View className="w-1 h-1 bg-blue-600 rounded-full mt-1" />
    )}
  </View>
);

const StudentTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          
          switch (route.name) {
            case 'Home':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'Timetable':
              iconName = focused ? 'calendar-clock' : 'calendar-clock-outline';
              break;
            case 'Classes':
              iconName = focused ? 'google-classroom' : 'school-outline';
              break;
            case 'Profile':
              iconName = focused ? 'account-circle' : 'account-circle-outline';
              break;
            default:
              iconName = 'help-circle-outline';
          }
          
          return <TabIcon name={iconName} focused={focused} color={color} size={size} />;
        },
        tabBarActiveTintColor: '#2563EB',
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 0,
          elevation: 20,
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: -2,
          },
          shadowOpacity: 0.1,
          shadowRadius: 10,
          height: Platform.OS === 'ios' ? 85 : 65,
          paddingBottom: Platform.OS === 'ios' ? 25 : 8,
          paddingTop: 8,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 2,
        },
        tabBarItemStyle: {
          paddingVertical: 4,
        },
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
        }}
      />
      <Tab.Screen 
        name="Timetable" 
        component={TimetableScreen}
        options={{
          tabBarLabel: 'Schedule',
        }}
      />
      <Tab.Screen 
        name="Classes" 
        component={StudentClassesScreen}
        options={{
          tabBarLabel: 'Classes',
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={StudentProfileScreen}
        options={{
          tabBarLabel: 'Profile',
        }}
      />
    </Tab.Navigator>
  );
};

export default StudentTabNavigator;