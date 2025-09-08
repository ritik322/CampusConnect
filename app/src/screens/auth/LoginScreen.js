import  { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Image,
  ImageBackground,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import auth from '@react-native-firebase/auth';
import axios from 'axios';
import Toast from 'react-native-toast-message';
import API_URL from '../../config/apiConfig';



const LoginScreen = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    const trimmedUsername = username.trim();
    const trimmedPassword = password.trim();
    if (!username || !password) {
      Toast.show({
        type: 'error',
        text1: 'Login Error',
        text2: 'Please enter both username and password.'
      });
      return;
    }

    setLoading(true);
    try {
      const emailResponse = await axios.post(`${API_URL}/auth/getEmail`, { username:trimmedUsername });
      const { email } = emailResponse.data;

      if (!email) {
        throw new Error('Could not find a user with that username.');
      }

      await auth().signInWithEmailAndPassword(email, trimmedPassword);
      
    } catch (error) {
      const errorMessage = error.response ? error.response.data.message : error.message;
      Toast.show({
        type: 'error',
        text1: 'Login Failed',
        text2: errorMessage
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground
      source={require('../../assets/images/background.png')}
      className="flex-1"
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <SafeAreaView className="flex-1 justify-center items-center bg-black/50 p-6">

          <View className="w-full max-w-sm bg-white/90 p-8 rounded-2xl shadow-lg">

            <View className="items-center mb-6">
              <Image
                source={require('../../assets/images/logo.png')}
                className="w-20 h-20 mb-2"
                resizeMode="contain"
              />
              <Text className="text-3xl font-bold text-center text-gray-800">
                CampusConnect
              </Text>
            </View>

            <View className="mb-4">
              <Text className="text-base text-gray-600 mb-2">Username</Text>
              <TextInput
                className="bg-gray-200/70 p-2 rounded-lg border border-gray-300 text-black text-lg"
                autoCapitalize="none"
                value={username}
                onChangeText={setUsername}
              />
            </View>

            <View className="mb-6">
              <Text className="text-base text-gray-600 mb-2">Password</Text>
              <TextInput
                className="bg-gray-200/70 p-2 rounded-lg border border-gray-300 text-black text-lg"
                secureTextEntry={true}
                autoCapitalize='none'
                value={password}
                onChangeText={setPassword}
              />
            </View>

            <TouchableOpacity
              className="bg-blue-600 p-4 rounded-lg items-center shadow"
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white text-lg font-bold">Login</Text>
              )}
            </TouchableOpacity>

          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
};

export default LoginScreen;