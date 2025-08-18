import React from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, ScrollView, Alert } from 'react-native';
import auth from '@react-native-firebase/auth';
import { useAuth } from '../../context/AuthContext';
import DashboardCard from '../../components/admin/DashboardCard';

const allAdminFeatures = [
  { id: '1', title: 'Manage Users', icon: 'account-group', requiredDomain: 'ALL_DEPARTMENTS' },
  { id: '2', title: 'Publish Notice', icon: 'bullhorn', requiredDomain: null },
  { id: '3', title: 'Manage Exams', icon: 'clipboard-list', requiredDomain: 'DEAN_ACADEMICS' },
  { id: '4', title: 'Manage Hostels', icon: 'office-building', requiredDomain: 'HOSTEL_WARDEN' },
  { id: '5', title: 'Manage Placements', icon: 'briefcase-account', requiredDomain: 'PLACEMENT_CELL' },
];

const AdminDashboardScreen = ({navigation}) => {
  const { userProfile } = useAuth();

  const handleLogout = async () => {
    try {
      await auth().signOut();
    } catch (error) {
      Alert.alert('Error', 'Failed to log out.');
    }
  };

  const handleCardPress = (featureTitle) => {
    if (featureTitle === 'Manage Users') {
      navigation.navigate('UserManagement');
    } else {
      Alert.alert(featureTitle, "This screen is under development.");
    }
  };

  const visibleFeatures = allAdminFeatures.filter(feature => {
    if (!feature.requiredDomain) {
      return true;
    }
    return userProfile?.adminDomain === 'ALL_DEPARTMENTS' || userProfile?.adminDomain === feature.requiredDomain;
  });

  

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <View className="p-6">
        <Text className="text-3xl font-bold text-gray-800">Welcome, {userProfile?.displayName || 'Admin'}</Text>
        <Text className="text-base text-gray-500">What would you like to do today?</Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 8 }}>
        <View className="flex-row flex-wrap justify-between">
          {visibleFeatures.map((item) => (
            <DashboardCard
              key={item.id}
              title={item.title}
              icon={item.icon}
              onPress={() => handleCardPress(item.title)}
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