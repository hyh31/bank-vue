# 技术文档

## 🏗️ 架构设计

### 整体架构
银行告警监控系统采用 Electron + Vue 3 的桌面应用架构，主要分为三个进程：

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   主进程 (Main)   │    │  预加载 (Preload) │    │ 渲染进程 (Renderer)│
│                 │    │                 │    │                 │
│ • 应用生命周期    │◄──►│ • 安全桥接       │◄──►│ • Vue 3 应用      │
│ • 窗口管理       │    │ • API 暴露       │    │ • 用户界面       │
│ • 系统集成       │    │ • 权限控制       │    │ • 业务逻辑       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### 技术选型理由

#### Electron
- **跨平台**: 一套代码支持 Windows、macOS、Linux
- **Web技术**: 使用熟悉的前端技术栈
- **原生集成**: 可以调用系统API和硬件资源
- **安全性**: 进程隔离和沙箱机制

#### Vue 3
- **组合式API**: 更好的逻辑复用和类型推导
- **性能优化**: Proxy响应式系统，更好的性能
- **TypeScript**: 原生TypeScript支持
- **生态丰富**: 丰富的组件库和工具链

#### shadcn-vue
- **现代设计**: 符合现代UI设计趋势
- **可定制**: 高度可定制的组件系统
- **无障碍**: 内置无障碍访问支持
- **类型安全**: 完整的TypeScript支持

## 🎨 组件设计

### Dashboard 主组件

#### 组件结构
```vue
<template>
  <div class="flex flex-col h-full bg-background">
    <!-- 顶部标题栏 -->
    <HeaderSection />
    
    <!-- 主要内容区域 -->
    <div class="flex-1 p-4 space-y-4 overflow-auto">
      <!-- 关键指标卡片 -->
      <MetricsSection />
      
      <!-- 实时监控区域 -->
      <MonitoringSection />
      
      <!-- 交易数据表格 -->
      <TransactionSection />
    </div>
  </div>
</template>
```

#### 响应式设计
```css
/* 主要断点 */
sm: 640px   /* 手机横屏 */
md: 768px   /* 平板 */
lg: 1024px  /* 笔记本 */
xl: 1280px  /* 桌面 */
2xl: 1536px /* 大屏幕 */

/* 网格布局 */
.grid-cols-4        /* 4列网格 - 关键指标 */
.grid-cols-3        /* 3列网格 - 监控区域 */
.col-span-2         /* 占2列 - 实时告警 */
.col-span-1         /* 占1列 - 统计面板 */
```

### 实时告警组件

#### 滚动动画实现
```typescript
// 无缝循环滚动逻辑
const startAlertAutoScroll = () => {
  alertScrollInterval = setInterval(() => {
    currentAlertIndex.value++
    
    // 无缝重置逻辑
    if (currentAlertIndex.value >= realtimeAlerts.value.length) {
      const container = alertContainer.value
      if (container) {
        // 移除过渡动画
        container.style.transition = 'none'
        currentAlertIndex.value = 0
        
        // 恢复动画
        setTimeout(() => {
          container.style.transition = 'transform 1000ms ease-in-out'
        }, 50)
      }
    }
  }, 3000)
}
```

#### DOM结构
```html
<!-- 固定高度容器 -->
<div class="overflow-hidden relative" style="height: 200px;">
  <!-- 滚动内容 -->
  <div class="transition-transform duration-1000 ease-in-out"
       :style="{ transform: `translateY(-${currentAlertIndex * 100}px)` }">
    
    <!-- 原始告警列表 -->
    <div v-for="alert in realtimeAlerts" :key="alert.id">
      <!-- 告警内容 -->
    </div>
    
    <!-- 复制的告警列表（用于无缝循环） -->
    <div v-for="alert in realtimeAlerts" :key="`copy-${alert.id}`">
      <!-- 告警内容 -->
    </div>
  </div>
</div>
```

### 地域分布组件

