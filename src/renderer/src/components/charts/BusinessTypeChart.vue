<template>
  <div class="w-full h-full">
    <!-- 图表标题和控制器 -->
    <div class="flex items-center justify-between mb-4">
      <div>
        <h3 class="text-lg font-semibold">{{ title }}</h3>
        <p class="text-sm text-muted-foreground">{{ subtitle }}</p>
      </div>
      <div class="flex items-center space-x-2">
        <!-- 业务类型切换 -->
        <select
          v-model="selectedBusinessType"
          class="px-3 py-1.5 text-xs border rounded-md bg-background hover:bg-muted/50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20"
          @change="handleBusinessTypeChange"
        >
          <option value="all">全部业务</option>
          <option value="atm">ATM业务</option>
          <option value="fx">外汇业务</option>
        </select>

        <!-- 显示模式切换 -->
        <select
          v-model="displayMode"
          class="px-3 py-1.5 text-xs border rounded-md bg-background hover:bg-muted/50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20"
          @change="handleDisplayModeChange"
        >
          <option value="overview">总览模式</option>
          <option value="detailed">详细分析</option>
          <option value="comparison">对比分析</option>
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
          <p class="text-sm text-muted-foreground">正在加载业务数据...</p>
        </div>
      </div>

      <!-- 总览模式 -->
      <div v-else-if="displayMode === 'overview'" class="h-full flex">
        <!-- 左侧主图表 - 调整尺寸 -->
        <div class="flex-1 p-4 max-h-117">
          <div class="h-full bg-white rounded-lg border p-2">
            <v-chart
              ref="mainChartRef"
              class="w-full h-full"
              :option="mainChartOption"
              :autoresize="true"
              @click="handleChartClick"
            />
          </div>
        </div>
        <!-- 右侧统计面板 - 调整宽度 -->
        <div class="w-72 p-4 border-l bg-muted/20">
          <div class="space-y-3 h-full overflow-y-auto">
            <h4 class="font-semibold text-sm mb-3">业务类型统计</h4>
            
            <!-- ATM业务统计 -->
            <div class="bg-background rounded-lg p-4 border">
              <div class="flex items-center justify-between mb-3">
                <div class="flex items-center space-x-2">
                  <div class="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span class="font-medium text-sm">ATM业务</span>
                </div>
                <span class="text-xs text-muted-foreground">{{ atmData.percentage }}%</span>
              </div>
              <div class="space-y-2">
                <div class="flex justify-between text-xs">
                  <span>交易笔数</span>
                  <span class="font-medium">{{ formatNumber(atmData.count) }}</span>
                </div>
                <div class="flex justify-between text-xs">
                  <span>总金额</span>
                  <span class="font-medium">{{ formatCurrency(atmData.amount) }}</span>
                </div>
                <div class="flex justify-between text-xs">
                  <span>平均金额</span>
                  <span class="font-medium">{{ formatCurrency(atmData.avgAmount) }}</span>
                </div>
              </div>
            </div>

            <!-- FX外汇业务统计 -->
            <div class="bg-background rounded-lg p-4 border">
              <div class="flex items-center justify-between mb-3">
                <div class="flex items-center space-x-2">
                  <div class="w-3 h-3 rounded-full bg-green-500"></div>
                  <span class="font-medium text-sm">外汇业务</span>
                </div>
                <span class="text-xs text-muted-foreground">{{ fxData.percentage }}%</span>
              </div>
              <div class="space-y-2">
                <div class="flex justify-between text-xs">
                  <span>交易笔数</span>
                  <span class="font-medium">{{ formatNumber(fxData.count) }}</span>
                </div>
                <div class="flex justify-between text-xs">
                  <span>总金额</span>
                  <span class="font-medium">{{ formatCurrency(fxData.amount) }}</span>
                </div>
                <div class="flex justify-between text-xs">
                  <span>热门货币</span>
                  <span class="font-medium">{{ fxData.topCurrency }}</span>
                </div>
              </div>
            </div>

            <!-- 趋势指标 -->
            <div class="bg-background rounded-lg p-4 border">
              <h5 class="font-medium text-sm mb-3">趋势分析</h5>
              <div class="space-y-2">
                <div class="flex items-center justify-between">
                  <span class="text-xs">ATM增长率</span>
                  <div class="flex items-center space-x-1">
                    <TrendingUp v-if="atmData.trend > 0" class="w-3 h-3 text-green-500" />
                    <TrendingDown v-else class="w-3 h-3 text-red-500" />
                    <span class="text-xs font-medium">{{ Math.abs(atmData.trend) }}%</span>
                  </div>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-xs">FX增长率</span>
                  <div class="flex items-center space-x-1">
                    <TrendingUp v-if="fxData.trend > 0" class="w-3 h-3 text-green-500" />
                    <TrendingDown v-else class="w-3 h-3 text-red-500" />
                    <span class="text-xs font-medium">{{ Math.abs(fxData.trend) }}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 详细分析模式 -->
      <div v-else-if="displayMode === 'detailed'" class="h-full p-4">
        <div class="grid grid-cols-2 gap-4 max-h-96">
          <!-- ATM业务详细分析 -->
          <div class="bg-background rounded-lg p-4 border h-80">
            <h4 class="font-semibold text-sm mb-3 flex items-center">
              <CreditCard class="w-4 h-4 mr-2 text-blue-500" />
              ATM业务分析
            </h4>
            <div class="h-56">
              <v-chart
                ref="atmDetailChartRef"
                class="w-full h-full"
                :option="atmDetailChartOption"
                :autoresize="true"
              />
            </div>
            <!-- ATM业务数据摘要 -->
            <div class="mt-2 text-xs text-gray-600">
              <div class="flex justify-between">
                <span>男性用户:</span>
                <span>{{ formatNumber(atmData.genderDistribution?.male || 0) }}</span>
              </div>
              <div class="flex justify-between">
                <span>女性用户:</span>
                <span>{{ formatNumber(atmData.genderDistribution?.female || 0) }}</span>
              </div>
            </div>
          </div>

          <!-- FX外汇业务详细分析 -->
          <div class="bg-background rounded-lg p-4 border h-80">
            <h4 class="font-semibold text-sm mb-3 flex items-center">
              <DollarSign class="w-4 h-4 mr-2 text-green-500" />
              外汇业务分析
            </h4>
            <div class="h-56">
              <v-chart
                ref="fxDetailChartRef"
                class="w-full h-full"
                :option="fxDetailChartOption"
                :autoresize="true"
              />
            </div>
            <!-- FX业务数据摘要 -->
            <div class="mt-2 text-xs text-gray-600">
              <div class="flex justify-between">
                <span>热门货币:</span>
                <span>{{ fxData.topCurrency }}</span>
              </div>
              <div class="flex justify-between">
                <span>主要目的:</span>
                <span>旅游投资</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 详细数据表格 -->
        <div class="mt-4 bg-gray-50 rounded-lg p-4">
          <h5 class="font-medium text-sm mb-3">详细数据对比</h5>
          <div class="grid grid-cols-4 gap-4 text-xs">
            <div class="text-center">
              <div class="font-medium text-blue-600">ATM交易量</div>
              <div class="text-lg font-bold">{{ formatNumber(atmData.count) }}</div>
            </div>
            <div class="text-center">
              <div class="font-medium text-green-600">FX交易量</div>
              <div class="text-lg font-bold">{{ formatNumber(fxData.count) }}</div>
            </div>
            <div class="text-center">
              <div class="font-medium text-blue-600">ATM平均金额</div>
              <div class="text-lg font-bold">{{ formatCurrency(atmData.avgAmount) }}</div>
            </div>
            <div class="text-center">
              <div class="font-medium text-green-600">FX平均金额</div>
              <div class="text-lg font-bold">{{ formatCurrency(fxData.avgAmount) }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 对比分析模式 -->
      <div v-else class="h-full p-4 flex flex-col">
        <!-- 对比分析标题 -->
        <div class="mb-4">
          <h4 class="font-semibold text-sm text-gray-700">业务类型对比分析</h4>
          <p class="text-xs text-gray-500">ATM与外汇业务关键指标对比</p>
        </div>

        <!-- 图表容器 - 限制高度 -->
        <div class="flex-1 max-h-80">
          <v-chart
            ref="comparisonChartRef"
            class="w-full h-full"
            :option="comparisonChartOption"
            :autoresize="true"
            @click="handleChartClick"
          />
        </div>

        <!-- 对比数据表格 -->
        <div class="mt-4 bg-gray-50 rounded-lg p-4">
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <h5 class="font-medium text-sm text-blue-600">ATM业务</h5>
              <div class="space-y-1 text-xs">
                <div class="flex justify-between">
                  <span>交易笔数:</span>
                  <span class="font-medium">{{ formatNumber(atmData.count) }}</span>
                </div>
                <div class="flex justify-between">
                  <span>总金额:</span>
                  <span class="font-medium">{{ formatCurrency(atmData.amount) }}</span>
                </div>
                <div class="flex justify-between">
                  <span>平均金额:</span>
                  <span class="font-medium">{{ formatCurrency(atmData.avgAmount) }}</span>
                </div>
                <div class="flex justify-between">
                  <span>增长率:</span>
                  <span class="font-medium" :class="atmData.trend > 0 ? 'text-green-600' : 'text-red-600'">
                    {{ atmData.trend > 0 ? '+' : '' }}{{ atmData.trend }}%
                  </span>
                </div>
              </div>
            </div>

            <div class="space-y-2">
              <h5 class="font-medium text-sm text-green-600">外汇业务</h5>
              <div class="space-y-1 text-xs">
                <div class="flex justify-between">
                  <span>交易笔数:</span>
                  <span class="font-medium">{{ formatNumber(fxData.count) }}</span>
                </div>
                <div class="flex justify-between">
                  <span>总金额:</span>
                  <span class="font-medium">{{ formatCurrency(fxData.amount) }}</span>
                </div>
                <div class="flex justify-between">
                  <span>平均金额:</span>
                  <span class="font-medium">{{ formatCurrency(fxData.avgAmount) }}</span>
                </div>
                <div class="flex justify-between">
                  <span>增长率:</span>
                  <span class="font-medium" :class="fxData.trend > 0 ? 'text-green-600' : 'text-red-600'">
                    {{ fxData.trend > 0 ? '+' : '' }}{{ fxData.trend }}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 数据统计卡片 - 紧凑布局 -->
    <div class="grid grid-cols-4 gap-2 mt-3">
      <div class="bg-gradient-to-r from-blue-500/10 to-blue-600/10 rounded-lg p-2 border border-blue-200/50">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-xs text-blue-600 font-medium">总业务量</p>
            <p class="text-sm font-bold text-blue-700">{{ formatNumber(totalBusinessCount) }}</p>
          </div>
          <div class="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center">
            <Target class="w-3 h-3 text-blue-600" />
          </div>
        </div>
      </div>

      <div class="bg-gradient-to-r from-green-500/10 to-green-600/10 rounded-lg p-2 border border-green-200/50">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-xs text-green-600 font-medium">ATM占比</p>
            <p class="text-sm font-bold text-green-700">{{ atmData.percentage }}%</p>
          </div>
          <div class="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center">
            <CreditCard class="w-3 h-3 text-green-600" />
          </div>
        </div>
      </div>

      <div class="bg-gradient-to-r from-orange-500/10 to-orange-600/10 rounded-lg p-2 border border-orange-200/50">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-xs text-orange-600 font-medium">FX占比</p>
            <p class="text-sm font-bold text-orange-700">{{ fxData.percentage }}%</p>
          </div>
          <div class="w-6 h-6 bg-orange-500/20 rounded-full flex items-center justify-center">
            <DollarSign class="w-3 h-3 text-orange-600" />
          </div>
        </div>
      </div>

      <div class="bg-gradient-to-r from-purple-500/10 to-purple-600/10 rounded-lg p-2 border border-purple-200/50">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-xs text-purple-600 font-medium">活跃省份</p>
            <p class="text-sm font-bold text-purple-700">{{ activeProvinces }}</p>
          </div>
          <div class="w-6 h-6 bg-purple-500/20 rounded-full flex items-center justify-center">
            <MapPin class="w-3 h-3 text-purple-600" />
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
  Target,
  CreditCard,
  DollarSign,
  MapPin
} from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { PieChart, BarChart, LineChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent
} from 'echarts/components'
import VChart from 'vue-echarts'

