import React, { useEffect } from 'react';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import messaging from '@react-native-firebase/messaging';
import firestore from '@react-native-firebase/firestore';
import Toast from 'react-native-toast-message';

import { useAuth } from '../context/AuthContext';

// --- Screen Imports ---
import LoginScreen from '../screens/auth/LoginScreen';
import LoadingScreen from '../screens/common/LoadingScreen';
import NoticeBoardScreen from '../screens/common/NoticeBoardScreen';
import NoticeDetailScreen from '../screens/common/NoticeDetailScreen';
import TimetableScreen from '../screens/common/TimetableScreen';
import AdminDashboardScreen from '../screens/admin/AdminDashboardScreen';
import StudentTabNavigator from './StudentTabNavigator';
import StudentHostelScreen from '../screens/student/StudentHostelScreen';
import StudentAboutScreen from '../screens/student/StudentAboutScreen';
import FacultyDashboardScreen from '../screens/faculty/FacultyDashboardScreen';
import UserManagementScreen from '../screens/admin/userManagement/UserManagementScreen';
import AddUserScreen from '../screens/admin/userManagement/AddUserScreen';
import EditUserScreen from '../screens/admin/userManagement/EditUserScreen';
import PublishNoticeScreen from '../screens/admin/noticeManagement/PublishNoticeScreen';
import EditNoticeScreen from '../screens/admin/noticeManagement/EditNoticeScreen';
import ManageSubjectsScreen from '../screens/admin/subjectManagement/ManageSubjectsScreen';
import AddSubjectScreen from '../screens/admin/subjectManagement/AddSubjectScreen';
import ManageClassroomsScreen from '../screens/admin/classroomManagement/ManageClassroomsScreen';
import AddClassroomScreen from '../screens/admin/classroomManagement/AddClassroomScreen';
import ManageClassesScreen from '../screens/admin/classManagement/ManageClassesScreen';
import AddClassScreen from '../screens/admin/classManagement/AddClassScreen';
import AssignCurriculumScreen from '../screens/admin/classManagement/AssignCurriculumScreen';
import GenerateTimetableScreen from '../screens/admin/classManagement/GenerateTimetableScreen';
import TimetableHubScreen from '../screens/admin/TimetableHubScreen';
import ManageHostelsScreen from '../screens/admin/hostelManagement/ManageHostelsScreen';
import AddHostelScreen from '../screens/admin/hostelManagement/AddHostelScreen';
import HostelHubScreen from '../screens/admin/hostelManagement/HostelHubScreen';
import ManageHostelStudentsScreen from '../screens/admin/hostelManagement/ManageHostelStudentsScreen';
import AssignHostelDetailScreen from '../screens/admin/hostelManagement/AssignHostelDetailScreen';
import UploadFileScreen from '../screens/faculty/workspace/UploadFileScreen';
import WorkspaceScreen from '../screens/faculty/workspace/WorkspaceScreen';
import EditFileScreen from '../screens/faculty/workspace/EditFileScreen';
import BulkUploadScreen from '../screens/admin/userManagement/BulkUploadScreen';
import SectionAllotmentScreen from '../screens/admin/classManagement/SectionAllotmentScreen';

const Stack = createNativeStackNavigator();

