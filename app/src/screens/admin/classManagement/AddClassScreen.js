import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, SafeAreaView, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import axios from 'axios';
import auth from '@react-native-firebase/auth';
import Toast from 'react-native-toast-message';
import DropDownPicker from 'react-native-dropdown-picker';
import API_URL from '../../../config/apiConfig';
import { useAuth } from '../../../context/AuthContext';

const AddClassScreen = ({ navigation }) => {
    const { userProfile } = useAuth();
    const [year, setYear] = useState('');
    const [section, setSection] = useState('');
    const [loading, setLoading] = useState(false);

    const [deptOpen, setDeptOpen] = useState(false);
    const [deptValue, setDeptValue] = useState(null);
    const [deptItems, setDeptItems] = useState([
        { label: 'Computer Science (CSE)', value: 'CSE' },
        { label: 'Information Technology', value: 'IT' },
        { label: 'Mechanical', value: 'Mechanical' },
        { label: 'Civil', value: 'Civil' },
        { label: 'Electrical', value: 'Electrical' },
    ]);

    useEffect(() => {
        if (userProfile?.adminDomain !== 'ALL_DEPARTMENTS') {
            setDeptValue(userProfile.adminDomain);
        }
    }, [userProfile]);

    const handleAddClass = async () => {
        if (!year || !section || !deptValue) {
            Toast.show({ type: 'error', text1: 'Error', text2: 'Please fill all fields.' });
            return;
        }
        setLoading(true);
        try {
            const idToken = await auth().currentUser.getIdToken();
            const newClass = {
                year: year.trim(),
                section: section.trim().toUpperCase(),
                department: deptValue,
            };

            await axios.post(`${API_URL}/classes`, newClass, {
                headers: { Authorization: `Bearer ${idToken}` }
            });
            Toast.show({ type: 'success', text1: 'Success', text2: 'Class added successfully.' });
            navigation.goBack();
        } catch (error) {
            const errorMessage = error.response ? error.response.data.message : 'An error occurred.';
            Toast.show({ type: 'error', text1: 'Creation Failed', text2: errorMessage });
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
                <Text className="text-3xl font-bold text-gray-800 ml-4">Add New Class</Text>
            </View>

            <View className="px-6">
                <Text className="text-base text-gray-600 mb-2">Year</Text>
                <TextInput
                    className="bg-white p-4 mb-4 rounded-lg border border-gray-300 text-lg text-black"
                    placeholder="e.g., 4"
                    keyboardType="number-pad"
                    value={year}
                    onChangeText={setYear}
                />
                
                <Text className="text-base text-gray-600 mb-2">Section</Text>
                <TextInput
                    className="bg-white p-4 mb-4 rounded-lg border border-gray-300 text-lg text-black"
                    placeholder="e.g., A, B, C"
                    autoCapitalize="characters"
                    value={section}
                    onChangeText={setSection}
                />

                <Text className="text-base text-gray-600 mb-2">Department</Text>
                <DropDownPicker
                    open={deptOpen}
                    value={deptValue}
                    items={deptItems}
                    setOpen={setDeptOpen}
                    setValue={setDeptValue}
                    setItems={setDeptItems}
                    placeholder="Select a department..."
                    disabled={userProfile?.adminDomain !== 'ALL_DEPARTMENTS'}
                    style={{ 
                        borderColor: '#D1D5DB', 
                        marginBottom: 16,
                        backgroundColor: userProfile?.adminDomain !== 'ALL_DEPARTMENTS' ? '#E5E7EB' : '#FFFFFF'
                    }}
                    dropDownContainerStyle={{ borderColor: '#D1D5DB' }}
                />
                
                <TouchableOpacity
                    className="bg-blue-600 p-4 rounded-lg items-center shadow mt-6"
                    onPress={handleAddClass}
                    disabled={loading}
                >
                    {loading ? <ActivityIndicator color="white" /> : <Text className="text-white text-lg font-bold">Add Class</Text>}
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

export default AddClassScreen;

