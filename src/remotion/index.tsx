import { Composition, registerRoot } from 'remotion';
import { MainVideo } from './compositions/MainVideo';
import { ZoomInEffect } from './compositions/effects/ZoomInEffect';
import { ColorBoostEffect } from './compositions/effects/ColorBoostEffect';
import { SlowMotionEffect } from './compositions/effects/SlowMotionEffect';
import { KenBurnsEffect } from './compositions/effects/KenBurnsEffect';

// Register the root component
export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* Main video composition with all effects */}
      <Composition
        id="MainVideo"
        component={MainVideo as any}
        durationInFrames={900} // 30 seconds @ 30fps
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          inputPath: '',
          effects: ['zoom-in-start'],
          audioPath: '',
        }}
      />

      {/* Individual effect compositions for preview */}
      <Composition
        id="ZoomInEffect"
        component={ZoomInEffect as any}
        durationInFrames={300}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          inputPath: '',
        }}
      />

      <Composition
        id="ColorBoostEffect"
        component={ColorBoostEffect as any}
        durationInFrames={300}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          inputPath: '',
        }}
      />

      <Composition
        id="SlowMotionEffect"
        component={SlowMotionEffect as any}
        durationInFrames={450}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          inputPath: '',
        }}
      />

      <Composition
        id="KenBurnsEffect"
        component={KenBurnsEffect as any}
        durationInFrames={300}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          inputPath: '',
        }}
      />
    </>
  );
};

// Register the root component
registerRoot(RemotionRoot); 