import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import auth from '@react-native-firebase/auth';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import ClassListItem from '../../../components/admin/ClassListItem';
import API_URL from '../../../config/apiConfig';

const ManageClassesScreen = ({ navigation }) => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchClasses = useCallback(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const idToken = await auth().currentUser.getIdToken();
        const response = await axios.get(`${API_URL}/classes`, {
          headers: { Authorization: `Bearer ${idToken}` },
        });
        setClasses(response.data);
      } catch (error) {
        console.error('Failed to fetch classes:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  useFocusEffect(fetchClasses);

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <View className="p-6 flex-row items-center">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={28} color="#1F2937" />
        </TouchableOpacity>
        <Text className="text-3xl font-bold text-gray-800 ml-4">
          Manage Classes
        </Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#2563EB" />
      ) : (
        <FlatList
          data={classes}
          renderItem={({ item }) => (
            <ClassListItem
              item={item}
              onPress={() =>
                navigation.navigate('AssignCurriculum', { selectedClass: item })
              }
            />
          )}
          keyExtractor={item => item.id}
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 100 }}
          ListEmptyComponent={
            <Text className="text-center text-gray-500 mt-10">
              No classes found. Add one to get started.
            </Text>
          }
        />
      )}

      <TouchableOpacity
        className="absolute bottom-8 right-8 bg-blue-600 p-4 rounded-full shadow-lg"
        onPress={() => navigation.navigate('AddClass')}
      >
        <Icon name="plus" size={30} color="white" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default ManageClassesScreen;
