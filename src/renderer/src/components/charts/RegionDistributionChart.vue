<template>
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
          @change="handleDisplayModeChange"
        >
          <option value="chart">图表模式</option>
          <option value="mixed">混合模式</option>
          <option value="grid">网格模式</option>
        </select>

        <!-- 数据类型切换 -->
        <select
          v-model="dataType"
          class="px-3 py-1.5 text-xs border rounded-md bg-background hover:bg-muted/50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20"
          @change="handleDataTypeChange"
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
              class="flex items-center justify-between p-3 rounded-lg bg-background hover:bg-muted/50 transition-colors cursor-pointer group"
              @click="highlightRegion(region.name)"
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
            class="bg-background rounded-lg p-4 border hover:shadow-lg transition-all duration-300 cursor-pointer group hover:scale-105"
            @click="highlightRegion(region.name)"
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
  VisualMapComponent,
  GeoComponent
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

// 注册简化的地图数据（专注于图表展示）
const setupChartComponents = () => {
  console.log('地域分布图表组件初始化完成')
}

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
  chartHeight: '400px',
  autoRefresh: true,
  refreshInterval: 30000
})

/**
 * 响应式数据
 */
const displayMode = ref<'chart' | 'mixed' | 'grid'>('mixed')
const dataType = ref<'transaction' | 'amount' | 'risk'>('transaction')
const isLoading = ref(false)
const chartContainer = ref<HTMLElement | null>(null)
const pieChartRef = ref<InstanceType<typeof VChart> | null>(null)
const barChartRef = ref<InstanceType<typeof VChart> | null>(null)

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
    console.log('正在从后端获取地域分布数据...')

    // 调用主进程的 fetchData 方法获取后端数据
    const backendData = await window.electron.ipcRenderer.invoke('fetchData')
    console.log('后端返回的数据:', backendData)

    if (backendData && backendData.data && Array.isArray(backendData.data)) {
      const data: RegionData[] = []
      let totalValue = 0

      // 处理后端数据
      backendData.data.forEach((item: any) => {
        const value = dataType.value === 'transaction'
          ? item.transaction_count || 0
          : dataType.value === 'amount'
          ? item.total_amount || 0
          : item.risk_score || 0

        totalValue += value

        data.push({
          name: item.province || item.region || '未知',
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
    }
  } catch (error) {
    console.warn('获取后端数据失败，使用模拟数据:', error)
  }

  // 备用方案：生成模拟数据
  return generateMockRegionData()
}

// 模拟省份数据（备用方案）
const generateMockRegionData = (): RegionData[] => {
  const provinces = [
    '北京', '上海', '广东', '江苏', '浙江', '山东', '河南', '四川',
    '湖北', '湖南', '河北', '福建', '安徽', '陕西', '辽宁', '重庆',
    '江西', '云南', '广西', '山西', '吉林', '贵州', '新疆', '甘肃',
    '内蒙古', '黑龙江', '天津', '海南', '宁夏', '青海', '西藏'
  ]

  const data: RegionData[] = []
  let totalValue = 0

  // 生成基础数据
  provinces.forEach((province, index) => {
    const baseValue = dataType.value === 'transaction'
      ? Math.floor(Math.random() * 5000) + 500
      : dataType.value === 'amount'
      ? Math.floor(Math.random() * 50000000) + 5000000
      : Math.floor(Math.random() * 100) + 10

    // 一线城市数据更高
    const multiplier = ['北京', '上海', '广东', '江苏', '浙江'].includes(province)
      ? 1.5 + Math.random() * 0.5
      : 1

    const value = Math.floor(baseValue * multiplier)
    totalValue += value

    data.push({
      name: province,
      value,
      percentage: 0, // 稍后计算
      trend: Math.random() > 0.6 ? 'up' : Math.random() > 0.3 ? 'down' : 'neutral',
      riskLevel: Math.random() > 0.7 ? 'high' : Math.random() > 0.4 ? 'medium' : 'low'
    })
  })

  // 计算百分比
  data.forEach(item => {
    item.percentage = Number(((item.value / totalValue) * 100).toFixed(1))
  })

  return data.sort((a, b) => b.value - a.value)
}

const regionData = ref<RegionData[]>([])

/**
 * 计算属性
 */
const chartContainerStyle = computed(() => ({
  height: props.chartHeight
}))

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
  const max = Math.max(...regionData.value.map(item => item.value))
  const ratio = value / max

  if (ratio > 0.8) return '#ef4444'      // 红色 - 最高
  if (ratio > 0.6) return '#f97316'      // 橙色 - 高
  if (ratio > 0.4) return '#eab308'      // 黄色 - 中等
  if (ratio > 0.2) return '#22c55e'      // 绿色 - 较低
  return '#6b7280'                       // 灰色 - 最低
}

/**
 * 现代化饼图配置选项（替代地图）
 */
const pieChartOption = computed(() => {
  const topRegions = sortedRegionData.value.slice(0, 10) // 显示前10个省份

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
          <div style="font-weight: 600; margin-bottom: 4px;">${params.name}</div>
          <div>${getDataTypeLabel()}: ${formatValue(params.value)}</div>
          <div>占比: ${params.percent}%</div>
        `
      }
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      top: 'center',
      textStyle: {
        color: '#6b7280',
        fontSize: 11
      },
      itemWidth: 12,
      itemHeight: 8
    },
    series: [
      {
        name: getDataTypeLabel(),
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['65%', '50%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 8,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 16,
            fontWeight: 'bold',
            color: '#374151'
          },
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        },
        labelLine: {
          show: false
        },
        data: topRegions.map((item, index) => ({
          value: item.value,
          name: item.name,
          itemStyle: {
            color: getRegionColor(item.value)
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
      bottom: '15%',
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
        data: topRegions.map((item, index) => ({
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
const handleDisplayModeChange = () => {
  console.log('显示模式切换为:', displayMode.value)
}

const handleDataTypeChange = () => {
  console.log('数据类型切换为:', dataType.value)
  refreshData()
}

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
    // 失败时使用模拟数据
    regionData.value = generateMockRegionData()
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
  console.log('点击柱状图:', params.name)
  handleMapClick(params)
}

const highlightRegion = (regionName: string) => {
  console.log('高亮省份:', regionName)
  // 可以在地图上高亮显示选中的省份
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
