
// src/pages/MeetingRoom.jsx
import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/authContext';
import { usePeer } from '../hooks/usePeer'; // Import our new hook
import { FaMicrophone, FaMicrophoneSlash, FaVideo, FaVideoSlash, FaPhoneSlash, FaUsers, FaComment, FaPaperPlane , FaDesktop } from 'react-icons/fa';

// // --- Video Component (Keep as is or move to its own file) ---
// const Video = ({ stream, isMuted = false, label }) => {
//   const ref = useRef();
//   useEffect(() => {
//     if (stream) ref.current.srcObject = stream;
//   }, [stream]);

//   return (
//     <div className="relative bg-gray-800 rounded-lg overflow-hidden shadow-lg border-2 border-gray-700">
//       <video
//         playsInline
//         autoPlay
//         ref={ref}
//         muted={isMuted}
//         className="w-full h-full object-cover"
//       />
//       <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
//         {label}
//       </div>
//     </div>
//   );
// };

// --- Video Component (Modified) ---
// const Video = ({ stream, isMuted = false, label, audioStatus = true, videoStatus = true }) => { // Added status props
//   const ref = useRef();
//   useEffect(() => {
//     if (stream) ref.current.srcObject = stream;
//   }, [stream]);

//   return (
//     <div className="relative bg-gray-800 rounded-lg overflow-hidden shadow-lg border-2 border-gray-700">
//       {/* Hide video element if video is off */}
//       <video
//         playsInline autoPlay ref={ref} muted={isMuted}
//         className={`w-full h-full object-cover ${!videoStatus && !isMuted ? 'hidden' : ''}`} // Hide if video off (unless it's you)
//       />
//       {/* Show an avatar or black screen when video is off */}
//       {!videoStatus && !isMuted && (
//           <div className="w-full h-full bg-black flex items-center justify-center text-gray-500 text-4xl">
//               <FaVideoSlash />
//           </div>
//       )}
//       {/* Label and Mute Icon */}
//       <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded flex items-center">
//           {!audioStatus && <FaMicrophoneSlash className="text-red-500 mr-1" />}
//           <span>{label}</span>
//       </div>
//     </div>
//   );
// };

// --- Video Component (Modified for userName) ---
const Video = ({ stream, isMuted = false, label, audioStatus = true, videoStatus = true }) => {
  const ref = useRef();
  useEffect(() => {
    if (stream) ref.current.srcObject = stream;
  }, [stream]);

  return (
    <div className="relative bg-gray-800 rounded-lg overflow-hidden shadow-lg border-2 border-gray-700 h-full w-full">
      <video
        playsInline autoPlay ref={ref} muted={isMuted}
        className={`w-full h-full object-cover ${!videoStatus && !isMuted ? 'hidden' : ''}`}
      />
      {!videoStatus && !isMuted && (
        <div className="w-full h-full bg-black flex items-center justify-center text-gray-500 text-4xl">
          <FaVideoSlash />
        </div>
      )}
      <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded flex items-center">
        {!audioStatus && <FaMicrophoneSlash className="text-red-500 mr-1" />}
        <span className="truncate">{label}</span> {/* Label will now be userName */}
      </div>
    </div>
  );
};

// --- ChatMessage Component (Modified for senderName) ---
const ChatMessage = ({ msg, myPeerId, myUserName }) => { // Added myUserName
    // Use senderName from the message object, which comes from the backend
    const isMe = msg.senderPeerId === myPeerId || msg.senderName === myUserName;
    const isSystem = msg.senderId === 'System' || msg.senderName === 'System'; // Keep senderId for System for now

    return (
        <div className={`mb-2 ${isMe && !isSystem ? 'text-right' : 'text-left'}`}>
            <div
                className={`inline-block p-2 rounded-lg ${
                    isSystem ? 'bg-gray-600 text-xs italic' :
                    isMe ? 'bg-indigo-600' : 'bg-gray-700'
                }`}
            >
                {!isSystem && <div className="text-xs text-gray-400 font-bold mb-1">{msg.senderName || 'Guest'}</div>}
                <p className="text-sm">{msg.message}</p>
                {!isSystem && <div className="text-xs text-gray-500 mt-1 text-right">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>}
            </div>
        </div>
    );
};



