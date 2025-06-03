// src/components/VideoPlayer.jsx
import React, { useEffect, useRef } from 'react';

const VideoPlayer = ({ stream, isMuted = false }) => {
  const videoRef = useRef();

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <video
      ref={videoRef}
      autoPlay
      playsInline // Important for mobile browsers
      muted={isMuted}
      style={{ width: '300px', margin: '10px', border: '1px solid black' }}
    />
  );
};

export default VideoPlayer;