import axios from 'axios';
import auth from '@react-native-firebase/auth';
import API_URL from '../config/apiConfig';

class StudentService {
  async getAuthHeaders() {
    const token = await auth().currentUser.getIdToken();
    return {
      headers: { Authorization: `Bearer ${token}` }
    };
  }

  async getClassInfo(classId) {
    try {
      const headers = await this.getAuthHeaders();
      const response = await axios.get(`${API_URL}/classes`, headers);
      return response.data.find(cls => cls.id === classId);
    } catch (error) {
      console.error('Error fetching class info:', error);
      throw error;
    }
  }

  async getSubjects() {
    try {
      const headers = await this.getAuthHeaders();
      const response = await axios.get(`${API_URL}/subjects`, headers);
      return response.data;
    } catch (error) {
      console.error('Error fetching subjects:', error);
      throw error;
    }
  }

  async getFaculty() {
    try {
      const headers = await this.getAuthHeaders();
      const response = await axios.get(`${API_URL}/users`, headers);
      return response.data.filter(user => user.role === 'faculty');
    } catch (error) {
      console.error('Error fetching faculty:', error);
      throw error;
    }
  }

  async getHostelInfo(studentUid) {
    try {
      const headers = await this.getAuthHeaders();
      const response = await axios.get(`${API_URL}/hostels`, headers);
      
      const studentHostel = response.data.find(hostel => 
        hostel.students?.some(student => student.uid === studentUid)
      );
      
      return studentHostel;
    } catch (error) {
      console.error('Error fetching hostel info:', error);
      throw error;
    }
  }

  async getTimetable() {
    try {
      const headers = await this.getAuthHeaders();
      const response = await axios.get(`${API_URL}/timetable/user`, headers);
      return response.data;
    } catch (error) {
      console.error('Error fetching timetable:', error);
      throw error;
    }
  }
}

export default new StudentService();