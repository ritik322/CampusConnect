import React, { useState, useMemo } from 'react';
import { View, Text, SafeAreaView, FlatList, TextInput, TouchableOpacity, ActivityIndicator, Modal, StyleSheet, Linking, Alert, ScrollView } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import auth from '@react-native-firebase/auth';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import API_URL from '../../../config/apiConfig';
import Toast from 'react-native-toast-message';

const FileItem = ({ item, onDelete, onEdit }) => {
    return (
        <TouchableOpacity
            className="bg-white rounded-2xl p-4 mb-4 shadow-sm"
            onPress={() => Linking.openURL(item.fileUrl)}
        >
            <View className="flex-row items-start">
                <View className="flex-1">
                    <Text className="text-lg font-bold text-gray-800" numberOfLines={1}>{item.title}</Text>
                    <Text className="text-sm text-gray-600 mt-1" numberOfLines={2}>{item.description}</Text>
                    <View className="flex-row flex-wrap mt-2">
                        {item.tags.map((tag, index) => (
                            <View key={index} className="bg-blue-100 rounded-full px-2 py-1 mr-1 mb-1">
                                <Text className="text-blue-800 text-xs">{tag}</Text>
                            </View>
                        ))}
                    </View>
                </View>
                <View>
                    <TouchableOpacity onPress={() => onEdit(item)} className="p-2">
                        <Icon name="pencil-outline" size={22} color="#4A5568" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => onDelete(item.id)} className="p-2 mt-1">
                        <Icon name="delete-outline" size={22} color="#EF4444" />
                    </TouchableOpacity>
                </View>
            </View>
        </TouchableOpacity>
    );
};

const WorkspaceScreen = () => {
    const navigation = useNavigation();
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTag, setSelectedTag] = useState(null);
    const [isModalVisible, setModalVisible] = useState(false);

    const uniqueTags = useMemo(() => {
        const allTags = files.flatMap(file => file.tags);
        return ['All', ...new Set(allTags)];
    }, [files]);

    const filteredFiles = useMemo(() => {
        return files.filter(file => {
            const matchesSearch = file.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                  file.description.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesTag = !selectedTag || selectedTag === 'All' || file.tags.includes(selectedTag);
            return matchesSearch && matchesTag;
        });
    }, [files, searchQuery, selectedTag]);

    const fetchData = async () => {
        try {
            const idToken = await auth().currentUser.getIdToken();
            const response = await axios.get(`${API_URL}/workspace/files`, {
                headers: { Authorization: `Bearer ${idToken}` },
            });
            setFiles(response.data);
        } catch (error) {
            Toast.show({ type: 'error', text2: 'Could not fetch workspace files.' });
            console.error("Error fetching workspace files:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (fileId) => {
        Alert.alert(
            "Delete File",
            "Are you sure you want to delete this file? This action cannot be undone.",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            const idToken = await auth().currentUser.getIdToken();
                            await axios.delete(`${API_URL}/workspace/files/${fileId}`, {
                                headers: { Authorization: `Bearer ${idToken}` },
                            });
                            Toast.show({ type: 'success', text2: 'File deleted successfully.' });
                            fetchData(); // Refresh the list
                        } catch (error) {
                            Toast.show({ type: 'error', text2: 'Failed to delete file.' });
                            console.error("Error deleting file:", error);
                        }
                    }
                }
            ]
        );
    };

    const handleEdit = (file) => {
        navigation.navigate('EditFile', { fileData: file });
    };

    useFocusEffect(
        React.useCallback(() => {
            setLoading(true);
            fetchData();
        }, [])
    );

    if (loading) {
        return <SafeAreaView className="flex-1 justify-center items-center bg-gray-100"><ActivityIndicator size="large" color="#2563EB" /></SafeAreaView>;
    }

    return (
        <SafeAreaView className="flex-1 bg-gray-100">
            <View className="p-6 flex-row items-center justify-between">
                <Text className="text-3xl font-bold text-gray-800">My Workspace</Text>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Icon name="close" size={28} color="#1F2937" />
                </TouchableOpacity>
            </View>

            <View className="px-6 pb-4 flex-row items-center">
                <View className="flex-1 flex-row items-center bg-white rounded-lg border border-gray-300">
                    <Icon name="magnify" size={22} color="#9CA3AF" className="ml-3" />
                    <TextInput
                        className="flex-1 p-3 text-lg text-black"
                        placeholder="Search files..."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>
                <TouchableOpacity onPress={() => setModalVisible(true)} className="ml-3 p-3 bg-white rounded-lg border border-gray-300">
                    <Icon name="filter-variant" size={22} color="#1F2937" />
                </TouchableOpacity>
            </View>

            <FlatList
                data={filteredFiles}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 100 }}
                renderItem={({ item }) => (
                    <FileItem
                        item={item}
                        onDelete={handleDelete}
                        onEdit={handleEdit}
                    />
                )}
                ListEmptyComponent={() => (
                    <View className="mt-20 items-center">
                        <Icon name="file-question-outline" size={60} color="#D1D5DB" />
                        <Text className="text-lg text-gray-500 mt-4">No files found.</Text>
                        <Text className="text-base text-gray-400 mt-1">Upload a file to get started.</Text>
                    </View>
                )}
            />

            <TouchableOpacity
                onPress={() => navigation.navigate('UploadFile')}
                className="absolute bottom-8 right-8 bg-blue-600 rounded-full p-4 shadow-lg"
            >
                <Icon name="plus" size={32} color="white" />
            </TouchableOpacity>

            <Modal
                animationType="slide"
                transparent={true}
                visible={isModalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Filter by Tag</Text>
                        <ScrollView>
                            {uniqueTags.map((tag, index) => (
                                <TouchableOpacity
                                    key={index}
                                    style={[styles.tagItem, selectedTag === tag && styles.selectedTagItem]}
                                    onPress={() => {
                                        setSelectedTag(tag);
                                        setModalVisible(false);
                                    }}
                                >
                                    <Text style={[styles.tagText, selectedTag === tag && styles.selectedTagText]}>{tag}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        width: '80%',
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 20,
        maxHeight: '60%',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 15,
        textAlign: 'center',
    },
    tagItem: {
        paddingVertical: 12,
        borderRadius: 8,
        paddingHorizontal: 10,
        marginBottom: 5,
    },
    selectedTagItem: {
        backgroundColor: '#2563EB',
    },
    tagText: {
        fontSize: 16,
        color: '#1F2937',
    },
    selectedTagText: {
        color: 'white',
        fontWeight: 'bold',
    },
});

export default WorkspaceScreen;

