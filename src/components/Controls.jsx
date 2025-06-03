// src/components/Controls.jsx
import React from 'react';
import {
  FaMicrophone,
  FaMicrophoneSlash,
  FaVideo,
  FaVideoSlash,
  FaPhoneSlash,
  FaUsers,
  FaComment,
  FaDesktop
} from 'react-icons/fa';

const Controls = ({
  isMuted,
  isVideoOff,
  isScreenSharing,
  showParticipants,
  showChat,
  toggleMute,
  toggleVideo,
  handleScreenShareToggle,
  toggleParticipants,
  toggleChat,
  leaveCall,
}) => {
  return (
    <footer className="bg-gray-800 p-4 flex justify-center items-center space-x-3 sm:space-x-4 md:space-x-6 shadow-up z-20">
      {/* Mute/Unmute Button */}
      <button
        onClick={toggleMute}
        className={`p-3 rounded-full transition duration-150 ease-in-out ${
          isMuted ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-600 hover:bg-gray-700'
        }`}
        title={isMuted ? 'Unmute' : 'Mute'}
      >
        {isMuted ? <FaMicrophoneSlash size={20} /> : <FaMicrophone size={20} />}
      </button>

      {/* Video On/Off Button */}
      <button
        onClick={toggleVideo}
        className={`p-3 rounded-full transition duration-150 ease-in-out ${
          isVideoOff ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-600 hover:bg-gray-700'
        }`}
        title={isVideoOff ? 'Turn Video On' : 'Turn Video Off'}
      >
        {isVideoOff ? <FaVideoSlash size={20} /> : <FaVideo size={20} />}
      </button>

      {/* Screen Share Button */}
      <button
        onClick={handleScreenShareToggle}
        className={`p-3 rounded-full transition duration-150 ease-in-out ${
          isScreenSharing ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-600 hover:bg-gray-700'
        }`}
        title={isScreenSharing ? 'Stop Sharing' : 'Share Screen'}
      >
        <FaDesktop size={20} />
      </button>

      {/* Participants Button */}
      <button
        onClick={toggleParticipants}
        className={`p-3 rounded-full transition duration-150 ease-in-out ${
          showParticipants ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-gray-600 hover:bg-gray-700'
        }`}
        title={showParticipants ? 'Hide Participants' : 'Show Participants'}
      >
        <FaUsers size={20} />
      </button>

      {/* Chat Button */}
      <button
        onClick={toggleChat}
        className={`p-3 rounded-full transition duration-150 ease-in-out ${
          showChat ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-gray-600 hover:bg-gray-700'
        }`}
        title={showChat ? 'Hide Chat' : 'Show Chat'}
      >
        <FaComment size={20} />
      </button>

      {/* Leave Call Button */}
      <button
        onClick={leaveCall}
        className="p-3 px-4 md:px-6 rounded-full bg-red-600 hover:bg-red-700 transition duration-150 ease-in-out flex items-center"
        title="Leave Call"
      >
        <FaPhoneSlash size={20} className="mr-0 md:mr-2" />
        <span className="hidden md:inline">Leave</span>
      </button>
    </footer>
  );
};

export default Controls;