#### 车轮式滚动实现
```typescript
// 连续滚动动画
const startRegionAutoScroll = () => {
  isRegionScrolling.value = true
  const itemHeight = 60
  const totalHeight = regionStats.value.length * itemHeight
  
  const scroll = () => {
    if (!isRegionScrolling.value) return
    
    // 每帧移动0.5px，实现平滑滚动
    regionScrollOffset.value += 0.5
    
    // 无缝重置
    if (regionScrollOffset.value >= totalHeight) {
      regionScrollOffset.value = 0
    }
    
    requestAnimationFrame(scroll)
  }
  
  requestAnimationFrame(scroll)
}
```

#### 性能优化
```typescript
// 使用 requestAnimationFrame 而不是 setInterval
// 优势：
// 1. 浏览器优化的60fps刷新率
// 2. 页面不可见时自动暂停
// 3. 更好的性能和电池续航
```

## 🖥️ 系统监控实现

### 真实系统数据获取

#### 依赖安装
```bash
npm install systeminformation os-utils
```

#### 主进程实现
```typescript
// src/main/index.ts
import * as si from 'systeminformation'
import * as os from 'os'

// 设置系统监控IPC处理
function setupSystemMonitoring(): void {
  // 获取系统状态信息
  ipcMain.handle('get-system-status', async () => {
    try {
      // 获取CPU信息
      const cpuLoad = await si.currentLoad()

      // 获取内存信息
      const memory = await si.mem()

      // 获取网络信息
      const networkStats = await si.networkStats()

      return {
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
                  (memory.used / memory.total) > 0.6 ? 'warning' : 'normal'
        },
        network: {
          name: '网络延迟',
          value: `${networkLatency}ms`,
          percentage: Math.max(0, 100 - networkLatency),
          status: networkLatency > 100 ? 'critical' :
                  networkLatency > 50 ? 'warning' : 'normal'
        },
        database: {
          name: '数据库连接',
          value: '正常',
          percentage: 100,
          status: 'normal'
        }
      }
    } catch (error) {
      console.error('获取系统状态失败:', error)
      // 返回错误状态
    }
  })
}
```

#### 预加载脚本桥接
```typescript
// src/preload/index.ts
import { contextBridge, ipcRenderer } from 'electron'

const api = {
  // 系统监控API
  getSystemStatus: (): Promise<SystemStatus> =>
    ipcRenderer.invoke('get-system-status'),
  getSystemInfo: () =>
    ipcRenderer.invoke('get-system-info')
}

// 安全地暴露API到渲染进程
contextBridge.exposeInMainWorld('api', api)
```

#### 类型定义
```typescript
// src/renderer/src/env.d.ts
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

declare global {
  interface Window {
    api: {
      getSystemStatus: () => Promise<SystemStatus>
      getSystemInfo: () => Promise<any>
    }
  }
}
```

#### 渲染进程调用
```typescript
// src/renderer/src/components/Dashboard.vue
const getSystemStatus = async () => {
  try {
    console.log('开始获取系统状态...')

    if (window.api && window.api.getSystemStatus) {
      const systemData = await window.api.getSystemStatus()

      // 更新系统状态列表
      systemStatusList.value = [
        {
          name: systemData.cpu.name,
          value: systemData.cpu.value,
          percentage: systemData.cpu.percentage,
          status: systemData.cpu.status,
          color: getStatusColor(systemData.cpu.status)
        },
        // ... 其他状态
      ]

      console.log('系统状态更新完成:', systemData)
    }
  } catch (error) {
    console.error('获取系统状态失败:', error)
  }
}

// 组件挂载时获取系统状态
onMounted(async () => {
  await getSystemStatus()

  // 每10秒自动刷新系统状态
  setInterval(() => {
    if (!isRefreshing.value) {
      getSystemStatus()
    }
  }, 10000)
})
```

### 系统监控特性

#### 实时数据获取
- **CPU使用率**: 使用 `si.currentLoad()` 获取真实CPU使用率
- **内存使用率**: 使用 `si.mem()` 获取内存使用情况
- **网络状态**: 使用 `si.networkStats()` 获取网络信息
- **系统信息**: 使用 `si.osInfo()` 获取操作系统信息

