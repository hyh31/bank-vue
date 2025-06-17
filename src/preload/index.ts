import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

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
  getSystemStatus: (): Promise<SystemStatus> => ipcRenderer.invoke('get-system-status'),
  getSystemInfo: () => ipcRenderer.invoke('get-system-info')
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