// 注册ECharts组件
use([
  CanvasRenderer,
  PieChart,
  BarChart,
  LineChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent
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
  title: '业务类型分布统计',
  subtitle: 'ATM与外汇业务数据分析',
  chartHeight: '400px',
  autoRefresh: true,
  refreshInterval: 30000
})

/**
 * 响应式数据
 */
const selectedBusinessType = ref<'all' | 'atm' | 'fx'>('all')
const displayMode = ref<'overview' | 'detailed' | 'comparison'>('overview')
const isLoading = ref(false)
const chartContainer = ref<HTMLElement | null>(null)
const mainChartRef = ref<InstanceType<typeof VChart> | null>(null)
const atmDetailChartRef = ref<InstanceType<typeof VChart> | null>(null)
const fxDetailChartRef = ref<InstanceType<typeof VChart> | null>(null)
const comparisonChartRef = ref<InstanceType<typeof VChart> | null>(null)

// 业务数据接口
interface BusinessData {
  count: number
  amount: number
  percentage: number
  avgAmount: number
  trend: number
  topCurrency?: string
  genderDistribution?: { male: number; female: number }
  ageDistribution?: { [key: string]: number }
  purposeDistribution?: { [key: string]: number }
}

// ATM业务数据
const atmData = ref<BusinessData>({
  count: 15420,
  amount: 234500000,
  percentage: 68.5,
  avgAmount: 15200,
  trend: 5.2,
  genderDistribution: { male: 8500, female: 6920 }
})