// --- Chat Message Component ---
// const ChatMessage = ({ msg, myPeerId }) => {
//     const isMe = msg.senderPeerId === myPeerId || msg.senderId === 'System';
//     const isSystem = msg.senderId === 'System';

//     return (
//         <div className={`mb-2 ${isMe && !isSystem ? 'text-right' : 'text-left'}`}>
//             <div
//                 className={`inline-block p-2 rounded-lg ${
//                     isSystem ? 'bg-gray-600 text-xs italic' :
//                     isMe ? 'bg-indigo-600' : 'bg-gray-700'
//                 }`}
//             >
//                 {!isSystem && <div className="text-xs text-gray-400 font-bold mb-1">{msg.senderId}</div>}
//                 <p className="text-sm">{msg.message}</p>
//                 {!isSystem && <div className="text-xs text-gray-500 mt-1 text-right">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>}
//             </div>
//         </div>
//     );
// };



// --- MeetingRoom Component ---
function MeetingRoom() {
  const { meetingId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth(); // We might not need 'user' directly anymore, but good to have

  // Component-specific state (UI and local media)
  const [myStream, setMyStream] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const [showChat, setShowChat] = useState(false); // <-- State for chat panel
  const [chatInput, setChatInput] = useState(''); // <-- State for chat input
   const [isScreenSharing, setIsScreenSharing] = useState(false); 

  const myStreamRef = useRef(null); // Keep a ref to the original stream
  const cameraStreamRef = useRef(null); // Explicitly store camera stream
  const screenStreamRef = useRef(null); // Store screen stream
  const chatMessagesRef = useRef(null); // Ref for scrolling chat

  // Get the user's display name, defaulting if not available
  const myName = user?.name || 'Guest';


  // Get PeerJS/WebRTC related state and logic from our custom hook
const { myPeerId, remoteStreams, messages, sendMessage, participantsList, peerStatuses, sendStatusUpdate, replaceVideoStream } = usePeer(
      meetingId,
      myName || 'guest',
      myStream,
      !isMuted,    // Pass initial audio status (true if *not* muted)
      !isVideoOff  // Pass initial video status (true if *not* off)
  );


  // --- Effect 1: Get User Media ---
  useEffect(() => {
    console.log("MeetingRoom: Getting user media...");
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        setMyStream(stream);
        myStreamRef.current = stream; // Store in ref for cleanup
        cameraStreamRef.current = stream; // Store as the initial camera stream
        console.log('MeetingRoom: Got user media stream.');
      })
      .catch((err) => {
        console.error('MeetingRoom: Failed to get local stream:', err);
        alert('Could not access camera/microphone. Please check permissions.');
        navigate('/');
      });

    // --- Cleanup ---
    // This cleanup runs when the component unmounts (leaving the page)
    return () => {
        console.log("MeetingRoom: Cleaning up media stream.");
        if (myStreamRef.current) {
            myStreamRef.current.getTracks().forEach(track => track.stop());
        }
         if (screenStreamRef.current) {
            screenStreamRef.current.getTracks().forEach(track => track.stop());
        }
    }
  }, [navigate]); // Only run once on mount

  // --- Effect 3: Scroll Chat ---
  useEffect(() => {
    if (chatMessagesRef.current) {
        chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
    }
  }, [messages]); // Scroll whenever messages change

  // --- UI Control Functions ---
  const toggleMute = () => {
    if (myStream) {
      const audioTrack = myStream.getAudioTracks()[0];
      const newEnabledState = !audioTrack.enabled;
      audioTrack.enabled = newEnabledState;
      setIsMuted(!newEnabledState);
      sendStatusUpdate('audio', newEnabledState); // <-- Send update
    }
  };


  const toggleVideo = () => {
    if (myStream) {
      const videoTrack = myStream.getVideoTracks()[0];
      const newEnabledState = !videoTrack.enabled;
      videoTrack.enabled = newEnabledState;
      setIsVideoOff(!newEnabledState);
      sendStatusUpdate('video', newEnabledState); // <-- Send update
    }
  };

  const leaveCall = () => {
    navigate('/'); // Navigate home; the hook's cleanup will handle connections
  };

  // --- Chat Send Function ---
  const handleSendChat = (e) => {
      e.preventDefault();
      if (chatInput.trim()) {
          sendMessage(chatInput);
          setChatInput(''); // Clear input after sending
      }
  };

  // --- Screen Sharing Logic ---
  const startScreenShare = () => {
      navigator.mediaDevices.getDisplayMedia({ cursor: true })
          .then(screenStream => {
              const screenTrack = screenStream.getVideoTracks()[0];
              if (!screenTrack) return;

              setIsScreenSharing(true);
              screenStreamRef.current = screenStream; // Store the screen stream

              // Replace the video track in all connections
              replaceVideoStream(screenStream);

              // Update local display to show screen share (optional, but good for feedback)
              setMyStream(screenStream);

              // When the user stops sharing via the browser's UI
              screenTrack.onended = () => {
                  stopScreenShare(true); // Call stop, indicate it wasn't via button
              };
          })
          .catch(err => {
              console.error("Failed to get display media:", err);
              alert("Could not start screen sharing.");
          });
  };

  const stopScreenShare = (wasExternal = false) => {
      if (!isScreenSharing) return;

      // Stop the screen share tracks *if* it wasn't stopped externally
      if (!wasExternal && screenStreamRef.current) {
          screenStreamRef.current.getTracks().forEach(track => track.stop());
      }
      screenStreamRef.current = null;

      // Replace with the camera stream
      replaceVideoStream(cameraStreamRef.current);

      // Update local display back to camera
      setMyStream(cameraStreamRef.current);
      setIsScreenSharing(false);
  };

  const handleScreenShareToggle = () => {
      if (isScreenSharing) {
          stopScreenShare();
      } else {
          startScreenShare();
      }
  };

  // --- Dynamic Grid Layout Calculation ---
  // const totalVideos = Object.keys(remoteStreams).length + 1;
  // const gridColsClass =
  //   totalVideos <= 1 ? 'grid-cols-1' :
  //   totalVideos <= 2 ? 'grid-cols-2' :
  //   totalVideos <= 4 ? 'grid-cols-2' :
  //   totalVideos <= 6 ? 'grid-cols-3' :
  //   totalVideos <= 9 ? 'grid-cols-3' : 'grid-cols-4';

   const totalVideos = Object.keys(remoteStreams).length + 1;
  let gridLayoutClass = 'grid-cols-1'; // Default for 1 video
  if (totalVideos === 1) {
      gridLayoutClass = 'grid-cols-1 grid-rows-1'; // Force single cell to take height
  } else if (totalVideos <= 4) {
      gridLayoutClass = 'grid-cols-2';
  } else if (totalVideos <= 9) {
      gridLayoutClass = 'grid-cols-3';
  } else {
      gridLayoutClass = 'grid-cols-4';
  }

