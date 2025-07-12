// src/bridge/windowBridge.js
const { ipcMain, BrowserWindow } = require('electron');
const { windowPool, settingsHideTimer, app, shell } = require('../electron/windowManager');  // 필요 변수 require

module.exports = {
  // Renderer로부터의 요청을 수신
  initialize() {
    // 기존
    ipcMain.on('window:hide', (e) => BrowserWindow.fromWebContents(e.sender)?.hide());

    // windowManager 관련 추가
    ipcMain.handle('toggle-content-protection', () => {
      // windowManager의 toggle-content-protection 로직
      isContentProtectionOn = !isContentProtectionOn;
      windowPool.forEach(win => {
        if (win && !win.isDestroyed()) {
          win.setContentProtection(isContentProtectionOn);
        }
      });
      return isContentProtectionOn;
    });

    ipcMain.handle('get-content-protection-status', () => {
      return isContentProtectionOn;
    });

    ipcMain.handle('open-shortcut-editor', () => {
      // open-shortcut-editor 로직 (windowPool 등 필요시 require)
      const header = windowPool.get('header');
      if (!header) return;
      globalShortcut.unregisterAll();
      createFeatureWindows(header, 'shortcut-settings');
    });

    // 다른 관련 핸들러 추가 (quit-application, etc.)
    ipcMain.handle('quit-application', () => {
      app.quit();
    });

    // 추가: show-settings-window
    ipcMain.on('show-settings-window', (event, bounds) => {
      if (!bounds) return;
      const win = windowPool.get('settings');
      if (win && !win.isDestroyed()) {
        if (settingsHideTimer) clearTimeout(settingsHideTimer);
        // 위치 조정 로직 (기존 복사)
        const header = windowPool.get('header');
        const headerBounds = header?.getBounds() ?? { x: 0, y: 0 };
        const settingsBounds = win.getBounds();
        const disp = getCurrentDisplay(header);
        const { x: waX, y: waY, width: waW, height: waH } = disp.workArea;
        let x = Math.round(headerBounds.x + (bounds?.x ?? 0) + (bounds?.width ?? 0) / 2 - settingsBounds.width / 2);
        let y = Math.round(headerBounds.y + (bounds?.y ?? 0) + (bounds?.height ?? 0) + 31);
        x = Math.max(waX + 10, Math.min(waX + waW - settingsBounds.width - 10, x));
        y = Math.max(waY + 10, Math.min(waY + waH - settingsBounds.height - 10, y));
        win.setBounds({ x, y });
        win.__lockedByButton = true;
        win.show();
        win.moveTop();
        win.setAlwaysOnTop(true);
      }
    });

    // 추가: hide-settings-window 등 다른 핸들러 복사
    // ... (hide-settings-window, cancel-hide-settings-window, quit-application, open-login-page, firebase-logout, move-window-step 등)

    // 예: ipcMain.handle('open-login-page', () => { shell.openExternal(...); });
  },

  // Renderer로 상태를 전송
  notifyFocusChange(win, isFocused) {
    win.webContents.send('window:focus-change', isFocused);
  },
};