// This is the main navigator for a logged-in user
const AppStack = () => {
    const { userProfile } = useAuth();
    
    let initialRouteName = "AdminDashboard"; // Default
    if (userProfile.role === 'faculty') {
        initialRouteName = "FacultyDashboard";
    } else if (userProfile.role === 'student') {
        initialRouteName = "StudentMain";
    }

    return (
        <Stack.Navigator initialRouteName={initialRouteName} screenOptions={{ headerShown: false }}>
            {/* Define ALL possible screens unconditionally */}
            <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} />
            <Stack.Screen name="FacultyDashboard" component={FacultyDashboardScreen} />
            <Stack.Screen name="StudentMain" component={StudentTabNavigator} />
            
            <Stack.Screen name="NoticeBoard" component={NoticeBoardScreen} />
            <Stack.Screen name="NoticeDetail" component={NoticeDetailScreen} />
            <Stack.Screen name="Timetable" component={TimetableScreen} />
            
            <Stack.Screen name="Workspace" component={WorkspaceScreen} />
            <Stack.Screen name="UploadFile" component={UploadFileScreen} />
            <Stack.Screen name="EditFile" component={EditFileScreen} />

            <Stack.Screen name="UserManagement" component={UserManagementScreen} />
            <Stack.Screen name="AddUser" component={AddUserScreen} />
            <Stack.Screen name="EditUser" component={EditUserScreen} />
            <Stack.Screen name="BulkUpload" component={BulkUploadScreen} />
            <Stack.Screen name="SectionAllotment" component={SectionAllotmentScreen} />
            <Stack.Screen name="PublishNotice" component={PublishNoticeScreen} />
            <Stack.Screen name="EditNotice" component={EditNoticeScreen} />
            <Stack.Screen name="ManageSubjects" component={ManageSubjectsScreen} />
            <Stack.Screen name="AddSubject" component={AddSubjectScreen} />
            <Stack.Screen name="ManageClassrooms" component={ManageClassroomsScreen} />
            <Stack.Screen name="AddClassroom" component={AddClassroomScreen} />
            <Stack.Screen name="ManageClasses" component={ManageClassesScreen} />
            <Stack.Screen name="AddClass" component={AddClassScreen} />
            <Stack.Screen name="AssignCurriculum" component={AssignCurriculumScreen} />
            <Stack.Screen name="GenerateTimetable" component={GenerateTimetableScreen} />
            <Stack.Screen name="TimetableHub" component={TimetableHubScreen} />
            <Stack.Screen name="ManageHostels" component={ManageHostelsScreen} />
            <Stack.Screen name="AddHostel" component={AddHostelScreen} />
            <Stack.Screen name="HostelHub" component={HostelHubScreen} />
            <Stack.Screen name="ManageHostelStudents" component={ManageHostelStudentsScreen} />
            <Stack.Screen name="AssignHostelDetail" component={AssignHostelDetailScreen} />

            <Stack.Screen name="StudentHostel" component={StudentHostelScreen} />
            <Stack.Screen name="StudentAbout" component={StudentAboutScreen} />
        </Stack.Navigator>
    );
};

// This component now contains the notification logic.
const NotificationHandler = () => {
    const navigation = useNavigation();
    const { userProfile } = useAuth();

    useEffect(() => {
        if (!userProfile?.uid) return;

      
        const unsubscribeOnMessage = messaging().onMessage(async remoteMessage => {
            Toast.show({
                type: 'info',
                text1: remoteMessage.notification.title,
                text2: remoteMessage.notification.body,
                visibilityTime: 5000,
                onPress: () => {
                    Toast.hide(); 
                    navigation.navigate('NoticeBoard'); 
                }
            });
        });

        const unsubscribeOnNotificationOpened = messaging().onNotificationOpenedApp(remoteMessage => {
            const noticeId = remoteMessage.data?.noticeId;
            if (noticeId) {
                navigation.navigate('NoticeBoard');
            }
        });
        
        messaging().getInitialNotification().then(remoteMessage => {
            if (remoteMessage) {
                const noticeId = remoteMessage.data?.noticeId;
                if (noticeId) {
                    navigation.navigate('NoticeBoard');
                }
            }
        });

        return () => {
            unsubscribeOnMessage();
            unsubscribeOnNotificationOpened();
        };
    }, [userProfile, navigation]);

    return null; // This component does not render anything
};


const AppNavigator = () => {
    const { user, userProfile } = useAuth();

    return (
        <NavigationContainer>
            {/* The NotificationHandler is now inside the container, so it can navigate */}
            <NotificationHandler /> 
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                {user == null ? (
                    <Stack.Screen name="Login" component={LoginScreen} />
                ) : userProfile == null ? (
                    <Stack.Screen name="Loading" component={LoadingScreen} />
                ) : (
                    <Stack.Screen name="App" component={AppStack} />
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default AppNavigator;

