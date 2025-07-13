// src/bridge/featureBridge.js
const { ipcMain, app, BrowserWindow } = require('electron');
const settingsService = require('../features/settings/settingsService');
const authService = require('../features/common/services/authService');
const whisperService = require('../features/common/services/whisperService');
const ollamaService = require('../features/common/services/ollamaService');
const modelStateService = require('../features/common/services/modelStateService');
const shortcutsService = require('../features/shortcuts/shortcutsService');
const presetRepository = require('../features/common/repositories/preset');

const askService = require('../features/ask/askService');
const listenService = require('../features/listen/listenService');
const permissionService = require('../features/common/services/permissionService');

module.exports = {
  // Renderer로부터의 요청을 수신
  initialize() {
    
    // 서비스 이벤트 리스너 설정
    this._setupServiceEventListeners();

    // Settings Service
    ipcMain.handle('settings:getPresets', async () => await settingsService.getPresets());
    ipcMain.handle('settings:get-auto-update', async () => await settingsService.getAutoUpdateSetting());
    ipcMain.handle('settings:set-auto-update', async (event, isEnabled) => await settingsService.setAutoUpdateSetting(isEnabled));  
    ipcMain.handle('settings:get-model-settings', async () => await settingsService.getModelSettings());
    ipcMain.handle('settings:validate-and-save-key', async (e, { provider, key }) => await settingsService.validateAndSaveKey(provider, key));
    ipcMain.handle('settings:clear-api-key', async (e, { provider }) => await settingsService.clearApiKey(provider));
    ipcMain.handle('settings:set-selected-model', async (e, { type, modelId }) => await settingsService.setSelectedModel(type, modelId));    

    ipcMain.handle('settings:get-ollama-status', async () => await settingsService.getOllamaStatus());
    ipcMain.handle('settings:ensure-ollama-ready', async () => await settingsService.ensureOllamaReady());
    ipcMain.handle('settings:shutdown-ollama', async () => await settingsService.shutdownOllama());

    // Shortcuts
    ipcMain.handle('get-current-shortcuts', async () => await shortcutsService.loadKeybinds());
    ipcMain.handle('get-default-shortcuts', async () => await shortcutsService.handleRestoreDefaults());
    ipcMain.handle('save-shortcuts', async (event, newKeybinds) => await shortcutsService.handleSaveShortcuts(newKeybinds));


    // Permissions
    ipcMain.handle('check-system-permissions', async () => await permissionService.checkSystemPermissions());
    ipcMain.handle('request-microphone-permission', async () => await permissionService.requestMicrophonePermission());
    ipcMain.handle('open-system-preferences', async (event, section) => await permissionService.openSystemPreferences(section));
    ipcMain.handle('mark-permissions-completed', async () => await permissionService.markPermissionsAsCompleted());
    ipcMain.handle('check-permissions-completed', async () => await permissionService.checkPermissionsCompleted());
    

    // User/Auth
    ipcMain.handle('get-current-user', () => authService.getCurrentUser());
    ipcMain.handle('start-firebase-auth', async () => await authService.startFirebaseAuthFlow());
    ipcMain.handle('firebase-logout', async () => await authService.signOut());

    // App
    ipcMain.handle('quit-application', () => app.quit());

    // Whisper
    ipcMain.handle('whisper:download-model', async (event, modelId) => {
        // 개별 진행률 이벤트 처리
        const progressHandler = (data) => {
            if (data.modelId === modelId) {
                event.sender.send('whisper:download-progress', data);
            }
        };
        
        const completeHandler = (data) => {
            if (data.modelId === modelId) {
                event.sender.send('whisper:download-complete', data);
                whisperService.removeListener('download-progress', progressHandler);
                whisperService.removeListener('download-complete', completeHandler);
            }
        };
        
        whisperService.on('download-progress', progressHandler);
        whisperService.on('download-complete', completeHandler);
        
        try {
            return await whisperService.handleDownloadModel(modelId);
        } catch (error) {
            whisperService.removeListener('download-progress', progressHandler);
            whisperService.removeListener('download-complete', completeHandler);
            throw error;
        }
    });
    ipcMain.handle('whisper:get-installed-models', async () => await whisperService.handleGetInstalledModels());
       
    // General
    ipcMain.handle('get-preset-templates', () => presetRepository.getPresetTemplates());
    ipcMain.handle('get-web-url', () => process.env.pickleglass_WEB_URL || 'http://localhost:3000');

    // Ollama
    ipcMain.handle('ollama:get-status', async () => await ollamaService.handleGetStatus());
    ipcMain.handle('ollama:install', async (event) => {
        // 개별 진행률 이벤트 처리
        const progressHandler = (data) => {
            event.sender.send('ollama:install-progress', data);
        };
        
        const completeHandler = (data) => {
            event.sender.send('ollama:install-complete', data);
            ollamaService.removeListener('install-progress', progressHandler);
            ollamaService.removeListener('install-complete', completeHandler);
        };
        
        ollamaService.on('install-progress', progressHandler);
        ollamaService.on('install-complete', completeHandler);
        
        try {
            return await ollamaService.handleInstall();
        } catch (error) {
            ollamaService.removeListener('install-progress', progressHandler);
            ollamaService.removeListener('install-complete', completeHandler);
            throw error;
        }
    });
    ipcMain.handle('ollama:start-service', async (event) => {
        // 개별 진행률 이벤트 처리
        const completeHandler = (data) => {
            event.sender.send('ollama:install-complete', data);
            ollamaService.removeListener('install-complete', completeHandler);
        };
        
        ollamaService.on('install-complete', completeHandler);
        
        try {
            return await ollamaService.handleStartService();
        } catch (error) {
            ollamaService.removeListener('install-complete', completeHandler);
            throw error;
        }
    });
    ipcMain.handle('ollama:ensure-ready', async () => await ollamaService.handleEnsureReady());
    ipcMain.handle('ollama:get-models', async () => await ollamaService.handleGetModels());
    ipcMain.handle('ollama:get-model-suggestions', async () => await ollamaService.handleGetModelSuggestions());
    ipcMain.handle('ollama:pull-model', async (event, modelName) => {
        // 개별 진행률 이벤트 처리
        const progressHandler = (data) => {
            if (data.model === modelName) {
                event.sender.send('ollama:pull-progress', data);
            }
        };
        
        const completeHandler = (data) => {
            if (data.model === modelName) {
                event.sender.send('ollama:pull-complete', data);
                ollamaService.removeListener('pull-progress', progressHandler);
                ollamaService.removeListener('pull-complete', completeHandler);
            }
        };
        
        const errorHandler = (data) => {
            if (data.model === modelName) {
                event.sender.send('ollama:pull-error', data);
                ollamaService.removeListener('pull-progress', progressHandler);
                ollamaService.removeListener('pull-complete', completeHandler);
                ollamaService.removeListener('pull-error', errorHandler);
            }
        };
        
        ollamaService.on('pull-progress', progressHandler);
        ollamaService.on('pull-complete', completeHandler);
        ollamaService.on('pull-error', errorHandler);
        
        try {
            return await ollamaService.handlePullModel(modelName);
        } catch (error) {
            ollamaService.removeListener('pull-progress', progressHandler);
            ollamaService.removeListener('pull-complete', completeHandler);
            ollamaService.removeListener('pull-error', errorHandler);
            throw error;
        }
    });
    ipcMain.handle('ollama:is-model-installed', async (event, modelName) => await ollamaService.handleIsModelInstalled(modelName));
    ipcMain.handle('ollama:warm-up-model', async (event, modelName) => await ollamaService.handleWarmUpModel(modelName));
    ipcMain.handle('ollama:auto-warm-up', async () => await ollamaService.handleAutoWarmUp());
    ipcMain.handle('ollama:get-warm-up-status', async () => await ollamaService.handleGetWarmUpStatus());
    ipcMain.handle('ollama:shutdown', async (event, force = false) => await ollamaService.handleShutdown(force));

    // Ask
    ipcMain.handle('ask:sendQuestionFromAsk', async (event, userPrompt) => await askService.sendMessage(userPrompt));
    ipcMain.handle('ask:sendQuestionFromSummary', async (event, userPrompt) => await askService.sendMessage(userPrompt));
    ipcMain.handle('ask:toggleAskButton', async () => await askService.toggleAskButton());

    // Listen
    ipcMain.handle('listen:sendMicAudio', async (event, { data, mimeType }) => await listenService.handleSendMicAudioContent(data, mimeType));
    ipcMain.handle('listen:sendSystemAudio', async (event, { data, mimeType }) => {
        const result = await listenService.sttService.sendSystemAudioContent(data, mimeType);
        if(result.success) {
            listenService.sendToRenderer('system-audio-data', { data });
        }
        return result;
    });
    ipcMain.handle('listen:startMacosSystemAudio', async () => await listenService.handleStartMacosAudio());
    ipcMain.handle('listen:stopMacosSystemAudio', async () => await listenService.handleStopMacosAudio());
    ipcMain.handle('update-google-search-setting', async (event, enabled) => await listenService.handleUpdateGoogleSearchSetting(enabled));
    ipcMain.handle('listen:changeSession', async (event, listenButtonText) => {
      console.log('[FeatureBridge] listen:changeSession from mainheader', listenButtonText);
      try {
        await listenService.handleListenRequest(listenButtonText);
        return { success: true };
      } catch (error) {
        console.error('[FeatureBridge] listen:changeSession failed', error.message);
        return { success: false, error: error.message };
      }
    });



     // ModelStateService
    ipcMain.handle('model:validate-key', async (e, { provider, key }) => await modelStateService.handleValidateKey(provider, key));
    ipcMain.handle('model:get-all-keys', () => modelStateService.getAllApiKeys());
    ipcMain.handle('model:set-api-key', async (e, { provider, key }) => await modelStateService.setApiKey(provider, key));
    ipcMain.handle('model:remove-api-key', async (e, provider) => await modelStateService.handleRemoveApiKey(provider));
    ipcMain.handle('model:get-selected-models', () => modelStateService.getSelectedModels());
    ipcMain.handle('model:set-selected-model', async (e, { type, modelId }) => await modelStateService.handleSetSelectedModel(type, modelId));
    ipcMain.handle('model:get-available-models', (e, { type }) => modelStateService.getAvailableModels(type));
    ipcMain.handle('model:are-providers-configured', () => modelStateService.areProvidersConfigured());
    ipcMain.handle('model:get-provider-config', () => modelStateService.getProviderConfig());



    console.log('[FeatureBridge] Initialized with all feature handlers.');
  },

  // 서비스 이벤트 리스너 설정
  _setupServiceEventListeners() {
    // Ollama Service 이벤트 리스너
    ollamaService.on('pull-progress', (data) => {
      this._broadcastToAllWindows('ollama:pull-progress', data);
    });

    ollamaService.on('pull-complete', (data) => {
      this._broadcastToAllWindows('ollama:pull-complete', data);
    });

    ollamaService.on('pull-error', (data) => {
      this._broadcastToAllWindows('ollama:pull-error', data);
    });

    ollamaService.on('download-progress', (data) => {
      this._broadcastToAllWindows('ollama:download-progress', data);
    });

    ollamaService.on('download-complete', (data) => {
      this._broadcastToAllWindows('ollama:download-complete', data);
    });

    ollamaService.on('download-error', (data) => {
      this._broadcastToAllWindows('ollama:download-error', data);
    });

    // Whisper Service 이벤트 리스너
    whisperService.on('download-progress', (data) => {
      this._broadcastToAllWindows('whisper:download-progress', data);
    });

    whisperService.on('download-complete', (data) => {
      this._broadcastToAllWindows('whisper:download-complete', data);
    });

    whisperService.on('download-error', (data) => {
      this._broadcastToAllWindows('whisper:download-error', data);
    });

    // Model State Service 이벤트 리스너
    modelStateService.on('state-changed', (data) => {
      this._broadcastToAllWindows('model-state:updated', data);
    });

    modelStateService.on('settings-updated', () => {
      this._broadcastToAllWindows('settings-updated');
    });

    modelStateService.on('force-show-apikey-header', () => {
      this._broadcastToAllWindows('force-show-apikey-header');
    });

    console.log('[FeatureBridge] Service event listeners configured');
  },

  // 모든 창에 이벤트 방송
  _broadcastToAllWindows(eventName, data = null) {
    BrowserWindow.getAllWindows().forEach(win => {
      if (win && !win.isDestroyed()) {
        if (data !== null) {
          win.webContents.send(eventName, data);
        } else {
          win.webContents.send(eventName);
        }
      }
    });
  },

  // Renderer로 상태를 전송
  sendAskProgress(win, progress) {
    win.webContents.send('feature:ask:progress', progress);
  },
};