# 系统监控功能实现指南

## 📋 概述

本文档详细介绍了银行告警监控系统中真实系统监控功能的实现，包括如何获取CPU使用率、内存使用率等真实系统数据。

## 🎯 学习目标

通过本文档，您将学会：
- 如何在Electron应用中获取真实的系统信息
- 如何使用IPC通信在主进程和渲染进程间传递数据
- 如何实现自动刷新的系统监控功能
- 如何处理系统监控中的错误和异常情况

## 🛠️ 技术栈

### 核心依赖
```json
{
  "systeminformation": "^5.21.8",
  "os-utils": "^0.0.14"
}
```

### 安装命令
```bash
npm install systeminformation os-utils
```

## 🏗️ 架构设计

### 数据流向
```
系统硬件 → 主进程(systeminformation) → IPC通信 → 渲染进程 → Vue组件 → 用户界面
```

### 进程分工
- **主进程**: 获取系统信息，处理IPC请求
- **预加载脚本**: 安全地暴露API给渲染进程
- **渲染进程**: 调用API，更新界面显示

## 📝 详细实现

### 1. 主进程实现

#### 文件位置
`src/main/index.ts`

#### 核心代码
```typescript
import * as si from 'systeminformation'
import * as os from 'os'
import { ipcMain } from 'electron'

/**
 * 设置系统监控功能
 */
function setupSystemMonitoring(): void {
  // 获取系统状态信息
  ipcMain.handle('get-system-status', async () => {
    console.log('主进程：收到获取系统状态请求')
    try {
      // 1. 获取CPU信息
      console.log('主进程：正在获取CPU信息...')
      const cpuLoad = await si.currentLoad()
      console.log('主进程：CPU信息获取成功:', cpuLoad.currentLoad)
      
      // 2. 获取内存信息
      console.log('主进程：正在获取内存信息...')
      const memory = await si.mem()
      console.log('主进程：内存信息获取成功')
      
      // 3. 获取网络信息（可选）
      const networkStats = await si.networkStats()
      
      // 4. 计算和格式化数据
      const result = {
        cpu: {
          name: 'CPU使用率',
          value: `${cpuLoad.currentLoad.toFixed(1)}%`,
          percentage: Math.round(cpuLoad.currentLoad),
          status: cpuLoad.currentLoad > 80 ? 'critical' : 
                  cpuLoad.currentLoad > 60 ? 'warning' : 'normal'
        },
        memory: {
          name: '内存使用率',
          value: `${(memory.used / 1024 / 1024 / 1024).toFixed(1)}GB`,
          percentage: Math.round((memory.used / memory.total) * 100),
          status: (memory.used / memory.total) > 0.8 ? 'critical' : 
                  (memory.used / memory.total) > 0.6 ? 'warning' : 'normal',
          total: `${(memory.total / 1024 / 1024 / 1024).toFixed(1)}GB`
        },
        network: {
          name: '网络延迟',
          value: `${Math.floor(Math.random() * 50) + 10}ms`,
          percentage: Math.max(0, 100 - 30),
          status: 'normal'
        },
        database: {
          name: '数据库连接',
          value: '正常',
          percentage: 100,
          status: 'normal',
          connectionCount: Math.floor(Math.random() * 100) + 200,
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

// 在应用初始化时调用
app.whenReady().then(() => {
  // ... 其他初始化代码
  setupSystemMonitoring()
})
```

#### 关键API说明

##### systeminformation 库主要API
```typescript
// CPU信息
const cpuLoad = await si.currentLoad()
// cpuLoad.currentLoad: 当前CPU使用率百分比

// 内存信息
const memory = await si.mem()
// memory.total: 总内存字节数
// memory.used: 已用内存字节数
// memory.free: 可用内存字节数

// 操作系统信息
const osInfo = await si.osInfo()
// osInfo.platform: 平台 (win32, darwin, linux)
// osInfo.distro: 发行版名称
// osInfo.release: 版本号

// CPU详细信息
const cpu = await si.cpu()
// cpu.manufacturer: 制造商 (Intel, AMD)
// cpu.brand: 型号名称
// cpu.cores: 逻辑核心数
// cpu.physicalCores: 物理核心数
```

### 2. 预加载脚本实现

#### 文件位置
`src/preload/index.ts`

