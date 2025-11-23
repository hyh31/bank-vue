/**
 * 告警中心类型定义
 */

// 告警状态
export type AlertStatus = 'pending' | 'processing' | 'resolved' | 'ignored'

// 告警级别  
export type AlertLevel = 'critical' | 'warning' | 'info'

// 告警类型
export type AlertType = 'business' | 'system' | 'security' | 'compliance' | 'performance'

// 用户状态
export type UserStatus = 'active' | 'inactive'

// 元数据类型
export type MetadataType = 'string' | 'number' | 'boolean' | 'json'

// 用户接口
export interface User {
  id: number
  username: string
  realName: string
  email?: string
  department: string
  status: 'active' | 'inactive'
}

// 告警标签接口
export interface AlertTag {
  id: number
  alertId: number
  tagName: string
}

// 元数据接口
export interface AlertMetadata {
  id: number
  alertId: number
  metaKey: string
  metaValue: string
  dataType: 'string' | 'number' | 'boolean' | 'json'
}

// 告警项接口
export interface AlertCenterItem {
  id: string
  alertId: string
  alertType: AlertType
  level: AlertLevel
  title: string
  message: string
  description?: string
  source: string
  status: AlertStatus
  assigneedId?: number
  clientId?: string
  createTime: string
  updateTime: string
  resolvedTime?: string
  resolvedByID?: User
  resolutionNote?: string

  assignee?: User
  resolvedBy?: User
  tags?: string[]
  metadata?: AlertMetadata[]
}

// 告警查询参数接口
export interface AlertQueryParams {
  page?: number
  pageSize?: number
  alertType?: AlertType
  level?: AlertLevel
  status?: AlertStatus
  assigneeId?: number
  clientId?: string
  startTime?: string
  endTime?: string
  keyword?: string
  tags?: string[]
}

// 筛选条件接口
export interface AlertFilters {
  levels: AlertLevel[]
  types: AlertType[]
  statuses: AlertStatus[]
  assigneeIds: number[]
  timeRange: {
    start: string
    end: string
  }
  keyword: string
  tags: string[]
}

// 告警统计接口
export interface AlertStats {
  total: number
  pending: number
  processing: number
  resolved: number
  critical: number
  warning: number
  info: number
  byType: Record<AlertType, number>
  byAssignee: Array<{
    assigneeId: number
    assigneeName: string
    count: number
  }>
}

// 分页接口
export interface Pagination {
  page: number
  pageSize: number
  total: number
  totalPages: number
}

// 告警分页响应
export interface AlertPageResponse {
  alerts: AlertCenterItem[]
  total: number
  page: number
  pagesSize: number
  totalPages: number
}

export interface AlertApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  code?: number
  timestamp?: string
  error?: any
}
