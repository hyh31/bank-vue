<template>
  <!--总览模式 - 简洁版 -->
  <div class="h-full p-4 space-y-6 overflow-y-auto">
    <!-- 核心KPI指标 - 紧凑设计 -->
    <div class="grid grid-cols-3 gap-4">
      <!-- 第一个指标：交易量 -->
      <div class="group overview-kpi-card bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 rounded-xl p-4 text-white relative overflow-hidden cursor-pointer transform hover:scale-[1.02] transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20">
        <!-- 简化的背景装饰 -->
        <div class="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-10 translate-x-10 group-hover:scale-110 transition-transform duration-500"></div>

        <div class="relative z-10">
          <div class="flex items-center justify-between mb-2">
            <div class="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center group-hover:rotate-6 transition-transform duration-300">
              <Target class="w-4 h-4 text-white" />
            </div>
            <div class="text-xs bg-white/20 px-2 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              {{ getBusinessTypeLabel() }}
            </div>
          </div>
          <div class="space-y-1">
            <div class="text-xs font-medium opacity-90">{{ getTransactionVolumeLabel() }}</div>
            <div class="text-xl font-bold data-number">{{ formatNumber(getTransactionVolume()) }}</div>
            <div class="text-xs opacity-75 flex items-center" :class="getTrendColorClass()">
              <component :is="getTrendIcon()" class="w-3 h-3 mr-1" />
              {{ getTrendText() }}
            </div>
          </div>
        </div>
      </div>

      <!-- 第二个指标：交易金额 -->
      <div class="group overview-kpi-card bg-gradient-to-br from-emerald-500 via-emerald-600 to-emerald-700 rounded-xl p-4 text-white relative overflow-hidden cursor-pointer transform hover:scale-[1.02] transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/20">
        <div class="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-10 translate-x-10 group-hover:scale-110 transition-transform duration-500"></div>

        <div class="relative z-10">
          <div class="flex items-center justify-between mb-2">
            <div class="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center group-hover:rotate-6 transition-transform duration-300">
              <DollarSign class="w-4 h-4 text-white" />
            </div>
            <div class="text-xs bg-white/20 px-2 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              金额
            </div>
          </div>
          <div class="space-y-1">
            <div class="text-xs font-medium opacity-90">{{ getAmountLabel() }}</div>
            <div class="text-xl font-bold data-number">{{ formatCurrency(getTotalAmount()) }}</div>
            <div class="text-xs opacity-75 flex items-center">
              <DollarSign class="w-3 h-3 mr-1" />
              {{ getAvgAmount() }}
            </div>
          </div>
        </div>
      </div>

      <!-- 第三个指标：业务占比或活跃省份 -->
      <div class="group overview-kpi-card bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700 rounded-xl p-4 text-white relative overflow-hidden cursor-pointer transform hover:scale-[1.02] transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/20">
        <div class="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-10 translate-x-10 group-hover:scale-110 transition-transform duration-500"></div>

        <div class="relative z-10">
          <div class="flex items-center justify-between mb-2">
            <div class="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center group-hover:rotate-6 transition-transform duration-300">
              <Globe class="w-4 h-4 text-white" />
            </div>
            <div class="text-xs bg-white/20 px-2 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              {{ getThirdMetricType() }}
            </div>
          </div>
          <div class="space-y-1">
            <div class="text-xs font-medium opacity-90">{{ getThirdMetricLabel() }}</div>
            <div class="text-xl font-bold data-number">{{ getThirdMetricValue() }}</div>
            <div class="text-xs opacity-75 flex items-center">
              <Globe class="w-3 h-3 mr-1" />
              {{ getThirdMetricDescription() }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 📈 趋势图表区域 -->
    <div class="modern-trend-chart bg-gradient-to-br from-white via-gray-50/50 to-blue-50/30 rounded-xl p-6 border border-gray-100/60 shadow-lg">
      <div class="flex items-center justify-between mb-4">
        <div class="trend-header">
          <h3 class="text-lg font-bold text-gray-800 trend-title">{{ getTrendTitle() }}</h3>
          <p class="text-sm text-gray-600 trend-subtitle">{{ getTrendSubtitle() }}</p>
        </div>
        <div class="flex items-center space-x-2 text-xs text-gray-500 trend-indicator">
          <div class="trend-dot w-2 h-2 rounded-full" :class="getTrendDotClass()"></div>
          <span class="trend-label">近7天趋势</span>
        </div>
      </div>

      <div class="h-48 relative chart-container">
        <v-chart
          ref="trendChartRef"
          class="w-full h-full trend-chart"
          :option="trendChartOption"
          :autoresize="true"
        />
      </div>
    </div>


  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Target,
  DollarSign,
  Globe
} from 'lucide-vue-next'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  GridComponent
} from 'echarts/components'
import VChart from 'vue-echarts'
import type { ATMData, FXData } from './types'
import { formatNumber, formatCurrency } from './utils'

