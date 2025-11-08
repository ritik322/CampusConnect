import { View, Text, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const HostelListItem = ({ item, onPress }) => {
  return (
    <TouchableOpacity 
      onPress={onPress}
      className="bg-white flex-row items-center p-4 mb-4 rounded-2xl shadow-sm"
    >
      <View className="p-3 bg-yellow-100 rounded-full">
        <Icon name="office-building" size={24} color="#D97706" />
      </View>
      <View className="ml-4 flex-1">
        <Text className="text-lg font-semibold text-gray-800">{item.hostelName}</Text>
        <Text className="text-sm text-gray-500">Warden: {item.wardenName}</Text>
      </View>
      <Icon name="chevron-right" size={24} color="#9CA3AF" />
    </TouchableOpacity>
  );
};

export default HostelListItem;