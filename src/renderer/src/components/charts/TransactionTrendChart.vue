<template>
  <div class="w-full h-full">
    <!-- 图表标题和控制器 -->
    <div class="flex items-center justify-between mb-4">
      <div>
        <h3 class="text-lg font-semibold">{{ title }}</h3>
        <p class="text-sm text-muted-foreground">{{ subtitle }}</p>
      </div>
      <div class="flex items-center space-x-2">
        <!-- 时间范围选择 -->
        <select
          v-model="selectedTimeRange"
          class="px-3 py-1.5 text-xs border rounded-md bg-background hover:bg-muted/50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20"
          @change="handleTimeRangeChange"
        >
          <option value="1h">1小时</option>
          <option value="6h">6小时</option>
          <option value="24h">24小时</option>
          <option value="7d">7天</option>
        </select>

        <!-- 图表类型切换 -->
        <select
          v-model="chartType"
          class="px-3 py-1.5 text-xs border rounded-md bg-background hover:bg-muted/50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20"
          @change="handleChartTypeChange"
        >
          <option value="line">折线图</option>
          <option value="area">面积图</option>
          <option value="bar">柱状图</option>
        </select>

        <!-- 刷新按钮 -->
        <Button variant="ghost" size="sm" :disabled="isLoading" @click="refreshData">
          <RefreshCw :class="['w-3 h-3', isLoading ? 'animate-spin' : '']" />
        </Button>
      </div>
    </div>

    <!-- 图表容器 -->
    <div
      ref="chartContainer"
      class="w-full chart-container bg-gradient-to-br from-slate-50/80 to-blue-50/80 dark:from-gray-900/80 dark:to-slate-800/80 rounded-xl border shadow-sm flex flex-col"
      :style="chartContainerStyle"
    >
      <!-- 加载状态 -->
      <div v-if="isLoading" class="flex items-center justify-center flex-1">
        <div class="flex flex-col items-center space-y-3">
          <RefreshCw class="w-8 h-8 animate-spin text-primary" />
          <p class="text-sm text-muted-foreground">正在加载交易数据...</p>
        </div>
      </div>
      <!-- ECharts图表 -->
      <div v-else class="flex-1 min-h-0 p-2 sm:p-4">
        <v-chart
          ref="echartsRef"
          class="w-full h-full"
          :option="chartOption"
          :autoresize="true"
          @click="handleChartClick"
        />
      </div>
    </div>

    <!-- 数据统计卡片 -->
    <div class="grid grid-cols-4 gap-3 mt-4">
      <div
        class="bg-gradient-to-r from-blue-500/10 to-blue-600/10 rounded-lg p-3 border border-blue-200/50"
      >
        <div class="flex items-center justify-between">
          <div>
            <p class="text-xs text-blue-600 font-medium">总交易量</p>
            <p class="text-lg font-bold text-blue-700">{{ formatNumber(totalTransactions) }}</p>
          </div>
          <div class="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
            <TrendingUp class="w-4 h-4 text-blue-600" />
          </div>
        </div>
      </div>

      <div
        class="bg-gradient-to-r from-green-500/10 to-green-600/10 rounded-lg p-3 border border-green-200/50"
      >
        <div class="flex items-center justify-between">
          <div>
            <p class="text-xs text-green-600 font-medium">成功率</p>
            <p class="text-lg font-bold text-green-700">{{ successRate }}%</p>
          </div>
          <div class="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
            <CheckCircle class="w-4 h-4 text-green-600" />
          </div>
        </div>
      </div>

      <div
        class="bg-gradient-to-r from-orange-500/10 to-orange-600/10 rounded-lg p-3 border border-orange-200/50"
      >
        <div class="flex items-center justify-between">
          <div>
            <p class="text-xs text-orange-600 font-medium">异常率</p>
            <p class="text-lg font-bold text-orange-700">{{ errorRate }}%</p>
          </div>
          <div class="w-8 h-8 bg-orange-500/20 rounded-full flex items-center justify-center">
            <AlertTriangle class="w-4 h-4 text-orange-600" />
          </div>
        </div>
      </div>

      <div
        class="bg-gradient-to-r from-purple-500/10 to-purple-600/10 rounded-lg p-3 border border-purple-200/50"
      >
        <div class="flex items-center justify-between">
          <div>
            <p class="text-xs text-purple-600 font-medium">平均金额</p>
            <p class="text-lg font-bold text-purple-700">{{ formatCurrency(averageAmount) }}</p>
          </div>
          <div class="w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center">
            <DollarSign class="w-4 h-4 text-purple-600" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { RefreshCw, TrendingUp, CheckCircle, AlertTriangle, DollarSign } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart, BarChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  DataZoomComponent,
  ToolboxComponent
} from 'echarts/components'
import VChart from 'vue-echarts'

