// src/preload.js
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  // Ask
  ask: {
    // sendMessage
    sendMessage: (message) => ipcRenderer.invoke('ask:sendMessage', message),
    
    // window
    adjustWindowHeight: (height) => ipcRenderer.invoke('adjust-window-height', height),
    forceCloseWindow: (windowName) => ipcRenderer.invoke('force-close-window', windowName),
    closeWindowIfEmpty: () => ipcRenderer.invoke('close-ask-window-if-empty'),
    
    // event listener
    onGlobalSend: (callback) => ipcRenderer.on('ask-global-send', callback),
    onReceiveQuestionFromAssistant: (callback) => ipcRenderer.on('receive-question-from-assistant', callback),
    onHideTextInput: (callback) => ipcRenderer.on('hide-text-input', callback),
    onWindowHideAnimation: (callback) => ipcRenderer.on('window-hide-animation', callback),
    onWindowBlur: (callback) => ipcRenderer.on('window-blur', callback),
    onWindowDidShow: (callback) => ipcRenderer.on('window-did-show', callback),
    onResponseChunk: (callback) => ipcRenderer.on('ask-response-chunk', callback),
    onResponseStreamEnd: (callback) => ipcRenderer.on('ask-response-stream-end', callback),
    onScrollResponseUp: (callback) => ipcRenderer.on('scroll-response-up', callback),
    onScrollResponseDown: (callback) => ipcRenderer.on('scroll-response-down', callback),
    
    // event listener remove
    removeOnGlobalSend: (callback) => ipcRenderer.removeListener('ask-global-send', callback),
    removeOnReceiveQuestionFromAssistant: (callback) => ipcRenderer.removeListener('receive-question-from-assistant', callback),
    removeOnHideTextInput: (callback) => ipcRenderer.removeListener('hide-text-input', callback),
    removeOnWindowHideAnimation: (callback) => ipcRenderer.removeListener('window-hide-animation', callback),
    removeOnWindowBlur: (callback) => ipcRenderer.removeListener('window-blur', callback),
    removeOnWindowDidShow: (callback) => ipcRenderer.removeListener('window-did-show', callback),
    removeOnResponseChunk: (callback) => ipcRenderer.removeListener('ask-response-chunk', callback),
    removeOnResponseStreamEnd: (callback) => ipcRenderer.removeListener('ask-response-stream-end', callback),
    removeOnScrollResponseUp: (callback) => ipcRenderer.removeListener('scroll-response-up', callback),
    removeOnScrollResponseDown: (callback) => ipcRenderer.removeListener('scroll-response-down', callback)
  },

  // Listen
  listen: {
    // window
    adjustWindowHeight: (height) => ipcRenderer.invoke('adjust-window-height', height),
    
    // event listener
    onSessionStateChanged: (callback) => ipcRenderer.on('session-state-changed', callback),
    onSttUpdate: (callback) => ipcRenderer.on('stt-update', callback),
    onSummaryUpdate: (callback) => ipcRenderer.on('summary-update', callback),
    
    // remove event listener
    removeOnSessionStateChanged: (callback) => ipcRenderer.removeListener('session-state-changed', callback),
    removeOnSttUpdate: (callback) => ipcRenderer.removeListener('stt-update', callback),
    removeOnSummaryUpdate: (callback) => ipcRenderer.removeListener('summary-update', callback),
    
    // Ask window
    isAskWindowVisible: (windowName) => ipcRenderer.invoke('is-ask-window-visible', windowName),
    toggleFeature: (featureName) => ipcRenderer.invoke('toggle-feature', featureName),
    sendQuestionToAsk: (question) => ipcRenderer.invoke('send-question-to-ask', question)
  },

  // Audio
  audio: {
    // audio capture
    sendAudioContent: (options) => ipcRenderer.invoke('send-audio-content', options),
    sendSystemAudioContent: (options) => ipcRenderer.invoke('send-system-audio-content', options),
    
    // macOS audio
    startMacosAudio: () => ipcRenderer.invoke('start-macos-audio'),
    stopMacosAudio: () => ipcRenderer.invoke('stop-macos-audio'),
    
    // screen capture
    startScreenCapture: () => ipcRenderer.invoke('start-screen-capture'),
    stopScreenCapture: () => ipcRenderer.invoke('stop-screen-capture'),
    captureScreenshot: (options) => ipcRenderer.invoke('capture-screenshot', options),
    getCurrentScreenshot: () => ipcRenderer.invoke('get-current-screenshot'),
    
    // session
    isSessionActive: () => ipcRenderer.invoke('is-session-active'),
    
    // event listener
    onChangeListenCaptureState: (callback) => ipcRenderer.on('change-listen-capture-state', callback),
    onSystemAudioData: (callback) => ipcRenderer.on('system-audio-data', callback),
    
    // remove event listener
    removeOnChangeListenCaptureState: (callback) => ipcRenderer.removeListener('change-listen-capture-state', callback),
    removeOnSystemAudioData: (callback) => ipcRenderer.removeListener('system-audio-data', callback)
  },

  // Settings
  settings: {
    // shortcut
    saveShortcuts: (shortcuts) => ipcRenderer.invoke('save-shortcuts', shortcuts),
    getDefaultShortcuts: () => ipcRenderer.invoke('get-default-shortcuts'),
    
    // shortcut editor
    closeShortcutEditor: () => ipcRenderer.send('close-shortcut-editor'),
    
    // event listener
    onLoadShortcuts: (callback) => ipcRenderer.on('load-shortcuts', callback),
    
    // remove event listener
    removeOnLoadShortcuts: (callback) => ipcRenderer.removeListener('load-shortcuts', callback)
  },

  // App
  app: {
    // quit application
    quitApplication: () => ipcRenderer.invoke('quit-application'),
    
    // session
    isSessionActive: () => ipcRenderer.invoke('is-session-active'),
    
    // event listener
    onClickThroughToggled: (callback) => ipcRenderer.on('click-through-toggled', callback),
    
    // remove event listener
    removeOnClickThroughToggled: (callback) => ipcRenderer.removeListener('click-through-toggled', callback),
    
    // remove all listeners
    removeAllListeners: (eventName) => ipcRenderer.removeAllListeners(eventName)
  },

  // API Key Header
  apikey: {
    // model
    getProviderConfig: () => ipcRenderer.invoke('model:get-provider-config'),
    validateKey: (options) => ipcRenderer.invoke('model:validate-key', options),
    setSelectedModel: (options) => ipcRenderer.invoke('model:set-selected-model', options),
    areProvidersConfigured: () => ipcRenderer.invoke('model:are-providers-configured'),
    
    // Ollama
    getOllamaStatus: () => ipcRenderer.invoke('ollama:get-status'),
    getModelSuggestions: () => ipcRenderer.invoke('ollama:get-model-suggestions'),
    ensureReady: () => ipcRenderer.invoke('ollama:ensure-ready'),
    installOllama: () => ipcRenderer.invoke('ollama:install'),
    startService: () => ipcRenderer.invoke('ollama:start-service'),
    pullModel: (modelName) => ipcRenderer.invoke('ollama:pull-model', modelName),
    
    // Whisper
    downloadModel: (modelId) => ipcRenderer.invoke('whisper:download-model', modelId),
    
    // position
    getHeaderPosition: () => ipcRenderer.invoke('get-header-position'),
    moveHeaderTo: (x, y) => ipcRenderer.invoke('move-header-to', x, y),
    
    // authentication
    startFirebaseAuth: () => ipcRenderer.invoke('start-firebase-auth'),
    getCurrentUser: () => ipcRenderer.invoke('get-current-user'),
    quitApplication: () => ipcRenderer.invoke('quit-application'),
    
    // event listener
    onOllamaInstallProgress: (callback) => ipcRenderer.on('ollama:install-progress', callback),
    onOllamaInstallComplete: (callback) => ipcRenderer.on('ollama:install-complete', callback),
    onOllamaPullProgress: (callback) => ipcRenderer.on('ollama:pull-progress', callback),
    onWhisperDownloadProgress: (callback) => ipcRenderer.on('whisper:download-progress', callback),
    
    // remove event listener
    removeOnOllamaInstallProgress: (callback) => ipcRenderer.removeListener('ollama:install-progress', callback),
    removeOnOllamaInstallComplete: (callback) => ipcRenderer.removeListener('ollama:install-complete', callback),
    removeOnOllamaPullProgress: (callback) => ipcRenderer.removeListener('ollama:pull-progress', callback),
    removeOnWhisperDownloadProgress: (callback) => ipcRenderer.removeListener('whisper:download-progress', callback),
    
    // remove all listeners
    removeAllListeners: (eventName) => ipcRenderer.removeAllListeners(eventName)
  },

  // Controller
  controller: {
    // user state
    getCurrentUser: () => ipcRenderer.invoke('get-current-user'),
    
    // model
    areProvidersConfigured: () => ipcRenderer.invoke('model:are-providers-configured'),
    
    // permission
    checkPermissionsCompleted: () => ipcRenderer.invoke('check-permissions-completed'),
    checkSystemPermissions: () => ipcRenderer.invoke('check-system-permissions'),
    
    // window
    resizeHeaderWindow: (options) => ipcRenderer.invoke('resize-header-window', options),
    
    // state change
    sendHeaderStateChanged: (state) => ipcRenderer.send('header-state-changed', state),
    
    // event listener
    onUserStateChanged: (callback) => ipcRenderer.on('user-state-changed', callback),
    onAuthFailed: (callback) => ipcRenderer.on('auth-failed', callback),
    onForceShowApiKeyHeader: (callback) => ipcRenderer.on('force-show-apikey-header', callback),
    
    // remove event listener
    removeOnUserStateChanged: (callback) => ipcRenderer.removeListener('user-state-changed', callback),
    removeOnAuthFailed: (callback) => ipcRenderer.removeListener('auth-failed', callback),
    removeOnForceShowApiKeyHeader: (callback) => ipcRenderer.removeListener('force-show-apikey-header', callback)
  },

  // Header
  header: {
    // position
    getHeaderPosition: () => ipcRenderer.invoke('get-header-position'),
    moveHeaderTo: (x, y) => ipcRenderer.invoke('move-header-to', x, y),
    
    // event listener
    onSessionStateText: (callback) => ipcRenderer.on('session-state-text', callback),
    onShortcutsUpdated: (callback) => ipcRenderer.on('shortcuts-updated', callback),
    
    // remove event listener
    removeOnSessionStateText: (callback) => ipcRenderer.removeListener('session-state-text', callback),
    removeOnShortcutsUpdated: (callback) => ipcRenderer.removeListener('shortcuts-updated', callback),
    
    // animation
    sendAnimationFinished: (state) => ipcRenderer.send('header-animation-finished', state),
    
    // settings window
    cancelHideSettingsWindow: () => ipcRenderer.send('cancel-hide-settings-window'),
    showSettingsWindow: (options) => ipcRenderer.send('show-settings-window', options),
    hideSettingsWindow: () => ipcRenderer.send('hide-settings-window'),
    
    // invoke
    invoke: (channel, ...args) => ipcRenderer.invoke(channel, ...args)
  },

  // Permissions
  permissions: {
    checkSystemPermissions: () => ipcRenderer.invoke('check-system-permissions'),
    requestMicrophonePermission: () => ipcRenderer.invoke('request-microphone-permission'),
    openSystemPreferences: (section) => ipcRenderer.invoke('open-system-preferences', section),
    markPermissionsCompleted: () => ipcRenderer.invoke('mark-permissions-completed'),
    quitApplication: () => ipcRenderer.invoke('quit-application')
  },

  // Animation
  animation: {
    // send animation finished
    sendAnimationFinished: () => ipcRenderer.send('animation-finished'),
    
    // event listener
    onWindowShowAnimation: (callback) => ipcRenderer.on('window-show-animation', callback),
    onWindowHideAnimation: (callback) => ipcRenderer.on('window-hide-animation', callback),
    onSettingsWindowHideAnimation: (callback) => ipcRenderer.on('settings-window-hide-animation', callback),
    onListenWindowMoveToCenter: (callback) => ipcRenderer.on('listen-window-move-to-center', callback),
    onListenWindowMoveToLeft: (callback) => ipcRenderer.on('listen-window-move-to-left', callback),
    
    // remove event listener
    removeOnWindowShowAnimation: (callback) => ipcRenderer.removeListener('window-show-animation', callback),
    removeOnWindowHideAnimation: (callback) => ipcRenderer.removeListener('window-hide-animation', callback),
    removeOnSettingsWindowHideAnimation: (callback) => ipcRenderer.removeListener('settings-window-hide-animation', callback),
    removeOnListenWindowMoveToCenter: (callback) => ipcRenderer.removeListener('listen-window-move-to-center', callback),
    removeOnListenWindowMoveToLeft: (callback) => ipcRenderer.removeListener('listen-window-move-to-left', callback)
  },

  feature: {
    // ask
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
  // window
  window: {
    // window
    hide: () => ipcRenderer.send('window:hide'),
    onFocusChange: (callback) => ipcRenderer.on('window:focus-change', (e, f) => callback(f)),

    // settings window
    showSettingsWindow: (bounds) => ipcRenderer.send('show-settings-window', bounds),
    hideSettingsWindow: () => ipcRenderer.send('hide-settings-window'),
    cancelHideSettingsWindow: () => ipcRenderer.send('cancel-hide-settings-window'),
    moveWindowStep: (direction) => ipcRenderer.invoke('move-window-step', direction),
    openLoginPage: () => ipcRenderer.invoke('open-login-page'),
    firebaseLogout: () => ipcRenderer.invoke('firebase-logout'),
    ollamaShutdown: (graceful) => ipcRenderer.invoke('ollama:shutdown', graceful),
    startFirebaseAuth: () => ipcRenderer.invoke('start-firebase-auth'),

    // event listener
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

    // send
    cancelHideSettingsWindow: () => ipcRenderer.send('cancel-hide-settings-window'),
    hideSettingsWindow: () => ipcRenderer.send('hide-settings-window')
  }
});