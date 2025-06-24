/**
 * 业务类型分布组件的TypeScript类型定义
 */

/**
 * 组件属性定义
 */
export interface Props {
  title?: string
  subtitle?: string
  chartHeight?: string
  autoRefresh?: boolean
  refreshInterval?: number
}

/**
 * ATM业务数据接口 - 根据MySQL表结构定义
 */
export interface ATMData {
  // 基础统计
  totalTransactions: number
  totalAmount: number
  avgAmount: number
  percentage: number
  trend: number

  // 省份分布数据 (来自 atm_dist_province)
  provinceData: Array<{
    province: string
    transcation_times: number
    sum_amount: number
  }>

  // 金额分布数据 (来自 atm_dist_amount)
  amountDistribution: Array<{
    amountLevel: string
    total: number
  }>

  // KPI数据 (来自 atm_minute_kpi)
  kpiData: Array<{
    time_stamp: string
    total_time: number
    total_amount: number
    total: number
  }>
}

/**
 * FX外汇业务数据接口
 */
export interface FXData {
  // 基础统计 (total:总交易笔数   sumAmount：总交易金额    avgAmount：平均交易金额     percentage：交易笔数占比     trend：交易笔数增长率)
  total: number
  sumAmount: number
  avgAmount: number
  percentage: number
  trend: number

  // 省份分布数据 (来自 fx_dist_province)
  provinceData: Array<{
    province: string
    total: number
    sum_amount: number
  }>

  // 目的分布数据 (来自 fx_dist_purpose)
  purposeData: Array<{
    purpose: string
    total: number
  }>

  // 币种分布数据 (来自 fx_dist_kind)
  kindData: Array<{
    kind: string
    total: number
  }>

  // 年龄分布数据 (来自 fx_dist_age)
  ageData: Array<{
    ageLevel: string
    total: number
  }>

  // KPI数据 (来自 fx_minute_kpi)
  kpiData: Array<{
    time_stamp: string
    total_time: number
    total_amount: number
    total: number
  }>
}

/**
 * 业务类型枚举
 */
export type BusinessType = 'all' | 'atm' | 'fx'

/**
 * 显示模式枚举
 */
export type DisplayMode = 'overview' | 'detailed' | 'comparison'

/**
 * 趋势方向枚举
 */
export type TrendDirection = 'up' | 'down' | 'stable'

/**
 * 每日交易数据
 */
export interface DailyTransactionData {
  date: string                    // 日期 (YYYY-MM-DD)
  volume: number                  // 当日交易量（笔数）
  amount: number                  // 当日交易金额
}

/**
 * 总览模式专用数据类型
 */
export interface OverviewSummary {
  total: number                    // 总交易量
  sumAmount: number               // 总金额
  trend: number                   // 趋势百分比
}

export interface WeeklyComparison {
  thisWeek: number                // 本周交易量总计
  lastWeek: number                // 上周交易量总计
  percentage: number              // 变化百分比
  dailyData: DailyTransactionData[] // 近7天每日详细数据（用于趋势图表）
}

export interface TopProvince {
  province: string                // 省份名称
  total: number                   // 交易量
  percentage: number              // 占比
}

/**
 * FX总览数据
 */
export interface FXOverviewData {
  summary: OverviewSummary                // FX业务的汇总数据
  weeklyComparison: WeeklyComparison      // FX业务的周对比
  topProvinces: TopProvince[]             // FX业务的热门省份
  quickInsights: string[]                 // FX业务的快速洞察
}

/**
 * ATM总览数据
 */
export interface ATMOverviewData {
  summary: OverviewSummary                // ATM业务的汇总数据
  weeklyComparison: WeeklyComparison      // ATM业务的周对比
  topProvinces: TopProvince[]             // ATM业务的热门省份
  quickInsights: string[]                 // ATM业务的快速洞察
}

/**
 * 全业务总览数据
 */
export interface DashboardOverviewData {
  summary: {
    totalTransactions: number
    totalAmount: number
    activeBusiness: string[]
    riskLevel: 'low' | 'medium' | 'high'
  }
  businessTypes: {
    fx: OverviewSummary
    atm: OverviewSummary
  }
  trends: {
    weekly: WeeklyComparison
    daily: WeeklyComparison
  }
}

/**
 * 后端数据响应接口
 */
export interface BackendDataResponse {
  atm: ATMData
  fx: FXData
}

/**
 * 总览模式后端数据响应接口
 */
export interface OverviewDataResponse {
  fx?: FXOverviewData
  atm?: ATMOverviewData
  dashboard?: DashboardOverviewData
}

/**
 * 后端API请求参数
 */
export interface FetchDataParams {
  businessType: BusinessType
  analysisType: DisplayMode
}
