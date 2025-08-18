import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';

import LoginScreen from '../screens/auth/LoginScreen';
import AdminDashboardScreen from '../screens/admin/AdminDashboardScreen';
import StudentDashboardScreen from '../screens/student/StudentDashboardScreen';
import FacultyDashboardScreen from '../screens/faculty/FacultyDashboardScreen';
import LoadingScreen from '../screens/common/LoadingScreen';
import UserManagementScreen from '../screens/admin/UserManagementScreen';
import AddUserScreen from '../screens/admin/AddUserScreen';
import EditUserScreen from '../screens/admin/EditUserScreen';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  const { user, userProfile } = useAuth();

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user == null ? (
          <Stack.Screen name="Login" component={LoginScreen} />
        ) : (
          userProfile == null ? (
            <Stack.Screen name="Loading" component={LoadingScreen} />
          ) : (
            <>
              {userProfile.role === 'admin' &&  (
                <>
                  <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} />
                  <Stack.Screen name="UserManagement" component={UserManagementScreen} /> 
                  <Stack.Screen name="AddUser" component={AddUserScreen} />
                  <Stack.Screen name="EditUser" component={EditUserScreen} />
                </>
              )}
              {userProfile.role === 'student' && <Stack.Screen name="StudentDashboard" component={StudentDashboardScreen} />}
              {userProfile.role === 'faculty' && <Stack.Screen name="FacultyDashboard" component={FacultyDashboardScreen} />}
            </>
          )
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;