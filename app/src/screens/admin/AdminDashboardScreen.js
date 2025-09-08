import React from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, ScrollView, Alert } from 'react-native';
import auth from '@react-native-firebase/auth';
import { useAuth } from '../../context/AuthContext';
import DashboardCard from '../../components/admin/DashboardCard';
import { useNavigation } from '@react-navigation/native';

const allAdminFeatures = [
  { id: '1', title: 'Manage Users', icon: 'account-group', navigateTo: 'UserManagement', requiredPermission: ['superadmin', 'hod'] },
  { id: '2', title: 'Notices', icon: 'newspaper-variant-multiple-outline', navigateTo: 'NoticeBoard', requiredPermission: ['superadmin', 'hod', 'warden'] },
  { id: '3', title: 'Timetable Management', icon: 'calendar-clock', navigateTo: 'TimetableHub', requiredPermission: ['superadmin', 'hod'] },
  { id: '4', title: 'Manage Hostels', icon: 'office-building', requiredPermission: ['superadmin', 'warden'], navigateTo: 'ManageHostels' },
];

const AdminDashboardScreen = () => {
  const { userProfile } = useAuth();
  const navigation = useNavigation();

  const handleLogout = async () => {
    try {
      await auth().signOut();
    } catch (error) {
      Alert.alert('Error', 'Failed to log out.');
    }
  };

  const handleCardPress = (feature) => {
    if (feature.navigateTo) {
      navigation.navigate(feature.navigateTo);
    } else {
      Alert.alert(feature.title, "This screen is under development.");
    }
  };

  const visibleFeatures = allAdminFeatures.filter(feature => {
    if (!feature.requiredPermission) return true;
    return feature.requiredPermission.includes(userProfile?.permissionLevel);
  });

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <View className="p-6">
        <Text className="text-3xl font-bold text-gray-800">Welcome, {userProfile?.displayName || 'Admin'}</Text>
        <Text className="text-base text-gray-500">What would you like to do today?</Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 16 }}>
        <View className="flex-row flex-wrap justify-between">
          {visibleFeatures.map((item) => (
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

export default AdminDashboardScreen;