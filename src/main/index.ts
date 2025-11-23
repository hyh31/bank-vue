import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import * as si from 'systeminformation'
import mysql from 'mysql2/promise'
import { fetchBusinessDataHandler } from '../shared/handlers/fetch-business-data'
import { fetchOverviewDataHandler } from '../shared/handlers/fetch-overview-data'
import { fetchDataHandler } from '../shared/handlers/fetchData'
import { fetchRegionDataHandler } from '../shared/handlers/fetch-region-data'
import {
  fetchAlertsHandler,
  createPerformanceAlertHandler,
  closePerformanceAlertHandler
} from '../shared/handlers/fetch-alerts'

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

  // 数据获取 IPC 处理
  setupDataFetching()
  
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

// 连接数据库配置
const dbConfig = {
  host: '192.168.200.101',
  user: 'root',
  password: '123456',
  database: 'offline_db1'
}

/**
 * 设置系统监控功能
 */
function setupSystemMonitoring(): void {
  // 获取系统状态信息
  ipcMain.handle('get-system-status', async () => {
    console.log('主进程：收到获取系统状态请求')
    try {
      // 获取CPU信息
      const cpuLoad = await si.currentLoad()
      // 获取内存信息
      const memory = await si.mem()
      // 获取网络信息  （获取百度ping的测试延迟）
      const networkStats = await si.inetLatency('www.baidu.com')

      // 获取数据库连接信息
      let dbStats
      try {
        const connection = await mysql.createConnection(dbConfig)
        await connection.query('SHOW DATABASES')
        await connection.end()
        dbStats = {
          name: 'MySql数据库',
          value: '已连接',
          percentage: 100,
          status: 'normal'
        }
      } catch (error) {
        dbStats = {
          name: 'MySql数据库',
          value: '未连接',
          percentage: 0,
          status: 'critical'
        }
      }

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
          value: `${networkStats}ms`,
          percentage: Math.max(0, 100 - (networkStats / 200) * 100), // 延迟越低，百分比越高
          status: networkStats > 200 ? 'critical' : networkStats > 100 ? 'warning' : 'normal'
        },
        database: dbStats
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

/**
 * 设置数据获取功能
 */
function setupDataFetching(): void {
  // 保留原有的仪表盘地域接口
  ipcMain.handle('fetchData', fetchDataHandler)

  // 获取业务类型分布数据
  ipcMain.handle('fetch-business-data', fetchBusinessDataHandler)

  // 获取总览数据
  ipcMain.handle('fetch-overview-data', fetchOverviewDataHandler)

  // 获取地域分布数据
  ipcMain.handle('fetch-region-data', fetchRegionDataHandler)

  // 告警相关的handlers
  ipcMain.handle('fetch-alerts', fetchAlertsHandler)
  ipcMain.handle('create-performance-alert', createPerformanceAlertHandler)
  ipcMain.handle('close-performance-alert', closePerformanceAlertHandler)
}
