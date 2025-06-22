<template>
  <!-- 地域分布统计 -->
  <div class="w-full h-full">
    <!-- 图表标题和控制器 -->
    <div class="flex items-center justify-between mb-4">
      <div>
        <h3 class="text-lg font-semibold">{{ title }}</h3>
        <p class="text-sm text-muted-foreground">{{ subtitle }}</p>
      </div>
      <div class="flex items-center space-x-2">
        <!-- 显示模式切换 -->
        <select
          v-model="displayMode"
          class="px-3 py-1.5 text-xs border rounded-md bg-background hover:bg-muted/50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          <option value="chart">图表模式</option>
          <option value="mixed">混合模式</option>
          <option value="grid">网格模式</option>
        </select>

        <!-- 数据类型切换 -->
        <select
          v-model="dataType"
          class="px-3 py-1.5 text-xs border rounded-md bg-background hover:bg-muted/50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          <option value="transaction">交易数量</option>
          <option value="amount">交易金额</option>
          <option value="risk">风险等级</option>
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
      class="w-full chart-container bg-gradient-to-br from-slate-50/80 to-blue-50/80 dark:from-gray-900/80 dark:to-slate-800/80 rounded-xl border shadow-sm"
      :style="chartContainerStyle"
    >
      <!-- 加载状态 -->
      <div v-if="isLoading" class="flex items-center justify-center h-full">
        <div class="flex flex-col items-center space-y-3">
          <RefreshCw class="w-8 h-8 animate-spin text-primary" />
          <p class="text-sm text-muted-foreground">正在加载地域数据...</p>
        </div>
      </div>

      <!-- 混合模式布局 -->
      <div v-else-if="displayMode === 'mixed'" class="h-full flex">
        <!-- 左侧饼图 -->
        <div class="flex-1 p-4">
          <v-chart
            ref="pieChartRef"
            class="w-full h-full"
            :option="pieChartOption"
            :autoresize="true"
            @click="handleChartClick"
          />
        </div>
        <!-- 右侧统计 -->
        <div class="w-80 p-4 border-l bg-muted/20">
          <div class="space-y-3 h-full overflow-y-auto">
            <h4 class="font-semibold text-sm mb-3">省份排行榜</h4>
            <div
              v-for="(region, index) in sortedRegionData"
              :key="region.name"
              class="flex items-center justify-between p-3 rounded-lg bg-background hover:bg-muted/50 transition-colors group"
            >
              <div class="flex items-center space-x-3">
                <div
                  class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
                  :style="{ backgroundColor: getRegionColor(region.value) }"
                >
                  {{ index + 1 }}
                </div>
                <div>
                  <div class="font-medium text-sm">{{ region.name }}</div>
                  <div class="text-xs text-muted-foreground">
                    {{ getDataTypeLabel() }}: {{ formatValue(region.value) }}
                  </div>
                </div>
              </div>
              <div class="flex items-center space-x-2">
                <div class="text-right">
                  <div class="text-sm font-semibold">{{ region.percentage }}%</div>
                  <div class="text-xs text-muted-foreground">占比</div>
                </div>
                <TrendingUp
                  v-if="region.trend === 'up'"
                  class="w-4 h-4 text-green-500 group-hover:scale-110 transition-transform"
                />
                <TrendingDown
                  v-else-if="region.trend === 'down'"
                  class="w-4 h-4 text-red-500 group-hover:scale-110 transition-transform"
                />
                <Minus
                  v-else
                  class="w-4 h-4 text-gray-500 group-hover:scale-110 transition-transform"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 网格模式 -->
      <div v-else-if="displayMode === 'grid'" class="h-full p-4 overflow-y-auto">
        <div class="grid grid-cols-4 gap-4">
          <div
            v-for="(region, index) in sortedRegionData"
            :key="region.name"
            class="bg-background rounded-lg p-4 border hover:shadow-lg transition-all duration-300 group hover:scale-105"
          >
            <div class="flex items-center justify-between mb-3">
              <div
                class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white"
                :style="{ backgroundColor: getRegionColor(region.value) }"
              >
                {{ index + 1 }}
              </div>
              <TrendingUp
                v-if="region.trend === 'up'"
                class="w-4 h-4 text-green-500 group-hover:scale-110 transition-transform"
              />
              <TrendingDown
                v-else-if="region.trend === 'down'"
                class="w-4 h-4 text-red-500 group-hover:scale-110 transition-transform"
              />
              <Minus
                v-else
                class="w-4 h-4 text-gray-500 group-hover:scale-110 transition-transform"
              />
            </div>
            <div class="text-center">
              <h3 class="font-semibold text-lg mb-1">{{ region.name }}</h3>
              <p class="text-2xl font-bold text-primary mb-1">{{ formatValue(region.value) }}</p>
              <p class="text-sm text-muted-foreground">占比 {{ region.percentage }}%</p>
            </div>
            <div class="mt-3">
              <div class="w-full bg-muted rounded-full h-2">
                <div
                  class="h-2 rounded-full transition-all duration-500"
                  :style="{
                    width: `${region.percentage}%`,
                    backgroundColor: getRegionColor(region.value)
                  }"
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 纯图表模式 -->
      <div v-else class="h-full p-4">
        <v-chart
          ref="barChartRef"
          class="w-full h-full"
          :option="barChartOption"
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
            <p class="text-xs text-blue-600 font-medium">总{{ getDataTypeLabel() }}</p>
            <p class="text-lg font-bold text-blue-700">{{ formatValue(totalValue) }}</p>
          </div>
          <div class="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
            <MapPin class="w-4 h-4 text-blue-600" />
          </div>
        </div>
      </div>

      <div
        class="bg-gradient-to-r from-green-500/10 to-green-600/10 rounded-lg p-3 border border-green-200/50"
      >
        <div class="flex items-center justify-between">
          <div>
            <p class="text-xs text-green-600 font-medium">活跃省份</p>
            <p class="text-lg font-bold text-green-700">{{ activeProvinces }}</p>
          </div>
          <div class="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
            <Activity class="w-4 h-4 text-green-600" />
          </div>
        </div>
      </div>

      <div
        class="bg-gradient-to-r from-orange-500/10 to-orange-600/10 rounded-lg p-3 border border-orange-200/50"
      >
        <div class="flex items-center justify-between">
          <div>
            <p class="text-xs text-orange-600 font-medium">最高省份</p>
            <p class="text-lg font-bold text-orange-700">{{ topProvince.name }}</p>
          </div>
          <div class="w-8 h-8 bg-orange-500/20 rounded-full flex items-center justify-center">
            <Crown class="w-4 h-4 text-orange-600" />
          </div>
        </div>
      </div>

      <div
        class="bg-gradient-to-r from-purple-500/10 to-purple-600/10 rounded-lg p-3 border border-purple-200/50"
      >
        <div class="flex items-center justify-between">
          <div>
            <p class="text-xs text-purple-600 font-medium">平均值</p>
            <p class="text-lg font-bold text-purple-700">{{ formatValue(averageValue) }}</p>
          </div>
          <div class="w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center">
            <BarChart3 class="w-4 h-4 text-purple-600" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import {
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Minus,
  MapPin,
  Activity,
  Crown,
  BarChart3
} from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { PieChart, BarChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  VisualMapComponent
} from 'echarts/components'
import VChart from 'vue-echarts'

