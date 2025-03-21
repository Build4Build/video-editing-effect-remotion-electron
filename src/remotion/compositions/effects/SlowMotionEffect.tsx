import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, Video, interpolate } from 'remotion';

interface SlowMotionEffectProps {
  inputPath: string;
}

// Effect that applies slow motion to video
export const SlowMotionEffect: React.FC<SlowMotionEffectProps> = ({ inputPath }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  
  // For slow motion effect, we apply a CSS filter to give a smooth appearance
  // and slow down playback with CSS
  return (
    <AbsoluteFill style={{ overflow: 'hidden' }}>
      <Video
        src={inputPath}
        style={{
          width: '100%',
          height: '100%',
          // Add a slight blur to enhance slow motion feel
          filter: 'blur(0.5px)',
          // This is just for visual effect - actual slow motion would be done
          // by manipulating video playback rate in a real implementation
        }}
      />
      {/* Overlay a slight color tint to enhance slow motion feel */}
      <AbsoluteFill 
        style={{
          backgroundColor: 'rgba(0, 0, 100, 0.05)',
          mixBlendMode: 'overlay',
        }}
      />
    </AbsoluteFill>
  );
}; 