// 注册ECharts组件
use([
  CanvasRenderer,
  LineChart,
  BarChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  DataZoomComponent,
  ToolboxComponent
])

/**
 * 组件属性定义
 */
interface Props {
  title?: string
  subtitle?: string
  chartHeight?: string
  autoRefresh?: boolean
  refreshInterval?: number
}

const props = withDefaults(defineProps<Props>(), {
  title: '交���趋势分析',
  subtitle: '实时交易数据监控',
  chartHeight: '400px',
  autoRefresh: true,
  refreshInterval: 30000 // 30秒
})

/**
 * 响应式数据
 */
const selectedTimeRange = ref('24h')
const chartType = ref('line')
const isLoading = ref(false)
const chartContainer = ref<HTMLElement | null>(null)
const echartsRef = ref<InstanceType<typeof VChart> | null>(null)

// 模拟数据
const totalTransactions = ref(12847)
const successRate = ref(98.5)
const errorRate = ref(1.5)
const averageAmount = ref(156780)

/**
 * 生成模拟时间数据
 */
const generateTimeData = () => {
  const now = new Date()
  const data = []
  const hours =
    selectedTimeRange.value === '1h'
      ? 1
      : selectedTimeRange.value === '6h'
        ? 6
        : selectedTimeRange.value === '24h'
          ? 24
          : 168 // 7天

  const interval =
    selectedTimeRange.value === '7d'
      ? 60 * 60 * 1000
      : (60 * 60 * 1000) / (hours === 1 ? 12 : hours === 6 ? 6 : 1)

  for (let i = hours * (selectedTimeRange.value === '7d' ? 24 : 1); i >= 0; i--) {
    const time = new Date(now.getTime() - i * interval)
    data.push(
      time.toLocaleTimeString('zh-CN', {
        hour: '2-digit',
        minute: '2-digit',
        ...(selectedTimeRange.value === '7d' && { month: '2-digit', day: '2-digit' })
      })
    )
  }
  return data
}

/**
 * 生成模拟交易数据
 */
const generateChartData = () => {
  const timeData = generateTimeData()
  const transactionData = []
  const successRateData = []
  const errorRateData = []

  for (let i = 0; i < timeData.length; i++) {
    // 交易量数据 - 模拟波动
    const baseTransaction = 1000 + Math.sin(i * 0.3) * 300
    const randomFactor = Math.random() * 400 - 200
    transactionData.push(Math.max(0, Math.round(baseTransaction + randomFactor)))

    // 成功率数据 - 保持在95-99%之间
    const baseSuccessRate = 97 + Math.sin(i * 0.2) * 2
    const successRandomFactor = Math.random() * 2 - 1
    successRateData.push(Math.min(99.9, Math.max(95, baseSuccessRate + successRandomFactor)))

    // 异常率数据 - 与成功率相关
    errorRateData.push(100 - successRateData[i])
  }

  return {
    timeData,
    transactionData,
    successRateData,
    errorRateData
  }
}

/**
 * ECharts配置选项
 */
const getResponsiveFontSize = (base: number) => {
  if (window.innerWidth <= 640) return base * 0.85
  if (window.innerWidth <= 1024) return base * 0.95
  return base
}