// 注册ECharts组件
use([
  CanvasRenderer,
  PieChart,
  BarChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  VisualMapComponent
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
  title: '地域分布统计',
  subtitle: '各省份交易数据分析',
  chartHeight: '25rem',
  autoRefresh: true,
  refreshInterval: 30000
})

/**
 * 响应式数据
 */
const displayMode = ref<'chart' | 'mixed' | 'grid'>('mixed')    // 这个是不是可以写再index.ts上 待确定
const dataType = ref<'transaction' | 'amount' | 'risk'>('transaction')
const isLoading = ref(false)
const chartContainer = ref<HTMLElement | null>(null)
const pieChartRef = ref<InstanceType<typeof VChart> | null>(null)
const barChartRef = ref<InstanceType<typeof VChart> | null>(null)
const highlightedRegion = ref<string | null>(null)

// 地域数据接口
interface RegionData {
  name: string
  value: number
  percentage: number
  trend: 'up' | 'down' | 'neutral'
  riskLevel?: 'low' | 'medium' | 'high'
}

// 从后端获取省份数据
const fetchRegionDataFromBackend = async (): Promise<RegionData[]> => {
  try {
    console.log('正在从后端获取地域分布数据...', { dataType: dataType.value })
    // 使用新的IPC方法获取地域分布数据
    const response = await (window.api as any).fetchRegionData({ dataType: dataType.value })
    console.log('后端返回的数据:', response)

    if (response.success && response.data && Array.isArray(response.data)) {
      const data: RegionData[] = []
      let totalValue = 0

      // 处理后端数据
      response.data.forEach((item: any) => {
        const value = dataType.value === 'transaction'
          ? item.transcationTimes
          : dataType.value === 'amount'
          ? item.sumAmount || 0
          : item.risk_score || 0

        totalValue += value

        data.push({
          name: item.province || '未知',
          value,
          percentage: 0, // 稍后计算
          trend: item.trend || (Math.random() > 0.6 ? 'up' : Math.random() > 0.3 ? 'down' : 'neutral'),
          riskLevel: item.risk_level || (Math.random() > 0.7 ? 'high' : Math.random() > 0.4 ? 'medium' : 'low')
        })
      })

      // 计算百分比
      data.forEach(item => {
        item.percentage = totalValue > 0 ? Number(((item.value / totalValue) * 100).toFixed(1)) : 0
      })

      console.log('处理后的地域数据:', data)
      return data.sort((a, b) => b.value - a.value)
    } else {
      console.warn('后端返回数据格式不正确:', response)
      return []
    }
  } catch (error) {
    console.error('获取后端数据失败:', error)
    return []
  }
}



