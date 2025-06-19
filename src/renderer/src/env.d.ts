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
      fetchData(): Promise<any>
    }
    electron: any
  }
}
