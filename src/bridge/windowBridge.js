// src/bridge/windowBridge.js
const { ipcMain } = require('electron');
const windowManager = require('../window/windowManager');

module.exports = {
  initialize() {
    ipcMain.handle('toggle-content-protection', () => windowManager.toggleContentProtection());
    ipcMain.handle('resize-header-window', (event, args) => windowManager.resizeHeaderWindow(args));
    ipcMain.handle('get-content-protection-status', () => windowManager.getContentProtectionStatus());
    ipcMain.handle('open-shortcut-editor', () => windowManager.openShortcutEditor());
    ipcMain.on('show-settings-window', (event, bounds) => windowManager.showSettingsWindow(bounds));
    ipcMain.on('hide-settings-window', () => windowManager.hideSettingsWindow());
    ipcMain.on('cancel-hide-settings-window', () => windowManager.cancelHideSettingsWindow());
    ipcMain.handle('open-login-page', () => windowManager.openLoginPage());
    ipcMain.handle('move-window-step', (event, direction) => windowManager.moveWindowStep(direction));
    ipcMain.on('close-shortcut-editor', () => windowManager.closeWindow('shortcut-settings'));

  },

  notifyFocusChange(win, isFocused) {
    win.webContents.send('window:focus-change', isFocused);
  }
};