// 注册 ECharts 组件
use([
  CanvasRenderer,
  LineChart,
  TitleComponent,
  TooltipComponent,
  GridComponent
])

// 导入总览模式专用的类型
import type {
  OverviewDataResponse
} from './types'

/**
 * 组件属性
 */
interface Props {
  atmData: ATMData
  fxData: FXData
  overviewData?: OverviewDataResponse
  selectedBusinessType?: 'all' | 'atm' | 'fx'
}

const props = withDefaults(defineProps<Props>(), {
  selectedBusinessType: 'all'
})

/**
 * 响应式引用
 */
const trendChartRef = ref<InstanceType<typeof VChart> | null>(null)

// 业务类型标签
const getBusinessTypeLabel = () => {
  switch (props.selectedBusinessType) {
    case 'fx': return '外汇'
    case 'atm': return 'ATM'
    default: return '总计'
  }
}

// 交易量标签
const getTransactionVolumeLabel = () => {
  switch (props.selectedBusinessType) {
    case 'fx': return '近一周外汇交易量'
    case 'atm': return 'ATM交易量'
    default: return '总交易量'
  }
}

// 交易量数值
const getTransactionVolume = () => {
  if (!props.overviewData) return 0

  switch (props.selectedBusinessType) {
    case 'fx':
      return props.overviewData.fx?.summary.total || 0
    case 'atm':
      return props.overviewData.atm?.summary.total || 0
    default:
      return props.overviewData.dashboard?.summary.totalTransactions || 0
  }
}

// 趋势数值 
const getTrend = () => {
  if (!props.overviewData) return 0

  switch (props.selectedBusinessType) {
    case 'fx':
      return props.overviewData?.fx?.summary.trend || 0
    case 'atm':
      return props.overviewData?.atm?.summary.trend || 0
    default:
      return props.overviewData?.dashboard?.trends.weekly.percentage || 0
  }
}

// 金额标签
const getAmountLabel = () => {
  switch (props.selectedBusinessType) {
    case 'fx': return '近一周外汇总金额'
    case 'atm': return 'ATM金额'
    default: return '总金额'
  }
}

// 总金额
const getTotalAmount = () => {
  if (!props.overviewData) return 0

  switch (props.selectedBusinessType) {
    case 'fx':
      return props.overviewData?.fx?.summary.sumAmount || 0
    case 'atm':
      return props.overviewData?.atm?.summary.sumAmount || 0
    default:
      return props.overviewData.dashboard?.summary.totalAmount || 0
  }
}

// 平均金额
const getAvgAmount = () => {
  const weeklyAvgAmount = getTotalAmount() / 7
  const avgAmountFormatted = formatCurrency(weeklyAvgAmount)
  return `日均${avgAmountFormatted}`
}

// 第三个指标类型
const getThirdMetricType = () => {
  return props.selectedBusinessType === 'all' ? '分布' : '地区'
}

// 第三个指标标签
const getThirdMetricLabel = () => {
  switch (props.selectedBusinessType) {
    case 'fx': return '近一周活跃省份'
    case 'atm': return '活跃省份'
    default: return '业务分布'
  }
}

// 第三个指标数值
const getThirdMetricValue = () => {
  switch (props.selectedBusinessType) {
    case 'fx': return `${props.overviewData?.fx?.topProvinces || 0}个`
    case 'atm': return `${props.overviewData?.atm?.topProvinces?.length || 0}个`
    default: return `${props.fxData.percentage}% FX`      // TODO 可能后期看需要的指标然后再改
  }
}

