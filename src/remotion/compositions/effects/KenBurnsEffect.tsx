import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, Video, interpolate } from 'remotion';

interface KenBurnsEffectProps {
  inputPath: string;
}

// Ken Burns effect that slowly pans and zooms on the video
export const KenBurnsEffect: React.FC<KenBurnsEffectProps> = ({ inputPath }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames, width, height } = useVideoConfig();
  
  // Calculate the progress of the effect from 0 to 1
  const progress = frame / durationInFrames;
  
  // Define the starting and ending zoom factors
  const startZoom = 1.0;
  const endZoom = 1.15;
  
  // Interpolate zoom factor based on current progress
  const zoomFactor = interpolate(
    progress,
    [0, 1],
    [startZoom, endZoom],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }
  );
  
  // Slightly pan the video from left to right
  const translateX = interpolate(
    progress,
    [0, 1],
    [0, -width * 0.05],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }
  );
  
  // And slightly pan from top to bottom
  const translateY = interpolate(
    progress,
    [0, 1],
    [0, -height * 0.05],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }
  );
  
  return (
    <AbsoluteFill style={{ overflow: 'hidden' }}>
      <Video
        src={inputPath}
        style={{
          width: '100%',
          height: '100%',
          transform: `scale(${zoomFactor}) translate(${translateX}px, ${translateY}px)`,
        }}
      />
    </AbsoluteFill>
  );
}; 