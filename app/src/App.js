import React from 'react';
import {SafeAreaView, Text, View} from 'react-native';

const App = () => {
  return (
    <SafeAreaView className="flex-1 justify-center items-center bg-gray-100">
      <View>
        <Text className="text-2xl font-bold text-blue-600">
          CampusConnect App Initialized!
        </Text>
      </View>
    </SafeAreaView>
  );
};

export default App;