// FX外汇业务数据
const fxData = ref<BusinessData>({
  count: 7080,
  amount: 156800000,
  percentage: 31.5,
  avgAmount: 22150,
  trend: 8.7,
  topCurrency: 'USD',
  ageDistribution: { '18-30': 2124, '31-45': 3186, '46-60': 1416, '60+': 354 },
  purposeDistribution: { '旅游': 2832, '投资': 2124, '留学': 1416, '其他': 708 }
})

/**
 * 计算属性
 */
const chartContainerStyle = computed(() => ({
  height: props.chartHeight
}))

const totalBusinessCount = computed(() => {
  return atmData.value.count + fxData.value.count
})

const activeProvinces = computed(() => {
  // 模拟活跃省份数量
  return 28
})

/**
 * 主图表配置 - 业务类型分布饼图
 */
const mainChartOption = computed(() => {
  const data = [
    {
      name: 'ATM业务',
      value: atmData.value.count,
      itemStyle: {
        color: {
          type: 'linear',
          x: 0, y: 0, x2: 1, y2: 1,
          colorStops: [
            { offset: 0, color: '#3b82f6' },
            { offset: 1, color: '#1d4ed8' }
          ]
        }
      }
    },
    {
      name: '外汇业务',
      value: fxData.value.count,
      itemStyle: {
        color: {
          type: 'linear',
          x: 0, y: 0, x2: 1, y2: 1,
          colorStops: [
            { offset: 0, color: '#10b981' },
            { offset: 1, color: '#059669' }
          ]
        }
      }
    }
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
        fontSize: 12
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
      orient: 'vertical',
      left: '5%',
      top: 'center',
      textStyle: {
        color: '#6b7280',
        fontSize: 11
      },
      itemWidth: 10,
      itemHeight: 6
    },
    series: [
      {
        name: '业务类型分布',
        type: 'pie',
        radius: ['35%', '65%'],
        center: ['60%', '50%'],
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
        data: data
      }
    ]
  }
})

