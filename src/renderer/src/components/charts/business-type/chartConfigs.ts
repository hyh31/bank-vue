/**
 * 业务类型分布组件的ECharts图表配置
 */

import type { ATMData, FXData } from './types'
import { formatNumber, formatCurrency, GRADIENT_COLORS, ATM_COLORS, FX_COLORS } from './utils'

/**
 * 🚀 现代化总览图表配置 - 更炫酷的业务分布展示
 */
export const createModernOverviewChartOption = (atmData: ATMData, fxData: FXData) => {
  const totalTransactions = atmData.totalTransactions + fxData.total
  const atmPercentage = totalTransactions > 0 ? (atmData.totalTransactions / totalTransactions * 100) : 0
  const fxPercentage = totalTransactions > 0 ? (fxData.total / totalTransactions * 100) : 0

  return {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#e5e7eb',
      borderWidth: 1,
      textStyle: {
        color: '#374151',
        fontSize: 12
      },
      formatter: (params: any) => {
        return `
          <div style="padding: 8px;">
            <div style="font-weight: bold; margin-bottom: 4px;">${params.name}</div>
            <div style="display: flex; align-items: center; margin-bottom: 2px;">
              <div style="width: 8px; height: 8px; background: ${params.color}; border-radius: 50%; margin-right: 6px;"></div>
              <span>交易笔数: ${formatNumber(params.value)}</span>
            </div>
            <div>占比: ${params.percent}%</div>
          </div>
        `
      }
    },
    legend: {
      orient: 'horizontal',
      bottom: '5%',
      left: 'center',
      textStyle: {
        color: '#6b7280',
        fontSize: 12
      },
      itemWidth: 12,
      itemHeight: 12,
      itemGap: 20
    },
    series: [
      {
        name: '业务分布',
        type: 'pie',
        radius: ['45%', '75%'],
        center: ['50%', '45%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 8,
          borderColor: '#fff',
          borderWidth: 3,
          shadowBlur: 10,
          shadowColor: 'rgba(0, 0, 0, 0.1)'
        },
        label: {
          show: true,
          position: 'outside',
          formatter: '{b}\n{d}%',
          fontSize: 12,
          fontWeight: 'bold',
          color: '#374151'
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 20,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.2)'
          },
          label: {
            show: true,
            fontSize: 14,
            fontWeight: 'bold'
          }
        },
        data: [
          {
            value: atmData.totalTransactions,
            name: 'ATM业务',
            itemStyle: {
              color: GRADIENT_COLORS.blue
            }
          },
          {
            value: fxData.total,
            name: '外汇业务',
            itemStyle: {
              color: GRADIENT_COLORS.emerald
            }
          }
        ],
        animationType: 'scale',
        animationEasing: 'elasticOut',
        animationDelay: (idx: number) => idx * 200
      }
    ]
  }
}

/**
 * ATM详细分析图表配置 - 显示金额分布
 */
export const createAtmDetailChartOption = (atmData: ATMData) => {
  const amountData = atmData.amountDistribution
  if (!amountData || amountData.length === 0) return {}

  return {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#e5e7eb',
      borderWidth: 1,
      textStyle: {
        color: '#374151',
        fontSize: 11
      },
      formatter: (params: any) => {
        return `
          <div style="font-weight: 600; margin-bottom: 4px;">${params.name}</div>
          <div>交易笔数: ${formatNumber(params.value)}</div>
          <div>占比: ${params.percent}%</div>
        `
      }
    },
    legend: {
      bottom: 10,
      textStyle: {
        color: '#6b7280',
        fontSize: 11
      }
    },
    series: [
      {
        name: 'ATM金额分布',
        type: 'pie',
        radius: ['30%', '60%'],
        center: ['50%', '45%'],
        data: amountData.map((item, index) => ({
          name: item.amountLevel,
          value: item.total,
          itemStyle: {
            color: ATM_COLORS[index % ATM_COLORS.length]
          }
        })),
        itemStyle: {
          borderRadius: 4,
          borderColor: '#fff',
          borderWidth: 1
        }
      }
    ]
  }
}

