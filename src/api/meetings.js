// src/api/meetings.js
import API from './api';

// Calls the backend to create a new meeting and get its ID
export const createNewMeeting = async () => {
  try {
    const response = await API.post('/meetings/create');
    return response.data; // Should return { meetingId: '...' }
  } catch (error) {
    console.error('Error creating meeting:', error);
    throw error.response ? error.response.data : new Error('Meeting creation failed');
  }
};

// Calls the backend to validate if a meeting ID exists
export const validateMeeting = async (meetingId) => {
    try {
        const response = await API.get(`/meetings/join/${meetingId}`);
        return response.data; // Returns meeting details if valid
    } catch (error) {
        console.error('Error validating meeting:', error);
        throw error.response ? error.response.data : new Error('Meeting validation failed');
    }
};