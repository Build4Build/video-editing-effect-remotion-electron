import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, Video, spring, interpolate } from 'remotion';

interface ColorBoostEffectProps {
  inputPath: string;
}

// Effect that enhances colors in the video
export const ColorBoostEffect: React.FC<ColorBoostEffectProps> = ({ inputPath }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  
  // Apply a gradual color enhancement over time
  const transitionDuration = Math.min(fps * 1.5, durationInFrames / 4);
  
  // Use spring animation for smooth transition
  const transitionProgress = spring({
    frame,
    fps,
    config: {
      damping: 100,
      mass: 0.8,
    },
    durationInFrames: transitionDuration,
  });
  
  // Calculate saturation, contrast and brightness values
  const saturation = interpolate(
    transitionProgress,
    [0, 1],
    [1, 1.3] // Increase saturation by 30%
  );
  
  const contrast = interpolate(
    transitionProgress,
    [0, 1],
    [1, 1.15] // Increase contrast by 15%
  );
  
  const brightness = interpolate(
    transitionProgress,
    [0, 1],
    [1, 1.05] // Slightly increase brightness
  );
  
  // Apply the filter
  const filterStyle = `saturate(${saturation}) contrast(${contrast}) brightness(${brightness})`;
  
  return (
    <AbsoluteFill style={{ overflow: 'hidden' }}>
      <Video
        src={inputPath}
        style={{
          width: '100%',
          height: '100%',
          filter: filterStyle,
        }}
      />
    </AbsoluteFill>
  );
}; 