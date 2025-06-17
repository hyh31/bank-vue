import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import * as si from 'systeminformation'

function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC test
  ipcMain.on('ping', () => console.log('pong'))

  // 系统监控 IPC 处理
  setupSystemMonitoring()

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

/**
 * 设置系统监控功能
 */
function setupSystemMonitoring(): void {
  // 获取系统状态信息
  ipcMain.handle('get-system-status', async () => {
    console.log('主进程：收到获取系统状态请求')
    try {
      // 获取CPU信息
      console.log('主进程：正在获取CPU信息...')
      const cpuLoad = await si.currentLoad()
      console.log('主进程：CPU信息获取成功:', cpuLoad.currentLoad)

      // 获取内存信息
      console.log('主进程：正在获取内存信息...')
      const memory = await si.mem()
      console.log('主进程：内存信息获取成功')

      // 获取网络信息
      console.log('主进程：正在获取网络信息...')
      const networkStats = await si.networkStats()
      console.log('主进程：网络信息获取成功')

      // 计算内存使用率
      const memoryUsage = ((memory.used / memory.total) * 100).toFixed(1)

      // 获取网络延迟（模拟，实际可以ping特定服务器）
      const networkLatency = Math.floor(Math.random() * 50) + 10 // 10-60ms

      const result = {
        cpu: {
          name: 'CPU使用率',
          value: `${cpuLoad.currentLoad.toFixed(1)}%`,
          percentage: Math.round(cpuLoad.currentLoad),
          status:
            cpuLoad.currentLoad > 80 ? 'critical' : cpuLoad.currentLoad > 60 ? 'warning' : 'normal'
        },
        memory: {
          name: '内存使用率',
          value: `${((memory.used / memory.total) * 100).toFixed(1)}%`,
          percentage: Math.round((memory.used / memory.total) * 100),
          status:
            memory.used / memory.total > 0.8
              ? 'critical'
              : memory.used / memory.total > 0.6
                ? 'warning'
                : 'normal',
          total: `${(memory.total / 1024 / 1024 / 1024).toFixed(1)}GB`
        },
        network: {
          name: '网络延迟',
          value: `${networkLatency}ms`,
          percentage: Math.max(0, 100 - networkLatency), // 延迟越低，百分比越高
          status: networkLatency > 100 ? 'critical' : networkLatency > 50 ? 'warning' : 'normal'
        },
        database: {
          name: '数据库连接',
          value: '正常',
          percentage: 100,
          status: 'normal',
          connectionCount: Math.floor(Math.random() * 100) + 200, // 模拟连接数
          maxConnections: 500
        }
      }

      console.log('主进程：系统状态数据准备完成:', result)
      return result
    } catch (error) {
      console.error('主进程：获取系统状态失败:', error)
      return {
        cpu: { name: 'CPU使用率', value: '获取失败', percentage: 0, status: 'critical' },
        memory: { name: '内存使用率', value: '获取失败', percentage: 0, status: 'critical' },
        network: { name: '网络延迟', value: '获取失败', percentage: 0, status: 'critical' },
        database: { name: '数据库连接', value: '获取失败', percentage: 0, status: 'critical' }
      }
    }
  })

  // 获取系统基本信息
  ipcMain.handle('get-system-info', async () => {
    try {
      const osInfo = await si.osInfo()
      const cpu = await si.cpu()
      const memory = await si.mem()

      return {
        platform: osInfo.platform,
        distro: osInfo.distro,
        release: osInfo.release,
        arch: osInfo.arch,
        hostname: osInfo.hostname,
        cpu: {
          manufacturer: cpu.manufacturer,
          brand: cpu.brand,
          cores: cpu.cores,
          physicalCores: cpu.physicalCores,
          speed: cpu.speed
        },
        memory: {
          total: memory.total,
          free: memory.free,
          used: memory.used
        }
      }
    } catch (error) {
      console.error('获取系统信息失败:', error)
      return null
    }
  })
}
