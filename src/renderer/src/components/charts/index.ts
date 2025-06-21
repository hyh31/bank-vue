/**
 * 银行监控告警系统 - 图表组件包
 * 
 * 这个包包含了所有专门的图表组件，用于数据可视化功能。
 * 每个组件都是独立的、可复用的，并且遵循DRY原则。
 * 
 * @author Hyphen
 * @date 2024-06-16
 */

// 专门的图表组件
export { default as TransactionTrendChart } from './TransactionTrendChart.vue'
export { default as RiskDistributionChart } from './RiskDistributionChart.vue'
export { default as RegionDistributionChart } from './RegionDistributionChart.vue'
export { default as BusinessTypeChart } from './BusinessTypeChart.vue'
export { default as RealtimeDataStream } from './RealtimeDataStream.vue'

/**
 * 图表组件类型定义
 */
export interface ChartComponentProps {
  title?: string
  subtitle?: string
  chartHeight?: string
  autoRefresh?: boolean
  refreshInterval?: number
}

export interface TransactionTrendData {
  timestamp: number
  volume: number
  successRate: number
  errorRate: number
}

export interface RiskDistributionData {
  low: { count: number; percentage: number }
  medium: { count: number; percentage: number }
  high: { count: number; percentage: number }
}

export interface RealtimeMetrics {
  tps: number
  latency: number
  errorRate: number
  connections: number
}

/**
 * 图表配置常量
 */
export const CHART_COLORS = {
  primary: '#3b82f6',      // blue-500
  success: '#10b981',      // green-500
  warning: '#f59e0b',      // yellow-500
  danger: '#ef4444',       // red-500
  info: '#8b5cf6',         // purple-500
  neutral: '#6b7280'       // gray-500
} as const

export const CHART_REFRESH_INTERVALS = {
  fast: 5000,      // 5秒
  normal: 30000,   // 30秒
  slow: 60000,     // 1分钟
  verySlow: 300000 // 5分钟
} as const

/**
 * 图表工具函数
 */

/**
 * 格式化数值显示
 * @param value 数值
 * @param type 格式类型
 * @returns 格式化后的字符串
 */
export const formatChartValue = (value: number, type: 'number' | 'percentage' | 'currency' | 'bytes' = 'number'): string => {
  switch (type) {
    case 'percentage':
      return `${value.toFixed(1)}%`
    case 'currency':
      return `¥${value.toLocaleString()}`
    case 'bytes':
      if (value >= 1024 * 1024 * 1024) {
        return `${(value / (1024 * 1024 * 1024)).toFixed(1)}GB`
      } else if (value >= 1024 * 1024) {
        return `${(value / (1024 * 1024)).toFixed(1)}MB`
      } else if (value >= 1024) {
        return `${(value / 1024).toFixed(1)}KB`
      }
      return `${value}B`
    case 'number':
    default:
      if (value >= 1000000) {
        return `${(value / 1000000).toFixed(1)}M`
      } else if (value >= 1000) {
        return `${(value / 1000).toFixed(1)}K`
      }
      return value.toString()
  }
}

/**
 * 生成时间序列标签
 * @param count 标签数量
 * @param interval 时间间隔（分钟）
 * @returns 时间标签数组
 */
export const generateTimeLabels = (count: number, interval: number = 5): string[] => {
  const labels: string[] = []
  const now = new Date()
  
  for (let i = count - 1; i >= 0; i--) {
    const time = new Date(now.getTime() - i * interval * 60 * 1000)
    labels.push(time.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit'
    }))
  }
  
  return labels
}

/**
 * 生成模拟数据
 * @param count 数据点数量
 * @param min 最小值
 * @param max 最大值
 * @param trend 趋势类型
 * @returns 数据数组
 */
export const generateMockData = (
  count: number, 
  min: number = 0, 
  max: number = 100, 
  trend: 'up' | 'down' | 'stable' | 'random' = 'random'
): number[] => {
  const data: number[] = []
  let baseValue = (min + max) / 2
  
  for (let i = 0; i < count; i++) {
    let value: number
    
    switch (trend) {
      case 'up':
        value = baseValue + (i / count) * (max - min) * 0.5 + (Math.random() - 0.5) * (max - min) * 0.2
        break
      case 'down':
        value = baseValue - (i / count) * (max - min) * 0.5 + (Math.random() - 0.5) * (max - min) * 0.2
        break
      case 'stable':
        value = baseValue + (Math.random() - 0.5) * (max - min) * 0.1
        break
      case 'random':
      default:
        value = min + Math.random() * (max - min)
        break
    }
    
    // 确保值在范围内
    value = Math.max(min, Math.min(max, value))
    data.push(Math.round(value * 100) / 100)
  }
  
  return data
}

/**
 * 计算数据趋势
 * @param data 数据数组
 * @returns 趋势信息
 */
export const calculateTrend = (data: number[]): {
  direction: 'up' | 'down' | 'stable'
  change: number
  changePercent: number
} => {
  if (data.length < 2) {
    return { direction: 'stable', change: 0, changePercent: 0 }
  }
  
  const first = data[0]
  const last = data[data.length - 1]
  const change = last - first
  const changePercent = first !== 0 ? (change / first) * 100 : 0
  
  let direction: 'up' | 'down' | 'stable'
  if (Math.abs(changePercent) < 1) {
    direction = 'stable'
  } else if (change > 0) {
    direction = 'up'
  } else {
    direction = 'down'
  }
  
  return {
    direction,
    change: Math.round(change * 100) / 100,
    changePercent: Math.round(changePercent * 100) / 100
  }
}

/**
 * 获取趋势颜色类名
 * @param direction 趋势方向
 * @returns CSS类名
 */
export const getTrendColorClass = (direction: 'up' | 'down' | 'stable'): string => {
  switch (direction) {
    case 'up':
      return 'text-green-500'
    case 'down':
      return 'text-red-500'
    default:
      return 'text-gray-500'
  }
}

/**
 * 防抖函数（图表专用）
 * @param func 要防抖的函数
 * @param delay 延迟时间
 * @returns 防抖后的函数
 */
export const debounceChart = <T extends (...args: any[]) => any>(
  func: T,
  delay: number = 300
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func.apply(null, args), delay)
  }
}

/**
 * 图表组件版本信息
 */
export const CHARTS_PACKAGE_VERSION = '1.0.0'
export const CHARTS_PACKAGE_NAME = 'bank-monitor-charts'

/**
 * 导出所有图表组件和工具的默认对象
 */
export default {
  // 组件
  TransactionTrendChart,
  RiskDistributionChart,
  RealtimeDataStream,
  
  // 常量
  CHART_COLORS,
  CHART_REFRESH_INTERVALS,
  
  // 工具函数
  formatChartValue,
  generateTimeLabels,
  generateMockData,
  calculateTrend,
  getTrendColorClass,
  debounceChart,
  
  // 版本信息
  version: CHARTS_PACKAGE_VERSION,
  name: CHARTS_PACKAGE_NAME
}
