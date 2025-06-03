// src/components/VideoGrid.jsx
import React, { useRef, useEffect } from 'react';

// --- Video Sub-Component (Keep as is) ---
const Video = ({ stream, isMuted = false, label }) => {
  const ref = useRef();

  useEffect(() => {
    if (stream) {
      ref.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <div className="relative bg-gray-800 rounded-lg overflow-hidden shadow-lg border-2 border-gray-700 h-full w-full">
      <video
        playsInline
        autoPlay
        ref={ref}
        muted={isMuted}
        className="w-full h-full object-cover"
      />
      <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
        {label}
      </div>
    </div>
  );
};

// --- VideoGrid Main Component ---
const VideoGrid = ({ myStream, remoteStreams, myPeerId, isScreenSharing }) => {
  const totalVideos = Object.keys(remoteStreams).length + 1;

  // --- Grid Layout Calculation with Row Fix ---
  let gridClass = '';
  if (totalVideos === 1) {
      gridClass = 'grid-cols-1 grid-rows-1'; // <-- ADDED grid-rows-1
  } else if (totalVideos <= 4) {
      gridClass = 'grid-cols-2';
  } else if (totalVideos <= 9) {
      gridClass = 'grid-cols-3';
  } else {
      gridClass = 'grid-cols-4';
  }
  // ----------------------------------------

  return (
    <section className={`flex-1 p-4 grid gap-4 overflow-auto ${gridClass} min-h-0`}>
      {myStream && (
        <Video
          stream={myStream}
          isMuted={true}
          label={`${myPeerId || 'Me'} (You) ${isScreenSharing ? '- Sharing' : ''}`}
        />
      )}
      {Object.entries(remoteStreams).map(([peerId, stream]) => (
        <Video key={peerId} stream={stream} label={peerId} />
      ))}
    </section>
  );
};

export default VideoGrid;