/**
 * 银行监控告警系统 - 仪表盘组件包类型定义
 * 
 * 统一管理所有组件的TypeScript类型定义，
 * 确保类型安全和代码可维护性
 * 
 * @author Hyphen
 * @date 2024-06-16
 */

import type { Component } from 'vue'

/**
 * 基础类型定义
 */

// 颜色主题类型
export type ColorTheme = 'blue' | 'green' | 'yellow' | 'purple' | 'red' | 'gray'

// 趋势类型
export type TrendType = 'up' | 'down' | 'neutral'

// 系统状态类型
export type SystemStatus = 'online' | 'warning' | 'error' | 'offline' | 'loading'

// 对齐方式类型
export type AlignType = 'left' | 'center' | 'right'

// 图表类型
export type ChartType = 'bar' | 'line' | 'pie' | 'doughnut' | 'area'

// 进度状态类型
export type ProgressStatus = 'completed' | 'active' | 'pending' | 'error'

// 排序方向类型
export type SortDirection = 'asc' | 'desc'

/**
 * 组件属性接口定义
 */

// 统计卡片数据接口
export interface StatisticItem {
  id: string
  title: string
  value: string | number
  change?: string
  trend?: TrendType
  icon: Component
  color?: ColorTheme
  unit?: string
  description?: string
  isLoading?: boolean
  clickable?: boolean
}

// 进度项数据接口
export interface ProgressItem {
  id: string
  label: string
  value: number
  total: number
  status: ProgressStatus
  color?: string
  details?: string
}

// 表格列配置接口
export interface TableColumn {
  key: string
  label: string
  sortable?: boolean
  width?: string
  align?: AlignType
  formatter?: (value: any, row?: any) => string
  render?: (value: any, row?: any) => string | Component
}

// 表格行数据接口
export interface TableRow {
  id: string | number
  [key: string]: any
}

// 图表数据集接口
export interface ChartDataset {
  label: string
  data: number[]
  backgroundColor?: string | string[]
  borderColor?: string | string[]
  borderWidth?: number
  fill?: boolean
  tension?: number
}

// 图表数据接口
export interface ChartData {
  labels: string[]
  datasets: ChartDataset[]
}

// 图表配置接口
export interface ChartConfig {
  responsive?: boolean
  maintainAspectRatio?: boolean
  plugins?: {
    legend?: {
      display?: boolean
      position?: 'top' | 'bottom' | 'left' | 'right'
    }
    tooltip?: {
      enabled?: boolean
      mode?: 'index' | 'point' | 'nearest'
      intersect?: boolean
    }
  }
  scales?: {
    x?: any
    y?: any
  }
}

/**
 * 组件事件接口定义
 */

// 统计卡片事件
export interface StatCardEvents {
  click: []
}

// 图表容器事件
export interface ChartContainerEvents {
  refresh: []
  timeRangeChange: [value: string]
  chartTypeChange: [type: ChartType]
}

// 数据表格事件
export interface DataTableEvents {
  refresh: []
  rowAction: [action: string, row: TableRow]
  sort: [column: string, direction: SortDirection]
  search: [query: string]
  pageChange: [page: number]
}

// 顶部标题栏事件
export interface TopHeaderEvents {
  addAccount: []
  refresh: []
  export: []
  settings: []
  viewLogs: []
}

/**
 * 配置选项接口
 */

// 默认颜色配置
export interface ColorConfig {
  primary: ColorTheme
  success: ColorTheme
  warning: ColorTheme
  danger: ColorTheme
  info: ColorTheme
  neutral: ColorTheme
}

// 表格配置
export interface TableConfig {
  pageSize: number
  searchable: boolean
  showPagination: boolean
  showRowActions: boolean
  showActions: boolean
  striped?: boolean
  bordered?: boolean
  hover?: boolean
}

// 图表配置
export interface DashboardChartConfig extends ChartConfig {
  height: string
  showTimeRange: boolean
  showChartTypeToggle: boolean
  defaultChartType: ChartType
}

/**
 * API 响应接口
 */

// 通用API响应
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  code?: number
  timestamp?: number
}

