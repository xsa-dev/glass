// src/bridge/windowBridge.js
const { ipcMain, BrowserWindow, globalShortcut } = require('electron');

module.exports = {
  // windowManager에서 필요한 변수들을 매개변수로 받도록 수정
  initialize(windowPool, app, shell, getCurrentDisplay, createFeatureWindows, movementManager, getContentProtectionStatus, setContentProtection, updateLayout) {
    let settingsHideTimer = null;

    // 기존
    ipcMain.on('window:hide', (e) => BrowserWindow.fromWebContents(e.sender)?.hide());

    // windowManager 관련 추가
    ipcMain.handle('toggle-content-protection', () => {
      // windowManager의 toggle-content-protection 로직
      const newStatus = !getContentProtectionStatus();
      setContentProtection(newStatus);
      return newStatus;
    });


    ipcMain.handle('resize-header-window', (event, { width, height }) => {
      const header = windowPool.get('header');
      if (header) {
        console.log(`[WindowBridge] Resize request: ${width}x${height}`);
        
        // Prevent resizing during animations or if already at target size
        if (movementManager && movementManager.isAnimating) {
          console.log('[WindowBridge] Skipping resize during animation');
          return { success: false, error: 'Cannot resize during animation' };
        }

        const currentBounds = header.getBounds();
        console.log(`[WindowBridge] Current bounds: ${currentBounds.width}x${currentBounds.height} at (${currentBounds.x}, ${currentBounds.y})`);
        
        // Skip if already at target size to prevent unnecessary operations
        if (currentBounds.width === width && currentBounds.height === height) {
          console.log('[WindowBridge] Already at target size, skipping resize');
          return { success: true };
        }

        const wasResizable = header.isResizable();
        if (!wasResizable) {
          header.setResizable(true);
        }

        // Calculate the center point of the current window
        const centerX = currentBounds.x + currentBounds.width / 2;
        // Calculate new X position to keep the window centered
        const newX = Math.round(centerX - width / 2);

        // Get the current display to ensure we stay within bounds
        const display = getCurrentDisplay(header);
        const { x: workAreaX, width: workAreaWidth } = display.workArea;
        
        // Clamp the new position to stay within display bounds
        const clampedX = Math.max(workAreaX, Math.min(workAreaX + workAreaWidth - width, newX));

        header.setBounds({ x: clampedX, y: currentBounds.y, width, height });

        if (!wasResizable) {
          header.setResizable(false);
        }
        
        // Update layout after resize
        if (updateLayout) {
          updateLayout();
        }
        
        return { success: true };
      }
      return { success: false, error: 'Header window not found' };
    });

    ipcMain.handle('get-content-protection-status', () => {
      return getContentProtectionStatus();
    });

    ipcMain.handle('open-shortcut-editor', () => {
      // open-shortcut-editor 로직
      const header = windowPool.get('header');
      if (!header) return;
      globalShortcut.unregisterAll();
      createFeatureWindows(header, 'shortcut-settings');
    });


    // 추가: show-settings-window
    ipcMain.on('show-settings-window', (event, bounds) => {
      if (!bounds) return;
      const win = windowPool.get('settings');
      if (win && !win.isDestroyed()) {
        if (settingsHideTimer) {
          clearTimeout(settingsHideTimer);
          settingsHideTimer = null;
        }
        // 위치 조정 로직
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

    ipcMain.on('hide-settings-window', (event) => {
      const window = windowPool.get("settings");
      if (window && !window.isDestroyed()) {
        if (settingsHideTimer) {
          clearTimeout(settingsHideTimer);
        }
        settingsHideTimer = setTimeout(() => {
          if (window && !window.isDestroyed()) {
            window.setAlwaysOnTop(false);
            window.hide();
          }
          settingsHideTimer = null;
        }, 200);
        
        window.__lockedByButton = false;
      }
    });

    ipcMain.on('cancel-hide-settings-window', (event) => {
      if (settingsHideTimer) {
        clearTimeout(settingsHideTimer);
        settingsHideTimer = null;
      }
    });

    // 로그인 페이지 열기
    ipcMain.handle('open-personalize-page', () => {
      const webUrl = process.env.pickleglass_WEB_URL || 'http://localhost:3000';
      const personalizeUrl = `${webUrl}/personalize?desktop=true`;
      shell.openExternal(personalizeUrl);
      console.log('Opening personalization page:', personalizeUrl);
    });

    // 윈도우 이동
    ipcMain.handle('move-window-step', (event, direction) => {
      if (movementManager) {
        movementManager.moveStep(direction);
      }
    });
  },

  // Renderer로 상태를 전송
  notifyFocusChange(win, isFocused) {
    win.webContents.send('window:focus-change', isFocused);
  },
};