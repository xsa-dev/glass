// src/bridge/featureBridge.js
const { ipcMain } = require('electron');
const settingsService = require('../features/settings/settingsService');
const askService = require('../features/ask/askService');
const listenService = require('../features/listen/listenService');

module.exports = {
  // Renderer로부터의 요청을 수신
  initialize() {
    ipcMain.handle('settings:getPresets', async () => {
      console.log('[FeatureBridge] settings:getPresets 호출됨');
      return await settingsService.getPresets();
    });

    ipcMain.handle('settings:get-auto-update', async () => {
      console.log('[FeatureBridge] settings:get-auto-update 호출됨');
      return await settingsService.getAutoUpdateSetting();
    });

    ipcMain.handle('settings:set-auto-update', async (event, isEnabled) => {
      console.log('[FeatureBridge] settings:set-auto-update 호출됨', isEnabled);
      return await settingsService.setAutoUpdateSetting(isEnabled);
    });

    // New IPC handler for loadInitialData
    ipcMain.handle('settings:loadInitialData', async () => {
      console.log('[FeatureBridge] settings:loadInitialData called');
      return await settingsService.loadInitialData();
    });
    
    console.log('[FeatureBridge] Initialized with settings handlers.');
  },

  // Renderer로 상태를 전송
  sendAskProgress(win, progress) {
    win.webContents.send('feature:ask:progress', progress);
  },
};