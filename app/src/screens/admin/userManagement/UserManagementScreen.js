import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, SafeAreaView, ActivityIndicator, TouchableOpacity, TextInput, Alert } from 'react-native';
import axios from 'axios';
import auth from '@react-native-firebase/auth';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useFocusEffect } from '@react-navigation/native';
import { SwipeListView } from 'react-native-swipe-list-view';
import Toast from 'react-native-toast-message';
import UserListItem from '../../../components/admin/UserListItem';
import API_URL from '../../../config/apiConfig';

const UserManagementScreen = ({ navigation }) => {
  const [masterUsers, setMasterUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('');

  const fetchUsers = useCallback(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const idToken = await auth().currentUser.getIdToken();
        const response = await axios.get(`${API_URL}/users`, {
          headers: { Authorization: `Bearer ${idToken}` }
        });
        setMasterUsers(response.data);
      } catch (error) {
        console.error("Failed to fetch users:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  useFocusEffect(fetchUsers);

  useEffect(() => {
    let result = masterUsers;
    if (filter) {
      result = result.filter(user => user.role === filter);
    }
    if (search) {
      result = result.filter(user =>
        user.displayName.toLowerCase().includes(search.toLowerCase())
      );
    }
    setFilteredUsers(result);
  }, [search, filter, masterUsers]);

  const handleEdit = (user) => {
    navigation.navigate('EditUser', { user });
  };
  

  const confirmDelete = (userId) => {
    Alert.alert(
      "Delete User",
      "Are you sure you want to delete this user?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: () => handleDelete(userId) }
      ]
    );
  };

  const handleDelete = async (userId) => {
    try {
      const idToken = await auth().currentUser.getIdToken();
      await axios.delete(`${API_URL}/users/${userId}`, {
        headers: { Authorization: `Bearer ${idToken}` }
      });
      Toast.show({ type: 'success', text1: 'Success', text2: 'User deleted.' });
      setMasterUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
    } catch (error) {
      const errorMessage = error.response ? error.response.data.message : error.message;
      Toast.show({ type: 'error', text1: 'Error', text2: errorMessage });
    }
  };

  const FilterButton = ({ title, role }) => (
    <TouchableOpacity
      onPress={() => setFilter(role)}
      className={`px-4 py-2 rounded-full ${filter === role ? 'bg-blue-600' : 'bg-white'}`}
    >
      <Text className={`${filter === role ? 'text-white' : 'text-gray-600'} font-semibold`}>{title}</Text>
    </TouchableOpacity>
  );

  const renderHiddenItem = (data) => (
  <View className="flex-1 flex-row justify-between items-center rounded-2xl mb-4">
    <TouchableOpacity
      className="w-20 h-full items-center justify-center bg-blue-500 rounded-l-2xl"
      onPress={() => handleEdit(data.item)}
    >
      <Icon name="pencil" size={25} color="white" />
      <Text className="text-white text-xs mt-1">Edit</Text>
    </TouchableOpacity>
    <TouchableOpacity
      className="w-20 h-full items-center justify-center bg-red-500 rounded-r-2xl"
      onPress={() => confirmDelete(data.item.id)}
    >
      <Icon name="delete" size={25} color="white" />
      <Text className="text-white text-xs mt-1">Delete</Text>
    </TouchableOpacity>
  </View>
);

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <View className="p-6 flex-row items-center justify-between">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={28} color="#1F2937" />
        </TouchableOpacity>
        <Text className="text-3xl font-bold text-gray-800">Manage Users</Text>
        <View style={{ width: 28 }} />
      </View>

      <View className="px-6 mb-4">
        <View className="flex-row items-center bg-white rounded-lg p-2 shadow-sm">
          <Icon name="magnify" size={24} color="#9CA3AF" />
          <TextInput
            className="flex-1 ml-2 text-lg text-black"
            placeholder="Search by name..."
            placeholderTextColor="#9CA3AF"
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      <View className="px-6 mb-4 flex-row justify-around">
        <FilterButton title="All" role="" />
        <FilterButton title="Admin" role="admin" />
        <FilterButton title="Faculty" role="faculty" />
        <FilterButton title="Students" role="student" />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#2563EB" />
      ) : (
        <SwipeListView
          data={filteredUsers}
          renderItem={(data) => <UserListItem user={data.item} />}
          renderHiddenItem={renderHiddenItem}
          leftOpenValue={80}
          rightOpenValue={-80}
          keyExtractor={item => item.id}
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 100 }}
        />
      )}

      <TouchableOpacity
        className="absolute bottom-8 right-8 bg-blue-600 p-4 rounded-full shadow-lg"
        onPress={() => navigation.navigate('AddUser')}
      >
        <Icon name="plus" size={30} color="white" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default UserManagementScreen;