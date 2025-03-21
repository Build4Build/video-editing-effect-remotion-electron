import { renderMedia, getCompositions } from '@remotion/renderer';
import { bundle } from '@remotion/bundler';
import path from 'path';
import fs from 'fs';
import axios from 'axios';
import os from 'os';

// Types for video configuration
interface VideoConfig {
  inputPath: string;
  outputPath: string;
  effects: string[];
  audioPath?: string;
}

// Type for progress callback
type ProgressCallback = (progress: number) => void;

// Function to download stock footage if needed
async function downloadStockFootage(url: string): Promise<string> {
  try {
    // Create temp directory if it doesn't exist
    const tmpDir = path.join(os.tmpdir(), 'video-editor-assets');
    if (!fs.existsSync(tmpDir)) {
      fs.mkdirSync(tmpDir, { recursive: true });
    }

    // Generate a unique filename based on URL
    const fileName = `stock-${Buffer.from(url).toString('base64').replace(/[/+=]/g, '')}.mp4`;
    const outputPath = path.join(tmpDir, fileName);

    // Skip download if file already exists
    if (fs.existsSync(outputPath)) {
      return outputPath;
    }

    // Download the file
    const response = await axios({
      method: 'GET',
      url,
      responseType: 'stream',
    });
    
    // Save to disk
    const writer = fs.createWriteStream(outputPath);
    response.data.pipe(writer);
    
    return new Promise((resolve, reject) => {
      writer.on('finish', () => resolve(outputPath));
      writer.on('error', reject);
    });
  } catch (error) {
    console.error('Failed to download stock footage:', error);
    throw new Error('Failed to download stock footage');
  }
}

// Main function to render a video with effects
export async function renderVideo(
  config: VideoConfig,
  onProgress: ProgressCallback
): Promise<string> {
  try {
    // Check if input file exists
    if (!fs.existsSync(config.inputPath)) {
      throw new Error(`Input file not found: ${config.inputPath}`);
    }
    
    // Ensure output directory exists
    const outputDir = path.dirname(config.outputPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // Bundle the Remotion project
    console.log('Bundling Remotion project...');
    const bundled = await bundle(path.join(__dirname, '../remotion/index.tsx'));
    
    // Get available compositions
    const compositions = await getCompositions(bundled);
    const mainComposition = compositions.find(comp => comp.id === 'MainVideo');
    
    if (!mainComposition) {
      throw new Error('Main composition not found');
    }

    // Determine video dimensions from input file
    // For this example, we'll use default HD resolution
    // In a real app, you'd analyze the video to get its dimensions
    const inputProps = {
      inputPath: config.inputPath,
      effects: config.effects,
      audioPath: config.audioPath,
    };
    
    // Render the video using Remotion
    console.log('Starting video rendering...');
    await renderMedia({
      composition: mainComposition,
      serveUrl: bundled,
      codec: 'h264',
      outputLocation: config.outputPath,
      inputProps,
      onProgress: ({progress}) => {
        onProgress(progress);
      },
    });
    
    console.log('Video rendering completed:', config.outputPath);
    return config.outputPath;
  } catch (error) {
    console.error('Video rendering failed:', error);
    throw error;
  }
}

// Function to list available stock effects and music
export async function getStockAssets() {
  // This would typically fetch from an API or local file
  // For demo purposes, we'll return static options
  return {
    music: [
      {
        id: 'upbeat',
        name: 'Upbeat Background',
        url: 'https://example.com/upbeat.mp3'
      },
      {
        id: 'cinematic',
        name: 'Cinematic Score',
        url: 'https://example.com/cinematic.mp3'
      }
    ],
    footage: [
      {
        id: 'cityscape',
        name: 'City Aerial View',
        url: 'https://coverr.co/videos/city-aerial-view-D9Ejnxb8jd'
      },
      {
        id: 'beach',
        name: 'Beach Sunset',
        url: 'https://coverr.co/videos/beach-sunset-QIsGV00jE9'
      }
    ],
    effects: [
      'zoom-in-start',
      'color-boost',
      'slow-motion',
      'text-overlay',
      'picture-in-picture',
      'ken-burns'
    ]
  };
} 