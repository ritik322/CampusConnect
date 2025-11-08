import  { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, SafeAreaView, ActivityIndicator, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import axios from 'axios';
import auth from '@react-native-firebase/auth';
import Toast from 'react-native-toast-message';
import DropDownPicker from 'react-native-dropdown-picker';
import API_URL from '../../../config/apiConfig';

const EditNoticeScreen = ({ route, navigation }) => {
    const { notice } = route.params;

    const [title, setTitle] = useState(notice.title);
    const [content, setContent] = useState(notice.content);
    const [loading, setLoading] = useState(false);

    const [open, setOpen] = useState(false);
    const [value, setValue] = useState(JSON.stringify(notice.targetAudience));
    const [items, setItems] = useState([
        { label: 'Entire College', value: JSON.stringify({ type: 'GLOBAL', value: 'ALL' }) },
        { label: 'Computer Science (CSE)', value: JSON.stringify({ type: 'DEPARTMENT', value: 'cse' }) },
        { label: 'Information Technology', value: JSON.stringify({ type: 'DEPARTMENT', value: 'it' }) },
        { label: 'Mechanical', value: JSON.stringify({ type: 'DEPARTMENT', value: 'me' }) },
        { label: 'Civil', value: JSON.stringify({ type: 'DEPARTMENT', value: 'ce' }) },
        { label: 'Electrical', value: JSON.stringify({ type: 'DEPARTMENT', value: 'ee' }) },
    ]);

    const handleUpdate = async () => {
        if (!title.trim() || !content.trim() || !value) {
            Toast.show({ type: 'error', text1: 'Error', text2: 'Please fill all fields.' });
            return;
        }

        setLoading(true);
        try {
            const idToken = await auth().currentUser.getIdToken();
            const updatedNotice = {
                title: title.trim(),
                content: content.trim(),
                targetAudience: JSON.parse(value),
            };

            await axios.put(`${API_URL}/notices/${notice.id}`, updatedNotice, {
                headers: { Authorization: `Bearer ${idToken}` }
            });

            Toast.show({ type: 'success', text1: 'Success', text2: 'Notice updated successfully.' });
            navigation.goBack();
        } catch (error) {
            const errorMessage = error.response ? error.response.data.message : 'Update failed.';
            Toast.show({ type: 'error', text1: 'Update Failed', text2: errorMessage });
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
                <Text className="text-3xl font-bold text-gray-800 ml-4">Edit Notice</Text>
            </View>

            <View className="px-6">
                <Text className="text-base text-gray-600 mb-2">Title</Text>
                <TextInput
                    className="bg-white p-4 mb-4 rounded-lg border border-gray-300 text-lg text-black"
                    value={title}
                    onChangeText={setTitle}
                />

                <Text className="text-base text-gray-600 mb-2">Content</Text>
                <TextInput
                    className="bg-white p-4 rounded-lg border border-gray-300 text-lg text-black h-40"
                    multiline={true}
                    textAlignVertical="top"
                    value={content}
                    onChangeText={setContent}
                />
                
                <Text className="text-base text-gray-600 mb-2 mt-4">Target Audience</Text>
                <DropDownPicker
                    open={open}
                    value={value}
                    items={items}
                    setOpen={setOpen}
                    setValue={setValue}
                    setItems={setItems}
                    style={{
                        borderColor: '#D1D5DB',
                        marginBottom: 16
                    }}
                    dropDownContainerStyle={{
                        borderColor: '#D1D5DB'
                    }}
                />

                <TouchableOpacity
                    className="bg-blue-600 p-4 rounded-lg items-center shadow mt-8"
                    onPress={handleUpdate}
                    disabled={loading}
                >
                    {loading ? <ActivityIndicator color="white" /> : <Text className="text-white text-lg font-bold">Save Changes</Text>}
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};


export default EditNoticeScreen;