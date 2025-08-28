import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import Store from 'electron-store';

// Define types
interface VideoConfig {
  inputPath: string;
  outputPath: string;
  effects: string[];
  audioPath?: string;
}

interface StoreSchema {
  recentProjects: VideoConfig[];
}

// Initialize store with proper types
const store = new Store<StoreSchema>({
  defaults: {
    recentProjects: []
  }
}) as any; // Use type assertion to avoid TypeScript errors

// Placeholder renderer function until the actual implementation is created
const renderVideo = async (config: VideoConfig, progressCallback: (progress: number) => void): Promise<string> => {
  // This is a placeholder. The actual implementation will be in the renderer
  for (let i = 0; i <= 100; i += 10) {
    progressCallback(i / 100);
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  return config.outputPath;
};

let mainWindow: BrowserWindow | null = null;

// Create main application window
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  // Load the index.html file
  mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));

  // Open DevTools for debugging
  mainWindow.webContents.openDevTools();

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
  
  const result = await dialog.showSaveDialog(mainWindow, {
    title: 'Save Output Video',
    defaultPath: 'output.mp4',
    filters: [{ name: 'MP4 Video', extensions: ['mp4'] }]
  });

  if (result.canceled || !result.filePath) {
    return null;
  }

  return result.filePath;
});

ipcMain.handle('render-video', async (_, config: VideoConfig) => {
  try {
    // Save to recent projects
    const recentProjects = store.get('recentProjects');
    store.set('recentProjects', [config, ...recentProjects.slice(0, 9)]);
    
    // Start rendering
    if (mainWindow) {
      mainWindow.webContents.send('render-status', { status: 'started' });
    }
    
    await renderVideo(config, (progress: number) => {
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
  return store.get('recentProjects');
}); 