/**
 * ATM详细分析图表配置
 */
const atmDetailChartOption = computed(() => {
  const genderData = atmData.value.genderDistribution
  if (!genderData) return {}

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
        name: 'ATM性别分布',
        type: 'pie',
        radius: ['30%', '60%'],
        center: ['50%', '45%'],
        data: [
          {
            name: '男性',
            value: genderData.male,
            itemStyle: { color: '#3b82f6' }
          },
          {
            name: '女性',
            value: genderData.female,
            itemStyle: { color: '#ec4899' }
          }
        ],
        itemStyle: {
          borderRadius: 4,
          borderColor: '#fff',
          borderWidth: 1
        }
      }
    ]
  }
})

/**
 * FX详细分析图表配置
 */
const fxDetailChartOption = computed(() => {
  const ageData = fxData.value.ageDistribution
  if (!ageData) return {}

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
      bottom: '15%',
      top: '10%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: Object.keys(ageData),
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
        data: Object.values(ageData),
        itemStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: '#10b981' },
              { offset: 1, color: '#059669' }
            ]
          },
          borderRadius: [4, 4, 0, 0]
        },
        barWidth: '60%'
      }
    ]
  }
})

/**
 * 对比分析图表配置
 */
const comparisonChartOption = computed(() => {
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
          atmData.value.count / 1000,
          atmData.value.amount / 10000000,
          atmData.value.avgAmount / 1000,
          atmData.value.trend
        ],
        itemStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: '#3b82f6' },
              { offset: 1, color: '#1d4ed8' }
            ]
          },
          borderRadius: [4, 4, 0, 0]
        },
        barWidth: '30%'
      },
      {
        name: '外汇业务',
        type: 'bar',
        yAxisIndex: 0,
        data: [
          fxData.value.count / 1000,
          fxData.value.amount / 10000000,
          fxData.value.avgAmount / 1000,
          fxData.value.trend
        ],
        itemStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: '#10b981' },
              { offset: 1, color: '#059669' }
            ]
          },
          borderRadius: [4, 4, 0, 0]
        },
        barWidth: '30%'
      }
    ]
  }
})

