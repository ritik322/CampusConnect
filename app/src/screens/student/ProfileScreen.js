import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from '../../context/AuthContext';
import auth from '@react-native-firebase/auth';
import axios from 'axios';
import API_URL from '../../config/apiConfig';

const ProfileScreen = ({ navigation }) => {
    const { userProfile } = useAuth();
    const [className, setClassName] = useState('Loading...');

    useEffect(() => {
        const fetchClass = async () => {
            if (userProfile?.academicInfo?.classId) {
                try {
                    const idToken = await auth().currentUser.getIdToken();
                    const response = await axios.get(`${API_URL}/classes/${userProfile.academicInfo.classId}`, {
                        headers: { Authorization: `Bearer ${idToken}` },
                    });
                    setClassName(response.data.className || 'Unassigned');
                } catch (error) {
                    setClassName('Unassigned');
                }
            } else {
                setClassName('Unassigned');
            }
        };
        fetchClass();
    }, [userProfile]);

    const handleLogout = () => {
        auth().signOut();
    };

    const InfoRow = ({ icon, label, value }) => (
        <View className="flex-row items-center bg-white p-4 rounded-lg mb-3">
            <Icon name={icon} size={24} color="#4B5563" />
            <View className="ml-4">
                <Text className="text-xs text-gray-500">{label}</Text>
                <Text className="text-base text-gray-800 font-semibold">{value}</Text>
            </View>
        </View>
    );

    return (
        <SafeAreaView className="flex-1 bg-gray-100">
            <View className="p-6">
                 <TouchableOpacity onPress={() => navigation.goBack()} className="absolute top-6 left-6 z-10">
                    <Icon name="arrow-left" size={28} color="#1F2937" />
                </TouchableOpacity>
                <Text className="text-3xl font-bold text-gray-800 text-center">My Profile</Text>
            </View>

            <View className="px-6">
                <InfoRow icon="account-outline" label="Full Name" value={userProfile?.displayName} />
                <InfoRow icon="email-outline" label="Email" value={userProfile?.email} />
                <InfoRow icon="school-outline" label="Department" value={userProfile?.department} />
                <InfoRow icon="calendar-account-outline" label="Batch" value={userProfile?.academicInfo?.batch} />
                <InfoRow icon="pound" label="Roll Number (URN)" value={userProfile?.academicInfo?.urn} />
                <InfoRow icon="google-classroom" label="Class Section" value={className} />
            </View>

            <View className="absolute bottom-8 w-full px-6">
                <TouchableOpacity onPress={handleLogout} className="bg-red-500 p-4 rounded-lg items-center">
                    <Text className="text-white text-lg font-bold">Log Out</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

export default ProfileScreen;
