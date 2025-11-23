import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import { SystemStatus } from '@shared/types'

// 数据获取参数接口
interface DataFetchParams {
  dataType?: 'transaction' | 'amount' | 'risk'
}

// 业务数据获取参数接口
interface BusinessDataParams {
  businessType?: 'all' | 'atm' | 'fx'
  analysisType?: 'overview' | 'detailed' | 'comparison'
}

// 总览模式数据获取参数接口
interface OverviewDataParams {
  businessType: 'fx' | 'atm' | 'all'
  timeRange?: 'week' | 'month' | 'quarter'
}

// API响应接口
interface ApiResponse<T = any> {
  success: boolean
  data: T
  message: string
  timestamp?: string
  error?: any
}

// 告警相关参数接口
interface AlertsParams {
  limit?: number
}

interface CreatePerformanceAlertParams {
  level: string
  message: string
  clientId: string
  metrics: string
}

interface ClosePerformanceAlertParams {
  alertId: string
}

// Custom APIs for renderer
const api = {
  // 系统监控API
  getSystemStatus: (): Promise<SystemStatus> => ipcRenderer.invoke('get-system-status'),
  getSystemInfo: () => ipcRenderer.invoke('get-system-info'),

  // 数据获取API
  fetchData: () => ipcRenderer.invoke('fetchData'),
  fetchRegionData: (params?: DataFetchParams): Promise<ApiResponse> => ipcRenderer.invoke('fetch-region-data', params),
  fetchBusinessData: (params?: BusinessDataParams): Promise<ApiResponse> => ipcRenderer.invoke('fetch-business-data', params),

  // 总览模式专用API
  fetchOverviewData: (params: OverviewDataParams): Promise<ApiResponse> =>
    ipcRenderer.invoke('fetch-overview-data', params),

  // 告警相关API
  fetchAlerts: (params?: AlertsParams): Promise<ApiResponse> => ipcRenderer.invoke('fetch-alerts', params),
  createPerformanceAlert: (params: CreatePerformanceAlertParams): Promise<ApiResponse> =>
    ipcRenderer.invoke('create-performance-alert', params),
  closePerformanceAlert: (params: ClosePerformanceAlertParams): Promise<ApiResponse> =>
    ipcRenderer.invoke('close-performance-alert', params)
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