// 第三个指标描述
const getThirdMetricDescription = () => {
  switch (props.selectedBusinessType) {
    case 'fx': return '覆盖范围广泛'
    case 'atm': return '覆盖范围广泛'
    default: return `${props.atmData.percentage}% ATM`
  }
}

// 趋势图标题
const getTrendTitle = () => {
  switch (props.selectedBusinessType) {
    case 'fx': return '近一周外汇业务趋势'
    case 'atm': return 'ATM业务趋势'
    default: return '业务发展趋势'
  }
}

// 趋势图副标题
const getTrendSubtitle = () => {
  switch (props.selectedBusinessType) {
    case 'fx': return '外汇交易量变化趋势及预测'
    case 'atm': return 'ATM交易量变化趋势及预测'
    default: return '整体业务量变化趋势及预测'
  }
}

// 趋势指示点样式
const getTrendDotClass = () => {
  switch (props.selectedBusinessType) {
    case 'fx': return 'bg-emerald-500'
    case 'atm': return 'bg-blue-500'
    default: return 'bg-purple-500'
  }
}

// 趋势图标
const getTrendIcon = () => {
  const trend = getTrend()
  if (trend > 0) return TrendingUp
  if (trend < 0) return TrendingDown
  return Minus
}

// 趋势文本
const getTrendText = () => {
  const trend = getTrend()
  if (trend > 0) return `+${trend.toFixed(1)}%`
  if (trend < 0) return `${trend.toFixed(1)}%`
  return '0.0%'
}

// 趋势颜色样式
const getTrendColorClass = () => {
  const trend = getTrend()
  if (trend > 0) return 'text-yellow-300'  // 亮黄色，在深色背景上清晰可见
  if (trend < 0) return 'text-red-300'     // 亮红色，在深色背景上清晰可见
  return 'text-gray-300'                   // 亮灰色，在深色背景上清晰可见
}


const generateTrendData = () => {
  // 获取真实日志数据
  const dailyData = props.overviewData?.fx?.weeklyComparison?.dailyData || []

  // 如果没有就返回全部虚拟的0
  if (dailyData.length === 0) {
    return {
      days: ['6天前', '5天前', '4天前', '3天前', '2天前', '昨天', '今天'],
      data: [0, 0, 0, 0, 0, 0, 0]
    }
  }

  // 处理数据
  const days: string[] = []
  const data: number[] = []

  dailyData.forEach((item) => {
    // 格式化日期显示
    const itemDate = new Date(item.date + 'T00:00:00') // 确保日期格式正确
    const today = new Date()
    today.setHours(0, 0, 0, 0) // 重置时间为当天开始
    itemDate.setHours(0, 0, 0, 0) // 重置时间为当天开始

    const diffDays = Math.floor((today.getTime() - itemDate.getTime()) / (1000 * 60 * 60 * 24))

    if (diffDays === 0) {
      days.push('今天')
    } else if (diffDays === 1) {
      days.push('昨天')
    } else if (diffDays === 2) {
      days.push('前天')
    } else if (diffDays > 0) {
      days.push(`${diffDays}天前`)
    } else {
      // 处理未来日期的情况
      days.push('今天')
    }

    // 确保 volume 不为 undefined 或 null
    const volume = item.volume || 0
    data.push(volume)
  })

  return { days, data }
}

