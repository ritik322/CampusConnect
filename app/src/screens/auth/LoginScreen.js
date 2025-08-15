import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, SafeAreaView, Alert, ActivityIndicator } from 'react-native';
import auth from '@react-native-firebase/auth';
import axios from 'axios';

const API_URL = 'http://192.168.59.189:3000/api'; 

const LoginScreen = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert('Error', 'Please enter both username and password.');
      return;
    }

    setLoading(true);
    try {
      const emailResponse = await axios.post(`${API_URL}/auth/getEmail`, { username });
      const { email } = emailResponse.data;

      if (!email) {
        throw new Error('Could not find a user with that username.');
      }

      await auth().signInWithEmailAndPassword(email, password);
      

    } catch (error) {
      const errorMessage = error.response ? error.response.data.message : error.message;
      Alert.alert('Login Failed', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-100 justify-center p-6">
      <View className="mb-10">
        <Text className="text-4xl font-bold text-center text-blue-600">
          CampusConnect
        </Text>
      </View>

      <View className="mb-4">
        <Text className="text-lg text-gray-600 mb-2">Username</Text>
        <TextInput
          className="bg-white p-4 rounded-lg border border-gray-300"
          placeholder="superadmin"
          autoCapitalize="none"
          value={username}
          onChangeText={setUsername}
        />
      </View>

      <View className="mb-6">
        <Text className="text-lg text-gray-600 mb-2">Password</Text>
        <TextInput
          className="bg-white text-black p-4 rounded-lg border border-gray-300"
          placeholder="********"
          secureTextEntry={true}
          value={password}
          onChangeText={setPassword}
        />
      </View>

      <TouchableOpacity 
        className="bg-blue-600 p-4 rounded-lg items-center"
        onPress={handleLogin}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text className="text-white text-lg font-bold">Login</Text>
        )}
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default LoginScreen;