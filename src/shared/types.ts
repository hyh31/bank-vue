// 系统状态接口定义
export interface SystemComponent {
  name: string
  value: string
  percentage: number
  status: 'normal' | 'warning' | 'critical'
  total?: string
  connectionCount?: number
  maxConnections?: number
}

/**
 * 系统状态接口
 */
export interface SystemStatus {
  cpu: SystemComponent
  memory: SystemComponent
  network: SystemComponent
  database: SystemComponent
}

/**
 * 系统信息接口
 */
export interface SystemInfo {
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
