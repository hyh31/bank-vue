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
 * 后端数据响应接口
 */
export interface BackendDataResponse {
  atm: ATMData
  fx: FXData
}

/**
 * 后端API请求参数
 */
export interface FetchDataParams {
  businessType: BusinessType
  analysisType: DisplayMode
}
