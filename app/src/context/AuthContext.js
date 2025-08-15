import React, { createContext, useState, useEffect, useContext } from 'react';
import auth from '@react-native-firebase/auth';
import axios from 'axios';

export const AuthContext = createContext();

const API_URL = 'http://192.168.59.189:3000/api'; 

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(async (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser) {
        try {
          const idToken = await firebaseUser.getIdToken();
          
          const response = await axios.post(`${API_URL}/auth/profile`, { idToken });
          
          setUserProfile(response.data.user);
        } catch (error) {
          setUserProfile(null);
        }
      } else {
        setUserProfile(null);
      }
    });
    return subscriber;
  }, []);

  return (
    <AuthContext.Provider value={{ user, userProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};