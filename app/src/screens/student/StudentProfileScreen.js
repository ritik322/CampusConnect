import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import auth from '@react-native-firebase/auth';
import { useAuth } from '../../context/AuthContext';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const { width } = Dimensions.get('window');

const ProfileHeader = ({ userProfile }) => (
  <View className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-6 rounded-b-3xl">
    <View className="items-center">
      <View className="w-20 h-20 bg-black/20 rounded-full justify-center items-center mb-3 border-3 border-white/30">
        <Text className="text-3xl font-bold text-white">
          {userProfile?.displayName?.charAt(0)?.toUpperCase() || 'S'}
        </Text>
      </View>
      <Text className="text-black text-lg font-bold text-center" numberOfLines={2}>
        {userProfile?.displayName || 'Student Name'}
      </Text>
      <Text className="text-black-100 mt-1 text-center text-sm" numberOfLines={1}>
        {userProfile?.email}
      </Text>
      
      <View className="flex-row mt-3 space-x-2">
        <View className="bg-white/20 px-3 py-1 rounded-full">
          <Text className="text-white text-xs font-medium" numberOfLines={1}>
            {userProfile?.department || 'Department'}
          </Text>
        </View>
        <View className="bg-white/20 px-3 py-1 rounded-full">
          <Text className="text-white text-xs font-medium" numberOfLines={1}>
            {userProfile?.academicInfo?.year || 'Year'} Year
          </Text>
        </View>
      </View>
    </View>
  </View>
);

const InfoCard = ({ icon, title, value, onPress, iconColor = "#2563EB", showArrow = false }) => (
  <TouchableOpacity 
    onPress={onPress}
    disabled={!onPress}
    className="bg-white p-3 rounded-xl shadow-sm mb-3 flex-row items-center"
    style={{ maxWidth: width - 32 }}
  >
    <View 
      className="w-10 h-10 rounded-xl items-center justify-center mr-3" 
      style={{ backgroundColor: `${iconColor}15` }}
    >
      <Icon name={icon} size={20} color={iconColor} />
    </View>
    <View className="flex-1" style={{ minWidth: 0 }}>
      <Text className="text-xs text-gray-500 mb-1" numberOfLines={1}>
        {title}
      </Text>
      <Text className="text-sm font-semibold text-gray-800" numberOfLines={2}>
        {value || 'Not Available'}
      </Text>
    </View>
    {showArrow && (
      <Icon name="chevron-right" size={16} color="#9CA3AF" />
    )}
  </TouchableOpacity>
);

const StatsCard = ({ icon, title, value, color = "#2563EB" }) => {
  const cardWidth = (width - 48) / 3 - 4;
  
  return (
    <View 
      className="bg-white p-3 rounded-xl shadow-sm"
      style={{ width: cardWidth, minHeight: 85 }}
    >
      <View className="items-center">
        <View 
          className="w-8 h-8 rounded-lg items-center justify-center mb-2" 
          style={{ backgroundColor: `${color}15` }}
        >
          <Icon name={icon} size={16} color={color} />
        </View>
        <Text className="text-lg font-bold text-gray-800" numberOfLines={1}>
          {value}
        </Text>
        <Text className="text-gray-500 text-xs text-center" numberOfLines={2}>
          {title}
        </Text>
      </View>
    </View>
  );
};

const ProfileSection = ({ title, children, icon }) => (
  <View className="px-4 mb-4">
    <View className="flex-row items-center mb-3">
      {icon && <Icon name={icon} size={18} color="#374151" style={{ marginRight: 8 }} />}
      <Text className="text-base font-bold text-gray-800" numberOfLines={1}>
        {title}
      </Text>
    </View>
    {children}
  </View>
);

const ActionCard = ({ icon, title, subtitle, onPress, color = "#2563EB", bgColor }) => (
  <TouchableOpacity 
    onPress={onPress}
    className={`${bgColor || 'bg-white'} p-3 rounded-xl shadow-sm mb-3 flex-row items-center`}
    style={{ maxWidth: width - 32 }}
  >
    <View 
      className="w-10 h-10 rounded-xl items-center justify-center mr-3" 
      style={{ backgroundColor: `${color}15` }}
    >
      <Icon name={icon} size={20} color={color} />
    </View>
    <View className="flex-1" style={{ minWidth: 0 }}>
      <Text className="text-sm font-semibold text-gray-800" numberOfLines={1}>
        {title}
      </Text>
      {subtitle && (
        <Text className="text-xs text-gray-500 mt-1" numberOfLines={2}>
          {subtitle}
        </Text>
      )}
    </View>
    <Icon name="chevron-right" size={16} color="#9CA3AF" />
  </TouchableOpacity>
);

