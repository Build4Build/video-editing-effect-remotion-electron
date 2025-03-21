import React from 'react';
import { AbsoluteFill, useVideoConfig, Video, Audio, Sequence } from 'remotion';
import { ZoomInEffect } from './effects/ZoomInEffect';
import { ColorBoostEffect } from './effects/ColorBoostEffect';
import { SlowMotionEffect } from './effects/SlowMotionEffect';
import { KenBurnsEffect } from './effects/KenBurnsEffect';

// Props interface for the video component
interface MainVideoProps {
  inputPath: string;
  effects: string[];
  audioPath?: string;
}

// Map effect names to actual components
const effectsMap: Record<string, React.FC<{inputPath: string}>> = {
  'zoom-in-start': ZoomInEffect,
  'color-boost': ColorBoostEffect,
  'slow-motion': SlowMotionEffect,
  'ken-burns': KenBurnsEffect,
};

// Main composition that combines video with selected effects
export const MainVideo: React.FC<MainVideoProps> = ({ inputPath, effects, audioPath }) => {
  const { fps, durationInFrames } = useVideoConfig();
  
  // Calculate segment duration based on how many effects are applied
  // Each effect gets an equal portion of the total duration
  const segmentDuration = Math.floor(durationInFrames / (effects.length || 1));
  
  return (
    <AbsoluteFill style={{ backgroundColor: 'black' }}>
      {/* If no effects are selected, just play the original video */}
      {effects.length === 0 ? (
        <Video src={inputPath} />
      ) : (
        // Apply each effect in sequence
        effects.map((effectName, index) => {
          const EffectComponent = effectsMap[effectName];
          if (!EffectComponent) return null;
          
          const startFrame = index * segmentDuration;
          
          return (
            <Sequence
              key={effectName + index}
              from={startFrame}
              durationInFrames={segmentDuration}
            >
              <EffectComponent inputPath={inputPath} />
            </Sequence>
          );
        })
      )}
      
      {/* Add background audio if provided */}
      {audioPath && (
        <Audio
          src={audioPath}
          volume={0.5}
          startFrom={0}
        />
      )}
    </AbsoluteFill>
  );
}; 