/**
 * FX详细分析图表配置 - 显示目的分布
 */
export const createFxDetailChartOption = (fxData: FXData) => {
  const purposeData = fxData.purposeData
  if (!purposeData || purposeData.length === 0) return {}

  return {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#e5e7eb',
      borderWidth: 1,
      textStyle: {
        color: '#374151',
        fontSize: 11
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '5%',
      top: '8%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: purposeData.map(item => item.purpose),
      axisLine: {
        lineStyle: { color: '#e5e7eb' }
      },
      axisLabel: {
        color: '#9ca3af',
        fontSize: 10
      }
    },
    yAxis: {
      type: 'value',
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: {
        color: '#9ca3af',
        fontSize: 10
      },
      splitLine: {
        lineStyle: {
          color: '#f3f4f6',
          type: 'dashed'
        }
      }
    },
    series: [
      {
        name: 'FX目的分布',
        type: 'bar',
        data: purposeData.map(item => item.total),
        itemStyle: {
          color: GRADIENT_COLORS.green,
          borderRadius: [4, 4, 0, 0]
        },
        barWidth: '60%'
      }
    ]
  }
}

/**
 * ATM省份分布图表配置
 */
export const createAtmProvinceChartOption = (atmData: ATMData) => {
  const provinceData = atmData.provinceData
  if (!provinceData || provinceData.length === 0) return {}

  return {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#e5e7eb',
      borderWidth: 1,
      textStyle: {
        color: '#374151',
        fontSize: 11
      },
      formatter: (params: any) => {
        return `
          <div style="font-weight: 600; margin-bottom: 4px;">${params.name}</div>
          <div>交易次数: ${formatNumber(params.value)}</div>
          <div>占比: ${params.percent}%</div>
        `
      }
    },
    legend: {
      bottom: 10,
      textStyle: {
        color: '#6b7280',
        fontSize: 11
      }
    },
    series: [
      {
        name: 'ATM省份分布',
        type: 'pie',
        radius: ['30%', '60%'],
        center: ['50%', '45%'],
        data: provinceData.map((item, index) => ({
          name: item.province,
          value: item.transcation_times,
          itemStyle: {
            color: ATM_COLORS[index % ATM_COLORS.length]
          }
        })),
        itemStyle: {
          borderRadius: 4,
          borderColor: '#fff',
          borderWidth: 1
        }
      }
    ]
  }
}

/**
 * FX币种分布图表配置
 */
export const createFxKindChartOption = (fxData: FXData) => {
  const kindData = fxData.kindData
  if (!kindData || kindData.length === 0) return {}

  return {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#e5e7eb',
      borderWidth: 1,
      textStyle: {
        color: '#374151',
        fontSize: 11
      },
      formatter: (params: any) => {
        return `
          <div style="font-weight: 600; margin-bottom: 4px;">${params.name}</div>
          <div>交易次数: ${formatNumber(params.value)}</div>
          <div>占比: ${params.percent}%</div>
        `
      }
    },
    legend: {
      bottom: 5,
      textStyle: {
        color: '#6b7280',
        fontSize: 10
      }
    },
    series: [
      {
        name: 'FX币种分布',
        type: 'pie',
        radius: ['30%', '65%'],
        center: ['50%', '50%'],
        data: kindData.map((item, index) => ({
          name: item.kind,
          value: item.total,
          itemStyle: {
            color: FX_COLORS[index % FX_COLORS.length]
          }
        })),
        itemStyle: {
          borderRadius: 4,
          borderColor: '#fff',
          borderWidth: 1
        }
      }
    ]
  }
}

/**
 * FX年龄分布图表配置
 */
