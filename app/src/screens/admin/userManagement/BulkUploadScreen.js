import React, { useState } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, ActivityIndicator, StyleSheet, Platform, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { pick, types } from '@react-native-documents/picker';
import axios from 'axios';
import auth from '@react-native-firebase/auth';
import API_URL from '../../../config/apiConfig';
import Toast from 'react-native-toast-message';
import RNFS from 'react-native-fs';
import Share from 'react-native-share';

const BulkUploadScreen = ({ navigation }) => {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);

    const csvTemplate = "displayName,email,password,role,rollNumber,batch,department,isHosteller,username\nJohn Doe,john.doe@example.com,password123,student,2101234,2022-2026,cse,true,\nJane Smith,jane.smith@example.com,password123,faculty,,,,it,jane_smith_username";

    const handleDownloadTemplate = async () => {
        try {
            const fileName = 'user_template.csv';
            const path = `${RNFS.CachesDirectoryPath}/${fileName}`;
            
            await RNFS.writeFile(path, csvTemplate, 'utf8');
            
            await Share.open({
                url: `file://${path}`,
                type: 'text/csv',
                filename: fileName,
                saveToFiles: true,
            });
            
        } catch (error) {
            if (error.message !== 'User did not share') {
                console.error("Failed to share template:", error);
                Toast.show({ 
                    type: 'error', 
                    text1: 'Download Failed',
                    text2: 'Could not share the template file.' 
                });
            }
        }
    };

    const handleFilePick = async () => {
        try {
            const res = await pick({
                type: [types.csv, types.xlsx],
            });
            setSelectedFile(res[0]);
            setResult(null); 
        } catch (err) {
            console.log(err)
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            Toast.show({ type: 'error', text2: 'Please select a CSV file first.' });
            return;
        }
        setLoading(true);
        setResult(null);

        try {
            const idToken = await auth().currentUser.getIdToken();
            const formData = new FormData();
            formData.append('file', {
                uri: selectedFile.uri,
                type: selectedFile.type,
                name: selectedFile.name,
            });

            const response = await axios.post(`${API_URL}/users/bulk-upload`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${idToken}`,
                },
            });
            setResult(response.data);
            Toast.show({ type: 'success', text1: 'Upload Complete', text2: response.data.message });
        } catch (error) {
            const errorMessage = error.response ? error.response.data.message : 'An error occurred during upload.';
            Toast.show({ type: 'error', text1: 'Upload Failed', text2: errorMessage });
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
                <Text className="text-3xl font-bold text-gray-800 text-center">Bulk User Upload</Text>
            </View>
            
           
             <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}>
                <View style={styles.instructionsContainer}>
                    <Text style={styles.instructionsHeader}>CSV/XLSX Template Rules</Text>
                    <Text style={styles.instructionsText}>You can upload either a CSV or an Excel (XLSX) file.</Text>
                    <Text style={styles.instructionsText}><Text className="font-bold">Required for ALL roles:</Text> `displayName`, `email`, `password`, `role`.</Text>
                    <Text style={styles.instructionsText}><Text className="font-bold">If role is 'student':</Text> You must also provide `rollNumber`, `batch`, and `department`.</Text>
                    <Text style={styles.instructionsText}><Text className="font-bold">If role is 'faculty':</Text> You must also provide `username` and `department`.</Text>
                </View>

                <TouchableOpacity onPress={handleDownloadTemplate} className="bg-gray-200 p-4 mt-4 rounded-lg flex-row items-center justify-center">
                    <Icon name="download" size={20} color="#4A5568" />
                    <Text className="text-lg text-gray-800 font-semibold ml-2">Download Template</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={handleFilePick} className="bg-white p-4 mt-4 rounded-lg border border-gray-300 flex-row items-center justify-center">
                    <Icon name="upload" size={20} color="#4A5568" />
                    <Text className="text-lg text-gray-800 font-semibold ml-2" numberOfLines={1}>
                        {selectedFile ? selectedFile.name : 'Select CSV/XLSX File'}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    className="bg-blue-600 p-4 rounded-lg items-center shadow mt-8"
                    onPress={handleUpload}
                    disabled={loading}
                >
                    {loading ? <ActivityIndicator color="white" /> : <Text className="text-white text-lg font-bold">Upload and Create Users</Text>}
                </TouchableOpacity>

                {result && (
                    <View className="mt-8 bg-green-50 p-4 rounded-lg">
                        <Text className="text-lg font-bold text-green-800 mb-2">Upload Results</Text>
                        <Text className="text-base text-green-700">Successfully Created: {result.successCount}</Text>
                        <Text className="text-base text-red-700">Failed: {result.failureCount}</Text>
                        {result.errors && result.errors.length > 0 && (
                            <Text className="text-base font-bold text-red-800 mt-2">Error Details:</Text>
                        )}
                        {result.errors.map((err, index) => (
                            <Text key={index} className="text-sm text-red-700">- Row {err.row}: {err.error}</Text>
                        ))}
                    </View>
                )}
             </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    instructionsContainer: {
        backgroundColor: '#E0E7FF',
        padding: 16,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#C7D2FE',
    },
    instructionsHeader: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#3730A3',
        marginBottom: 8,
    },
    instructionsText: {
        fontSize: 14,
        color: '#4338CA',
        marginBottom: 4,
    },
});

export default BulkUploadScreen;