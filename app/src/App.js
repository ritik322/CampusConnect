import React from 'react';
import { View, Text } from 'react-native';
import AppNavigator from './navigation/AppNavigator';
import { AuthProvider } from './context/AuthContext';
import Toast from 'react-native-toast-message';

const toastConfig = {
  success: ({ text1, text2 }) => (
    <View className="w-[90%] bg-green-500 p-4 rounded-lg shadow-lg">
      <Text className="text-white font-bold text-base">{text1}</Text>
      <Text className="text-white text-sm mt-1">{text2}</Text>
    </View>
  ),
  error: ({ text1, text2 }) => (
    <View className="w-[90%] bg-red-500 p-4 rounded-lg shadow-lg">
      <Text className="text-white font-bold text-base">{text1}</Text>
      <Text className="text-white text-sm mt-1">{text2}</Text>
    </View>
  ),
};

const App = () => {
  return (
    <AuthProvider>
      <AppNavigator />
      <Toast config={toastConfig} topOffset={10} />
    </AuthProvider>
  );
};

export default App;