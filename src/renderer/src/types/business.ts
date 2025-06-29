import type { Component } from "vue";

/**
 * 关键指标接口
 */
export interface KeyMetric {
  id: string
  title: string
  value: string | number
  change: string
  trend: 'up' | 'down' | 'stable'
  icon: Component
  iconColor: string
  compareType: 'yesterday' | 'last' | 'week'
}

/**
 * 地域统计接口
 */
export interface RegionStat {
  name: string
  value: string
  percentage: string
  trend: 'up' | 'down' | 'stable'
  change: string
}

/**
 * 交易数据接口
 */
export interface Transaction {
    id: string
    account: string
    amount: number
    type: string
    status: 'success' | 'pending' | 'failed'
    risk: 'high' | 'medium' | 'low'
    timestamp: string
}