// 现代化趋势图配置
const trendChartOption = computed(() => {
  const { days, data } = generateTrendData()

  return {
    animation: true,
    animationDuration: 2000,
    animationEasing: 'cubicOut' as const,
    animationDelay: (idx: number) => idx * 100,

    grid: {
      left: '3%',
      right: '4%',
      bottom: '8%',
      top: '10%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: days,
      axisLine: {
        lineStyle: {
          color: '#e5e7eb',
          width: 2
        }
      },
      axisLabel: {
        color: '#6b7280',
        fontSize: 11,
        fontWeight: 500,
        margin: 12
      },
      axisTick: {
        show: false
      }
    },
    yAxis: {
      type: 'value',
      axisLine: {
        show: false
      },
      axisTick: {
        show: false
      },
      axisLabel: {
        color: '#6b7280',
        fontSize: 11,
        fontWeight: 500,
        formatter: (value: number) => formatNumber(value)
      },
      splitLine: {
        lineStyle: {
          color: '#f3f4f6',
          type: 'dashed',
          width: 1
        }
      }
    },
    series: [
      {
        data: data,
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 8,
        showSymbol: true,
        // 🌟 现代化线条样式
        lineStyle: {
          color: props.selectedBusinessType === 'fx' ? '#10b981' :
                 props.selectedBusinessType === 'atm' ? '#3b82f6' : '#8b5cf6',
          width: 4,
          shadowColor: props.selectedBusinessType === 'fx' ? 'rgba(16, 185, 129, 0.3)' :
                       props.selectedBusinessType === 'atm' ? 'rgba(59, 130, 246, 0.3)' : 'rgba(139, 92, 246, 0.3)',
          shadowBlur: 10,
          shadowOffsetY: 2
        },
        // 🎯 现代化数据点样式
        itemStyle: {
          color: props.selectedBusinessType === 'fx' ? '#10b981' :
                 props.selectedBusinessType === 'atm' ? '#3b82f6' : '#8b5cf6',
          borderColor: '#ffffff',
          borderWidth: 3,
          shadowColor: props.selectedBusinessType === 'fx' ? 'rgba(16, 185, 129, 0.4)' :
                       props.selectedBusinessType === 'atm' ? 'rgba(59, 130, 246, 0.4)' : 'rgba(139, 92, 246, 0.4)',
          shadowBlur: 8
        },
        // 🌈 现代化渐变填充
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              {
                offset: 0,
                color: props.selectedBusinessType === 'fx' ? 'rgba(16, 185, 129, 0.4)' :
                       props.selectedBusinessType === 'atm' ? 'rgba(59, 130, 246, 0.4)' : 'rgba(139, 92, 246, 0.4)'
              },
              {
                offset: 0.5,
                color: props.selectedBusinessType === 'fx' ? 'rgba(16, 185, 129, 0.2)' :
                       props.selectedBusinessType === 'atm' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(139, 92, 246, 0.2)'
              },
              {
                offset: 1,
                color: props.selectedBusinessType === 'fx' ? 'rgba(16, 185, 129, 0.05)' :
                       props.selectedBusinessType === 'atm' ? 'rgba(59, 130, 246, 0.05)' : 'rgba(139, 92, 246, 0.05)'
              }
            ]
          },
          shadowColor: props.selectedBusinessType === 'fx' ? 'rgba(16, 185, 129, 0.2)' :
                       props.selectedBusinessType === 'atm' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(139, 92, 246, 0.2)',
          shadowBlur: 20
        },
        // ✨ 数据点高亮效果
        emphasis: {
          itemStyle: {
            color: props.selectedBusinessType === 'fx' ? '#059669' :
                   props.selectedBusinessType === 'atm' ? '#2563eb' : '#7c3aed',
            borderColor: '#ffffff',
            borderWidth: 4,
            shadowColor: props.selectedBusinessType === 'fx' ? 'rgba(5, 150, 105, 0.6)' :
                         props.selectedBusinessType === 'atm' ? 'rgba(37, 99, 235, 0.6)' : 'rgba(124, 58, 237, 0.6)',
            shadowBlur: 15,
            scale: 1.5
          }
        }
      }
    ],
    // 🎪 现代化提示框
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(255, 255, 255, 0.98)',
      borderColor: props.selectedBusinessType === 'fx' ? '#10b981' :
                   props.selectedBusinessType === 'atm' ? '#3b82f6' : '#8b5cf6',
      borderWidth: 2,
      borderRadius: 12,
      padding: [12, 16],
      textStyle: {
        color: '#374151',
        fontSize: 13,
        fontWeight: 500
      },
      extraCssText: 'box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12); backdrop-filter: blur(8px);',
      formatter: (params: any) => {
        const point = params[0]
        const trendIcon = point.dataIndex === data.length - 1 ? '📈' : '📊'
        const value = point.value || 0  // 确保 value 不为 undefined
        return `
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 16px;">${trendIcon}</span>
            <div>
              <div style="font-weight: 600; margin-bottom: 4px;">${point.name}</div>
              <div style="color: ${point.color};">交易量: ${formatNumber(value)}</div>
            </div>
          </div>
        `
      }
    }
  }
})
</script>