const regionData = ref<RegionData[]>([])

/**
 * 计算属性
 */
const chartContainerStyle = computed(() => {
  console.log('🔍 chartContainerStyle 计算:', {
    'props.chartHeight': props.chartHeight,
    'typeof': typeof props.chartHeight
  })

  return {
    height: props.chartHeight
  }
})

const sortedRegionData = computed(() => {
  return [...regionData.value].sort((a, b) => b.value - a.value)
})

const totalValue = computed(() => {
  return regionData.value.reduce((sum, item) => sum + item.value, 0)
})

const activeProvinces = computed(() => {
  return regionData.value.filter(item => item.value > 0).length
})

const topProvince = computed(() => {
  return sortedRegionData.value[0] || { name: '暂无数据', value: 0 }
})

const averageValue = computed(() => {
  return Math.floor(totalValue.value / regionData.value.length)
})

/**
 * 工具函数
 */
const getDataTypeLabel = () => {
  const labels = {
    transaction: '交易数量',
    amount: '交易金额',
    risk: '风险指数'
  }
  return labels[dataType.value]
}

const formatValue = (value: number) => {
  if (dataType.value === 'amount') {
    return `¥${(value / 10000).toFixed(1)}万`
  } else if (dataType.value === 'transaction') {
    return `${value.toLocaleString()}笔`
  } else {
    return `${value}分`
  }
}

const getRegionColor = (value: number) => {
  // 按排名分配颜色
  const sortedValues = [...regionData.value].sort((a, b) => b.value - a.value)   // 排序
  const rank = sortedValues.findIndex(item => item.value === value) + 1      // 计算排名
  const totalCount = regionData.value.length   // 计算省份数总数
  const percentile = rank / totalCount   // 计算占的百分比

  // 详细调试信息
  console.log(`Value: ${value}, Rank: ${rank}, Total: ${totalCount}, Percentile: ${percentile.toFixed(3)}`)

  let color = '#6b7280' // 默认灰色
  if (percentile <= 0.1) {
    color = '#ef4444'  // 红色 - 前10%
  } else if (percentile <= 0.2) {
    color = '#f97316'  // 橙色 - 前20%
  } else if (percentile <= 0.4) {
    color = '#eab308'  // 黄色 - 前40%
    console.log(`  -> 黄色 (前40%)`)
  } else if (percentile <= 0.7) {
    color = '#22c55e'  // 绿色 - 前70%
  }
  return color
}