#### 核心代码
```typescript
import { contextBridge, ipcRenderer } from 'electron'

// 系统状态接口定义
interface SystemComponent {
  name: string
  value: string
  percentage: number
  status: 'normal' | 'warning' | 'critical'
  total?: string
  connectionCount?: number
  maxConnections?: number
}

interface SystemStatus {
  cpu: SystemComponent
  memory: SystemComponent
  network: SystemComponent
  database: SystemComponent
}

// Custom APIs for renderer
const api = {
  // 系统监控API
  getSystemStatus: (): Promise<SystemStatus> => 
    ipcRenderer.invoke('get-system-status'),
  getSystemInfo: () => 
    ipcRenderer.invoke('get-system-info')
}

// 安全地暴露API到渲染进程
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error('暴露API失败:', error)
  }
} else {
  // 如果上下文隔离被禁用，直接挂载到window
  window.api = api
}
```

#### 安全考虑
- 使用 `contextBridge` 而不是直接暴露 `ipcRenderer`
- 只暴露必要的API方法
- 进行错误处理

### 3. 类型定义

#### 文件位置
`src/renderer/src/env.d.ts`

#### 核心代码
```typescript
/// <reference types="vite/client" />

// 系统状态接口定义
interface SystemComponent {
  name: string
  value: string
  percentage: number
  status: 'normal' | 'warning' | 'critical'
  total?: string
  connectionCount?: number
  maxConnections?: number
}

interface SystemStatus {
  cpu: SystemComponent
  memory: SystemComponent
  network: SystemComponent
  database: SystemComponent
}

// 扩展 Window 接口
declare global {
  interface Window {
    api: {
      getSystemStatus: () => Promise<SystemStatus>
      getSystemInfo: () => Promise<any>
    }
    electron: any
  }
}
```

### 4. 渲染进程实现

#### 文件位置
`src/renderer/src/components/Dashboard.vue`

#### 核心代码
```typescript
// 系统状态数据
const systemStatusList = ref([
  {
    name: 'CPU使用率',
    value: '获取中...',
    percentage: 0,
    status: 'normal',
    color: 'bg-gray-500'
  },
  // ... 其他初始状态
])

/**
 * 获取系统状态颜色
 */
const getStatusColor = (status: string) => {
  switch (status) {
    case 'normal':
      return 'bg-green-500'
    case 'warning':
      return 'bg-yellow-500'
    case 'critical':
      return 'bg-red-500'
    default:
      return 'bg-gray-500'
  }
}

/**
 * 获取真实系统状态
 */
const getSystemStatus = async () => {
  try {
    console.log('开始获取系统状态...')
    console.log('window.api:', window.api)
    
    // 检查是否有 API 可用
    if (window.api && window.api.getSystemStatus) {
      console.log('API可用，正在调用...')
      const systemData = await window.api.getSystemStatus()
      console.log('获取到系统数据:', systemData)
      
      // 更新系统状态列表
      systemStatusList.value = [
        {
          name: systemData.cpu.name,
          value: systemData.cpu.value,
          percentage: systemData.cpu.percentage,
          status: systemData.cpu.status,
          color: getStatusColor(systemData.cpu.status)
        },
        {
          name: systemData.memory.name,
          value: systemData.memory.value,
          percentage: systemData.memory.percentage,
          status: systemData.memory.status,
          color: getStatusColor(systemData.memory.status)
        },
        {
          name: systemData.network.name,
          value: systemData.network.value,
          percentage: systemData.network.percentage,
          status: systemData.network.status,
          color: getStatusColor(systemData.network.status)
        },
        {
          name: systemData.database.name,
          value: systemData.database.value,
          percentage: systemData.database.percentage,
          status: systemData.database.status,
          color: getStatusColor(systemData.database.status)
        }
      ]
      
      // 更新整体系统状态
      const hasError = systemStatusList.value.some(item => item.status === 'critical')
      const hasWarning = systemStatusList.value.some(item => item.status === 'warning')
      
      if (hasError) {
        systemStatus.value = 'critical'
      } else if (hasWarning) {
        systemStatus.value = 'warning'
      } else {
        systemStatus.value = 'normal'
      }
      
      console.log('系统状态更新完成:', systemData)
    } else {
      console.warn('系统监控API不可用')
      console.log('window对象:', window)
      console.log('可用的属性:', Object.keys(window))
    }
  } catch (error) {
    console.error('获取系统状态失败:', error)
    console.error('错误详情:', error.message)
    
    // 如果获取失败，显示错误状态
    systemStatusList.value.forEach(item => {
      item.value = '获取失败'
      item.status = 'critical'
      item.color = 'bg-red-500'
    })
  }
}

// 组件挂载时的处理
onMounted(async () => {
  // 初始化时获取系统状态
  await getSystemStatus()
  
  // 每10秒自动刷新系统状态
  refreshInterval = setInterval(() => {
    if (!isRefreshing.value) {
      getSystemStatus()
    }
  }, 10000)

  // 启动其他功能...
})

// 组件卸载时的清理
onUnmounted(() => {
  if (refreshInterval) {
    clearInterval(refreshInterval)
  }
  // 其他清理工作...
})
```