#### 状态判断逻辑
```typescript
// CPU状态判断
const getCpuStatus = (usage: number) => {
  if (usage > 80) return 'critical'  // 严重：>80%
  if (usage > 60) return 'warning'   // 警告：60-80%
  return 'normal'                    // 正常：<60%
}

// 内存状态判断
const getMemoryStatus = (usage: number) => {
  if (usage > 0.8) return 'critical' // 严重：>80%
  if (usage > 0.6) return 'warning'  // 警告：60-80%
  return 'normal'                    // 正常：<60%
}
```

#### 自动刷新机制
```typescript
// 初始化时立即获取
await getSystemStatus()

// 定时刷新（每10秒）
setInterval(() => {
  if (!isRefreshing.value) {
    getSystemStatus()
  }
}, 10000)
```

### 调试和故障排除

#### 调试信息
```typescript
// 主进程调试
console.log('主进程：收到获取系统状态请求')
console.log('主进程：CPU信息获取成功:', cpuLoad.currentLoad)

// 渲染进程调试
console.log('开始获取系统状态...')
console.log('window.api:', window.api)
console.log('获取到系统数据:', systemData)
```

#### 常见问题解决

1. **API不可用问题**
```typescript
// 检查API是否正确暴露
if (window.api && window.api.getSystemStatus) {
  // API可用
} else {
  console.warn('系统监控API不可用')
  console.log('window对象:', window)
  console.log('可用的属性:', Object.keys(window))
}
```

2. **权限问题**
- 某些系统信息可能需要管理员权限
- 在Windows上可能需要以管理员身份运行

3. **依赖问题**
```bash
# 重新安装依赖
npm uninstall systeminformation
npm install systeminformation
```

4. **类型错误**
- 确保类型定义文件正确
- 检查TypeScript配置

## 📊 数据管理

### 状态管理
```typescript
// 使用 Vue 3 Composition API 进行状态管理
const systemStatus = ref<'normal' | 'warning' | 'critical'>('normal')
const isRefreshing = ref(false)
const realtimeAlerts = ref<AlertItem[]>([])
const regionStats = ref<RegionStat[]>([])
const transactionData = ref<TransactionItem[]>([])
const systemStatusList = ref<SystemComponent[]>([]) // 真实系统状态
```

### 数据流向
```
API/WebSocket ──► 数据获取 ──► 状态更新 ──► 组件渲染 ──► 用户界面
     ▲                                                      │
     └──────────────── 用户交互 ◄─── 事件处理 ◄──────────────┘
```

### 自动刷新机制
```typescript
// 多层次的自动刷新
onMounted(() => {
  // 1. 数据刷新 - 每30秒
  refreshInterval = setInterval(refreshData, 30000)
  
  // 2. 告警滚动 - 每3秒
  startAlertAutoScroll()
  
  // 3. 地域滚动 - 连续60fps
  startRegionAutoScroll()
})
```

## 🎯 性能优化策略

### 渲染优化
1. **虚拟滚动**: 大数据量时只渲染可见区域
2. **组件懒加载**: 按需加载组件
3. **计算属性缓存**: 避免重复计算
4. **事件防抖**: 防止频繁触发

### 内存管理
```typescript
// 组件卸载时清理资源
onUnmounted(() => {
  // 清理定时器
  if (refreshInterval) clearInterval(refreshInterval)
  if (alertScrollInterval) clearInterval(alertScrollInterval)
  
  // 停止动画
  isRegionScrolling.value = false
})
```

### 动画优化
```css
/* 使用 transform 进行硬件加速 */
.scroll-container {
  transform: translateY(-50px);
  will-change: transform;
}

/* 避免重排重绘 */
.card-hover {
  transform: scale(1.02);
  /* 而不是改变 width/height */
}
```

## 🔒 安全实现

### Electron 安全配置
```typescript
// 主进程安全配置
const mainWindow = new BrowserWindow({
  webPreferences: {
    nodeIntegration: false,        // 禁用 Node.js 集成
    contextIsolation: true,        // 启用上下文隔离
    enableRemoteModule: false,     // 禁用远程模块
    preload: path.join(__dirname, 'preload.js')
  }
})
```

