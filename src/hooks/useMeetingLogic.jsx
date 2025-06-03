// src/hooks/useMeetingLogic.js
import { useEffect, useState, useRef, useCallback } from 'react';
import io from 'socket.io-client';
import Peer from 'peerjs';

export const useMeetingLogic = (roomId) => {
  const [localStream, setLocalStream] = useState(null);
  const [remoteStreams, setRemoteStreams] = useState([]);
  const socketRef = useRef();
  const peerRef = useRef();
  const callsRef = useRef({});

  // Memoize the cleanup function to prevent issues in useEffect
  const cleanup = useCallback(() => {
    console.log("Cleaning up resources...");
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
      setLocalStream(null);
    }
    if (peerRef.current) {
        peerRef.current.destroy();
        peerRef.current = null;
    }
    if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
    }
    Object.values(callsRef.current).forEach(call => call.close());
    callsRef.current = {};
    setRemoteStreams([]);
  }, [localStream]);


  const connectToNewUser = useCallback((peerId, stream) => {
      if (!peerRef.current || callsRef.current[peerId] || !stream) return;
      console.log(`Calling ${peerId}`);
      const call = peerRef.current.call(peerId, stream);

      if (!call) {
          console.error(`Failed to initiate call to ${peerId}`);
          return;
      }

      callsRef.current[peerId] = call;

      call.on('stream', (remoteStream) => {
          console.log(`Received stream from ${peerId} (caller side)`);
          setRemoteStreams(prev => {
              if (prev.some(rs => rs.peerId === peerId)) return prev;
              return [...prev, { peerId, stream: remoteStream }];
          });
      });

      call.on('close', () => {
          console.log(`Call with ${peerId} closed (caller side).`);
          setRemoteStreams(prev => prev.filter(rs => rs.peerId !== peerId));
          delete callsRef.current[peerId];
      });

      call.on('error', (err) => {
          console.error(`Call error with ${peerId} (caller side):`, err);
          setRemoteStreams(prev => prev.filter(rs => rs.peerId !== peerId));
          delete callsRef.current[peerId];
      });
  }, []); // Dependencies will be added if they use state/props directly


  useEffect(() => {
    socketRef.current = io.connect('http://localhost:5000');

    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        setLocalStream(stream);

        const peer = new Peer(undefined, {
          host: '0.peerjs.com',
          port: 443,
          path: '/',
          secure: true,
        });

        peerRef.current = peer;

        peer.on('open', (peerId) => {
          console.log('My PeerJS ID is:', peerId);
          socketRef.current.emit('join-room', roomId, peerId);

          peer.on('call', (call) => {
            console.log(`Incoming call from ${call.peer}`);
            call.answer(stream); // Answer immediately

            callsRef.current[call.peer] = call;

            call.on('stream', (remoteStream) => {
              console.log(`Received stream from ${call.peer}`);
              setRemoteStreams(prev => {
                   if (prev.some(rs => rs.peerId === call.peer)) return prev;
                   return [...prev, { peerId: call.peer, stream: remoteStream }];
              });
            });

            call.on('close', () => {
              console.log(`Call with ${call.peer} closed.`);
              setRemoteStreams(prev => prev.filter(rs => rs.peerId !== call.peer));
               delete callsRef.current[call.peer];
            });

            call.on('error', (err) => {
                console.error(`Call error with ${call.peer}:`, err);
                setRemoteStreams(prev => prev.filter(rs => rs.peerId !== call.peer));
                delete callsRef.current[call.peer];
            });
          });
        });

        peer.on('error', (err) => {
            console.error('PeerJS Error:', err);
            // Consider adding some user feedback here
        });

        socketRef.current.on('user-connected', (peerId) => {
            console.log(`User ${peerId} connected, initiating call.`);
            // Delay slightly to ensure the other user is ready to receive calls
            setTimeout(() => connectToNewUser(peerId, stream), 1000);
        });

        socketRef.current.on('existing-users', (peerIds) => {
            console.log("Existing users:", peerIds);
            peerIds.forEach(peerId => {
                setTimeout(() => connectToNewUser(peerId, stream), 1000);
            });
        });

        socketRef.current.on('user-disconnected', (peerId) => {
            console.log(`User ${peerId} disconnected.`);
            if (callsRef.current[peerId]) {
                callsRef.current[peerId].close();
            }
            setRemoteStreams(prev => prev.filter(rs => rs.peerId !== peerId));
            delete callsRef.current[peerId];
        });

      })
      .catch((error) => {
        console.error('Error getting user media:', error);
        alert('Could not access camera/microphone. Please check permissions.');
      });

    // Setup cleanup on unmount
    return cleanup;

  }, [roomId, connectToNewUser, cleanup]); // Add dependencies

  // Return the state needed by the component
  return { localStream, remoteStreams };
};