const chartOption = computed(() => {
  const { timeData, transactionData, successRateData, errorRateData } = generateChartData()
  const fontSize = getResponsiveFontSize(12)
  const legendFontSize = getResponsiveFontSize(12)
  const axisFontSize = getResponsiveFontSize(11)

  const baseOption = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#e5e7eb',
      borderWidth: 1,
      textStyle: {
        color: '#374151',
        fontSize: fontSize
      },
      formatter: (params: any) => {
        let result = `<div style="font-weight: 600; margin-bottom: 4px;">${params[0].axisValue}</div>`
        params.forEach((param: any) => {
          const value =
            param.seriesName === '交易量' ? `${param.value}笔` : `${param.value.toFixed(1)}%`
          result += `<div style="display: flex; align-items: center; margin: 2px 0;">
            <span style="display: inline-block; width: 8px; height: 8px; background: ${param.color}; border-radius: 50%; margin-right: 6px;"></span>
            <span style="flex: 1;">${param.seriesName}:</span>
            <span style="font-weight: 600; margin-left: 8px;">${value}</span>
          </div>`
        })
        return result
      }
    },
    legend: {
      data: ['交易量', '成功率', '异常率'],
      top: 10,
      textStyle: {
        color: '#6b7280',
        fontSize: legendFontSize
      },
      itemWidth: 12,
      itemHeight: 8
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '8%',
      top: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: timeData,
      axisLine: {
        lineStyle: {
          color: '#e5e7eb'
        }
      },
      axisLabel: {
        color: '#9ca3af',
        fontSize: axisFontSize,
        rotate: selectedTimeRange.value === '7d' ? 45 : 0
      },
      axisTick: {
        show: false
      }
    },
    yAxis: [
      {
        type: 'value',
        name: '交易量',
        position: 'left',
        axisLine: {
          show: false
        },
        axisTick: {
          show: false
        },
        axisLabel: {
          color: '#9ca3af',
          fontSize: axisFontSize,
          formatter: (value: number) =>
            value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value.toString()
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
        name: '百分比 (%)',
        position: 'right',
        min: 0,
        max: 100,
        axisLine: {
          show: false
        },
        axisTick: {
          show: false
        },
        axisLabel: {
          color: '#9ca3af',
          fontSize: axisFontSize,
          formatter: '{value}%'
        },
        splitLine: {
          show: false
        }
      }
    ]
  }

  // 根据图表类型添加系列数据
  if (chartType.value === 'line') {
    baseOption.series = [
      {
        name: '交易量',
        type: 'line',
        yAxisIndex: 0,
        data: transactionData,
        smooth: true,
        symbol: 'circle',
        symbolSize: 4,
        lineStyle: {
          width: 3,
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 1,
            y2: 0,
            colorStops: [
              { offset: 0, color: '#3b82f6' },
              { offset: 1, color: '#1d4ed8' }
            ]
          }
        },
        itemStyle: {
          color: '#3b82f6'
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(59, 130, 246, 0.3)' },
              { offset: 1, color: 'rgba(59, 130, 246, 0.05)' }
            ]
          }
        }
      },
      {
        name: '成功率',
        type: 'line',
        yAxisIndex: 1,
        data: successRateData,
        smooth: true,
        symbol: 'circle',
        symbolSize: 4,
        lineStyle: {
          width: 2,
          color: '#10b981'
        },
        itemStyle: {
          color: '#10b981'
        }
      },
      {
        name: '异常率',
        type: 'line',
        yAxisIndex: 1,
        data: errorRateData,
        smooth: true,
        symbol: 'circle',
        symbolSize: 4,
        lineStyle: {
          width: 2,
          color: '#f59e0b'
        },
        itemStyle: {
          color: '#f59e0b'
        }
      }
    ]
  } else if (chartType.value === 'area') {
    baseOption.series = [
      {
        name: '交易量',
        type: 'line',
        yAxisIndex: 0,
        data: transactionData,
        smooth: true,
        symbol: 'none',
        lineStyle: {
          width: 2,
          color: '#3b82f6'
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(59, 130, 246, 0.6)' },
              { offset: 1, color: 'rgba(59, 130, 246, 0.1)' }
            ]
          }
        }
      },
      {
        name: '成功率',
        type: 'line',
        yAxisIndex: 1,
        data: successRateData,
        smooth: true,
        symbol: 'none',
        lineStyle: {
          width: 2,
          color: '#10b981'
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(16, 185, 129, 0.4)' },
              { offset: 1, color: 'rgba(16, 185, 129, 0.05)' }
            ]
          }
        }
      }
    ]
  } else {
    baseOption.series = [
      {
        name: '交易量',
        type: 'bar',
        yAxisIndex: 0,
        data: transactionData,
        itemStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: '#3b82f6' },
              { offset: 1, color: '#1e40af' }
            ]
          },
          borderRadius: [2, 2, 0, 0]
        }
      }
    ]
  }

  return baseOption
})