### 预加载脚本安全
```typescript
// preload.js - 安全的API暴露
import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  // 只暴露必要的API
  getSystemInfo: () => ipcRenderer.invoke('get-system-info'),
  onDataUpdate: (callback) => ipcRenderer.on('data-update', callback)
})
```

### 数据安全
```typescript
// 敏感信息脱敏
const maskAccount = (account: string) => {
  return account.replace(/(\d{4})\d+(\d{4})/, '$1****$2')
}

// 数据验证
const validateTransactionData = (data: any): TransactionItem => {
  // 类型检查和数据验证
  if (!data.id || typeof data.amount !== 'number') {
    throw new Error('Invalid transaction data')
  }
  return data as TransactionItem
}
```

## 🧪 测试策略

### 单元测试
```typescript
// 使用 Vitest 进行单元测试
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Dashboard from '@/components/Dashboard.vue'

describe('Dashboard', () => {
  it('renders correctly', () => {
    const wrapper = mount(Dashboard)
    expect(wrapper.find('.dashboard-title').text()).toBe('银行告警监控系统')
  })
  
  it('handles alert scrolling', async () => {
    const wrapper = mount(Dashboard)
    // 测试滚动逻辑
  })
})
```

### 集成测试
```typescript
// 使用 Playwright 进行端到端测试
import { test, expect } from '@playwright/test'

test('dashboard loads and displays data', async ({ page }) => {
  await page.goto('/')
  
  // 检查关键元素
  await expect(page.locator('.metrics-card')).toHaveCount(4)
  await expect(page.locator('.alert-item')).toBeVisible()
  
  // 测试交互
  await page.click('.refresh-button')
  await expect(page.locator('.loading-indicator')).toBeVisible()
})
```

## 🚀 部署配置

### 构建配置
```typescript
// electron.vite.config.ts
export default defineConfig({
  main: {
    build: {
      rollupOptions: {
        external: ['electron']
      }
    }
  },
  preload: {
    build: {
      rollupOptions: {
        external: ['electron']
      }
    }
  },
  renderer: {
    build: {
      rollupOptions: {
        input: {
          index: resolve(__dirname, 'src/renderer/index.html')
        }
      }
    }
  }
})
```

### 打包配置
```json
// package.json
{
  "build": {
    "appId": "com.bank.monitoring",
    "productName": "银行告警监控系统",
    "directories": {
      "output": "dist"
    },
    "files": [
      "out/**/*",
      "node_modules/**/*"
    ],
    "win": {
      "target": "nsis",
      "icon": "resources/icon.ico"
    },
    "mac": {
      "target": "dmg",
      "icon": "resources/icon.icns"
    },
    "linux": {
      "target": "AppImage",
      "icon": "resources/icon.png"
    }
  }
}
```

## 📈 监控和日志

### 性能监控
```typescript
// 性能指标收集
const performanceMonitor = {
  startTime: Date.now(),
  
  measureRenderTime: (componentName: string) => {
    const endTime = Date.now()
    console.log(`${componentName} render time: ${endTime - this.startTime}ms`)
  },
  
  measureMemoryUsage: () => {
    if (performance.memory) {
      console.log('Memory usage:', {
        used: Math.round(performance.memory.usedJSHeapSize / 1048576),
        total: Math.round(performance.memory.totalJSHeapSize / 1048576),
        limit: Math.round(performance.memory.jsHeapSizeLimit / 1048576)
      })
    }
  }
}
```

### 错误处理
```typescript
// 全局错误处理
app.config.errorHandler = (err, vm, info) => {
  console.error('Vue error:', err)
  console.error('Component:', vm)
  console.error('Info:', info)
  
  // 发送错误报告
  errorReporter.report({
    error: err.message,
    stack: err.stack,
    component: vm?.$options.name,
    info
  })
}
```

---

这份技术文档详细说明了银行告警监控系统的技术实现细节，为开发者提供了深入的技术参考。
