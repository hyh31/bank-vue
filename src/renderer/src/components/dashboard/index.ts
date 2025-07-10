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
export { default as DataVisualizationDashboard } from '../DataVisualizationDashboard.vue'

// 专门的图表组件
export * from '../charts'

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
 * 从统一的工具函数库导入
 */
export {
  formatCurrency,
  formatPercentage,
  formatDateTime,
  generateId,
  debounce,
  throttle,
  deepClone
} from '@/utils'

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

  // 配置
  DEFAULT_COLORS,
  DEFAULT_CHART_CONFIG,
  DEFAULT_TABLE_CONFIG,

  // 版本信息
  version: DASHBOARD_PACKAGE_VERSION,
  name: DASHBOARD_PACKAGE_NAME
}
