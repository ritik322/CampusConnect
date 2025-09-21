import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';

import LoginScreen from '../screens/auth/LoginScreen';
import LoadingScreen from '../screens/common/LoadingScreen';
import NoticeBoardScreen from '../screens/common/NoticeBoardScreen';
import NoticeDetailScreen from '../screens/common/NoticeDetailScreen';
import TimetableScreen from '../screens/common/TimetableScreen';

import AdminDashboardScreen from '../screens/admin/AdminDashboardScreen';
import StudentDashboardScreen from '../screens/student/StudentDashboardScreen';
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

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  const { user, userProfile } = useAuth();

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user == null ? (
          <Stack.Screen name="Login" component={LoginScreen} />
        ) : userProfile == null ? (
          <Stack.Screen name="Loading" component={LoadingScreen} />
        ) : (
          <>
            {userProfile.role === 'admin' && (
              <Stack.Screen
                name="AdminDashboard"
                component={AdminDashboardScreen}
              />
            )}
            {userProfile.role === 'student' && (
              <Stack.Screen
                name="StudentDashboard"
                component={StudentDashboardScreen}
              />
            )}
            {userProfile.role === 'faculty' && (
              <Stack.Screen
                name="FacultyDashboard"
                component={FacultyDashboardScreen}
              />
            )}

            <Stack.Screen name="NoticeBoard" component={NoticeBoardScreen} />
            <Stack.Screen name="NoticeDetail" component={NoticeDetailScreen} />
            <Stack.Screen name="Timetable" component={TimetableScreen} />

            {userProfile.role === 'faculty' && (
              <>
                <Stack.Screen name="Workspace" component={WorkspaceScreen} />
                <Stack.Screen name="UploadFile" component={UploadFileScreen} />
                <Stack.Screen name="EditFile" component={EditFileScreen} />
              </>
            )}

            {userProfile.role === 'admin' && (
              <>
                <Stack.Screen
                  name="TimetableHub"
                  component={TimetableHubScreen}
                />
                <Stack.Screen
                  name="UserManagement"
                  component={UserManagementScreen}
                />
                <Stack.Screen name="AddUser" component={AddUserScreen} />
                <Stack.Screen name="EditUser" component={EditUserScreen} />

                <Stack.Screen
                  name="PublishNotice"
                  component={PublishNoticeScreen}
                />
                <Stack.Screen name="EditNotice" component={EditNoticeScreen} />

                <Stack.Screen
                  name="ManageSubjects"
                  component={ManageSubjectsScreen}
                />
                <Stack.Screen name="AddSubject" component={AddSubjectScreen} />

                <Stack.Screen
                  name="ManageClassrooms"
                  component={ManageClassroomsScreen}
                />
                <Stack.Screen
                  name="AddClassroom"
                  component={AddClassroomScreen}
                />

                <Stack.Screen
                  name="ManageClasses"
                  component={ManageClassesScreen}
                />
                <Stack.Screen name="AddClass" component={AddClassScreen} />
                <Stack.Screen
                  name="AssignCurriculum"
                  component={AssignCurriculumScreen}
                />
                <Stack.Screen
                  name="GenerateTimetable"
                  component={GenerateTimetableScreen}
                />

                <Stack.Screen
                  name="ManageHostels"
                  component={ManageHostelsScreen}
                />
                <Stack.Screen name="AddHostel" component={AddHostelScreen} />
                <Stack.Screen name="HostelHub" component={HostelHubScreen} />
                <Stack.Screen
                  name="ManageHostelStudents"
                  component={ManageHostelStudentsScreen}
                />
                <Stack.Screen
                  name="AssignHostelDetail"
                  component={AssignHostelDetailScreen}
                />
              </>
            )}
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