// return (
//     <div className="min-h-screen bg-gray-900 text-white flex flex-col">
//       {/* Header (Keep as is) */}
//       <header className="bg-gray-800 p-4 text-center text-xl font-semibold shadow-md z-20">
//            Meeting ID: <span className="font-mono bg-gray-700 px-2 py-1 rounded">{meetingId}</span>
//       </header>

//       {/* Main Content Area */}
//       <main className="flex-1 flex overflow-hidden">
//         {/* Video Grid */}
//         <section className={`flex-1 p-4 grid gap-4 overflow-auto ${gridColsClass}`}>
//           {myStream && (
//             <Video
//               stream={myStream}
//               isMuted={true}
//               label={`${myPeerId || 'Me'} (You)`}
//               audioStatus={!isMuted}  // Pass local status
//               videoStatus={!isVideoOff} // Pass local status
//             />
//           )}
//           {Object.entries(remoteStreams).map(([peerId, stream]) => (
//             <Video
//               key={peerId}
//               stream={stream}
//               label={participantsList.find(p => p.peerId === peerId)?.userId || peerId}
//               audioStatus={peerStatuses[peerId]?.audio ?? true} // Use status or default to true
//               videoStatus={peerStatuses[peerId]?.video ?? true} // Use status or default to true
//             />
//           ))}
//         </section>

