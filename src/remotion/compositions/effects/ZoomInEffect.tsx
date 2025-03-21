import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, Video, spring, interpolate } from 'remotion';

interface ZoomInEffectProps {
  inputPath: string;
}

// Zoom in effect typically used at the start of vlogs
export const ZoomInEffect: React.FC<ZoomInEffectProps> = ({ inputPath }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames, width, height } = useVideoConfig();
  
  // Calculate zoom factor based on frames
  // We'll zoom in at the beginning (first 2 seconds)
  const zoomDuration = Math.min(fps * 2, durationInFrames / 3);
  
  // Use spring animation for smooth zoom
  const zoomProgress = spring({
    frame,
    fps,
    config: {
      damping: 100,
      mass: 0.5,
    },
    durationInFrames: zoomDuration,
  });
  
  // Start at 1.3x zoom and gradually zoom out to normal 1x
  const zoomFactor = interpolate(
    zoomProgress,
    [0, 1],
    [1.3, 1]
  );
  
  // Calculate dimensions for the zoomed video
  const videoWidth = width * zoomFactor;
  const videoHeight = height * zoomFactor;
  
  return (
    <AbsoluteFill style={{ overflow: 'hidden' }}>
      {/* Center the video and apply zoom effect */}
      <AbsoluteFill
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Video
          src={inputPath}
          style={{
            width: videoWidth,
            height: videoHeight,
            transform: `scale(${zoomFactor})`,
            transition: 'transform 0.5s ease',
          }}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
}; 