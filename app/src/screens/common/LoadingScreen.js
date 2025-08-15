import React from 'react';
import { SafeAreaView, ActivityIndicator } from 'react-native';

const LoadingScreen = () => {
  return (
    <SafeAreaView className="flex-1 justify-center items-center">
      <ActivityIndicator size="large" color="#2563EB" />
    </SafeAreaView>
  );
};

export default LoadingScreen;