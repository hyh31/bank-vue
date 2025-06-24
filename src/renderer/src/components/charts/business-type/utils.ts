/**
 * 业务类型分布组件的工具函数
 */

import type { ATMData, FXData } from './types'

/**
 * 格式化数字，添加千分位分隔符
 */
export const formatNumber = (value: number | undefined | null): string => {
  if (value === undefined || value === null || isNaN(value)) {
    return '0'
  }
  return value.toLocaleString()
}

/**
 * 格式化货币，转换为万元单位
 */
export const formatCurrency = (value: number | undefined | null): string => {
  if (value === undefined || value === null || isNaN(value)) {
    return '¥0.0万'
  }
  return `¥${(value / 10000).toFixed(1)}万`
}

/**
 * 获取热门币种
 */
export const getTopCurrency = (fxData: FXData): string => {
  if (fxData.kindData.length === 0) return 'USD'
  const sortedKinds = [...fxData.kindData].sort((a, b) => b.total - a.total)
  return sortedKinds[0]?.kind || 'USD'
}

/**
 * 获取主要交易目的
 */
export const getTopPurpose = (fxData: FXData): string => {
  if (fxData.purposeData.length === 0) return '旅游'
  const sortedPurposes = [...fxData.purposeData].sort((a, b) => b.total - a.total)
  return sortedPurposes[0]?.purpose || '旅游'
}

/**
 * 获取最活跃省份
 */
export const getTopProvince = (atmData: ATMData, fxData: FXData): string => {
  // 合并ATM和FX的省份数据，找出交易量最高的省份
  const allProvinces: { [key: string]: number } = {}

  // 添加ATM省份数据
  atmData.provinceData.forEach(item => {
    allProvinces[item.province] = (allProvinces[item.province] || 0) + item.transcation_times
  })

  // 添加FX省份数据
  fxData.provinceData.forEach(item => {
    allProvinces[item.province] = (allProvinces[item.province] || 0) + item.total
  })

  // 找出交易量最高的省份
  const sortedProvinces = Object.entries(allProvinces).sort((a, b) => b[1] - a[1])
  return sortedProvinces[0]?.[0] || '北京'
}

/**
 * 获取ATM交易量最高的省份
 */
export const getTopAtmProvince = (atmData: ATMData): string => {
  if (atmData.provinceData.length === 0) return '北京'
  const sortedProvinces = [...atmData.provinceData].sort((a, b) => b.transcation_times - a.transcation_times)
  return sortedProvinces[0]?.province || '北京'
}

/**
 * 获取ATM主要金额档次
 */
export const getTopAtmAmount = (atmData: ATMData): string => {
  if (atmData.amountDistribution.length === 0) return '1000-5000'
  const sortedAmounts = [...atmData.amountDistribution].sort((a, b) => b.total - a.total)
  return sortedAmounts[0]?.amountLevel || '1000-5000'
}

/**
 * 计算总业务量
 */
export const calculateTotalBusinessCount = (atmData: ATMData, fxData: FXData): number => {
  return atmData.totalTransactions + fxData.total
}

/**
 * 计算活跃省份数量
 */
export const calculateActiveProvinces = (atmData: ATMData, fxData: FXData): number => {
  const atmProvinces = new Set(atmData.provinceData.map(item => item.province))
  const fxProvinces = new Set(fxData.provinceData.map(item => item.province))
  const allProvinces = new Set([...atmProvinces, ...fxProvinces])
  return allProvinces.size
}

/**
 * 生成颜色数组
 */
export const generateColors = (count: number, baseColors: string[]): string[] => {
  const colors: string[] = []
  for (let i = 0; i < count; i++) {
    colors.push(baseColors[i % baseColors.length])
  }
  return colors
}

/**
 * ATM颜色方案
 */
export const ATM_COLORS = ['#3b82f6', '#1d4ed8', '#60a5fa', '#93c5fd', '#dbeafe']

/**
 * FX颜色方案
 */
export const FX_COLORS = ['#10b981', '#059669', '#34d399', '#6ee7b7', '#a7f3d0']

/**
 * 渐变色配置
 */
export const GRADIENT_COLORS = {
  blue: {
    type: 'linear',
    x: 0, y: 0, x2: 1, y2: 1,
    colorStops: [
      { offset: 0, color: '#3b82f6' },
      { offset: 1, color: '#1d4ed8' }
    ]
  },
  green: {
    type: 'linear',
    x: 0, y: 0, x2: 1, y2: 1,
    colorStops: [
      { offset: 0, color: '#10b981' },
      { offset: 1, color: '#059669' }
    ]
  },
  emerald: {
    type: 'linear',
    x: 0, y: 0, x2: 1, y2: 1,
    colorStops: [
      { offset: 0, color: '#10b981' },
      { offset: 1, color: '#047857' }
    ]
  },
  purple: {
    type: 'linear',
    x: 0, y: 0, x2: 0, y2: 1,
    colorStops: [
      { offset: 0, color: '#8b5cf6' },
      { offset: 1, color: '#7c3aed' }
    ]
  }
}
