import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import * as si from 'systeminformation'
import axios from 'axios'
import mysql from 'mysql2/promise'

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

  // 保留原有的仪表盘地域接口
  ipcMain.handle('fetchData', async () => {
    try {
      const response = await axios.get(`http://localhost:9090/Bank/atm/province/yesterday`)
      return response.data
    } catch (error) {
      console.error('Error fetching data:', error)
      throw new Error('无法获取数据')
    }
  })

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
  // 后端API基础URL
  const API_BASE_URL = 'http://localhost:9090'

  // 获取地域分布数据
  ipcMain.handle('fetch-region-data', async (_, params) => {
    const { dataType = 'transaction' } = params || {}
    try {
      // 根据数据类型选择不同的API端点
      let endpoint = ''
      switch (dataType) {
        // 地域分布--交易数量
        case 'transaction':
        // 地域分布--交易金额
        case 'amount':
          endpoint = '/Bank/atm_fx/province/p_c_m/yesterday'
          break
        // 地域分布--风险指数
        case 'risk':
          endpoint = '/Bank/atm/province/risk/yesterday'
          break
        default:
          endpoint = '/Bank/atm/province/yesterday'
      }
      const response = await axios.get(`${API_BASE_URL}${endpoint}`)
      return {
        success: true,
        data: response.data.data || response.data,
        message: '数据获取成功',
        timestamp: new Date().toISOString()
      }
    } catch (error: any) {
      return {
        success: false,
        data: [],
        message: error.message || '数据获取失败',
        error: error.response?.data || error.message
      }
    }
  })

  // 获取业务类型分布数据
  ipcMain.handle('fetch-business-data', async (_, params) => {
    const { businessType = 'all', analysisType = 'overview' } = params || {}
    try {
      console.log('获取业务类型数据:', { businessType, analysisType })

      // 根据业务类型和分析类型选择不同的API端点
      const endpoints = {
        // ATM相关接口
        atm: {
          overview: '/Bank/atm/overview/yesterday',
          province: '/Bank/atm/province/yesterday',
          amount: '/Bank/atm/amount/distribution/yesterday',
          kpi: '/Bank/atm/kpi/yesterday'
        },
        // FX相关接口
        fx: {
          overview: '/Bank/fx/overview/yesterday',
          province: '/Bank/fx/province/yesterday',
          purpose: '/Bank/fx/purpose/yesterday',
          kind: '/Bank/fx/kind/yesterday',
          age: '/Bank/fx/age/yesterday',
          kpi: '/Bank/fx/kpi/yesterday'
        }
      }

      const results: any = {}

      // 获取ATM数据
      if (businessType === 'all' || businessType === 'atm') {
        try {
          // 使用endpoints对象获取ATM数据
          // 使用并发请求
          const[
            atmOverviewResponse,
            atmProvinceResponse,
            atmAmountResponse,
            // atmKpiResponse
          ] = await Promise.allSettled([
            axios.get(`${API_BASE_URL}${endpoints.atm.overview}`),
            axios.get(`${API_BASE_URL}${endpoints.atm.province}`),
            axios.get(`${API_BASE_URL}${endpoints.atm.amount}`),
            // axios.get(`${API_BASE_URL}${endpoints.atm.kpi}`)
          ])
          
          results.atm = {
            overview: atmOverviewResponse.status ==='fulfilled' ? atmOverviewResponse.value.data.data: [],
            province: atmProvinceResponse.status ==='fulfilled' ? atmProvinceResponse.value.data.data: [],
            amount: atmAmountResponse.status ==='fulfilled' ? atmAmountResponse.value.data.data: [],
            // kpi: atmKpiResponse.data.data || atmKpiResponse.data
          }
        } catch (error) {
          console.warn('获取ATM数据失败:', error)
          results.atm = { overview: [], province: [], amount: [], kpi: [] }
        }
      }

      // 获取FX数据
      if (businessType === 'all' || businessType === 'fx') {
        try {
          // 使用并发请求
          // 使用endpoints对象获取FX数据
          // 并发请求，部分失败不影响其他
          const fxresults = await Promise.allSettled([
            axios.get(`${API_BASE_URL}${endpoints.fx.province}`),
            axios.get(`${API_BASE_URL}${endpoints.fx.purpose}`),
            axios.get(`${API_BASE_URL}${endpoints.fx.kind}`),
            axios.get(`${API_BASE_URL}${endpoints.fx.age}`)
          ])

          // 安全地提取数据
          const [provinceResult, purposeResult, kindResult, ageResult] = fxresults
          results.fx = {
            province: provinceResult.status === 'fulfilled' ? provinceResult.value.data.data : [],
            purpose: purposeResult.status === 'fulfilled' ? purposeResult.value.data.data : [],
            kind: kindResult.status === 'fulfilled' ? kindResult.value.data.data : [],
            age: ageResult.status === 'fulfilled' ? ageResult.value.data.data : []
          }
        } catch (error) {
          console.warn('获取FX数据失败:', error)
          results.fx = { province: [], purpose: [], kind: [], age: [] }
        }
      }

      return {
        success: true,
        data: results,
        message: '业务数据获取成功',
        timestamp: new Date().toISOString()
      }
    } catch (error: any) {
      console.error('获取业务数据失败:', error)
      return {
        success: false,
        data: {},
        message: error.message || '业务数据获取失败',
        error: error.response?.data || error.message
      }
    }
  })

  // 获取总览数据
  ipcMain.handle('fetch-overview-data', async (_, params) => {
    const { businessType = 'all', timeRange = 'week' } = params || {}
    try {
      console.log('获取总览数据:', { businessType, timeRange })

      // 根据业务类型选择不同的API端点
      const result: any = {}

      const endpoints = {
        atm: '/Bank/atm/overview/yesterday',
        fx: '/Bank/fx/overview/yesterday',
        all: '/Bank/overview/dashboard'
      }

      // 获取ATM总览数据
      if (businessType === 'atm' || businessType === 'all') {
        try {
          const response = await axios.get(`${API_BASE_URL}${endpoints.atm}`)
          result.atm = response.data.data || response.data
        } catch(error) {
          console.warn('获取ATM总览数据失败:', error)
          result.atm = {}
        }
      }
      
      // 获取Fx总览数据
      if (businessType === 'fx' || businessType === 'all') {
        try {
          const response = await axios.get(`${API_BASE_URL}${endpoints.fx}`)
          result.fx = response.data.data || response.data
        } catch(error) {
          console.warn('获取FX总览数据失败:', error)
          result.fx = {}
        }
      }
      return {
        success: true,
        data: result,
        message: '总览数据获取成功',
        timestamp: new Date().toISOString()
      }

    } catch (error: any) {
      console.error('获取总览数据失败:', error)
      return {
        success: false,
        data: {},
        message: error.message || '总览数据获取失败',
        error: error.response?.data || error.message
      }
    }
  })
}