const StudentProfileScreen = ({ navigation }) => {
  const { userProfile } = useAuth();
  const [showAllDetails, setShowAllDetails] = useState(false);

  const handleLogout = async () => {
    Alert.alert(
      'Confirm Logout',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await auth().signOut();
            } catch (error) {
              Alert.alert('Error', 'Failed to log out.');
            }
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView showsVerticalScrollIndicator={false}>
        <ProfileHeader userProfile={userProfile} />

        <View className="px-4 py-4 -mt-4">
          <View className="flex-row justify-between">
            <StatsCard 
              icon="calendar-today" 
              title="Current Semester" 
              value={userProfile?.academicInfo?.semester || 'N/A'} 
              color="#10B981" 
            />
            <StatsCard 
              icon="percent" 
              title="Attendance" 
              value="92%" 
              color="#F59E0B" 
            />
            <StatsCard 
              icon="trophy" 
              title="CGPA" 
              value="8.5" 
              color="#8B5CF6" 
            />
          </View>
        </View>

        <ProfileSection title="Academic Details" icon="school">
          <InfoCard 
            icon="account-school" 
            title="Student ID" 
            value={userProfile?.username} 
            iconColor="#3B82F6"
          />
          <InfoCard 
            icon="domain" 
            title="Department" 
            value={userProfile?.department} 
            iconColor="#10B981"
          />
          <InfoCard 
            icon="calendar-account" 
            title="Academic Year" 
            value={userProfile?.academicInfo?.year} 
            iconColor="#F59E0B"
          />
          {userProfile?.academicInfo?.rollNumber && (
            <InfoCard 
              icon="numeric" 
              title="Roll Number" 
              value={userProfile.academicInfo.rollNumber} 
              iconColor="#8B5CF6"
            />
          )}
        </ProfileSection>

        <ProfileSection title="Personal Information" icon="account">
          <InfoCard 
            icon="email" 
            title="Email Address" 
            value={userProfile?.email} 
            iconColor="#EF4444"
          />
          <InfoCard 
            icon="calendar-plus" 
            title="Joined" 
            value={userProfile?.createdAt ? new Date(userProfile.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'} 
            iconColor="#6B7280"
          />
        </ProfileSection>

        <ProfileSection title="Quick Actions" icon="lightning-bolt">
          {userProfile?.isHosteller && (
            <ActionCard
              icon="office-building"
              title="Hostel Information"
              subtitle="View room details and warden info"
              onPress={() => navigation.navigate('StudentHostel')}
              color="#10B981"
            />
          )}
          
          <ActionCard
            icon="information"
            title="About CampusConnect"
            subtitle="App version, features, and support"
            onPress={() => navigation.navigate('StudentAbout')}
            color="#8B5CF6"
          />
          
          <ActionCard
            icon="help-circle"
            title="Help & Support"
            subtitle="Get assistance and contact support"
            onPress={() => Alert.alert('Support', 'Please contact your institution\'s IT department for technical support.')}
            color="#F59E0B"
          />
        </ProfileSection>

        <ProfileSection title="Account" icon="cog">
          <TouchableOpacity
            className="bg-red-50 p-3 rounded-xl flex-row items-center justify-center border border-red-100"
            onPress={handleLogout}
            style={{ maxWidth: width - 32 }}
          >
            <Icon name="logout" size={18} color="#EF4444" />
            <Text className="text-red-600 text-sm font-semibold ml-2">Sign Out</Text>
          </TouchableOpacity>
        </ProfileSection>

        <View className="px-4 pb-4 items-center">
          <View 
            className="bg-gray-200 p-3 rounded-lg" 
            style={{ maxWidth: width - 32 }}
          >
            <Text className="text-xs text-gray-600 text-center font-medium">
              CampusConnect Student Portal v1.0.0{'\n'}
              © 2024 Your Institution. All rights reserved.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default StudentProfileScreen;