<style scoped>
/* 1. KPI卡片的呼吸和悬浮效果 */
@keyframes overview-card-float {
  0%, 100% {
    transform: translateY(0px) scale(1);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  }
  50% {
    transform: translateY(-3px) scale(1.02);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  }
}

/* 📈 现代化趋势图表动画效果 */

/* 1. 趋势图表容器的浮动效果 */
@keyframes trend-chart-float {
  0%, 100% {
    transform: translateY(0px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08);
  }
  50% {
    transform: translateY(-2px);
    box-shadow: 0 15px 35px rgba(0, 0, 0, 0.12);
  }
}

.modern-trend-chart {
  animation: trend-chart-float 6s ease-in-out infinite;
  transition: all 0.3s ease;
}

.modern-trend-chart:hover {
  animation-play-state: paused;
  transform: translateY(-5px) !important;
  box-shadow: 0 20px 45px rgba(0, 0, 0, 0.15) !important;
}

/* 2. 趋势图表标题动画 */
@keyframes trend-title-glow {
  0%, 100% {
    text-shadow: 0 0 5px rgba(59, 130, 246, 0.3);
  }
  50% {
    text-shadow: 0 0 15px rgba(59, 130, 246, 0.5);
  }
}

.trend-title {
  animation: trend-title-glow 4s ease-in-out infinite;
}

/* 3. 趋势指示点脉冲效果 */
@keyframes trend-dot-pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.3);
    opacity: 0.8;
  }
}

.trend-dot {
  animation: trend-dot-pulse 2s ease-in-out infinite;
  box-shadow: 0 0 10px currentColor;
}

/* 4. 趋势标签淡入淡出 */
@keyframes trend-label-fade {
  0%, 100% {
    opacity: 0.7;
  }
  50% {
    opacity: 1;
  }
}

.trend-label {
  animation: trend-label-fade 3s ease-in-out infinite;
}

/* 5. 图表容器样式 */
.chart-container {
  position: relative;
}

/* 6. 图表本身的入场动画 */
.trend-chart {
  animation: chart-fade-in 1s ease-out;
}

@keyframes chart-fade-in {
  0% {
    opacity: 0;
    transform: scale(0.95);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

/* 7. 趋势头部区域动画 */
.trend-header {
  animation: trend-header-slide 1s ease-out;
}

@keyframes trend-header-slide {
  0% {
    opacity: 0;
    transform: translateX(-20px);
  }
  100% {
    opacity: 1;
    transform: translateX(0);
  }
}

/* 8. 趋势指示器动画 */
.trend-indicator {
  animation: trend-indicator-slide 1s ease-out 0.3s both;
}

@keyframes trend-indicator-slide {
  0% {
    opacity: 0;
    transform: translateX(20px);
  }
  100% {
    opacity: 1;
    transform: translateX(0);
  }
}

.overview-kpi-card {
  animation: overview-card-float 4s ease-in-out infinite;
  background-size: 200% 200%;
}

/* 错开KPI卡片动画时间 */
.overview-kpi-card:nth-child(1) { animation-delay: 0s; }
.overview-kpi-card:nth-child(2) { animation-delay: 1s; }
.overview-kpi-card:nth-child(3) { animation-delay: 2s; }
.overview-kpi-card:nth-child(4) { animation-delay: 3s; }

/* 2. 悬浮时的特殊效果 */
.overview-kpi-card:hover {
  animation-play-state: paused;
  transform: translateY(-8px) scale(1.05) !important;
}

/* 3. 图标旋转效果 */
@keyframes icon-rotate-subtle {
  0%, 100% { transform: rotate(0deg); }
  25% { transform: rotate(2deg); }
  75% { transform: rotate(-2deg); }
}

.overview-kpi-card .w-12 {
  animation: icon-rotate-subtle 4s ease-in-out infinite;
}

/* 4. 减少动画偏好的用户 */
@media (prefers-reduced-motion: reduce) {
  .overview-kpi-card,
  .overview-kpi-card .w-12 {
    animation: none;
  }
}

/* 自定义滚动条样式 */
.overflow-y-auto::-webkit-scrollbar {
  width: 4px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: transparent;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 2px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>