//          {/* --- Side Panel (Modified) --- */}
//         {(showParticipants || showChat) && (
//             <aside className="w-72 bg-gray-800 p-4 shadow-lg overflow-hidden border-l border-gray-700 flex flex-col">
//                {/* ... (Tabs) ... */}
//                 {showParticipants && (
//                     <ul className="space-y-3 overflow-y-auto flex-1">
//                         <li className="flex items-center p-2 bg-gray-700 rounded">
//                             {isMuted ? <FaMicrophoneSlash className="mr-3 text-red-500" /> : <FaMicrophone className="mr-3 text-green-500" />}
//                             {!isVideoOff ? <FaVideo className="mr-3 text-green-500" /> : <FaVideoSlash className="mr-3 text-red-500" />}
//                             <span>{myPeerId} (You)</span>
//                         </li>
//                         {participantsList.map(p => {
//                             const status = peerStatuses[p.peerId] || { audio: true, video: true };
//                             return (
//                                <li key={p.peerId} className="flex items-center p-2">
//                                    {status.audio ? <FaMicrophone className="mr-3 text-green-500" /> : <FaMicrophoneSlash className="mr-3 text-red-500" />}
//                                    {status.video ? <FaVideo className="mr-3 text-green-500" /> : <FaVideoSlash className="mr-3 text-red-500" />}
//                                    <span className='truncate'>{p.userId || p.peerId}</span>
//                                </li>
//                             )
//                         })}
//                     </ul>
//                 )}
//                 {/* ... (Chat Panel) ... */}
//                  {showChat && (
//               <>
//                 <div ref={chatMessagesRef} className="flex-1 mb-4 overflow-y-auto p-2 bg-gray-900 rounded">
//                   {(messages || []).map((msg, index) => (
//                     <ChatMessage key={index} msg={msg} myPeerId={myPeerId} />
//                   ))}
//                 </div>
//                 <form onSubmit={handleSendChat} className="flex">
//                   <input
//                     type="text"
//                     value={chatInput}
//                     onChange={(e) => setChatInput(e.target.value)}
//                     placeholder="Type your message..."
//                     className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-l-md focus:outline-none text-sm text-white"
//                   />
//                   <button type="submit" className="py-2 px-4 bg-indigo-600 rounded-r-md">
//                     <FaPaperPlane />
//                   </button>
//                 </form>
//               </>
//             )}
//             </aside>
//         )}
//       </main>

//       {/* Footer Controls */}
//       <footer className="bg-gray-800 p-4 flex justify-center items-center space-x-4 md:space-x-6 shadow-up z-20">
//           <button onClick={toggleMute} className={`p-3 rounded-full ${isMuted ? 'bg-red-600' : 'bg-gray-600'}`}><FaMicrophoneSlash size={20} /></button>
//           <button onClick={toggleVideo} className={`p-3 rounded-full ${isVideoOff ? 'bg-red-600' : 'bg-gray-600'}`}><FaVideoSlash size={20} /></button>
//           {/* --- Screen Share Button --- */}
//           <button
//             onClick={handleScreenShareToggle}
//             className={`p-3 rounded-full transition duration-150 ease-in-out ${isScreenSharing ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-600 hover:bg-gray-700'}`}
//             title={isScreenSharing ? 'Stop Sharing' : 'Share Screen'}
//           >
//               <FaDesktop size={20} />
//           </button>
//           <button onClick={() => { setShowParticipants(!showParticipants); setShowChat(showParticipants && showChat); }} className={`p-3 rounded-full ${showParticipants ? 'bg-indigo-600' : 'bg-gray-600'}`}><FaUsers size={20} /></button>
//           <button onClick={() => { setShowChat(!showChat); setShowParticipants(showChat && showParticipants); }} className={`p-3 rounded-full ${showChat ? 'bg-indigo-600' : 'bg-gray-600'}`}><FaComment size={20} /></button>
//           <button onClick={leaveCall} className="p-3 px-6 rounded-full bg-red-600"><FaPhoneSlash size={20} /> Leave</button>
//       </footer>
//     </div>
//   );
// }