// 分页响应
export interface PaginatedResponse<T = any> {
  items: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

// 统计数据响应
export interface StatisticsResponse {
  totalBalance: number
  monthlyIncome: number
  pendingAmount: number
  activeAccounts: number
  changeRates: {
    totalBalance: number
    monthlyIncome: number
    pendingAmount: number
    activeAccounts: number
  }
}

/**
 * 业务数据接口
 */

// 用户信息
export interface UserInfo {
  id: string
  name: string
  email: string
  avatar?: string
  role: string
  department: string
  lastLogin?: Date
}

// 账户信息
export interface AccountInfo {
  id: string
  name: string
  type: 'checking' | 'savings' | 'credit'
  balance: number
  currency: string
  status: 'active' | 'inactive' | 'frozen'
  lastTransaction?: Date
}

// 交易记录
export interface TransactionRecord {
  id: string
  accountId: string
  type: 'income' | 'expense' | 'transfer'
  amount: number
  currency: string
  description: string
  category: string
  date: Date
  status: 'completed' | 'pending' | 'failed'
}

// 告警信息
export interface AlertInfo {
  id: string
  type: 'info' | 'warning' | 'error' | 'critical'
  title: string
  message: string
  source: string
  timestamp: Date
  acknowledged: boolean
  resolved: boolean
}

/**
 * 工具函数类型
 */

// 格式化函数类型
export type CurrencyFormatter = (value: number, currency?: string) => string
export type PercentageFormatter = (value: number, isDecimal?: boolean) => string
export type DateTimeFormatter = (date: Date | number | string, format?: 'date' | 'time' | 'datetime') => string

// 防抖函数类型
export type DebouncedFunction<T extends (...args: any[]) => any> = (
  ...args: Parameters<T>
) => void

// 节流函数类型
export type ThrottledFunction<T extends (...args: any[]) => any> = (
  ...args: Parameters<T>
) => void

/**
 * 组件属性类型
 */

// Dashboard 组件属性
export interface DashboardProps {
  title?: string
  subtitle?: string
  refreshInterval?: number
  autoRefresh?: boolean
}

// StatCard 组件属性
export interface StatCardProps {
  title: string
  value: string | number
  change?: string
  trend?: TrendType
  icon: Component
  color?: ColorTheme
  unit?: string
  description?: string
  isLoading?: boolean
  clickable?: boolean
}

// ChartContainer 组件属性
export interface ChartContainerProps {
  title: string
  subtitle?: string
  chartData?: ChartData
  chartType?: ChartType
  chartHeight?: string
  showTimeRange?: boolean
  showChartTypeToggle?: boolean
  isLoading?: boolean
  hasError?: boolean
  errorMessage?: string
}

// ProgressChart 组件属性
export interface ProgressChartProps {
  title: string
  progressItems: ProgressItem[]
  showPercentage?: boolean
  showSummary?: boolean
  animated?: boolean
}

// DataTable 组件属性
export interface DataTableProps {
  title: string
  columns: TableColumn[]
  data: TableRow[]
  searchable?: boolean
  showPagination?: boolean
  showRowActions?: boolean
  showActions?: boolean
  pageSize?: number
  isLoading?: boolean
}

// TopHeader 组件属性
export interface TopHeaderProps {
  title: string
  subtitle?: string
}

// StatusIndicator 组件属性
export interface StatusIndicatorProps {
  status: SystemStatus
  label: string
  showIcon?: boolean
  isPulsing?: boolean
}

/**
 * 导出所有类型
 */
export type {
  Component
}

/**
 * 常量定义
 */
export const CHART_TYPES: ChartType[] = ['bar', 'line', 'pie', 'doughnut', 'area']
export const COLOR_THEMES: ColorTheme[] = ['blue', 'green', 'yellow', 'purple', 'red', 'gray']
export const SYSTEM_STATUSES: SystemStatus[] = ['online', 'warning', 'error', 'offline', 'loading']
export const PROGRESS_STATUSES: ProgressStatus[] = ['completed', 'active', 'pending', 'error']