/**
 * 现代化饼图配置 - 增强交互性
 */
const pieChartOption = computed(() => {
  const topRegions = sortedRegionData.value.slice(0, 8) // 减少到8个，避免过于拥挤
  // 定义一个漂亮的颜色数组
  const pieColors = [
    '#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de', 
    '#3ba272', '#fc8452', '#9a60b4', '#ea7ccc', '#ff9f7f',
    '#87ceeb', '#32cd32', '#ffa500', '#ff69b4', '#20b2aa'
  ]

  return {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#e5e7eb',
      borderWidth: 1,
      textStyle: {
        color: '#374151',
        fontSize: 13
      },
      formatter: (params: any) => {
        const regionInfo = regionData.value.find(item => item.name === params.name)
        const rank = sortedRegionData.value.findIndex(item => item.name === params.name) + 1
        return `
          <div style="font-weight: 600; margin-bottom: 6px; font-size: 14px;">${params.name}</div>
          <div style="margin-bottom: 3px;">${getDataTypeLabel()}: <strong>${formatValue(params.value)}</strong></div>
          <div style="margin-bottom: 3px;">占比: <strong>${params.percent}%</strong></div>
          <div style="margin-bottom: 3px;">排名: <strong>第${rank}名</strong></div>
          <div style="color: #6b7280; font-size: 11px;">趋势: ${regionInfo?.trend === 'up' ? '📈 上升' : regionInfo?.trend === 'down' ? '📉 下降' : '➡️ 平稳'}</div>
        `
      }
    },
    legend: {
      orient: 'vertical',
      left: '5%',
      top: 'center',
      textStyle: {
        color: '#374151',
        fontSize: 12
      },
      itemWidth: 14,
      itemHeight: 10,
      itemGap: 8,
      formatter: (name: string) => {
        const region = regionData.value.find(item => item.name === name)
        return `${name} (占全中国比：${region?.percentage}%)`
      }
    },
    series: [
      {
        name: getDataTypeLabel(),
        type: 'pie',
        radius: ['45%', '75%'],
        center: ['65%', '50%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 6,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: true,
          position: 'outside',
          fontSize: 11,
          color: '#374151',
          formatter: (params: any) => {
            return `${params.name}\n${params.percent}%`
          }
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 14,
            fontWeight: 'bold',
            color: '#1f2937'
          },
          itemStyle: {
            shadowBlur: 15,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.3)',
            scale: true,
            scaleSize: 5
          }
        },
        labelLine: {
          show: true,
          length: 15,
          length2: 10,
          lineStyle: {
            color: '#9ca3af',
            width: 1
          }
        },
        data: topRegions.map((item, index) => ({
          value: item.value,
          name: item.name,
          itemStyle: {
            color: pieColors[index % pieColors.length],
            opacity: highlightedRegion.value && highlightedRegion.value !== item.name ? 0.3 : 1
          },
          emphasis: {
            itemStyle: {
              color: getRegionColor(item.value),
              opacity: 1
            }
          }
        }))
      }
    ]
  }
})

/**
 * 柱状图配置选项
 */