/**
 * 工具函数
 */
const formatNumber = (value: number) => {
  return value.toLocaleString()
}

const formatCurrency = (value: number) => {
  return `¥${(value / 10000).toFixed(1)}万`
}

/**
 * 事件处理函数
 */
const handleBusinessTypeChange = () => {
  console.log('业务类型切换为:', selectedBusinessType.value)
  refreshData()
}

const handleDisplayModeChange = () => {
  console.log('显示模式切换为:', displayMode.value)
}

const handleChartClick = (params: any) => {
  console.log('图表点击事件:', params)
  if (params.componentType === 'series') {
    console.log('点击业务类型:', params.name)
  }
}

const refreshData = async () => {
  if (isLoading.value) return

  isLoading.value = true
  console.log('正在刷新业务类型数据...')

  try {
    // 从后端获取数据
    const backendData = await fetchBusinessDataFromBackend()
    if (backendData) {
      atmData.value = backendData.atm
      fxData.value = backendData.fx
    }
    console.log('业务类型数据刷新完成')
  } catch (error) {
    console.error('数据刷新失败:', error)
    // 失败时使用模拟数据
    generateMockBusinessData()
  } finally {
    isLoading.value = false
  }
}

/**
 * 从后端获取业务数据
 */
const fetchBusinessDataFromBackend = async () => {
  try {
    console.log('正在从后端获取业务类型数据...')

    // 调用主进程的 fetchData 方法获取后端数据
    const backendData = await window.electron.ipcRenderer.invoke('fetchData')
    console.log('后端返回的业务数据:', backendData)

    if (backendData && backendData.data && Array.isArray(backendData.data)) {
      const atmTransactions = backendData.data.filter((item: any) =>
        item.business_type === 'ATM' || item.type === 'ATM'
      )
      const fxTransactions = backendData.data.filter((item: any) =>
        item.business_type === 'FX' || item.type === 'FX'
      )

      // 处理ATM数据
      const atmCount = atmTransactions.length
      const atmAmount = atmTransactions.reduce((sum: number, item: any) =>
        sum + (item.amount || 0), 0
      )
      const atmMaleCount = atmTransactions.filter((item: any) =>
        item.gender === 'M' || item.gender === '男'
      ).length
      const atmFemaleCount = atmCount - atmMaleCount

      // 处理FX数据
      const fxCount = fxTransactions.length
      const fxAmount = fxTransactions.reduce((sum: number, item: any) =>
        sum + (item.amount || 0), 0
      )

      // 统计货币类型
      const currencyCount: { [key: string]: number } = {}
      fxTransactions.forEach((item: any) => {
        const currency = item.currency_type || item.currency || 'USD'
        currencyCount[currency] = (currencyCount[currency] || 0) + 1
      })
      const topCurrency = Object.keys(currencyCount).reduce((a, b) =>
        currencyCount[a] > currencyCount[b] ? a : b, 'USD'
      )

      // 统计年龄分布
      const ageDistribution: { [key: string]: number } = {
        '18-30': 0, '31-45': 0, '46-60': 0, '60+': 0
      }
      fxTransactions.forEach((item: any) => {
        const age = item.age || 30
        if (age <= 30) ageDistribution['18-30']++
        else if (age <= 45) ageDistribution['31-45']++
        else if (age <= 60) ageDistribution['46-60']++
        else ageDistribution['60+']++
      })

      const totalCount = atmCount + fxCount

      return {
        atm: {
          count: atmCount,
          amount: atmAmount,
          percentage: totalCount > 0 ? Number(((atmCount / totalCount) * 100).toFixed(1)) : 0,
          avgAmount: atmCount > 0 ? Math.floor(atmAmount / atmCount) : 0,
          trend: Math.random() * 10 - 5, // 模拟趋势
          genderDistribution: { male: atmMaleCount, female: atmFemaleCount }
        },
        fx: {
          count: fxCount,
          amount: fxAmount,
          percentage: totalCount > 0 ? Number(((fxCount / totalCount) * 100).toFixed(1)) : 0,
          avgAmount: fxCount > 0 ? Math.floor(fxAmount / fxCount) : 0,
          trend: Math.random() * 10 - 5, // 模拟趋势
          topCurrency,
          ageDistribution
        }
      }
    }
  } catch (error) {
    console.warn('获取后端业务数据失败，使用模拟数据:', error)
  }

  return null
}