/**
 * 工具函数
 */
const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toString()
}

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: 'CNY',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

/**
 * 事件处理函数
 */
const handleTimeRangeChange = () => {
  console.log('时间范围变更:', selectedTimeRange.value)
  refreshData()
}

const handleChartTypeChange = () => {
  console.log('图表类型变更:', chartType.value)
  // 图表会自动重新渲染
}

const handleChartClick = (params: any) => {
  console.log('图表点击事件:', params)
  // 可以在这里添加点击交互逻辑
}

const refreshData = async () => {
  isLoading.value = true
  console.log('刷新交易趋势数据...')

  // 模拟数据加载
  setTimeout(() => {
    // 更新模拟数据
    totalTransactions.value = Math.floor(Math.random() * 5000) + 10000
    successRate.value = Math.floor(Math.random() * 5) + 95
    errorRate.value = 100 - successRate.value
    averageAmount.value = Math.floor(Math.random() * 100000) + 100000

    isLoading.value = false
    console.log('交易趋势数据刷新完成')
  }, 1000)
}

/**
 * 自动刷新定时器
 */
let autoRefreshTimer: NodeJS.Timeout

/**
 * 监听图表类型变化，重新渲染图表
 */
watch(
  [chartType, selectedTimeRange],
  () => {
    if (echartsRef.value) {
      // 强制重新渲染图表
      echartsRef.value.resize()
    }
  },
  { deep: true }
)

/**
 * 生命周期钩子
 */
onMounted(() => {
  console.log('交易趋势图表组件已挂载')

  // 启动自动刷新
  if (props.autoRefresh) {
    autoRefreshTimer = setInterval(() => {
      if (!isLoading.value) {
        refreshData()
      }
    }, props.refreshInterval)
  }

  // 初始化数据
  refreshData()

  // 监听窗口大小变化
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  console.log('交易趋势图表组件已卸载')

  // 清理定时器
  if (autoRefreshTimer) {
    clearInterval(autoRefreshTimer)
  }

  // 移除事件监听
  window.removeEventListener('resize', handleResize)
})

/**
 * 处理窗口大小变���
 */
const handleResize = () => {
  if (echartsRef.value) {
    echartsRef.value.resize()
  }
}

// 响应式图表容器高度
import { onMounted, onUnmounted, ref, computed } from 'vue'

const chartContainerStyle = computed(() => {
  let baseHeight = 400
  if (window.innerWidth <= 640) {
    baseHeight = Math.min(window.innerHeight * 0.4, 260)
  } else if (window.innerWidth <= 1024) {
    baseHeight = Math.min(window.innerHeight * 0.5, 340)
  }
  return {
    height: baseHeight + 'px',
    maxHeight: '60vh',
    overflow: 'auto',
    minHeight: '180px'
  }
})
</script>

<style scoped>
/**
 * 交易趋势图表样式
 * 优化视觉效果和响应式布局
 */

/* 图表容器样式 */
.chart-container {
  width: 100%;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(10px);
  overflow: auto;
  max-height: 60vh;
  min-height: 180px;
}

.chart-container:hover {
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  transform: translateY(-1px);
}

.grid > div {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.grid > div:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
}

/* 选择��样式优化 */
select {
  transition: all 0.2s ease;
}

select:hover {
  border-color: #3b82f6;
}

select:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* 响应式布局增强 */
@media (max-width: 1024px) {
  .chart-container,
  .bg-gradient-to-br {
    min-height: 220px;
    max-height: 50vh;
  }
}

@media (max-width: 640px) {
  .chart-container,
  .bg-gradient-to-br {
    min-height: 160px;
    max-height: 40vh;
  }
}

/* ECharts容器优化 */
.echarts {
  width: 100% !important;
  height: 100% !important;
}

/* 加载动画 */
@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

/* 渐变背景优化 */
.bg-gradient-to-br {
  background-attachment: fixed;
}

/* 深色模式适配 */
@media (prefers-color-scheme: dark) {
  .chart-container {
    border-color: rgba(55, 65, 81, 0.3);
  }

  select {
    background-color: rgba(17, 24, 39, 0.8);
    border-color: rgba(55, 65, 81, 0.5);
    color: #f9fafb;
  }

  select:hover {
    border-color: #60a5fa;
  }
}
</style>
