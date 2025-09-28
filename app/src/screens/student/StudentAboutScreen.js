import React from 'react';
import { View, Text, ScrollView, Linking, TouchableOpacity, Alert, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from '../../context/AuthContext';

const { width } = Dimensions.get('window');

const AboutHeader = () => (
  <View className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-6 rounded-b-3xl">
    <View className="flex-row items-center justify-between">
      <View className="flex-1 mr-3">
        <Text className="text-white text-xl font-bold" numberOfLines={1}>
          About CampusConnect
        </Text>
        <Text className="text-blue-100 mt-1 text-sm" numberOfLines={1}>
          Student Portal Information
        </Text>
      </View>
      <View className="bg-white/20 p-3 rounded-full">
        <Icon name="information" size={20} color="#FFFFFF" />
      </View>
    </View>
  </View>
);

const InfoCard = ({ icon, title, value, iconColor = "#2563EB" }) => (
  <View 
    className="bg-white p-3 rounded-xl shadow-sm mb-3 flex-row items-center" 
    style={{ maxWidth: width - 32 }}
  >
    <View 
      className="w-10 h-10 rounded-lg items-center justify-center mr-3"
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
  </View>
);

const FeatureCard = ({ icon, title, description, color = "#2563EB" }) => (
  <View 
    className="bg-white p-4 rounded-xl shadow-sm mb-3" 
    style={{ maxWidth: width - 32 }}
  >
    <View className="flex-row items-start">
      <View 
        className="w-10 h-10 rounded-xl items-center justify-center mr-3"
        style={{ backgroundColor: `${color}15` }}
      >
        <Icon name={icon} size={20} color={color} />
      </View>
      <View className="flex-1" style={{ minWidth: 0 }}>
        <Text className="text-sm font-bold text-gray-800 mb-2" numberOfLines={2}>
          {title}
        </Text>
        <Text className="text-xs text-gray-600 leading-4" numberOfLines={3}>
          {description}
        </Text>
      </View>
    </View>
  </View>
);

const ActionCard = ({ icon, title, subtitle, onPress, color = "#2563EB" }) => (
  <TouchableOpacity 
    onPress={onPress}
    className="bg-white p-3 rounded-xl shadow-sm mb-3 flex-row items-center"
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

const StudentAboutScreen = ({ navigation }) => {
  const { userProfile } = useAuth();

  const handleLinkPress = (url) => {
    Linking.openURL(url).catch(() => {
      Alert.alert('Error', 'Unable to open link');
    });
  };

  const appFeatures = [
    {
      icon: 'calendar-clock',
      title: 'Smart Timetable',
      description: 'View your personalized class schedule with real-time updates and next class notifications',
      color: '#3B82F6'
    },
    {
      icon: 'newspaper-variant',
      title: 'Notice Board',
      description: 'Stay updated with latest announcements, events, and important information from your institution',
      color: '#10B981'
    },
    {
      icon: 'google-classroom',
      title: 'Class Management',
      description: 'Access detailed information about your subjects, faculty contacts, and course curriculum',
      color: '#F59E0B'
    },
    {
      icon: 'account-circle',
      title: 'Profile Management',
      description: 'Manage your personal information, academic details, and account settings',
      color: '#8B5CF6'
    },
    {
      icon: 'office-building',
      title: 'Hostel Information',
      description: 'View accommodation details, roommate information, and hostel guidelines',
      color: '#EF4444'
    }
  ];

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView showsVerticalScrollIndicator={false}>
        <AboutHeader />

        <View className="px-4 py-4 -mt-4">
          <Text className="text-base font-bold text-gray-800 mb-3">Application Details</Text>
          
          <InfoCard 
            icon="application" 
            title="App Name" 
            value="CampusConnect Student Portal" 
            iconColor="#3B82F6"
          />
          
          <InfoCard 
            icon="tag" 
            title="Version" 
            value="1.0.0" 
            iconColor="#10B981"
          />
          
          <InfoCard 
            icon="calendar" 
            title="Last Updated" 
            value="December 2024" 
            iconColor="#F59E0B"
          />
          
          <InfoCard 
            icon="account-tie" 
            title="Your Role" 
            value="Student" 
            iconColor="#8B5CF6"
          />
        </View>

        <View className="px-4 mb-4">
          <Text className="text-base font-bold text-gray-800 mb-3">App Features</Text>
          
          {appFeatures.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              color={feature.color}
            />
          ))}
        </View>

        <View className="px-4 mb-4">
          <Text className="text-base font-bold text-gray-800 mb-3">Support & Help</Text>
          
          <ActionCard
            icon="help-circle"
            title="Need Help?"
            subtitle="Get assistance and contact support"
            onPress={() => Alert.alert('Support', 'Please contact your institution\'s IT department for technical support.\n\nFor academic queries, reach out to your class coordinator or faculty members.')}
            color="#10B981"
          />
          
          <ActionCard
            icon="information"
            title="How to Use"
            subtitle="Learn about app features and navigation"
            onPress={() => Alert.alert('How to Use', '• Navigate using the bottom tabs\n• Pull down to refresh data on any screen\n• Check notices regularly for updates\n• Keep your profile information updated\n• Use the timetable to plan your day')}
            color="#3B82F6"
          />
          
          <ActionCard
            icon="bug"
            title="Report Issues"
            subtitle="Found a bug or have feedback?"
            onPress={() => Alert.alert('Report Issues', 'To report bugs or provide feedback:\n\n1. Contact your IT support team\n2. Provide detailed description of the issue\n3. Include screenshots if possible\n4. Mention your device and app version')}
            color="#F59E0B"
          />
        </View>

        <View className="px-4 mb-4">
          <Text className="text-base font-bold text-gray-800 mb-3">Institution Details</Text>
          
          <InfoCard 
            icon="domain" 
            title="Department" 
            value={userProfile?.department || 'Not Available'} 
            iconColor="#3B82F6"
          />
          
          <InfoCard 
            icon="school" 
            title="Institution" 
            value="Your Educational Institution" 
            iconColor="#10B981"
          />
          
          <InfoCard 
            icon="map-marker" 
            title="Campus" 
            value="Main Campus" 
            iconColor="#F59E0B"
          />
        </View>

        <View className="px-4 mb-4">
          <Text className="text-base font-bold text-gray-800 mb-3">Quick Actions</Text>
          
          <ActionCard
            icon="web"
            title="Institution Website"
            subtitle="Visit official website"
            onPress={() => Alert.alert('Website', 'Please visit your institution\'s official website for more information.')}
            color="#8B5CF6"
          />
          
          <ActionCard
            icon="email"
            title="Contact Administration"
            subtitle="Get in touch with admin"
            onPress={() => Alert.alert('Contact', 'For administrative queries, please contact your institution\'s student services office.')}
            color="#EF4444"
          />
        </View>

        <View className="px-4 mb-4">
          <Text className="text-base font-bold text-gray-800 mb-3">Legal & Privacy</Text>
          
          <View 
            className="bg-white p-4 rounded-xl shadow-sm" 
            style={{ maxWidth: width - 32 }}
          >
            <View className="items-center mb-3">
              <View className="bg-green-100 p-3 rounded-full">
                <Icon name="shield-check" size={24} color="#10B981" />
              </View>
            </View>
            <Text className="text-xs text-gray-600 text-center mb-3 leading-4">
              This application is designed to help students access their academic information and stay connected with their institution. Your privacy and data security are important to us.
            </Text>
            
            <View className="border-t border-gray-100 pt-3">
              <Text className="text-xs text-gray-500 text-center leading-4">
                © 2024 CampusConnect Student Portal{'\n'}
                All rights reserved.{'\n\n'}
                
                Your personal information is protected and used only for educational purposes. 
                We do not share your data with third parties without your consent.
              </Text>
            </View>
          </View>
        </View>

        <View className="px-4 pb-4">
          <View 
            className="bg-gray-200 p-3 rounded-lg" 
            style={{ maxWidth: width - 32 }}
          >
            <Text className="text-xs text-gray-600 text-center font-medium">
              CampusConnect v1.0.0{'\n'}
              Built with ❤️ for students{'\n'}
              Last updated: December 2024
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default StudentAboutScreen;