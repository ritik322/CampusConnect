import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, TextInput, TouchableOpacity, ActivityIndicator, ScrollView, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import axios from 'axios';
import auth from '@react-native-firebase/auth';
import Toast from 'react-native-toast-message';
import DropDownPicker from 'react-native-dropdown-picker';
import API_URL from '../../../config/apiConfig';
import { useAuth } from '../../../context/AuthContext';

const EditFileScreen = ({ route, navigation }) => {
    const { file } = route.params;
    const { userProfile } = useAuth();
     console.log("Route params received in EditFileScreen:", JSON.stringify(route.params, null, 2));

    const [title, setTitle] = useState(file?.title);
    const [description, setDescription] = useState(file?.description);
    const [tags, setTags] = useState(file.tags ? file?.tags.join(', ') : '');
    const [loading, setLoading] = useState(false);

    const [courses, setCourses] = useState([]);
    const [open, setOpen] = useState(false);
    const [sharedWithValue, setSharedWithValue] = useState(file.sharedWith || []);

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const idToken = await auth().currentUser.getIdToken();
                const headers = { Authorization: `Bearer ${idToken}` };
                const [classesRes, subjectsRes] = await Promise.all([
                    axios.get(`${API_URL}/classes`, { headers }),
                    axios.get(`${API_URL}/subjects`, { headers })
                ]);

                const subjectsMap = new Map(subjectsRes.data.map(s => [s.id, s.subjectName]));
                const assignedCourses = [];
                classesRes.data.forEach(cls => {
                    cls.curriculum?.forEach(assign => {
                        if (assign.facultyId === userProfile.uid) {
                            assignedCourses.push({
                                label: `${subjectsMap.get(assign.subjectId) || 'Unknown'} (${cls.className})`,
                                value: cls.id,
                            });
                        }
                    });
                });
                setCourses(assignedCourses);
            } catch (error) {
                console.error("Failed to fetch courses for sharing:", error);
            }
        };
        fetchCourses();
    }, [userProfile.uid]);

    const handleUpdate = async () => {
        setLoading(true);
        try {
            const idToken = await auth().currentUser.getIdToken();
            const updatedFile = {
                title: title.trim(),
                description: description.trim(),
                tags: tags.split(',').map(t => t.trim()).filter(Boolean),
                sharedWith: sharedWithValue,
            };
            await axios.put(`${API_URL}/workspace/files/${file.id}`, updatedFile, {
                headers: { Authorization: `Bearer ${idToken}` }
            });
            Toast.show({ type: 'success', text2: 'File updated successfully.' });
            navigation.goBack();
        } catch (error) {
            Toast.show({ type: 'error', text1: 'Update Failed', text2: 'An error occurred.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-100">
            <View className="p-6">
                <TouchableOpacity onPress={() => navigation.goBack()} className="absolute top-6 left-6 z-10">
                    <Icon name="arrow-left" size={28} color="#1F2937" />
                </TouchableOpacity>
                <Text className="text-3xl font-bold text-gray-800 text-center">Edit File</Text>
            </View>

            <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}>
                <Text className="text-base text-gray-600 mb-2">Title</Text>
                <TextInput className="bg-white p-4 mb-4 rounded-lg border border-gray-300 text-lg text-black" value={title} onChangeText={setTitle} />

                <Text className="text-base text-gray-600 mb-2">Description</Text>
                <TextInput className="bg-white p-4 rounded-lg border border-gray-300 text-lg text-black h-24" multiline textAlignVertical="top" value={description} onChangeText={setDescription} />
                
                <Text className="text-base text-gray-600 mb-2 mt-4">Tags (comma-separated)</Text>
                <TextInput className="bg-white p-4 mb-4 rounded-lg border border-gray-300 text-lg text-black" value={tags} onChangeText={setTags} />

                <Text className="text-base text-gray-600 mb-2">Share with Classes</Text>
                <DropDownPicker
                    open={open}
                    value={sharedWithValue}
                    items={courses}
                    setOpen={setOpen}
                    setValue={setSharedWithValue}
                    setItems={setCourses}
                    multiple={true}
                    mode="BADGE"
                    placeholder="Select classes to share this file with..."
                    listMode="SCROLLVIEW"
                    zIndex={1000}
                    style={styles.pickerStyle}
                    dropDownContainerStyle={styles.dropdownContainerStyle}
                />

                <TouchableOpacity className="bg-blue-600 p-4 rounded-lg items-center shadow mt-8" onPress={handleUpdate} disabled={loading}>
                    {loading ? <ActivityIndicator color="white" /> : <Text className="text-white text-lg font-bold">Save Changes</Text>}
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    pickerStyle: {
        borderColor: '#D1D5DB',
        marginBottom: 16,
    },
    dropdownContainerStyle: {
        borderColor: '#D1D5DB',
    },
});

export default EditFileScreen;