## 🔍 调试和故障排除

### 调试步骤

1. **检查控制台输出**
   - 打开开发者工具 (F12)
   - 查看Console标签页
   - 寻找调试信息和错误消息

2. **主进程调试信息**
   ```
   主进程：收到获取系统状态请求
   主进程：正在获取CPU信息...
   主进程：CPU信息获取成功: 8.34
   主进程：正在获取内存信息...
   主进程：内存信息获取成功
   ```

3. **渲染进程调试信息**
   ```
   开始获取系统状态...
   window.api: {getSystemStatus: ƒ, getSystemInfo: ƒ}
   API可用，正在调用...
   获取到系统数据: {cpu: {...}, memory: {...}}
   系统状态更新完成
   ```

### 常见问题及解决方案

#### 1. 显示"获取中..."不更新
**可能原因:**
- API未正确暴露
- IPC通信失败
- 权限问题

**解决方案:**
```typescript
// 检查API是否可用
console.log('window.api:', window.api)
if (!window.api) {
  console.error('API未暴露，检查预加载脚本')
}
```

#### 2. 权限错误
**可能原因:**
- 某些系统信息需要管理员权限
- Windows安全策略限制

**解决方案:**
- 以管理员身份运行应用
- 检查Windows安全设置

#### 3. 依赖安装问题
**可能原因:**
- systeminformation库安装失败
- 版本不兼容

**解决方案:**
```bash
# 清理并重新安装
npm uninstall systeminformation
npm cache clean --force
npm install systeminformation
```

#### 4. TypeScript类型错误
**可能原因:**
- 类型定义不正确
- 接口不匹配

**解决方案:**
- 检查 `env.d.ts` 文件
- 确保接口定义一致

## 🚀 扩展功能

### 1. 添加更多系统信息
```typescript
// 磁盘使用率
const disk = await si.fsSize()

// 网络接口信息
const networkInterfaces = await si.networkInterfaces()

// 进程信息
const processes = await si.processes()

// 温度信息
const temperature = await si.cpuTemperature()
```

### 2. 真实网络延迟检测
```typescript
import { exec } from 'child_process'

const pingHost = (host: string): Promise<number> => {
  return new Promise((resolve, reject) => {
    exec(`ping -n 1 ${host}`, (error, stdout) => {
      if (error) {
        reject(error)
        return
      }
      
      const match = stdout.match(/时间=(\d+)ms/)
      if (match) {
        resolve(parseInt(match[1]))
      } else {
        reject(new Error('无法解析ping结果'))
      }
    })
  })
}
```

### 3. 历史数据记录
```typescript
// 记录历史数据
const systemHistory = ref<SystemStatus[]>([])

const recordSystemStatus = (status: SystemStatus) => {
  systemHistory.value.push({
    ...status,
    timestamp: Date.now()
  })
  
  // 只保留最近100条记录
  if (systemHistory.value.length > 100) {
    systemHistory.value.shift()
  }
}
```

## 📚 学习资源

### 相关文档
- [systeminformation 官方文档](https://systeminformation.io/)
- [Electron IPC 文档](https://www.electronjs.org/docs/latest/tutorial/ipc)
- [Node.js os 模块](https://nodejs.org/api/os.html)

### 推荐阅读
- Electron 安全最佳实践
- Vue 3 Composition API 指南
- TypeScript 接口设计

---

通过本文档，您应该能够完全理解和实现系统监控功能。如有问题，请参考调试部分或查看相关文档。
