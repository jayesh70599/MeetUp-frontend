

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/authContext';
import { createNewMeeting, validateMeeting } from '../api/meetings';

function HomePage() {
  const { isAuthenticated, logout, loading } = useAuth();
  const [joinMeetingId, setJoinMeetingId] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

 const handleCreateMeeting = async () => {
    setError('');
    try {
      const data = await createNewMeeting();
      console.log('Created meeting:', data.meetingId);
      navigate(`/meeting/${data.meetingId}`); // Redirect to the new meeting room
    } catch (err) {
      setError('Failed to create a new meeting. Please try again.');
      console.error(err);
    }
  };

  const handleJoinMeeting = async (e) => {
      e.preventDefault(); // Prevent form submission if wrapped in a form
      setError('');
      if (!joinMeetingId.trim()) {
          setError('Please enter a Meeting ID.');
          return;
      }
      try {
          // Optional: Validate before joining
          await validateMeeting(joinMeetingId);
          console.log(`Joining meeting: ${joinMeetingId}`);
          navigate(`/meeting/${joinMeetingId}`); // Redirect to the meeting room
      } catch (err) {
          setError(err.msg || 'Invalid Meeting ID or failed to join.');
          console.error(err);
      }
  };

  if (loading) {
    return (
        <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
            <p className="text-xl">Loading...</p>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-6">
        <h1 className="text-5xl font-bold mb-4 text-indigo-400">Meet Up</h1>
        <p className="text-xl text-gray-300 mb-12">Simple, Fast, Effective Video Meetings.</p>

      {isAuthenticated ? (
        <div className="bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-lg text-center">
            <h2 className="text-2xl font-semibold mb-6">Welcome Back!</h2>
            <button
                onClick={handleCreateMeeting}
                className="w-full mb-4 py-3 px-6 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition duration-150 ease-in-out"
            >
                Create New Meeting
            </button>

            <div className="relative my-6">
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                    <div className="w-full border-t border-gray-600" />
                </div>
                <div className="relative flex justify-center">
                    <span className="px-2 bg-gray-800 text-sm text-gray-400">OR</span>
                </div>
            </div>

            <form onSubmit={handleJoinMeeting} className="flex flex-col sm:flex-row items-center">
                <input
                    type="text"
                    placeholder="Enter Meeting ID"
                    value={joinMeetingId}
                    onChange={(e) => setJoinMeetingId(e.target.value)}
                    className="flex-1 w-full sm:w-auto px-4 py-3 bg-gray-700 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm mb-4 sm:mb-0 sm:mr-4"
                />
                <button
                    type="submit"
                    className="w-full sm:w-auto py-3 px-6 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out"
                >
                    Join Meeting
                </button>
            </form>
            {error && <p className="text-red-500 text-sm mt-4">{error}</p>}

            <button
                onClick={logout}
                className="mt-12 text-sm text-gray-400 hover:text-red-500 transition duration-150 ease-in-out"
            >
              Logout
          </button>
        </div>
      ) : (
        <div className="bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-sm text-center">
            <h2 className="text-2xl font-semibold mb-6">Get Started</h2>
            <Link to="/login">
                <button className="w-full mb-4 py-3 px-6 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out">
                    Login
                </button>
            </Link>
            <Link to="/register">
                <button className="w-full py-3 px-6 border border-indigo-500 rounded-md shadow-sm text-lg font-medium text-indigo-400 bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out">
                    Register
                </button>
            </Link>
        </div>
      )}
    </div>
  );
}

export default HomePage;