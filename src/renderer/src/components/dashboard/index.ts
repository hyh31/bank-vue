/**
 * 银行监控告警系统 - 仪表盘组件包
 * 
 * 这个包包含了所有与仪表盘相关的组件，遵循DRY原则，
 * 提供统一的导入导出接口，便于维护和使用。
 * 
 * @author Hyphen
 * @date 2024-06-16
 */

// 主要仪表盘组件
export { default as Dashboard } from '../Dashboard.vue'

// 布局和容器组件
export { default as TopHeader } from '../TopHeader.vue'
export { default as StatusIndicator } from '../StatusIndicator.vue'

// 数据展示组件
export { default as StatCard } from '../StatCard.vue'
export { default as ChartContainer } from '../ChartContainer.vue'
export { default as ProgressChart } from '../ProgressChart.vue'
export { default as DataTable } from '../DataTable.vue'

/**
 * 类型定义导出
 * 从独立的类型文件中导出所有类型定义
 */
export * from './types'

/**
 * 组件默认配置
 * 提供统一的默认配置，确保组件行为的一致性
 */

// 默认颜色主题
export const DEFAULT_COLORS = {
  primary: 'blue',
  success: 'green',
  warning: 'yellow',
  danger: 'red',
  info: 'purple',
  neutral: 'gray'
} as const

// 默认图表配置
export const DEFAULT_CHART_CONFIG = {
  height: '300px',
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: true,
      position: 'top' as const
    },
    tooltip: {
      enabled: true,
      mode: 'index' as const,
      intersect: false
    }
  }
}

// 默认表格配置
export const DEFAULT_TABLE_CONFIG = {
  pageSize: 10,
  searchable: true,
  showPagination: true,
  showRowActions: false,
  showActions: true
}

/**
 * 工具函数
 * 提供组件间共享的工具函数
 */

/**
 * 格式化货币数值
 * @param value 数值
 * @param currency 货币符号，默认为 ¥
 * @returns 格式化后的货币字符串
 */
export const formatCurrency = (value: number, currency: string = '¥'): string => {
  return `${currency}${value.toLocaleString()}`
}

/**
 * 格式化百分比
 * @param value 数值 (0-1 或 0-100)
 * @param isDecimal 是否为小数形式 (0-1)
 * @returns 格式化后的百分比字符串
 */
export const formatPercentage = (value: number, isDecimal: boolean = false): string => {
  const percentage = isDecimal ? value * 100 : value
  return `${percentage.toFixed(1)}%`
}

/**
 * 格式化日期时间
 * @param date 日期对象或时间戳
 * @param format 格式类型
 * @returns 格式化后的日期字符串
 */
export const formatDateTime = (
  date: Date | number | string, 
  format: 'date' | 'time' | 'datetime' = 'datetime'
): string => {
  const dateObj = new Date(date)
  
  switch (format) {
    case 'date':
      return dateObj.toLocaleDateString('zh-CN')
    case 'time':
      return dateObj.toLocaleTimeString('zh-CN')
    case 'datetime':
    default:
      return dateObj.toLocaleString('zh-CN')
  }
}

/**
 * 生成随机ID
 * @param prefix 前缀
 * @returns 随机ID字符串
 */
export const generateId = (prefix: string = 'id'): string => {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * 防抖函数
 * @param func 要防抖的函数
 * @param delay 延迟时间（毫秒）
 * @returns 防抖后的函数
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func.apply(null, args), delay)
  }
}

/**
 * 节流函数
 * @param func 要节流的函数
 * @param delay 延迟时间（毫秒）
 * @returns 节流后的函数
 */
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let lastCall = 0
  
  return (...args: Parameters<T>) => {
    const now = Date.now()
    if (now - lastCall >= delay) {
      lastCall = now
      func.apply(null, args)
    }
  }
}

/**
 * 深拷贝函数
 * @param obj 要拷贝的对象
 * @returns 深拷贝后的对象
 */
export const deepClone = <T>(obj: T): T => {
  if (obj === null || typeof obj !== 'object') return obj
  if (obj instanceof Date) return new Date(obj.getTime()) as unknown as T
  if (obj instanceof Array) return obj.map(item => deepClone(item)) as unknown as T
  if (typeof obj === 'object') {
    const clonedObj = {} as T
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key])
      }
    }
    return clonedObj
  }
  return obj
}

/**
 * 组件版本信息
 */
export const DASHBOARD_PACKAGE_VERSION = '1.0.0'
export const DASHBOARD_PACKAGE_NAME = 'bank-monitor-dashboard'

/**
 * 导出所有组件和工具的默认对象
 * 方便一次性导入所有内容
 */
export default {
  // 组件
  Dashboard,
  TopHeader,
  StatusIndicator,
  StatCard,
  ChartContainer,
  ProgressChart,
  DataTable,
  
  // 配置
  DEFAULT_COLORS,
  DEFAULT_CHART_CONFIG,
  DEFAULT_TABLE_CONFIG,
  
  // 工具函数
  formatCurrency,
  formatPercentage,
  formatDateTime,
  generateId,
  debounce,
  throttle,
  deepClone,
  
  // 版本信息
  version: DASHBOARD_PACKAGE_VERSION,
  name: DASHBOARD_PACKAGE_NAME
}