// export default MeetingRoom;

 const toggleParticipantsPanel = () => {
      setShowParticipants(prev => !prev);
      if (!showParticipants) setShowChat(false);
  };

  const toggleChatPanel = () => {
      setShowChat(prev => !prev);
      if (!showChat) setShowParticipants(false);
  };

//  return (
//     // KEY: h-screen flex flex-col to ensure bounded height
//     <div className="h-screen bg-gray-900 text-white flex flex-col">
//       {/* KEY: Header is flex-shrink-0 */}
//       <header className="bg-gray-800 p-4 text-center text-xl font-semibold shadow-md z-20 flex-shrink-0">
//         Meeting ID: <span className="font-mono bg-gray-700 px-2 py-1 rounded">{meetingId}</span>
//       </header>

//       {/* KEY: Main area is flex-1, min-h-0 (to allow shrinking), and handles its own overflow */}
//       <main className="flex-1 flex overflow-hidden min-h-0">
//         {/* Video Grid section takes available width and handles its internal scroll */}
//         <section className={`flex-1 p-4 grid gap-4 overflow-auto ${gridLayoutClass} min-h-0`}>
//           {myStream && <Video stream={myStream} isMuted={true} label={`${myPeerId || 'Me'} (You) ${isScreenSharing ? '- Sharing' : ''}`}/>}
//           {Object.entries(remoteStreams).map(([peerId, stream]) => (
//             <Video key={peerId} stream={stream} label={participantsList.find(p=>p.peerId === peerId)?.userId || peerId} />
//           ))}
//         </section>

//         {/* Side Panel for Chat/Participants */}
//         {(showParticipants || showChat) && (
//             // KEY: Side panel is flex flex-col, and overflow-hidden to clip its content
//             <aside className="w-72 bg-gray-800 p-4 shadow-lg border-l border-gray-700 flex flex-col overflow-hidden">
//                 {/* Tabs are fixed height */}
//                 <div className="flex mb-4 flex-shrink-0">
//                     <button
//                         className={`py-2 px-4 flex-1 ${showParticipants ? 'bg-gray-700 border-b-2 border-indigo-500' : 'text-gray-400'}`}
//                         onClick={toggleParticipantsPanel}
//                     >
//                         Participants ({participantsList.length + 1})
//                     </button>
//                     <button
//                         className={`py-2 px-4 flex-1 ${showChat ? 'bg-gray-700 border-b-2 border-indigo-500' : 'text-gray-400'}`}
//                         onClick={toggleChatPanel}
//                     >
//                         Chat
//                     </button>
//                 </div>

//                 {showParticipants && (
//                     // KEY: Participant list scrolls, takes remaining space, min-h-0
//                     <ul className="space-y-3 overflow-y-auto flex-1 min-h-0">
//                         <li className="flex items-center p-2 bg-gray-700 rounded">
//                             {isMuted ? <FaMicrophoneSlash className="mr-3 text-red-500" /> : <FaMicrophone className="mr-3 text-green-500" />}
//                             {!isVideoOff ? <FaVideo className="mr-3 text-green-500" /> : <FaVideoSlash className="mr-3 text-red-500" />}
//                             <span>{myPeerId} (You)</span>
//                         </li>
//                         {participantsList.map(p => {
//                             const status = peerStatuses[p.peerId] || { audio: true, video: true };
//                             return (
//                                <li key={p.peerId} className="flex items-center p-2">
//                                    {status.audio ? <FaMicrophone className="mr-3 text-green-500" /> : <FaMicrophoneSlash className="mr-3 text-red-500" />}
//                                    {status.video ? <FaVideo className="mr-3 text-green-500" /> : <FaVideoSlash className="mr-3 text-red-500" />}
//                                    <span className='truncate'>{p.userId || p.peerId}</span>
//                                </li>
//                             )
//                         })}
//                     </ul>
//                 )}