/**
 * 生成模拟业务数据
 */
const generateMockBusinessData = () => {
  // 使用当前的模拟数据，可以在这里添加更多随机化逻辑
  console.log('使用模拟业务数据')
}

/**
 * 生命周期钩子
 */
onMounted(() => {
  console.log('业务类型分布图表组件已挂载')
  console.log('当前业务类型:', selectedBusinessType.value)
  console.log('当前显示模式:', displayMode.value)

  // 初始化数据
  refreshData()

  // 设置自动刷新
  if (props.autoRefresh && props.refreshInterval > 0) {
    const interval = setInterval(() => {
      refreshData()
    }, props.refreshInterval)

    // 组件卸载时清理定时器
    onUnmounted(() => {
      clearInterval(interval)
    })
  }
})

onUnmounted(() => {
  console.log('🔄 业务类型分布图表组件开始卸载...')

  // 重置状态
  isLoading.value = false
  selectedBusinessType.value = 'all'
  displayMode.value = 'overview'

  console.log('✅ 业务类型分布图表组件卸载完成')
})

/**
 * 监听器
 */
watch(selectedBusinessType, (newType) => {
  console.log('业务类型变更:', newType)
  // 可以根据业务类型过滤数据
})

watch(displayMode, (newMode) => {
  console.log('显示模式变更:', newMode)
  // 可以根据显示模式调整图表配置
})
</script>

<style scoped>
.chart-container {
  transition: all 0.3s ease;
}

.chart-container:hover {
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
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

/* 图表容器动画 */
.v-chart {
  transition: opacity 0.3s ease;
}

/* 统计卡片悬停效果 */
.bg-gradient-to-r:hover {
  transform: translateY(-2px);
  transition: transform 0.2s ease;
}

/* 业务类型标签样式 */
.business-type-label {
  position: relative;
  overflow: hidden;
}

.business-type-label::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s;
}

.business-type-label:hover::before {
  left: 100%;
}
</style>
