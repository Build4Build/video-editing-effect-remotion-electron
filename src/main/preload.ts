import { contextBridge, ipcRenderer } from 'electron';

// Expose IPC API to renderer process
contextBridge.exposeInMainWorld('electronAPI', {
  // File selection
  selectVideo: () => ipcRenderer.invoke('select-video'),
  selectOutput: () => ipcRenderer.invoke('select-output'),
  
  // Video rendering
  renderVideo: (config: any) => ipcRenderer.invoke('render-video', config),
  onRenderProgress: (callback: (progress: number) => void) => {
    ipcRenderer.on('render-progress', (_, data) => callback(data.progress));
    return () => ipcRenderer.removeAllListeners('render-progress');
  },
  onRenderStatus: (callback: (status: any) => void) => {
    ipcRenderer.on('render-status', (_, data) => callback(data));
    return () => ipcRenderer.removeAllListeners('render-status');
  },
  
  // Recent projects
  getRecentProjects: () => ipcRenderer.invoke('get-recent-projects')
}); 