//                 {showChat && (
//                     <>
//                         {/* KEY: Chat messages area scrolls, takes remaining space, min-h-0 */}
//                         <div ref={chatMessagesRef} className="flex-1 mb-4 overflow-y-auto p-2 bg-gray-900 rounded min-h-0">
//                             {(messages || []).map((msg, index) => (
//                                 <ChatMessage key={index} msg={msg} myPeerId={myPeerId} />
//                             ))}
//                         </div>
//                         {/* Chat input is fixed height */}
//                         <form onSubmit={handleSendChat} className="flex flex-shrink-0">
//                             <input
//                                 type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)}
//                                 placeholder="Type your message..."
//                                 className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-l-md focus:outline-none text-sm text-white"
//                             />
//                             <button type="submit" className="py-2 px-4 bg-indigo-600 hover:bg-indigo-700 rounded-r-md">
//                                 <FaPaperPlane />
//                             </button>
//                         </form>
//                     </>
//                 )}
//             </aside>
//         )}
//       </main>

//       {/* KEY: Footer (Controls) is flex-shrink-0 */}
//       <footer className="bg-gray-800 p-4 flex justify-center items-center space-x-4 md:space-x-6 shadow-up z-20 flex-shrink-0">
//         <button onClick={toggleMute} className={`p-3 rounded-full ${isMuted ? 'bg-red-600' : 'bg-gray-600'}`}><FaMicrophoneSlash size={20} /></button>
//         <button onClick={toggleVideo} className={`p-3 rounded-full ${isVideoOff ? 'bg-red-600' : 'bg-gray-600'}`}><FaVideoSlash size={20} /></button>
//         <button onClick={handleScreenShareToggle} className={`p-3 rounded-full ${isScreenSharing ? 'bg-green-600' : 'bg-gray-600'}`}><FaDesktop size={20} /></button>
//         <button onClick={toggleParticipantsPanel} className={`p-3 rounded-full ${showParticipants ? 'bg-indigo-600' : 'bg-gray-600'}`}><FaUsers size={20} /></button>
//         <button onClick={toggleChatPanel} className={`p-3 rounded-full ${showChat ? 'bg-indigo-600' : 'bg-gray-600'}`}><FaComment size={20} /></button>
//         <button onClick={leaveCall} className="p-3 px-6 rounded-full bg-red-600"><FaPhoneSlash size={20} /> Leave</button>
//       </footer>
//     </div>
//   );
// }

// export default MeetingRoom;


