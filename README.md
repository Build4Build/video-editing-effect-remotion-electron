# Automatic Video Editor - Electron + Remotion

A desktop application for automatic video editing with visual effects and music. Built with Electron, TypeScript, and Remotion.

## Features

- 🎬 **Upload Local Videos**: Select and import your videos for editing
- 🪄 **Automatic Effects**: Apply professional effects with just a click
  - Vlog-style zoom in at the beginning
  - Color boost effects
  - Slow motion
  - Ken Burns effect (pan & zoom)
- 🎵 **Add Background Music**: Choose from royalty-free music tracks
- 📱 **Quick Rendering**: Fast video processing with progress tracking
- 💾 **High Quality Output**: Export in MP4 format, preserving original resolution

## Technology Stack

- **Electron**: Cross-platform desktop application framework
- **TypeScript**: Strongly typed JavaScript for robust code
- **Remotion**: React-based video editing library
- **FFmpeg**: Powerful video processing backend

## Development

### Prerequisites

- Node.js 16+ and npm

### Setup

1. Clone the repository
   ```
   git clone https://github.com/yourusername/video-editing-effect-remotion-electron.git
   cd video-editing-effect-remotion-electron
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Run in development mode
   ```
   npm start
   ```

### Build

Build for your current platform:
```
npm run build
npm run dist
```

## Usage

1. Launch the application
2. Click "Select Video" to import your video file
3. Choose effects from the right panel
4. Select background music (optional)
5. Click "Export Video" to render with selected effects
6. Save the output file when prompted

## Project Structure

- `/src/main` - Electron main process
- `/src/renderer` - Electron renderer process (UI)
- `/src/remotion` - Remotion video compositions
- `/src/remotion/compositions/effects` - Individual video effects

## License

MIT 