import { View, Text, SafeAreaView, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const HostelHubScreen = ({ route, navigation }) => {
  const { hostel } = route.params;

  const menuItems = [
    { 
      title: 'Manage Students', 
      icon: 'account-group-outline', 
      navigateTo: 'ManageHostelStudents', 
      params: { hostel } 
    },
  ];

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <View className="p-6 flex-row items-center">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={28} color="#1F2937" />
        </TouchableOpacity>
        <Text className="text-3xl font-bold text-gray-800 ml-4">{hostel.hostelName}</Text>
      </View>

      <View className="p-6">
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => navigation.navigate(item.navigateTo, item.params)}
            className="bg-white flex-row items-center p-4 mb-4 rounded-2xl shadow-sm"
          >
            <Icon name={item.icon} size={30} color="#4A5568" />
            <Text className="text-lg font-semibold text-gray-700 ml-4">{item.title}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
};

export default HostelHubScreen;

