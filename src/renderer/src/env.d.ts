/// <reference types="vite/client" />

import { SystemStatus, SystemInfo } from "./types/system"

// 扩展 Window 接口
declare global {
  interface Window {
    api: {
      getSystemStatus: () => Promise<SystemStatus>
      getSystemInfo: () => Promise<SystemInfo>
      fetchData(): Promise<any>
    }
    electron: any
  }
}
