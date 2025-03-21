// Get access to the Electron API via contextBridge
const { electronAPI } = window as any;

// UI elements
const selectVideoBtn = document.getElementById('selectVideoBtn') as HTMLButtonElement;
const previewBtn = document.getElementById('previewBtn') as HTMLButtonElement;
const exportBtn = document.getElementById('exportBtn') as HTMLButtonElement;
const loadRecentBtn = document.getElementById('loadRecentBtn') as HTMLButtonElement;
const effectsList = document.getElementById('effectsList') as HTMLElement;
const musicList = document.getElementById('musicList') as HTMLElement;
const videoPreview = document.getElementById('videoPreview') as HTMLElement;
const placeholderImage = document.getElementById('placeholderImage') as HTMLImageElement;
const progressFill = document.getElementById('progressFill') as HTMLElement;
const statusText = document.getElementById('statusText') as HTMLElement;

// App state
interface AppState {
  inputVideoPath: string | null;
  outputVideoPath: string | null;
  selectedEffects: string[];
  selectedMusic: string | null;
  isRendering: boolean;
}

const state: AppState = {
  inputVideoPath: null,
  outputVideoPath: null,
  selectedEffects: ['zoom-in-start'], // Default effect
  selectedMusic: null,
  isRendering: false
};

// Initialize the app
function init() {
  // Set up event listeners
  selectVideoBtn.addEventListener('click', handleSelectVideo);
  previewBtn.addEventListener('click', handlePreview);
  exportBtn.addEventListener('click', handleExport);
  loadRecentBtn.addEventListener('click', handleLoadRecent);
  
  // Set up effect selection
  setupEffectSelectors();
  
  // Register render event listeners
  electronAPI.onRenderProgress((progress: number) => {
    updateProgress(progress);
  });
  
  electronAPI.onRenderStatus((status: any) => {
    handleRenderStatus(status);
  });
}

// Set up effect selector UI
function setupEffectSelectors() {
  // Setup effect selection
  const effectItems = effectsList.querySelectorAll('.effect-item');
  effectItems.forEach(item => {
    item.addEventListener('click', () => {
      const effect = item.getAttribute('data-effect');
      if (!effect) return;
      
      // Toggle selection
      if (state.selectedEffects.includes(effect)) {
        state.selectedEffects = state.selectedEffects.filter(e => e !== effect);
        item.classList.remove('selected');
      } else {
        state.selectedEffects.push(effect);
        item.classList.add('selected');
      }
      
      // Update UI
      updateUIState();
    });
    
    // Set initial selection
    if (state.selectedEffects.includes(item.getAttribute('data-effect') || '')) {
      item.classList.add('selected');
    }
  });
  
  // Setup music selection
  const musicItems = musicList.querySelectorAll('.effect-item');
  musicItems.forEach(item => {
    item.addEventListener('click', () => {
      const music = item.getAttribute('data-music');
      if (!music) return;
      
      // Clear previous selection
      musicItems.forEach(m => m.classList.remove('selected'));
      
      // Select new music unless it's already selected
      if (state.selectedMusic === music) {
        state.selectedMusic = null;
      } else {
        state.selectedMusic = music;
        item.classList.add('selected');
      }
      
      // Update UI
      updateUIState();
    });
  });
}

// Handle video selection
async function handleSelectVideo() {
  const filePath = await electronAPI.selectVideo();
  
  if (filePath) {
    state.inputVideoPath = filePath;
    
    // Create video element for preview
    videoPreview.innerHTML = '';
    const video = document.createElement('video');
    video.src = `file://${filePath}`;
    video.controls = true;
    videoPreview.appendChild(video);
    
    // Update UI state
    updateUIState();
  }
}

// Handle preview button
function handlePreview() {
  // In a real app, this would show a preview of the effect applied to the video
  // For simplicity, we're just playing the video
  const videoElement = videoPreview.querySelector('video');
  if (videoElement) {
    videoElement.currentTime = 0;
    videoElement.play();
  }
}

// Handle export button
async function handleExport() {
  if (!state.inputVideoPath) return;
  
  // Get output path from user
  const outputPath = await electronAPI.selectOutput();
  if (!outputPath) return;
  
  state.outputVideoPath = outputPath;
  state.isRendering = true;
  
  // Update UI
  updateUIState();
  
  // Start rendering
  try {
    const result = await electronAPI.renderVideo({
      inputPath: state.inputVideoPath,
      outputPath: state.outputVideoPath,
      effects: state.selectedEffects,
      audioPath: state.selectedMusic !== 'none' && state.selectedMusic 
        ? `path/to/audio/${state.selectedMusic}.mp3` // This would be fetched in real app
        : undefined
    });
    
    // Success handled by status event listener
  } catch (error) {
    statusText.textContent = `Error: ${error}`;
    state.isRendering = false;
    updateUIState();
  }
}

// Handle loading recent projects
async function handleLoadRecent() {
  const recentProjects = await electronAPI.getRecentProjects();
  
  // In a real app, this would show a modal with recent projects
  // For simplicity we'll just log to console
  console.log('Recent projects:', recentProjects);
  
  if (recentProjects.length > 0) {
    // Load the most recent project
    const recent = recentProjects[0];
    state.inputVideoPath = recent.inputPath;
    state.selectedEffects = recent.effects;
    
    // Update UI
    videoPreview.innerHTML = '';
    const video = document.createElement('video');
    video.src = `file://${state.inputVideoPath}`;
    video.controls = true;
    videoPreview.appendChild(video);
    
    // Update effect selection UI
    effectsList.querySelectorAll('.effect-item').forEach(item => {
      const effect = item.getAttribute('data-effect');
      if (effect && state.selectedEffects.includes(effect)) {
        item.classList.add('selected');
      } else {
        item.classList.remove('selected');
      }
    });
    
    updateUIState();
  }
}

// Update progress bar
function updateProgress(progress: number) {
  progressFill.style.width = `${progress * 100}%`;
}

// Handle render status updates
function handleRenderStatus(status: any) {
  switch (status.status) {
    case 'started':
      statusText.textContent = 'Rendering...';
      break;
    case 'completed':
      statusText.textContent = `Complete! Saved to ${status.outputPath}`;
      state.isRendering = false;
      updateUIState();
      break;
    case 'failed':
      statusText.textContent = `Error: ${status.error}`;
      state.isRendering = false;
      updateUIState();
      break;
  }
}

// Update UI state based on app state
function updateUIState() {
  // Enable/disable buttons based on state
  previewBtn.disabled = !state.inputVideoPath;
  exportBtn.disabled = !state.inputVideoPath || state.isRendering || state.selectedEffects.length === 0;
  
  // Disable UI during rendering
  if (state.isRendering) {
    selectVideoBtn.disabled = true;
    loadRecentBtn.disabled = true;
    effectsList.querySelectorAll('.effect-item').forEach(item => 
      (item as HTMLElement).style.pointerEvents = 'none');
    musicList.querySelectorAll('.effect-item').forEach(item => 
      (item as HTMLElement).style.pointerEvents = 'none');
  } else {
    selectVideoBtn.disabled = false;
    loadRecentBtn.disabled = false;
    effectsList.querySelectorAll('.effect-item').forEach(item => 
      (item as HTMLElement).style.pointerEvents = 'auto');
    musicList.querySelectorAll('.effect-item').forEach(item => 
      (item as HTMLElement).style.pointerEvents = 'auto');
  }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', init); 