const barChartOption = computed(() => {
  const topRegions = sortedRegionData.value.slice(0, 15) // 显示前15个省份

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
      },
      formatter: (params: any) => {
        const data = params[0]
        const regionInfo = regionData.value.find(item => item.name === data.name)
        return `
          <div style="font-weight: 600; margin-bottom: 4px;">${data.name}</div>
          <div>${getDataTypeLabel()}: ${formatValue(data.value)}</div>
          <div>占比: ${regionInfo?.percentage}%</div>
          <div>排名: 第${sortedRegionData.value.findIndex(item => item.name === data.name) + 1}名</div>
        `
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '2%',
      top: '10%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: topRegions.map(item => item.name),
      axisLine: {
        lineStyle: {
          color: '#e5e7eb'
        }
      },
      axisLabel: {
        color: '#9ca3af',
        fontSize: 11,
        rotate: 45
      },
      axisTick: {
        show: false
      }
    },
    yAxis: {
      type: 'value',
      name: getDataTypeLabel(),
      nameTextStyle: {
        color: '#6b7280',
        fontSize: 12
      },
      axisLine: {
        show: false
      },
      axisTick: {
        show: false
      },
      axisLabel: {
        color: '#9ca3af',
        fontSize: 11,
        formatter: (value: number) => {
          if (dataType.value === 'amount') {
            return `${(value / 10000).toFixed(0)}万`
          } else if (dataType.value === 'transaction') {
            return value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value.toString()
          } else {
            return value.toString()
          }
        }
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
        name: getDataTypeLabel(),
        type: 'bar',
        data: topRegions.map((item) => ({
          value: item.value,
          itemStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: getRegionColor(item.value) },
                { offset: 1, color: getRegionColor(item.value) + '80' }
              ]
            },
            borderRadius: [4, 4, 0, 0]
          },
          emphasis: {
            itemStyle: {
              color: {
                type: 'linear',
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [
                  { offset: 0, color: '#3b82f6' },
                  { offset: 1, color: '#3b82f680' }
                ]
              }
            }
          }
        })),
        barWidth: '60%',
        label: {
          show: true,
          position: 'top',
          color: '#6b7280',
          fontSize: 10,
          formatter: (params: any) => {
            return formatValue(params.value)
          }
        }
      }
    ]
  }
})

/**
 * 事件处理函数
 */
const refreshData = async () => {
  if (isLoading.value) return

  isLoading.value = true
  console.log('正在刷新地域分布数据...')

  try {
    // 从后端获取数据
    regionData.value = await fetchRegionDataFromBackend()
    console.log('地域分布数据刷新完成')
  } catch (error) {
    console.error('数据刷新失败:', error)
    // 失败时设置为空数组
    regionData.value = []
  } finally {
    isLoading.value = false
  }
}

const handleMapClick = (params: any) => {
  if (params.componentType === 'series') {
    console.log('点击省份:', params.name)
    const regionInfo = regionData.value.find(item => item.name === params.name)
    if (regionInfo) {
      console.log('省份详情:', regionInfo)
      // 这里可以添加省份详情弹窗或跳转逻辑
    }
  }
}

const handleChartClick = (params: any) => {
  console.log('点击图表:', params.name)
  toggleHighlight(params.name)
  handleMapClick(params)
}

// 高亮切换函数
const toggleHighlight = (regionName: string) => {
  if (highlightedRegion.value === regionName) {
    highlightedRegion.value = null
  } else {
    highlightedRegion.value = regionName
  }
}

/**
 * 生命周期钩子
 */
let refreshInterval: NodeJS.Timeout | null = null

onMounted(async () => {
  console.log('地域分布图表组件已挂载')

  // 初始化数据
  await refreshData()

  // 设置自动刷新
  if (props.autoRefresh && props.refreshInterval > 0) {
    refreshInterval = setInterval(() => {
      refreshData()
    }, props.refreshInterval)
  }
})

onUnmounted(() => {
  console.log('地域分布图表组件开始卸载...')

  // 清理定时器
  if (refreshInterval) {
    clearInterval(refreshInterval)
    refreshInterval = null
  }

  console.log('地域分布图表组件卸载完成')
})

// 监听数据类型变化
watch(dataType, () => {
  refreshData()
})
</script>

<style scoped>
.chart-container {
  transition: all 0.3s ease;
}

.chart-container:hover {
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

/* 自定义滚动条 */
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
