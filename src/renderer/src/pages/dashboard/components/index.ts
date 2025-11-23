/**
 * 银行监控告警系统 - 仪表盘组件包
 *
 * 这个包包含了所有与仪表盘相关的组件，遵循DRY原则，
 * 提供统一的导入导出接口，便于维护和使用。
 *
 * @author Hyphen
 * @date 2025-06-16
 */

// 功能组件
export { default as KeyMetricsSection } from './KeyMetricsSection.vue'
export { default as AlertsSection } from './AlertsSection.vue'
export { default as RegionStatsSection } from './RegionStatsSection.vue'
export { default as SystemStatusSection } from './SystemStatusSection.vue'
export { default as TransactionSection } from './TransactionSection.vue'

// Composables
export { useMetrics } from '../composables/useMetrics'
export { useRegionStats } from '../composables/useRegionStats'
export { useAlerts } from '../composables/useAlerts'
export { useTransactions } from '../composables/useTransactions'
export { useHealthCalculator } from '../composables/useHealthCalculator'
export { useSystemMonitor } from '../composables/useSystemMonitor'

/**
 * 组件版本信息
 */
export const DASHBOARD_PACKAGE_VERSION = '1.0.0'
export const DASHBOARD_PACKAGE_NAME = 'bank-monitor-dashboard'
