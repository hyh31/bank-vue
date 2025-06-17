/**
 * 银行监控告警系统 - 工具函数库
 *
 * 提供项目中常用的工具函数，遵循DRY原则，
 * 避免重复代码，提高代码复用性。
 *
 * @author Hyphen
 * @date 2024-06-17
 */

/**
 * 数字格式化工具
 */

/**
 * 格式化货币数值
 * @param value 数值
 * @param currency 货币符号，默认为 ¥
 * @returns 格式化后的货币字符串
 */
export const formatCurrency = (value: number, currency: string = '¥'): string => {
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: currency === '¥' ? 'CNY' : 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value)
}

/**
 * 格式化数字（支持K、M、B单位）
 * @param num 数字
 * @returns 格式化后的字符串
 */
export const formatNumber = (num: number): string => {
  if (num >= 1000000000) {
    return (num / 1000000000).toFixed(1) + 'B'
  } else if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toString()
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
 * 日期时间格式化工具
 */

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
 * 获取相对时间描述
 * @param date 日期
 * @returns 相对时间字符串
 */
export const getRelativeTime = (date: Date | number | string): string => {
  const now = new Date()
  const target = new Date(date)
  const diff = now.getTime() - target.getTime()

  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 0) return `${days}天前`
  if (hours > 0) return `${hours}小时前`
  if (minutes > 0) return `${minutes}分钟前`
  return '刚刚'
}

/**
 * 字符串工具
 */

/**
 * 生成随机ID
 * @param prefix 前缀
 * @returns 随机ID字符串
 */
export const generateId = (prefix: string = 'id'): string => {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * 截断文本
 * @param text 文本
 * @param maxLength 最大长度
 * @returns 截断后的文本
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

/**
 * 性能优化工具
 */

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
 * 对象工具
 */

/**
 * 深拷贝函数
 * @param obj 要拷贝的对象
 * @returns 深拷贝后的对象
 */
export const deepClone = <T>(obj: T): T => {
  if (obj === null || typeof obj !== 'object') return obj
  if (obj instanceof Date) return new Date(obj.getTime()) as unknown as T
  if (obj instanceof Array) return obj.map((item) => deepClone(item)) as unknown as T
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
 * 检查对象是否为空
 * @param obj 对象
 * @returns 是否为空
 */
export const isEmpty = (obj: any): boolean => {
  if (obj == null) return true
  if (Array.isArray(obj)) return obj.length === 0
  if (typeof obj === 'object') return Object.keys(obj).length === 0
  return false
}

/**
 * 数组工具
 */

/**
 * 数组去重
 * @param arr 数组
 * @param key 对象数组的去重键
 * @returns 去重后的数组
 */
export const uniqueArray = <T>(arr: T[], key?: keyof T): T[] => {
  if (!key) {
    return [...new Set(arr)]
  }

  const seen = new Set()
  return arr.filter((item) => {
    const value = item[key]
    if (seen.has(value)) {
      return false
    }
    seen.add(value)
    return true
  })
}

/**
 * 数组分组
 * @param arr 数组
 * @param key 分组键
 * @returns 分组后的对象
 */
export const groupBy = <T>(arr: T[], key: keyof T): Record<string, T[]> => {
  return arr.reduce(
    (groups, item) => {
      const group = String(item[key])
      if (!groups[group]) {
        groups[group] = []
      }
      groups[group].push(item)
      return groups
    },
    {} as Record<string, T[]>
  )
}

/**
 * 颜色工具
 */

/**
 * 获取状态颜色
 * @param status 状态
 * @returns 颜色类名
 */
export const getStatusColor = (status: string): string => {
  const colorMap: Record<string, string> = {
    success: 'text-green-600',
    warning: 'text-yellow-600',
    error: 'text-red-600',
    info: 'text-blue-600',
    pending: 'text-gray-600'
  }
  return colorMap[status] || 'text-gray-600'
}

/**
 * 获取风险等级颜色
 * @param level 风险等级
 * @returns 颜色类名
 */
export const getRiskLevelColor = (level: string): string => {
  const colorMap: Record<string, string> = {
    low: 'text-green-600 bg-green-50',
    medium: 'text-yellow-600 bg-yellow-50',
    high: 'text-red-600 bg-red-50',
    critical: 'text-red-800 bg-red-100'
  }
  return colorMap[level.toLowerCase()] || 'text-gray-600 bg-gray-50'
}

/**
 * 导出所有工具函数
 */
export default {
  // 数字格式化
  formatCurrency,
  formatNumber,
  formatPercentage,

  // 日期时间
  formatDateTime,
  getRelativeTime,

  // 字符串
  generateId,
  truncateText,

  // 性能优化
  debounce,
  throttle,

  // 对象
  deepClone,
  isEmpty,

  // 数组
  uniqueArray,
  groupBy,

  // 颜色
  getStatusColor,
  getRiskLevelColor
}