return (
    // Revert to the layout structure from Step 28 for stability
    <div className="h-screen bg-gray-900 text-white flex flex-col">
      <header className="bg-gray-800 p-4 text-center text-xl font-semibold shadow-md z-20 flex-shrink-0">
        Meeting ID: <span className="font-mono bg-gray-700 px-2 py-1 rounded">{meetingId}</span>
      </header>

      <main className="flex-1 flex overflow-hidden min-h-0">
        <section className={`flex-1 p-4 grid gap-4 overflow-auto ${gridLayoutClass} min-h-0`}>
          {myStream && (
            <Video
              stream={myStream}
              isMuted={true}
              label={`${myName} (You)`} // Use myName
              audioStatus={!isMuted}
              videoStatus={!isVideoOff}
            />
          )}
          {Object.entries(remoteStreams).map(([peerId, stream]) => {
            const participant = participantsList.find(p => p.peerId === peerId);
            return (
              <Video
                key={peerId}
                stream={stream}
                label={participant?.userName || peerId} // Use userName from participantList
                audioStatus={peerStatuses[peerId]?.audio ?? true}
                videoStatus={peerStatuses[peerId]?.video ?? true}
              />
            );
          })}
        </section>

        {(showParticipants || showChat) && (
            <aside className="w-72 bg-gray-800 p-4 shadow-lg border-l border-gray-700 flex flex-col overflow-hidden">
                <div className="flex mb-4 flex-shrink-0">
                    {/* Tabs for Participants and Chat */}
                    <button
                        className={`py-2 px-4 flex-1 ${showParticipants ? 'bg-gray-700 border-b-2 border-indigo-500' : 'text-gray-400'}`}
                        onClick={toggleParticipantsPanel}
                    >
                        Participants ({participantsList.length + 1})
                    </button>
                    <button
                        className={`py-2 px-4 flex-1 ${showChat ? 'bg-gray-700 border-b-2 border-indigo-500' : 'text-gray-400'}`}
                        onClick={toggleChatPanel}
                    >
                        Chat
                    </button>
                </div>
                {showParticipants && (
                    <ul className="space-y-3 overflow-y-auto flex-1 min-h-0">
                        <li className="flex items-center p-2 bg-gray-700 rounded">
                            {isMuted ? <FaMicrophoneSlash className="mr-3 text-red-500" /> : <FaMicrophone className="mr-3 text-green-500" />}
                            {!isVideoOff ? <FaVideo className="mr-3 text-green-500" /> : <FaVideoSlash className="mr-3 text-red-500" />}
                            <span>{myName} (You)</span> {/* Use myName */}
                        </li>
                        {participantsList.map(p => {
                            const status = peerStatuses[p.peerId] || { audio: true, video: true };
                            return (
                               <li key={p.peerId} className="flex items-center p-2">
                                   {status.audio ? <FaMicrophone className="mr-3 text-green-500" /> : <FaMicrophoneSlash className="mr-3 text-red-500" />}
                                   {status.video ? <FaVideo className="mr-3 text-green-500" /> : <FaVideoSlash className="mr-3 text-red-500" />}
                                   <span className='truncate'>{p.userName || p.peerId}</span> {/* Display userName */}
                               </li>
                            )
                        })}
                    </ul>
                )}
                {showChat && (
                    <>
                        {/* <div ref={chatMessagesRef} className="flex-1 mb-4 overflow-y-auto p-2 bg-gray-900 rounded min-h-0">
                            {(messages || []).map((msg, index) => (
                                <ChatMessage key={index} msg={msg} myPeerId={myPeerId} myUserName={myName} /> 
                            ))}
                        </div> */}
                        <div ref={chatMessagesRef} className="flex-1 mb-4 overflow-y-auto p-2 bg-gray-900 rounded min-h-0">
                             {(messages || []).map((msg, index) => (
                                 <ChatMessage key={index} msg={msg} myPeerId={myPeerId} myUserName={myName} />
                             ))}
                         </div>
                        <form onSubmit={handleSendChat} className="flex flex-shrink-0">
                           {/* Chat input form */}
                           <input
                                type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)}
                                placeholder="Type your message..."
                                className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-l-md focus:outline-none text-sm text-white"
                            />
                            <button type="submit" className="py-2 px-4 bg-indigo-600 hover:bg-indigo-700 rounded-r-md">
                                <FaPaperPlane />
                            </button>
                        </form>
                    </>
                )}
            </aside>
        )}
      </main>
      <footer className="bg-gray-800 p-4 flex justify-center items-center space-x-4 md:space-x-6 shadow-up z-20 flex-shrink-0">
        {/* Control buttons */}
           <button onClick={toggleMute} className={`p-3 rounded-full ${isMuted ? 'bg-red-600' : 'bg-gray-600'}`}><FaMicrophoneSlash size={20} /></button>
        <button onClick={toggleVideo} className={`p-3 rounded-full ${isVideoOff ? 'bg-red-600' : 'bg-gray-600'}`}><FaVideoSlash size={20} /></button>
        <button onClick={handleScreenShareToggle} className={`p-3 rounded-full ${isScreenSharing ? 'bg-green-600' : 'bg-gray-600'}`}><FaDesktop size={20} /></button>
        <button onClick={toggleParticipantsPanel} className={`p-3 rounded-full ${showParticipants ? 'bg-indigo-600' : 'bg-gray-600'}`}><FaUsers size={20} /></button>
        <button onClick={toggleChatPanel} className={`p-3 rounded-full ${showChat ? 'bg-indigo-600' : 'bg-gray-600'}`}><FaComment size={20} /></button>
        <button onClick={leaveCall} className="p-3 px-6 rounded-full bg-red-600"><FaPhoneSlash size={20} /> Leave</button>
      </footer>
    </div>
  );
}

export default MeetingRoom;