export const createFxAgeChartOption = (fxData: FXData) => {
  const ageData = fxData.ageData
  if (!ageData || ageData.length === 0) return {}

  return {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#e5e7eb',
      borderWidth: 1,
      textStyle: {
        color: '#374151',
        fontSize: 11
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '5%',
      top: '8%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: ageData.map(item => item.ageLevel),
      axisLine: {
        lineStyle: { color: '#e5e7eb' }
      },
      axisLabel: {
        color: '#9ca3af',
        fontSize: 10
      }
    },
    yAxis: {
      type: 'value',
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: {
        color: '#9ca3af',
        fontSize: 10
      },
      splitLine: {
        lineStyle: {
          color: '#f3f4f6',
          type: 'dashed'
        }
      }
    },
    series: [
      {
        name: 'FX年龄分布',
        type: 'bar',
        data: ageData.map(item => item.total),
        itemStyle: {
          color: GRADIENT_COLORS.green,
          borderRadius: [4, 4, 0, 0]
        },
        barWidth: '60%'
      }
    ]
  }
}

/**
 * 对比分析图表配置
 */
export const createComparisonChartOption = (atmData: ATMData, fxData: FXData) => {
  return {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#e5e7eb',
      borderWidth: 1,
      textStyle: {
        color: '#374151',
        fontSize: 12
      }
    },
    legend: {
      top: 10,
      textStyle: {
        color: '#6b7280',
        fontSize: 12
      }
    },
    grid: {
      left: '8%',
      right: '8%',
      bottom: '12%',
      top: '20%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: ['交易笔数', '总金额', '平均金额', '增长率'],
      axisLine: {
        lineStyle: { color: '#e5e7eb' }
      },
      axisLabel: {
        color: '#9ca3af',
        fontSize: 11
      }
    },
    yAxis: [
      {
        type: 'value',
        name: '数值',
        position: 'left',
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: {
          color: '#9ca3af',
          fontSize: 11
        },
        splitLine: {
          lineStyle: {
            color: '#f3f4f6',
            type: 'dashed'
          }
        }
      },
      {
        type: 'value',
        name: '百分比',
        position: 'right',
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: {
          color: '#9ca3af',
          fontSize: 11,
          formatter: '{value}%'
        },
        splitLine: { show: false }
      }
    ],
    series: [
      {
        name: 'ATM业务',
        type: 'bar',
        yAxisIndex: 0,
        data: [
          atmData.totalTransactions / 1000,
          atmData.totalAmount / 10000000,
          atmData.avgAmount / 1000,
          atmData.trend
        ],
        itemStyle: {
          color: GRADIENT_COLORS.blue,
          borderRadius: [4, 4, 0, 0]
        },
        barWidth: '30%'
      },
      {
        name: '外汇业务',
        type: 'bar',
        yAxisIndex: 0,
        data: [
          fxData.total / 1000,
          fxData.sumAmount / 10000000,
          fxData.avgAmount / 1000,
          fxData.trend
        ],
        itemStyle: {
          color: GRADIENT_COLORS.green,
          borderRadius: [4, 4, 0, 0]
        },
        barWidth: '30%'
      }
    ]
  }
}

/**
 * ATM对比分析图表配置
 */
export const createAtmComparisonChartOption = (atmData: ATMData) => {
  const provinceData = atmData.provinceData.map(item => item.transcation_times)

  return {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#e5e7eb',
      borderWidth: 1,
      textStyle: {
        color: '#374151',
        fontSize: 12
      }
    },
    legend: {
      top: 10,
      textStyle: {
        color: '#6b7280',
        fontSize: 12
      }
    },
    grid: {
      left: '8%',
      right: '8%',
      bottom: '12%',
      top: '20%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: ['北京', '上海', '广东', '江苏', '浙江'],
      axisLine: {
        lineStyle: { color: '#e5e7eb' }
      },
      axisLabel: {
        color: '#9ca3af',
        fontSize: 11
      }
    },
    yAxis: {
      type: 'value',
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: {
        color: '#9ca3af',
        fontSize: 11
      },
      splitLine: {
        lineStyle: {
          color: '#f3f4f6',
          type: 'dashed'
        }
      }
    },
    series: [
      {
        name: '省份交易量',
        type: 'bar',
        data: provinceData,
        itemStyle: {
          color: GRADIENT_COLORS.blue,
          borderRadius: [4, 4, 0, 0]
        },
        barWidth: '60%'
      }
    ]
  }
}
