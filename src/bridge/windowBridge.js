// src/bridge/windowBridge.js
const { ipcMain, BrowserWindow } = require('electron');
const { windowPool, settingsHideTimer, app, shell } = require('../window/windowManager');  // 필요 변수 require

module.exports = {
  // Renderer로부터의 요청을 수신
  initialize() {
  },

  // Renderer로 상태를 전송
  notifyFocusChange(win, isFocused) {
    win.webContents.send('window:focus-change', isFocused);
  },
};