import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import { renderVideo } from '../renderer/render';
import Store from 'electron-store';

// Define types
interface VideoConfig {
  inputPath: string;
  outputPath: string;
  effects: string[];
  audioPath?: string;
}

// Initialize store
const store = new Store<{
  recentProjects: VideoConfig[];
}>();

let mainWindow: BrowserWindow | null = null;

// Create main application window
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  // Load the index.html file
  mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));

  // Open DevTools in development
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// App lifecycle events
app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

// IPC handlers
ipcMain.handle('select-video', async () => {
  if (!mainWindow) return;
  
  const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
    filters: [{ name: 'Videos', extensions: ['mp4', 'mov', 'avi'] }]
  });

  if (canceled || filePaths.length === 0) {
    return null;
  }

  return filePaths[0];
});

ipcMain.handle('select-output', async () => {
  if (!mainWindow) return;
  
  const { canceled, filePaths } = await dialog.showSaveDialog(mainWindow, {
    title: 'Save Output Video',
    defaultPath: 'output.mp4',
    filters: [{ name: 'MP4 Video', extensions: ['mp4'] }]
  });

  if (canceled || !filePaths) {
    return null;
  }

  return filePaths;
});

ipcMain.handle('render-video', async (_, config: VideoConfig) => {
  try {
    // Save to recent projects
    const recentProjects = store.get('recentProjects') || [];
    store.set('recentProjects', [config, ...recentProjects.slice(0, 9)]);
    
    // Start rendering
    if (mainWindow) {
      mainWindow.webContents.send('render-status', { status: 'started' });
    }
    
    await renderVideo(config, (progress) => {
      if (mainWindow) {
        mainWindow.webContents.send('render-progress', { progress });
      }
    });
    
    if (mainWindow) {
      mainWindow.webContents.send('render-status', { 
        status: 'completed',
        outputPath: config.outputPath
      });
    }
    
    return { success: true, outputPath: config.outputPath };
  } catch (error) {
    console.error('Rendering failed:', error);
    if (mainWindow) {
      mainWindow.webContents.send('render-status', { 
        status: 'failed',
        error: error instanceof Error ? error.message : String(error)
      });
    }
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
});

ipcMain.handle('get-recent-projects', () => {
  return store.get('recentProjects') || [];
}); 