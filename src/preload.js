// src/preload.js
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  feature: {
    // 기존 ask 관련 유지
    submitAsk: (query) => ipcRenderer.invoke('feature:ask', query),
    onAskProgress: (callback) => ipcRenderer.on('feature:ask:progress', (e, p) => callback(p)),

    settings: {
      // invoke methods
      getCurrentUser: () => ipcRenderer.invoke('get-current-user'),
      getProviderConfig: () => ipcRenderer.invoke('model:get-provider-config'),
      getAllKeys: () => ipcRenderer.invoke('model:get-all-keys'),
      getAvailableModels: (type) => ipcRenderer.invoke('model:get-available-models', type),
      getSelectedModels: () => ipcRenderer.invoke('model:get-selected-models'),
      getPresets: () => ipcRenderer.invoke('settings:getPresets'),
      getContentProtectionStatus: () => ipcRenderer.invoke('get-content-protection-status'),
      getCurrentShortcuts: () => ipcRenderer.invoke('get-current-shortcuts'),
      getOllamaStatus: () => ipcRenderer.invoke('ollama:get-status'),
      getWhisperInstalledModels: () => ipcRenderer.invoke('whisper:get-installed-models'),
      ollamaEnsureReady: () => ipcRenderer.invoke('ollama:ensure-ready'),
      validateKey: (data) => ipcRenderer.invoke('model:validate-key', data),
      getAutoUpdate: () => ipcRenderer.invoke('settings:get-auto-update'),
      setAutoUpdate: (isEnabled) => ipcRenderer.invoke('settings:set-auto-update', isEnabled),
      removeApiKey: (provider) => ipcRenderer.invoke('model:remove-api-key', provider),
      setSelectedModel: (data) => ipcRenderer.invoke('model:set-selected-model', data),
      downloadWhisperModel: (modelId) => ipcRenderer.invoke('whisper:download-model', modelId),
      openLoginPage: () => ipcRenderer.invoke('open-login-page'),
      toggleContentProtection: () => ipcRenderer.invoke('toggle-content-protection'),
      openShortcutEditor: () => ipcRenderer.invoke('open-shortcut-editor'),
      quitApplication: () => ipcRenderer.invoke('quit-application'),
      firebaseLogout: () => ipcRenderer.invoke('firebase-logout'),
      ollamaShutdown: (graceful) => ipcRenderer.invoke('ollama:shutdown', graceful),
      startFirebaseAuth: () => ipcRenderer.invoke('start-firebase-auth'),

      // on methods (listeners)
      onUserStateChanged: (callback) => ipcRenderer.on('user-state-changed', callback),
      removeOnUserStateChanged: (callback) => ipcRenderer.removeListener('user-state-changed', callback),
      onSettingsUpdated: (callback) => ipcRenderer.on('settings-updated', callback),
      removeOnSettingsUpdated: (callback) => ipcRenderer.removeListener('settings-updated', callback),
      onPresetsUpdated: (callback) => ipcRenderer.on('presets-updated', callback),
      removeOnPresetsUpdated: (callback) => ipcRenderer.removeListener('presets-updated', callback),
      onShortcutsUpdated: (callback) => ipcRenderer.on('shortcuts-updated', callback),
      removeOnShortcutsUpdated: (callback) => ipcRenderer.removeListener('shortcuts-updated', callback),
      onWhisperDownloadProgress: (callback) => ipcRenderer.on('whisper:download-progress', callback),
      removeOnWhisperDownloadProgress: (callback) => ipcRenderer.removeListener('whisper:download-progress', callback),

      // send methods
      cancelHideSettingsWindow: () => ipcRenderer.send('cancel-hide-settings-window'),
      hideSettingsWindow: () => ipcRenderer.send('hide-settings-window')
    }
  },
  // 기존 window 유지
  window: {
    // 기존
    hide: () => ipcRenderer.send('window:hide'),
    onFocusChange: (callback) => ipcRenderer.on('window:focus-change', (e, f) => callback(f)),

    // 추가
    showSettingsWindow: (bounds) => ipcRenderer.send('show-settings-window', bounds),
    hideSettingsWindow: () => ipcRenderer.send('hide-settings-window'),
    cancelHideSettingsWindow: () => ipcRenderer.send('cancel-hide-settings-window'),
    moveWindowStep: (direction) => ipcRenderer.invoke('move-window-step', direction),
    openLoginPage: () => ipcRenderer.invoke('open-login-page'),
    firebaseLogout: () => ipcRenderer.invoke('firebase-logout'),
    ollamaShutdown: (graceful) => ipcRenderer.invoke('ollama:shutdown', graceful),
    startFirebaseAuth: () => ipcRenderer.invoke('start-firebase-auth'),

    // on methods (listeners)
    onUserStateChanged: (callback) => ipcRenderer.on('user-state-changed', callback),
    removeOnUserStateChanged: (callback) => ipcRenderer.removeListener('user-state-changed', callback),
    onSettingsUpdated: (callback) => ipcRenderer.on('settings-updated', callback),
    removeOnSettingsUpdated: (callback) => ipcRenderer.removeListener('settings-updated', callback),
    onPresetsUpdated: (callback) => ipcRenderer.on('presets-updated', callback),
    removeOnPresetsUpdated: (callback) => ipcRenderer.removeListener('presets-updated', callback),
    onShortcutsUpdated: (callback) => ipcRenderer.on('shortcuts-updated', callback),
    removeOnShortcutsUpdated: (callback) => ipcRenderer.removeListener('shortcuts-updated', callback),
    onWhisperDownloadProgress: (callback) => ipcRenderer.on('whisper:download-progress', callback),
    removeOnWhisperDownloadProgress: (callback) => ipcRenderer.removeListener('whisper:download-progress', callback),

    // send methods
    cancelHideSettingsWindow: () => ipcRenderer.send('cancel-hide-settings-window'),
    hideSettingsWindow: () => ipcRenderer.send('hide-settings-window')
  }
});