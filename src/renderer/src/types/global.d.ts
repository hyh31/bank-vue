// 全局类型声明

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

interface SystemInfo {
  platform: string
  distro: string
  release: string
  arch: string
  hostname: string
  cpu: {
    manufacturer: string
    brand: string
    cores: number
    physicalCores: number
    speed: number
  }
  memory: {
    total: number
    free: number
    used: number
  }
}

// 扩展 Window 接口
declare global {
  interface Window {
    api: {
      getSystemStatus: () => Promise<SystemStatus>
      getSystemInfo: () => Promise<SystemInfo>
    }
  }
}

export {}
