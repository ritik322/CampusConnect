import React, { useState, useCallback } from 'react';
import { View, Text, SafeAreaView, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import auth from '@react-native-firebase/auth';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import API_URL from '../../config/apiConfig';

const MyMarksScreen = ({ navigation }) => {
    const [marks, setMarks] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                const idToken = await auth().currentUser.getIdToken();
                const headers = { Authorization: `Bearer ${idToken}` };
                const response = await axios.get(`${API_URL}/marks/my-marks`, { headers });
                setMarks(response.data);
            } catch (error) {
                console.error("Failed to fetch marks:", error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    useFocusEffect(fetchData);

    const MarkItem = ({ item }) => (
        <View className="bg-white p-4 mb-4 rounded-2xl shadow-sm">
            <View className="flex-row justify-between items-start">
                <View className="flex-1">
                    <Text className="text-lg font-semibold text-gray-800">{item.assessmentTitle}</Text>
                    <Text className="text-sm text-gray-500">{item.subjectName}</Text>
                </View>
                <View className="bg-blue-100 px-4 py-2 rounded-full">
                    <Text className="text-blue-800 font-bold text-lg">{item.marksObtained} / {item.maxMarks}</Text>
                </View>
            </View>
        </View>
    );

    return (
        <SafeAreaView className="flex-1 bg-gray-100">
            <View className="p-6 flex-row items-center">
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Icon name="arrow-left" size={28} color="#1F2937" />
                </TouchableOpacity>
                <Text className="text-3xl font-bold text-gray-800 ml-4">My Marks</Text>
            </View>

            {loading ? (
                <ActivityIndicator size="large" color="#2563EB" />
            ) : (
                <FlatList
                    data={marks}
                    renderItem={({ item, index }) => <MarkItem item={item} key={index} />}
                    keyExtractor={(item, index) => `${item.assessmentTitle}-${index}`}
                    contentContainerStyle={{ paddingHorizontal: 24 }}
                    ListEmptyComponent={
                        <Text className="text-center text-gray-500 mt-10">
                            No marks have been uploaded yet.
                        </Text>
                    }
                />
            )}
        </SafeAreaView>
    );
};

export default MyMarksScreen;
