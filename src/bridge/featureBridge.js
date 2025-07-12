// src/bridge/featureBridge.js
const { ipcMain } = require('electron');
const settingsService = require('../features/settings/settingsService');

module.exports = {
  // Renderer로부터의 요청을 수신
  initialize() {
    // 기존 ask 핸들러 유지
    ipcMain.handle('feature:ask', (e, query) => {
      // 실제로는 여기서 Controller -> Service 로직 수행
      return `"${query}"에 대한 답변입니다.`;
    });

    // settings 관련 핸들러 추가
    ipcMain.handle('settings:getSettings', async () => {
      return await settingsService.getSettings();
    });
    
    ipcMain.handle('settings:saveSettings', async (event, settings) => {
      return await settingsService.saveSettings(settings);
    });
    
    ipcMain.handle('settings:getPresets', async () => {
      return await settingsService.getPresets();
    });
    
    ipcMain.handle('settings:getPresetTemplates', async () => {
      return await settingsService.getPresetTemplates();
    });
    
    ipcMain.handle('settings:createPreset', async (event, title, prompt) => {
      return await settingsService.createPreset(title, prompt);
    });
    
    ipcMain.handle('settings:updatePreset', async (event, id, title, prompt) => {
      return await settingsService.updatePreset(id, title, prompt);
    });
    
    ipcMain.handle('settings:deletePreset', async (event, id) => {
      return await settingsService.deletePreset(id);
    });
    
    ipcMain.handle('settings:saveApiKey', async (event, apiKey, provider) => {
      return await settingsService.saveApiKey(apiKey, provider);
    });
    
    ipcMain.handle('settings:removeApiKey', async () => {
      return await settingsService.removeApiKey();
    });
    
    ipcMain.handle('settings:updateContentProtection', async (event, enabled) => {
      return await settingsService.updateContentProtection(enabled);
    });

    ipcMain.handle('settings:get-auto-update', async () => {
      return await settingsService.getAutoUpdateSetting();
    });

    ipcMain.handle('settings:set-auto-update', async (event, isEnabled) => {
      console.log('[SettingsService] Setting auto update setting:', isEnabled);
      return await settingsService.setAutoUpdateSetting(isEnabled);
    });
    
    console.log('[FeatureBridge] Initialized with settings handlers.');
  },

  // Renderer로 상태를 전송
  sendAskProgress(win, progress) {
    win.webContents.send('feature:ask:progress', progress);
  },
};