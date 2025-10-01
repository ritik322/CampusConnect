import React, { useState, useCallback } from 'react';
import { View, Text, SafeAreaView, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import auth from '@react-native-firebase/auth';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import NoticeCard from '../../components/common/NoticeCard';
import { useAuth } from '../../context/AuthContext';
import API_URL from '../../config/apiConfig';
import { SwipeListView } from 'react-native-swipe-list-view';
import Toast from 'react-native-toast-message';

const NoticeBoardScreen = ({ navigation }) => {
  const { userProfile } = useAuth();
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);


  const fetchNotices = useCallback(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const idToken = await auth().currentUser.getIdToken();
        const response = await axios.get(`${API_URL}/notices`, {
          headers: { Authorization: `Bearer ${idToken}` }
        });
        setNotices(response.data);
      } catch (error) {
        console.error("Failed to fetch notices:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  useFocusEffect(fetchNotices);

  const handleDelete = async (noticeId) => {
    try {
      const idToken = await auth().currentUser.getIdToken();
      await axios.delete(`${API_URL}/notices/${noticeId}`, {
        headers: { Authorization: `Bearer ${idToken}` }
      });
      Toast.show({ type: 'success', text1: 'Success', text2: 'Notice deleted.' });
      setNotices(prevNotices => prevNotices.filter(notice => notice.id !== noticeId));
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Could not delete notice.' });
    }
  };

  const confirmDelete = (noticeId) => {
    Alert.alert(
      "Delete Notice", "Are you sure you want to delete this notice?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: () => handleDelete(noticeId) }
      ]
    );
  };

  const handleEdit = (notice) => {
    navigation.navigate('EditNotice', { notice });
  };

  const renderHiddenItem = (data) => {
    const notice = data.item;
    
    const canModify = () => {
      if (userProfile.permissionLevel === 'superadmin') {
        return true;
      }
      if (notice.authorId === userProfile.uid) {
        return true;
      }
      return false;
    };

    if (!canModify()) {
      return null;
    }

    return (
      <View className="flex-1 flex-row justify-between items-center rounded-xl mb-4">
        <TouchableOpacity
          className="w-20 h-full items-center justify-center bg-blue-500 rounded-l-xl"
          onPress={() => handleEdit(data.item)}
        >
          <Icon name="pencil" size={25} color="white" />
          <Text className="text-white text-xs mt-1">Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="w-20 h-full items-center justify-center bg-red-500 rounded-r-xl"
          onPress={() => confirmDelete(data.item.id)}
        >
          <Icon name="delete" size={25} color="white" />
          <Text className="text-white text-xs mt-1">Delete</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <View className="p-6 flex-row items-center">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={28} color="#1F2937" />
        </TouchableOpacity>
        <Text className="text-3xl font-bold text-gray-800 ml-4">Notice Board</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#2563EB" />
      ) : (
        <SwipeListView
          data={notices}
          renderItem={(data) => (
            <NoticeCard 
              notice={data.item} 
              onPress={() => navigation.navigate('NoticeDetail', { notice: data.item })}
            />
          )}
          renderHiddenItem={userProfile.role === 'admin' ? renderHiddenItem : null}
          leftOpenValue={userProfile.role === 'admin' ? 80 : 0}
          rightOpenValue={userProfile.role === 'admin' ? -80 : 0}
          keyExtractor={item => item.id}
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 100 }}
          ListEmptyComponent={<Text className="text-center text-gray-500 mt-10">No notices found.</Text>}
        />
      )}

      {userProfile?.role === 'admin' && (
        <TouchableOpacity
          className="absolute bottom-8 right-8 bg-blue-600 p-4 rounded-full shadow-lg"
          onPress={() => navigation.navigate('PublishNotice')}
        >
          <Icon name="plus" size={30} color="white" />
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
};

export default NoticeBoardScreen;

