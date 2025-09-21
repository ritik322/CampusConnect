import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, TextInput, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import axios from 'axios';
import auth from '@react-native-firebase/auth';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import API_URL from '../../../config/apiConfig';
import Toast from 'react-native-toast-message';

const EditFileScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { fileData } = route.params;

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [tags, setTags] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (fileData) {
            setTitle(fileData.title);
            setDescription(fileData.description || '');
            setTags(fileData.tags.join(', '));
        }
    }, [fileData]);

    const handleSaveChanges = async () => {
        if (!title.trim()) {
            Toast.show({ type: 'error', text2: 'Title is required.' });
            return;
        }
        setLoading(true);
        try {
            const idToken = await auth().currentUser.getIdToken();
            const tagsArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag);
            const updatedData = {
                title: title.trim(),
                description: description.trim(),
                tags: tagsArray,
            };

            await axios.put(`${API_URL}/workspace/files/${fileData.id}`, updatedData, {
                headers: { Authorization: `Bearer ${idToken}` }
            });

            Toast.show({ type: 'success', text2: 'File updated successfully.' });
            navigation.goBack();
        } catch (error) {
            console.error("Update Error:", error.response ? error.response.data : error);
            Toast.show({ type: 'error', text1: 'Update Failed', text2: 'An error occurred.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-100">
            <View className="p-6 flex-row items-center">
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Icon name="arrow-left" size={28} color="#1F2937" />
                </TouchableOpacity>
                <Text className="text-3xl font-bold text-gray-800 ml-4">Edit File</Text>
            </View>

            <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}>
                <Text className="text-base text-gray-600 mb-2">Title</Text>
                <TextInput className="bg-white p-4 mb-4 rounded-lg border border-gray-300 text-lg text-black" value={title} onChangeText={setTitle} />

                <Text className="text-base text-gray-600 mb-2">Description (Optional)</Text>
                <TextInput className="bg-white p-4 mb-4 rounded-lg border border-gray-300 text-lg text-black h-24" multiline textAlignVertical="top" value={description} onChangeText={setDescription} />
                
                <Text className="text-base text-gray-600 mb-2">Tags (Optional)</Text>
                <TextInput className="bg-white p-4 rounded-lg border border-gray-300 text-lg text-black mb-2" value={tags} onChangeText={setTags} />
                <Text className="text-xs text-gray-500 mb-6 ml-1">Separate tags with a comma.</Text>

                <TouchableOpacity className="bg-green-600 p-4 rounded-lg items-center shadow" onPress={handleSaveChanges} disabled={loading}>
                    {loading ? <ActivityIndicator color="white" /> : <Text className="text-white text-lg font-bold">Save Changes</Text>}
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
};

export default EditFileScreen;
