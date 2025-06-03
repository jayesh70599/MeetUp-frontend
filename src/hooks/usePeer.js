// src/hooks/usePeer.js
import { useState, useEffect, useRef, useCallback } from 'react';
import io from 'socket.io-client';
import Peer from 'peerjs';

const SOCKET_SERVER_URL = import.meta.env.VITE_SOCKET_SERVER_URL || 'http://localhost:5000'; // Your backend URL

export const usePeer = (meetingId, userName, myStream, initialAudio, initialVideo) => {
  const [myPeerId, setMyPeerId] = useState(null);
  const [remoteStreams, setRemoteStreams] = useState({}); // { peerId: stream }
  const [messages, setMessages] = useState([]); // <-- Add state for messages
  const [participantsList, setParticipantsList] = useState([]); // <-- Add state for participants
   const [peerStatuses, setPeerStatuses] = useState({}); // <-- NEW: State for statuses { peerId: { audio: bool, video: bool } }

  const socketRef = useRef(null);
  const peerRef = useRef(null);
  const callsRef = useRef({});

  // --- Helper Function: Add Remote Stream ---
  const addRemoteStream = (peerId, stream) => {
    setRemoteStreams((prev) => ({ ...prev, [peerId]: stream }));
  };

  // --- Helper Function: Remove Remote Stream ---
  const removeRemoteStream = (peerId) => {
    setRemoteStreams((prev) => {
      const newStreams = { ...prev };
      delete newStreams[peerId];
      return newStreams;
    });
    if (callsRef.current[peerId]) {
      callsRef.current[peerId].close();
      delete callsRef.current[peerId];
    }
  };

  // --- Helper Function: Call Peer ---
  const callPeer = (peerId, stream, peerInstance) => {
    if (!peerInstance || !stream || peerId === myPeerId || callsRef.current[peerId]) {
      console.log(`Not calling ${peerId}: Peer instance missing, stream missing, self-call, or call already exists.`);
      return;
    }
    console.log(`Attempting to call peer: ${peerId}`);
    const call = peerInstance.call(peerId, stream);

    if (call) {
      call.on('stream', (remoteStream) => {
        console.log(`Received remote stream (outgoing call) from ${peerId}`);
        addRemoteStream(peerId, remoteStream);
      });
      call.on('close', () => {
        console.log(`Call (outgoing) with ${peerId} closed.`);
        removeRemoteStream(peerId);
      });
      callsRef.current[peerId] = call;
    } else {
      console.warn(`Could not initiate call to ${peerId}.`);
    }
  };

    // --- CHAT: Add Message Function ---
  const addMessage = useCallback((newMessage) => {
      setMessages((prevMessages) => [...prevMessages, newMessage]);
  }, []);

    // --- CHAT: Send Message Function ---
  const sendMessage = useCallback((message) => {
      if (socketRef.current && message.trim() !== '') {
          socketRef.current.emit('send-chat-message', { meetingId, message });
      }
  }, [meetingId]);

  // --- NEW: Function to replace the video track ---
  const replaceVideoStream = useCallback((newStream) => {
      if (!peerRef.current || !newStream) return;

      const newVideoTrack = newStream.getVideoTracks()[0];
      if (!newVideoTrack) {
          console.error("New stream does not have a video track.");
          return;
      }

      console.log("Replacing video track for all connections...");

      // peerRef.current.connections is an object where keys are peerIds
      // and values are arrays of connections (usually 1 media + 1 data)
      Object.values(peerRef.current.connections).forEach(connectionArray => {
          connectionArray.forEach(connection => {
              // RTCPeerConnection is often available at connection.peerConnection
              const peerConnection = connection.peerConnection;
              if (peerConnection) {
                  // Find the sender responsible for video
                  const videoSender = peerConnection.getSenders().find(sender =>
                      sender.track && sender.track.kind === 'video'
                  );

                  if (videoSender) {
                      console.log(`Replacing track for peer: ${connection.peer}`);
                      videoSender.replaceTrack(newVideoTrack)
                          .then(() => console.log(`Track replaced successfully for ${connection.peer}`))
                          .catch(err => console.error(`Failed to replace track for ${connection.peer}:`, err));
                  } else {
                      console.warn(`Could not find video sender for peer: ${connection.peer}`);
                  }
              }
          });
      });
  }, []);

  // --- NEW: Function to send status updates ---
  const sendStatusUpdate = useCallback((type, status) => {
      if (socketRef.current) {
          socketRef.current.emit('send-status-change', { type, status });
      }
  }, []);


  // --- Main Effect: Initialize PeerJS & Socket.IO ---
  useEffect(() => {
    if (!myStream) {
        console.log("usePeer: Waiting for myStream...");
        return;
    }

    console.log("usePeer: Initializing PeerJS...");
    const peer = new Peer(undefined, { /* debug: 2 */ });
    peerRef.current = peer;

    peer.on('open', (id) => {
      console.log(`usePeer: My PeerJS ID is: ${id}`);
      setMyPeerId(id);

      console.log("usePeer: Connecting to Socket.IO...");
      const socket = io(SOCKET_SERVER_URL);
      socketRef.current = socket;

      socket.on('connect', () => {
        console.log(`usePeer: Connected to Socket.IO: ${socket.id}`);
        socket.emit('join-room', { meetingId, userName, peerId: id,  initialAudio, initialVideo }) // <-- Send initial status });
      });

      // --- Update Participant Handling ---
      socket.on('existing-participants', ({ participants }) => {
        const initialStatuses = {};
        console.log('usePeer: Existing participants:', participants);
        setParticipantsList(participants); // Update state
        participants.forEach(p => {
          callPeer(p.peerId, myStream, peer);
          initialStatuses[p.peerId] = p.status; // <-- Store initial status
        });
        setPeerStatuses(initialStatuses); // <-- Set initial statuses
      });

      socket.on('user-joined', ({ socketId, userName: joinedUserName, peerId: newPeerId, status }) => {
        console.log(`usePeer: New user joined: ${joinedUserName} (Peer ${newPeerId})`);
        setParticipantsList((prev) => [...prev, { socketId, peerId: newPeerId, userName: joinedUserName }]); // Update state
        setPeerStatuses((prev) => ({ ...prev, [newPeerId]: status }));
        addMessage({ senderId: 'System', message: `${joinedUserName || newPeerId} joined the call.` }); // System message
        callPeer(newPeerId, myStream, peer);
      });

      socket.on('user-left', ({ socketId, peerId: leftPeerId, userName: leftUserName }) => {
        console.log(`usePeer: User left: ${leftPeerId}`);
        const leftUser = leftUserName || participantsList.find(p => p.peerId === leftPeerId);
        setParticipantsList((prev) => prev.filter((p) => p.peerId !== leftPeerId)); // Update state
        addMessage({ senderId: 'System', message: `${leftUserName || leftPeerId} left the call.` }); // System message
        setPeerStatuses((prev) => { // <-- Remove status
            const newStatuses = { ...prev };
            delete newStatuses[leftPeerId];
            return newStatuses;
        });
        removeRemoteStream(leftPeerId);
      });

      // --- CHAT: Listen for Messages ---
      socket.on('receive-chat-message', (chatMessage) => {
          console.log('usePeer: Received chat message:', chatMessage);
          addMessage(chatMessage);
      });
      // --- END CHAT ---

       // --- NEW: Listen for Status Changes ---
      socket.on('receive-status-change', ({ peerId, type, status, userName: statusUserName }) => {
          console.log(`Received status change: ${peerId} ${type} = ${status}`);
          setPeerStatuses(prev => ({
              ...prev,
              [peerId]: {
                  ...(prev[peerId] || {}), // Keep existing status, or start new
                  [type]: status // Update the specific type
              }
          }));
      });
      // --- END NEW ---


      socket.on('connect_error', (err) => console.error("usePeer: Socket Error:", err));
    });

    peer.on('call', (call) => {
      console.log(`usePeer: Incoming call from ${call.peer}`);
      call.answer(myStream);
      call.on('stream', (remoteStream) => {
        console.log(`usePeer: Received remote stream from ${call.peer}`);
        addRemoteStream(call.peer, remoteStream);
      });
      call.on('close', () => {
        console.log(`usePeer: Call with ${call.peer} closed.`);
        removeRemoteStream(call.peer);
      });
      callsRef.current[call.peer] = call;
    });

    peer.on('error', (err) => console.error('usePeer: PeerJS Error:', err));
    peer.on('disconnected', () => console.log('usePeer: PeerJS Disconnected.'));

    // --- Cleanup ---
    return () => {
      console.log('usePeer: Cleaning up...');
      if (socketRef.current) socketRef.current.disconnect();
      if (peerRef.current) peerRef.current.destroy();
      // Don't stop the stream here, let the component manage its own stream lifecycle
    };
  }, [myStream, meetingId, userName, addMessage, initialAudio, initialVideo]); // Depend on these values

  // Return the necessary values for the component to use
  return { myPeerId, remoteStreams, messages, sendMessage, participantsList, peerStatuses, sendStatusUpdate, replaceVideoStream };
};